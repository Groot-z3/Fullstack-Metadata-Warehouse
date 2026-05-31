# Metadata Warehouse for Computer Vision Images

A full-stack metadata warehouse that extracts, stores, searches, and analyzes image metadata using YOLOv8 and Medallion Architecture (Bronze, Silver, Gold).

## Features

- Upload images for automatic metadata extraction
- Object detection using YOLOv8
- Bronze, Silver, and Gold warehouse layers
- Search images by detected object and confidence threshold
- Metadata viewer with image properties and detection results
- Analytics dashboard showing warehouse statistics

## Tech Stack

### Frontend
- React
- JavaScript
- HTML
- CSS

### Backend
- FastAPI
- SQLAlchemy

### Database
- MySQL

### Computer Vision
- YOLOv8

## Architecture

```text
Upload Image
      ↓
YOLOv8 Detection
      ↓
Bronze Layer
      ↓
Silver Layer
      ↓
Gold Layer
      ↓
Search & Analytics
```

### Bronze Layer
Stores raw image metadata and detection output.

### Silver Layer
Stores normalized detection records.

### Gold Layer
Stores analytics-ready data using Facts and Dimensions tables.

## Screenshots

### Upload Page
![Upload Page](screenshots/upload.png)

### Search Page
![Search Page](screenshots/search.png)

### Metadata Viewer
![Metadata Viewer](screenshots/metadata.png)

### Analytics Dashboard
![Analytics Dashboard](screenshots/analytics.png)

## Run Locally

Clone the repository:

```bash
git clone <repository-url>
cd Fullstack-Metadata-Warehouse
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file:

```env
DATABASE_URL=your_database_url
```

Run the backend:

```bash
uvicorn main:app --reload
```

Open the frontend using Live Server or any static web server.


## Author

Navneet Nandakumar
