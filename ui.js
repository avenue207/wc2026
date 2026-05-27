// ═══════════════════════════════════════════════
//  UI — Render all sections on page load + results
// ═══════════════════════════════════════════════

// ─── INITIALISE ON LOAD ───
document.addEventListener('DOMContentLoaded', () => {
  renderTeams();
  renderBracket();
});

// ─── NAV ACTIVE STATE ───
function setActive(el) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');
}

// Intersection observer for auto-nav highlight
const sections = ['squads','bracket','results','final'];
const navLinks  = document.querySelectorAll('.nav-link');
const observer  = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach(l => {
        l.classList.toggle('active', l.getAttribute('href') === '#' + id);
      });
    }
  });
}, { threshold: 0.35 });

document.addEventListener('DOMContentLoaded', () => {
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
});

// ═══════════════════════════════════════════════
//  TEAMS SECTION
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

    // stat bars HTML
    const statBars = Object.entries(STAT_META).map(([key, meta]) => {
      const val = t.stats[key];
      return `
        <div class="stat-row">
          <span class="stat-key" style="color:${meta.color}">${meta.label}</span>
          <div class="stat-bar-bg">
            <div class="stat-bar-fill" style="width:${val}%; background:${meta.color};"></div>
          </div>
          <span class="stat-val" style="color:${meta.color}">${val}</span>
        </div>`;
    }).join('');

    const playerChips = t.players.map(p =>
      `<span class="player-chip">${p}</span>`
    ).join('');

    card.innerHTML = `
      <div class="team-card-top">
        <span class="team-flag">${t.flag}</span>
        <div>
          <div class="team-name">${t.name}</div>
          <div class="team-record">${t.record}</div>
        </div>
        <div class="team-ovr">
          <div class="ovr-num">${ovr}</div>
          <div class="ovr-label">OVR</div>
        </div>
      </div>
      <div class="stat-bars">${statBars}</div>
      <div class="team-players">${playerChips}</div>
      <div class="team-history">${t.history}</div>
    `;
    grid.appendChild(card);
  });
}

// ═══════════════════════════════════════════════
//  BRACKET SECTION
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

    const html = `
      <div class="bracket-match">
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
        <div class="bracket-bar" style="margin-top:8px">
          <div class="bracket-bar-fill" style="width:${p1}%; background:var(--gold);"></div>
        </div>
      </div>`;

    (m.half === 'L' ? leftEl : rightEl).insertAdjacentHTML('beforeend', html);
  });
}

// ═══════════════════════════════════════════════
//  RESULTS SECTION
// ═══════════════════════════════════════════════
function renderResults(data) {
  // Show results sections
  document.getElementById('resultsPlaceholder').style.display = 'none';
  document.getElementById('resultsContent').style.display    = 'block';
  document.getElementById('finalPlaceholder').style.display  = 'none';
  document.getElementById('finalContent').style.display      = 'block';

  // Badge
  document.getElementById('navBadge').style.display = 'inline';
  document.getElementById('resultsNavLink').classList.add('active');

  renderSFProbs(data.sfProbs);
  renderMatchups(data.matchups);
  renderFinalStage(data);
  renderChampion(data);
  renderWinTable(data.winProbs);

  // Scroll to results
  document.getElementById('results').scrollIntoView({ behavior:'smooth', block:'start' });
}

