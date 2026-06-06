from sqlalchemy import (
    Column, BigInteger, String, Text, Integer,
    Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class TransferJob(Base):
    __tablename__ = "transfer_jobs"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(200), nullable=False)
    description = Column(Text, default="")

    source_connection_id = Column(BigInteger, ForeignKey("database_connections.id", ondelete="RESTRICT"))
    source_schema = Column(String(255), nullable=False)
    source_table = Column(String(255), nullable=False)

    destination_connection_id = Column(BigInteger, ForeignKey("database_connections.id", ondelete="RESTRICT"))
    destination_schema = Column(String(255), nullable=False)
    destination_table = Column(String(255), nullable=False)

    column_mapping = Column(JSON, default=dict)
    source_filters = Column(JSON, default=dict)
    batch_size = Column(Integer, default=1000)
    truncate_destination = Column(Boolean, default=False)

    status = Column(String(20), default="pending")
    total_rows = Column(BigInteger, default=0)
    transferred_rows = Column(BigInteger, default=0)
    failed_rows = Column(BigInteger, default=0)
    error_message = Column(Text, default="")

    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", backref="transfer_jobs")
    source_connection = relationship("DatabaseConnection", foreign_keys=[source_connection_id])
    destination_connection = relationship("DatabaseConnection", foreign_keys=[destination_connection_id])
    logs = relationship("TransferLog", back_populates="transfer_job", cascade="all, delete-orphan")

    @property
    def progress_percentage(self):
        if self.total_rows == 0:
            return 0.0
        return round((self.transferred_rows / self.total_rows) * 100, 2)


class TransferLog(Base):
    __tablename__ = "transfer_logs"

    id = Column(BigInteger, primary_key=True, index=True)
    transfer_job_id = Column(BigInteger, ForeignKey("transfer_jobs.id", ondelete="CASCADE"))
    level = Column(String(10), default="info")
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    transfer_job = relationship("TransferJob", back_populates="logs")