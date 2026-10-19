import json
import os
import subprocess
import sys

# Run the 5 module generation scripts
scripts = [
    "/root/arl/scripts/gen_modules_01_02.py",
    "/root/arl/scripts/gen_modules_03_04.py",
    "/root/arl/scripts/gen_modules_05_06.py",
    "/root/arl/scripts/gen_modules_07_08.py",
    "/root/arl/scripts/gen_modules_09_10.py"
]

for script in scripts:
    res = subprocess.run([sys.executable, script], capture_output=True, text=True)
    if res.returncode != 0:
        print(f"Error in {script}: {res.stderr}")
        sys.exit(1)
    print(res.stdout.strip())

# Compile all modules into /root/arl/data/b1_words.json
modules_dir = "/root/arl/data/modules"
all_words = []

for i in range(1, 11):
    filename = f"module_{i:02d}.json"
    filepath = os.path.join(modules_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        items = json.load(f)
        print(f"Loaded {filename}: {len(items)} items")
        all_words.extend(items)

print(f"Total compiled words: {len(all_words)}")

# Verification
forbidden_a1 = {"sein", "haben", "werden", "ich", "du", "er", "sie", "es", "der", "die", "das", "und", "oder", "aber", "wir", "ihr"}

errors = []
words_seen = {}

for idx, item in enumerate(all_words):
    w = item.get("word")
    pos = item.get("pos")
    article = item.get("article")
    plural = item.get("plural")
    mn = item.get("mn")
    ex_de = item.get("example_de")
    ex_mn = item.get("example_mn")

    if w.lower() in forbidden_a1 and pos != "noun":
        errors.append(f"Forbidden A1 stopword found at {idx+1}: {w}")

    if pos == "noun":
        if not article or article not in ["der", "die", "das"]:
            errors.append(f"Noun without valid article at {idx+1}: {w} (article={article})")
        if not plural:
            errors.append(f"Noun without plural at {idx+1}: {w}")

    if not mn or len(mn.strip()) == 0:
        errors.append(f"Empty Mongolian translation at {idx+1}: {w}")

    if not ex_de or not ex_mn:
        errors.append(f"Missing example at {idx+1}: {w}")

    # Track duplicates within dataset
    key = (w.lower(), pos)
    if key in words_seen:
        words_seen[key].append(idx+1)
    else:
        words_seen[key] = [idx+1]

duplicates = {k: v for k, v in words_seen.items() if len(v) > 1}
if duplicates:
    print(f"Notice: {len(duplicates)} words appear in multiple contexts/modules:")
    for k, v in list(duplicates.items())[:10]:
        print(f"  - {k}: indices {v}")

if errors:
    print(f"VERIFICATION FAILED with {len(errors)} errors:")
    for e in errors[:10]:
        print(f"  - {e}")
    sys.exit(1)

# Write master b1_words.json
master_path = "/root/arl/data/b1_words.json"
with open(master_path, "w", encoding="utf-8") as f:
    json.dump(all_words, f, ensure_ascii=False, indent=2)

print(f"VERIFICATION PASSED! Exactly {len(all_words)} B1 words written to {master_path}.")
