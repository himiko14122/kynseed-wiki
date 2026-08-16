#!/usr/bin/env python3
"""Translate Kynseed wiki MDX files from EN to KO."""

import json
import re
import sys
import os
import time
import subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# API configuration
API_BASE = "https://opencode.ai/zen/go/v1"
API_KEY = "sk-LPTFzOnAitZ4enGH4b4RpONUELP97Q7KZMUnLz5s1jQqYjyz0NhAutgyVeTcQDLP"
MODEL = "deepseek-v4-flash"
PROJECT_ROOT = Path("/Users/jinwei/Desktop/code/kynseed-wiki")

MAX_RETRIES = 3
RETRY_DELAY_BASE = 15
MAX_CONTINUATION_ROUNDS = 2
MIN_WORD_RATIO = 0.75

SYSTEM_PROMPT = """You are a professional translator specializing in game wiki localization.
Translate the following MDX content to Korean (ko).
IMPORTANT RULES:
- You MUST translate EVERY sentence to Korean. Do NOT leave any English sentences untranslated.
- Translate all text content naturally and fluently to Korean.
- Keep all Markdown formatting unchanged (##, ###, -, **, [], tables, etc.)
- Keep all HTML tags unchanged
- Keep all URLs unchanged
- CRITICAL: MDX internal link paths `/en/{category}/{slug}/` must be kept BYTE-IDENTICAL
- Keep article structure and length consistent
- CRITICAL: PRESERVE SOURCE PARAGRAPH STRUCTURE — every source paragraph MUST be translated as exactly ONE paragraph in Korean.
- Translate metadata title, description, keywords, and summary to Korean
- Keep other metadata fields unchanged (id, slug, order, category, date, lastModified, image, video, etc.)
- Output only the translated MDX content, no extra text
- Start directly with `export const metadata = {` — do NOT use YAML frontmatter (---)
- Do NOT wrap output in code blocks
- FAQ section title MUST be "자주 묻는 질문" in Korean
- EVERY FAQ question MUST keep its full answer below it (40-60 words each)
- Output must be at least 80% of the source word count
- Do NOT add any extra explanations, examples, or non-original information
- Use the full-width tilde "～" (U+FF5E) for numeric ranges, NOT ASCII "~" """


def _extract_body(text):
    return re.sub(r'export\s+const\s+metadata\s*=\s*\{.+?\}', '', text, flags=re.DOTALL).strip()


def _count_words(text):
    """CJK-aware word counter."""
    cjk = len(re.findall(r'[぀-ヿ㐀-鿿가-힯豈-﫿]', text))
    latin = len(re.findall(r'[A-Za-z0-9]+', text))
    return cjk + latin


def _count_headings(text, level):
    prefix = "#" * level
    return len(re.findall(f'^{prefix} ', text, re.MULTILINE))


def _count_faq_items(text):
    body = _extract_body(text)
    return len(re.findall(r'\*\*[^*]{2,}[\?？]\*\*', body))


