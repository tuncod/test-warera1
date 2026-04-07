from fastapi import FastAPI
from mangum import Mangum
import httpx
import string
from fastapi.responses import HTMLResponse
from scalar_fastapi import get_scalar_api_reference

ALPHABET = string.digits + string.ascii_letters  # 0-9a-zA-Z

def to_base62(n: int) -> str:
    result = ""
    while n:
        result = ALPHABET[n % 62] + result
        n //= 62
    return result or "0"

def from_base62(s: str) -> int:
    return sum(ALPHABET.index(c) * 62**i for i, c in enumerate(reversed(s)))

def encode(s: str, key: str) -> str:
    xored = bytes(a ^ ord(key[i % len(key)]) for i, a in enumerate(s.encode()))
    return to_base62(int(xored.hex(), 16))

def decode(s: str, key: str) -> str:
    n = from_base62(s)
    raw = bytes.fromhex(hex(n)[2:])
    return bytes(a ^ ord(key[i % len(key)]) for i, a in enumerate(raw)).decode()

KEY = "my-secret"

app = FastAPI(docs_url=None)

API_AUTH_TOKEN = "" # "Bearer wae_ae8dc4516462513ce1ea18db612e1fa2b458409fa214985db9dc84dd407c3bc2"

countries = {
    "tn": "6813b6d546e731854c7ac84e",
}

headers = {
    "Accept": "*/*",
    "Content-Type": "application/json",
    "Authorization": API_AUTH_TOKEN,
}

@app.get("/api/hello")
def hello():
    return {"message": "hello from fastapi"}

@app.get("/api/country")
async def api_country_index(raw: str = None):
    return await api_country("tn", raw)

@app.get("/api/country/{country}")
async def api_country(country: str, raw: str = None):
    if country not in countries:
        return {"error": "Country not found"}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api2.warera.io/trpc/country.getAllCountries",
            headers=headers,
            json={"countryId": countries[country]},
        )
    
    data = response.json()
    items = data.get("result", {}).get("data", [])
    match = next((item for item in items if item.get("_id") == countries[country]), None)

    if not match:
        return {"error": "No match found"}

    countryData = {}
    countryData["id"] = encode(countries[country], KEY)
    countryData["flag"] = f"https://flagcdn.com/{country}.svg"

    if raw:
        countryData["raw"] = match

    return countryData

@app.get("/docs", include_in_schema=False)
async def scalar_docs():
    return get_scalar_api_reference(
        openapi_url="/openapi.json",
        title="WarEra",
        default_http_client={
          "targetKey": "javascript",
          "clientKey": "ofetch"
        }
    )

handler = Mangum(app)
