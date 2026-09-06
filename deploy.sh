#!/bin/sh
# Deploy vidrift.in to Cloudflare Pages.
#
# index.html is the only source file. The SPA has two extra routes, and a
# `_redirects` rewrite to /index.html does NOT work here — Pages normalises
# that target and answers 308 → /, which drops the deep link. So the routes
# are published as real assets instead, generated fresh on every deploy so
# they can never drift from index.html. They are gitignored for that reason.
set -e
cd "$(dirname "$0")"
for route in docs player; do
  mkdir -p "$route"
  cp index.html "$route/index.html"
done
wrangler pages deploy . --project-name vidrift-site --branch "${1:-main}" --commit-dirty=true
