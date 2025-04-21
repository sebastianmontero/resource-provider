include .env

SHELL := /usr/bin/env bash
BIN := ./node_modules/.bin
OS := $(shell uname)

build: node_modules codegen
	bun run build

.PHONY: dev
dev: node_modules
	bun run dev --host 

.PHONY: check
check: node_modules
	bun run check

.PHONY: format
format: node_modules
	bun run format

node_modules:
	bun install

codegen:
# 	bunx @wharfkit/cli generate --url $(NODEOS_API) --file ./src/contracts/system.ts eosio
