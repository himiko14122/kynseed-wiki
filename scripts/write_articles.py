#!/usr/bin/env python3
"""Direct article writer for Kynseed wiki."""

import json
import requests
import sys
import time
from pathlib import Path

API_BASE = "https://opencode.ai/zen/go/v1"
API_KEY = "sk-LPTFzOnAitZ4enGH4b4RpONUELP97Q7KZMUnLz5s1jQqYjyz0NhAutgyVeTcQDLP"
MODEL = "deepseek-v4-flash"
PROJECT_ROOT = Path("/Users/jinwei/Desktop/code/kynseed-wiki")
KEYWORDS_JSON = PROJECT_ROOT / "keywords.json"

ARTICLES = [
    # dungeons
    {"slug": "dungeon-guide", "category": "dungeons", "title": "Kynseed Dungeon Guide: Master Cave Exploration", "description": "Complete dungeon guide for Kynseed. Learn cave exploration, treasure hunting, and survival tips for abandoned mines.", "keywords": ["Kynseed dungeon guide", "Kynseed dungeons", "Kynseed dungeon exploration", "Kynseed dungeon tips", "Kynseed dungeon strategy"]},
    {"slug": "chest-locations", "category": "dungeons", "title": "Kynseed Chest Locations: Find All Treasure Chests", "description": "Complete guide to all Kynseed chest locations in dungeons and caves. Find rare loot and hidden treasures.", "keywords": ["Kynseed chest locations", "Kynseed treasure chests", "Kynseed dungeon loot", "Kynseed treasure hunting"]},
    {"slug": "ruins-guide", "category": "dungeons", "title": "Kynseed Ruins Guide: Explore Ancient Structures", "description": "Navigate Kynseed's ancient ruins safely. Tips for exploration, avoiding traps, and maximizing loot.", "keywords": ["Kynseed ruins guide", "Kynseed ancient ruins", "Kynseed ruins exploration", "Kynseed ruins secrets"]},
    {"slug": "safe-zones", "category": "dungeons", "title": "Kynseed Safe Zones: Rest Spots Guide", "description": "Find safe zones within Kynseed dungeons and caves. Know where to rest, save, and recover health.", "keywords": ["Kynseed safe zones", "Kynseed rest spots", "Kynseed dungeon safe areas"]},
    {"slug": "regions-guide", "category": "dungeons", "title": "Kynseed Dungeon Regions: Complete Region Guide", "description": "Explore every Kynseed dungeon region with difficulty ratings, recommended gear, and unique loot drops.", "keywords": ["Kynseed dungeon regions", "Kynseed cave regions", "Kynseed dungeon areas"]},
    {"slug": "gear-check", "category": "dungeons", "title": "Kynseed Dungeon Gear Checklist", "description": "Essential gear checklist for Kynseed dungeon exploration. Weapons, armor, potions, and tools needed.", "keywords": ["Kynseed gear check", "Kynseed dungeon equipment", "Kynseed best gear", "Kynseed dungeon preparation"]},
    # guides
    {"slug": "gameplay-basics", "category": "guides", "title": "Kynseed Gameplay Basics: Controls Guide", "description": "Learn Kynseed gameplay basics including controls, core mechanics, and essential systems for new players.", "keywords": ["Kynseed gameplay basics", "Kynseed controls", "Kynseed mechanics"]},
    {"slug": "save-guide", "category": "guides", "title": "Kynseed Save Guide: How to Save Progress", "description": "Master Kynseed save mechanics. Learn when and how to save, auto-save timing, and prevent progress loss.", "keywords": ["Kynseed save guide", "Kynseed save system", "Kynseed save game"]},
    {"slug": "side-quest-guide", "category": "guides", "title": "Kynseed Side Quest Guide: All Side Quests", "description": "Complete Kynseed side quest guide with requirements and rewards. Maximize your progression.", "keywords": ["Kynseed side quest guide", "Kynseed side quests", "Kynseed quests"]},
    {"slug": "complete-guide", "category": "guides", "title": "Kynseed Complete Guide: Full Walkthrough", "description": "Complete Kynseed walkthrough covering all major content. From start to finish with every solution.", "keywords": ["Kynseed complete guide", "Kynseed walkthrough", "Kynseed full guide"]},
    {"slug": "what-to-do-first", "category": "guides", "title": "Kynseed: What to Do First - Early Game Guide", "description": "Prioritize your Kynseed early game activities. What to focus on first and maximize early progress.", "keywords": ["Kynseed what to do first", "Kynseed early game", "Kynseed beginner tips"]},
    {"slug": "tips-and-tricks", "category": "guides", "title": "Kynseed Tips and Tricks: Pro Strategies", "description": "Master Kynseed with advanced tips and tricks. Pro player strategies for farming, combat, and wealth.", "keywords": ["Kynseed tips and tricks", "Kynseed pro tips", "Kynseed advanced strategies"]},
    # updates
    {"slug": "added-content", "category": "updates", "title": "Kynseed New Content: Updates and Features", "description": "Discover all new Kynseed content through updates. Complete changelog of features and additions.", "keywords": ["Kynseed new content", "Kynseed updates", "Kynseed patches", "Kynseed new features"]},
    {"slug": "roadmap", "category": "updates", "title": "Kynseed Roadmap: Future Plans", "description": "Kynseed development roadmap and future plans. What developers have planned and upcoming features.", "keywords": ["Kynseed roadmap", "Kynseed future updates", "Kynseed development plans"]},
    {"slug": "dev-updates", "category": "updates", "title": "Kynseed Developer Updates: Community News", "description": "Stay updated with Kynseed developer news. Community letters and official announcements.", "keywords": ["Kynseed developer updates", "Kynseed dev news", "Kynseed announcements"]},
    {"slug": "quality-of-life", "category": "updates", "title": "Kynseed Quality of Life: Improvements", "description": "Kynseed quality of life improvements. UI enhancements and gameplay refinements.", "keywords": ["Kynseed quality of life", "Kynseed QoL", "Kynseed improvements"]},
    # lore
    {"slug": "lore-guide", "category": "lore", "title": "Kynseed Lore Guide: Story and World", "description": "Dive deep into Kynseed lore. Understand world-building, mythology, and narrative elements.", "keywords": ["Kynseed lore guide", "Kynseed story", "Kynseed mythology", "Kynseed world lore"]},
    {"slug": "creatures-guide", "category": "lore", "title": "Kynseed Creatures Guide: Bestiary", "description": "Discover all mystical creatures in Kynseed. Bestiary of monsters and wildlife.", "keywords": ["Kynseed creatures guide", "Kynseed monsters", "Kynseed mystical creatures", "Kynseed wildlife"]},
    # combat
    {"slug": "health-guide", "category": "combat", "title": "Kynseed Health Guide: HP and Damage", "description": "Understand Kynseed's health and damage systems. Learn HP mechanics and healing.", "keywords": ["Kynseed health guide", "Kynseed HP", "Kynseed damage system", "Kynseed healing"]},
    {"slug": "magic-combat", "category": "combat", "title": "Kynseed Magic Combat: Spells Guide", "description": "Master Kynseed magic combat. Learn spell combinations and arcane strategies.", "keywords": ["Kynseed magic combat", "Kynseed spells", "Kynseed magic system", "Kynseed spell casting"]},
    # relationships
    {"slug": "special-npcs", "category": "relationships", "title": "Kynseed Special NPCs: Unique Characters", "description": "Meet all special NPCs in Kynseed. Learn about unique characters and their questlines.", "keywords": ["Kynseed special NPCs", "Kynseed unique NPCs", "Kynseed important NPCs", "Kynseed named characters"]},
]

