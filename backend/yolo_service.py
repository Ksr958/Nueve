from ultralytics import YOLO

# Load model once when server starts
model = YOLO("./yolo_model/best (1).pt")
model.to("cpu")

def detect_issue(image_path):

    results = model(image_path)

    for r in results:
        if len(r.boxes) > 0:

            cls = int(r.boxes[0].cls[0])
            conf = float(r.boxes[0].conf[0])

            label = model.names[cls]

            return {
                "category": label,
                "confidence": round(conf, 2)
            }
    return {
        "category": "unknown",
        "confidence": 0
    }