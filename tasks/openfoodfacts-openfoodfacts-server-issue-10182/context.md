# Add analytics for usage of the API documentation
Imported from: openfoodfacts-good-first-issue
Repository: openfoodfacts/openfoodfacts-server
Issue: #10182 https://github.com/openfoodfacts/openfoodfacts-server/issues/10182
Issue author: teolemon
Labels: 🎯 P1, 📚 Documentation, good first issue, matomo
Created: 2021-09-22T12:02:28Z
Updated: 2026-05-29T15:56:53Z
Comments: 3
## Source Rationale
Open Food Facts provides public food product data that supports consumer transparency, research, and public-health tooling.
Source note: Keep work developer-facing. Do not make nutritional or medical recommendations.
## Issue Body Excerpt
### What
Add analytics for API documentation usage

### Code pointers
- https://squidfunk.github.io/mkdocs-material/setup/setting-up-site-analytics/#custom-site-analytics (MKDOCS part)
- RapidDoc ? https://openfoodfacts.github.io/openfoodfacts-server/api/ref-v2/#get-/api/v2/search
- A dedicated Matomo property has been created


```
<!-- Matomo -->
<script>
  var _paq = window._paq = window._paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="https://analytics.openfoodfacts.org/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', '16']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
<!-- End Matomo Code -->
```


### Part of
- Monitoring (https://github.com/openfoodfacts/openfoodfacts-monitoring/issues/1)
- #7446