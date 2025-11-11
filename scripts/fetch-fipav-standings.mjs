// scripts/fetch-fipav-standings.mjs
import { writeFile, readFile } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import { request } from "undici";
import * as cheerio from "cheerio";

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, "").split("=");
  return [k, v ?? true];
}));

async function fetchHtmlUndici(url) {
  const res = await request(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      "accept": "text/html,application/xhtml+xml",
      "accept-language": "it-IT,it;q=0.9,en;q=0.8",
    },
    maxRedirections: 3
  });
  if (res.statusCode < 200 || res.statusCode >= 300) {
    const body = await res.body.text();
    throw new Error(`HTTP ${res.statusCode} con Undici\n${body.slice(0,200)}`);
  }
  return res.body.text();
}

async function fetchHtmlPlaywright(url) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      viewport: { width: 1280, height: 1000 }
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(1200);
    const html = await page.content();
    await ctx.close();
    return html;
  } finally {
    await browser.close();
  }
}

async function fetchHtml(url) {
  try {
    return await fetchHtmlUndici(url);
  } catch (e) {
    console.warn(`[${url}] fetch Undici fallito → provo Playwright: ${e.message}`);
    return await fetchHtmlPlaywright(url);
  }
}

function normalizeHeaders(ths){
  return ths.map(t => t.toLowerCase().replace(/\s+/g," ").trim());
}

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
  if (!table) throw new Error("Tabella classifica non trovata (headers non riconosciuti)");

  const headers = $(table).find("thead th, thead td").map((_,th)=>$(th).text().trim()).get();
  const H = headers.map(h => h.toLowerCase());
  const idx = {
    pos:     H.findIndex(h => /#|pos|posizione|n°/.test(h)),
    squadra: H.findIndex(h => /squadra|team|società/.test(h)),
    punti:   H.findIndex(h => /^pt$|^p(unti)?$/.test(h)),
    g:       H.findIndex(h => /^g$|^giocate$/.test(h)),
    v:       H.findIndex(h => /^v$|vinte/.test(h)),
    p:       (()=>{ const all = H.map((h,i)=>({h,i})).filter(o=>/^p$|perse$/.test(o.h)); return all.length ? all[all.length-1].i : H.findIndex(h=>/perse/.test(h)); })(),
    sv:      H.findIndex(h => /^sv$|set vinti/.test(h)),
    sp:      H.findIndex(h => /^sp$|set persi/.test(h)),
  };

  const valAt = (cells, i, $row) => (i < 0 ? "" : $(cells[i]).text().trim());
  const parseN = s => Number(String(s).replace(/[^\d\-]/g,"")) || 0;

  const rows = [];
  $(table).find("tbody tr").each((_, tr) => {
    const tds = $(tr).find("td").get();
    if (!tds.length) return;

    const cellSquadra = idx.squadra >= 0 ? $(tds[idx.squadra]) : $(tds[0]);
    const squadra = cellSquadra.text().replace(/\s+/g," ").trim();
    const img = cellSquadra.find("img").attr("src") || "";
    const logo = img ? new URL(img, baseUrl).toString() : "";

    const pos = parseN(valAt(tds, idx.pos));
    const punti = parseN(valAt(tds, idx.punti));
    const g     = parseN(valAt(tds, idx.g));
    const v     = parseN(valAt(tds, idx.v));
    const p     = parseN(valAt(tds, idx.p));
    const sv    = parseN(valAt(tds, idx.sv));
    const sp    = parseN(valAt(tds, idx.sp));
    const giocate = g || (v + p) || 0;

    if (!squadra || (punti===0 && v===0 && sv===0 && sp===0)) return;

    rows.push({
      ...(pos ? { posizione: pos } : {}),
      squadra,
      logo,
      punti,
      giocate,
      "giocate vinte": v,
      "giocate perse": p,
      "set vinti": sv,
      "set persi": sp
    });
  });

  rows.sort((a, b) => {
    if (b.punti !== a.punti) return b.punti - a.punti;
    const diffA = a["set vinti"] - a["set persi"];
    const diffB = b["set vinti"] - b["set persi"];
    if (diffB !== diffA) return diffB - diffA;
    return b["set vinti"] - a["set vinti"];
  });

  if (!rows.length) throw new Error("Nessuna riga utile estratta dalla tabella.");
  return rows;
}

async function runJob({ url, out }) {
  console.log(`\n=== JOB ===\nURL: ${url}\nOUT: ${out}`);
  if (!url || !out) throw new Error("Job non valido: url/out mancanti");
  const html = await fetchHtml(url);
  console.log(`HTML length: ${html.length}`);
  const rows = extractStandings(html, url);
  console.log(`Estratte ${rows.length} righe.`);
  const outAbs = resolvePath(process.cwd(), out);
  await writeFile(outAbs, JSON.stringify(rows, null, 2), "utf8");
  console.log(`✔ Scritto: ${out}`);
}

async function main() {
  const cfgPath = args.config || "scripts/standings.config.json";
  const cfgText = await readFile(cfgPath, "utf8");
  const jobs = JSON.parse(cfgText);
  let failed = 0;
  for (const job of jobs) {
    try {
      await runJob(job);
    } catch (e) {
      failed++;
      console.error(`❌ Job fallito (${job.url}): ${e.message}`);
    }
  }
  if (failed) {
    throw new Error(`Almeno ${failed} job falliti.`);
  } else {
    console.log("\nTutti i job completati ✅");
  }
}

main().catch(e => {
  console.error("ERRORE GENERALE:", e);
  process.exit(1);
});


