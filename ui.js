// ─── COUNTRY FLAG IMAGES ─────────────────────────
// flagcdn.com — free CDN, no API key, CORS-safe
const FLAG_CDN = {
  FRA:"fr",ESP:"es",ARG:"ar",ENG:"gb-eng",BRA:"br",POR:"pt",GER:"de",
  MAR:"ma",USA:"us",NED:"nl",COL:"co",URU:"uy",JPN:"jp",BEL:"be",
  CRO:"hr",SEN:"sn",NOR:"no",
  MEX:"mx",RSA:"za",KOR:"kr",CZE:"cz",CAN:"ca",BIH:"ba",PAR:"py",CUR:"cw",EGY:"eg",
  CPV:"cv",KSA:"sa",ALG:"dz",CGO:"cd",SCO:"gb-sct",ECU:"ec",
  SWE:"se",IRQ:"iq",AUT:"at",GHA:"gh",
  France:"fr",Spain:"es",Argentina:"ar",England:"gb-eng",Brazil:"br",
  Portugal:"pt",Germany:"de",Morocco:"ma",Netherlands:"nl",Colombia:"co",
  Uruguay:"uy",Japan:"jp",Belgium:"be",Croatia:"hr",Senegal:"sn",
  Mexico:"mx","South Africa":"za",Canada:"ca","Bosnia and Herzegovina":"ba","Korea Republic":"kr",Czechia:"cz",
  Scotland:"gb-sct",Ecuador:"ec",Sweden:"se","Saudi Arabia":"sa",
  Ghana:"gh",Iraq:"iq",Austria:"at",Algeria:"dz",Paraguay:"py",
  "Cape Verde":"cv",Egypt:"eg","Congo DR":"cd",Curaçao:"cw",Norway:"no"
};

function flagImg(key, size) {
  const code = FLAG_CDN[key];
  if (!code) return "";
  const [w, h] = size === "lg" ? [60,45] : size === "md" ? [40,30] : [24,18];
  return "<img src=\"https://flagcdn.com/" + w + "x" + h + "/" + code + ".png\" "
       + "width=\"" + w + "\" height=\"" + h + "\" "
       + "alt=\"" + key + "\" loading=\"lazy\" "
       + "style=\"border-radius:2px;vertical-align:middle;flex-shrink:0;display:inline-block\" "
       + "onerror=\"this.style.display='none'\"/>";
}

// ═══════════════════════════════════════════════
//  UI.JS — COMPLETE CLEAN REBUILD
// ═══════════════════════════════════════════════
let selectedA = "FRA", selectedB = "ESP";

document.addEventListener("DOMContentLoaded", () => {
  renderMatches();
  renderAHTable("all");
  renderScorer();
  renderH2HSelectors();
  renderH2H(selectedA, selectedB);
  renderBracket();
});

// ── TAB SWITCHING ──
function switchTab(tab, el) {
  document.querySelectorAll(".bw-tab").forEach(t => t.classList.remove("active"));
  const target = document.getElementById("tab-" + tab);
  if (target) target.classList.add("active");
  document.querySelectorAll(".bw-pill, .bw-hn-link").forEach(p => p.classList.remove("active"));
  if (el) { el.classList.add("active"); }
  document.querySelectorAll('[data-tab="' + tab + '"]').forEach(p => p.classList.add("active"));
}

let stageFilter = "all";
function filterStage(s) {
  stageFilter = s;
  renderMatches();
  document.querySelectorAll(".bw-sb-link").forEach(l => l.classList.remove("active"));
  if (event && event.target) event.target.classList.add("active");
}

function overallRating(id) {
  if (!TEAMS || !TEAMS[id]) return 75;
  const s = TEAMS[id].stats;
  return Math.round(s.atk*.22+s.mid*.20+s.def*.20+s.gk*.10+s.form*.15+s.exp*.08+s.depth*.05);
}

function baseWinProb(a, b) {
  if (!TEAMS[a] || !TEAMS[b]) return 0.5;
  const sa = TEAMS[a].stats, sb = TEAMS[b].stats;
  const offA = sa.atk*.55+sa.mid*.45, defB = sb.def*.55+sb.gk*.45;
  const offB = sb.atk*.55+sb.mid*.45, defA = sa.def*.55+sa.gk*.45;
  const nA = (offA-defB)+(sa.form-sb.form)*.25+(sa.exp-sb.exp)*.15+(sa.depth-sb.depth)*.10;
  const nB = (offB-defA)+(sb.form-sa.form)*.25+(sb.exp-sa.exp)*.15+(sb.depth-sa.depth)*.10;
  return 1/(1+Math.exp(-(nA-nB)*.068));
}

// ═══════════════════════════════════════════════
//  MATCH LIST
// ═══════════════════════════════════════════════
const STAGE_NAMES = {GRP:"Group Stage",R32:"Round of 32",R16:"Round of 16",QF:"Quarter-Finals",SF:"Semi-Finals",F:"Final"};

function renderMatches() {
  const el = document.getElementById("matchList");
  if (!el) return;
  el.innerHTML = "";
  const list = stageFilter === "all" ? MATCHES : MATCHES.filter(m => m.stage === stageFilter);
  const byDate = {};
  list.forEach(m => {
    const key = m.date + "|" + (STAGE_NAMES[m.stage] || m.stage);
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(m);
  });
  let cardIdx = 0;
  Object.entries(byDate).forEach(([key, matches]) => {
    const [date, stage] = key.split("|");
    const dh = document.createElement("div");
    dh.className = "bw-date-hdr";
    dh.innerHTML = "<span>" + date + "</span><span style='color:var(--text3);font-size:10px;margin-left:8px'>" + stage + "</span>";
    el.appendChild(dh);
    matches.forEach(m => el.appendChild(buildMatchRow(m, cardIdx++)));
  });
  if (!list.length) {
    el.innerHTML = "<div style='padding:40px;text-align:center;color:var(--text3);font-size:13px'>No matches for this stage</div>";
  }
}

// ═══════════════════════════════════════════════
//  SCORE PREDICTION — ATK/DEF model + WDW odds
// ═══════════════════════════════════════════════
function predictScore(m) {
  const wdw = (typeof WDW_ODDS !== "undefined" && WDW_ODDS[m.id]) || [2.0,3.3,3.7];
  const pH=1/wdw[0], pA=1/wdw[2], vig=pH+1/wdw[1]+pA;
  const normH=pH/vig, normA=pA/vig;
  const sH=(typeof TEAMS!=="undefined")&&TEAMS[m.homeCode]&&TEAMS[m.homeCode].stats;
  const sA=(typeof TEAMS!=="undefined")&&TEAMS[m.awayCode]&&TEAMS[m.awayCode].stats;
  const base=1.3, avg=78;
  let xGH,xGA;
  if(sH&&sA){
    xGH=base*(sH.atk/avg)*(avg/sA.def)*(0.7+sH.form/100*0.6);
    xGA=base*(sA.atk/avg)*(avg/sH.def)*(0.7+sA.form/100*0.6);
  } else if(sH&&!sA){
    const r=Math.min(20,normH/Math.max(0.04,normA));
    xGH=base*(sH.atk/avg)*Math.min(2.2,1+(r-1)*0.06);
    xGA=base*0.45/Math.min(1.8,sH.def/avg);
  } else if(!sH&&sA){
    const r=Math.min(20,normA/Math.max(0.04,normH));
    xGH=base*0.45/Math.min(1.8,sA.def/avg);
    xGA=base*(sA.atk/avg)*Math.min(2.2,1+(r-1)*0.06);
  } else {
    xGH=2.2*normH/(normH+normA);
    xGA=2.2*normA/(normH+normA);
  }
  xGH=Math.max(0.25,Math.min(6,xGH));
  xGA=Math.max(0.10,Math.min(4,xGA));
  const gH=Math.round(xGH), gA=Math.round(xGA), total=gH+gA;
  return {gH, gA, total, isBig:total>=3, xGH:xGH.toFixed(1), xGA:xGA.toFixed(1)};
}


