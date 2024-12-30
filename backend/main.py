from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import routers

app = FastAPI(title="Marathon Training Planner")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.include_router(routers.router)
