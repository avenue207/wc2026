// ═══════════════════════════════════════════════
//  LIVE MATCH ODDS — WC 2026 GROUP STAGE
//  Sources: Bet365, FanDuel, William Hill, Pinnacle
//  Updated: June 8 2026 (pre-tournament kickoff)
// ═══════════════════════════════════════════════

const MATCHES = [
  { id:"A1", date:"Jun 11", group:"A", venue:"Mexico City",
    home:"Mexico", homeFlag:"🇲🇽", away:"South Africa", awayFlag:"🇿🇦",
    homeML:-350, awayML:320,
    ah:{ line:-1, homeLabel:"MEX -1", awayLabel:"RSA +1", homePayout:1.85, awayPayout:1.95 },
    simHomeWin:74, simCoverAH:48, marketCoverAH:50,
    notes:"Mexico 74% win but -1 cover needs 2+ goals. Home crowd massive but margin uncertain.",
    rec:"slight", recLabel:"MEX -1 slight edge", recDetail:"Sim: 48% cover vs 50% needed — marginal. ML safer." },

  { id:"C1", date:"Jun 13", group:"C", venue:"East Rutherford NJ",
    home:"Brazil", homeFlag:"🇧🇷", away:"Morocco", awayFlag:"🇲🇦",
    homeML:-350, awayML:320,
    ah:{ line:-1, homeLabel:"BRA -1", awayLabel:"MAR +1", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:70, simCoverAH:44, marketCoverAH:50,
    notes:"Morocco's DEF 89 + Bounou (GK 87) make -1 cover very hard. Brazil 70% win but only 44% by 2+.",
    rec:"avoid", recLabel:"❌ Avoid BRA -1", recDetail:"44% cover < 50% needed = negative edge. Morocco built WC 2022 on clean sheets. Take BRA ML." },

  { id:"D1", date:"Jun 12", group:"D", venue:"Los Angeles",
    home:"USA", homeFlag:"🇺🇸", away:"Paraguay", awayFlag:"🇵🇾",
    homeML:130, awayML:340,
    ah:{ line:0, homeLabel:"USA 0 (DNB)", awayLabel:"PAR 0 (DNB)", homePayout:1.80, awayPayout:2.05 },
    simHomeWin:51, simCoverAH:51, marketCoverAH:50,
    notes:"Very tight match. USA home crowd advantage vs Paraguay's CONMEBOL battle-hardened quality.",
    rec:"neutral", recLabel:"— Skip", recDetail:"51% vs 50% needed — too thin. No clear edge either way." },

  { id:"E1", date:"Jun 14", group:"E", venue:"Houston",
    home:"Germany", homeFlag:"🇩🇪", away:"Curaçao", awayFlag:"🇨🇼",
    homeML:-1800, awayML:2500,
    ah:{ line:-2.5, homeLabel:"GER -2.5", awayLabel:"CUR +2.5", homePayout:1.85, awayPayout:1.95 },
    simHomeWin:97, simCoverAH:72, marketCoverAH:50,
    notes:"Germany 97% win. Wirtz + Musiala vs +17500 longshots. -2.5 cover (win by 3+) is 72% likely.",
    rec:"strong", recLabel:"🔥 GER -2.5 STRONG", recDetail:"+22% edge over market. Best value bet of Round 1. Lay confidently." },

  { id:"F1", date:"Jun 14", group:"F", venue:"Dallas",
    home:"Netherlands", homeFlag:"🇳🇱", away:"Japan", awayFlag:"🇯🇵",
    homeML:-130, awayML:310,
    ah:{ line:-0.25, homeLabel:"NED -0.25", awayLabel:"JPN +0.25", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:54, simCoverAH:54, marketCoverAH:50,
    notes:"NED 54% win. Japan giant-killers but Van Dijk + Gakpo form is elite. -0.25 gives half stake back on draw.",
    rec:"slight", recLabel:"NED -0.25 slight edge", recDetail:"54% effective cover vs 50% = +4%. Thin — small stake only." },

  { id:"G1", date:"Jun 15", group:"G", venue:"Seattle",
    home:"Belgium", homeFlag:"🇧🇪", away:"Egypt", awayFlag:"🇪🇬",
    homeML:-280, awayML:390,
    ah:{ line:-1, homeLabel:"BEL -1", awayLabel:"EGY +1", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:67, simCoverAH:46, marketCoverAH:50,
    notes:"Belgium 67% win but -1 cover only 46% — Egypt is compact and disciplined defensively.",
    rec:"avoid", recLabel:"❌ Avoid BEL -1", recDetail:"46% < 50% needed. Negative edge. Take BEL ML at -280 instead." },

  { id:"H1", date:"Jun 15", group:"H", venue:"Atlanta",
    home:"Spain", homeFlag:"🇪🇸", away:"Cape Verde", awayFlag:"🇨🇻",
    homeML:-1400, awayML:2800,
    ah:{ line:-2.5, homeLabel:"ESP -2.5", awayLabel:"CPV +2.5", homePayout:1.85, awayPayout:1.95 },
    simHomeWin:96, simCoverAH:71, marketCoverAH:50,
    notes:"Spain 96% win vs +250000 longshots. Yamal, Pedri, Morata — built to dominate. -2.5 cover 71%.",
    rec:"strong", recLabel:"🔥 ESP -2.5 STRONG", recDetail:"+21% edge. Spain's attack (MID 95) vs weakest team in tournament. Highest confidence pick." },

  { id:"H2", date:"Jun 15", group:"H", venue:"Miami",
    home:"Saudi Arabia", homeFlag:"🇸🇦", away:"Uruguay", awayFlag:"🇺🇾",
    homeML:420, awayML:-160,
    ah:{ line:-0.5, homeLabel:"URU -0.5", awayLabel:"KSA +0.5", homePayout:1.80, awayPayout:2.05 },
    simHomeWin:60, simCoverAH:60, marketCoverAH:56,
    notes:"Uruguay (Valverde, Núñez, Araújo) 60% win vs Saudi Arabia. -0.5 means just need URU to win.",
    rec:"slight", recLabel:"URU -0.5 slight edge", recDetail:"60% vs 56% needed at 1.80 water = thin. URU ML better value." },

  { id:"I1", date:"Jun 16", group:"I", venue:"East Rutherford NJ",
    home:"France", homeFlag:"🇫🇷", away:"Senegal", awayFlag:"🇸🇳",
    homeML:-250, awayML:420,
    ah:{ line:-1, homeLabel:"FRA -1", awayLabel:"SEN +1", homePayout:1.90, awayPayout:1.90 },
    simHomeWin:72, simCoverAH:55, marketCoverAH:50,
    notes:"France face their own R16 bracket opponent. Mbappé vs Mendy. 72% win, 55% to cover -1 (win by 2+).",
    rec:"value", recLabel:"✅ FRA -1 GOOD VALUE", recDetail:"+5% edge at 1.90 water. France ATK 94 in full flow. Solid group stage pick." },

  { id:"J1", date:"Jun 17", group:"J", venue:"Miami",
    home:"Argentina", homeFlag:"🇦🇷", away:"Algeria", awayFlag:"🇩🇿",
    homeML:-350, awayML:400,
    ah:{ line:-1.5, homeLabel:"ARG -1.5", awayLabel:"ALG +1.5", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:78, simCoverAH:57, marketCoverAH:50,
    notes:"Messi opening WC match. Argentina EXP 96, ATK 93. Algeria outsiders. -1.5 needs 2+ goal margin. 57% likely.",
    rec:"value", recLabel:"✅ ARG -1.5 GOOD VALUE", recDetail:"+7% edge at 1.88. Messi's final WC opener — maximum motivation. Reliable pick." },

  { id:"K1", date:"Jun 17", group:"K", venue:"Kansas City",
    home:"Portugal", homeFlag:"🇵🇹", away:"Congo DR", awayFlag:"🇨🇩",
    homeML:-400, awayML:550,
    ah:{ line:-1.5, homeLabel:"POR -1.5", awayLabel:"CGO +1.5", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:81, simCoverAH:61, marketCoverAH:50,
    notes:"Portugal vs first-time WC qualifier. Leão, Bruno Fernandes, Rúben Dias — 81% win, 61% cover.",
    rec:"value", recLabel:"✅ POR -1.5 GOOD VALUE", recDetail:"+11% edge — best of the value picks. Ronaldo wants to score. Portugal attack flows freely here." },

  { id:"L1", date:"Jun 17", group:"L", venue:"Boston",
    home:"England", homeFlag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", away:"Croatia", awayFlag:"🇭🇷",
    homeML:-180, awayML:380,
    ah:{ line:-0.75, homeLabel:"ENG -0.75", awayLabel:"CRO +0.75", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:61, simCoverAH:52, marketCoverAH:50,
    notes:"WC 2018 SF rematch. England 61% win. -0.75 returns half stake if ENG win by 1. Bellingham vs Modrić.",
    rec:"slight", recLabel:"ENG -0.75 slight edge", recDetail:"+2% edge only. Razor thin. Modrić's experience in big games makes this uncertain." },
];

const REC_CONFIG = {
  strong:  { color:"#22c55e", bg:"rgba(34,197,94,.12)", border:"rgba(34,197,94,.3)" },
  value:   { color:"#4ade80", bg:"rgba(74,222,128,.08)", border:"rgba(74,222,128,.25)" },
  slight:  { color:"#facc15", bg:"rgba(250,204,21,.06)", border:"rgba(250,204,21,.2)" },
  neutral: { color:"#6b7f99", bg:"rgba(107,127,153,.05)", border:"rgba(107,127,153,.15)" },
  avoid:   { color:"#f97316", bg:"rgba(249,115,22,.08)", border:"rgba(249,115,22,.25)" },
};

function waterLabel(payout) {
  if (payout >= 1.93) return { txt:"High 水位 " + payout, col:"#22c55e" };
  if (payout >= 1.88) return { txt:"Standard 水位 " + payout, col:"#facc15" };
  return { txt:"Low 水位 " + payout, col:"#f97316" };
}
