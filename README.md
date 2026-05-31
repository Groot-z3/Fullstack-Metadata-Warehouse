# Metadata Warehouse for Computer Vision Images

A Full-stack Metadata warehouse that extracts, stores, searches, and analyzes image metadata using YOLOv8 and Medallion Architecture (Bronze, Silver, Gold).

## Features🎯

- Upload images for automatic metadata extraction
- Object detection using YOLOv8
- Bronze, Silver, and Gold warehouse layers
- Search images by detected object and confidence threshold
- Metadata viewer with image properties and detection results
- Analytics dashboard showing warehouse statistics

## Tech Stack🛠️

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

##  Architecture🏗️

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

## Screenshots📸

### Upload Page
<img width="1852" height="943" alt="image" src="https://github.com/user-attachments/assets/afd75e15-c378-4657-84d3-595ed0f08bec" />


### Search Page
<img width="1304" height="685" alt="image" src="https://github.com/user-attachments/assets/5ba4871b-a770-489d-aa1c-0ddaa9986a03" />


### Metadata Viewer
<img width="1346" height="756" alt="image" src="https://github.com/user-attachments/assets/166d59eb-d1d5-4071-81e6-990e5b099be1" />


### Analytics Dashboard
<img width="1289" height="827" alt="image" src="https://github.com/user-attachments/assets/0c23394c-a5fd-4459-80af-86a1b9da6ea8" />


## Run Locally🚀

Clone the repository:

```bash
git clone https://github.com/Groot-z3/Fullstack-Metadata-Warehouse.git
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

Open the Frontend using Live Server or any static web server.
