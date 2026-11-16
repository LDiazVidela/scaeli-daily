// Daily 2.2.1 · genera códigos de Scaeli+ con 12 caracteres al azar: SCAELI-7KQ2-M9XA-4TPE
// Uso: node herramientas/codigo_plus.mjs [cantidad] [días] [etiqueta]
//   node herramientas/codigo_plus.mjs 1 31 "MP mensual · Juan"   → un código de 31 días, para un solo uso
// Imprime el ID del documento y los campos para crearlo en la consola de Firebase (Firestore → codes → Agregar documento).
// Sin letras que se confunden (sin 0/O, 1/I/L): 31 símbolos, 12 posiciones ≈ 7,9 × 10^17 combinaciones.
import { randomInt } from "node:crypto";
const A = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const n = Math.max(1, +(process.argv[2] || 1)), dias = +(process.argv[3] || 31), etiqueta = process.argv[4] || "";
const uno = () => { let s = ""; for (let i = 0; i < 12; i++) s += A[randomInt(A.length)]; return "SCAELI-" + s.slice(0, 4) + "-" + s.slice(4, 8) + "-" + s.slice(8); };
for (let i = 0; i < n; i++) {
  const c = uno();
  console.log(c + "\n  label (string): " + JSON.stringify(etiqueta) + "\n  days (number): " + dias + "\n  max (number): 1\n  uses (number): 0\n");
}
