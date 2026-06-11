# openFDA Documentation Accessibility Findings

Checked on 2026-06-11 with `@axe-core/cli` `4.11.3` in headless Chrome.

Command shape:

```powershell
npx --yes @axe-core/cli <url> --stdout --load-delay 1000
```

## URLs Checked

- https://open.fda.gov/apis/
- https://open.fda.gov/apis/drug/event/
- https://open.fda.gov/apis/food/enforcement/
- https://open.fda.gov/apis/device/event/

## Findings

| URL | Finding | Axe impact | Evidence | Recommended fix |
| --- | --- | --- | --- | --- |
| `https://open.fda.gov/apis/` | Heading levels increase by more than one. | Moderate | Rule: `heading-order`; target: `h4`; snippet: `<h4 class="modal-header">Disclaimer</h4>`. | If the disclaimer modal is hidden by default, remove it from the accessibility tree until opened. When active, use a heading level consistent with the dialog structure, or style non-heading text instead of skipping heading levels. |
| `https://open.fda.gov/apis/` | Page content is not contained by landmarks. | Moderate | Rule: `region`; 3 nodes; targets: `.header-main`, `.doc-sidebar-mobile`, `#doc-container`; snippet: `<div class="doc-container " id="doc-container">`. | Wrap the main documentation content in `<main>` or add `role="main"` to the main content container. Put header/navigation/sidebar content in appropriate landmark elements such as `<header>`, `<nav>`, or `<aside>`. |
| `https://open.fda.gov/apis/drug/event/` | Page content is not contained by landmarks. | Moderate | Rule: `region`; 33 nodes; first targets: `.header-main`, `.doc-sidebar-mobile`, `h2`, `.doc-content > p:nth-child(2)`, `.key-facts > h3`; snippets include `<h2>Drug Adverse Event Overview</h2>` and `<h3>Key Facts</h3>`. | Use one page-level main landmark around the documentation body and landmark elements for repeated header/sidebar navigation. This should fix many repeated `region` nodes at once. |
| `https://open.fda.gov/apis/food/enforcement/` | Page content is not contained by landmarks. | Moderate | Rule: `region`; 29 nodes; first targets: `.header-main`, `.doc-sidebar-mobile`, `h2`, `.doc-content > p:nth-child(2)`, `p:nth-child(3)`, `.key-facts > h3`; snippet: `<h2>Food Enforcement Overview</h2>`. | Same landmark fix as above: make the primary documentation content a `<main>` region and classify repeated navigation/sidebar content with appropriate landmarks. |
| `https://open.fda.gov/apis/device/event/` | Page content is not contained by landmarks. | Moderate | Rule: `region`; 32 nodes; first targets: `.header-main`, `.doc-sidebar-mobile`, `h2`, `.doc-content > p:nth-child(2)`, `p:nth-child(3)`, `h3:nth-child(4)`; snippet: `<h2>Device Adverse Event Overview</h2>`. | Same landmark fix as above: add a main landmark for the documentation body and landmark elements for header/sidebar regions. |

## Issue Draft

Title:

`Docs pages: add page landmarks and fix overview disclaimer heading order`

Body:

I ran a small axe scan over several public openFDA documentation pages and found a narrow set of reproducible accessibility issues.

Pages checked:

- https://open.fda.gov/apis/
- https://open.fda.gov/apis/drug/event/
- https://open.fda.gov/apis/food/enforcement/
- https://open.fda.gov/apis/device/event/

Tooling:

```powershell
npx --yes @axe-core/cli <url> --stdout --load-delay 1000
```

Findings:

- `region` / moderate: several documentation pages have content outside landmarks. Example targets include `.header-main`, `.doc-sidebar-mobile`, `#doc-container`, `h2`, and `.doc-content > p:nth-child(2)`.
- `heading-order` / moderate on `https://open.fda.gov/apis/`: the disclaimer modal heading appears as `<h4 class="modal-header">Disclaimer</h4>`.

Suggested fix:

- Wrap the primary documentation content in a `<main>` landmark or add `role="main"` to the existing main content container.
- Put the repeated header/sidebar navigation in appropriate landmark elements such as `<header>`, `<nav>`, or `<aside>`.
- For the disclaimer modal, either keep hidden modal content out of the accessibility tree until opened or use a heading level consistent with the dialog structure.

I did not inspect API data or make any medical, legal, or regulatory claims; this is only about documentation page markup.
