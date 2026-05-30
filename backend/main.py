from fastapi import FastAPI, UploadFile,HTTPException,Query
import shutil
from PIL import Image
from db import SessionLocal
from models import BronzeLayer, SilverLayer, Dimensions, Facts
from ultralytics import YOLO
from sqlalchemy import func
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)
model = YOLO("yolov8n.pt")


@app.post("/upload")
async def upload(file: UploadFile):

    # Save file
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    file_name = file.filename

    with open(file_path, "rb") as f:
        file_size = len(f.read())

    img = Image.open(file_path)
    width, height = img.size

    results = model(file_path)

    detections = []

    for box in results[0].boxes:

        class_id = int(box.cls[0])

        label = model.names[class_id]

        confidence = round(float(box.conf[0]), 2)

        bbox = []

        for x in box.xyxy[0].tolist():
            bbox.append(int(x))

        detections.append({
            "label": label,
            "confidence": confidence,
            "bbox": bbox
        })

    db = SessionLocal()

    record = BronzeLayer(
        image_path=file_path,
        file_name=file_name,
        file_size=file_size,
        width=width,
        height=height,
        detections=detections
    )

    db.add(record)

    db.commit()
    db.refresh(record)

    for detection in detections:

        silver_record = SilverLayer(
            bronze_id=record.id,
            label=detection["label"],
            confidence=detection["confidence"],
            bbox=detection["bbox"]
        )

        db.add(silver_record)

    for detection in detections:

        label = detection["label"]

        dimension = db.query(Dimensions).filter(
            Dimensions.label == label
        ).first()

        if not dimension:

            dimension = Dimensions(
                label=label
            )

            db.add(dimension)

            db.commit()

            db.refresh(dimension)

        fact_record = Facts(
            bronze_id=record.id,
            object_id=dimension.object_id,
            confidence=detection["confidence"]
        )

        db.add(fact_record)

    db.commit()
    db.close()
    return {"message": "Image processed successfully"}

@app.get("/analytics")
def analytics():

    db = SessionLocal()

    total_images = db.query(BronzeLayer).count()

    total_detections = db.query(Facts).count()

    top_objects = (
        db.query(
            Dimensions.label,
            func.count(Facts.fact_id).label("count")
        )
        .join(Facts, Dimensions.object_id == Facts.object_id)
        .group_by(Dimensions.label)
        .order_by(func.count(Facts.fact_id).desc())
        .all()
    )

    top_classes = []

    for label, count in top_objects:

        top_classes.append({
            "object": label,
            "count": count
        })

    db.close()

    return {
        "total_images": total_images,
        "total_detections": total_detections,
        "top_classes": top_classes
    }

@app.get("/metadata/{id}")
def get_metadata(id: int):

    db = SessionLocal()

    record = (
        db.query(BronzeLayer)
        .filter(BronzeLayer.id == id)
        .first()
    )

    if not record:
        db.close()
        raise HTTPException(
            status_code=404,
            detail="Image not found"
        )

    detections = []

    for detection in record.detections:

        detections.append({
            "object": detection["label"],
            "confidence": detection["confidence"]
        })

    response = {
        "id": record.id,
        "filename": record.file_name,
        "width": record.width,
        "height": record.height,
        "model": "yolov8n",
        "image_url": f"http://localhost:8000/{record.image_path}",
        "detections": detections
    }

    db.close()

    return response

@app.get("/search")
def search(
    object: str = Query(None),
    confidence: float = Query(None)
):

    db = SessionLocal()

    query = (
        db.query(
            BronzeLayer.id,
            BronzeLayer.file_name,
            BronzeLayer.image_path
        )
        .join(
            SilverLayer,
            BronzeLayer.id == SilverLayer.bronze_id
        )
    )

    if object:
        query = query.filter(
            SilverLayer.label.ilike(f"%{object}%")
        )

    if confidence:
        query = query.filter(
            SilverLayer.confidence >= confidence
        )

    records = query.distinct().all()

    results = []

    for record in records:

        results.append({
            "id": record.id,
            "filename": record.file_name,
            "image_url": f"http://localhost:8000/{record.image_path}",
            "detections": []
        })

    db.close()

    return {
        "results": results
    }