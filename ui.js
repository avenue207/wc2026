
// ═══════════════════════════════════════════════
//  UI.JS — BETWAY-STYLE COMPLETE RENDERER
// ═══════════════════════════════════════════════

let selectedA = "FRA", selectedB = "ESP";
let activeTab = "matches";

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
  activeTab = tab;
  document.querySelectorAll(".bw-tab").forEach(t => t.classList.remove("active"));
  document.getElementById("tab-" + tab)?.classList.add("active");
  document.querySelectorAll(".bw-pill").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".bw-hn-link").forEach(p => p.classList.remove("active"));
  if (el) {
    el.classList.add("active");
    // sync pills and header links
    const dataTab = el.dataset?.tab || tab;
    document.querySelectorAll(`[data-tab="${dataTab}"]`).forEach(p => p.classList.add("active"));
  }
  const labels = {matches:"Matches",odds:"AH Odds",scorer:"Golden Boot",bracket:"Bracket",sim:"Simulation"};
  const bc = document.getElementById("breadcrumbActive");
  if (bc) bc.textContent = labels[tab] || tab;
}

// ── STAGE FILTER ──
let stageFilter = "all";
function filterStage(stage) {
  stageFilter = stage;
  renderMatches();
  document.querySelectorAll(".bw-sb-link").forEach(l => l.classList.remove("active"));
  event.target.classList.add("active");
}

// ── TEAM OVR ──
// overallRating() defined in data.js

// ── SIM engine refs ──
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

  // Group by date
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
    dh.innerHTML = `<span>${date}</span><span style="color:var(--text3);font-size:10px;margin-left:8px">${stage}</span>`;
    el.appendChild(dh);

    matches.forEach(m => {
      el.appendChild(buildMatchRow(m, cardIdx++));
    });
  });

  if (!list.length) {
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text3);font-size:13px">No matches for this stage</div>`;
  }
}

function buildMatchRow(m, idx) {
  const wdw = WDW_ODDS[m.id] || [2.10, 3.30, 3.70];
  const cfg = REC_CONFIG[m.rec] || REC_CONFIG.neutral;
  const edgeColor = m.edge >= 10 ? "#15803d" : m.edge >= 4 ? "#16a34a" : m.edge >= 0 ? "#b45309" : "#dc2626";
  const edgeClass = m.rec === "strong" ? "se-strong" : m.rec === "value" ? "se-value" : m.rec === "slight" ? "se-slight" : m.rec === "avoid" ? "se-avoid" : "se-neutral";
  const edgeText = m.edge > 0 ? `+${m.edge}% AH` : m.edge === 0 ? "Fair" : `${m.edge}%`;
  const wH = waterLabel(m.ah.homePayout);
  const wA = waterLabel(m.ah.awayPayout);

  const isProjected = m.stage !== "GRP";
  const timeStr = isProjected ? "Projected" : (m.venue || "TBC");

  const row = document.createElement("div");
  row.className = "bw-match-row spring-in";
  row.style.animationDelay = (idx * 0.04) + "s";

  row.innerHTML = `
    <div class="bw-match-time">
      <span>${m.date.split(" ").pop()}</span>
      <span class="bw-date-sm">${m.stage !== "GRP" ? "🔮Proj" : m.group?.replace("Group ","Grp-") || ""}</span>
    </div>

    <div class="bw-teams-col">
      <div class="bw-team-row">
        <span class="bw-team-flag">${m.homeFlag}</span>
        <span class="bw-team-name fav">${m.home}</span>
      </div>
      <div class="bw-team-row" style="margin-top:2px">
        <span class="bw-team-flag">${m.awayFlag}</span>
        <span class="bw-team-name">${m.away}</span>
      </div>
    </div>

    <div class="bw-wdw">
      <button class="bw-odds-btn" onclick="this.classList.toggle('selected')" title="Home win">
        <span class="bw-odds-label">Home</span>${wdw[0].toFixed(2)}
      </button>
      <button class="bw-odds-btn" onclick="this.classList.toggle('selected')" title="Draw">
        <span class="bw-odds-label">Draw</span>${wdw[1].toFixed(2)}
      </button>
      <button class="bw-odds-btn" onclick="this.classList.toggle('selected')" title="Away win">
        <span class="bw-odds-label">Away</span>${wdw[2].toFixed(2)}
      </button>
    </div>

    <div class="bw-ah-col">
      <button class="bw-ah-btn" onclick="this.classList.toggle('selected')" title="${m.ah.homeLabel}">
        <span class="bw-ah-label">${m.homeFlag} ${m.ah.homeLabel}</span>
        <span class="bw-ah-val">${m.ah.homePayout}</span>
        <span class="bw-ah-water" style="color:${wH.col}">${wH.txt}</span>
      </button>
      <button class="bw-ah-btn" onclick="this.classList.toggle('selected')" title="${m.ah.awayLabel}">
        <span class="bw-ah-label">${m.awayFlag} ${m.ah.awayLabel}</span>
        <span class="bw-ah-val">${m.ah.awayPayout}</span>
        <span class="bw-ah-water" style="color:${wA.col}">${wA.txt}</span>
      </button>
    </div>

    <div>
      <span class="bw-sim-edge ${edgeClass}">${edgeText}</span>
      ${m.rec === "strong" || m.rec === "value" ? `<div style="font-size:9px;color:var(--green);margin-top:3px;font-weight:600">SIM PICK ✓</div>` : ""}
    </div>

    <div class="bw-more-link" onclick="openMatchDetail('${m.id}')">More ›</div>
  `;
  return row;
}

