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

The URL is read once at startup, so restart the app after changing it. Unset, blank or non-http(s) values keep `https://api.anthropic.com`.

## Notes

- Model IDs must exist on the proxy. Check with `GET <proxy>/v1/models`.
- The cost meter still shows Anthropic API list prices. With a subscription behind the proxy, read it as an estimate, not a bill.
- Code: `anthropicBaseUrl()` and `withBaseUrl()` in [`src/agent/models.ts`](../src/agent/models.ts); tests in [`tests/anthropic-base-url.test.ts`](../tests/anthropic-base-url.test.ts).