function buildMatchRow(m, idx) {
  const wdw = WDW_ODDS[m.id] || [2.10, 3.30, 3.70];
  const wH = waterLabel(m.ah.homePayout), wA = waterLabel(m.ah.awayPayout);
  const edgeClass = m.rec==="strong"?"se-strong":m.rec==="value"?"se-value":m.rec==="slight"?"se-slight":m.rec==="avoid"?"se-avoid":"se-neutral";
  const edgeText = m.edge > 0 ? "+" + m.edge + "% AH" : m.edge === 0 ? "Fair" : m.edge + "%";
  const row = document.createElement("div");
  row.className = "bw-match-row spring-in";
  row.style.animationDelay = (idx * 0.04) + "s";
  row.innerHTML =
    "<div class='bw-match-time'>" +
      "<span>" + m.date.split(" ").pop() + "</span>" +
      "<span class='bw-date-sm'>" + (m.stage !== "GRP" ? "Proj" : (m.group||"").replace("Group ","Grp-")) + "</span>" +
    "</div>" +
    "<div class='bw-teams-col'>" +
      "<div class='bw-team-row'>" + flagImg(m.homeCode||m.home,"sm") + " <span class='bw-team-name fav'>" + m.home + "</span></div>" +
      "<div class='bw-team-row' style='margin-top:2px'>" + flagImg(m.awayCode||m.away,"sm") + " <span class='bw-team-name'>" + m.away + "</span></div>" +
      (function(){var sc=predictScore(m);return "<div class='bw-score-pred'>"
        +"<span class='bw-score-val'>"+sc.gH+" - "+sc.gA+"</span>"
        +"<span class='bw-total "+(sc.isBig?"bw-total-big":"bw-total-small")+"'>"
        +(sc.isBig?"⬆ BIG (3+)":"⬇ SMALL (≤2)")+"</span>"
        +"<span class='bw-xg-tag'>xG "+sc.xGH+"/"+sc.xGA+"</span></div>";})() +
    "</div>" +
    "<div class='bw-wdw'>" +
      "<button class='bw-odds-btn' onclick='this.classList.toggle(\"selected\")'><span class='bw-odds-label'>Home</span>" + wdw[0].toFixed(2) + "</button>" +
      "<button class='bw-odds-btn' onclick='this.classList.toggle(\"selected\")'><span class='bw-odds-label'>Draw</span>" + wdw[1].toFixed(2) + "</button>" +
      "<button class='bw-odds-btn' onclick='this.classList.toggle(\"selected\")'><span class='bw-odds-label'>Away</span>" + wdw[2].toFixed(2) + "</button>" +
    "</div>" +
    "<div class='bw-ah-col'>" +
      "<button class='bw-ah-btn' onclick='this.classList.toggle(\"selected\")'><span class='bw-ah-label'>" + m.homeFlag + " " + m.ah.homeLabel + "</span><span class='bw-ah-val'>" + m.ah.homePayout + "</span><span class='bw-ah-water' style='color:" + wH.col + "'>" + wH.txt + "</span></button>" +
      "<button class='bw-ah-btn' onclick='this.classList.toggle(\"selected\")'><span class='bw-ah-label'>" + m.awayFlag + " " + m.ah.awayLabel + "</span><span class='bw-ah-val'>" + m.ah.awayPayout + "</span><span class='bw-ah-water' style='color:" + wA.col + "'>" + wA.txt + "</span></button>" +
    "</div>" +
    "<div><span class='bw-sim-edge " + edgeClass + "'>" + edgeText + "</span>" +
      (m.rec==="strong"||m.rec==="value" ? "<div style='font-size:9px;color:var(--green);margin-top:3px;font-weight:600'>SIM PICK \u2713</div>" : "") +
    "</div>";
  return row;
}