SYSTEM_PROMPT = """You are an SEO expert writing a wiki article about Kynseed game.

Write a comprehensive MDX article with:
- export const metadata = { ... } block at the start
- title: {title}
- description: {description}
- category: {category}
- keywords: {keywords}
- Body: >=1600 words, >=5 H2 sections, >=4 H3 subsections, >=3 tables, >=3 FAQ entries
- Natural American English, avoid boilerplate
- Internal links to other articles
- Bold key terms with **term**

Write ONLY the MDX content, no code blocks wrapping."""

def write_article(article):
    slug = article["slug"]
    category = article["category"]
    title = article["title"]
    description = article["description"]
    keywords = article["keywords"]

    output_dir = PROJECT_ROOT / "content" / "en" / category
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{slug.title().replace('-','')}.mdx"

    # Skip if exists
    if output_path.exists():
        print(f"SKIP: {output_path.name} exists")
        return True

    print(f"Writing: {slug}")

    user_prompt = f"""Write MDX article:

Title: {title}
Description: {description}
Category: {category}
Keywords: {', '.join(keywords)}

Game: Kynseed - a life simulation RPG by PixelCount Studios where you live multiple generations
Key features: farming, crafting, combat, relationships, dungeons, life cycle progression

Content requirements:
- >= 1600 words (body only)
- >= 5 H2 sections
- >= 4 H3 subsections
- >= 3 markdown tables
- >= 3 FAQ entries (bold questions with 40-60 word answers)
- >= 15 bold inline terms
- At least 1 internal link to related article
- At least 1 external link to authoritative source

Start with:
export const metadata = {{
    id: "{slug}",
    slug: "{slug}",
    title: "{title}",
    description: "{description}",
    keywords: {json.dumps(keywords)},
    category: "{category}",
    date: "2026-08-16",
    lastModified: "2026-08-16",
    image: "",
    video: ""
}}"""

    try:
        response = requests.post(
            f"{API_BASE}/chat/completions",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}"
            },
            json={
                "model": MODEL,
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.5,
                "max_tokens": 8000
            },
            timeout=120
        )

        if response.status_code == 200:
            data = response.json()
            content = data["choices"][0]["message"]["content"]

            # Clean up content
            if "```mdx" in content:
                content = content.split("```mdx")[1].split("```")[0]
            elif "```" in content:
                content = content.split("```")[1].split("```")[0]
            content = content.strip()

            # Write file
            output_path.write_text(content, encoding="utf-8")
            print(f"SUCCESS: {output_path.name}")
            return True
        else:
            print(f"ERROR {response.status_code}: {response.text[:200]}")
            return False

    except Exception as e:
        print(f"ERROR: {e}")
        return False

def main():
    print(f"Writing {len(ARTICLES)} articles...")
    success = 0
    for i, article in enumerate(ARTICLES):
        print(f"\n[{i+1}/{len(ARTICLES)}]")
        if write_article(article):
            success += 1
        time.sleep(2)  # Rate limiting

    print(f"\nCompleted: {success}/{len(ARTICLES)} articles")

    # Count files
    total = sum(1 for _ in (PROJECT_ROOT / "content" / "en").rglob("*.mdx"))
    print(f"Total MDX files: {total}")

if __name__ == "__main__":
    main()