function openMatchDetail(id) {
  const m = MATCHES.find(x => x.id === id);
  if (!m || !TEAMS[m.homeCode] || !TEAMS[m.awayCode]) return;
  selectedA = m.homeCode;
  selectedB = m.awayCode;
  refreshSelectors();
  renderH2H(selectedA, selectedB);
  switchTab("bracket", document.querySelector('[data-tab="bracket"]'));
  setTimeout(() => document.getElementById("tab-bracket")?.scrollIntoView({behavior:"smooth"}), 100);
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
  const list = filter === "all" ? MATCHES :
    filter === "picks" ? MATCHES.filter(m => m.rec === "strong" || m.rec === "value") :
    MATCHES.filter(m => m.rec === filter);

  // Group by stage
  const byStage = {};
  list.forEach(m => { if (!byStage[m.stage]) byStage[m.stage] = []; byStage[m.stage].push(m); });
  const order = ["GRP","R32","R16","QF","SF","F"];
  const sNames = {GRP:"Group Stage",R16:"Round of 16",QF:"Quarter-Finals",SF:"Semi-Finals",F:"Final"};

  let rowIdx = 0;
  order.forEach(sk => {
    if (!byStage[sk]) return;
    const dv = document.createElement("div");
    dv.className = "stage-divider";
    dv.innerHTML = `<span class="stage-divider-label">${sNames[sk]||sk}</span><div class="stage-divider-line"></div>${sk!=="GRP"?'<span class="stage-proj-badge">PROJECTED</span>':""}`;
    el.appendChild(dv);

    byStage[sk].forEach(m => {
      const wH = waterLabel(m.ah.homePayout);
      const wA = waterLabel(m.ah.awayPayout);
      const edgeSign = m.edge >= 0 ? "+" : "";
      const edgeCls = m.edge >= 5 ? "bw-edge-pos" : m.edge < 0 ? "bw-edge-neg" : "bw-edge-neu";

      const row = document.createElement("div");
      row.className = `bw-ah-row rec-${m.rec} spring-in`;
      row.style.animationDelay = (rowIdx++ * 0.03) + "s";
      row.innerHTML = `
        <div class="bw-ah-match">
          <div class="bw-ah-match-date">${m.date} · ${m.group||m.stage}</div>
          <div class="bw-ah-teams">${m.homeFlag} ${m.home}<br>${m.awayFlag} ${m.away}</div>
        </div>
        <div>
          <div class="bw-ah-handicap">${m.ah.homeLabel}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:2px">${m.ah.awayLabel}</div>
        </div>
        <div>
          <div class="bw-ah-payout ${wH.cls}">${m.ah.homePayout}</div>
          <div class="bw-ah-payout ${wA.cls}" style="font-size:12px;margin-top:3px">${m.ah.awayPayout}</div>
        </div>
        <div class="bw-pct-cell">${m.simCoverAH}%</div>
        <div class="bw-pct-cell" style="color:var(--text3)">${m.marketCoverAH}%</div>
        <div class="bw-edge-cell ${edgeCls}">${edgeSign}${m.edge}%</div>
        <div class="bw-verdict-cell">
          <span class="bw-sim-edge ${m.rec==="strong"?"se-strong":m.rec==="value"?"se-value":m.rec==="slight"?"se-slight":m.rec==="avoid"?"se-avoid":"se-neutral"}">${m.recLabel}</span>
          <div style="font-size:10px;color:var(--text3);margin-top:4px;line-height:1.4">${m.recDetail}</div>
        </div>
      `;
      el.appendChild(row);
    });
  });

  if (!list.length) {
    el.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text3);font-size:13px">No matches in this category</div>`;
  }
}

// water level helper
function waterLabel(p) {
  if (p >= 1.93) return {txt:"▲ "+p, col:"var(--green)", cls:"bw-water-hi"};
  if (p >= 1.88) return {txt:"● "+p, col:"var(--amber)", cls:"bw-water-std"};
  return {txt:"▼ "+p, col:"var(--red)", cls:"bw-water-lo"};
}

