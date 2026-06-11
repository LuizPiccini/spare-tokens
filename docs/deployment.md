# Deployment

Spare Tokens is deployed as a Cloudflare Pages Direct Upload project.

Target domain:

```text
spare-tokens.piccini.app
```

## Local Deploy

Create the Pages project once:

```bash
npm run pages:create
```

Deploy:

```bash
npm run deploy
```

The deploy script builds the CLI, validates all task packets, generates `public/index.html`, then uploads `public/` to Cloudflare Pages.

## GitHub Actions Deploy

The workflow `.github/workflows/deploy-pages.yml` uses Wrangler Direct Upload and is manual-only by default. Run it from GitHub Actions after adding these repository secrets:

```text
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_API_TOKEN
```

The token should be scoped narrowly to Cloudflare Pages deployment for the account.

This is not Cloudflare Git integration. GitHub Actions builds the static artifact and uploads it with Wrangler.

## Custom Domain

After the Pages project exists and has at least one deployment, attach:

```text
spare-tokens.piccini.app
```

Cloudflare's dashboard flow:

1. Workers & Pages.
2. Select the `spare-tokens` Pages project.
3. Custom domains.
4. Set up a domain.
5. Enter `spare-tokens.piccini.app`.

If `piccini.app` is already managed by Cloudflare, Cloudflare should create the required DNS record automatically during the custom-domain setup.
