from fastapi import FastAPI
from src import routers

app = FastAPI(title="Marathon Training Planner")
app.include_router(routers.router)
