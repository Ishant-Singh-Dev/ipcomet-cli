#!/usr/bin/env node
// ipcomet: your public IP address, and IP lookups, from the command line.
// Talks to the free API documented at https://ipcomet.com/developers. No dependencies.
"use strict";

const VERSION = require("../package.json").version;
const BASE = process.env.IPCOMET_URL || "https://ipcomet.com";
const TIMEOUT_MS = 10000;

const HELP = `ipcomet ${VERSION}: your public IP address from the command line

Usage
  ipcomet                 print your public IP address
  ipcomet <ip|domain>     look up an IP address or domain
  ipcomet --json          your IP, location and network as JSON
  ipcomet <ip> --json     the raw JSON lookup result

Options
  -j, --json      print the raw JSON reply
  -h, --help      show this help
  -v, --version   show the version

Uses the free API at https://ipcomet.com/developers (no key, no sign-up).`;

async function get(path) {
  let res;
  try {
    res = await fetch(BASE + path, {
      headers: { "user-agent": `ipcomet-cli/${VERSION} (+https://github.com/Ishant-Singh-Dev/ipcomet-cli)` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const reason = err && err.name === "TimeoutError" ? `no reply within ${TIMEOUT_MS / 1000}s` : (err && err.cause && err.cause.code) || err.message;
    throw new Error(`could not reach ${BASE} (${reason})`);
  }
  const text = await res.text();
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = JSON.parse(text);
      if (body && body.error) message = body.error;
    } catch {}
    throw new Error(message);
  }
  return text;
}

function pretty(info) {
  const place = [info.city, info.region, info.country].filter(Boolean).join(", ");
  const rows = [
    ["IP", info.ip + (info.version ? `  (IPv${info.version})` : "")],
    ["Resolved from", info.resolvedFrom],
    ["Hostname", info.hostname],
    ["Location", place],
    ["Postal code", info.postal],
    ["Coordinates", info.latitude != null && info.longitude != null ? `${info.latitude}, ${info.longitude}` : undefined],
    ["Time zone", info.timezone],
    ["Network", [info.asn ? `AS${info.asn}` : "", info.org].filter(Boolean).join(" ")],
    ["ISP", info.isp && info.isp !== info.org ? info.isp : undefined],
  ].filter(([, value]) => value);
  const width = Math.max(...rows.map(([label]) => label.length));
  return rows.map(([label, value]) => `${label.padEnd(width)}  ${value}`).join("\n");
}

async function main(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith("-")));
  const args = argv.filter((a) => !a.startsWith("-"));
  const known = new Set(["-j", "--json", "-h", "--help", "-v", "--version"]);
  const unknown = [...flags].find((f) => !known.has(f));

  if (flags.has("-h") || flags.has("--help")) return console.log(HELP);
  if (flags.has("-v") || flags.has("--version")) return console.log(VERSION);
  if (unknown) throw new Error(`unknown option ${unknown}\n\n${HELP}`);
  if (args.length > 1) throw new Error("give one IP address or domain at a time");

  const json = flags.has("-j") || flags.has("--json");
  const [query] = args;

  if (!query && !json) return console.log((await get("/api/ip")).trim());

  const text = await get(query ? `/api/lookup?q=${encodeURIComponent(query)}` : "/api/me");
  if (json) return console.log(text.trim());
  console.log(pretty(JSON.parse(text)));
}

main(process.argv.slice(2)).catch((err) => {
  console.error(`ipcomet: ${err.message}`);
  process.exitCode = 1;
});
