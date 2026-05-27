// ═══════════════════════════════════════════════
//  UI — Render all sections
// ═══════════════════════════════════════════════

let selectedA = 'FRA';
let selectedB = 'ESP';

document.addEventListener('DOMContentLoaded', () => {
  renderTeams();
  renderBracket();
  renderH2HSelectors();
  renderH2H(selectedA, selectedB);
});

// ─── NAV ───
function setActive(el) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
}
const sectionIds = ['squads','h2h','bracket','results','final'];
const navLinks   = document.querySelectorAll('.nav-link');
const observer   = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { threshold: 0.25 });
document.addEventListener('DOMContentLoaded', () => {
  sectionIds.forEach(id => { const el = document.getElementById(id); if (el) observer.observe(el); });
});

// ═══════════════════════════════════════════════
//  TEAMS GRID
// ═══════════════════════════════════════════════
function renderTeams() {
  const grid = document.getElementById('teamsGrid');
  if (!grid) return;
  Object.keys(TEAMS).forEach((id, idx) => {
    const t   = TEAMS[id];
    const ovr = overallRating(id);
    const card = document.createElement('div');
    card.className = 'team-card fade-in';
    card.style.animationDelay = (idx * 0.04) + 's';
    card.title = 'Click to analyse in Head-to-Head';
    card.onclick = () => {
      if (selectedA === id) { /* already A */ }
      else if (selectedB === id) { selectedA = id; }
      else { selectedA = id; }
      refreshSelectors();
      renderH2H(selectedA, selectedB);
      document.getElementById('h2h').scrollIntoView({ behavior:'smooth', block:'start' });
    };
    const statBars = Object.entries(STAT_META).map(([key, meta]) => {
      const val = t.stats[key];
      return `<div class="stat-row">
        <span class="stat-key" style="color:${meta.color}">${meta.label}</span>
        <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${val}%;background:${meta.color}"></div></div>
        <span class="stat-val" style="color:${meta.color}">${val}</span>
      </div>`;
    }).join('');
    const chips = t.players.map(p => `<span class="player-chip">${p}</span>`).join('');
    card.innerHTML = `
      <div class="team-card-top">
        <span class="team-flag">${t.flag}</span>
        <div><div class="team-name">${t.name}</div><div class="team-record">${t.record}</div></div>
        <div class="team-ovr"><div class="ovr-num">${ovr}</div><div class="ovr-label">OVR</div></div>
      </div>
      <div class="stat-bars">${statBars}</div>
      <div class="team-players">${chips}</div>
      <div class="team-history">${t.history}</div>`;
    grid.appendChild(card);
  });
}

// ═══════════════════════════════════════════════
//  H2H SELECTORS
// ═══════════════════════════════════════════════
function renderH2HSelectors() {
  ['A','B'].forEach(side => {
    const grid = document.getElementById(`selectorGrid${side}`);
    if (!grid) return;
    Object.keys(TEAMS).forEach(id => {
      const t   = TEAMS[id];
      const pill = document.createElement('div');
      pill.className = 'selector-pill' + ((side==='A'&&id===selectedA)||(side==='B'&&id===selectedB) ? ' selected' : '');
      pill.dataset.id   = id;
      pill.dataset.side = side;
      pill.innerHTML = `<span class="sp-flag">${t.flag}</span><span class="sp-name">${t.name}</span>`;
      pill.onclick = () => selectTeam(side, id);
      grid.appendChild(pill);
    });
  });
}

function selectTeam(side, id) {
  if (side === 'A') {
    if (id === selectedB) selectedB = selectedA;
    selectedA = id;
  } else {
    if (id === selectedA) selectedA = selectedB;
    selectedB = id;
  }
  refreshSelectors();
  renderH2H(selectedA, selectedB);
}

function refreshSelectors() {
  document.querySelectorAll('.selector-pill').forEach(p => {
    const id   = p.dataset.id;
    const side = p.dataset.side;
    p.classList.toggle('selected', (side==='A'&&id===selectedA)||(side==='B'&&id===selectedB));
  });
}

function swapTeams() {
  [selectedA, selectedB] = [selectedB, selectedA];
  refreshSelectors();
  renderH2H(selectedA, selectedB);
}

