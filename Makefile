include .env

SHELL := /usr/bin/env bash
BIN := ./node_modules/.bin
OS := $(shell uname)

RELEASE_NAME=rpcli
CONTRACT_DIR=./src/lib/contracts

build: deps
	bun build src/index.ts --compile --minify --sourcemap --outfile dist/$(RELEASE_NAME)

.PHONY: dev
dev: deps
	bun run dev

.PHONY: dev
dev/api: deps
	bun run dev/api

.PHONY: dev
dev/manager: deps
	bun run dev/manager

.PHONY: run
run/manager: deps
	bun run src/index.ts run manager

.PHONY: test
test: deps clean/testdb 
	bun --env-file=./test/.env test

.PHONY: test/watch
test/watch: deps 
	bun --env-file=./test/.env test --watch

.PHONY: check
check: deps
	bun run lint

.PHONY: drizzle/generate
drizzle/generate: deps
	bunx drizzle-kit generate

.PHONY: drizzle/migrate
drizzle/migrate: deps
	bunx drizzle-kit migrate && bun run scripts/generate-migration.ts

.PHONY: drizzle/studio
drizzle/studio: deps
	bunx drizzle-kit studio

.PHONY: format
format: deps
	bun run format

dist/$(RELEASE_NAME)-linux-x64:
	bun build --target=bun-linux-x64 --compile --minify --sourcemap src/index.ts --outfile dist/$(RELEASE_NAME)-linux-x64

dist/$(RELEASE_NAME)-linux-arm64:
	bun build --target=bun-linux-arm64 --compile --minify --sourcemap src/index.ts --outfile dist/$(RELEASE_NAME)-linux-arm64

dist/$(RELEASE_NAME)-windows-x64:
	bun build --target=bun-windows-x64 --compile --minify --sourcemap src/index.ts --outfile dist/$(RELEASE_NAME)-windows-x64

dist/$(RELEASE_NAME)-windows-arm64:
	# TODO: Figure out why this isn't working
	# bun build --target=bun-windows-arm64 --compile --minify --sourcemap src/index.ts --outfile dist/$(RELEASE_NAME)-windows-arm64

dist/$(RELEASE_NAME)-darwin-x64:
	bun build --target=bun-darwin-x64 --compile --minify --sourcemap src/index.ts --outfile dist/$(RELEASE_NAME)-darwin-x64

dist/$(RELEASE_NAME)-darwin-arm64:
	bun build --target=bun-darwin-arm64 --compile --minify --sourcemap src/index.ts --outfile dist/$(RELEASE_NAME)-darwin-arm64

dist/$(RELEASE_NAME)-linux-x64-musl:
	bun build --target=bun-linux-x64-musl --compile --minify --sourcemap src/index.ts --outfile dist/$(RELEASE_NAME)-linux-x64-musl

dist/$(RELEASE_NAME)-linux-arm64-musl:
	bun build --target=bun-linux-arm64-musl --compile --minify --sourcemap src/index.ts --outfile dist/$(RELEASE_NAME)-linux-arm64-musl

release: clean/node_modules deps dist/$(RELEASE_NAME)-linux-x64 dist/$(RELEASE_NAME)-linux-arm64 dist/$(RELEASE_NAME)-windows-x64 dist/$(RELEASE_NAME)-windows-arm64 dist/$(RELEASE_NAME)-darwin-x64 dist/$(RELEASE_NAME)-darwin-arm64 dist/$(RELEASE_NAME)-linux-x64-musl dist/$(RELEASE_NAME)-linux-arm64-musl
	@echo
	@echo Created release in the ./dist directory.
	ls -lhd dist/*

.PHONY: deps
deps: node_modules codegen

node_modules:
	bun install --frozen-lockfile

$(CONTRACT_DIR)/system.ts:
	bunx @wharfkit/cli generate -u $(ANTELOPE_NODEOS_API) -f $(CONTRACT_DIR)/system.ts $(ANTELOPE_SYSTEM_CONTRACT)

$(CONTRACT_DIR)/token.ts:
	bunx @wharfkit/cli generate -u $(ANTELOPE_NODEOS_API) -f $(CONTRACT_DIR)/token.ts $(ANTELOPE_TOKEN_CONTRACT)

$(CONTRACT_DIR)/noop.ts:
	bunx @wharfkit/cli generate -u $(ANTELOPE_NODEOS_API) -f $(CONTRACT_DIR)/noop.ts $(ANTELOPE_NOOP_CONTRACT)

codegen: $(CONTRACT_DIR)/system.ts $(CONTRACT_DIR)/token.ts $(CONTRACT_DIR)/noop.ts

.PHONY: clean
clean: clean/dist clean/codegen

.PHONY: clean/dist
clean/dist:
	rm -rf dist

.PHONY: clean/node_modules
clean/node_modules:
	rm -rf node_modules

.PHONY: clean/codegen
clean/codegen:
	rm -f $(CONTRACT_DIR)/*.ts

.PHONY: clean/testdb
clean/testdb:
	rm src/lib/testing.sqlite