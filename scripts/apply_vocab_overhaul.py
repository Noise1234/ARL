import json

# 1. Update data/en/vocab_b1.json
with open('/root/ARL/scripts/b1_sentences_dict.json') as f:
    b1_dict = json.load(f)

with open('/root/ARL/data/en/vocab_b1.json') as f:
    b1_vocab = json.load(f)

b1_updated = 0
for item in b1_vocab:
    w = item.get('word')
    if w in b1_dict:
        en, mn, de = b1_dict[w]
        item['example_en'] = en
        item['example_mn'] = mn
        item['example_de'] = de
        b1_updated += 1

with open('/root/ARL/data/en/vocab_b1.json', 'w') as f:
    json.dump(b1_vocab, f, indent=2, ensure_ascii=False)
print(f"Updated {b1_updated} entries in data/en/vocab_b1.json")

# 2. Update data/en/vocab_b2.json
with open('/root/ARL/scripts/b2_sentences_dict.json') as f:
    b2_dict = json.load(f)

with open('/root/ARL/data/en/vocab_b2.json') as f:
    b2_vocab = json.load(f)

b2_updated = 0
for item in b2_vocab:
    w = item.get('word')
    if w in b2_dict:
        en, mn, de = b2_dict[w]
        item['example_en'] = en
        item['example_mn'] = mn
        item['example_de'] = de
        b2_updated += 1

    # Exact required translation overrides
    if w == 'tide pool':
        item['mn'] = "Далайн түрлэгийн цөөрөм (эрэг орчмын хадны тогтоол ус)"
        item['prompt_front'] = "_____ (Далайн түрлэгийн цөөрөм (эрэг орчмын хадны тогтоол ус))"
    elif w == 'inhibitions':
        item['mn'] = "Дотоод биеэ барилт, сэтгэл зүйн хориг"
        item['prompt_front'] = "_____ (Дотоод биеэ барилт, сэтгэл зүйн хориг)"
    elif w == 'protectionism':
        item['mn'] = "Протекционизм (дотоодын үйлдвэрлэлийг хамгаалах бодлого)"
        item['prompt_front'] = "_____ (Протекционизм (дотоодын үйлдвэрлэлийг хамгаалах бодлого))"
    elif w == 'sensationalism':
        item['mn'] = "Сенсаци хөөцөлдөх, дуулиан дэгдээх хандлага"
        item['prompt_front'] = "_____ (Сенсаци хөөцөлдөх, дуулиан дэгдээх хандлага)"
    elif w == 'theocracy':
        item['mn'] = "Теократ засаглал (шашны тэргүүний засаглал)"
        item['prompt_front'] = "_____ (Теократ засаглал (шашны тэргүүний засаглал))"

with open('/root/ARL/data/en/vocab_b2.json', 'w') as f:
    json.dump(b2_vocab, f, indent=2, ensure_ascii=False)
print(f"Updated {b2_updated} entries in data/en/vocab_b2.json")
