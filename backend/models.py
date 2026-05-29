from sqlalchemy import Column, Float, Integer, String, JSON, TIMESTAMP
from db import Base

class BronzeLayer(Base):
    __tablename__ = "bronze_layer"

    id = Column(Integer, primary_key=True, index=True)
    image_path = Column(String(255))
    file_name = Column(String(100))
    file_size = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    detections = Column(JSON)   

class SilverLayer(Base):
    __tablename__ = "silver_layer"

    id = Column(Integer, primary_key=True, index=True)

    bronze_id = Column(Integer)

    label = Column(String(100))

    confidence = Column(Float)

    bbox = Column(JSON)
    
class Dimensions(Base):
    __tablename__ = "dimensions"

    object_id = Column(Integer, primary_key=True, index=True)
    label = Column(String(100), unique=True)


class Facts(Base):
    __tablename__ = "facts"

    fact_id = Column(Integer, primary_key=True, index=True)

    bronze_id = Column(Integer)

    object_id = Column(Integer)

    confidence = Column(Float)