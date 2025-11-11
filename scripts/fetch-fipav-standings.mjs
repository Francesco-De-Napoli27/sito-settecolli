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
      viewport: { width: 1366, height: 900 },
      locale: "it-IT"
    });
    const page = await ctx.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });

    // 1) Prova a chiudere cookie banner (vari testi/selector comuni)
    const cookieSelectors = [
      'button:has-text("Accetta")',
      'button:has-text("Accetto")',
      'button:has-text("Accetta tutti")',
      'button:has-text("Accept All")',
      '#cookie-accept', '.cookie-accept', '[data-testid="cookie-accept"]'
    ];
    for (const sel of cookieSelectors) {
      try { await page.locator(sel).first().click({ timeout: 1000 }); } catch {}
    }

    // 2) Aspetta che compaia almeno UNA tabella con righe corpo
    //    (alcune pagine montano via JS)
    try {
      await page.waitForSelector('table tbody tr', { timeout: 8000 });
    } catch {
      // piccolo scroll per innescare lazy load, poi ultimo tentativo
      await page.mouse.wheel(0, 1000);
      await page.waitForTimeout(1000);
    }

    // 3) Dai tempo al DOM di “assestarsi”
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(500);

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

  // 1) Trova una tabella candidata: thead o almeno 8 colonne nella prima riga
  let table = null;
  $('table').each((_, el) => {
    const headTxt = $(el).find('thead').text().toLowerCase();
    const hasKeywords =
      /squadra|societ|team/.test(headTxt) &&
      /(pt|punti)\b/.test(headTxt) &&
      /\bg\b/.test(headTxt);
    const firstCols = $(el).find('tbody tr:first-child td').length;
    if (hasKeywords || firstCols >= 8) { table = el; return false; }
  });
  if (!table) throw new Error("Tabella classifica non trovata (headers non riconosciuti)");

  // 2) Prova mappatura per intestazioni note (robusta)
  const headers = $(table).find('thead th, thead td').map((_,th)=>$(th).text().trim().toLowerCase()).get();
  const H = headers.map(h => h.normalize('NFD').replace(/\p{Diacritic}/gu,''));
  const idx = {
    pos:     H.findIndex(h => /#|pos|posizione|n/.test(h)),
    squadra: H.findIndex(h => /squadra|societ|team/.test(h)),
    pt:      H.findIndex(h => /^(pt|punti)\b/.test(h)),
    g:       H.findIndex(h => /^g\b|giocate/.test(h)),
    v:       H.findIndex(h => /^v\b|vinte/.test(h)),
    p:       H.findIndex(h => /^p\b(?!t)|perse/.test(h)),  // "P" come perse (non punti)
    sv:      H.findIndex(h => /^sv\b|set vinti/.test(h)),
    sp:      H.findIndex(h => /^sp\b|set persi/.test(h)),
  };

  const valAt = (cells, i) => i>=0 && cells[i] ? $(cells[i]).text().trim() : "";
  const parseN = s => Number(String(s).replace(/[^\d\-]/g,'')) || 0;

  const rows = [];
  $(table).find('tbody tr').each((_, tr) => {
    const tds = $(tr).find('td').get();
    if (!tds.length) return;

    // 3) Se thead non aiuta, fallback POSIZIONALE comune:
    //    [0]=pos, [1]=squadra, [2]=pt, [3]=G, [4]=V, [5]=P, [6]=SV, [7]=SP
    const usePositional = headers.length === 0 || idx.squadra < 0 || idx.pt < 0;
    const col = (name, pos) => usePositional ? pos : idx[name];

    const squadraCell = usePositional ? tds[1] : tds[idx.squadra];
    const squadra = $(squadraCell || tds[1] || tds[0]).text().replace(/\s+/g,' ').trim();
    const img = $(squadraCell).find('img').attr('src') || "";

    const posizione = parseN(valAt(tds, col('pos', 0)));
    const punti     = parseN(valAt(tds, col('pt', 2)));
    const g         = parseN(valAt(tds, col('g', 3)));
    const v         = parseN(valAt(tds, col('v', 4)));
    const p         = parseN(valAt(tds, col('p', 5)));
    const sv        = parseN(valAt(tds, col('sv', 6)));
    const sp        = parseN(valAt(tds, col('sp', 7)));
    const giocate   = g || (v + p) || 0;

    if (!squadra || (punti===0 && v===0 && sv===0 && sp===0)) return;

    rows.push({
      ...(posizione ? { posizione } : {}),
      squadra,
      logo: img ? new URL(img, baseUrl).toString() : "",
      punti,
      giocate,
      "giocate vinte": v,
      "giocate perse": p,
      "set vinti": sv,
      "set persi": sp
    });
  });

  if (!rows.length) throw new Error("Nessuna riga utile estratta.");
  rows.sort((a,b) => {
    if (b.punti !== a.punti) return b.punti - a.punti;
    const da = a["set vinti"] - a["set persi"], db = b["set vinti"] - b["set persi"];
    if (db !== da) return db - da;
    return b["set vinti"] - a["set vinti"];
  });
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