// ═══════════════════════════════════════════════
//  H2H PANEL
// ═══════════════════════════════════════════════
const ABBR = {
  FRA:'FRA',ESP:'ESP',ARG:'ARG',ENG:'ENG',BRA:'BRA',POR:'POR',
  GER:'GER',MAR:'MAR',USA:'USA',NED:'NED',COL:'COL',URU:'URU',
  JPN:'JPN',BEL:'BEL',CRO:'CRO',SEN:'SEN'
};
const STAT_COLORS = {
  atk:'#f97316', mid:'#a78bfa', def:'#22d3ee',
  gk:'#facc15', form:'#4ade80', depth:'#60a5fa', exp:'#f472b6'
};

function renderH2H(aId, bId) {
  const panel = document.getElementById('h2hPanel');
  if (!panel) return;
  if (aId === bId) {
    panel.innerHTML = `<div class="h2h-empty">Select two different teams</div>`;
    return;
  }
  const tA = TEAMS[aId], tB = TEAMS[bId];
  const pA = baseWinProb(aId, bId);
  const pB = 1 - pA;
  const pAp = Math.round(pA * 1000) / 10;
  const pBp = Math.round(pB * 1000) / 10;
  const ovrA = overallRating(aId), ovrB = overallRating(bId);
  const favA = pA >= 0.5;
  const colA = '#2979ff', colB = '#00e676';

  // Bar fill width (A side)
  const barW = pAp;

  // Stat rows
  const statKeys = ['atk','mid','def','gk','form','exp','depth'];
  const statLabels = { atk:'ATTACK', mid:'MIDFIELD', def:'DEFENSE', gk:'GK', form:'FORM', exp:'EXPERIENCE', depth:'DEPTH' };
  let biggestGapKey = statKeys[0];
  let biggestGap = 0;
  statKeys.forEach(k => {
    const diff = Math.abs(tA.stats[k] - tB.stats[k]);
    if (diff > biggestGap) { biggestGap = diff; biggestGapKey = k; }
  });

  const statRowsHtml = statKeys.map(k => {
    const vA = tA.stats[k], vB = tB.stats[k];
    const diff = vA - vB;
    const isBig = k === biggestGapKey;
    const bwA = Math.round((vA / 100) * 90); // max bar 90px
    const bwB = Math.round((vB / 100) * 90);
    let edgeHtml;
    const absDiff = Math.abs(diff);
    if (absDiff < 2) {
      edgeHtml = `<span class="h2h-edge-tag edge-tie">EVEN</span>`;
    } else if (isBig) {
      const who = diff > 0 ? tA.name.split(' ')[0] : tB.name.split(' ')[0];
      edgeHtml = `<span class="h2h-edge-tag edge-big">+${absDiff} biggest</span>`;
    } else if (diff > 0) {
      edgeHtml = `<span class="h2h-edge-tag edge-a">+${absDiff} ${ABBR[aId]}</span>`;
    } else {
      edgeHtml = `<span class="h2h-edge-tag edge-b">+${absDiff} ${ABBR[bId]}</span>`;
    }
    const rowClass = isBig ? 'h2h-stat-row highlight' : 'h2h-stat-row';
    const lblClass = isBig ? 'h2h-stat-label highlight-label' : 'h2h-stat-label';
    const barColor = STAT_COLORS[k];
    const valColA = diff > 0 ? colA : diff < 0 ? 'var(--text3)' : 'var(--text2)';
    const valColB = diff < 0 ? colB : diff > 0 ? 'var(--text3)' : 'var(--text2)';
    return `<div class="${rowClass}">
      <div class="h2h-val" style="color:${valColA}">${vA}</div>
      <div class="h2h-bar-left"><div class="h2h-bar-seg" style="width:${bwA}px;background:${barColor};opacity:${diff>=0?1:0.4}"></div></div>
      <div class="${lblClass}">${statLabels[k]}</div>
      <div class="h2h-bar-right"><div class="h2h-bar-seg" style="width:${bwB}px;background:${barColor};opacity:${diff<=0?1:0.4}"></div></div>
      <div class="h2h-val" style="color:${valColB}">${vB}</div>
    </div>`;
  }).join('');

  // Insight text
  const favTeam = favA ? tA : tB;
  const undTeam = favA ? tB : tA;
  const favId   = favA ? aId : bId;
  const undId   = favA ? bId : aId;
  const bigStat = statLabels[biggestGapKey].toLowerCase();
  const favPct  = favA ? pAp : pBp;
  const insights = [
    `<strong>${favTeam.name}</strong> are favoured at <strong>${favPct}%</strong>. The biggest edge is in <strong>${bigStat}</strong> (+${biggestGap} pts) — a structural advantage that's hard to overcome in a knockout game.`,
    `<strong>${undTeam.name}</strong> have a <strong>${(100-favPct).toFixed(1)}%</strong> upset chance. ${undTeam.edge}`,
    `Key duel: <strong>${favTeam.players[0]}</strong> vs <strong>${undTeam.players[0]}</strong> — the team that wins this individual battle typically controls the match tempo.`
  ];
  const insight = insights[Math.floor(Math.random() * insights.length)];

  panel.innerHTML = `
    <div class="h2h-header">
      <div class="h2h-team-col">
        <div class="h2h-abbr" style="color:${colA}">${ABBR[aId]}</div>
        <div class="h2h-team-name">${tA.name}</div>
        <div class="h2h-team-sub">${tA.history.split('·')[0].trim()}</div>
        <div class="h2h-win-pct" style="color:${favA?'var(--gold)':colA}">${pAp}%</div>
        <div class="h2h-win-label">win probability</div>
      </div>
      <div class="h2h-center-col">
        <div class="h2h-stage-badge">HEAD-TO-HEAD</div>
        <div class="h2h-ovr-compare">
          <span class="h2h-ovr-num" style="color:${colA}">${ovrA}</span>
          <span>vs</span>
          <span class="h2h-ovr-num" style="color:${colB}">${ovrB}</span>
        </div>
        <div style="font-size:10px;color:var(--text3);margin-top:3px;font-family:'Barlow Condensed',sans-serif;letter-spacing:.06em">OVR RATING</div>
      </div>
      <div class="h2h-team-col">
        <div class="h2h-abbr" style="color:${colB}">${ABBR[bId]}</div>
        <div class="h2h-team-name">${tB.name}</div>
        <div class="h2h-team-sub">${tB.history.split('·')[0].trim()}</div>
        <div class="h2h-win-pct" style="color:${!favA?'var(--gold)':colB}">${pBp}%</div>
        <div class="h2h-win-label">win probability</div>
      </div>
    </div>

    <div class="h2h-prob-bar-wrap">
      <div class="h2h-prob-bar-track">
        <div class="h2h-prob-bar-fill" style="width:${barW}%;background:linear-gradient(90deg,${colA},#1565c0)"></div>
      </div>
      <div class="h2h-prob-labels">
        <span style="color:${colA};font-weight:700">${tA.name} ${pAp}%</span>
        <span style="color:var(--text3);font-size:10px">±14% noise per simulation run</span>
        <span style="color:${colB};font-weight:700">${pBp}% ${tB.name}</span>
      </div>
    </div>

    <div class="h2h-stats">
      <div class="h2h-stat-header">
        <div style="color:${colA}">${ABBR[aId]}</div>
        <div style="text-align:right;color:var(--text3)">◀</div>
        <div>STAT</div>
        <div style="text-align:left;color:var(--text3)">▶</div>
        <div style="color:${colB}">${ABBR[bId]}</div>
      </div>
      ${statRowsHtml}
    </div>

    <div class="h2h-insight">💡 ${insight}</div>
  `;

  // Animate bars in after render
  setTimeout(() => {
    panel.querySelectorAll('.h2h-bar-seg').forEach(b => {
      const w = b.style.width;
      b.style.width = '0';
      requestAnimationFrame(() => { b.style.width = w; });
    });
  }, 50);
}

