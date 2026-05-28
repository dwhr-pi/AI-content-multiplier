#!/usr/bin/env bash
set -euo pipefail

pnpm ai-content list
pnpm ai-content multiply examples/input/sample-source.md