// ═══════════════════════════════════════════════
//  AH TABLE
// ═══════════════════════════════════════════════
function filterAH(btn) {
  document.querySelectorAll(".bw-filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderAHTable(btn.dataset.f);
}

function renderAHTable(filter) {
  const el = document.getElementById("ahTableBody");
  if (!el) return;
  el.innerHTML = "";
  const list = filter==="all" ? MATCHES :
    filter==="picks" ? MATCHES.filter(m => m.rec==="strong"||m.rec==="value") :
    MATCHES.filter(m => m.rec===filter);
  const byStage = {};
  list.forEach(m => { if (!byStage[m.stage]) byStage[m.stage]=[]; byStage[m.stage].push(m); });
  const order = ["GRP","R32","R16","QF","SF","F"];
  const sNames = {GRP:"Group Stage",R16:"Round of 16",QF:"Quarter-Finals",SF:"Semi-Finals",F:"Final"};
  let rowIdx = 0;
  order.forEach(sk => {
    if (!byStage[sk]) return;
    const dv = document.createElement("div");
    dv.className = "stage-divider";
    dv.innerHTML = "<span class='stage-divider-label'>" + (sNames[sk]||sk) + "</span><div class='stage-divider-line'></div>" + (sk!=="GRP" ? "<span class='stage-proj-badge'>PROJECTED</span>" : "");
    el.appendChild(dv);
    byStage[sk].forEach(m => {
      const wH = waterLabel(m.ah.homePayout), wA = waterLabel(m.ah.awayPayout);
      const edgeSign = m.edge >= 0 ? "+" : "";
      const edgeCls = m.edge>=5?"bw-edge-pos":m.edge<0?"bw-edge-neg":"bw-edge-neu";
      const row = document.createElement("div");
      row.className = "bw-ah-row rec-" + m.rec + " spring-in";
      row.style.animationDelay = (rowIdx++ * 0.03) + "s";
      row.innerHTML =
        "<div class='bw-ah-match'><div class='bw-ah-match-date'>" + m.date + " &middot; " + (m.group||m.stage) + "</div><div class='bw-ah-teams'>" + m.homeFlag + " " + m.home + "<br>" + m.awayFlag + " " + m.away + "</div></div>" +
        "<div><div class='bw-ah-handicap'>" + m.ah.homeLabel + "</div><div style='font-size:10px;color:var(--text3);margin-top:2px'>" + m.ah.awayLabel + "</div></div>" +
        "<div><div class='bw-ah-payout " + wH.cls + "'>" + m.ah.homePayout + "</div><div class='bw-ah-payout " + wA.cls + "' style='font-size:12px;margin-top:3px'>" + m.ah.awayPayout + "</div></div>" +
        "<div class='bw-pct-cell'>" + m.simCoverAH + "%</div>" +
        "<div class='bw-pct-cell' style='color:var(--text3)'>" + m.marketCoverAH + "%</div>" +
        "<div class='bw-edge-cell " + edgeCls + "'>" + edgeSign + m.edge + "%</div>" +
        "<div class='bw-verdict-cell'><span class='bw-sim-edge " + (m.rec==="strong"?"se-strong":m.rec==="value"?"se-value":m.rec==="slight"?"se-slight":m.rec==="avoid"?"se-avoid":"se-neutral") + "'>" + m.recLabel + "</span><div style='font-size:10px;color:var(--text3);margin-top:4px;line-height:1.4'>" + m.recDetail + "</div></div>";
      el.appendChild(row);
    });
  });
  if (!list.length) el.innerHTML = "<div style='padding:40px;text-align:center;color:var(--text3);font-size:13px'>No matches in this category</div>";
}

function waterLabel(p) {
  if (p >= 1.93) return {txt:"\u25b2 "+p, col:"var(--green)", cls:"bw-water-hi"};
  if (p >= 1.88) return {txt:"\u25cf "+p, col:"var(--amber)", cls:"bw-water-std"};
  return {txt:"\u25bc "+p, col:"var(--red)", cls:"bw-water-lo"};
}

// ═══════════════════════════════════════════════
//  GOLDEN BOOT — REAL PHOTOS VIA WIKIPEDIA API
// ═══════════════════════════════════════════════
function renderScorer() {
  const el = document.getElementById("scorerGrid");
  if (!el) return;

  // Clean intro bar — no emoji icon
  const intro = document.createElement("div");
  intro.style.cssText = "background:#fff;border:1px solid var(--border);border-radius:var(--r2);padding:14px 18px;margin-bottom:20px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;box-shadow:var(--shadow)";
  intro.innerHTML =
    "<div>" +
      "<div style=\"font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:800;color:var(--text)\">FIFA World Cup 2026 \u00b7 Golden Boot Race</div>" +
      "<div style=\"font-size:12px;color:var(--text3);margin-top:2px\">Odds: Bet365 &amp; FanDuel (Jun 8 2026) \u00b7 Decimal format \u00b7 Simulation team depth score included</div>" +
    "</div>" +
    "<div style=\"margin-left:auto;display:flex;gap:8px;flex-wrap:wrap\">" +
      "<span style=\"background:var(--green3);color:var(--green);font-size:11px;font-weight:700;padding:4px 10px;border-radius:100px\">\u2713 Strong pick</span>" +
      "<span style=\"background:var(--amber2);color:var(--amber);font-size:11px;font-weight:700;padding:4px 10px;border-radius:100px\">\u25d0 Each-way</span>" +
      "<span style=\"background:var(--page);color:var(--text3);font-size:11px;font-weight:700;padding:4px 10px;border-radius:100px\">\u2014 Long shot</span>" +
    "</div>";
  el.appendChild(intro);

  const grid = document.createElement("div");
  grid.className = "bw-scorer-grid";

  TOP_SCORERS.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = "bw-scorer-card spring-in" + (i < 2 ? " top" : "");
    card.style.animationDelay = (i * 0.06) + "s";

    const edgeLabel = p.edge==="strong" ? "\u2713 Strong pick" :
                      p.edge==="value"  ? "\u25d0 Each-way value" :
                      p.edge==="slight" ? "\u25d0 Slight edge" : "\u2014 Long shot";
    const edgeCss = p.edge==="strong" ? "background:var(--green3);color:var(--green)" :
                    (p.edge==="value"||p.edge==="slight") ? "background:var(--amber2);color:var(--amber)" :
                    "background:var(--page);color:var(--text3)";
    const impliedPct = (1/p.decimal*100).toFixed(1);

    // Photo face area — real photo loads async via Wikipedia API
    const faceDiv = document.createElement("div");
    faceDiv.className = "bw-player-face";

    // Actual photo img — src populated async by loadPlayerPhotos()
    const img = document.createElement("img");
    img.className = "bw-player-photo";
    img.alt = p.name;
    img.dataset.player = p.name;
    img.style.cssText = "width:100%;height:100%;object-fit:cover;object-position:center top;display:block;opacity:0;transition:opacity 0.5s ease";
    img.onerror = function() {
      this.style.display = "none";
      const fb = this.nextElementSibling;
      if (fb) fb.style.display = "flex";
    };

    // SVG fallback (jersey-style avatar)
    const svgFb = document.createElement("div");
    svgFb.style.cssText = "width:100%;height:100%;display:flex;align-items:center;justify-content:center";
    svgFb.innerHTML = buildSVGAvatar(p);

    faceDiv.appendChild(img);
    faceDiv.appendChild(svgFb);

    // Rank number overlay
    const rankDiv = document.createElement("div");
    rankDiv.className = "bw-rank-num";
    rankDiv.textContent = p.rank;
    faceDiv.appendChild(rankDiv);

    // Country flag badge
    const flagBadge = document.createElement("div");
    flagBadge.className = "bw-photo-flag-badge";
    flagBadge.innerHTML = "<span class='pf-flag'>" + p.flag + "</span><span class='pf-name'>" + p.team + "</span>";
    faceDiv.appendChild(flagBadge);

    if (i < 2) {
      const topBadge = document.createElement("div");
      topBadge.className = "bw-top-badge";
      topBadge.textContent = "FAVOURITE";
      faceDiv.appendChild(topBadge);
    }

    card.appendChild(faceDiv);

    // Info section
    const infoDiv = document.createElement("div");
    infoDiv.className = "bw-scorer-info";
    infoDiv.innerHTML =
      "<div style='display:flex;align-items:center;gap:6px;margin-bottom:4px'>" +
        "<span class='bw-scorer-pos'>" + p.pos + "</span>" +
        "<span style='font-size:11px;font-weight:700;padding:3px 8px;border-radius:100px;margin-left:auto;" + edgeCss + "'>" + edgeLabel + "</span>" +
      "</div>" +
      "<div class='bw-scorer-name'>" + p.name + "</div>" +
      "<div class='bw-scorer-team'><span>" + p.flag + " " + p.team + "</span><span style='color:var(--text3);font-size:11px'> &middot; " + p.club + "</span></div>" +
      "<div class='bw-scorer-odds-row'>" +
        "<div class='bw-scorer-odds-box'><span class='bw-scorer-odds-label'>DECIMAL</span><span class='bw-scorer-odds-val' style='color:" + (i<2?"var(--green)":"var(--text)") + "'>" + p.decimal.toFixed(2) + "</span></div>" +
        "<div class='bw-scorer-odds-box'><span class='bw-scorer-odds-label'>US ODDS</span><span class='bw-scorer-odds-val'>" + p.american + "</span></div>" +
      "</div>" +
      "<div class='bw-scorer-sim'><strong>Sim note:</strong> " + p.simNote + "</div>" +
      "<div style='display:flex;gap:5px;flex-wrap:wrap;margin-top:8px'>" +
        [p.stat1,p.stat2,p.stat3].map(s =>
          "<span style='font-size:9px;background:var(--page);border:1px solid var(--border);border-radius:4px;padding:2px 6px;color:var(--text2)'>" + s + "</span>"
        ).join("") +
      "</div>" +
      "<div style='margin-top:8px;font-size:10px;color:var(--text3)'>Market implied: " + impliedPct + "% chance of winning Golden Boot</div>";

    card.appendChild(infoDiv);
    grid.appendChild(card);
  });

  el.appendChild(grid);

  // Load real player photos asynchronously from Wikipedia API
  loadPlayerPhotos();
}

