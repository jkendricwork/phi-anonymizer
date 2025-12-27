"""Anonymization API endpoints."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from typing import List, Optional
import json

from app.models.anonymize import (
    AnonymizeTextRequest,
    AnonymizationResult,
    ProviderInfo,
    FileUploadResponse,
    LLMParameters
)
from app.services import llm_service
from app.services import file_handler
from app.services import document_parser
from app.core.config import settings


router = APIRouter(prefix="/anonymize", tags=["anonymize"])


@router.post("/text", response_model=AnonymizationResult)
async def anonymize_text(request: AnonymizeTextRequest):
    """
    Anonymize text directly via API.

    Args:
        request: Text, provider selection, and optional parameters

    Returns:
        Anonymization result with replacement log
    """
    try:
        result = await llm_service.anonymize_text(
            text=request.text,
            provider_name=request.provider,
            params=request.parameters
        )
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Anonymization failed: {str(e)}")


@router.post("/upload", response_model=FileUploadResponse)
async def anonymize_upload(
    file: UploadFile = File(...),
    provider: str = Form(default="anthropic"),
    parameters: Optional[str] = Form(default=None)
):
    """
    Upload and anonymize a document (.docx or .pdf).

    Args:
        file: Uploaded document file
        provider: LLM provider to use
        parameters: Optional JSON string of LLM parameters

    Returns:
        File upload response with anonymization result
    """
    temp_file = None

    try:
        # Parse parameters if provided
        params = None
        if parameters:
            try:
                params_dict = json.loads(parameters)
                params = LLMParameters(**params_dict)
            except (json.JSONDecodeError, ValueError) as e:
                raise HTTPException(status_code=400, detail=f"Invalid parameters: {str(e)}")

        # Save uploaded file
        temp_file = await file_handler.save_temp_file(file)

        # Parse document based on file type
        extracted_text, used_ocr = await document_parser.parse_document(
            file_path=temp_file.file_path,
            file_extension=temp_file.file_extension
        )

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="No text could be extracted from the document"
            )

        # Anonymize the extracted text
        result = await llm_service.anonymize_text(
            text=extracted_text,
            provider_name=provider,
            params=params
        )

        # Return response
        response = FileUploadResponse(
            filename=temp_file.original_filename,
            file_type=temp_file.file_extension,
            used_ocr=used_ocr,
            result=result
        )

        return response

    except HTTPException:
        raise

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"File processing failed: {str(e)}"
        )

    finally:
        # Clean up temporary file
        if temp_file:
            await file_handler.cleanup_file(temp_file.file_id)


@router.get("/providers", response_model=List[ProviderInfo])
async def get_providers():
    """
    Get list of available LLM providers and their configuration status.

    Returns:
        List of provider information
    """
    providers = []

    # Anthropic
    anthropic_configured = bool(settings.ANTHROPIC_API_KEY)
    providers.append(ProviderInfo(
        name="anthropic",
        configured=anthropic_configured,
        available=anthropic_configured
    ))

    # OpenAI
    openai_configured = bool(settings.OPENAI_API_KEY)
    providers.append(ProviderInfo(
        name="openai",
        configured=openai_configured,
        available=openai_configured
    ))

    # Ollama (always available if URL is set)
    ollama_available = bool(settings.OLLAMA_BASE_URL)
    providers.append(ProviderInfo(
        name="ollama",
        configured=ollama_available,
        available=ollama_available
    ))

    return providers
