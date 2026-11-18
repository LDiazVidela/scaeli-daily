// Daily 2.4 · cambia el santo principal de un día por otro de «los otros santos del día» (data/santoral-mas.js).
// Regla (pedido de Lorenzo): el santo del día es siempre el más conocido o la fiesta del día.
// Uso: node herramientas/santo_principal.mjs 11-17 "Santa Isabel de Hungría"
import fs from "fs";
const [,, mm, nombre]=process.argv; const D=new URL("../data/",import.meta.url);
const lee=(f,v)=>{ const s=fs.readFileSync(new URL(f,D),"utf8"); const i=s.indexOf("export const "+v+"="); const cab=s.slice(0,i); const j=JSON.parse(s.slice(i+("export const "+v+"=").length).replace(/;\s*$/,"")); return [cab,j]; };
const [c1,S]=lee("santoral.js","SANTORAL"), [c2,M]=lee("santoral-mas.js","SANTORAL_MAS");
const k=(M[mm]||[]).findIndex(x=>x.n===nombre); if(k<0) throw new Error("no está en los otros santos de "+mm);
const viejo=S[mm], nuevo=M[mm][k]; S[mm]=nuevo; M[mm][k]=viejo;
fs.writeFileSync(new URL("santoral.js",D),c1+"export const SANTORAL="+JSON.stringify(S)+";\n"); fs.writeFileSync(new URL("santoral-mas.js",D),c2+"export const SANTORAL_MAS="+JSON.stringify(M)+";\n");
console.log(mm,"principal:",nuevo.n,"· pasa a los otros:",viejo.n);
