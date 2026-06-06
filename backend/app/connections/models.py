from sqlalchemy import (
    Column, BigInteger, String, Text, Integer,
    Boolean, DateTime, ForeignKey
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class DatabaseConnection(Base):
    __tablename__ = "database_connections"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    db_type = Column(String(20), nullable=False, default="postgresql")

    host = Column(String(255), nullable=False)
    port = Column(Integer, nullable=False)
    database_name = Column(String(255), nullable=False)
    username = Column(String(255), nullable=False)
    encrypted_password = Column(Text, nullable=False)

    use_ssl = Column(Boolean, default=False)

    status = Column(String(20), default="untested")
    last_tested_at = Column(DateTime(timezone=True), nullable=True)
    last_error = Column(Text, default="")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="connections")