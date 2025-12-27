"""Data models for anonymization API."""

from typing import List, Optional
from pydantic import BaseModel, Field


class LLMParameters(BaseModel):
    """LLM generation parameters."""

    temperature: Optional[float] = Field(default=None, ge=0.0, le=2.0, description="Sampling temperature (0.0-2.0)")
    max_tokens: Optional[int] = Field(default=None, ge=100, le=32000, description="Maximum tokens to generate")
    top_p: Optional[float] = Field(default=None, ge=0.0, le=1.0, description="Top-p sampling (0.0-1.0)")
    context_length: Optional[int] = Field(default=None, ge=512, le=128000, description="Context window size (for Ollama)")
    model_name: Optional[str] = Field(default=None, description="Specific model name (overrides default)")


class AnonymizeTextRequest(BaseModel):
    """Request model for text anonymization."""

    text: str = Field(..., description="Text content to anonymize")
    provider: str = Field(default="anthropic", description="LLM provider to use")
    parameters: Optional[LLMParameters] = Field(default=None, description="Optional LLM generation parameters")


class PHIReplacement(BaseModel):
    """PHI replacement entry in the log."""

    category: str = Field(..., description="Type of PHI (Name, DOB, MRN, etc.)")
    original_token: str = Field(..., description="Description of what was replaced (NOT the actual value)")
    replacement: str = Field(..., description="Synthetic value used as replacement")
    consistency_key: str = Field(..., description="Placeholder key used (e.g., [PATIENT_NAME])")


class AnonymizationResult(BaseModel):
    """Result of anonymization process."""

    replacement_log: List[PHIReplacement] = Field(default_factory=list, description="List of PHI replacements made")
    anonymized_text: str = Field(..., description="De-identified document text")
    provider_used: str = Field(..., description="LLM provider that processed the request")
    processing_time_seconds: float = Field(..., description="Time taken to process the request")
    original_text: Optional[str] = Field(default=None, description="Original text (optional, for display)")


class ProviderInfo(BaseModel):
    """LLM provider information."""

    name: str = Field(..., description="Provider name")
    configured: bool = Field(..., description="Whether the provider is configured with API key")
    available: bool = Field(..., description="Whether the provider is available for use")


class FileUploadResponse(BaseModel):
    """Response for file upload and anonymization."""

    filename: str = Field(..., description="Original filename")
    file_type: str = Field(..., description="Detected file type")
    used_ocr: bool = Field(default=False, description="Whether OCR was used")
    result: AnonymizationResult = Field(..., description="Anonymization result")
