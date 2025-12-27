"""API routes."""

from fastapi import APIRouter
from app.api import anonymize

router = APIRouter()

# Include sub-routers
router.include_router(anonymize.router)


@router.get("/status")
async def get_status():
    return {"status": "API is running"}
