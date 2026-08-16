#!/usr/bin/env python3
"""Translate Kynseed wiki locale JSON files from EN to target languages - chunked approach."""

import json
import sys
import time
import subprocess
from pathlib import Path

# API configuration - use deepseek-v4-pro for locale translation
API_BASE = "https://opencode.ai/zen/go/v1"
API_KEY = "sk-LPTFzOnAitZ4enGH4b4RpONUELP97Q7KZMUnLz5s1jQqYjyz0NhAutgyVeTcQDLP"
MODEL = "deepseek-v4-pro"
PROJECT_ROOT = Path("/Users/jinwei/Desktop/code/kynseed-wiki")

MAX_RETRIES = 3
RETRY_DELAY_BASE = 15
CHUNK_SIZE = 50  # Translate 50 keys at a time

LANGUAGES = {
    "de": "German",
    "ja": "Japanese",
    "ko": "Korean"
}


def call_llm(system_prompt, user_content, temperature=0.3, max_tokens=16000):
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content}
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
        "thinking": {"type": "disabled"}
    }
    payload_json = json.dumps(payload, ensure_ascii=False)

    for attempt in range(MAX_RETRIES):
        try:
            r = subprocess.run(
                [
                    "curl", "-s", "-X", "POST",
                    f"{API_BASE}/chat/completions",
                    "-H", "Content-Type: application/json",
                    "-H", f"Authorization: Bearer {API_KEY}",
                    "-d", payload_json,
                    "--max-time", "300"
                ],
                capture_output=True, text=True, timeout=320
            )
            if r.returncode != 0 or not r.stdout:
                raise RuntimeError(f"curl rc={r.returncode}")
            data = json.loads(r.stdout)
            content = data["choices"][0]["message"]["content"]
            if not content:
                raise RuntimeError("empty content")
            return content
        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                delay = min(RETRY_DELAY_BASE * (2 ** attempt), 120)
                print(f"    Retry {attempt+1}: {e}, waiting {delay}s...")
                time.sleep(delay)
            else:
                raise


def clean_json_output(text):
    """Clean LLM output to get valid JSON."""
    if not text:
        return text

    # Remove code block wrappers
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]

    return text.strip()


def translate_chunk(chunk, lang_code, lang_name):
    """Translate a single chunk of JSON entries."""
    system_prompt = f"""You are a professional translator for game wiki localization.
Translate the following English JSON entries to {lang_name} ({lang_code}).
IMPORTANT RULES:
- Translate ALL string VALUES to {lang_name}. Keep all keys EXACTLY the same.
- Preserve the JSON structure (commas between entries, proper brackets).
- For game terms like "Kynseed", "PixelCount Studios", "Thornborough": transliterate or keep as-is.
- For empty strings: translate to appropriate {lang_name} phrase.
- Output ONLY valid JSON, no explanations or code blocks.
- Keep proper JSON formatting with indentation."""


    chunk_json = json.dumps(chunk, ensure_ascii=False, indent=2)

    try:
        translated = call_llm(system_prompt, chunk_json)
        cleaned = clean_json_output(translated)
        translated_chunk = json.loads(cleaned)
        return translated_chunk
    except json.JSONDecodeError as e:
        # Try to fix common issues
        print(f"    [WARN] JSON parse error: {e}")
        # Try to fix the JSON
        lines = cleaned.split('\n')
        fixed_lines = []
        for line in lines:
            # Escape unescaped quotes inside strings
            # This is a simple heuristic
            fixed_lines.append(line)
        cleaned_fixed = '\n'.join(fixed_lines)
        try:
            return json.loads(cleaned_fixed)
        except:
            raise


def translate_locale_chunked(source_path, output_path, lang_code, lang_name):
    """Translate a locale JSON file in chunks."""
    print(f"\nTranslating to {lang_name} ({lang_code})...")

    # Read source file
    with open(source_path, "r") as f:
        source_json = json.load(f)

    keys = list(source_json.keys())
    total_keys = len(keys)
    translated = {}

    for i in range(0, total_keys, CHUNK_SIZE):
        chunk_keys = keys[i:i + CHUNK_SIZE]
        chunk = {k: source_json[k] for k in chunk_keys}

        print(f"  Translating keys {i+1}-{min(i+CHUNK_SIZE, total_keys)}/{total_keys}...", end="", flush=True)

        try:
            translated_chunk = translate_chunk(chunk, lang_code, lang_name)

            # Validate chunk
            for key in chunk_keys:
                if key in translated_chunk:
                    translated[key] = translated_chunk[key]
                else:
                    print(f"\n    [WARN] Missing key: {key}, using source")
                    translated[key] = source_json[key]

            print(f" OK")

        except Exception as e:
            print(f" FAILED: {e}")
            # Fall back to source for this chunk
            for key in chunk_keys:
                translated[key] = source_json[key]

        # Rate limiting
        time.sleep(1)

    # Write output
    with open(output_path, "w") as f:
        json.dump(translated, f, ensure_ascii=False, indent=2)

    # Get file size
    size = output_path.stat().st_size
    print(f"  [OK] Written to {output_path.name} ({size:,} bytes)")

    # Check for untranslated keys
    untranslated = [k for k, v in translated.items() if v == source_json.get(k)]
    if untranslated:
        print(f"  [WARN] {len(untranslated)} keys may be untranslated (same as source)")

    return True


def main():
    source_path = PROJECT_ROOT / "src" / "locales" / "en.json"

    if not source_path.exists():
        print(f"Error: Source file not found: {source_path}")
        sys.exit(1)

    print(f"Source file: {source_path}")
    print(f"Source size: {source_path.stat().st_size:,} bytes")

    # Read and count keys
    with open(source_path, "r") as f:
        source_json = json.load(f)
    print(f"Total keys: {len(source_json)}")

    success_count = 0
    failed = []

    for lang_code, lang_name in LANGUAGES.items():
        output_path = PROJECT_ROOT / "src" / "locales" / f"{lang_code}.json"

        if translate_locale_chunked(source_path, output_path, lang_code, lang_name):
            success_count += 1
        else:
            failed.append(lang_code)

    print(f"\n{'='*50}")
    print(f"Completed: {success_count}/{len(LANGUAGES)} succeeded")

    if failed:
        print(f"Failed: {failed}")
    else:
        print("All translations completed successfully!")


if __name__ == "__main__":
    main()
