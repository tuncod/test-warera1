# War Era API Documentation for AI Agents

**Version:** 0.17.4-beta
**Base URL:** `https://api2.warera.io`
**API Type:** tRPC (TypeScript RPC)
**Protocol:** HTTP GET with JSON input parameters
**Documentation:** https://api2.warera.io/docs/

## Quick Start for AI Agents

### Basic Request Format

All API requests follow this pattern:

```bash
curl -X GET "https://api2.warera.io/trpc/{endpoint}?input={JSON_ENCODED_PARAMETERS}" \
  -H "Accept: application/json"
```

**Key Points:**
- All endpoints use **GET** requests (not POST, despite what the docs say)
- Parameters are URL-encoded JSON in the `input` query parameter
- No authentication required for public endpoints
- Rate limit: 100 requests per 60 seconds
- Responses include rate limit headers: `ratelimit-remaining`, `ratelimit-reset`

### Response Format

**Success Response:**
```json
{
  "result": {
    "data": { ... }
  }
}
```

**Error Response:**
```json
{
  "error": {
    "message": "Error details",
    "code": -32004,
    "data": {
      "code": "NOT_FOUND",
      "httpStatus": 404,
      "path": "endpoint.name"
    }
  }
}
```

## Core Endpoints

### 1. Country Endpoints

#### Get All Countries
**Endpoint:** `country.getAllCountries`
**Method:** GET
**Parameters:** None (empty object `{}`)

```bash
curl -X GET "https://api2.warera.io/trpc/country.getAllCountries?input=%7B%7D" \
  -H "Accept: application/json"
```

**Response Data Structure:**
```json
{
  "result": {
    "data": [
      {
        "_id": "6813b6d546e731854c7ac85c",
        "name": "Bolivia",
        "code": "bo",
        "money": 105.05,
        "allies": ["6813b6d546e731854c7ac858", "683ddd2c24b5a2e114af1603"],
        "warsWith": ["6813b6d546e731854c7ac83c", "6813b6d546e731854c7ac832"],
        "region": 0,
        "development": 13.18,
        "scheme": "yellow",
        "mapAccent": "normal",
        "rankings": {
          "countryDamages": {
            "value": 264058030,
            "rank": 29,
            "tier": "platinum"
          },
          "countryWealth": {
            "value": 10574.46,
            "rank": 19,
            "tier": "platinum"
          }
        },
        "updatedAt": "2026-04-01T10:30:04.058Z"
      }
    ]
  }
}
```

#### Get Country by ID
**Endpoint:** `country.getCountryById`
**Parameters:**
```json
{
  "countryId": "string (MongoDB ObjectId)"
}
```

```bash
curl -X GET "https://api2.warera.io/trpc/country.getCountryById?input=%7B%22countryId%22%3A%226813b6d546e731854c7ac85c%22%7D" \
  -H "Accept: application/json"
```

### 2. Company Endpoints

#### Get Companies (Paginated)
**Endpoint:** `company.getCompanies`
**Parameters:**
```json
{
  "limit": 10,
  "page": 1,
  "sortBy": "createdAt",
  "sortOrder": "desc"
}
```

```bash
curl -X GET "https://api2.warera.io/trpc/company.getCompanies?input=%7B%22limit%22%3A10%2C%22page%22%3A1%7D" \
  -H "Accept: application/json"
```

**Response:**
```json
{
  "result": {
    "data": {
      "items": ["69b01e18445e36e405f199a9", "69c3cd98a34c5c851d7cd306"],
      "nextCursor": "Wed Apr 01 2026 10:33:14 GMT+0000|69c737c8997682daecc7be26"
    }
  }
}
```

#### Get Company by ID
**Endpoint:** `company.getById`
**Parameters:**
```json
{
  "companyId": "string (MongoDB ObjectId)"
}
```

### 3. Battle Endpoints

#### Get Live Battle Data
**Endpoint:** `battle.getLiveBattleData`
**Parameters:**
```json
{
  "battleId": "string (MongoDB ObjectId)"
}
```

#### Get Battles
**Endpoint:** `battle.getBattles`
**Parameters:**
```json
{
  "limit": 20,
  "page": 1
}
```

#### Get Battle by ID
**Endpoint:** `battle.getById`
**Parameters:**
```json
{
  "battleId": "string"
}
```

### 4. Ranking Endpoints

#### Get Rankings
**Endpoint:** `ranking.getRanking`
**Parameters:**
```json
{
  "rankingType": "countryDamages",
  "limit": 100
}
```

