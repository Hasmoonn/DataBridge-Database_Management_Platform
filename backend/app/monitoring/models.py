from sqlalchemy import Column, BigInteger, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(50), nullable=False)
    description = Column(Text, nullable=False)
    extra_data = Column(JSON, default=dict)  # renamed from 'metadata' (reserved by SQLAlchemy)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", backref="activity_logs")