// ═══════════════════════════════════════════════
//  BRACKET
// ═══════════════════════════════════════════════
function renderBracket() {
  const leftEl  = document.getElementById('bracketLeft');
  const rightEl = document.getElementById('bracketRight');
  if (!leftEl || !rightEl) return;
  R16.forEach(m => {
    const t1 = TEAMS[m.t1], t2 = TEAMS[m.t2];
    const p1 = Math.round(baseWinProb(m.t1, m.t2) * 100);
    const p2 = 100 - p1;
    const fav = p1 >= p2 ? m.t1 : m.t2;
    const div = document.createElement('div');
    div.className = 'bracket-match';
    div.title = 'Click to analyse in H2H';
    div.onclick = () => {
      selectedA = m.t1; selectedB = m.t2;
      refreshSelectors();
      renderH2H(selectedA, selectedB);
      document.getElementById('h2h').scrollIntoView({ behavior:'smooth', block:'start' });
    };
    div.innerHTML = `
      <div class="bracket-match-stage">${m.label}</div>
      <div class="bracket-team">
        <span style="font-size:16px">${t1.flag}</span>
        <span class="bracket-team-name" style="${fav===m.t1?'color:var(--text)':'color:var(--text3)'}">${t1.name}</span>
        <span class="bracket-pct" style="color:${fav===m.t1?'var(--gold)':'var(--text3)'}">${p1}%</span>
      </div>
      <div class="bracket-team" style="margin-top:4px">
        <span style="font-size:16px">${t2.flag}</span>
        <span class="bracket-team-name" style="${fav===m.t2?'color:var(--text)':'color:var(--text3)'}">${t2.name}</span>
        <span class="bracket-pct" style="color:${fav===m.t2?'var(--gold)':'var(--text3)'}">${p2}%</span>
      </div>
      <div class="bracket-bar"><div class="bracket-bar-fill" style="width:${p1}%;background:var(--gold)"></div></div>`;
    (m.half === 'L' ? leftEl : rightEl).appendChild(div);
  });
}

