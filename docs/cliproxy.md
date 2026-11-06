# Claude through CLIProxyAPI (fork addition)

This fork can route the built-in **Anthropic** provider through an Anthropic-compatible proxy such as [CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI). Every Claude model in the catalog keeps its real context window, output limit, thinking levels and prompt caching. The custom OpenAI-compatible endpoint would instead fall back to 8192 context and 4096 output, because CLIProxy's `/v1/models` reports no limits.

## Setup

1. Set `ANTHROPIC_BASE_URL` to the proxy root, without `/v1`. The Anthropic SDK appends `/v1/messages` itself. Put it in `.env.local` at the repo root (git-ignored) or in the environment that starts the app:

   ```
   ANTHROPIC_BASE_URL=http://127.0.0.1:8317
   ```

2. Start the app (`npm run dev`, then open http://localhost:3000).
3. In **Settings → Providers**, save one of CLIProxy's `api-keys` (from its `config.yaml`) as the **Anthropic** key. LearnHarness sends it as `x-api-key`, which CLIProxy accepts. If `ANTHROPIC_AUTH_TOKEN` is set in the environment, pi-ai sends that as a Bearer token instead, which CLIProxy also accepts.
4. Pick Anthropic models for the Strong, Cheap and Vision slots.

In the desktop app, which has no `.env.local`, put both values in `auth.json` in the app data folder (`%APPDATA%\LearnHarness\auth.json` on Windows). The server copies every entry into its environment at boot:

```json
{
	"ANTHROPIC_API_KEY": "<a CLIProxy api-key>",
	"ANTHROPIC_BASE_URL": "http://127.0.0.1:8317"
}
```

The URL is re-checked on every model lookup. Unset, blank or non-http(s) values keep `https://api.anthropic.com`.

## Windows desktop build

```
npm ci
npx next build
node scripts/smoke-provider-runtime.mjs
node scripts/build-server.mjs
node scripts/smoke-server.mjs --electron
npx electron-builder --win --x64 --publish never
```

Run `dist\LearnHarness-<version>-x64-setup.exe` to install over the upstream app; user data stays. Unset `ELECTRON_RUN_AS_NODE` first if your shell sets it. The update feed points at this fork, so upstream releases never replace the install.

## Notes

- Model IDs must exist on the proxy. Check with `GET <proxy>/v1/models`.
- The cost meter still shows Anthropic API list prices. With a subscription behind the proxy, read it as an estimate, not a bill.
- Code: `anthropicBaseUrl()` and `withBaseUrl()` in [`src/agent/models.ts`](../src/agent/models.ts); tests in [`tests/anthropic-base-url.test.ts`](../tests/anthropic-base-url.test.ts).
