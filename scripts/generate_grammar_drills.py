#!/usr/bin/env python3
"""
ARL - Grammar Drills Generator
Generates 20 high-quality, authentic practice drill sentences for every grammar topic
in data/de/grammar.json and data/en/grammar.json.
Each drill contains:
- prompt_mn: Clear Mongolian prompt sentence
- target: Accurate German or English target sentence
- literal_mn: Literal word-for-word translation in Mongolian
- natural_mn: Natural Mongolian translation
- rule_breakdown: 1-sentence pedagogical breakdown of why the grammar rule applies
- woerterbuch: Exact required words with articles (der/die/das), infinitives, and meanings
"""

import json
import os
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DE_GRAMMAR_PATH = os.path.join(BASE_DIR, 'data', 'de', 'grammar.json')
EN_GRAMMAR_PATH = os.path.join(BASE_DIR, 'data', 'en', 'grammar.json')

def build_de_drill(topic_id, idx, prompt_mn, target, literal_mn, natural_mn, rule_breakdown, woerterbuch):
    return {
        "id": f"{topic_id}_drill_{idx+1}",
        "prompt_mn": prompt_mn,
        "target": target,
        "literal_mn": literal_mn,
        "natural_mn": natural_mn,
        "rule_breakdown": rule_breakdown,
        "woerterbuch": woerterbuch
    }

def build_en_drill(topic_id, idx, prompt_mn, target, literal_mn, natural_mn, rule_breakdown, woerterbuch):
    return {
        "id": f"{topic_id}_drill_{idx+1}",
        "prompt_mn": prompt_mn,
        "target": target,
        "literal_mn": literal_mn,
        "natural_mn": natural_mn,
        "rule_breakdown": rule_breakdown,
        "woerterbuch": woerterbuch
    }

print("Loading generator helper...")
