"""LLM service for PHI anonymization."""

import time
import re
from abc import ABC, abstractmethod
from typing import List, Tuple, Optional

from app.core.config import settings
from app.models.anonymize import PHIReplacement, AnonymizationResult, LLMParameters


PHI_ANONYMIZATION_PROMPT = """Role: You are a HIPAA-safe de-identification assistant. Your job is to transform the user's input medical document into a synthetic but clinically consistent version by identifying all patient-identifiable information (PHI) and replacing it with realistic random substitutes. You must preserve the original document's formatting and structure exactly (headings, lists, tables, line breaks, punctuation style, section ordering).

Goal

Given a potentially long medical document containing PHI, output:

A PHI Replacement Log (brief, structured) listing what was changed and how (without repeating the original PHI verbatim).

The De-identified Document that mirrors the original formatting but with PHI replaced by synthetic values.

Output Format (strict)

Return exactly the following two blocks in order:

BLOCK 1 — PHI REPLACEMENT LOG

Provide a concise list of replacements with categories and tokens.

Do not echo original PHI values.

Use this schema per item:

Category: (e.g., Name, DOB, MRN, Address, Phone, Email, SSN, Account #, Insurance ID, Facility, Clinician, Employer, Vehicle, URL, Device ID, Biometric, Photos, Other)

Original token: a short description like "Patient full name" or "City/state" (NOT the actual value)

Replacement: the synthetic substitute value you inserted

Consistency key: the placeholder key you used (e.g., [PATIENT_NAME], [DOB])

BLOCK 2 — DE-IDENTIFIED DOCUMENT

Output the document with the same formatting as the input.

Do not add extra commentary.

PHI Detection Requirements

Identify and replace all direct and indirect identifiers, including but not limited to:

Names (patient, family, clinicians if identifying), initials, usernames/handles

Dates (DOB, admission/discharge dates, appointment dates, procedure dates) and ages if uniquely identifying

Addresses (street, city, ZIP), geographies smaller than state (unless your policy says otherwise)

Phone/fax numbers, emails

MRN, account numbers, insurance member IDs, SSN, driver's license, passport

Facility names when they could identify the patient's location (use neutral synthetic facility)

Employer, school, sports teams, rare job titles when uniquely identifying

Vehicle identifiers, device IDs, serial numbers

URLs that contain identifiers

Free-text descriptions that uniquely identify the patient ("the mayor of…", "only neurosurgeon in…")

Any other details that could reasonably re-identify a patient when combined

When uncertain, err on the side of replacing.

Replacement Rules (must follow)
A) Preserve clinical meaning, randomize identity

Keep diagnoses, medications, labs, vitals, procedures, and clinical narrative intact.

Replace PHI with realistic substitutes that do not correspond to a real person.

Maintain internal consistency throughout the document:

The same patient name must map to the same synthetic patient name everywhere.

Same clinician name maps consistently.

Same address/city maps consistently.

Repeated identifiers (MRN, account #) must remain consistent.

B) Age/DOB logic (context-aware)

If DOB is present: replace with a new DOB that yields an age consistent with the document.

If age is present without DOB: keep age or shift slightly (±0–2 years) if needed for privacy, unless age is clinically critical; ensure internal consistency.

If the document implies infant/child/teen/adult/older adult, choose a synthetic DOB appropriate to that category:

Infant: 0–1 year

Child: 2–12

Teen: 13–17

Adult: 18–64

Older adult: 65+

Preserve relative relationships: e.g., "postpartum day 2", "3 weeks ago", "since last Tuesday" should remain coherent after date shifting.

C) Date shifting (recommended default)

Apply a consistent date shift across the entire document (e.g., shift all dates by +137 days), except DOB which should be regenerated to match age context.

Preserve day-month ordering and date format exactly (e.g., MM/DD/YYYY, DD-MMM-YYYY, etc.).

Maintain intervals between events (admission → procedure → discharge).

D) Replace with plausible synthetic values

Use realistic placeholders:

Names: common names (avoid famous people)

Addresses: plausible but fake street/city/state; avoid real full addresses; prefer generic city + state, no street unless required

Phone: use reserved fake formats (e.g., 555-01xx style) where applicable

Emails: use example.com style domains

IDs: generate consistent-looking alphanumeric strings with similar length/pattern to originals (but not reversible)

Facilities: "Riverside Medical Center", "North Valley Clinic", etc.

Clinicians: "Dr. Taylor Morgan" etc.

E) Don't leak PHI in the log

The log must never contain the original value. Only describe it ("Patient last name", "Street address", "MRN").

Formatting Preservation (critical)

Preserve all formatting: whitespace, line breaks, bullets, numbering, punctuation, casing, section headers, table layouts.

Do not reorder sections.

Do not "clean up" grammar unless it is required to prevent PHI leakage.

Long Document Handling

The input may be very long. Process it fully.

If the content includes multiple patients, keep each patient's replacements consistent within their own context and distinct from others (e.g., [PATIENT1_NAME], [PATIENT2_NAME]).

If content includes attachments, signatures, headers/footers, or metadata, de-identify those too.

Safety / Quality Checks (must do silently)

Before finalizing:

Scan output for leftover PHI patterns (names, dates, IDs, phone/email/address formats).

Verify internal consistency of replacements.

Confirm the de-identified document matches original formatting and structure.

Policy Knobs (set these defaults unless the user overrides)

Geography: remove street + ZIP; keep state; replace city with synthetic city.

Ages > 89: generalize to "90+" unless clinically necessary; keep consistency.

Clinicians/facilities: replace if they could identify the patient.

Rare events/occupations: generalize if uniquely identifying."""


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def anonymize(self, text: str, params: Optional[LLMParameters] = None) -> Tuple[str, str]:
        """
        Anonymize text using the LLM provider.

        Args:
            text: The medical document text to anonymize
            params: Optional LLM generation parameters

        Returns:
            Tuple of (raw_response, provider_name)
        """
        pass


