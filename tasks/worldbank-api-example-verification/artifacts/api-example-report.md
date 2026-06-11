# World Bank API Example Verification

Checked on 2026-06-11 with `curl.exe` against public World Bank API documentation examples. This report checks only HTTP status, content type, and response shape. It does not interpret API data values.

Command shape used for each request:

```powershell
curl.exe -L -s -o "C:\tmp\<response-file>" -w "%{http_code}`t%{content_type}`t%{url_effective}`n" "<documented-url>"
```

## Sources

- World Bank Data Help Desk, Country API Queries: https://datahelpdesk.worldbank.org/knowledgebase/articles/898590-country-api-queries
- World Bank Data Help Desk, Indicator API Queries: https://datahelpdesk.worldbank.org/knowledgebase/articles/898599-indicator-api-queries
- World Bank Data Help Desk, API Basic Call Structures: https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures
- World Bank Data Help Desk, Advanced Data API Queries: https://datahelpdesk.worldbank.org/knowledgebase/articles/1886686-advanced-data-api-queries
- World Bank Documents & Reports API: https://documents.worldbank.org/en/publication/documents-reports/api

## Verification Table

| Source documentation | Documented example URL | HTTP status | Content type | Response-shape notes | Assessment |
| --- | --- | ---: | --- | --- | --- |
| Country API Queries, sample XML country query | `https://api.worldbank.org/v2/country/br` | 200 | `text/xml` | XML root is `wb:countries` with paging attributes. It contains one `wb:country` child with documented country fields such as `wb:iso2Code`, `wb:name`, `wb:region`, `wb:adminregion`, `wb:incomeLevel`, `wb:lendingType`, `wb:capitalCity`, `wb:longitude`, and `wb:latitude`. | Matches the documented XML country response shape. |
| Country API Queries, sample JSON country query | `https://api.worldbank.org/v2/country/br?format=json` | 200 | `application/json;charset=utf-8` | JSON root is a two-item array. The first item has pagination keys `page`, `pages`, `per_page`, and `total`; the second item is a one-item country array with the documented country fields. | Matches the documented JSON country response shape. |
| Indicator API Queries, sample XML indicator query | `https://api.worldbank.org/v2/indicator/NY.GDP.MKTP.CD?format=xml` | 200 | `text/xml` | XML root is `wb:indicators` with paging attributes. It contains one `wb:indicator` child with documented fields including `wb:name`, `wb:unit`, `wb:source`, `wb:sourceNote`, `wb:sourceOrganization`, and `wb:topics`. | Matches the documented XML indicator response shape. |
| Indicator API Queries, sample JSON indicator query | `https://api.worldbank.org/v2/indicators/NY.GDP.MKTP.CD?format=json` | 200 | `application/json;charset=utf-8` | JSON root is a two-item array. The first item has pagination keys; the second item is a one-item indicator array with keys including `id`, `name`, `unit`, `source`, `sourceNote`, `sourceOrganization`, and `topics`. | Matches the documented JSON indicator response shape. |
| Advanced Data API Queries, concept variables JSON request | `https://api.worldbank.org/v2/sources/2/country/data?format=json` | 200 | `application/json;charset=utf-8` | JSON root is an object with `page`, `pages`, `per_page`, `total`, and `source`. The `source` array contains a source object with `id`, `name`, and `concept`; the concept object contains `id`, `name`, and a `variable` array whose entries have `id` and `value`. | Matches the documented advanced data `source` -> `concept` -> `variable` nesting. |
| Documents & Reports API, all-records JSON request with returned field | `https://search.worldbank.org/api/v3/wds?format=json&rows=20&os=0&fl=docty` | 200 | `application/json; charset=utf-8` | JSON root is an object with `rows`, `os`, `page`, `total`, and `documents`. The `documents` object is keyed by document IDs; document entries include `id`, `docty`, and default document fields such as `display_title`, `pdfurl`, `guid`, and `url`. | Matches the documented JSON search response shape and includes the requested `docty` field. |

## Stale-Example Assessment

No stale examples were found in this sample. All six documented URLs returned HTTP 200 and a response shape consistent with the surrounding documentation.

## Issue Draft

Not applicable. No upstream issue draft was prepared because the sampled examples did not show stale URLs or response-shape mismatches.
