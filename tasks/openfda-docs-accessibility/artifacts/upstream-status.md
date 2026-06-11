# Upstream Status

Status checked on 2026-06-11.

## Public Upstream

- Repository: https://github.com/FDA/open.fda.gov
- Local implementation branch: `C:\Users\LuizPiccini\Documents\PicciniDigitalBrain\temp\open.fda.gov`, branch `codex/a11y-doc-landmarks`
- Local implementation commit: `7feab859`
- Portable patch: `C:\Users\LuizPiccini\Documents\PicciniDigitalBrain\temp\openfda-a11y-doc-landmarks.patch`

## What Was Implemented

The local patch addresses the axe findings from the public docs pages:

- `.header-main` is rendered as `<header>`.
- Documentation content containers are rendered as `<main>`.
- The API documentation sidebar is rendered as an `<aside>` with a nested labeled `<nav>`.
- The mobile docs sidebar toggle is a real `button` with `aria-expanded` and `aria-controls`.
- The disclaimer modal heading changes from `h4` to `h2` while keeping the `.modal-header` class.
- `.doc-sidebar-mobile` CSS resets default button styling to preserve the existing visual layout.

## Verification

Commands run:

```text
npm ci
npm run build
npx --yes @axe-core/cli http://127.0.0.1:9001/apis/ --load-delay 1000 --exit
npx --yes @axe-core/cli http://127.0.0.1:9001/apis/drug/event/ --load-delay 1000 --exit
npx --yes @axe-core/cli http://127.0.0.1:9001/apis/food/enforcement/ --load-delay 1000 --exit
npx --yes @axe-core/cli http://127.0.0.1:9001/apis/device/event/ --load-delay 1000 --exit
```

`npm run build` passed, and the four local axe runs exited cleanly.

`npm run type-check` is not a clean baseline gate in the upstream repo today; it fails on many unrelated existing TypeScript errors outside this patch.

## Publishing Blocker

Direct push to `FDA/open.fda.gov` failed with `403`, and no `LuizPiccini/open.fda.gov` fork exists at `https://github.com/LuizPiccini/open.fda.gov.git`. The GitHub connector also returned `403 Resource not accessible by integration` when trying to create an upstream issue.
