/**
 * Tests for the ANTHROPIC_BASE_URL override (fork addition): the native
 * Anthropic provider can be routed through an Anthropic-compatible proxy
 * such as CLIProxyAPI while keeping pi-ai's catalog limits and thinking.
 * No network.
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { builtinProviders } from "@earendil-works/pi-ai/providers/all";
import { anthropicBaseUrl, withBaseUrl } from "../src/agent/models.ts";

const anthropic = () => {
	const provider = builtinProviders().find((p) => p.id === "anthropic");
	assert.ok(provider, "pi-ai ships an anthropic provider");
	return provider;
};

describe("anthropicBaseUrl", () => {
	it("is undefined when unset, blank or not http(s)", () => {
		assert.equal(anthropicBaseUrl({}), undefined);
		assert.equal(anthropicBaseUrl({ ANTHROPIC_BASE_URL: "  " }), undefined);
		assert.equal(anthropicBaseUrl({ ANTHROPIC_BASE_URL: "ftp://host" }), undefined);
	});
	it("normalizes a proxy URL", () => {
		assert.equal(anthropicBaseUrl({ ANTHROPIC_BASE_URL: "http://127.0.0.1:8317/" }), "http://127.0.0.1:8317");
	});
});

describe("withBaseUrl", () => {
	it("returns the provider unchanged without a URL", () => {
		const provider = anthropic();
		assert.equal(withBaseUrl(provider, undefined), provider);
	});
	it("moves every model to the proxy and keeps the catalog", () => {
		const provider = anthropic();
		const routed = withBaseUrl(provider, "http://127.0.0.1:8317");
		const before = provider.getModels();
		const after = routed.getModels();
		assert.equal(routed.baseUrl, "http://127.0.0.1:8317");
		assert.equal(after.length, before.length);
		assert.ok(after.length > 0);
		assert.ok(after.every((model) => model.baseUrl === "http://127.0.0.1:8317"));
		const strip = (models: typeof before) => models.map(({ baseUrl: _baseUrl, ...rest }) => rest);
		assert.deepEqual(strip(after), strip(before));
		for (const model of routed.getAllModels?.() ?? []) assert.equal(model.baseUrl, "http://127.0.0.1:8317");
		// The original catalog is not mutated.
		assert.ok(before.every((m) => m.baseUrl === "https://api.anthropic.com"));
	});
});
