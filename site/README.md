# Spur Protocol site

The public website for this repo — static HTML/CSS/JS, no framework, no
backend. Everything in the "Explore the protocol" section is generated
directly from `schemas/` and `examples/` at build time, not hand-copied, so
it can't silently drift from what the protocol actually says.

## Build the data

Run this before serving or deploying — and again any time a schema changes:

```sh
node build-data.mjs
```

Writes `public/data/objects.json` (gitignored — always regenerated, never
hand-edited).

## Run it locally

```sh
node build-data.mjs
node serve.mjs
```

Serves `public/` at `http://127.0.0.1:4500` (override with `PORT=`).
`serve.mjs` is a zero-dependency static file server for local preview only.

## Deploy

`public/` is plain static files — production doesn't need a Node process at
all. Build the data, then serve `public/` directly from Nginx (matching the
atomic-release pattern already used for `spurstore.com` on the same host:
timestamped release directory, `current` symlink, no PM2 needed since
there's nothing to keep alive).
