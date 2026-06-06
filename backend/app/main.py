import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import create_tables, test_db_connection

from app.auth.router import router as auth_router
from app.connections.router import router as connections_router
from app.discovery.router import router as discovery_router
from app.transfers.router import router as transfers_router
from app.monitoring.router import router as monitoring_router

logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(levelname)s %(asctime)s %(name)s %(message)s",
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title="Data Connectivity & Transfer Platform API",
    description="API for managing database connections and data transfers",
    version="1.0.0",
    docs_url="/api/docs/",
    redoc_url="/api/redoc/",
    openapi_url="/api/schema/",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error."},
    )


@app.on_event("startup")
def on_startup():
    logger.info("Starting up...")

    # Test DB connection first
    if not test_db_connection():
        logger.error("Cannot connect to database! Check your .env credentials.")
        logger.error(f"   Host: {settings.PGHOST}")
        logger.error(f"   DB:   {settings.PGDATABASE}")
        logger.error(f"   User: {settings.PGUSER}")

        return

    logger.info("Database connection successful.")

    try:
        create_tables()
        logger.info("Tables created/verified.")
    except Exception as e:
        logger.error(f"Failed to create tables: {e}")


# Register all routers
app.include_router(auth_router)
app.include_router(connections_router)
app.include_router(discovery_router)
app.include_router(transfers_router)
app.include_router(monitoring_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "message": "Data Connectivity & Transfer Platform API is running.",
        "docs": "/api/docs/",
    }


@app.get("/health/", tags=["Health"])
def health():
    """Check API and database health."""
    db_ok = test_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "database": "connected" if db_ok else "unreachable",
    }