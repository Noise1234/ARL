import glob

for p in glob.glob("/root/arl/scripts/*.py"):
    if p.endswith("fix_quotes.py"):
        continue
    with open(p, "r", encoding="utf-8") as f:
        content = f.read()
    new_content = content.replace('"-""-e"', "'-e'").replace('"-"-e"', "'-e'").replace('"-"-er"', "'-er'")
    if new_content != content:
        with open(p, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("Updated:", p)