**Available Ranking Types:**
- `countryDamages` - Total damage dealt by countries
- `weeklyCountryDamages` - Weekly country damage
- `weeklyCountryDamagesPerCitizen` - Weekly damage per active citizen
- `countryRegionDiff` - Country region difference
- `countryDevelopment` - Country development level
- `countryActivePopulation` - Active citizen count
- `countryWealth` - Country treasury wealth
- `countryProductionBonus` - Production bonus
- `countryBounty` - Country bounty
- `userDamages` - User damage rankings
- `weeklyUserDamages` - Weekly user damage
- `userWealth` - User wealth
- `userLevel` - User level
- `muDamages` - Military unit damage
- `muWeeklyDamages` - Weekly military unit damage
- `muTerrain` - Military unit terrain control
- `muWealth` - Military unit wealth
- `muBounty` - Military unit bounty

```bash
curl -X GET "https://api2.warera.io/trpc/ranking.getRanking?input=%7B%22rankingType%22%3A%22countryDamages%22%2C%22limit%22%3A10%7D" \
  -H "Accept: application/json"
```

### 5. Search Endpoints

#### Global Search
**Endpoint:** `search.searchAnything`
**Parameters:**
```json
{
  "searchText": "Bolivia",
  "limit": 20
}
```

**Response:**
```json
{
  "result": {
    "data": {
      "userIds": [],
      "muIds": [],
      "countryIds": ["6813b6d546e731854c7ac85c"],
      "regionIds": ["6813b7099403bc4170a5d9a2"],
      "partyIds": [],
      "hasData": true
    }
  }
}
```

### 6. User Endpoints

#### Get User Profile (Lite)
**Endpoint:** `user.getUserLite`
**Parameters:**
```json
{
  "userId": "string (MongoDB ObjectId)"
}
```

#### Get Users by Country
**Endpoint:** `user.getUsersByCountry`
**Parameters:**
```json
{
  "countryId": "string",
  "limit": 50,
  "page": 1
}
```

### 7. Region Endpoints

#### Get All Regions
**Endpoint:** `region.getRegionsObject`
**Parameters:** None

```bash
curl -X GET "https://api2.warera.io/trpc/region.getRegionsObject?input=%7B%7D" \
  -H "Accept: application/json"
```

#### Get Region by ID
**Endpoint:** `region.getById`
**Parameters:**
```json
{
  "regionId": "string"
}
```

### 8. Event Endpoints

#### Get Paginated Events
**Endpoint:** `event.getEventsPaginated`
**Parameters:**
```json
{
  "limit": 20,
  "page": 1
}
```

### 9. Government Endpoints

#### Get Government by Country ID
**Endpoint:** `government.getByCountryId`
**Parameters:**
```json
{
  "countryId": "string"
}
```

### 10. Game Configuration

#### Get Game Configuration
**Endpoint:** `gameConfig.getGameConfig`
**Parameters:** None

**Returns:** Complete game configuration including:
- User settings (max stats, cooldowns, costs)
- Skill trees and costs
- Item configurations
- Market settings
- Military unit settings

```bash
curl -X GET "https://api2.warera.io/trpc/gameConfig.getGameConfig?input=%7B%7D" \
  -H "Accept: application/json"
```

#### Get Game Dates
**Endpoint:** `gameConfig.getDates`
**Parameters:** None

### 11. Military Unit (MU) Endpoints

#### Get Military Unit by ID
**Endpoint:** `mu.getById`
**Parameters:**
```json
{
  "muId": "string"
}
```

#### Get Military Units (Paginated)
**Endpoint:** `mu.getManyPaginated`
**Parameters:**
```json
{
  "limit": 20,
  "page": 1
}
```

### 12. Trading Endpoints

#### Get Item Prices
**Endpoint:** `itemTrading.getPrices`
**Parameters:** None

#### Get Best Orders for Item
**Endpoint:** `tradingOrder.getTopOrders`
**Parameters:**
```json
{
  "itemId": "string",
  "countryId": "string (optional)"
}
```

### 13. Article Endpoints

#### Get Article by ID
**Endpoint:** `article.getArticleById`
**Parameters:**
```json
{
  "articleId": "string"
}
```

#### Get Articles (Paginated)
**Endpoint:** `article.getArticlesPaginated`
**Parameters:**
```json
{
  "limit": 20,
  "page": 1
}
```

### 14. Work & Transaction Endpoints

#### Get Workers
**Endpoint:** `worker.getWorkers`
**Parameters:**
```json
{
  "companyId": "string"
}
```

#### Get Total Workers Count
**Endpoint:** `worker.getTotalWorkersCount`
**Parameters:** None

