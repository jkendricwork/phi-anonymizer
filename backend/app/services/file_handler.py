"""File upload and cleanup service."""

import os
import time
import uuid
from pathlib import Path
from typing import Optional
from dataclasses import dataclass

from fastapi import UploadFile, HTTPException
import aiofiles

from app.core.config import settings


@dataclass
class TempFile:
    """Temporary file information."""

    file_id: str
    original_filename: str
    file_path: str
    file_extension: str
    created_at: float


# In-memory store for temp file metadata
_temp_files: dict[str, TempFile] = {}


def ensure_temp_dir():
    """Ensure temporary directory exists."""
    temp_dir = Path(settings.TEMP_DIR)
    temp_dir.mkdir(parents=True, exist_ok=True)
    return temp_dir


def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal attacks.

    Args:
        filename: Original filename

    Returns:
        Sanitized filename
    """
    # Remove any directory components
    filename = os.path.basename(filename)

    # Remove any potentially dangerous characters
    filename = "".join(c for c in filename if c.isalnum() or c in "._- ")

    return filename[:255]  # Limit length


def validate_file_type(filename: str) -> str:
    """
    Validate file type and return extension.

    Args:
        filename: Filename to validate

    Returns:
        File extension

    Raises:
        HTTPException: If file type is not allowed
    """
    file_extension = Path(filename).suffix.lower()

    if file_extension not in settings.ALLOWED_FILE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
        )

    return file_extension


async def save_temp_file(file: UploadFile) -> TempFile:
    """
    Save uploaded file to temporary location.

    Args:
        file: Uploaded file

    Returns:
        TempFile object with file information

    Raises:
        HTTPException: If file is too large or invalid type
    """
    # Validate file type
    file_extension = validate_file_type(file.filename)

    # Generate unique file ID
    file_id = str(uuid.uuid4())

    # Sanitize filename
    safe_filename = sanitize_filename(file.filename)

    # Ensure temp directory exists
    temp_dir = ensure_temp_dir()

    # Create file path with unique ID
    file_path = temp_dir / f"{file_id}{file_extension}"

    # Save file with size checking
    total_size = 0
    async with aiofiles.open(file_path, 'wb') as f:
        while chunk := await file.read(8192):  # 8KB chunks
            total_size += len(chunk)

            if total_size > settings.MAX_FILE_SIZE:
                # Clean up partial file
                await f.close()
                os.unlink(file_path)
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / (1024 * 1024):.1f}MB"
                )

            await f.write(chunk)

    # Create temp file object
    temp_file = TempFile(
        file_id=file_id,
        original_filename=safe_filename,
        file_path=str(file_path),
        file_extension=file_extension,
        created_at=time.time()
    )

    # Store metadata
    _temp_files[file_id] = temp_file

    return temp_file


async def cleanup_file(file_id: str) -> bool:
    """
    Delete temporary file.

    Args:
        file_id: File ID to delete

    Returns:
        True if file was deleted, False if not found
    """
    temp_file = _temp_files.pop(file_id, None)

    if temp_file and os.path.exists(temp_file.file_path):
        try:
            os.unlink(temp_file.file_path)
            return True
        except Exception as e:
            print(f"Error deleting file {temp_file.file_path}: {e}")
            return False

    return False


async def cleanup_old_files():
    """
    Background task to clean up old temporary files.

    Removes files older than TEMP_FILE_TTL seconds.
    """
    current_time = time.time()
    expired_files = []

    # Find expired files
    for file_id, temp_file in _temp_files.items():
        age = current_time - temp_file.created_at
        if age > settings.TEMP_FILE_TTL:
            expired_files.append(file_id)

    # Delete expired files
    for file_id in expired_files:
        await cleanup_file(file_id)

    print(f"Cleaned up {len(expired_files)} expired temporary files")


def get_temp_file(file_id: str) -> Optional[TempFile]:
    """
    Get temporary file metadata.

    Args:
        file_id: File ID to retrieve

    Returns:
        TempFile object or None if not found
    """
    return _temp_files.get(file_id)
