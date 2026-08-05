// scripts/fetch-fipav-standings.mjs
import { writeFile, readFile } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import { request } from "undici";

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, v] = a.replace(/^--/, "").split("=");
  return [k, v ?? true];
}));

async function fetchHtmlUndici(url) {
  const res = await request(url, {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      accept: "text/html,application/xhtml+xml",
      "accept-language": "it-IT,it;q=0.9,en;q=0.8",
    },
    maxRedirections: 3
  });
  if (res.statusCode >= 300) throw new Error(`HTTP ${res.statusCode} con Undici`);
  return res.body.text();
}

// === NUOVO: estrazione dentro Playwright ===
async function fetchStandingsWithPlaywright(url) {
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

    // chiudi eventuale cookie banner
    const cookieSelectors = [
      'button:has-text("Accetta")',
      'button:has-text("Accetto")',
      'button:has-text("Accetta tutti")',
      'button:has-text("Accept All")',
      '#cookie-accept', '.cookie-accept', '[data-testid="cookie-accept"]'
    ];
    for (const sel of cookieSelectors) { try { await page.locator(sel).first().click({ timeout: 800 }); } catch {} }

    // aspetta che ci siano righe di tabella
    await page.waitForSelector('table tbody tr', { timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Estrazione nel contesto del browser (niente Cheerio)
    const rows = await page.evaluate(() => {
      function norm(t) { return (t||"").replace(/\s+/g," ").trim(); }
      function num(t) { const n = Number(String(t||"").replace(/[^\d\-]/g,'')); return isNaN(n) ? 0 : n; }

      // Trova la tabella "più promettente": più colonne/righe
      const tables = Array.from(document.querySelectorAll("table"));
      let best = null, bestScore = -1;

      for (const tbl of tables) {
        const bodyRows = tbl.querySelectorAll("tbody tr");
        const firstCols = bodyRows[0]?.querySelectorAll("td").length || 0;
        const headTxt = norm(tbl.querySelector("thead")?.innerText || "").toLowerCase();
        const hasHints = /(squadra|societ|team)/.test(headTxt) && /(pt|punti)\b/.test(headTxt);
        const score = (bodyRows.length * 10) + firstCols + (hasHints ? 50 : 0);
        if (score > bestScore) { bestScore = score; best = tbl; }
      }

      if (!best) return [];

      // Intestazioni (se esistono)
      const headers = Array.from(best.querySelectorAll("thead th, thead td")).map(th => norm(th.innerText).toLowerCase());
      const H = headers.map(h => h.normalize('NFD').replace(/\p{Diacritic}/gu,''));

      const idx = {
        pos:     H.findIndex(h => /#|pos|posizione|n/.test(h)),
        squadra: H.findIndex(h => /squadra|societ|team/.test(h)),
        pt:      H.findIndex(h => /^(pt|punti)\b/.test(h)),
        g:       H.findIndex(h => /^g\b|giocate/.test(h)),
        v:       H.findIndex(h => /^v\b|vinte/.test(h)),
        p:       H.findIndex(h => /^p\b(?!t)|perse/.test(h)),
        sv:      H.findIndex(h => /^sv\b|set vinti/.test(h)),
        sp:      H.findIndex(h => /^sp\b|set persi/.test(h)),
      };

      const usePositional = headers.length === 0 || idx.squadra < 0 || idx.pt < 0;
      const col = (name, pos) => usePositional ? pos : idx[name];

      const out = [];
      for (const tr of best.querySelectorAll("tbody tr")) {
        const tds = tr.querySelectorAll("td");
        if (!tds.length) continue;

        const squadraCell = tds[col('squadra', 1)] || tds[1] || tds[0];
        const squadra = norm(squadraCell?.innerText);
        const img = squadraCell?.querySelector('img')?.getAttribute('src') || "";

        const posizione = num(tds[col('pos', 0)]?.innerText);
        const punti     = num(tds[col('pt', 2)]?.innerText);
        const g         = num(tds[col('g', 3)]?.innerText);
        const v         = num(tds[col('v', 4)]?.innerText);
        const p         = num(tds[col('p', 5)]?.innerText);
        const sv        = num(tds[col('sv', 6)]?.innerText);
        const sp        = num(tds[col('sp', 7)]?.innerText);
        const giocate   = g || (v + p) || 0;

        // scarta righe vuote/totali
        if (!squadra || (punti===0 && v===0 && sv===0 && sp===0)) continue;

        out.push({
          ...(posizione ? { posizione } : {}),
          squadra,
          logo: img, // relativo: lo risolviamo fuori
          punti, giocate,
          "giocate vinte": v,
          "giocate perse": p,
          "set vinti": sv,
          "set persi": sp
        });
      }

      return out;
    });

    await ctx.close();

    // normalizza logo relativo in assoluto
    const abs = r => ({ ...r, logo: r.logo ? new URL(r.logo, url).toString() : "" });

    if (!rows || !rows.length) throw new Error("Nessuna riga utile estratta.");
    return rows.map(abs);
  } finally {
    await browser.close();
  }
}

// Prova Undici → se fallisce o non riconosciamo la tabella, usa Playwright
async function getStandings(url) {
  try {
    await fetchHtmlUndici(url); // solo check raggiungibilità (di solito 302)
    // Se qui va, comunque usiamo Playwright per avere il DOM “vivo”
    return await fetchStandingsWithPlaywright(url);
  } catch {
    return await fetchStandingsWithPlaywright(url);
  }
}

function sortRows(rows) {
  return rows.sort((a,b) => {
    if (b.punti !== a.punti) return b.punti - a.punti;
    const da = a["set vinti"] - a["set persi"], db = b["set vinti"] - b["set persi"];
    if (db !== da) return db - da;
    return b["set vinti"] - a["set vinti"];
  });
}

async function runJob({ url, out }) {
  console.log(`\n=== JOB ===\nURL: ${url}\nOUT: ${out}`);
  const rows = await getStandings(url);
  console.log(`Estratte ${rows.length} righe.`);
  const sorted = sortRows(rows);
  const outAbs = resolvePath(process.cwd(), out);
  await writeFile(outAbs, JSON.stringify(sorted, null, 2), "utf8");
  console.log(`✔ Scritto: ${out}`);
}

async function main() {
  const cfgPath = args.config || "scripts/standings.config.json";
  const cfgText = await readFile(cfgPath, "utf8");
  const jobs = JSON.parse(cfgText);
  let failed = 0;
  for (const job of jobs) {
    try { await runJob(job); }
    catch (e) { failed++; console.error(`❌ Job fallito (${job.url}): ${e.message}`); }
  }
  if (failed) throw new Error(`Almeno ${failed} job falliti.`);
  console.log("\nTutti i job completati ✅");
}

main().catch(e => { console.error("ERRORE GENERALE:", e); process.exit(1); });

