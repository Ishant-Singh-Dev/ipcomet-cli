# ipcomet

**What is my IP?** One command in your terminal prints your public IP address. Give it an IP or a domain and it looks that up too.

```console
$ npx ipcomet
203.0.113.7

$ npx ipcomet 8.8.8.8
IP             8.8.8.8  (IPv4)
Hostname       dns.google
Location       Mountain View, California, United States
Coordinates    37.38605, -122.08385
Time zone      America/Los_Angeles
Network        AS15169 Google LLC
```

It's a single Node.js file with no dependencies. It calls the free [ipcomet.com IP API](https://ipcomet.com/developers), which needs no key and no sign-up.

## Install

Run it once without installing:

```sh
npx ipcomet
```

Or install it globally:

```sh
npm install -g ipcomet
```

Needs Node.js 18 or later (for the built-in `fetch`).

## Usage

| Command | What it prints |
| --- | --- |
| `ipcomet` | Your public IP address, on one line |
| `ipcomet <ip-or-domain>` | Location, time zone and network for that IP or domain |
| `ipcomet --json` | Your own IP, location, network and connection details as JSON |
| `ipcomet <ip-or-domain> --json` | The raw JSON lookup result |
| `ipcomet --help` | Help |
| `ipcomet --version` | The version |

If a lookup fails, the command prints `ipcomet: <reason>` to stderr and exits with status 1, so it is safe to use in scripts:

```sh
MYIP=$(ipcomet) || exit 1
ipcomet --json | jq -r .country
```

Lookups (`ipcomet <ip>`) are limited to 60 a minute per calling IP address. Plain `ipcomet` has no fixed limit, but cache the answer rather than asking on every request. The [API documentation](https://ipcomet.com/developers) has the full details.

## No CLI? Use curl

The same API works straight from curl:

```sh
curl https://ipcomet.com/api/ip
curl https://ipcomet.com/api/me
curl "https://ipcomet.com/api/lookup?q=8.8.8.8"
```

DNS, WHOIS, reputation and port-check endpoints are also documented at [ipcomet.com/developers](https://ipcomet.com/developers). To check your IP in a browser, go to [ipcomet.com](https://ipcomet.com).

## Privacy

There is no key and no account, and the CLI sends nothing beyond the request itself. ipcomet's own code does not store the addresses it sees. See the [privacy page](https://ipcomet.com/privacy).

## Development

```sh
node bin/ipcomet.js          # run from a checkout
npm test                     # tests call the live API, so they need a network
```

Set `IPCOMET_URL` to point the CLI at another server.

## License

[MIT](LICENSE) © Ishant Singh