// ═══════════════════════════════════════════════
//  RESULTS
// ═══════════════════════════════════════════════
function renderResults(data) {
  document.getElementById('resultsPlaceholder').style.display = 'none';
  document.getElementById('resultsContent').style.display     = 'block';
  document.getElementById('finalPlaceholder').style.display   = 'none';
  document.getElementById('finalContent').style.display       = 'block';
  document.getElementById('navBadge').style.display = 'inline';

  renderSFProbs(data.sfProbs);
  renderMatchups(data.matchups);
  renderFinalStage(data);
  renderChampion(data);
  renderWinTable(data.winProbs);

  document.getElementById('results').scrollIntoView({ behavior:'smooth', block:'start' });
}

function renderSFProbs(sfProbs) {
  const grid = document.getElementById('sfProbGrid');
  grid.innerHTML = '';
  const medals = ['🥇','🥈','🥉','4️⃣'];
  const colors  = ['var(--gold)','#a0aec0','#cd7f32','var(--blue2)'];
  sfProbs.forEach((item, idx) => {
    const t = TEAMS[item.t];
    const isTop4 = idx < 4;
    const barColor = idx === 0 ? 'var(--gold)' : idx < 4 ? colors[idx] : 'var(--border2)';
    const barWidth = (item.pct / sfProbs[0].pct) * 100;
    const row = document.createElement('div');
    row.className = `sf-prob-row fade-in ${isTop4?'top4':''} ${idx===0?'rank1':''}`;
    row.style.animationDelay = (idx * 0.05) + 's';
    row.style.cursor = 'pointer';
    row.title = 'Click to see H2H analysis';
    row.onclick = () => {
      selectedA = item.t;
      if (selectedB === item.t) selectedB = sfProbs[idx===0?1:0].t;
      refreshSelectors();
      renderH2H(selectedA, selectedB);
      document.getElementById('h2h').scrollIntoView({ behavior:'smooth', block:'start' });
    };
    const tagHtml = idx < 4 ? `<span class="prob-tag tag-sf">${idx===0?'🏆 Top Pick':'Semi-finalist'}</span>` :
                    idx < 6 ? `<span class="prob-tag tag-dark">Dark horse</span>` : '';
    row.innerHTML = `
      <div class="prob-rank" style="color:${barColor}">${isTop4?medals[idx]:idx+1}</div>
      <div class="prob-flag-lg">${t.flag}</div>
      <div class="prob-name-col">
        <div class="prob-name-lg">${t.name}</div>
        ${isTop4?`<div class="prob-record-sm">${t.record}</div>`:''}
      </div>
      <div class="prob-bar-col">
        <div class="prob-bar-lg"><div class="prob-bar-lg-fill" style="width:${barWidth}%;background:${barColor}"></div></div>
      </div>
      <div class="prob-pct-lg" style="color:${barColor}">${item.pct.toFixed(1)}%</div>
      ${tagHtml}`;
    grid.appendChild(row);
  });
}