class AnthropicProvider(LLMProvider):
    """Anthropic Claude API provider."""

    def __init__(self, api_key: str):
        import anthropic

        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-3-5-sonnet-20241022"

    async def anonymize(self, text: str, params: Optional[LLMParameters] = None) -> Tuple[str, str]:
        """Anonymize using Anthropic Claude."""
        # Get parameters with defaults
        max_tokens = params.max_tokens if params and params.max_tokens else settings.DEFAULT_MAX_TOKENS
        temperature = params.temperature if params and params.temperature is not None else settings.DEFAULT_TEMPERATURE
        top_p = params.top_p if params and params.top_p is not None else settings.DEFAULT_TOP_P
        model = params.model_name if params and params.model_name else self.model

        message = self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            system=PHI_ANONYMIZATION_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": f"<<<BEGIN DOCUMENT>>>\n{text}\n<<<END DOCUMENT>>>"
                }
            ]
        )

        response_text = message.content[0].text
        return response_text, "anthropic"


class OpenAIProvider(LLMProvider):
    """OpenAI GPT API provider."""

    def __init__(self, api_key: str):
        import openai

        self.client = openai.OpenAI(api_key=api_key)
        self.model = "gpt-4-turbo-preview"

    async def anonymize(self, text: str, params: Optional[LLMParameters] = None) -> Tuple[str, str]:
        """Anonymize using OpenAI GPT."""
        # Get parameters with defaults
        max_tokens = params.max_tokens if params and params.max_tokens else settings.DEFAULT_MAX_TOKENS
        temperature = params.temperature if params and params.temperature is not None else settings.DEFAULT_TEMPERATURE
        top_p = params.top_p if params and params.top_p is not None else settings.DEFAULT_TOP_P
        model = params.model_name if params and params.model_name else self.model

        response = self.client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": PHI_ANONYMIZATION_PROMPT},
                {
                    "role": "user",
                    "content": f"<<<BEGIN DOCUMENT>>>\n{text}\n<<<END DOCUMENT>>>"
                }
            ],
            max_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p
        )

        response_text = response.choices[0].message.content
        return response_text, "openai"


class OllamaProvider(LLMProvider):
    """Ollama local LLM provider with direct API access."""

    def __init__(self, base_url: str, model_name: str):
        self.base_url = base_url.rstrip('/')
        self.model_name = model_name

    async def anonymize(self, text: str, params: Optional[LLMParameters] = None) -> Tuple[str, str]:
        """Anonymize using Ollama."""
        import httpx

        # Get parameters with defaults
        temperature = params.temperature if params and params.temperature is not None else settings.DEFAULT_TEMPERATURE
        top_p = params.top_p if params and params.top_p is not None else settings.DEFAULT_TOP_P
        model = params.model_name if params and params.model_name else self.model_name

        # Ollama-specific options
        options = {
            "temperature": temperature,
            "top_p": top_p,
        }

        # Add context length if provided
        if params and params.context_length:
            options["num_ctx"] = params.context_length
        elif settings.DEFAULT_CONTEXT_LENGTH:
            options["num_ctx"] = settings.DEFAULT_CONTEXT_LENGTH

        # Build the prompt
        full_prompt = f"{PHI_ANONYMIZATION_PROMPT}\n\n<<<BEGIN DOCUMENT>>>\n{text}\n<<<END DOCUMENT>>>"

        # Make request to Ollama API
        async with httpx.AsyncClient(timeout=300.0) as client:
            response = await client.post(
                f"{self.base_url}/api/generate",
                json={
                    "model": model,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": options
                }
            )

            if response.status_code != 200:
                raise ValueError(f"Ollama API error: {response.status_code} - {response.text}")

            result = response.json()
            response_text = result.get("response", "")

            return response_text, "ollama"