def validate_translation(source_text, translated_text):
    src_body = _extract_body(source_text)
    tgt_body = _extract_body(translated_text)
    src_words = _count_words(src_body)
    tgt_words = _count_words(tgt_body)
    ratio = tgt_words / src_words if src_words > 0 else 1.0

    src_h2 = _count_headings(source_text, 2)
    tgt_h2 = _count_headings(translated_text, 2)
    src_h3 = _count_headings(source_text, 3)
    tgt_h3 = _count_headings(translated_text, 3)
    src_faq = _count_faq_items(source_text)
    tgt_faq = _count_faq_items(translated_text)

    is_valid = ratio >= MIN_WORD_RATIO and tgt_h2 >= src_h2 and tgt_h3 >= src_h3 and tgt_faq >= src_faq

    return is_valid, {
        "ratio": ratio,
        "src_h2": src_h2, "tgt_h2": tgt_h2,
        "src_h3": src_h3, "tgt_h3": tgt_h3,
        "src_faq": src_faq, "tgt_faq": tgt_faq,
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


def strip_thinking_tags(text):
    """Remove any thinking/reasoning tags from output."""
    if not text:
        return text

    # Remove content before export const metadata
    text = text.lstrip()
    metadata_match = re.search(r"export const metadata\s*=", text)
    if metadata_match and metadata_match.start() > 0:
        text = text[metadata_match.start():]

    # Remove code block wrappers
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text[:-3]

    # Normalize whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def escape_unsafe_chars(text):
    """Re-escape raw < characters outside allowed tags."""
    allowed_tags = {'a', 'abbr', 'b', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                    'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 'span', 'strong', 'sub', 'sup',
                    'table', 'tbody', 'td', 'th', 'thead', 'tr', 'ul', 'video',
                    'details', 'summary', 'blockquote', 'dd', 'dl', 'dt', 'figure', 'figcaption', 'mark', 'small'}

    tag_re = re.compile(r'<(/?)([A-Za-z][A-Za-z0-9\-_]*)(\s[^>]*)?>', flags=re.MULTILINE)
    allowed_positions = set()
    for match in tag_re.finditer(text):
        if match.group(2) in allowed_tags:
            allowed_positions.add((match.start(), match.end()))

    unsafe = []
    pos = 0
    while True:
        idx = text.find('<', pos)
        if idx == -1:
            break
        if not any(start <= idx < end for start, end in allowed_positions):
            unsafe.append(idx)
        pos = idx + 1

    for idx in reversed(unsafe):
        text = text[:idx] + '&lt;' + text[idx + 1:]
    return text


def translate_mdx(input_path, output_path, silent=False):
    """Translate a single MDX file."""
    with open(input_path, "r") as f:
        content = f.read()

    filename = Path(input_path).name
    if not silent:
        print(f"  Translating: {filename}")

    try:
        translated = call_llm(SYSTEM_PROMPT, content)
        cleaned = strip_thinking_tags(translated)
        cleaned = escape_unsafe_chars(cleaned)

        is_valid, details = validate_translation(content, cleaned)

        if not is_valid:
            print(f"    [INCOMPLETE] ratio={details['ratio']:.0%} H2={details['tgt_h2']}/{details['src_h2']} H3={details['tgt_h3']}/{details['src_h3']} FAQ={details['tgt_faq']}/{details['src_faq']}")

        # Write the translation
        with open(output_path, "w") as f:
            f.write(cleaned)

        return True

    except Exception as e:
        print(f"    [ERROR] {e}")
        return False


def get_all_en_files():
    """Get all EN MDX files."""
    en_dir = PROJECT_ROOT / "content" / "en"
    files = []
    for mdx_file in sorted(en_dir.rglob("*.mdx")):
        rel = mdx_file.relative_to(en_dir)
        ko_path = PROJECT_ROOT / "content" / "ko" / rel
        ko_path.parent.mkdir(parents=True, exist_ok=True)
        if not ko_path.exists() or ko_path.stat().st_size < 200:
            files.append((str(mdx_file), str(ko_path)))
    return files


def main():
    files = get_all_en_files()

    if not files:
        print("No files to translate")
        return

    print(f"Found {len(files)} files to translate")
    print()

    success = 0
    failed = []

    # Process with concurrency of 3
    def process_file(task):
        src, dst = task
        filename = Path(src).name
        print(f"  Starting: {filename}")
        try:
            result = translate_mdx(src, dst, silent=True)
            return result, src, dst
        except Exception as e:
            print(f"    [ERROR] {e}")
            return False, src, dst

    with ThreadPoolExecutor(max_workers=3) as pool:
        futures = []
        for i, (src, dst) in enumerate(files):
            print(f"[{i+1}/{len(files)}] ", end="")
            future = pool.submit(process_file, (src, dst))
            futures.append(future)
            time.sleep(1)  # Rate limiting between submissions

        for i, future in enumerate(as_completed(futures)):
            ok, src, dst = future.result()
            if ok:
                success += 1
                print(f"[{i+1}/{len(files)}] OK: {Path(src).name}")
            else:
                failed.append((src, dst))
                print(f"[{i+1}/{len(files)}] FAILED: {Path(src).name}")

    print()
    print(f"Completed: {success}/{len(files)} succeeded")

    if failed:
        print(f"Failed ({len(failed)}):")
        for src, dst in failed:
            print(f"  - {Path(src).name}")


if __name__ == "__main__":
    main()