function renderMatchups(matchups) {
  const grid = document.getElementById('matchupGrid');
  grid.innerHTML = '';
  matchups.forEach((m, idx) => {
    const t1 = TEAMS[m.t1], t2 = TEAMS[m.t2];
    const card = document.createElement('div');
    card.className = `matchup-card fade-in ${idx===0?'top':''}`;
    card.style.animationDelay = (idx * 0.06) + 's';
    card.style.cursor = 'pointer';
    card.title = 'Click to analyse this matchup';
    card.onclick = () => {
      selectedA = m.t1; selectedB = m.t2;
      refreshSelectors();
      renderH2H(selectedA, selectedB);
      document.getElementById('h2h').scrollIntoView({ behavior:'smooth', block:'start' });
    };
    card.innerHTML = `
      ${idx===0?'<div class="matchup-top-tag">MOST LIKELY</div>':''}
      <div class="matchup-teams">
        <div class="matchup-team">
          <div class="matchup-flag">${t1.flag}</div>
          <div class="matchup-name">${t1.name}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:2px">OVR ${overallRating(m.t1)}</div>
        </div>
        <div class="matchup-vs">VS</div>
        <div class="matchup-team">
          <div class="matchup-flag">${t2.flag}</div>
          <div class="matchup-name">${t2.name}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:2px">OVR ${overallRating(m.t2)}</div>
        </div>
      </div>
      <div class="matchup-pct-row">
        <span class="matchup-pct-val">${m.pct.toFixed(1)}%</span>
        <span class="matchup-pct-label">chance of this matchup</span>
      </div>`;
    grid.appendChild(card);
  });
}

function renderFinalStage(data) {
  const el = document.getElementById('finalStage');
  const t1 = data.topFinal.t1, t2 = data.topFinal.t2;
  const p1 = data.t1WinPct >= data.t2WinPct ? data.t1WinPct : data.t2WinPct;
  const teamA = data.t1WinPct >= data.t2WinPct ? t1 : t2;
  const teamB = teamA === t1 ? t2 : t1;
  const tA = TEAMS[teamA], tB = TEAMS[teamB];
  el.innerHTML = `
    <div class="final-badge">🏆 The Final · July 19 · MetLife Stadium, New Jersey</div>
    <div class="final-matchup">
      <div class="final-team">
        <div class="final-flag">${tA.flag}</div>
        <div class="final-name">${tA.name}</div>
        <div class="final-sub">SF1 Winner</div>
        <div class="final-pct" style="color:var(--gold)">${p1.toFixed(1)}%</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">to win Final</div>
      </div>
      <div class="final-vs">FINAL<br><span>JUL 19</span></div>
      <div class="final-team">
        <div class="final-flag">${tB.flag}</div>
        <div class="final-name">${tB.name}</div>
        <div class="final-sub">SF2 Winner</div>
        <div class="final-pct" style="color:var(--text2)">${(100-p1).toFixed(1)}%</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">to win Final</div>
      </div>
    </div>
    <div class="final-bar">
      <div style="width:${p1}%;height:100%;background:linear-gradient(90deg,var(--gold),#c47c00);border-radius:4px"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:6px;padding:0 2px;font-family:'Barlow Condensed',sans-serif;font-weight:600;letter-spacing:.05em">
      <span style="color:var(--gold)">${tA.name} ${p1.toFixed(1)}%</span>
      <span style="color:var(--text3)">±14% simulation noise per match</span>
      <span style="color:var(--text3)">${tB.name} ${(100-p1).toFixed(1)}%</span>
    </div>`;
}

