from fastapi import FastAPI, UploadFile
import shutil
from PIL import Image
from db import SessionLocal
from models import BronzeDetection

app = FastAPI()

@app.post("/upload")
async def upload(file: UploadFile):
    
    # Save file
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file,f)

    file_name = file.filename
    
    with open(file_path, "rb") as f:
        file_size = len(f.read())

    img = Image.open(file_path)
    width, height = img.size

    detections = [
        {"label": "person", "confidence": 0.95}
    ]

    db = SessionLocal()
    record = BronzeDetection(
        image_path=file_path,
        file_name=file_name,
        file_size=file_size,
        width=width,
        height=height,
        detections=detections
    )
    db.add(record)
    db.commit()
    db.close()

    return {"message": "Stored in bronze"}