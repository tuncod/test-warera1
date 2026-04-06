from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.get("/api/hello")
def hello():
    return {"message": "hello from fastapi"}

handler = Mangum(app)