function renderChampion(data) {
  const el  = document.getElementById('championStage');
  const t   = TEAMS[data.champion];
  const winPct = data.winProbs.find(w => w.t === data.champion)?.pct || 0;
  const PATHS = {
    FRA:[{stage:'R16',vs:'vs Senegal',pct:'92.5%'},{stage:'QF',vs:'vs Germany',pct:'76.5%'},{stage:'SF',vs:'vs Spain',pct:'59.8%'},{stage:'FINAL',vs:'vs Argentina',pct:`${(100-data.t2WinPct).toFixed(1)}%`}],
    ARG:[{stage:'R16',vs:'vs Colombia',pct:'84.0%'},{stage:'QF',vs:'vs Brazil',pct:'62.1%'},{stage:'SF',vs:'vs England',pct:'69.3%'},{stage:'FINAL',vs:'vs France',pct:`${(100-data.t1WinPct).toFixed(1)}%`}],
    ESP:[{stage:'R16',vs:'vs Japan',pct:'86.3%'},{stage:'QF',vs:'vs Morocco',pct:'75.2%'},{stage:'SF',vs:'vs France',pct:'40.2%'},{stage:'FINAL',vs:'vs Argentina',pct:'50%'}],
    ENG:[{stage:'R16',vs:'vs Croatia',pct:'71.0%'},{stage:'QF',vs:'vs Portugal',pct:'52.7%'},{stage:'SF',vs:'vs Argentina',pct:'30.7%'},{stage:'FINAL',vs:'vs France',pct:'46%'}],
  };
  const path = PATHS[data.champion] || [{stage:'R16',vs:'Strong run',pct:'—'},{stage:'QF',vs:'Upset specialists',pct:'—'},{stage:'SF',vs:'Reached semi',pct:'—'},{stage:'FINAL',vs:'Won it',pct:`${winPct.toFixed(1)}%`}];
  const pathHtml = path.map((p,i) => `
    <div class="path-step">
      ${i>0?'<div class="path-arrow">→</div>':''}
      <div class="path-box">
        <div class="path-stage">${p.stage}</div>
        <div class="path-opponent">${p.vs}</div>
        <div class="path-pct">${p.pct}</div>
      </div>
    </div>`).join('');
  el.innerHTML = `
    <div class="champion-glow"></div>
    <div class="champion-eyebrow">🏆 World Cup Champion — 2026</div>
    <div class="champion-flag">${t.flag}</div>
    <div class="champion-name">${t.name}</div>
    <div class="champion-sub">${t.history}</div>
    <div class="champion-prob-box">
      <div class="champion-prob-num">${winPct.toFixed(1)}%</div>
      <div class="champion-prob-label">
        <div class="champion-prob-main">Probability to win tournament</div>
        <div class="champion-prob-sub">from 100,000 simulation runs</div>
      </div>
    </div>
    <div class="champion-path">${pathHtml}</div>`;
}

function renderWinTable(winProbs) {
  const el = document.getElementById('winTable');
  el.className = 'win-table';
  el.innerHTML = '';
  const maxPct = winProbs[0].pct;
  const colors = ['var(--gold)','#a0aec0','#cd7f32','var(--blue2)'];
  winProbs.forEach((item, idx) => {
    const t = TEAMS[item.t];
    const barW = (item.pct / maxPct) * 100;
    const barColor = idx < 4 ? colors[idx] : 'var(--border2)';
    const note = idx===0?'🏆 Champion':idx===1?'Runner-up':idx===2?'3rd place':idx===3?'4th place':idx<6?'QF exit':'';
    const row = document.createElement('div');
    row.className = `win-row fade-in ${idx===0?'w1':idx===1?'w2':''}`;
    row.style.animationDelay = (idx * 0.04) + 's';
    row.style.cursor = 'pointer';
    row.onclick = () => {
      selectedA = item.t;
      if (selectedB === item.t) selectedB = winProbs[idx===0?1:0].t;
      refreshSelectors();
      renderH2H(selectedA, selectedB);
      document.getElementById('h2h').scrollIntoView({ behavior:'smooth', block:'start' });
    };
    row.innerHTML = `
      <div class="win-rank" style="color:${barColor}">${idx+1}</div>
      <div class="win-flag">${t.flag}</div>
      <div class="win-name" style="color:${idx<4?'var(--text)':'var(--text2)'}">${t.name}</div>
      <div class="win-bar-col"><div class="win-bar-fill" style="width:${barW}%;background:${barColor}"></div></div>
      <div class="win-pct" style="color:${barColor}">${item.pct.toFixed(1)}%</div>
      ${note?`<div class="win-note">${note}</div>`:''}`;
    el.appendChild(row);
  });
}