def parse_llm_response(response: str) -> Tuple[List[PHIReplacement], str]:
    """
    Parse the LLM response to extract the replacement log and anonymized text.

    Args:
        response: Raw LLM response text

    Returns:
        Tuple of (replacement_log, anonymized_text)
    """
    replacement_log = []
    anonymized_text = ""

    # Remove any markdown formatting from the response
    clean_response = response.replace('**', '').replace('*', '')

    # Try to extract BLOCK 1 (PHI Replacement Log) and BLOCK 2 (De-identified Document)
    # Very flexible pattern to match various separators and dashes
    doc_pattern = r"(?:BLOCK\s*2|DE[-\s]*IDENTIFIED\s+DOCUMENT)[\s:—–-]*\n+([\s\S]+?)(?:\n\n---|\n\nNote:|\Z)"

    doc_match = re.search(doc_pattern, clean_response, re.IGNORECASE)

    # Extract anonymized document
    if doc_match:
        anonymized_text = doc_match.group(1).strip()
    else:
        # Fallback: try to find content after a clear separator
        parts = re.split(r"(?:BLOCK\s*2|DE[-\s]*IDENTIFIED\s+DOCUMENT)[\s:—–-]*\n+", clean_response, flags=re.IGNORECASE)
        if len(parts) > 1:
            anonymized_text = parts[-1].strip()
        else:
            anonymized_text = response  # Fallback to full response

    # Pattern to match the log section - extract everything between BLOCK 1 and BLOCK 2
    # Handle various dash types and whitespace
    log_pattern = r"(?:BLOCK\s*1|PHI\s+REPLACEMENT\s+LOG)[\s:—–-]*\n+([\s\S]*?)(?=BLOCK\s*2|DE[-\s]*IDENTIFIED\s+DOCUMENT)"
    log_match = re.search(log_pattern, clean_response, re.IGNORECASE)

    # Parse replacement log
    if log_match:
        log_text = log_match.group(1)

        # Pattern to match each replacement entry - very flexible for various formats
        # Handles both "- Category:" and "Category:" formats, with or without extra whitespace
        entry_pattern = r"[-•]?\s*Category:\s*(.+?)\s+Original\s+token:\s*(.+?)\s+Replacement:\s*(.+?)\s+Consistency\s+key:\s*(.+?)(?=\s*[-•]?\s*Category:|\Z)"

        for match in re.finditer(entry_pattern, log_text, re.DOTALL | re.IGNORECASE):
            replacement = PHIReplacement(
                category=match.group(1).strip(),
                original_token=match.group(2).strip(),
                replacement=match.group(3).strip(),
                consistency_key=match.group(4).strip()
            )
            replacement_log.append(replacement)

    return replacement_log, anonymized_text


def get_provider(provider_name: str) -> LLMProvider:
    """
    Factory function to get the appropriate LLM provider.

    Args:
        provider_name: Name of the provider (anthropic, openai, ollama)

    Returns:
        LLMProvider instance

    Raises:
        ValueError: If provider is not configured or invalid
    """
    provider_name = provider_name.lower()

    if provider_name == "anthropic":
        if not settings.ANTHROPIC_API_KEY:
            raise ValueError("Anthropic API key not configured")
        return AnthropicProvider(settings.ANTHROPIC_API_KEY)

    elif provider_name == "openai":
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")
        return OpenAIProvider(settings.OPENAI_API_KEY)

    elif provider_name in ("ollama", "local"):  # Support both names for backwards compatibility
        return OllamaProvider(settings.OLLAMA_BASE_URL, settings.OLLAMA_MODEL)

    else:
        raise ValueError(f"Invalid provider: {provider_name}")


async def anonymize_text(
    text: str,
    provider_name: str,
    params: Optional[LLMParameters] = None
) -> AnonymizationResult:
    """
    Anonymize text using the specified LLM provider.

    Args:
        text: Text to anonymize
        provider_name: LLM provider to use
        params: Optional LLM generation parameters

    Returns:
        AnonymizationResult with replacement log and anonymized text
    """
    start_time = time.time()

    provider = get_provider(provider_name)
    raw_response, used_provider = await provider.anonymize(text, params)

    replacement_log, anonymized_text = parse_llm_response(raw_response)

    processing_time = time.time() - start_time

    return AnonymizationResult(
        replacement_log=replacement_log,
        anonymized_text=anonymized_text,
        provider_used=used_provider,
        processing_time_seconds=processing_time,
        original_text=text
    )
