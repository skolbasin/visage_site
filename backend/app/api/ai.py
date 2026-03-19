from fastapi import APIRouter, File, HTTPException, UploadFile

from app.services.ai_service import analyze_face

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/analyze-face")
async def analyze_face_endpoint(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    # Проверка размера (например, не больше 5 МБ)
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large, max 5MB")

    result = await analyze_face(contents)
    return result