// ── SVG AVATAR FALLBACK ──
function buildSVGAvatar(p) {
  const c1 = p.col1 || "#1a1f2e", c2 = p.col2 || "#fff";
  function darkenHex(hex, amt) {
    try {
      const n = parseInt(hex.replace("#",""),16);
      const r = Math.max(0,(n>>16)-amt), g = Math.max(0,((n>>8)&0xff)-amt), b = Math.max(0,(n&0xff)-amt);
      return "#"+((r<<16)|(g<<8)|b).toString(16).padStart(6,"0");
    } catch(e) { return hex; }
  }
  const dark1 = darkenHex(c1, 40);
  const skin = "#f0c8a0", hair = "#2a1a0a";
  return '<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%">' +
    '<defs><linearGradient id="g'+p.rank+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="'+c1+'"/><stop offset="100%" stop-color="'+dark1+'"/></linearGradient></defs>' +
    '<rect width="200" height="140" fill="url(#g'+p.rank+')"/>' +
    '<path d="M60 140 L60 88 Q65 82 75 80 L88 77 L100 74 L112 77 L125 80 Q135 82 140 88 L140 140 Z" fill="'+c1+'" stroke="'+c2+'" stroke-width="2"/>' +
    '<path d="M88 77 Q100 83 112 77 Q108 68 100 67 Q92 68 88 77Z" fill="'+c2+'"/>' +
    '<text x="100" y="118" text-anchor="middle" font-family="Barlow Condensed,sans-serif" font-weight="900" font-size="24" fill="rgba(255,255,255,0.9)" letter-spacing="2">'+p.jersey+'</text>' +
    '<rect x="93" y="60" width="14" height="12" rx="7" fill="'+skin+'"/>' +
    '<ellipse cx="100" cy="52" rx="20" ry="22" fill="'+skin+'"/>' +
    '<path d="M80 46 Q82 28 100 28 Q118 28 120 46 Q112 38 100 37 Q88 38 80 46Z" fill="'+hair+'"/>' +
    '<ellipse cx="93" cy="50" rx="3" ry="2.5" fill="#1a1a1a"/><ellipse cx="107" cy="50" rx="3" ry="2.5" fill="#1a1a1a"/>' +
    '<circle cx="94" cy="49" r="1" fill="white" opacity="0.7"/><circle cx="108" cy="49" r="1" fill="white" opacity="0.7"/>' +
    '<rect x="0" y="124" width="200" height="16" fill="rgba(0,0,0,0.35)"/>' +
    '<text x="100" y="136" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" font-weight="600" fill="rgba(255,255,255,0.85)">'+p.flag+'  '+p.team.toUpperCase()+'</text>' +
    '</svg>';
}

// ── ASYNC WIKIPEDIA PHOTO LOADER ──
// Calls Wikipedia REST API from the browser (CORS-safe with origin=*)
// Wikipedia page titles that differ from player name in TOP_SCORERS
const WIKI_TITLES = {
  "Vinícius Jr.":    "Vinícius_Júnior",
  "Lamine Yamal":    "Lamine_Yamal",
  "Mikel Oyarzabal": "Mikel_Oyarzabal",
  "Lautaro Martínez":"Lautaro_Martínez",
  "Cristiano Ronaldo":"Cristiano_Ronaldo",
};

async function loadPlayerPhotos() {
  if (typeof TOP_SCORERS === "undefined") return;
  for (const p of TOP_SCORERS) {
    try {
      const rawTitle = WIKI_TITLES[p.name] || p.name.replace(/ /g, "_");
      const name = encodeURIComponent(rawTitle);
      const apiUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=" + name + "&prop=pageimages&pithumbsize=400&format=json&origin=*";
      const res = await fetch(apiUrl, { cache: "force-cache" });
      const data = await res.json();
      const pages = Object.values(data?.query?.pages || {});
      const thumb = pages[0]?.thumbnail?.source;
      if (!thumb) continue;

      // Find all img tags for this player and update src
      document.querySelectorAll("img[data-player='" + p.name.replace(/'/g, "\\'") + "']").forEach(img => {
        img.onload = function() {
          this.style.opacity = "1";
          // Hide SVG fallback when real photo loads
          const fb = this.nextElementSibling;
          if (fb) fb.style.display = "none";
        };
        img.src = thumb;
      });
    } catch(e) { /* silent — SVG fallback stays visible */ }
  }
}

// ═══════════════════════════════════════════════
//  H2H SELECTOR + PANEL
// ═══════════════════════════════════════════════
const ABBR = {FRA:"FRA",ESP:"ESP",ARG:"ARG",ENG:"ENG",BRA:"BRA",POR:"POR",GER:"GER",MAR:"MAR",USA:"USA",NED:"NED",COL:"COL",URU:"URU",JPN:"JPN",BEL:"BEL",CRO:"CRO",SEN:"SEN"};

function renderH2HSelectors() {
  ["A","B"].forEach(side => {
    const grid = document.getElementById("selectorGrid"+side);
    if (!grid) return;
    Object.keys(TEAMS).forEach(id => {
      const t = TEAMS[id];
      const pill = document.createElement("div");
      pill.className = "selector-pill" + ((side==="A"&&id===selectedA)||(side==="B"&&id===selectedB)?" selected":"");
      pill.dataset.id = id; pill.dataset.side = side;
      pill.innerHTML = "<span class='sp-flag'>" + t.flag + "</span><span class='sp-name'>" + t.name.split(" ")[0] + "</span>";
      pill.onclick = () => selectTeam(side, id);
      grid.appendChild(pill);
    });
  });
}

function selectTeam(side, id) {
  if (side==="A") { if(id===selectedB) selectedB=selectedA; selectedA=id; }
  else { if(id===selectedA) selectedA=selectedB; selectedB=id; }
  refreshSelectors(); renderH2H(selectedA, selectedB);
}
function swapTeams() { [selectedA,selectedB]=[selectedB,selectedA]; refreshSelectors(); renderH2H(selectedA,selectedB); }
function refreshSelectors() {
  document.querySelectorAll(".selector-pill").forEach(p => {
    p.classList.toggle("selected", (p.dataset.side==="A"&&p.dataset.id===selectedA)||(p.dataset.side==="B"&&p.dataset.id===selectedB));
  });
}

