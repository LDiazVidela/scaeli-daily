#!/usr/bin/env python3
# Lee uno o más JSON {"text_entries":[{id,title_es,title_la,content_es,content_la}]}
# y genera data/oraciones_mas.js. Los párrafos se separan con una línea en blanco.
# Uso: python3 herramientas/texto_extra.py entradas1.json [entradas2.json ...]
import json, sys, pathlib

salida = pathlib.Path(__file__).resolve().parent.parent / "data" / "oraciones_mas.js"

def parrafos(s):
    return [p.strip() for p in s.replace("\r", "").split("\n\n") if p.strip()]

data = []
for ruta in sys.argv[1:]:
    j = json.loads(pathlib.Path(ruta).read_text(encoding="utf-8"))
    for e in j.get("text_entries", []):
        if e["content_es"].startswith("["): continue  # plantilla sin completar
        data.append({
            "id": e.get("id", ""),
            "n": e["title_es"].strip(),
            "la": e.get("title_la", "").strip(),
            "es": parrafos(e["content_es"]),
            "lat": parrafos(e.get("content_la", "")),
        })

salida.write_text(
    "// Generado por herramientas/texto_extra.py desde herramientas/textos/*.json — no editar a mano.\n"
    "export const ORACIONES_MAS=" + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n",
    encoding="utf-8",
)
print(f"ok: {len(data)} entradas -> {salida.name}")
