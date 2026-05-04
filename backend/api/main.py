from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from modules.auth.router import router as auth_router
from modules.health.router import router as health_router
from modules.biochat.router import router as biochat_router
from modules.feed.router import router as feed_router

app = FastAPI(
    title="Biowire API",
    description="Personal Health Assistant Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth_router)
app.include_router(health_router)
app.include_router(biochat_router)
app.include_router(feed_router)

@app.get("/")
async def root():
    return {"status": "Biowire API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}