#!/usr/bin/env bash
# Batería completa de Scaeli Daily. Uso: bash pruebas/todo.sh   (desde la raíz del repo)
# Necesita node + playwright (require('playwright') con Chromium). Las capturas quedan en pruebas/salida/ (no se suben).
set -u
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"; cd "$RAIZ"
python3 -m http.server 8765 >/dev/null 2>&1 & SRV=$!; trap 'kill $SRV 2>/dev/null' EXIT; sleep 1
mkdir -p pruebas/salida/shots19; cd pruebas/salida
FALLAS=0
for t in t11 t13 t14 t15 t16 t17 t18 t19 t20 t21 t22 t23 t24 t25 t26 t27; do
  OUT=$(node "../$t.js" 2>&1 | grep -v "Failed to load resource\|^S[0-9]*$\|^novenas mes\|^HOY")
  echo "$OUT" | tail -3
  # una prueba está verde solo si su línea final dice «Txx OK» (o SANTORAL/TODO/NOVENAS OK en t11)
  echo "$OUT" | grep -qE "^(T[0-9a-z]+|SANTORAL|TODO|NOVENAS) [^O]|FALLA|PAGEERROR|Error:" && FALLAS=$((FALLAS+1))
done
echo "— barrido estético (360/390, oscuro y claro) —"; B=$(node ../barrido.js barrido 2>&1 | tail -30); echo "$B" | tail -5; echo "$B" | grep -q "BARRIDO OK" || FALLAS=$((FALLAS+1))
echo; [ $FALLAS -eq 0 ] && echo "TODO VERDE" || echo "HAY $FALLAS PRUEBAS CON FALLAS"