#### Get Work Offer by ID
**Endpoint:** `workOffer.getById`
**Parameters:**
```json
{
  "workOfferId": "string"
}
```

#### Get Work Offers by Company
**Endpoint:** `workOffer.getWorkOfferByCompanyId`
**Parameters:**
```json
{
  "companyId": "string"
}
```

#### Get Paginated Transactions
**Endpoint:** `transaction.getPaginatedTransactions`
**Parameters:**
```json
{
  "limit": 50,
  "page": 1,
  "userId": "string (optional)"
}
```

## Common Usage Patterns

### URL Encoding Parameters

When passing JSON parameters in the `input` query parameter, they must be URL-encoded:

**Original JSON:**
```json
{"rankingType": "countryDamages", "limit": 10}
```

**URL Encoded:**
```
%7B%22rankingType%22%3A%22countryDamages%22%2C%22limit%22%3A10%7D
```

In JavaScript/TypeScript:
```javascript
const params = { rankingType: "countryDamages", limit: 10 };
const encoded = encodeURIComponent(JSON.stringify(params));
// %7B%22rankingType%22%3A%22countryDamages%22%2C%22limit%22%3A10%7D
```

In Python:
```python
import urllib.parse
import json

params = {"rankingType": "countryDamages", "limit": 10}
encoded = urllib.parse.quote(json.dumps(params))
```

### Pagination Pattern

Many endpoints use cursor-based pagination:

```bash
# First page
curl "https://api2.warera.io/trpc/company.getCompanies?input=%7B%22limit%22%3A10%2C%22page%22%3A1%7D"

# Next page (using nextCursor from response)
curl "https://api2.warera.io/trpc/company.getCompanies?input=%7B%22limit%22%3A10%2C%22cursor%22%3A%22NEXT_CURSOR_VALUE%22%7D"
```

### Building a Country Network Visualization

To build a network graph of countries and alliances:

1. **Fetch all countries:**
```bash
curl -X GET "https://api2.warera.io/trpc/country.getAllCountries?input=%7B%7D" \
  -H "Accept: application/json"
```

2. **Parse response:**
```javascript
const data = {
  result: {
    data: countries  // Array of country objects
  }
};

// Extract nodes (countries)
const nodes = countries.map(country => ({
  id: country._id,
  name: country.name,
  code: country.code,
  money: country.money,
  region: country.region
}));

// Extract edges (alliances)
const edges = [];
countries.forEach(country => {
  country.allies.forEach(allyId => {
    edges.push({
      from: country._id,
      to: allyId,
      type: 'alliance'
    });
  });
});
```

## Error Codes

| Code | Description |
|------|-------------|
| -32600 | BAD_REQUEST - Invalid parameters |
| -32004 | NOT_FOUND - Resource not found |
| -32003 | INTERNAL_SERVER_ERROR |

## Rate Limiting

- **Limit:** 100 requests per 60 seconds
- **Headers:**
  - `ratelimit-limit`: Total limit (100)
  - `ratelimit-remaining`: Remaining requests
  - `ratelimit-reset`: Seconds until reset

## Region Colors