// ═══════════════════════════════════════════════
//  GOLDEN BOOT / TOP SCORER
// ═══════════════════════════════════════════════
function renderScorer() {
  const el = document.getElementById("scorerGrid");
  if (!el) return;

  // Intro strip
  const intro = document.createElement("div");
  intro.style.cssText = "background:#fff;border:1px solid var(--border);border-radius:var(--r2);padding:14px 18px;margin-bottom:20px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;box-shadow:var(--shadow)";
  intro.innerHTML = `
    <div style="font-size:28px">🥾</div>
    <div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:800;color:var(--text)">FIFA World Cup 2026 · Golden Boot Race</div>
      <div style="font-size:12px;color:var(--text3);margin-top:2px">Odds: Bet365 &amp; FanDuel (Jun 8 2026) · Decimal format · Simulation team depth score included</div>
    </div>
    <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap">
      <span style="background:var(--green3);color:var(--green);font-size:11px;font-weight:700;padding:4px 10px;border-radius:100px">✓ Strong pick</span>
      <span style="background:var(--amber2);color:var(--amber);font-size:11px;font-weight:700;padding:4px 10px;border-radius:100px">◐ Each-way</span>
      <span style="background:var(--page);color:var(--text3);font-size:11px;font-weight:700;padding:4px 10px;border-radius:100px">— Long shot</span>
    </div>`;
  el.appendChild(intro);

  const grid = document.createElement("div");
  grid.className = "bw-scorer-grid";

  TOP_SCORERS.forEach((p, i) => {
    const card = document.createElement("div");
    card.className = `bw-scorer-card spring-in ${i < 2 ? "top" : ""}`;
    card.style.animationDelay = (i * 0.06) + "s";

    const edgeLabel = p.edge === "strong" ? "✓ Strong pick" : p.edge === "value" ? "◐ Each-way value" : p.edge === "slight" ? "◐ Slight edge" : "— Long shot";
    const edgeCss = p.edge === "strong" ? "background:var(--green3);color:var(--green)" :
                    p.edge === "value" || p.edge === "slight" ? "background:var(--amber2);color:var(--amber)" :
                    "background:var(--page);color:var(--text3)";

    // ROI calculation
    const impliedPct = (1/p.decimal*100).toFixed(1);

    card.innerHTML = `
      <div class="bw-player-face">
        ${buildPlayerSVG(p)}
        <div class="bw-rank-num">${p.rank}</div>
        <div class="bw-photo-flag-badge"><span class="pf-flag">${p.flag}</span><span class="pf-name">${p.team}</span></div>
        ${i < 2 ? `<div class="bw-top-badge">FAVOURITE</div>` : ""}
      </div>
      <div class="bw-scorer-info">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
          <span style="font-size:22px;line-height:1">${p.flag}</span>
          <span class="bw-scorer-pos">${p.pos}</span>
          <span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:100px;margin-left:auto;${edgeCss}">${edgeLabel}</span>
        </div>
        <div class="bw-scorer-name">${p.name}</div>
        <div class="bw-scorer-team">
          <span>${p.flag} ${p.team}</span>
          <span style="color:var(--text3);font-size:11px">· ${p.club}</span>
        </div>
        <div class="bw-scorer-odds-row">
          <div class="bw-scorer-odds-box">
            <span class="bw-scorer-odds-label">DECIMAL</span>
            <span class="bw-scorer-odds-val" style="color:${i<2?"var(--green)":"var(--text)"}">${p.decimal.toFixed(2)}</span>
          </div>
          <div class="bw-scorer-odds-box">
            <span class="bw-scorer-odds-label">US ODDS</span>
            <span class="bw-scorer-odds-val">${p.american}</span>
          </div>
        </div>
        <button class="bw-scorer-btn" onclick="this.classList.toggle('selected')">
          <span>Select to Bet</span>
          <span class="bw-odds-decimal">${p.decimal.toFixed(2)}</span>
        </button>
        <div class="bw-scorer-sim">
          <strong>Sim note:</strong> ${p.simNote}
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:8px">
          ${[p.stat1, p.stat2, p.stat3].map(s => `<span style="font-size:9px;background:var(--page);border:1px solid var(--border);border-radius:4px;padding:2px 6px;color:var(--text2)">${s}</span>`).join("")}
        </div>
        <div style="margin-top:8px;font-size:10px;color:var(--text3)">Market implied: ${impliedPct}% chance of winning Golden Boot</div>
      </div>`;

    grid.appendChild(card);
  });
  el.appendChild(grid);
}

// ── PLAYER SVG AVATAR ──
function buildPlayerSVG(p) {
  const photoUrl = (typeof PLAYER_PHOTOS !== "undefined") ? PLAYER_PHOTOS[p.name] || "" : "";
  const svgFallback = buildSVGAvatar(p);

  if (photoUrl) {
    // Real photo with SVG fallback on error
    return `<div class="bw-player-photo-wrap">
      <img
        src="${photoUrl}"
        alt="${p.name}"
        class="bw-player-photo"
        crossorigin="anonymous"
        onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        onload="this.style.display='block';this.nextElementSibling.style.display='none'"
      />
      <div class="bw-player-svg-fallback" style="display:none">${svgFallback}</div>
    </div>`;
  }
  return svgFallback;
}

function buildSVGAvatar(p) {
  const gradId = "g" + p.rank;
  const c1 = p.col1, c2 = p.col2;
  const skin = "#f0c8a0", hair = "#2a1a0a";
  return `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" class="bw-player-svg" aria-hidden="true">
    <defs>
      <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${darken(c1,40)}"/>
      </linearGradient>
    </defs>
    <rect width="200" height="140" fill="url(#${gradId})"/>
    <path d="M60 140 L60 88 Q65 82 75 80 L88 77 L100 74 L112 77 L125 80 Q135 82 140 88 L140 140 Z" fill="${c1}" stroke="${c2}" stroke-width="2"/>
    <path d="M88 77 Q100 83 112 77 Q108 68 100 67 Q92 68 88 77Z" fill="${c2}"/>
    <text x="100" y="118" text-anchor="middle" font-family="'Barlow Condensed',sans-serif" font-weight="900" font-size="24" fill="rgba(255,255,255,0.9)" letter-spacing="2">${p.jersey}</text>
    <rect x="93" y="60" width="14" height="12" rx="7" fill="${skin}"/>
    <ellipse cx="100" cy="52" rx="20" ry="22" fill="${skin}"/>
    <path d="M80 46 Q82 28 100 28 Q118 28 120 46 Q112 38 100 37 Q88 38 80 46Z" fill="${hair}"/>
    <ellipse cx="93" cy="50" rx="3" ry="2.5" fill="#1a1a1a"/>
    <ellipse cx="107" cy="50" rx="3" ry="2.5" fill="#1a1a1a"/>
    <circle cx="94" cy="49" r="1" fill="white" opacity="0.7"/>
    <circle cx="108" cy="49" r="1" fill="white" opacity="0.7"/>
    <path d="M98 53 Q100 57 102 53" fill="none" stroke="${darken(skin,30)}" stroke-width="1" stroke-linecap="round"/>
    <path d="M95 59 Q100 63 105 59" fill="none" stroke="${darken(skin,40)}" stroke-width="1.2" stroke-linecap="round"/>
    <path d="M60 90 Q48 95 44 108 L50 112 Q56 100 62 96Z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/>
    <path d="M140 90 Q152 95 156 108 L150 112 Q144 100 138 96Z" fill="${c1}" stroke="${c2}" stroke-width="1.5"/>
    <rect x="0" y="124" width="200" height="16" fill="rgba(0,0,0,0.35)"/>
    <text x="100" y="136" text-anchor="middle" font-family="'DM Sans',sans-serif" font-size="10" font-weight="600" fill="rgba(255,255,255,0.85)" letter-spacing="0.5">${p.flag}  ${p.team.toUpperCase()}</text>
  </svg>`;
}