// ─── SF Probability Rows ───
function renderSFProbs(sfProbs) {
  const grid = document.getElementById('sfProbGrid');
  grid.innerHTML = '';
  const medals = ['🥇','🥈','🥉','4️⃣'];
  const colors  = ['var(--gold)','#a0aec0','#cd7f32','var(--blue2)'];

  sfProbs.forEach((item, idx) => {
    const t   = TEAMS[item.t];
    const isTop4 = idx < 4;
    const row = document.createElement('div');
    row.className = `sf-prob-row fade-in ${isTop4 ? 'top4' : ''} ${idx===0?'rank1':''}`;
    row.style.animationDelay = (idx * 0.05) + 's';

    const barColor = idx === 0 ? 'var(--gold)' : idx < 4 ? colors[idx] : 'var(--border2)';
    const maxPct   = sfProbs[0].pct;
    const barWidth = (item.pct / maxPct) * 100;

    const tagHtml = idx < 4
      ? `<span class="prob-tag tag-sf">${isTop4 ? (idx === 0 ? '🏆 Top Pick' : 'Semi-finalist') : ''}</span>`
      : (idx < 6 ? `<span class="prob-tag tag-dark">Dark horse</span>` : '');

    row.innerHTML = `
      <div class="prob-rank">${isTop4 ? medals[idx] : idx+1}</div>
      <div class="prob-flag-lg">${t.flag}</div>
      <div class="prob-name-col">
        <div class="prob-name-lg">${t.name}</div>
        ${isTop4 ? `<div class="prob-record-sm">${t.record}</div>` : ''}
      </div>
      <div class="prob-bar-col">
        <div class="prob-bar-lg">
          <div class="prob-bar-lg-fill" style="width:${barWidth}%; background:${barColor};"></div>
        </div>
      </div>
      <div class="prob-pct-lg" style="color:${barColor}">${item.pct.toFixed(1)}%</div>
      ${tagHtml}
    `;
    grid.appendChild(row);
  });
}

// ─── Matchup Cards ───
function renderMatchups(matchups) {
  const grid = document.getElementById('matchupGrid');
  grid.innerHTML = '';

  matchups.forEach((m, idx) => {
    const t1 = TEAMS[m.t1], t2 = TEAMS[m.t2];
    const card = document.createElement('div');
    card.className = `matchup-card fade-in ${idx===0?'top':''}`;
    card.style.animationDelay = (idx * 0.06) + 's';
    card.innerHTML = `
      ${idx === 0 ? '<div class="matchup-top-tag">MOST LIKELY</div>' : ''}
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
      </div>
    `;
    grid.appendChild(card);
  });
}

// ─── Final Stage ───
function renderFinalStage(data) {
  const el = document.getElementById('finalStage');
  const t1 = data.topFinal.t1, t2 = data.topFinal.t2;
  const p1 = data.t1WinPct > data.t2WinPct ? data.t1WinPct : data.t2WinPct;
  const p2 = 100 - p1;
  const teamA = data.t1WinPct >= data.t2WinPct ? t1 : t2;
  const teamB = teamA === t1 ? t2 : t1;
  const tA = TEAMS[teamA], tB = TEAMS[teamB];

  el.innerHTML = `
    <div class="final-badge">🏆 The Final · July 19 · MetLife Stadium, New Jersey</div>
    <div class="final-matchup">
      <div class="final-team">
        <div class="final-flag">${tA.flag}</div>
        <div class="final-name">${tA.name}</div>
        <div class="final-sub">SF1 Winner · ${tA.history.split('·')[0].trim()}</div>
        <div class="final-pct" style="color:var(--gold)">${p1.toFixed(1)}%</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">to win Final</div>
      </div>
      <div class="final-vs">
        FINAL<br>
        <span>JUL 19</span>
      </div>
      <div class="final-team">
        <div class="final-flag">${tB.flag}</div>
        <div class="final-name">${tB.name}</div>
        <div class="final-sub">SF2 Winner · ${tB.history.split('·')[0].trim()}</div>
        <div class="final-pct" style="color:var(--text2)">${p2.toFixed(1)}%</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px">to win Final</div>
      </div>
    </div>
    <div class="final-bar">
      <div style="width:${p1}%;height:100%;background:linear-gradient(90deg,var(--gold),#c47c00);border-radius:4px;"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;margin-top:6px;padding:0 2px;font-family:'Barlow Condensed',sans-serif;font-weight:600;letter-spacing:.05em;">
      <span style="color:var(--gold)">${tA.name} ${p1.toFixed(1)}%</span>
      <span style="color:var(--text3)">±14% simulation noise per match</span>
      <span style="color:var(--text3)">${tB.name} ${p2.toFixed(1)}%</span>
    </div>
  `;
}

