# Our World in Data Chart Alt Text Drafts

Checked on 2026-06-11 using OWID public Grapher pages plus CSV/metadata endpoints.

Metadata endpoint shape:

```text
https://ourworldindata.org/grapher/<slug>.metadata.json?v=1&csvType=full&useColumnShortNames=false
```

CSV endpoint shape:

```text
https://ourworldindata.org/grapher/<slug>.csv?v=1&csvType=full&useColumnShortNames=false
```

## Drafts

| Chart URL | Current description observed | Proposed text | Rationale |
| --- | --- | --- | --- |
| https://ourworldindata.org/grapher/life-expectancy | Title: `Life expectancy`. Subtitle/description: `Period life expectancy at birth`. Default selection: World, Americas, Europe, Africa, Asia, Oceania. | Line chart of period life expectancy at birth for the world and major regions. All selected regions are higher in 2023 than in the 18th or 19th century; Africa remains lowest at about 64 years, while Europe and Oceania are about 79. | Matches the default regional selection and endpoint values: World rises from about 28.5 years in 1770 to 73.2 in 2023; 2023 selected-region values range from Africa about 63.8 to Europe/Oceania about 79.1. |
| https://ourworldindata.org/grapher/child-mortality | Title: `Child mortality rate`. Subtitle: `Estimated share of newborns who die before age 5.` Default selection: United States, United Kingdom, Sweden, France, Brazil, India, Ghana. | Line chart of under-five mortality for seven countries. Each selected country falls sharply over time; 2023 values range from about 0.25 deaths per 100 live births in Sweden to 3.71 in Ghana. | Uses the chart's stated unit, selected countries, and endpoint values from the CSV; avoids claims about causes or policy. |
| https://ourworldindata.org/grapher/annual-co2-emissions-per-country | Title: `Annual CO2 emissions`. Subtitle: `Carbon dioxide emissions from fossil fuels and industry. Land-use change emissions are not included.` Default selection: United States, United Kingdom, India, China, France, Germany, Brazil. | Line chart of annual territorial CO2 emissions for selected countries. China has the highest 2024 value at about 12.3 billion tonnes, followed by the United States at about 4.9 billion and India at about 3.19 billion. | Describes the selected series and latest-year ordering only; it does not infer causes or include land-use emissions. |
| https://ourworldindata.org/grapher/share-electricity-renewables | Title: `Share of electricity production from renewables`. Subtitle: `Renewables include solar, wind, hydropower, bioenergy, geothermal, wave, and tidal sources.` Default selection: World, Sweden, France, Brazil, China, India, United States. | Line chart of renewables as a share of electricity for selected countries and the world. In 2025, Brazil and Sweden are highest among the selected countries, while the world is about 33.8%. | Uses the chart's default selection and 2025 endpoint values; it states relative position without claiming why shares differ. |

Character counts for proposed text:

- Life expectancy: 232
- Child mortality: 191
- Annual CO2 emissions: 217
- Renewable electricity share: 189