// ═══════════════════════════════════════════════
//  VERDICT SECTION
// ═══════════════════════════════════════════════
function renderVerdicts(sfProbs, winProbs) {
  // Remove old verdict if exists
  const old = document.getElementById('verdictSection');
  if (old) old.remove();

  const anchor = document.getElementById('resultsContent');
  if (!anchor) return;

  const top4 = sfProbs.slice(0, 4);
  const champion = winProbs[0].t;
  const runnerUp = winProbs[1].t;

  // Final verdict banner
  const champ = TEAMS[champion], runner = TEAMS[runnerUp];
  const champWin = winProbs[0].pct;
  const runnerWin = winProbs[1].pct;

  // Key duel players
  const duels = [
    { a: PLAYER_DATA[champion]?.[0], b: PLAYER_DATA[runnerUp]?.[0], label:'ATTACK DUEL' },
    { a: PLAYER_DATA[champion]?.[1], b: PLAYER_DATA[runnerUp]?.[1], label:'GK BATTLE' },
    { a: PLAYER_DATA[champion]?.[2], b: PLAYER_DATA[runnerUp]?.[2], label:'MIDFIELD DUEL' },
  ];

  const duelsHtml = duels.filter(d => d.a && d.b).map(d => `
    <div class="fvb-duel">
      <div>
        <div class="fvb-player-name">${d.a.name.split(' ').pop()}</div>
        <div class="fvb-player-role">${champ.flag} ${d.a.role}</div>
      </div>
      <div class="fvb-duel-vs">VS</div>
      <div>
        <div class="fvb-player-name">${d.b.name.split(' ').pop()}</div>
        <div class="fvb-player-role">${runner.flag} ${d.b.role}</div>
      </div>
      <div style="font-size:9px;color:var(--text3);border-left:1px solid var(--border);padding-left:8px;margin-left:4px;letter-spacing:.08em;font-family:'Barlow Condensed',sans-serif;font-weight:700">${d.label}</div>
    </div>`).join('');

  const finalBannerHtml = `
    <div class="final-verdict-banner fade-in">
      <div class="fvb-title">⚡ SIMULATION VERDICT — THE FINAL</div>
      <div class="fvb-body">
        The 100,000-run simulation points to a <strong>${champ.flag} ${champ.name} vs ${runner.flag} ${runner.name}</strong> final — 
        a rematch of <strong>Qatar 2022</strong>. ${champ.name} edge it at <strong>${champWin.toFixed(1)}%</strong> 
        driven by ${PLAYER_DATA[champion]?.[0]?.name || 'their star player'}'s 
        ${PLAYER_DATA[champion]?.[0]?.desc?.split('.')[0] || 'exceptional quality'}. 
        ${runner.name}'s ${PLAYER_DATA[runnerUp]?.[1]?.name || 'goalkeeper'} 
        (${PLAYER_DATA[runnerUp]?.[1]?.desc?.split('.')[0] || 'elite GK'}) 
        keeps it at ${runnerWin.toFixed(1)}% — this is not a one-sided Final.
        The margin across all 100,000 runs is <strong>${(champWin - runnerWin).toFixed(1)} percentage points</strong>. 
        Expect a classic.
      </div>
      <div class="fvb-duels">${duelsHtml}</div>
    </div>`;

  // Verdict cards for top 4
  const verdictCardsHtml = top4.map((item, idx) => {
    const t    = TEAMS[item.t];
    const pData = PLAYER_DATA[item.t] || [];
    const path  = KO_PATH[item.t] || [];
    const threat = THREAT[item.t] || 3;
    const medals = ['🥇','🥈','🥉','4️⃣'];
    const colors  = ['var(--gold)','#a0aec0','#cd7f32','var(--blue2)'];
    const winPct  = (winProbs.find(w => w.t === item.t)?.pct || 0).toFixed(1);
    const isChamp = item.t === champion;

    const playersHtml = pData.slice(0, 3).map(p => {
      const threatDots = Array.from({length:5}, (_,i) => `
        <div class="threat-dot ${i < Math.round(p.rating/20) ? 'active' : ''}" 
             style="${i < Math.round(p.rating/20) ? `background:${p.color}` : ''}"></div>`).join('');
      return `
        <div class="verdict-player">
          <div class="player-avatar" style="background:${p.color}20;color:${p.color};border:1px solid ${p.color}40">${p.initials}</div>
          <div class="player-details">
            <div class="player-name">${p.name}</div>
            <div class="player-club">${p.club}</div>
            <div class="player-role-bar">
              <span class="player-role-label">${p.role}</span>
              <span class="player-rating-pill" style="background:${p.color}20;color:${p.color}">${p.rating}</span>
            </div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--text3);padding:0 4px 8px;line-height:1.55;margin-top:-4px">${p.desc}</div>`;
    }).join('');

    const pathChips = path.map(s => `
      <div class="path-chip">
        <span style="color:var(--text2)">vs ${s.vs}</span>
        <span class="chip-pct" style="color:${s.pct >= 70 ? 'var(--neon)' : s.pct >= 50 ? 'var(--gold)' : 'var(--red)'}">${s.pct}%</span>
      </div>`).join('');

    const threatDots = Array.from({length:5}, (_,i) => `
      <div class="threat-dot ${i < threat ? 'active' : ''}" 
           style="${i < threat ? `background:${colors[Math.min(idx,3)]}` : ''}"></div>`).join('');

    const whyWin = t.edge;

    return `
      <div class="verdict-card fade-in ${idx===0?'rank1':''}" style="animation-delay:${idx*.1}s">
        <div class="verdict-card-header">
          <div class="verdict-rank-badge" style="color:${colors[idx]}">${medals[idx]}</div>
          <div class="verdict-flag">${t.flag}</div>
          <div class="verdict-team-info">
            <div class="verdict-team-name" style="color:${colors[idx]}">${t.name}</div>
            <div class="verdict-sf-pct" style="color:${colors[idx]}">${item.pct.toFixed(1)}% SF · ${winPct}% Title</div>
            <div class="verdict-history">${t.history}</div>
          </div>
          ${isChamp ? `<div style="font-size:22px;margin-left:auto">🏆</div>` : ''}
        </div>
        <div class="verdict-body">

          <div class="verdict-label">🎯 Key Players</div>
          <div class="verdict-players">${playersHtml}</div>

          <div class="verdict-label">⚡ Why They Win</div>
          <div class="verdict-why">${whyWin}</div>

          <div class="verdict-label">🗺 Knockout Path</div>
          <div class="verdict-path">${pathChips}</div>

          <div class="threat-meter">
            <span class="threat-label">TOURNAMENT THREAT</span>
            <div class="threat-dots">${threatDots}</div>
            <span class="threat-val" style="color:${colors[idx]}">${['ELITE','HIGH','STRONG','REAL'][idx]}</span>
          </div>

        </div>
      </div>`;
  }).join('');

  // Dark horse callout
  const dh = sfProbs[4]; // 5th team — biggest dark horse
  const dhT = TEAMS[dh?.t];
  const darkHorseHtml = dh ? `
    <div class="dark-horse-strip fade-in">
      <div class="dh-icon">${dhT.flag}</div>
      <div>
        <div class="dh-title">🐎 DARK HORSE WATCH: ${dhT.name.toUpperCase()} — ${dh.pct.toFixed(1)}% SF PROBABILITY</div>
        <div class="dh-body">
          ${dhT.name} sit just outside the top 4 but pose a real threat. 
          <strong>${PLAYER_DATA[dh.t]?.[0]?.name || dhT.players[0]}</strong> 
          (${PLAYER_DATA[dh.t]?.[0]?.desc?.split('.')[0] || 'elite quality'}).
          Their path to the semi-finals requires one major upset — which is exactly what they've done before. 
          Record: <strong>${dhT.record}</strong>. Watch closely.
        </div>
      </div>
    </div>` : '';

  const wrapper = document.createElement('div');
  wrapper.id = 'verdictSection';
  wrapper.className = 'verdict-section';
  wrapper.innerHTML = `
    <h3 class="subsection-title">🏆 Simulation Verdict — Top 4 Analysis</h3>
    ${finalBannerHtml}
    <div class="verdict-grid">${verdictCardsHtml}</div>
    ${darkHorseHtml}`;

  anchor.appendChild(wrapper);
}

// ─── Hook into renderResults ───
const _origRenderResults = renderResults;
// Override renderResults to also call renderVerdicts
window.renderResults = function(data) {
  _origRenderResults(data);
  renderVerdicts(data.sfProbs, data.winProbs);
};
