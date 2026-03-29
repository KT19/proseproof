from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import APP_NAME, DEBUG, HOST, PORT
from app.database import engine
from app.models import Base
from app.routes import documents, analysis, health, stats

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=APP_NAME,
    description="AI-powered writing assistant with grammar checking and style tips",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(documents.router, prefix="/api")
app.include_router(analysis.router, prefix="/api")
app.include_router(health.router, prefix="/api")
app.include_router(stats.router, prefix="/api")


@app.get("/")
def read_root():
    return {
        "message": f"Welcome to {APP_NAME}!",
        "docs": "/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=DEBUG)
