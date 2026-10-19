// Calls the live ipcomet.com API through the CLI. Needs a network connection.
"use strict";

const { test } = require("node:test");
const assert = require("node:assert");
const { execFile } = require("node:child_process");
const path = require("node:path");

const CLI = path.join(__dirname, "..", "bin", "ipcomet.js");

function run(...args) {
  return new Promise((resolve) => {
    execFile(process.execPath, [CLI, ...args], { timeout: 20000 }, (err, stdout, stderr) => {
      resolve({ code: err ? err.code : 0, stdout, stderr });
    });
  });
}

const isIp = (s) => /^\d{1,3}(\.\d{1,3}){3}$/.test(s) || (s.includes(":") && /^[0-9a-f:]+$/i.test(s));

test("prints your public IP and nothing else", async () => {
  const { code, stdout } = await run();
  assert.strictEqual(code, 0);
  assert.ok(isIp(stdout.trim()), `not an IP: ${stdout}`);
});

test("--json describes your own connection", async () => {
  const { code, stdout } = await run("--json");
  assert.strictEqual(code, 0);
  const me = JSON.parse(stdout);
  assert.ok(isIp(me.ip));
});

test("looks up another IP", async () => {
  const { code, stdout } = await run("8.8.8.8");
  assert.strictEqual(code, 0);
  assert.match(stdout, /8\.8\.8\.8/);
  assert.match(stdout, /AS15169/);
});

test("--json lookup returns the raw reply", async () => {
  const { code, stdout } = await run("8.8.8.8", "--json");
  assert.strictEqual(code, 0);
  const info = JSON.parse(stdout);
  assert.strictEqual(info.ip, "8.8.8.8");
  assert.strictEqual(info.asn, 15169);
});

test("bad input exits non-zero with the API's message", async () => {
  const { code, stderr } = await run("not-an-ip!!");
  assert.notStrictEqual(code, 0);
  assert.match(stderr, /^ipcomet: /);
});