function darken(hex, pct) {
  try {
    const num = parseInt(hex.replace("#",""),16);
    const r = Math.max(0,(num>>16)-pct);
    const g = Math.max(0,((num>>8)&0xff)-pct);
    const b = Math.max(0,(num&0xff)-pct);
    return "#"+((r<<16)|(g<<8)|b).toString(16).padStart(6,"0");
  } catch(e) { return hex; }
}

// ═══════════════════════════════════════════════
//  H2H
// ═══════════════════════════════════════════════
const ABBR = {FRA:"FRA",ESP:"ESP",ARG:"ARG",ENG:"ENG",BRA:"BRA",POR:"POR",GER:"GER",MAR:"MAR",USA:"USA",NED:"NED",COL:"COL",URU:"URU",JPN:"JPN",BEL:"BEL",CRO:"CRO",SEN:"SEN"};
// STAT_META defined in data.js

function renderH2HSelectors() {
  ["A","B"].forEach(side => {
    const grid = document.getElementById("selectorGrid"+side);
    if (!grid) return;
    Object.keys(TEAMS).forEach(id => {
      const t = TEAMS[id];
      const pill = document.createElement("div");
      pill.className = "selector-pill" + ((side==="A"&&id===selectedA)||(side==="B"&&id===selectedB)?" selected":"");
      pill.dataset.id = id; pill.dataset.side = side;
      pill.innerHTML = `<span class="sp-flag">${t.flag}</span><span class="sp-name">${t.name.split(" ")[0]}</span>`;
      pill.onclick = () => selectTeam(side, id);
      grid.appendChild(pill);
    });
  });
}

function selectTeam(side, id) {
  if (side==="A"){ if(id===selectedB) selectedB=selectedA; selectedA=id; }
  else { if(id===selectedA) selectedA=selectedB; selectedB=id; }
  refreshSelectors(); renderH2H(selectedA,selectedB);
}
function swapTeams(){ [selectedA,selectedB]=[selectedB,selectedA]; refreshSelectors(); renderH2H(selectedA,selectedB); }
function refreshSelectors(){ document.querySelectorAll(".selector-pill").forEach(p=>{ p.classList.toggle("selected",(p.dataset.side==="A"&&p.dataset.id===selectedA)||(p.dataset.side==="B"&&p.dataset.id===selectedB)); }); }

