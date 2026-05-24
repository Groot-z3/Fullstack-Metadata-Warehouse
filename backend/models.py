from sqlalchemy import Column, Integer, String, JSON, TIMESTAMP
from db import Base

class BronzeDetection(Base):
    __tablename__ = "bronze_detection"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String(255))
    file_name = Column(String(100))
    file_size = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    detections = Column(JSON)   