function renderH2H(aId, bId) {
  const panel = document.getElementById("h2hPanel");
  if (!panel) return;
  if (aId===bId) { panel.innerHTML="<div class='h2h-empty'>Select two different teams</div>"; return; }
  const tA=TEAMS[aId], tB=TEAMS[bId];
  if (!tA||!tB) { panel.innerHTML="<div class='h2h-empty'>Team data not found</div>"; return; }
  const pA=baseWinProb(aId,bId), pB=1-pA;
  const pAp=(pA*100).toFixed(1), pBp=(pB*100).toFixed(1);
  const ovrA=overallRating(aId), ovrB=overallRating(bId);
  const colA="#1d4ed8", colB="#00a551";
  const statKeys=["atk","mid","def","gk","form","exp","depth"];
  const statLabels={atk:"ATTACK",mid:"MIDFIELD",def:"DEFENSE",gk:"GK",form:"FORM",exp:"EXP",depth:"DEPTH"};
  const STAT_COLORS={atk:"#f97316",mid:"#8b5cf6",def:"#0ea5e9",gk:"#eab308",form:"#22c55e",depth:"#3b82f6",exp:"#ec4899"};
  let bigKey="atk", bigGap=0;
  statKeys.forEach(k => { const d=Math.abs(tA.stats[k]-tB.stats[k]); if(d>bigGap){bigGap=d;bigKey=k;} });

  const statRowsHtml = statKeys.map(k => {
    const vA=tA.stats[k], vB=tB.stats[k], diff=vA-vB, isBig=k===bigKey;
    const bwA=Math.round(vA*0.7), bwB=Math.round(vB*0.7);
    const absDiff=Math.abs(diff);
    const edgeHtml = absDiff<2 ? "<span class='h2h-edge-tag edge-tie'>EVEN</span>" :
                     isBig ? "<span class='h2h-edge-tag edge-big'>+" + absDiff + " GAP</span>" :
                     diff>0 ? "<span class='h2h-edge-tag edge-a'>+" + absDiff + " " + (ABBR[aId]||aId) + "</span>" :
                              "<span class='h2h-edge-tag edge-b'>+" + absDiff + " " + (ABBR[bId]||bId) + "</span>";
    const vAColor = diff>0?colA:diff<0?"var(--text3)":"var(--text2)";
    const vBColor = diff<0?colB:diff>0?"var(--text3)":"var(--text2)";
    const barCol = STAT_COLORS[k]||"#888";
    return "<div class='h2h-stat-row" + (isBig?" highlight":"") + "'>" +
      "<div class='h2h-val" + (diff<0?" muted":"") + "' style='color:" + vAColor + "'>" + vA + "</div>" +
      "<div class='h2h-bar-l'><div class='h2h-bar-seg' style='width:" + bwA + "px;background:" + barCol + ";opacity:" + (diff>=0?1:0.4) + "'></div></div>" +
      "<div class='h2h-stat-label" + (isBig?" hl":"") + "'>" + (statLabels[k]||k) + "</div>" +
      "<div class='h2h-bar-r'><div class='h2h-bar-seg' style='width:" + bwB + "px;background:" + barCol + ";opacity:" + (diff<=0?1:0.4) + "'></div></div>" +
      "<div class='h2h-val" + (diff>0?" muted":"") + "' style='color:" + vBColor + "'>" + vB + "</div>" +
    "</div>";
  }).join("");

  const favTeam=pA>=0.5?tA:tB, favPct=pA>=0.5?pAp:pBp;
  const insight = "<strong>" + favTeam.name + "</strong> are favoured at <strong>" + favPct + "%</strong>. Biggest stat gap: <strong>" + (statLabels[bigKey]||bigKey) + "</strong> (+" + bigGap + " pts). " + (favTeam.edge||"");

  panel.innerHTML =
    "<div class='h2h-header'>" +
      "<div class='h2h-team-col'><div class='h2h-abbr' style='color:" + colA + "'>" + tA.flag + " " + (ABBR[aId]||aId) + "</div><div class='h2h-team-name'>" + tA.name + "</div><div class='h2h-team-sub'>" + (tA.history||"").split("·")[0].trim() + "</div><div class='h2h-win-pct' style='color:" + (pA>=0.5?"#4ade80":colA) + "'>" + pAp + "%</div><div class='h2h-win-label'>win probability</div></div>" +
      "<div class='h2h-center-col'><div class='h2h-stage-badge'>HEAD-TO-HEAD</div><div class='h2h-ovr-compare'><span class='h2h-ovr-num' style='color:" + colA + "'>" + ovrA + "</span><span style='color:rgba(255,255,255,.3);margin:0 5px'>vs</span><span class='h2h-ovr-num' style='color:" + colB + "'>" + ovrB + "</span></div><div style='font-size:9px;color:rgba(255,255,255,.3);margin-top:3px;letter-spacing:.06em'>OVR RATING</div></div>" +
      "<div class='h2h-team-col'><div class='h2h-abbr' style='color:" + colB + "'>" + tB.flag + " " + (ABBR[bId]||bId) + "</div><div class='h2h-team-name'>" + tB.name + "</div><div class='h2h-team-sub'>" + (tB.history||"").split("·")[0].trim() + "</div><div class='h2h-win-pct' style='color:" + (pB>pA?"#4ade80":colB) + "'>" + pBp + "%</div><div class='h2h-win-label'>win probability</div></div>" +
    "</div>" +
    "<div class='h2h-prob-wrap'><div class='h2h-prob-track'><div class='h2h-prob-fill' style='width:" + pAp + "%'></div></div><div class='h2h-prob-labels'><span style='color:" + colA + ";font-weight:700'>" + tA.name + " " + pAp + "%</span><span style='color:rgba(255,255,255,.3);font-size:9px'>model \u00b1 14% noise</span><span style='color:" + colB + ";font-weight:700'>" + pBp + "% " + tB.name + "</span></div></div>" +
    "<div class='h2h-stats'><div class='h2h-stat-grid'>" + statRowsHtml + "</div></div>" +
    "<div class='h2h-insight'>\ud83d\udca1 " + insight + "</div>";
}

// ═══════════════════════════════════════════════
//  BRACKET
// ═══════════════════════════════════════════════
function renderBracket() {
  const leftEl = document.getElementById("bracketLeft"), rightEl = document.getElementById("bracketRight");
  if (!leftEl||!rightEl) return;
  R16.forEach(m => {
    const t1=TEAMS[m.t1], t2=TEAMS[m.t2];
    if (!t1||!t2) return;
    const p1=Math.round(baseWinProb(m.t1,m.t2)*100), p2=100-p1, fav=p1>=p2?m.t1:m.t2;
    const div = document.createElement("div");
    div.className = "bracket-match";
    div.title = "Click to analyse in Head-to-Head";
    div.onclick = () => { selectedA=m.t1; selectedB=m.t2; refreshSelectors(); renderH2H(selectedA,selectedB); };
    div.innerHTML =
      "<div class='bracket-match-stage'>" + m.label + "</div>" +
      "<div class='bracket-team'><span style='font-size:15px'>" + t1.flag + "</span><span class='bracket-team-name' style='" + (fav===m.t1?"color:var(--text);font-weight:700":"color:var(--text3)") + "'>" + t1.name + "</span><span class='bracket-pct' style='color:" + (fav===m.t1?"var(--green)":"var(--text3)") + "'>" + p1 + "%</span></div>" +
      "<div class='bracket-team' style='margin-top:3px'><span style='font-size:15px'>" + t2.flag + "</span><span class='bracket-team-name' style='" + (fav===m.t2?"color:var(--text);font-weight:700":"color:var(--text3)") + "'>" + t2.name + "</span><span class='bracket-pct' style='color:" + (fav===m.t2?"var(--green)":"var(--text3)") + "'>" + p2 + "%</span></div>" +
      "<div class='bracket-bar'><div class='bracket-bar-fill' style='width:" + p1 + "%'></div></div>";
    (m.half==="L" ? leftEl : rightEl).appendChild(div);
  });
}

// ═══════════════════════════════════════════════
//  SIMULATION RESULTS
// ═══════════════════════════════════════════════
function renderResults(data) {
  document.getElementById("simPlaceholder").style.display = "none";
  document.getElementById("simResults").style.display = "block";
  document.getElementById("simBadge").style.display = "inline";
  renderSFProbs(data.sfProbs);
  renderMatchups(data.matchups);
  renderFinalStage(data);
  renderChampion(data);
  renderWinTable(data.winProbs);
  renderVerdicts(data.sfProbs, data.winProbs);
  switchTab("sim", document.querySelector('[data-tab="sim"]'));
}
window.renderResults = renderResults;