function renderH2H(aId, bId) {
  const panel = document.getElementById("h2hPanel");
  if (!panel) return;
  if (aId===bId){ panel.innerHTML=`<div class="h2h-empty">Select two different teams</div>`; return; }
  const tA=TEAMS[aId], tB=TEAMS[bId];
  if (!tA||!tB){ panel.innerHTML=`<div class="h2h-empty">Team data not found</div>`; return; }
  const pA=baseWinProb(aId,bId), pB=1-pA;
  const pAp=(pA*100).toFixed(1), pBp=(pB*100).toFixed(1);
  const ovrA=overallRating(aId), ovrB=overallRating(bId);
  const colA="#1d4ed8", colB="#00a551";
  const statKeys=["atk","mid","def","gk","form","exp","depth"];
  const statLabels={atk:"ATTACK",mid:"MIDFIELD",def:"DEFENSE",gk:"GK",form:"FORM",exp:"EXP",depth:"DEPTH"};
  let bigKey="atk", bigGap=0;
  statKeys.forEach(k=>{ const d=Math.abs(tA.stats[k]-tB.stats[k]); if(d>bigGap){bigGap=d;bigKey=k;} });

  const statRowsHtml = statKeys.map(k=>{
    const vA=tA.stats[k], vB=tB.stats[k], diff=vA-vB, isBig=k===bigKey;
    const bwA=Math.round(vA*0.7), bwB=Math.round(vB*0.7);
    const absDiff=Math.abs(diff);
    let edgeHtml;
    if(absDiff<2) edgeHtml=`<span class="h2h-edge-tag edge-tie">EVEN</span>`;
    else if(isBig) edgeHtml=`<span class="h2h-edge-tag edge-big">+${absDiff} GAP</span>`;
    else if(diff>0) edgeHtml=`<span class="h2h-edge-tag edge-a">+${absDiff} ${ABBR[aId]||aId}</span>`;
    else edgeHtml=`<span class="h2h-edge-tag edge-b">+${absDiff} ${ABBR[bId]||bId}</span>`;
    const vAColor=diff>0?colA:diff<0?"var(--text3)":"var(--text2)";
    const vBColor=diff<0?colB:diff>0?"var(--text3)":"var(--text2)";
    const barCol=STAT_META[k]?.color||"#888";
    return `<div class="h2h-stat-row${isBig?" highlight":""}">
      <div class="h2h-val${diff<0?" muted":""}" style="color:${vAColor}">${vA}</div>
      <div class="h2h-bar-l"><div class="h2h-bar-seg" style="width:${bwA}px;background:${barCol};opacity:${diff>=0?1:.4}"></div></div>
      <div class="h2h-stat-label${isBig?" hl":""}">${statLabels[k]||k}</div>
      <div class="h2h-bar-r"><div class="h2h-bar-seg" style="width:${bwB}px;background:${barCol};opacity:${diff<=0?1:.4}"></div></div>
      <div class="h2h-val${diff>0?" muted":""}" style="color:${vBColor}">${vB}</div>
    </div>`;
  }).join("");

  const bigStatLabel = statLabels[bigKey]||bigKey;
  const favTeam=pA>=0.5?tA:tB, undTeam=pA>=0.5?tB:tA;
  const favPct=pA>=0.5?pAp:pBp;
  const insight = `<strong>${favTeam.name}</strong> are favoured at <strong>${favPct}%</strong>. Biggest gap: <strong>${bigStatLabel}</strong> (+${bigGap} pts). ${undTeam.edge||""}`;

  panel.innerHTML = `
    <div class="h2h-header">
      <div class="h2h-team-col">
        <div class="h2h-abbr" style="color:${colA}">${tA.flag} ${ABBR[aId]||aId}</div>
        <div class="h2h-team-name">${tA.name}</div>
        <div class="h2h-team-sub">${tA.history?.split("·")[0]?.trim()||""}</div>
        <div class="h2h-win-pct" style="color:${pA>=0.5?"#4ade80":colA}">${pAp}%</div>
        <div class="h2h-win-label">win probability</div>
      </div>
      <div class="h2h-center-col">
        <div class="h2h-stage-badge">HEAD-TO-HEAD</div>
        <div class="h2h-ovr-compare">
          <span class="h2h-ovr-num" style="color:${colA}">${ovrA}</span>
          <span style="color:rgba(255,255,255,.3);margin:0 5px">vs</span>
          <span class="h2h-ovr-num" style="color:${colB}">${ovrB}</span>
        </div>
        <div style="font-size:9px;color:rgba(255,255,255,.3);margin-top:3px;letter-spacing:.06em">OVR RATING</div>
      </div>
      <div class="h2h-team-col">
        <div class="h2h-abbr" style="color:${colB}">${tB.flag} ${ABBR[bId]||bId}</div>
        <div class="h2h-team-name">${tB.name}</div>
        <div class="h2h-team-sub">${tB.history?.split("·")[0]?.trim()||""}</div>
        <div class="h2h-win-pct" style="color:${pB>pA?"#4ade80":colB}">${pBp}%</div>
        <div class="h2h-win-label">win probability</div>
      </div>
    </div>
    <div class="h2h-prob-wrap">
      <div class="h2h-prob-track"><div class="h2h-prob-fill" style="width:${pAp}%"></div></div>
      <div class="h2h-prob-labels">
        <span style="color:${colA};font-weight:700">${tA.name} ${pAp}%</span>
        <span style="color:rgba(255,255,255,.3);font-size:9px">model + ±14% noise</span>
        <span style="color:${colB};font-weight:700">${pBp}% ${tB.name}</span>
      </div>
    </div>
    <div class="h2h-stats">
      <div class="h2h-stat-grid" style="margin-bottom:0">${statRowsHtml}</div>
    </div>
    <div class="h2h-insight">💡 ${insight}</div>`;
}

// ═══════════════════════════════════════════════
//  BRACKET
// ═══════════════════════════════════════════════
function renderBracket() {
  const leftEl=document.getElementById("bracketLeft"), rightEl=document.getElementById("bracketRight");
  if (!leftEl||!rightEl) return;
  R16.forEach(m => {
    const t1=TEAMS[m.t1], t2=TEAMS[m.t2];
    if (!t1||!t2) return;
    const p1=Math.round(baseWinProb(m.t1,m.t2)*100), p2=100-p1;
    const fav=p1>=p2?m.t1:m.t2;
    const div=document.createElement("div");
    div.className="bracket-match";
    div.title="Click to analyse in Head-to-Head";
    div.onclick=()=>{ selectedA=m.t1; selectedB=m.t2; refreshSelectors(); renderH2H(selectedA,selectedB); };
    div.innerHTML=`
      <div class="bracket-match-stage">${m.label}</div>
      <div class="bracket-team">
        <span style="font-size:15px">${t1.flag}</span>
        <span class="bracket-team-name" style="${fav===m.t1?"color:var(--text);font-weight:700":"color:var(--text3)"}">${t1.name}</span>
        <span class="bracket-pct" style="color:${fav===m.t1?"var(--green)":"var(--text3)"}">${p1}%</span>
      </div>
      <div class="bracket-team" style="margin-top:3px">
        <span style="font-size:15px">${t2.flag}</span>
        <span class="bracket-team-name" style="${fav===m.t2?"color:var(--text);font-weight:700":"color:var(--text3)"}">${t2.name}</span>
        <span class="bracket-pct" style="color:${fav===m.t2?"var(--green)":"var(--text3)"}">${p2}%</span>
      </div>
      <div class="bracket-bar"><div class="bracket-bar-fill" style="width:${p1}%"></div></div>`;
    (m.half==="L"?leftEl:rightEl).appendChild(div);
  });
}

