import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

logger = logging.getLogger(__name__)


def _build_engine():
    """Build SQLAlchemy engine with Neon-compatible settings."""
    
    connect_args = {
        "sslmode": "require",
        "options": "-c timezone=UTC",
    }

    engine = create_engine(
        settings.database_url,
        connect_args=connect_args,
        pool_pre_ping=True,
        pool_size=3,
        max_overflow=5,
        pool_timeout=30,
        pool_recycle=300, 
        echo=settings.DEBUG,
    )
    return engine


engine = _build_engine()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables. Import models first so SQLAlchemy registers them."""
    from app.auth.models import User, BlacklistedAccessToken  # noqa: F401
    from app.connections.models import DatabaseConnection  # noqa: F401
    from app.transfers.models import TransferJob, TransferLog  # noqa: F401
    from app.monitoring.models import ActivityLog  # noqa: F401

    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables ready.")


def test_db_connection() -> bool:
    """Test if database is reachable."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"Database connection test failed: {e}")
        return False