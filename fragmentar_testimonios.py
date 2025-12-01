import json
from pathlib import Path

# Archivo gigante de entrada
INPUT_FILE = "cartas-esperanza.json"

# Carpeta de salida (tu estructura real)
OUTPUT_DIR = Path("public/data/es/palestine/testimonies")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Cargar JSON grande
with open(INPUT_FILE, "r", encoding="utf-8") as f:
    testimonies_big = json.load(f)

print(f"📥 Archivo cargado ({len(testimonies_big)} testimonios)")

# Crear index
index_items = []

for t in testimonies_big:
    cleaned_name = t["nombre"].replace("💚الشهيد💚", "").strip()

    index_items.append({
        "id": str(t["id"]),
        "name": cleaned_name,
        "image": t.get("image", "")
    })

with open(OUTPUT_DIR / "testimonies.index.json", "w", encoding="utf-8") as f:
    json.dump({"items": index_items}, f, ensure_ascii=False, indent=2)

print("✅ Generado testimonies.index.json")

# Crear perfiles + testimonios individuales
for t in testimonies_big:
    person_id = str(t["id"])
    cleaned_name = t["nombre"].replace("💚الشهيد💚", "").strip()

    person_dir = OUTPUT_DIR / person_id
    person_dir.mkdir(parents=True, exist_ok=True)

    profile = {
        "id": person_id,
        "name": cleaned_name,
        "bio": t.get("description", ""),
        "image": t.get("image", ""),
        "social": t.get("social", {}),
        "testimonies": []
    }

    parts = t.get("parts", [])

    for idx, part in enumerate(parts, 1):
        testimony_id = f"t{idx}"

        # Extraer primer párrafo como summary
        summary = ""
        if "content" in part and isinstance(part["content"], list):
            for p in part["content"]:
                if isinstance(p, str) and p.strip():
                    summary = p.strip()
                    break

        if len(summary) > 150:
            summary = summary[:150] + "..."

        profile["testimonies"].append({
            "id": testimony_id,
            "title": part.get("title", f"Testimonio {idx}"),
            "summary": summary,
            "date": t.get("fragmento", "")
        })

        detail = {
            "id": testimony_id,
            "title": part.get("title", f"Testimonio {idx}"),
        }

        if "content" in part:
            detail["paragraphs"] = [p for p in part["content"] if isinstance(p, str)]

        if "pages" in part:
            detail["pages"] = part["pages"]

        with open(person_dir / f"{testimony_id}.json", "w", encoding="utf-8") as f:
            json.dump(detail, f, ensure_ascii=False, indent=2)

        print(f"   └─ Creado: {person_id}/{testimony_id}.json")

    # Guardar perfil principal
    with open(OUTPUT_DIR / f"{person_id}.json", "w", encoding="utf-8") as f:
        json.dump(profile, f, ensure_ascii=False, indent=2)

    print(f"✅ Creado perfil: {person_id}.json")

print("\n🎉 Finalizado")
print(f"📁 Archivos creados en {OUTPUT_DIR}")
