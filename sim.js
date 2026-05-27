// ═══════════════════════════════════════════════
//  SIMULATION ENGINE — Monte Carlo
// ═══════════════════════════════════════════════

const NUM_SIMS = 100000;

// Compute strength differential between teams A and B
function strengthDiff(a, b) {
  const sa = TEAMS[a].stats, sb = TEAMS[b].stats;
  const offA = sa.atk * 0.55 + sa.mid * 0.45;
  const defB = sb.def * 0.55 + sb.gk  * 0.45;
  const offB = sb.atk * 0.55 + sb.mid * 0.45;
  const defA = sa.def * 0.55 + sa.gk  * 0.45;
  const netA = (offA - defB) + (sa.form  - sb.form)  * 0.25
                             + (sa.exp   - sb.exp)   * 0.15
                             + (sa.depth - sb.depth) * 0.10;
  const netB = (offB - defA) + (sb.form  - sa.form)  * 0.25
                             + (sb.exp   - sa.exp)   * 0.15
                             + (sb.depth - sa.depth) * 0.10;
  return netA - netB;
}

// Base win probability for A over B (sigmoid)
function baseWinProb(a, b) {
  const diff = strengthDiff(a, b);
  return 1 / (1 + Math.exp(-diff * 0.068));
}

// Simulate a single match with football noise
function playMatch(a, b) {
  const p = baseWinProb(a, b);
  const noise = (Math.random() - 0.5) * 0.28; // ±14% randomness
  const final = Math.max(0.05, Math.min(0.95, p + noise));
  return Math.random() < final ? a : b;
}

// Run one full tournament simulation
function runOneTournament() {
  // Round of 16
  const r16Results = R16.map(m => playMatch(m.t1, m.t2));

  // Quarter-finals (pairs within each half)
  const qfL1 = playMatch(r16Results[0], r16Results[1]); // L QF1
  const qfL2 = playMatch(r16Results[2], r16Results[3]); // L QF2
  const qfR1 = playMatch(r16Results[4], r16Results[5]); // R QF1
  const qfR2 = playMatch(r16Results[6], r16Results[7]); // R QF2

  // Semi-finals
  const sf1 = playMatch(qfL1, qfL2); // SF Left
  const sf2 = playMatch(qfR1, qfR2); // SF Right

  // Final
  const champion = playMatch(sf1, sf2);
  const runnerUp = champion === sf1 ? sf2 : sf1;

  return {
    sf: [qfL1, qfL2, qfR1, qfR2], // QF winners = SF participants
    sfWinners: [sf1, sf2],
    finalist1: sf1,
    finalist2: sf2,
    champion,
    runnerUp,
  };
}

// Run full Monte Carlo simulation
function runSimulation() {
  const btn = document.getElementById('runBtn');
  btn.classList.add('running');
  btn.querySelector('.btn-text').textContent = 'Simulating…';
  btn.disabled = true;

  // Use setTimeout to allow UI to update before heavy computation
  setTimeout(() => {
    const sfCount   = {};
    const matchupCount = {};
    const finalistCount = {};
    const winCount  = {};

    for (let i = 0; i < NUM_SIMS; i++) {
      const t = runOneTournament();

      // SF participants
      t.sf.forEach(team => {
        sfCount[team] = (sfCount[team] || 0) + 1;
      });

      // SF matchup pairs
      const mL = [t.sf[0], t.sf[1]].sort().join('|');
      const mR = [t.sf[2], t.sf[3]].sort().join('|');
      matchupCount[mL] = (matchupCount[mL] || 0) + 1;
      matchupCount[mR] = (matchupCount[mR] || 0) + 1;

      // Finalists
      const fk = [t.finalist1, t.finalist2].sort().join('|');
      finalistCount[fk] = (finalistCount[fk] || 0) + 1;

      // Champion
      winCount[t.champion] = (winCount[t.champion] || 0) + 1;
    }

    // Convert to percentages and sort
    const sfProbs = Object.entries(sfCount)
      .map(([t, c]) => ({ t, pct: (c / NUM_SIMS) * 100 }))
      .sort((a, b) => b.pct - a.pct);

    const matchups = Object.entries(matchupCount)
      .map(([k, c]) => {
        const [t1, t2] = k.split('|');
        return { t1, t2, pct: (c / (NUM_SIMS * 2)) * 100 };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 8);

    const finals = Object.entries(finalistCount)
      .map(([k, c]) => {
        const [t1, t2] = k.split('|');
        return { t1, t2, pct: (c / NUM_SIMS) * 100 };
      })
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);

    const winProbs = Object.entries(winCount)
      .map(([t, c]) => ({ t, pct: (c / NUM_SIMS) * 100 }))
      .sort((a, b) => b.pct - a.pct);

    // Determine champion and runner-up from top final
    const topFinal = finals[0];
    const t1WinPct = (winCount[topFinal.t1] || 0) / NUM_SIMS * 100;
    const t2WinPct = (winCount[topFinal.t2] || 0) / NUM_SIMS * 100;
    const champion = t1WinPct >= t2WinPct ? topFinal.t1 : topFinal.t2;
    const runnerUp = champion === topFinal.t1 ? topFinal.t2 : topFinal.t1;

    const results = { sfProbs, matchups, finals, winProbs, champion, runnerUp, topFinal, t1WinPct, t2WinPct };

    // Render
    renderResults(results);

    // Update button
    btn.classList.remove('running');
    btn.querySelector('.btn-text').textContent = '✓ Re-run Simulation';
    btn.disabled = false;
  }, 80);
}
