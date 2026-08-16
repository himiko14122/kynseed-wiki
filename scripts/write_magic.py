#!/usr/bin/env python3
import json
import requests
from pathlib import Path

API = 'https://opencode.ai/zen/go/v1'
KEY = 'sk-LPTFzOnAitZ4enGH4b4RpONUELP97Q7KZMUnLz5s1jQqYjyz0NhAutgyVeTcQDLP'

slug = 'magic-combat'
cat = 'combat'
title = 'Kynseed Magic Combat: Spells Guide'
desc = 'Master Kynseed magic combat. Learn spell combinations, mana management, and arcane strategies for magical battles.'
kws = ['Kynseed magic combat', 'Kynseed spells', 'Kynseed magic system', 'Kynseed elemental magic', 'Kynseed spell casting']

output = Path(f'/Users/jinwei/Desktop/code/kynseed-wiki/content/en/{cat}/Magic-Combat.mdx')

prompt = f'''Write a complete MDX article about Kynseed magic combat system.

Include this metadata block at start:
export const metadata = {{
    id: "{slug}",
    slug: "{slug}",
    title: "{title}",
    description: "{desc}",
    keywords: {json.dumps(kws)},
    category: "{cat}",
    date: "2026-08-16",
    lastModified: "2026-08-16",
    image: "",
    video: ""
}}

Then write article body with:
- >=1600 words
- >=5 H2 sections
- >=4 H3 subsections
- >=3 markdown tables
- >=3 FAQ with bold questions and 40-60 word answers
- >=15 bold inline terms
- Internal links to other articles
- External links to authoritative sources

Topic: Kynseed magic combat, spells, mana system, elemental magic, spell combinations, arcane strategies, magical gear.

Write ONLY the MDX content, no markdown code blocks wrapping.'''

try:
    resp = requests.post(f'{API}/chat/completions',
        headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'},
        json={'model': 'deepseek-v4-flash', 'messages': [{'role': 'user', 'content': prompt}],
              'temperature': 0.5, 'max_tokens': 8000}, timeout=120)

    if resp.status_code == 200:
        data = resp.json()
        text = data['choices'][0]['message']['content']

        # Clean markdown code blocks
        text = text.strip()
        if text.startswith('```'):
            lines = text.split('\n')
            in_block = False
            new_lines = []
            for line in lines:
                if line.strip().startswith('```'):
                    in_block = not in_block
                    continue
                if in_block or not line.strip().startswith('```'):
                    new_lines.append(line)
            text = '\n'.join(new_lines).strip()

        output.write_text(text)
        print(f'OK: Magic-Combat.mdx ({len(text)} chars)')
    else:
        print(f'Error: {resp.status_code} - {resp.text[:200]}')
except Exception as e:
    print(f'Error: {e}')
