from fastapi import FastAPI, UploadFile
import shutil
from PIL import Image
from db import SessionLocal
from models import BronzeLayer, SilverLayer, Dimensions, Facts
from ultralytics import YOLO

app = FastAPI()

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