// ═══════════════════════════════════════════════
//  SIMULATION RESULTS
// ═══════════════════════════════════════════════
function renderResults(data) {
  document.getElementById("simPlaceholder").style.display="none";
  document.getElementById("simResults").style.display="block";
  document.getElementById("simBadge").style.display="inline";
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
  const grid=document.getElementById("sfProbGrid"); if(!grid) return;
  grid.innerHTML="";
  const medals=["🥇","🥈","🥉","4️⃣"], colors=["var(--green)","#a0aec0","#cd7f32","var(--blue)"];
  sfProbs.forEach((item,idx)=>{
    const t=TEAMS[item.t]; if(!t) return;
    const isTop4=idx<4, barColor=idx<4?colors[idx]:"var(--border2)", barW=(item.pct/sfProbs[0].pct)*100;
    const row=document.createElement("div");
    row.className=`sf-prob-row fade-in ${isTop4?"top4":""} ${idx===0?"rank1":""}`;
    row.style.animationDelay=(idx*.05)+"s"; row.style.cursor="pointer";
    row.onclick=()=>{ selectedA=item.t; if(selectedB===item.t) selectedB=sfProbs[idx===0?1:0].t; refreshSelectors(); renderH2H(selectedA,selectedB); switchTab("bracket",document.querySelector("[data-tab='bracket']")); };
    const tagHtml=idx<4?`<span class="prob-tag tag-sf">${idx===0?"🏆 Top":"SF"}</span>`:idx<6?`<span class="prob-tag tag-dark">Dark horse</span>`:"";
    row.innerHTML=`
      <div class="prob-rank" style="color:${barColor}">${isTop4?medals[idx]:idx+1}</div>
      <div class="prob-flag-lg">${t.flag}</div>
      <div class="prob-name-col"><div class="prob-name-lg">${t.name}</div>${isTop4?`<div class="prob-record-sm">${t.record}</div>`:""}</div>
      <div class="prob-bar-col"><div class="prob-bar-lg"><div class="prob-bar-lg-fill" style="width:${barW}%;background:${barColor}"></div></div></div>
      <div class="prob-pct-lg" style="color:${barColor}">${item.pct.toFixed(1)}%</div>
      ${tagHtml}`;
    grid.appendChild(row);
  });
}

function renderMatchups(matchups) {
  const grid=document.getElementById("matchupGrid"); if(!grid) return;
  grid.innerHTML="";
  matchups.forEach((m,idx)=>{
    const t1=TEAMS[m.t1],t2=TEAMS[m.t2]; if(!t1||!t2) return;
    const card=document.createElement("div");
    card.className=`matchup-card fade-in ${idx===0?"top":""}`;
    card.style.animationDelay=(idx*.06)+"s"; card.style.cursor="pointer";
    card.onclick=()=>{ selectedA=m.t1; selectedB=m.t2; refreshSelectors(); renderH2H(selectedA,selectedB); switchTab("bracket",document.querySelector("[data-tab='bracket']")); };
    card.innerHTML=`
      ${idx===0?`<div class="matchup-top-tag">MOST LIKELY</div>`:""}
      <div class="matchup-teams">
        <div class="matchup-team"><div class="matchup-flag">${t1.flag}</div><div class="matchup-name">${t1.name}</div></div>
        <div class="matchup-vs">VS</div>
        <div class="matchup-team"><div class="matchup-flag">${t2.flag}</div><div class="matchup-name">${t2.name}</div></div>
      </div>
      <div class="matchup-pct-row"><span class="matchup-pct-val">${m.pct.toFixed(1)}%</span><span class="matchup-pct-label"> probability</span></div>`;
    grid.appendChild(card);
  });
}

function renderFinalStage(data) {
  const el=document.getElementById("finalStage"); if(!el) return;
  const t1=data.topFinal.t1,t2=data.topFinal.t2;
  const p1=data.t1WinPct>=data.t2WinPct?data.t1WinPct:data.t2WinPct;
  const teamA=data.t1WinPct>=data.t2WinPct?t1:t2, teamB=teamA===t1?t2:t1;
  const tA=TEAMS[teamA],tB=TEAMS[teamB]; if(!tA||!tB) return;
  el.innerHTML=`
    <div class="final-badge">🏆 THE FINAL · JULY 19 · METLIFE STADIUM, NEW JERSEY</div>
    <div class="final-matchup">
      <div class="final-team">
        <div class="final-flag">${tA.flag}</div>
        <div class="final-name">${tA.name}</div>
        <div class="final-sub">SF1 Winner</div>
        <div class="final-pct" style="color:#4ade80">${p1.toFixed(1)}%</div>
        <div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:2px">to win Final</div>
      </div>
      <div class="final-vs">FINAL<br><span>JUL 19</span></div>
      <div class="final-team">
        <div class="final-flag">${tB.flag}</div>
        <div class="final-name">${tB.name}</div>
        <div class="final-sub">SF2 Winner</div>
        <div class="final-pct" style="color:rgba(255,255,255,.5)">${(100-p1).toFixed(1)}%</div>
        <div style="font-size:10px;color:rgba(255,255,255,.4);margin-top:2px">to win Final</div>
      </div>
    </div>
    <div class="final-bar"><div style="width:${p1}%;height:100%;background:var(--green);border-radius:3px"></div></div>
    <div style="display:flex;justify-content:space-between;font-size:10px;margin-top:5px;color:rgba(255,255,255,.4)">
      <span style="color:var(--green);font-weight:700">${tA.name} ${p1.toFixed(1)}%</span>
      <span>±14% simulation noise per match</span>
      <span>${tB.name} ${(100-p1).toFixed(1)}%</span>
    </div>`;
}