function renderSFProbs(sfProbs) {
  const grid = document.getElementById("sfProbGrid"); if (!grid) return;
  grid.innerHTML = "";
  const medals=["🥇","🥈","🥉","4️⃣"], colors=["var(--green)","#a0aec0","#cd7f32","var(--blue)"];
  sfProbs.forEach((item, idx) => {
    const t=TEAMS[item.t]; if(!t) return;
    const isTop4=idx<4, barColor=idx<4?colors[idx]:"var(--border2)", barW=(item.pct/sfProbs[0].pct)*100;
    const row = document.createElement("div");
    row.className = "sf-prob-row fade-in" + (isTop4?" top4":"") + (idx===0?" rank1":"");
    row.style.animationDelay = (idx*.05)+"s"; row.style.cursor="pointer";
    row.onclick = () => { selectedA=item.t; if(selectedB===item.t) selectedB=sfProbs[idx===0?1:0].t; refreshSelectors(); renderH2H(selectedA,selectedB); switchTab("bracket",document.querySelector("[data-tab='bracket']")); };
    const tagHtml = idx<4 ? "<span class='prob-tag tag-sf'>" + (idx===0?"🏆 Top":"SF") + "</span>" : idx<6 ? "<span class='prob-tag tag-dark'>Dark horse</span>" : "";
    row.innerHTML =
      "<div class='prob-rank' style='color:" + barColor + "'>" + (isTop4?medals[idx]:idx+1) + "</div>" +
      "<div class='prob-flag-lg'>" + t.flag + "</div>" +
      "<div class='prob-name-col'><div class='prob-name-lg'>" + t.name + "</div>" + (isTop4?"<div class='prob-record-sm'>"+t.record+"</div>":"") + "</div>" +
      "<div class='prob-bar-col'><div class='prob-bar-lg'><div class='prob-bar-lg-fill' style='width:" + barW + "%;background:" + barColor + "'></div></div></div>" +
      "<div class='prob-pct-lg' style='color:" + barColor + "'>" + item.pct.toFixed(1) + "%</div>" +
      tagHtml;
    grid.appendChild(row);
  });
}

function renderMatchups(matchups) {
  const grid = document.getElementById("matchupGrid"); if (!grid) return;
  grid.innerHTML = "";
  matchups.forEach((m, idx) => {
    const t1=TEAMS[m.t1], t2=TEAMS[m.t2]; if(!t1||!t2) return;
    const card = document.createElement("div");
    card.className = "matchup-card fade-in" + (idx===0?" top":"");
    card.style.animationDelay = (idx*.06)+"s"; card.style.cursor="pointer";
    card.onclick = () => { selectedA=m.t1; selectedB=m.t2; refreshSelectors(); renderH2H(selectedA,selectedB); switchTab("bracket",document.querySelector("[data-tab='bracket']")); };
    card.innerHTML =
      (idx===0 ? "<div class='matchup-top-tag'>MOST LIKELY</div>" : "") +
      "<div class='matchup-teams'><div class='matchup-team'><div class='matchup-flag'>" + t1.flag + "</div><div class='matchup-name'>" + t1.name + "</div></div><div class='matchup-vs'>VS</div><div class='matchup-team'><div class='matchup-flag'>" + t2.flag + "</div><div class='matchup-name'>" + t2.name + "</div></div></div>" +
      "<div class='matchup-pct-row'><span class='matchup-pct-val'>" + m.pct.toFixed(1) + "%</span><span class='matchup-pct-label'> probability</span></div>";
    grid.appendChild(card);
  });
}

function renderFinalStage(data) {
  const el = document.getElementById("finalStage"); if (!el) return;
  const p1=data.t1WinPct>=data.t2WinPct?data.t1WinPct:data.t2WinPct;
  const teamA=data.t1WinPct>=data.t2WinPct?data.topFinal.t1:data.topFinal.t2;
  const teamB=teamA===data.topFinal.t1?data.topFinal.t2:data.topFinal.t1;
  const tA=TEAMS[teamA], tB=TEAMS[teamB]; if(!tA||!tB) return;
  el.innerHTML =
    "<div class='final-badge'>🏆 THE FINAL &middot; JULY 19 &middot; METLIFE STADIUM, NEW JERSEY</div>" +
    "<div class='final-matchup'>" +
      "<div class='final-team'><div class='final-flag'>" + tA.flag + "</div><div class='final-name'>" + tA.name + "</div><div class='final-sub'>SF1 Winner</div><div class='final-pct' style='color:#4ade80'>" + p1.toFixed(1) + "%</div><div style='font-size:10px;color:rgba(255,255,255,.4);margin-top:2px'>to win Final</div></div>" +
      "<div class='final-vs'>FINAL<br><span>JUL 19</span></div>" +
      "<div class='final-team'><div class='final-flag'>" + tB.flag + "</div><div class='final-name'>" + tB.name + "</div><div class='final-sub'>SF2 Winner</div><div class='final-pct' style='color:rgba(255,255,255,.5)'>" + (100-p1).toFixed(1) + "%</div><div style='font-size:10px;color:rgba(255,255,255,.4);margin-top:2px'>to win Final</div></div>" +
    "</div>" +
    "<div class='final-bar'><div style='width:" + p1 + "%;height:100%;background:var(--green);border-radius:3px'></div></div>" +
    "<div style='display:flex;justify-content:space-between;font-size:10px;margin-top:5px;color:rgba(255,255,255,.4)'><span style='color:var(--green);font-weight:700'>" + tA.name + " " + p1.toFixed(1) + "%</span><span>&plusmn;14% simulation noise</span><span>" + tB.name + " " + (100-p1).toFixed(1) + "%</span></div>";
}

function renderChampion(data) {
  const el = document.getElementById("championStage"); if (!el) return;
  const t = TEAMS[data.champion]; if (!t) return;
  const winPct = (data.winProbs.find(w=>w.t===data.champion)?.pct||0).toFixed(1);
  const PATHS = {
    FRA:[{stage:"R16",vs:"vs Senegal",pct:"92.5%"},{stage:"QF",vs:"vs Germany",pct:"76.5%"},{stage:"SF",vs:"vs Spain",pct:"59.8%"},{stage:"FINAL",vs:"vs Argentina",pct:(100-data.t2WinPct).toFixed(1)+"%"}],
    ARG:[{stage:"R16",vs:"vs Colombia",pct:"84.0%"},{stage:"QF",vs:"vs Brazil",pct:"62.1%"},{stage:"SF",vs:"vs England",pct:"69.3%"},{stage:"FINAL",vs:"vs France",pct:(100-data.t1WinPct).toFixed(1)+"%"}],
    ESP:[{stage:"R16",vs:"vs Japan",pct:"86.3%"},{stage:"QF",vs:"vs Morocco",pct:"75.2%"},{stage:"SF",vs:"vs France",pct:"40.2%"},{stage:"FINAL",vs:"vs Argentina",pct:"50%"}],
    ENG:[{stage:"R16",vs:"vs Croatia",pct:"71.0%"},{stage:"QF",vs:"vs Portugal",pct:"52.7%"},{stage:"SF",vs:"vs Argentina",pct:"30.7%"},{stage:"FINAL",vs:"vs France",pct:"46%"}],
  };
  const path = PATHS[data.champion] || [{stage:"R16",vs:"Strong run",pct:"—"},{stage:"QF",vs:"Upset run",pct:"—"},{stage:"SF",vs:"Semi-final",pct:"—"},{stage:"FINAL",vs:"Won it",pct:winPct+"%"}];
  const pathHtml = path.map((p,i) =>
    "<div class='path-step'>" + (i>0?"<div class='path-arrow'>\u2192</div>":"") + "<div class='path-box'><div class='path-stage'>" + p.stage + "</div><div class='path-opponent'>" + p.vs + "</div><div class='path-pct'>" + p.pct + "</div></div></div>"
  ).join("");
  el.innerHTML =
    "<div class='champion-eyebrow'>🏆 WORLD CUP CHAMPION — 2026</div>" +
    "<div class='champion-flag'>" + t.flag + "</div>" +
    "<div class='champion-name'>" + t.name + "</div>" +
    "<div class='champion-sub'>" + (t.history||"") + "</div>" +
    "<div class='champion-prob-box'><div class='champion-prob-num'>" + winPct + "%</div><div><div class='champion-prob-main'>Probability to win tournament</div><div class='champion-prob-sub'>from 100,000 simulation runs</div></div></div>" +
    "<div class='champion-path'>" + pathHtml + "</div>";
}

