from fastapi import FastAPI
import models
import calcs

app = FastAPI(title="Marathon Training Planner")

def hello():
    return("Hello Sync!")

@app.get("/")
async def root():
    return hello()