function renderChampion(data) {
  const el=document.getElementById("championStage"); if(!el) return;
  const t=TEAMS[data.champion]; if(!t) return;
  const winPct=(data.winProbs.find(w=>w.t===data.champion)?.pct||0).toFixed(1);
  const PATHS={
    FRA:[{stage:"R16",vs:"vs Senegal",pct:"92.5%"},{stage:"QF",vs:"vs Germany",pct:"76.5%"},{stage:"SF",vs:"vs Spain",pct:"59.8%"},{stage:"FINAL",vs:"vs Argentina",pct:`${(100-data.t2WinPct).toFixed(1)}%`}],
    ARG:[{stage:"R16",vs:"vs Colombia",pct:"84.0%"},{stage:"QF",vs:"vs Brazil",pct:"62.1%"},{stage:"SF",vs:"vs England",pct:"69.3%"},{stage:"FINAL",vs:"vs France",pct:`${(100-data.t1WinPct).toFixed(1)}%`}],
    ESP:[{stage:"R16",vs:"vs Japan",pct:"86.3%"},{stage:"QF",vs:"vs Morocco",pct:"75.2%"},{stage:"SF",vs:"vs France",pct:"40.2%"},{stage:"FINAL",vs:"vs Argentina",pct:"50%"}],
    ENG:[{stage:"R16",vs:"vs Croatia",pct:"71.0%"},{stage:"QF",vs:"vs Portugal",pct:"52.7%"},{stage:"SF",vs:"vs Argentina",pct:"30.7%"},{stage:"FINAL",vs:"vs France",pct:"46%"}],
  };
  const path=PATHS[data.champion]||[{stage:"R16",vs:"Strong run",pct:"—"},{stage:"QF",vs:"Upset run",pct:"—"},{stage:"SF",vs:"Semi-final",pct:"—"},{stage:"FINAL",vs:"Won it",pct:winPct+"%"}];
  const pathHtml=path.map((p,i)=>`<div class="path-step">${i>0?'<div class="path-arrow">→</div>':""}<div class="path-box"><div class="path-stage">${p.stage}</div><div class="path-opponent">${p.vs}</div><div class="path-pct">${p.pct}</div></div></div>`).join("");
  el.innerHTML=`
    <div class="champion-eyebrow">🏆 WORLD CUP CHAMPION — 2026</div>
    <div class="champion-flag">${t.flag}</div>
    <div class="champion-name">${t.name}</div>
    <div class="champion-sub">${t.history||""}</div>
    <div class="champion-prob-box">
      <div class="champion-prob-num">${winPct}%</div>
      <div><div class="champion-prob-main">Probability to win tournament</div><div class="champion-prob-sub">from 100,000 simulation runs</div></div>
    </div>
    <div class="champion-path">${pathHtml}</div>`;
}

function renderWinTable(winProbs) {
  const el=document.getElementById("winTable"); if(!el) return;
  el.className="win-table"; el.innerHTML="";
  const maxPct=winProbs[0].pct;
  const colors=["var(--green)","#a0aec0","#cd7f32","var(--blue)"];
  winProbs.forEach((item,idx)=>{
    const t=TEAMS[item.t]; if(!t) return;
    const barW=(item.pct/maxPct)*100, barColor=idx<4?colors[idx]:"var(--border2)";
    const note=idx===0?"🏆 Champion":idx===1?"Runner-up":idx===2?"3rd place":idx===3?"4th place":idx<6?"QF exit":"";
    const row=document.createElement("div");
    row.className=`win-row fade-in ${idx===0?"w1":""}`; row.style.animationDelay=(idx*.04)+"s"; row.style.cursor="pointer";
    row.onclick=()=>{ selectedA=item.t; if(selectedB===item.t) selectedB=winProbs[idx===0?1:0].t; refreshSelectors(); renderH2H(selectedA,selectedB); switchTab("bracket",document.querySelector("[data-tab='bracket']")); };
    row.innerHTML=`
      <div class="win-rank" style="color:${barColor}">${idx+1}</div>
      <div class="win-flag">${t.flag}</div>
      <div class="win-name">${t.name}</div>
      <div class="win-bar-col"><div class="win-bar-fill" style="width:${barW}%;background:${barColor}"></div></div>
      <div class="win-pct" style="color:${barColor}">${item.pct.toFixed(1)}%</div>
      ${note?`<div class="win-note">${note}</div>`:""}`;
    el.appendChild(row);
  });
}

