// scripts/fetch-fipav-standings.mjs
import { writeFile, readFile } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import { request } from "undici";
import * as cheerio from "cheerio";

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, "").split("=");
  return [k, v ?? true];
}));

/**
 * Modalità di input:
 *  A) --config=./scripts/standings.config.json   (consigliata)
 *  B) --job=url,OUTPATH  (puoi ripetere più volte)
 *     es: --job=https://..58796,public/classifica_maschile.json --job=https://..XXXXX,public/classifica_femminile.json
 */

async function fetchHtml(url) {
  const res = await request(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
      "accept-language": "it-IT,it;q=0.9,en;q=0.8"
    },
    maxRedirections: 3
  });
  if (res.statusCode < 200 || res.statusCode >= 300) {
    const body = await res.body.text();
    throw new Error(`HTTP ${res.statusCode} su ${url}\n${body.slice(0,200)}`);
  }
  return res.body.text();
}

function toAbs(base, url){
  if (!url) return "";
  try { return new URL(url, base).toString(); } catch { return url; }
}

function normalizeHeaders(ths){
  return ths.map(t => t.toLowerCase().replace(/\s+/g," ").trim());
}

/**
 * Estrae una tabella "classifica" tipica:
 * Pos | Squadra | PT | G | V | P | SV | SP
 * Restituisce array di oggetti col tuo formato + logo (se presente).
 */
function extractStandings(html, baseUrl){
  const $ = cheerio.load(html);

  let table = null;
  $("table").each((_, el) => {
    const hs = normalizeHeaders($(el).find("thead th, thead td").map((_,th)=>$(th).text()).get());
    const ok =
      hs.some(h => /squadra|team|società/.test(h)) &&
      hs.some(h => /^pt$|^p(unti)?$/.test(h)) &&
      hs.some(h => /^g$|^giocate$/.test(h)) &&
      hs.some(h => /^v$|vinte/.test(h)) &&
      hs.some(h => /^p$|perse$/.test(h)) &&
      hs.some(h => /^sv$|set vinti/.test(h)) &&
      hs.some(h => /^sp$|set persi/.test(h));
    if (ok) { table = el; return false; }
  });
  if (!table) table = $("table").filter((_,el)=>$(el).find("tbody tr:first-child td").length>=6).get(0);
  if (!table) throw new Error("Tabella classifica non trovata");

  const headers = $(table).find("thead th, thead td").map((_,th)=>$(th).text().trim()).get();
  const H = headers.map(h => h.toLowerCase());

  const idx = {
    pos:     H.findIndex(h => /#|pos|posizione|n°/.test(h)),
    squadra: H.findIndex(h => /squadra|team|società/.test(h)),
    punti:   H.findIndex(h => /^pt$|^p(unti)?$/.test(h)),
    g:       H.findIndex(h => /^g$|^giocate$/.test(h)),
    v:       H.findIndex(h => /^v$|vinte/.test(h)),
    p:       (()=>{ // “P” può essere “Perse”
      const allP = H.map((h,i)=>({h,i})).filter(o=>/^p$|perse$/.test(o.h));
      if (allP.length) return allP[allP.length-1].i;
      return H.findIndex(h => /perse/.test(h));
    })(),
    sv:      H.findIndex(h => /^sv$|set vinti/.test(h)),
    sp:      H.findIndex(h => /^sp$|set persi/.test(h)),
  };

  const valAt = (cells, i, $row) => {
    if (i < 0) return "";
    const el = cells[i];
    return $(el).text().trim();
  };
  const rows = [];
  $(table).find("tbody tr").each((_, tr) => {
    const tds = $(tr).find("td").get();
    if (!tds.length) return;

    const cellSquadra = idx.squadra >= 0 ? $(tds[idx.squadra]) : $(tds[0]);
    const squadra = cellSquadra.text().replace(/\s+/g," ").trim();
    // logo (se c'è un <img> nella cella della squadra)
    const img = cellSquadra.find("img").attr("src");
    const logo = img ? toAbs(baseUrl, img) : "";

    const parseN = s => Number(String(s).replace(/[^\d\-]/g,"")) || 0;
    const pos = parseN(valAt(tds, idx.pos));
    const punti = parseN(valAt(tds, idx.punti));
    const g     = parseN(valAt(tds, idx.g));
    const v     = parseN(valAt(tds, idx.v));
    const p     = parseN(valAt(tds, idx.p));
    const sv    = parseN(valAt(tds, idx.sv));
    const sp    = parseN(valAt(tds, idx.sp));
    const giocate = g || (v + p) || 0;

    if (!squadra || (punti===0 && v===0 && sv===0 && sp===0)) return; // salta righe vuote

    rows.push({
      ...(pos ? { posizione: pos } : {}),
      squadra,
      logo, // ← richiesto: manteniamo il logo
      punti,
      giocate,
      "giocate vinte": v,
      "giocate perse": p,
      "set vinti": sv,
      "set persi": sp
    });
  });

  // Ordina per punti, poi differenza set, poi SV
  rows.sort((a, b) => {
    if (b.punti !== a.punti) return b.punti - a.punti;
    const diffA = a["set vinti"] - a["set persi"];
    const diffB = b["set vinti"] - b["set persi"];
    if (diffB !== diffA) return diffB - diffA;
    return b["set vinti"] - a["set vinti"];
  });

  return rows;
}

async function runJob(job){
  const { url, out } = job;
  console.log(`📡 Scarico: ${url}`);
  const html = await fetchHtml(url);
  const rows = extractStandings(html, url);
  const outAbs = resolvePath(process.cwd(), out);
  await writeFile(outAbs, JSON.stringify(rows, null, 2), "utf8");
  console.log(`✅ ${rows.length} righe → ${out}`);
}

async function main(){
  let jobs = [];
  if (args.config) {
    const cfgText = await readFile(args.config, "utf8");
    jobs = JSON.parse(cfgText);
  } else {
    const jobArgs = process.argv.filter(s => s.startsWith("--job="));
    jobs = jobArgs.map(s => {
      const [, val] = s.split("=");
      const [url, out] = val.split(",");
      return { url, out };
    });
  }
  if (!jobs.length) {
    console.error("Nessun job. Usa --config=... oppure --job=url,out (ripetibile).");
    process.exit(1);
  }
  for (const j of jobs) {
    if (!j.url || !j.out) {
      console.error("Job non valido:", j);
      continue;
    }
    try { await runJob(j); }
    catch(e){ console.error(`❌ Errore job ${j.url}:`, e.message); }
  }
}

main().catch(e => { console.error("❌ Errore generale:", e); process.exit(1); });

