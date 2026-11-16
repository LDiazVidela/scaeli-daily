// Prueba de firestore.rules (Daily 2.2.3) con el emulador de Firestore: privacidad de grupos y códigos.
// Una vez: cd pruebas/reglas && npm install  ·  Correr: npm test (necesita Java)
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, getDocs, collection, deleteDoc, updateDoc, increment, query, where } from "firebase/firestore";
import { readFileSync } from "node:fs";
const env = await initializeTestEnvironment({ projectId: "demo-scaeli", firestore: { rules: readFileSync(new URL("../../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8089 } });
const fails = []; const t = async (nombre, p) => { try { await p; console.log("  ok " + nombre); } catch (e) { fails.push(nombre); console.log("  XX " + nombre + " · " + (e.message || e)); } };
// datos: el grupo G1 de Ana (creadora) con Beto como miembro; Caro no es miembro; un código de Scaeli+
await env.withSecurityRulesDisabled(async (c) => { const db = c.firestore();
  await setDoc(doc(db, "grupos/G1"), { n: "Parroquia", creador: "ana", t: 1 });
  await setDoc(doc(db, "grupos/G1/miembros/ana"), { n: "Ana", int: "por mi abuela" });
  await setDoc(doc(db, "grupos/G1/miembros/beto"), { n: "Beto" });
  await setDoc(doc(db, "grupos/G2"), { n: "Otro grupo", creador: "dani", t: 1 });
  await setDoc(doc(db, "codes/SCAELI-7KQ2-M9XA-4TPE"), { days: 31, max: 1, uses: 0, label: "x" }); });
const ana = env.authenticatedContext("ana").firestore(), beto = env.authenticatedContext("beto").firestore(), caro = env.authenticatedContext("caro").firestore(), anon = env.unauthenticatedContext().firestore();

console.log("— grupos —");
await t("un no miembro puede abrir un grupo si conoce su código (get)", assertSucceeds(getDoc(doc(caro, "grupos/G1"))));
await t("nadie puede listar los grupos", assertFails(getDocs(collection(caro, "grupos"))));
await t("ni siquiera un miembro puede listar los grupos", assertFails(getDocs(collection(ana, "grupos"))));
await t("ni buscar grupos por un campo", assertFails(getDocs(query(collection(caro, "grupos"), where("creador", "==", "ana")))));
await t("sin sesión no se abre ningún grupo", assertFails(getDoc(doc(anon, "grupos/G1"))));
console.log("— miembros —");
await t("un no miembro NO puede listar los miembros", assertFails(getDocs(collection(caro, "grupos/G1/miembros"))));
await t("un no miembro NO puede leer el documento de un miembro", assertFails(getDoc(doc(caro, "grupos/G1/miembros/ana"))));
await t("un miembro puede listar los miembros de su grupo", assertSucceeds(getDocs(collection(beto, "grupos/G1/miembros"))));
await t("un miembro NO puede listar los de otro grupo", assertFails(getDocs(collection(beto, "grupos/G2/miembros"))));
await t("cada uno lee su propio documento", assertSucceeds(getDoc(doc(beto, "grupos/G1/miembros/beto"))));
await t("un miembro no lee suelto el documento de otro (solo en la lista)", assertFails(getDoc(doc(beto, "grupos/G1/miembros/ana"))));
console.log("— sumarse con el código (lo que hace la app) —");
await t("Caro abre el grupo por su código", assertSucceeds(getDoc(doc(caro, "grupos/G1"))));
await t("Caro escribe su propio documento de miembro", assertSucceeds(setDoc(doc(caro, "grupos/G1/miembros/caro"), { n: "Caro" }, { merge: true })));
await t("y ya puede ver la lista de miembros", assertSucceeds(getDocs(collection(caro, "grupos/G1/miembros"))));
await t("no puede escribir el documento de otro", assertFails(setDoc(doc(caro, "grupos/G1/miembros/beto"), { n: "X" })));
await t("salir: mira la lista antes y borra su documento", assertSucceeds(deleteDoc(doc(caro, "grupos/G1/miembros/caro"))));
await t("después de salir ya no ve la lista", assertFails(getDocs(collection(caro, "grupos/G1/miembros"))));
await t("la creadora puede sacar a alguien", assertSucceeds(deleteDoc(doc(ana, "grupos/G1/miembros/beto"))));
console.log("— códigos de Scaeli+ —");
await t("se lee un código si se lo conoce", assertSucceeds(getDoc(doc(caro, "codes/SCAELI-7KQ2-M9XA-4TPE"))));
await t("nadie puede listar los códigos", assertFails(getDocs(collection(caro, "codes"))));
await t("se le suma un uso", assertSucceeds(updateDoc(doc(caro, "codes/SCAELI-7KQ2-M9XA-4TPE"), { uses: increment(1) })));
await t("no se le pueden cambiar los días", assertFails(updateDoc(doc(caro, "codes/SCAELI-7KQ2-M9XA-4TPE"), { days: 999 })));
await env.cleanup();
console.log(fails.length ? "FALLAS:\n" + fails.join("\n") : "OK reglas"); process.exit(fails.length ? 1 : 0);