function renderWinTable(winProbs) {
  const el = document.getElementById("winTable"); if (!el) return;
  el.className = "win-table"; el.innerHTML = "";
  const maxPct=winProbs[0].pct, colors=["var(--green)","#a0aec0","#cd7f32","var(--blue)"];
  winProbs.forEach((item, idx) => {
    const t=TEAMS[item.t]; if(!t) return;
    const barW=(item.pct/maxPct)*100, barColor=idx<4?colors[idx]:"var(--border2)";
    const note=idx===0?"🏆 Champion":idx===1?"Runner-up":idx===2?"3rd place":idx===3?"4th place":idx<6?"QF exit":"";
    const row = document.createElement("div");
    row.className = "win-row fade-in" + (idx===0?" w1":"");
    row.style.animationDelay=(idx*.04)+"s"; row.style.cursor="pointer";
    row.onclick = () => { selectedA=item.t; if(selectedB===item.t) selectedB=winProbs[idx===0?1:0].t; refreshSelectors(); renderH2H(selectedA,selectedB); switchTab("bracket",document.querySelector("[data-tab='bracket']")); };
    row.innerHTML =
      "<div class='win-rank' style='color:" + barColor + "'>" + (idx+1) + "</div>" +
      "<div class='win-flag'>" + t.flag + "</div>" +
      "<div class='win-name'>" + t.name + "</div>" +
      "<div class='win-bar-col'><div class='win-bar-fill' style='width:" + barW + "%;background:" + barColor + "'></div></div>" +
      "<div class='win-pct' style='color:" + barColor + "'>" + item.pct.toFixed(1) + "%</div>" +
      (note ? "<div class='win-note'>" + note + "</div>" : "");
    el.appendChild(row);
  });
}

function renderVerdicts(sfProbs, winProbs) {
  const old = document.getElementById("verdictSection"); if (old) old.remove();
  const anchor = document.getElementById("simResults"); if (!anchor) return;
  const champion = winProbs[0].t, runnerUp = winProbs[1].t;
  const champ = TEAMS[champion], runner = TEAMS[runnerUp]; if (!champ||!runner) return;
  const champWin = winProbs[0].pct, runnerWin = winProbs[1].pct;
  const PDATA = typeof PLAYER_DATA !== "undefined" ? PLAYER_DATA : {};
  const medals=["🥇","🥈","🥉","4️⃣"], colors=["var(--green)","#a0aec0","#cd7f32","var(--blue)"];
  const KO_PATH={FRA:[{stage:"R16",vs:"vs Senegal",pct:92.5},{stage:"QF",vs:"vs Germany",pct:76.5},{stage:"SF",vs:"vs Spain",pct:59.8}],ESP:[{stage:"R16",vs:"vs Japan",pct:86.3},{stage:"QF",vs:"vs Morocco",pct:75.2},{stage:"SF",vs:"vs France",pct:40.2}],ARG:[{stage:"R16",vs:"vs Colombia",pct:84.0},{stage:"QF",vs:"vs Brazil",pct:62.1},{stage:"SF",vs:"vs England",pct:69.3}],ENG:[{stage:"R16",vs:"vs Croatia",pct:71.0},{stage:"QF",vs:"vs Portugal",pct:52.7},{stage:"SF",vs:"vs Argentina",pct:30.7}]};
  const THREAT={FRA:5,ESP:5,ARG:5,ENG:4,BRA:4,POR:4,GER:3,MAR:3,URU:2,NED:2,COL:2,JPN:2,BEL:2,CRO:2,SEN:1,USA:1};
  const duelsHtml = [[PDATA[champion]?.[0],PDATA[runnerUp]?.[0],"ATTACK"],[PDATA[champion]?.[1],PDATA[runnerUp]?.[1],"GK"],[PDATA[champion]?.[2],PDATA[runnerUp]?.[2],"MIDFIELD"]]
    .filter(d=>d[0]&&d[1])
    .map(d => "<div class='fvb-duel'><div><div class='fvb-player-name'>" + d[0].name.split(" ").pop() + "</div><div class='fvb-player-role'>" + champ.flag + " " + d[0].role + "</div></div><div class='fvb-duel-vs'>VS</div><div><div class='fvb-player-name'>" + d[1].name.split(" ").pop() + "</div><div class='fvb-player-role'>" + runner.flag + " " + d[1].role + "</div></div></div>")
    .join("");
  const cardsHtml = sfProbs.slice(0,4).map((item, idx) => {
    const t=TEAMS[item.t]; if(!t) return "";
    const pData=PDATA[item.t]||[], path=KO_PATH[item.t]||[], threat=THREAT[item.t]||3;
    const winPct=(winProbs.find(w=>w.t===item.t)?.pct||0).toFixed(1);
    const isChamp=item.t===champion;
    const playersHtml = pData.slice(0,3).map(p =>
      "<div class='verdict-player'><div class='player-avatar' style='background:" + p.col + "22;color:" + p.col + ";border:1.5px solid " + p.col + "44'>" + p.init + "</div><div class='player-details'><div class='player-name'>" + p.name + "</div><div class='player-club'>" + p.club + "</div><div class='player-role-bar'><span class='player-role-label'>" + p.role + "</span><span class='player-rating-pill' style='background:" + p.col + "20;color:" + p.col + "'>" + p.rating + "</span></div></div></div><div class='player-desc'>" + p.desc + "</div>"
    ).join("");
    const pathChips = path.map(s =>
      "<div class='path-chip'><span>vs " + s.vs.replace("vs ","") + "</span><span class='chip-pct' style='color:" + (s.pct>=70?"var(--green)":s.pct>=50?"var(--amber)":"var(--red)") + "'>" + s.pct + "%</span></div>"
    ).join("");
    const threatDots = Array.from({length:5},(_,i) =>
      "<div class='threat-dot" + (i<threat?" active":"") + "' style='" + (i<threat?"background:"+colors[Math.min(idx,3)]:"") + "'></div>"
    ).join("");
    return "<div class='verdict-card fade-in " + (idx===0?"rank1":"") + "' style='animation-delay:" + (idx*.1) + "s'>" +
      "<div class='verdict-card-header'><div class='verdict-rank-badge' style='color:" + colors[idx] + "'>" + medals[idx] + "</div><div class='verdict-flag'>" + t.flag + "</div><div><div class='verdict-team-name' style='color:" + colors[idx] + "'>" + t.name + "</div><div class='verdict-sf-pct' style='color:" + colors[idx] + "'>" + item.pct.toFixed(1) + "% SF &middot; " + winPct + "% Title</div><div class='verdict-history'>" + (t.history||"") + "</div></div>" + (isChamp?"<div style='font-size:20px;margin-left:auto'>🏆</div>":"") + "</div>" +
      "<div class='verdict-body'><div class='verdict-label'>🎯 Key Players</div><div class='verdict-players'>" + playersHtml + "</div><div class='verdict-label'>⚡ Why They Win</div><div class='verdict-why'>" + (t.edge||"") + "</div><div class='verdict-label'>🗺 Knockout Path</div><div class='verdict-path'>" + pathChips + "</div><div class='threat-meter'><span class='threat-label'>THREAT</span><div class='threat-dots'>" + threatDots + "</div><span class='threat-val' style='color:" + colors[idx] + "'>" + ["ELITE","HIGH","STRONG","REAL"][idx] + "</span></div></div>" +
    "</div>";
  }).join("");
  const dh=sfProbs[4], dhT=TEAMS[dh?.t];
  const dhHtml = dh&&dhT ? "<div class='dark-horse-strip fade-in'><div class='dh-icon'>" + dhT.flag + "</div><div><div class='dh-title'>\uD83D\uDC0E DARK HORSE: " + dhT.name.toUpperCase() + " &mdash; " + dh.pct.toFixed(1) + "% SF PROBABILITY</div><div class='dh-body'><strong>" + (PDATA[dh.t]?.[0]?.name||dhT.players?.[0]||"") + "</strong>: " + (dhT.edge||"") + "</div></div></div>" : "";
  const wrapper = document.createElement("div");
  wrapper.id = "verdictSection";
  wrapper.innerHTML =
    "<h2 class='bw-section-h2'>🏆 Simulation Verdict — Top 4 Analysis</h2>" +
    "<div class='final-verdict-banner fade-in'><div class='fvb-title'>⚡ SIMULATION VERDICT — THE FINAL</div><div class='fvb-body'>Predicted Final: <strong>" + champ.flag + " " + champ.name + " vs " + runner.flag + " " + runner.name + "</strong>. " + champ.name + " edge at <strong>" + champWin.toFixed(1) + "%</strong> &mdash; margin of <strong>" + (champWin-runnerWin).toFixed(1) + "pp</strong> across 100,000 runs.</div><div class='fvb-duels'>" + duelsHtml + "</div></div>" +
    "<div class='verdict-grid'>" + cardsHtml + "</div>" + dhHtml;
  anchor.appendChild(wrapper);
}