// ─── Champion Stage ───
function renderChampion(data) {
  const el = document.getElementById('championStage');
  const t = TEAMS[data.champion];
  const winPct = data.winProbs.find(w => w.t === data.champion)?.pct || 0;
  const PATHS = {
    FRA: [
      { stage:'R16', vs:'vs Senegal',  pct:'92.5%' },
      { stage:'QF',  vs:'vs Germany',  pct:'76.5%' },
      { stage:'SF',  vs:'vs Spain',    pct:'59.8%' },
      { stage:'FINAL', vs:'vs Argentina', pct:`${(100-data.t2WinPct).toFixed(1)}%` },
    ],
    ARG: [
      { stage:'R16', vs:'vs Colombia', pct:'84.0%' },
      { stage:'QF',  vs:'vs Brazil',   pct:'62.1%' },
      { stage:'SF',  vs:'vs England',  pct:'69.3%' },
      { stage:'FINAL', vs:'vs France', pct:`${(100-data.t1WinPct).toFixed(1)}%` },
    ],
    ESP: [
      { stage:'R16', vs:'vs Japan',    pct:'86.3%' },
      { stage:'QF',  vs:'vs Morocco',  pct:'75.2%' },
      { stage:'SF',  vs:'vs France',   pct:'40.2%' },
      { stage:'FINAL', vs:'vs Argentina', pct:'50%' },
    ],
    ENG: [
      { stage:'R16', vs:'vs Croatia',  pct:'71.0%' },
      { stage:'QF',  vs:'vs Portugal', pct:'52.7%' },
      { stage:'SF',  vs:'vs Argentina', pct:'30.7%' },
      { stage:'FINAL', vs:'vs France', pct:'46%' },
    ],
  };
  const path = PATHS[data.champion] || [
    { stage:'R16', vs:'Strong run', pct:'—' },
    { stage:'QF',  vs:'Knocked out bigger teams', pct:'—' },
    { stage:'SF',  vs:'Reached semi-final', pct:'—' },
    { stage:'FINAL', vs:'Won the Final', pct:`${winPct.toFixed(1)}%` },
  ];

  const pathHtml = path.map((p, i) => `
    <div class="path-step">
      ${i > 0 ? '<div class="path-arrow">→</div>' : ''}
      <div class="path-box">
        <div class="path-stage">${p.stage}</div>
        <div class="path-opponent">${p.vs}</div>
        <div class="path-pct">${p.pct}</div>
      </div>
    </div>
  `).join('');

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
    <div class="champion-path">${pathHtml}</div>
  `;
}

// ─── Win Probability Table ───
function renderWinTable(winProbs) {
  const el = document.getElementById('winTable');
  el.className = 'win-table';
  el.innerHTML = '';
  const maxPct = winProbs[0].pct;

  winProbs.forEach((item, idx) => {
    const t   = TEAMS[item.t];
    const barW = (item.pct / maxPct) * 100;
    const colors = ['var(--gold)','#a0aec0','#cd7f32','var(--blue2)'];
    const barColor = idx < 4 ? colors[idx] : 'var(--border2)';
    const note = idx === 0 ? '🏆 Champion' : idx === 1 ? 'Runner-up' : idx === 2 ? '3rd place' : idx === 3 ? '4th place' : idx < 6 ? 'QF exit' : '';

    const row = document.createElement('div');
    row.className = `win-row fade-in ${idx===0?'w1':idx===1?'w2':''}`;
    row.style.animationDelay = (idx * 0.04) + 's';
    row.innerHTML = `
      <div class="win-rank" style="color:${barColor}">${idx+1}</div>
      <div class="win-flag">${t.flag}</div>
      <div class="win-name" style="color:${idx<4?'var(--text)':'var(--text2)'}">${t.name}</div>
      <div class="win-bar-col">
        <div class="win-bar-fill" style="width:${barW}%; background:${barColor};"></div>
      </div>
      <div class="win-pct" style="color:${barColor}">${item.pct.toFixed(1)}%</div>
      ${note ? `<div class="win-note">${note}</div>` : ''}
    `;
    el.appendChild(row);
  });
}