function renderVerdicts(sfProbs, winProbs) {
  const old=document.getElementById("verdictSection"); if(old) old.remove();
  const anchor=document.getElementById("simResults"); if(!anchor) return;
  const top4=sfProbs.slice(0,4), champion=winProbs[0].t, runnerUp=winProbs[1].t;
  const champ=TEAMS[champion], runner=TEAMS[runnerUp]; if(!champ||!runner) return;
  const champWin=winProbs[0].pct, runnerWin=winProbs[1].pct;
  const PDATA = typeof PLAYER_DATA !== "undefined" ? PLAYER_DATA : {};

  const duelsHtml=[[PDATA[champion]?.[0],PDATA[runnerUp]?.[0],"ATTACK"],[PDATA[champion]?.[1],PDATA[runnerUp]?.[1],"GK"],[PDATA[champion]?.[2],PDATA[runnerUp]?.[2],"MIDFIELD"]].filter(d=>d[0]&&d[1]).map(d=>`<div class="fvb-duel"><div><div class="fvb-player-name">${d[0].name.split(" ").pop()}</div><div class="fvb-player-role">${champ.flag} ${d[0].role}</div></div><div class="fvb-duel-vs">VS</div><div><div class="fvb-player-name">${d[1].name.split(" ").pop()}</div><div class="fvb-player-role">${runner.flag} ${d[1].role}</div></div><div style="font-size:9px;color:rgba(255,255,255,.35);border-left:1px solid rgba(255,255,255,.1);padding-left:8px;margin-left:4px;font-weight:700;letter-spacing:.06em">${d[2]}</div></div>`).join("");

  const medals=["🥇","🥈","🥉","4️⃣"], colors=["var(--green)","#a0aec0","#cd7f32","var(--blue)"];
  const KO_PATH={FRA:[{stage:"R16",vs:"vs Senegal",pct:92.5},{stage:"QF",vs:"vs Germany",pct:76.5},{stage:"SF",vs:"vs Spain",pct:59.8}],ESP:[{stage:"R16",vs:"vs Japan",pct:86.3},{stage:"QF",vs:"vs Morocco",pct:75.2},{stage:"SF",vs:"vs France",pct:40.2}],ARG:[{stage:"R16",vs:"vs Colombia",pct:84.0},{stage:"QF",vs:"vs Brazil",pct:62.1},{stage:"SF",vs:"vs England",pct:69.3}],ENG:[{stage:"R16",vs:"vs Croatia",pct:71.0},{stage:"QF",vs:"vs Portugal",pct:52.7},{stage:"SF",vs:"vs Argentina",pct:30.7}]};
  const THREAT={FRA:5,ESP:5,ARG:5,ENG:4,BRA:4,POR:4,GER:3,MAR:3,URU:2,NED:2,COL:2,JPN:2,BEL:2,CRO:2,SEN:1,USA:1};

  const cardsHtml=top4.map((item,idx)=>{
    const t=TEAMS[item.t]; if(!t) return "";
    const pData=PDATA[item.t]||[];
    const path=KO_PATH[item.t]||[];
    const threat=THREAT[item.t]||3;
    const winPct=(winProbs.find(w=>w.t===item.t)?.pct||0).toFixed(1);
    const isChamp=item.t===champion;
    const playersHtml=pData.slice(0,3).map(p=>`
      <div class="verdict-player">
        <div class="player-avatar" style="background:${p.col}22;color:${p.col};border:1.5px solid ${p.col}44">${p.init}</div>
        <div class="player-details">
          <div class="player-name">${p.name}</div>
          <div class="player-club">${p.club}</div>
          <div class="player-role-bar"><span class="player-role-label">${p.role}</span><span class="player-rating-pill" style="background:${p.col}20;color:${p.col}">${p.rating}</span></div>
        </div>
      </div>
      <div class="player-desc">${p.desc}</div>`).join("");
    const pathChips=path.map(s=>`<div class="path-chip"><span>vs ${s.vs.replace("vs ","")}</span><span class="chip-pct" style="color:${s.pct>=70?"var(--green)":s.pct>=50?"var(--amber)":"var(--red)"}">${s.pct}%</span></div>`).join("");
    const threatDots=Array.from({length:5},(_,i)=>`<div class="threat-dot${i<threat?" active":""}" style="${i<threat?`background:${colors[Math.min(idx,3)]}`:``}"></div>`).join("");
    return `<div class="verdict-card fade-in ${idx===0?"rank1":""}" style="animation-delay:${idx*.1}s">
      <div class="verdict-card-header">
        <div class="verdict-rank-badge" style="color:${colors[idx]}">${medals[idx]}</div>
        <div class="verdict-flag">${t.flag}</div>
        <div>
          <div class="verdict-team-name" style="color:${colors[idx]}">${t.name}</div>
          <div class="verdict-sf-pct" style="color:${colors[idx]}">${item.pct.toFixed(1)}% SF · ${winPct}% Title</div>
          <div class="verdict-history">${t.history||""}</div>
        </div>
        ${isChamp?`<div style="font-size:20px;margin-left:auto">🏆</div>`:""}
      </div>
      <div class="verdict-body">
        <div class="verdict-label">🎯 Key Players</div>
        <div class="verdict-players">${playersHtml}</div>
        <div class="verdict-label">⚡ Why They Win</div>
        <div class="verdict-why">${t.edge||""}</div>
        <div class="verdict-label">🗺 Knockout Path</div>
        <div class="verdict-path">${pathChips}</div>
        <div class="threat-meter"><span class="threat-label">THREAT</span><div class="threat-dots">${threatDots}</div><span class="threat-val" style="color:${colors[idx]}">${["ELITE","HIGH","STRONG","REAL"][idx]}</span></div>
      </div>
    </div>`;
  }).join("");

  const dh=sfProbs[4], dhT=TEAMS[dh?.t];
  const dhHtml=dh&&dhT?`<div class="dark-horse-strip fade-in"><div class="dh-icon">${dhT.flag}</div><div><div class="dh-title">🐎 DARK HORSE: ${dhT.name.toUpperCase()} — ${dh.pct.toFixed(1)}% SF PROBABILITY</div><div class="dh-body"><strong>${PDATA[dh.t]?.[0]?.name||dhT.players?.[0]||""}</strong>: ${dhT.edge||""}. Record: <strong>${dhT.record||""}</strong>.</div></div></div>`:"";

  const wrapper=document.createElement("div");
  wrapper.id="verdictSection"; wrapper.className="verdict-section";
  wrapper.innerHTML=`
    <h2 class="bw-section-h2">🏆 Simulation Verdict — Top 4 Analysis</h2>
    <div class="final-verdict-banner fade-in">
      <div class="fvb-title">⚡ SIMULATION VERDICT — THE FINAL</div>
      <div class="fvb-body">Predicted Final: <strong>${champ.flag} ${champ.name} vs ${runner.flag} ${runner.name}</strong>. ${champ.name} edge at <strong>${champWin.toFixed(1)}%</strong> — margin of <strong>${(champWin-runnerWin).toFixed(1)}pp</strong> across 100,000 runs.</div>
      <div class="fvb-duels">${duelsHtml}</div>
    </div>
    <div class="verdict-grid">${cardsHtml}</div>
    ${dhHtml}`;
  anchor.appendChild(wrapper);
}
