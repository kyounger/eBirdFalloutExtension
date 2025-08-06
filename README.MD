# eBird Fallout (browser extension)

## Summary

eBird is already pretty great. But a some pages have data that I want to download. This extension lets you do that.

## What data does it download?

1. **Targets Page**: This works (excludes hybrids)
2. **Needs Alert**: In Progress
3. **Rare Alerts**: In Progress

## Data Schemas

### Targets Page (`/targets`)
Downloads species data from eBird's targets page, excluding hybrid species.

**CSV Schema:**
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | String | Common name of the bird species | "American Robin" |
| `frequency` | String | Frequency percentage as observed | "45" |
| `link` | String | Full URL to the species page on eBird | "https://ebird.org/species/amerob" |
| `mapUrl` | String | Full URL to the species map on eBird | "https://ebird.org/map/amerob" |
| `category` | String | Category of the species (from aria-labelledby) | "needs" |
| `queryRegion` | String | Region parameter from URL query | "US-CA" |
| `queryBegMonth` | String | Beginning month parameter from URL query | "01" |
| `queryEndMonth` | String | Ending month parameter from URL query | "12" |

**Filename Format:** `targets-YYYY-MM-DD-HHMMSS.csv`

### Alerts Page (`/alert/summary`)
Downloads rare bird alert data showing recent observations.

**CSV Schema:**
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `observationId` | String | Unique observation identifier | "12345678" |
| `speciesName` | String | Common name of the bird species | "American Robin" |
| `scientificName` | String | Scientific name of the species | "Turdus migratorius" |
| `numberObserved` | String | Number of birds observed | "1" |
| `observationDate` | String | Date of the observation | "Dec 15, 2023" |
| `confirmedTag` | String | Confirmation status tag | "Confirmed" |
| `locationName` | String | Specific location name | "Central Park" |
| `county` | String | County name | "New York" |
| `state` | String | State/province name | "New York" |
| `country` | String | Country name | "United States" |
| `observerName` | String | Name of the observer | "John Smith" |
| `latitude` | String | GPS latitude coordinate | "40.7589" |
| `longitude` | String | GPS longitude coordinate | "-73.9851" |
| `checklistUrl` | String | URL to the full checklist | "https://ebird.org/checklist/S12345678" |

**Filename Format:** `alerts-YYYY-MM-DD-HHMMSS.csv`

### Region Bird Lists (`/region/{region}/bird-list`)
Downloads bird observation data from regional bird list pages.

**CSV Schema:**
| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `region` | String | Region code from URL path | "US-CA" |
| `sectionType` | String | Type of bird list section | "First Observed" |
| `speciesName` | String | Common name of the bird species | "American Robin" |
| `speciesLink` | String | URL to the species page | "https://ebird.org/species/amerob" |
| `count` | String | Number of birds observed | "5" |
| `date` | String | Date of the observation | "Jan 15, 2023" |
| `dateLink` | String | URL to the checklist for that date | "https://ebird.org/checklist/S12345678" |
| `observer` | String | Name of the observer | "John Smith" |
| `location` | String | Location of the observation | "Central Park" |
| `sensitive` | Boolean | Whether the observation is marked as sensitive | true |

**List Metrics (determined by URL parameter `rank`):**
- `lrec`: First Observed (earliest sighting)
- `hc`: High Count (highest number observed)
- Default: Last Observed (most recent sighting)

**Time Periods (determined by URL parameter `yr`):**
- `cur`: Current year
- `curM`: Current month
- `null`: All years
- Other values: Specific year

**Filename Format:** `regionList-{region}-{listMetric}-YYYY-MM-DD-HHMMSS.csv`

## How to Use

1. Install the extension from the browser's extension store.
2. Click on the extension icon in the toolbar to open the popup.
3. Click the download.

## Development

So part of the fun I had with this was to use ChatGPT to write a lot of the code. I didn't test it a ton, but it does work for the several attempts I used and I didn't want to spend forever working on it. Honestly getting the javascript working in a browser extension was the hardest part, given all the nuances of the different browsers.

I used the Manifeset v3 standard and I tested it in Firefox and Brave, so I assume it should work in most other Chromium-based browsers.

## Feedback and Contributions

Feedback and contributions are welcome. Please open an issue on the GitHub repository if you have any suggestions or find any bugs. Zero guarantees as to if I have time to work on it. :)

## License

This extension is released under the MIT License. See the LICENSE file for more details.

## Privacy Policy

This extension requires certain access to the page you run it on, but it does not collect any information AT ALL and NEVER WILL. Chrome webstore requires a privacy policy be in place and here you go.