Regions are indexed 0-9 with corresponding colors:
- 0: Red (#e74c3c) - Alpha
- 1: Blue (#3498db) - Beta
- 2: Green (#2ecc71) - Gamma
- 3: Orange (#f39c12) - Delta
- 4: Purple (#9b59b6) - Epsilon
- 5: Teal (#1abc9c) - Zeta
- 6: Carrot (#e67e22) - Eta
- 7: Dark (#34495e) - Theta
- 8: Green Sea (#16a085) - Iota
- 9: Dark Red (#c0392b) - Kappa

## Tips for AI Agents

1. **Always check rate limit headers** before making requests
2. **Cache responses** when possible - country data doesn't change frequently
3. **Use search endpoint** to find entity IDs before fetching full details
4. **Handle pagination** for endpoints that return large datasets
5. **Expect tRPC response format** with `result.data` wrapper
6. **URL-encode all parameters** properly
7. **Use GET requests** for all endpoints (despite documentation showing POST)

## Example Implementation (JavaScript)

```javascript
class WarEraAPI {
  constructor(baseUrl = 'https://api2.warera.io') {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, params = {}) {
    const input = encodeURIComponent(JSON.stringify(params));
    const url = `${this.baseUrl}/trpc/${endpoint}?input=${input}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.result.data;
  }

  // Convenience methods
  async getAllCountries() {
    return this.request('country.getAllCountries', {});
  }

  async getCountryById(id) {
    return this.request('country.getCountryById', { countryId: id });
  }

  async getRankings(type, limit = 100) {
    return this.request('ranking.getRanking', { rankingType: type, limit });
  }

  async search(query, limit = 20) {
    return this.request('search.searchAnything', { searchText: query, limit });
  }

  async getGameConfig() {
    return this.request('gameConfig.getGameConfig', {});
  }
}

// Usage
const api = new WarEraAPI();
const countries = await api.getAllCountries();
const rankings = await api.getRankings('countryDamages', 10);
```

## Example Implementation (Python)

```python
import urllib.parse
import requests
from typing import Any, Dict, List, Optional

class WarEraAPI:
    BASE_URL = "https://api2.warera.io"

    def request(self, endpoint: str, params: Dict[str, Any] = None) -> Any:
        if params is None:
            params = {}

        input_json = urllib.parse.quote(str(params).replace("'", '"'))
        url = f"{self.BASE_URL}/trpc/{endpoint}?input={input_json}"

        response = requests.get(url, headers={'Accept': 'application/json'})
        response.raise_for_status()

        data = response.json()

        if 'error' in data:
            raise Exception(data['error']['message'])

        return data['result']['data']

    def get_all_countries(self) -> List[Dict]:
        return self.request('country.getAllCountries', {})

    def get_country_by_id(self, country_id: str) -> Dict:
        return self.request('country.getCountryById', {'countryId': country_id})

    def get_rankings(self, ranking_type: str, limit: int = 100) -> List[Dict]:
        return self.request('ranking.getRanking', {
            'rankingType': ranking_type,
            'limit': limit
        })

    def search(self, query: str, limit: int = 20) -> Dict:
        return self.request('search.searchAnything', {
            'searchText': query,
            'limit': limit
        })

# Usage
api = WarEraAPI()
countries = api.get_all_countries()
rankings = api.get_rankings('countryDamages', 10)
```

## Full Endpoint List

| Category | Endpoint | Description |
|----------|----------|-------------|
| Company | `/company.getById` | Get company by ID |
| Company | `/company.getCompanies` | Get companies with pagination |
| Country | `/country.getCountryById` | Get country by ID |
| Country | `/country.getAllCountries` | Get all countries |
| Event | `/event.getEventsPaginated` | Get paginated events |
| Government | `/government.getByCountryId` | Get government by country ID |
| Region | `/region.getById` | Get region by ID |
| Region | `/region.getRegionsObject` | Get all regions |
| Battle | `/battle.getById` | Get battle by ID |
| Battle | `/battle.getLiveBattleData` | Get live battle data |
| Battle | `/battle.getBattles` | Get battles |
| Round | `/round.getById` | Get round by ID |
| Round | `/round.getLastHits` | Get last hits in round |
| BattleRanking | `/battleRanking.getRanking` | Get battle rankings |
| ItemTrading | `/itemTrading.getPrices` | Get item prices |
| TradingOrder | `/tradingOrder.getTopOrders` | Get best orders for an item |
| ItemOffer | `/itemOffer.getById` | Get item offer by ID |
| WorkOffer | `/workOffer.getById` | Get work offer by ID |
| WorkOffer | `/workOffer.getWorkOfferByCompanyId` | Get work offer by company ID |
| WorkOffer | `/workOffer.getWorkOffersPaginated` | Get paginated work offers |
| Ranking | `/ranking.getRanking` | Get ranking data |
| Search | `/search.searchAnything` | Global search |
| GameConfig | `/gameConfig.getDates` | Get game dates |
| GameConfig | `/gameConfig.getGameConfig` | Get game configuration |
| User | `/user.getUserLite` | Get user profile (lite) |
| User | `/user.getUsersByCountry` | Get users by country |
| Article | `/article.getArticleById` | Get article by ID |
| Article | `/article.getArticleLiteById` | Get article lite by ID |
| Article | `/article.getArticlesPaginated` | Get paginated articles |
| MU | `/mu.getById` | Get military unit by ID |
| MU | `/mu.getManyPaginated` | Get military units (paginated) |
| Transaction | `/transaction.getPaginatedTransactions` | Get paginated transactions |
| Upgrade | `/upgrade.getUpgradeByTypeAndEntity` | Get upgrade by type and entity |
| Worker | `/worker.getWorkers` | Get workers |
| Worker | `/worker.getTotalWorkersCount` | Get total workers count |

## Support

- **API Documentation:** https://api2.warera.io/docs/
- **Game Website:** War Era browser game
- **API Version:** 0.17.4-beta
- **Protocol:** OAS 3.0 / tRPC

---

*Last Updated: April 1, 2026*