// ═══════════════════════════════════════════════
//  PREDICTION ACCURACY BOARD
//  Actual RESULTS vs model: exact score, BIG/SMALL, AH pick, winner
// ═══════════════════════════════════════════════
function renderAccuracy() {
  const el = document.getElementById("accuracyBoard");
  if (!el) return;
  el.innerHTML = "";
  const played = MATCHES.filter(m => typeof RESULTS !== "undefined" && RESULTS[m.id]);

  if (!played.length) {
    el.innerHTML = "<div style='padding:48px;text-align:center;background:var(--white);border:1px solid var(--border);border-radius:var(--r)'>" +
      "<div style='font-size:34px;margin-bottom:10px'>📊</div>" +
      "<div style='font-weight:700;font-size:15px;color:var(--text)'>No completed matches yet</div>" +
      "<div style='font-size:12px;color:var(--text3);margin-top:6px'>Tournament starts Jun 11. As each match completes and its score is recorded in results.js, this board shows prediction vs actual with a running accuracy index.</div></div>";
    return;
  }

  let scoreHit=0, bsHit=0, ahHit=0, winnerHit=0;
  const rows = [];
  played.forEach(m => {
    const r = RESULTS[m.id];
    const sc = predictScore(m);
    const actBig = (r.home + r.away) >= 3;
    const exScore = (sc.gH === r.home && sc.gA === r.away);
    const bsOk = (sc.isBig === actBig);
    const predWinner = m.simHomeWin >= 50 ? "H" : "A";
    const actWinner = r.home > r.away ? "H" : (r.away > r.home ? "A" : "D");
    const winOk = predWinner === actWinner;
    const margin = r.home - r.away;
    const backedHome = m.recLabel.indexOf(m.homeCode) !== -1;
    const adj = backedHome ? (margin + m.ah.line) : (-margin - m.ah.line);
    const ahOk = adj > 0;
    if (exScore) scoreHit++;
    if (bsOk) bsHit++;
    if (ahOk) ahHit++;
    if (winOk) winnerHit++;
    rows.push("<div class='bw-ah-row' style='grid-template-columns:1.4fr 1fr 1fr 1fr 1fr'>" +
      "<div><div class='bw-ah-match-date'>" + m.date + " · " + (m.group||m.stage) + "</div>" +
      "<div class='bw-ah-teams'>" + m.home + " " + r.home + " – " + r.away + " " + m.away + "</div></div>" +
      "<div style='font-size:12px'>Pred: <b>" + sc.gH + "–" + sc.gA + "</b><br>" + (exScore?"<span style='color:var(--green)'>✓ exact</span>":"<span style='color:var(--text3)'>✗</span>") + "</div>" +
      "<div style='font-size:12px'>" + (sc.isBig?"BIG":"SMALL") + " pred<br>" + (bsOk?"<span style='color:var(--green)'>✓ hit</span>":"<span style='color:var(--red)'>✗ miss</span>") + "</div>" +
      "<div style='font-size:12px'>" + m.recLabel.replace("🔥 ","").replace("✓ ","") + "<br>" + (ahOk?"<span style='color:var(--green)'>✓ covered</span>":"<span style='color:var(--red)'>✗ lost</span>") + "</div>" +
      "<div style='font-size:12px'>Winner<br>" + (winOk?"<span style='color:var(--green)'>✓</span>":"<span style='color:var(--red)'>✗</span>") + "</div>" +
    "</div>");
  });

  const n = played.length;
  const pct = x => Math.round(x/n*100);
  const overall = Math.round((scoreHit + bsHit + ahHit + winnerHit) / (n*4) * 100);
  el.innerHTML =
    "<div style='display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:18px'>" +
      accCard("Overall Index", overall+"%", "across all 4 metrics") +
      accCard("Exact Score", pct(scoreHit)+"%", scoreHit+"/"+n) +
      accCard("BIG / SMALL", pct(bsHit)+"%", bsHit+"/"+n) +
      accCard("AH Pick", pct(ahHit)+"%", ahHit+"/"+n) +
      accCard("Winner", pct(winnerHit)+"%", winnerHit+"/"+n) +
    "</div>" + rows.join("");
}
function accCard(t,v,s){
  return "<div style='background:var(--white);border:1px solid var(--border);border-radius:var(--r);padding:14px;text-align:center'>" +
    "<div style='font-size:10px;color:var(--text3);letter-spacing:.06em;text-transform:uppercase'>"+t+"</div>" +
    "<div style='font-size:24px;font-weight:800;color:var(--green);font-family:DM Mono,monospace'>"+v+"</div>" +
    "<div style='font-size:10px;color:var(--text3)'>"+s+"</div></div>";
}
document.addEventListener("DOMContentLoaded", () => { try{renderAccuracy();}catch(e){} });
