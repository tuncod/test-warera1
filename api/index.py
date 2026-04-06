from fastapi import FastAPI
from mangum import Mangum
import httpx

app = FastAPI()

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

@app.get("/api/country/{country}")
async def call_api(country: str):
    if country not in countries:
        return {"error": "Country not found"}
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://api2.warera.io/trpc/country.getAllCountries",
            headers=headers,
            json={"countryId": countries[country]},
        )
    
    data = response.json()
    results = data.get("results", [])
    match = next((item for item in results if item.get("_id") == countries[country]), None)
    
    return match or {"error": "No match found"}

handler = Mangum(app)
