// ═══════════════════════════════════════════════
//  COMPREHENSIVE MATCH ODDS — WC 2026
//  Sources: Bet365, Pinnacle, FanDuel, William Hill
//  AH = Asian Handicap | 水位 = Payout rate
//  Updated: June 8 2026
// ═══════════════════════════════════════════════

// Player key icons per team (initials + color for avatar)
const KEY_PLAYERS = {
  FRA:[{init:"KM",name:"Mbappé",role:"ATK",col:"#2979ff"},{init:"MM",name:"Maignan",role:"GK",col:"#1565c0"},{init:"WS",name:"Saliba",role:"DEF",col:"#0d47a1"}],
  ESP:[{init:"RO",name:"Rodri",role:"MID",col:"#c62828"},{init:"PE",name:"Pedri",role:"MID",col:"#b71c1c"},{init:"LY",name:"Yamal",role:"ATK",col:"#d32f2f"}],
  ARG:[{init:"LM",name:"Messi",role:"ATK",col:"#1b5e20"},{init:"EM",name:"E.Martínez",role:"GK",col:"#2e7d32"},{init:"CR",name:"Romero",role:"DEF",col:"#388e3c"}],
  ENG:[{init:"JB",name:"Bellingham",role:"MID",col:"#bf360c"},{init:"HK",name:"Kane",role:"FWD",col:"#e64a19"},{init:"BS",name:"Saka",role:"ATK",col:"#f4511e"}],
  BRA:[{init:"VJ",name:"Vinícius",role:"ATK",col:"#f9a825"},{init:"RO",name:"Rodrygo",role:"ATK",col:"#f57f17"},{init:"AB",name:"Alisson",role:"GK",col:"#e65100"}],
  POR:[{init:"BF",name:"B.Fernandes",role:"MID",col:"#880e4f"},{init:"RL",name:"Leão",role:"ATK",col:"#ad1457"},{init:"RD",name:"R.Dias",role:"DEF",col:"#c2185b"}],
  GER:[{init:"FW",name:"Wirtz",role:"ATK",col:"#212121"},{init:"JM",name:"Musiala",role:"MID",col:"#424242"},{init:"AR",name:"Rüdiger",role:"DEF",col:"#616161"}],
  MAR:[{init:"AH",name:"Hakimi",role:"DEF",col:"#004d40"},{init:"YB",name:"Bounou",role:"GK",col:"#00695c"},{init:"SA",name:"Amrabat",role:"MID",col:"#00796b"}],
  NED:[{init:"VV",name:"Van Dijk",role:"DEF",col:"#e65100"},{init:"CG",name:"Gakpo",role:"ATK",col:"#bf360c"},{init:"FJ",name:"De Jong",role:"MID",col:"#d84315"}],
  URU:[{init:"FV",name:"Valverde",role:"MID",col:"#1a237e"},{init:"DN",name:"Núñez",role:"FWD",col:"#283593"},{init:"RA",name:"Araújo",role:"DEF",col:"#303f9f"}],
  BEL:[{init:"KD",name:"De Bruyne",role:"MID",col:"#311b92"},{init:"RL",name:"Lukaku",role:"FWD",col:"#4527a0"},{init:"TC",name:"Courtois",role:"GK",col:"#512da8"}],
  CRO:[{init:"LM",name:"Modrić",role:"MID",col:"#b71c1c"},{init:"JG",name:"Gvardiol",role:"DEF",col:"#c62828"},{init:"MK",name:"Kovačić",role:"MID",col:"#d32f2f"}],
  SEN:[{init:"SM",name:"Mané",role:"ATK",col:"#004d40"},{init:"EM",name:"Mendy",role:"GK",col:"#00695c"},{init:"IG",name:"Gueye",role:"MID",col:"#00796b"}],
  JPN:[{init:"KM",name:"Mitoma",role:"ATK",col:"#1a237e"},{init:"WE",name:"Endō",role:"MID",col:"#283593"},{init:"KI",name:"Itakura",role:"DEF",col:"#303f9f"}],
  COL:[{init:"LD",name:"L.Díaz",role:"ATK",col:"#f57f17"},{init:"JR",name:"James",role:"MID",col:"#f9a825"},{init:"DM",name:"Muñoz",role:"DEF",col:"#fbc02d"}],
  USA:[{init:"CP",name:"Pulisic",role:"ATK",col:"#b71c1c"},{init:"GR",name:"Reyna",role:"MID",col:"#c62828"},{init:"TA",name:"Adams",role:"MID",col:"#d32f2f"}],
};

// ── STAGES ──
const STAGE = { GRP:"Group Stage", R32:"Round of 32", R16:"Round of 16", QF:"Quarter-Final", SF:"Semi-Final", F:"Final" };

const MATCHES = [

  // ══════════════════════════════════════════════════════
  //  GROUP STAGE — ROUND 1 (Jun 11–17)
  // ══════════════════════════════════════════════════════

  { id:"A1", stage:"GRP", date:"Jun 11", group:"Group A", venue:"Mexico City",
    home:"Mexico", homeFlag:"🇲🇽", homeCode:"MEX",
    away:"South Africa", awayFlag:"🇿🇦", awayCode:"RSA",
    homeML:-350, awayML:320,
    ah:{ line:-1, homeLabel:"MEX -1", awayLabel:"RSA +1", homePayout:1.85, awayPayout:1.95 },
    simHomeWin:74, simCoverAH:48, marketCoverAH:50, edge:-2,
    notes:"Mexico 74% to win at home Azteca but -1 cover needs 2+ goals. High crowd energy but margin uncertain.",
    rec:"slight", recLabel:"MEX ML safer than AH", recDetail:"48% cover < 50% needed. Marginal negative edge on -1. Back MEX on ML instead." },

  { id:"A2", stage:"GRP", date:"Jun 11", group:"Group A", venue:"Guadalajara",
    home:"Korea Republic", homeFlag:"🇰🇷", homeCode:"KOR",
    away:"Czechia", awayFlag:"🇨🇿", awayCode:"CZE",
    homeML:180, awayML:210,
    ah:{ line:0, homeLabel:"KOR 0", awayLabel:"CZE 0", homePayout:1.90, awayPayout:1.90 },
    simHomeWin:44, simCoverAH:44, marketCoverAH:50, edge:-6,
    notes:"Balanced match. Czechia slight sim edge. DNB at 0 — draw refunds stake.",
    rec:"avoid", recLabel:"Skip — no clear edge", recDetail:"Sim favours Czechia 48% but market prices evenly. Both sides within vig." },

  { id:"C1", stage:"GRP", date:"Jun 13", group:"Group C", venue:"East Rutherford NJ",
    home:"Brazil", homeFlag:"🇧🇷", homeCode:"BRA", homePlayers:["BRA"],
    away:"Morocco", awayFlag:"🇲🇦", awayCode:"MAR", awayPlayers:["MAR"],
    homeML:-350, awayML:320,
    ah:{ line:-1, homeLabel:"BRA -1", awayLabel:"MAR +1", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:70, simCoverAH:44, marketCoverAH:50, edge:-6,
    notes:"Morocco DEF 89 + Bounou GK 87 = elite defensive block. Brazil 70% win but only 44% to win by 2+.",
    rec:"avoid", recLabel:"❌ Avoid BRA -1", recDetail:"Morocco's 2022 WC was built on clean sheets. Negative edge. Take BRA ML at -350." },

  { id:"D1", stage:"GRP", date:"Jun 12", group:"Group D", venue:"Los Angeles",
    home:"USA", homeFlag:"🇺🇸", homeCode:"USA", homePlayers:["USA"],
    away:"Paraguay", awayFlag:"🇵🇾", awayCode:"PAR",
    homeML:130, awayML:340,
    ah:{ line:0, homeLabel:"USA 0 (DNB)", awayLabel:"PAR 0 (DNB)", homePayout:1.80, awayPayout:2.05 },
    simHomeWin:51, simCoverAH:51, marketCoverAH:50, edge:1,
    notes:"USA co-host home advantage vs Paraguay's CONMEBOL quality. Very tight. DNB returns stake on draw.",
    rec:"neutral", recLabel:"— Skip", recDetail:"51% vs 50% needed — too thin to justify. No clear sim edge." },

  { id:"E1", stage:"GRP", date:"Jun 14", group:"Group E", venue:"Houston",
    home:"Germany", homeFlag:"🇩🇪", homeCode:"GER", homePlayers:["GER"],
    away:"Curaçao", awayFlag:"🇨🇼", awayCode:"CUR",
    homeML:-1800, awayML:2500,
    ah:{ line:-2.5, homeLabel:"GER -2.5", awayLabel:"CUR +2.5", homePayout:1.85, awayPayout:1.95 },
    simHomeWin:97, simCoverAH:72, marketCoverAH:50, edge:22,
    notes:"Germany 97% win probability. Wirtz + Musiala vs WC +17,500 longshots. Win by 3+ is 72% likely.",
    rec:"strong", recLabel:"🔥 GER -2.5 STRONG VALUE", recDetail:"+22% edge at 1.85. Best bang-for-buck in Round 1. Lay with confidence." },

  { id:"F1", stage:"GRP", date:"Jun 14", group:"Group F", venue:"Dallas",
    home:"Netherlands", homeFlag:"🇳🇱", homeCode:"NED", homePlayers:["NED"],
    away:"Japan", awayFlag:"🇯🇵", awayCode:"JPN", awayPlayers:["JPN"],
    homeML:-130, awayML:310,
    ah:{ line:-0.25, homeLabel:"NED -0.25", awayLabel:"JPN +0.25", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:54, simCoverAH:54, marketCoverAH:50, edge:4,
    notes:"NED 54% win. Van Dijk + Gakpo elite form. Japan giant-killers but NED width causes problems.",
    rec:"slight", recLabel:"NED -0.25 slight edge", recDetail:"+4% effective edge. Half stake back on draw. Small stake only." },

  { id:"G1", stage:"GRP", date:"Jun 15", group:"Group G", venue:"Seattle",
    home:"Belgium", homeFlag:"🇧🇪", homeCode:"BEL", homePlayers:["BEL"],
    away:"Egypt", awayFlag:"🇪🇬", awayCode:"EGY",
    homeML:-280, awayML:390,
    ah:{ line:-1, homeLabel:"BEL -1", awayLabel:"EGY +1", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:67, simCoverAH:46, marketCoverAH:50, edge:-4,
    notes:"Belgium 67% win but only 46% to win by 2+. Egypt compact and disciplined defensively.",
    rec:"avoid", recLabel:"❌ Avoid BEL -1", recDetail:"Negative edge on -1. BEL ML at -280 is safer play." },

  { id:"H1", stage:"GRP", date:"Jun 15", group:"Group H", venue:"Atlanta",
    home:"Spain", homeFlag:"🇪🇸", homeCode:"ESP", homePlayers:["ESP"],
    away:"Cape Verde", awayFlag:"🇨🇻", awayCode:"CPV",
    homeML:-1400, awayML:2800,
    ah:{ line:-2.5, homeLabel:"ESP -2.5", awayLabel:"CPV +2.5", homePayout:1.85, awayPayout:1.95 },
    simHomeWin:96, simCoverAH:71, marketCoverAH:50, edge:21,
    notes:"Spain 96% win vs +250,000 WC outsiders. Pedri, Rodri, Yamal — built to dominate. -2.5 cover 71%.",
    rec:"strong", recLabel:"🔥 ESP -2.5 STRONG VALUE", recDetail:"+21% edge. Spain's MID 95 vs weakest squad in tournament. Top confidence pick." },

  { id:"H2", stage:"GRP", date:"Jun 15", group:"Group H", venue:"Miami",
    home:"Saudi Arabia", homeFlag:"🇸🇦", homeCode:"KSA",
    away:"Uruguay", awayFlag:"🇺🇾", awayCode:"URU", awayPlayers:["URU"],
    homeML:420, awayML:-160,
    ah:{ line:-0.5, homeLabel:"URU -0.5", awayLabel:"KSA +0.5", homePayout:1.80, awayPayout:2.05 },
    simHomeWin:60, simCoverAH:60, marketCoverAH:56, edge:4,
    notes:"Uruguay (Valverde, Núñez, Araújo) 60% win. -0.5 = just need Uruguay to win. Thin payout.",
    rec:"slight", recLabel:"URU -0.5 thin edge", recDetail:"+4% effective edge but 1.80 水位 is low. URU ML better value." },

  { id:"I1", stage:"GRP", date:"Jun 16", group:"Group I", venue:"East Rutherford NJ",
    home:"France", homeFlag:"🇫🇷", homeCode:"FRA", homePlayers:["FRA"],
    away:"Senegal", awayFlag:"🇸🇳", awayCode:"SEN", awayPlayers:["SEN"],
    homeML:-250, awayML:420,
    ah:{ line:-1, homeLabel:"FRA -1", awayLabel:"SEN +1", homePayout:1.90, awayPayout:1.90 },
    simHomeWin:72, simCoverAH:55, marketCoverAH:50, edge:5,
    notes:"France ATK 94 + Mbappé speed vs Mendy GK 83. 72% win, 55% to cover -1 (win by 2+).",
    rec:"value", recLabel:"✅ FRA -1 GOOD VALUE", recDetail:"+5% at 1.90 water. France's full attack in first match. Solid group pick." },

  { id:"J1", stage:"GRP", date:"Jun 17", group:"Group J", venue:"Miami",
    home:"Argentina", homeFlag:"🇦🇷", homeCode:"ARG", homePlayers:["ARG"],
    away:"Algeria", awayFlag:"🇩🇿", awayCode:"ALG",
    homeML:-350, awayML:400,
    ah:{ line:-1.5, homeLabel:"ARG -1.5", awayLabel:"ALG +1.5", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:78, simCoverAH:57, marketCoverAH:50, edge:7,
    notes:"Messi's final WC opener. Argentina EXP 96, ATK 93. -1.5 cover 57% probable. Maximum motivation.",
    rec:"value", recLabel:"✅ ARG -1.5 GOOD VALUE", recDetail:"+7% edge. Last WC for Messi — Argentina will be fired up. Reliable pick." },

  { id:"K1", stage:"GRP", date:"Jun 17", group:"Group K", venue:"Kansas City",
    home:"Portugal", homeFlag:"🇵🇹", homeCode:"POR", homePlayers:["POR"],
    away:"Congo DR", awayFlag:"🇨🇩", awayCode:"CGO",
    homeML:-400, awayML:550,
    ah:{ line:-1.5, homeLabel:"POR -1.5", awayLabel:"CGO +1.5", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:81, simCoverAH:61, marketCoverAH:50, edge:11,
    notes:"Portugal vs first-time WC qualifier. Leão + B.Fernandes in full flow. 81% win, 61% to cover -1.5.",
    rec:"value", recLabel:"✅ POR -1.5 GOOD VALUE", recDetail:"+11% edge — best value pick this round. Ronaldo wants to score. Full confidence." },

  { id:"L1", stage:"GRP", date:"Jun 17", group:"Group L", venue:"Boston",
    home:"England", homeFlag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", homeCode:"ENG", homePlayers:["ENG"],
    away:"Croatia", awayFlag:"🇭🇷", awayCode:"CRO", awayPlayers:["CRO"],
    homeML:-180, awayML:380,
    ah:{ line:-0.75, homeLabel:"ENG -0.75", awayLabel:"CRO +0.75", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:61, simCoverAH:52, marketCoverAH:50, edge:2,
    notes:"WC 2018 SF rematch. England 61% win. -0.75 returns half stake on 1-goal win. Bellingham vs Modrić.",
    rec:"slight", recLabel:"ENG -0.75 thin edge", recDetail:"+2% only — razor thin. Modrić's big-game experience makes this uncertain." },

  // ══════════════════════════════════════════════════════
  //  GROUP STAGE — ROUND 2 KEY MATCHES (Jun 18–22)
  // ══════════════════════════════════════════════════════

  { id:"C2", stage:"GRP", date:"Jun 19", group:"Group C", venue:"New York NJ",
    home:"Brazil", homeFlag:"🇧🇷", homeCode:"BRA", homePlayers:["BRA"],
    away:"Scotland", awayFlag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", awayCode:"SCO",
    homeML:-500, awayML:600,
    ah:{ line:-2, homeLabel:"BRA -2", awayLabel:"SCO +2", homePayout:1.85, awayPayout:1.95 },
    simHomeWin:88, simCoverAH:62, marketCoverAH:50, edge:12,
    notes:"Brazil vs Scotland. Vinícius in full flow. 88% win, 62% to win by 3+. Scotland +950 in group.",
    rec:"value", recLabel:"✅ BRA -2 GOOD VALUE", recDetail:"+12% edge. Vinícius vs Scotland defence — highly favourable matchup." },

  { id:"E2", stage:"GRP", date:"Jun 20", group:"Group E", venue:"Houston",
    home:"Germany", homeFlag:"🇩🇪", homeCode:"GER", homePlayers:["GER"],
    away:"Ecuador", awayFlag:"🇪🇨", awayCode:"ECU",
    homeML:-250, awayML:380,
    ah:{ line:-1, homeLabel:"GER -1", awayLabel:"ECU +1", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:68, simCoverAH:51, marketCoverAH:50, edge:1,
    notes:"Germany vs Ecuador. Stiffer test than R1. Wirtz still dominant but Ecuador resilient.",
    rec:"neutral", recLabel:"— Skip (marginal)", recDetail:"51% cover — barely above market. No meaningful edge." },

  { id:"F2", stage:"GRP", date:"Jun 20", group:"Group F", venue:"Dallas",
    home:"Netherlands", homeFlag:"🇳🇱", homeCode:"NED", homePlayers:["NED"],
    away:"Sweden", awayFlag:"🇸🇪", awayCode:"SWE",
    homeML:-200, awayML:420,
    ah:{ line:-0.75, homeLabel:"NED -0.75", awayLabel:"SWE +0.75", homePayout:1.90, awayPayout:1.90 },
    simHomeWin:63, simCoverAH:54, marketCoverAH:50, edge:4,
    notes:"Netherlands vs Sweden. NED 63% win. Gakpo vs Swedish rearguard. -0.75 partial refund structure.",
    rec:"slight", recLabel:"NED -0.75 slight edge", recDetail:"+4% effective. NED in better form — small stake play." },

  { id:"H3", stage:"GRP", date:"Jun 21", group:"Group H", venue:"Seattle",
    home:"Spain", homeFlag:"🇪🇸", homeCode:"ESP", homePlayers:["ESP"],
    away:"Saudi Arabia", awayFlag:"🇸🇦", awayCode:"KSA",
    homeML:-800, awayML:1200,
    ah:{ line:-2, homeLabel:"ESP -2", awayLabel:"KSA +2", homePayout:1.85, awayPayout:1.95 },
    simHomeWin:92, simCoverAH:67, marketCoverAH:50, edge:17,
    notes:"Spain 92% win vs Saudi Arabia. Rodri + Pedri control will be total. -2 cover 67%.",
    rec:"value", recLabel:"✅ ESP -2 GOOD VALUE", recDetail:"+17% edge. Spain's MID dominates weaker opposition. Strong pick R2." },

  { id:"I2", stage:"GRP", date:"Jun 22", group:"Group I", venue:"New York NJ",
    home:"France", homeFlag:"🇫🇷", homeCode:"FRA", homePlayers:["FRA"],
    away:"Iraq", awayFlag:"🇮🇶", awayCode:"IRQ",
    homeML:-1000, awayML:1800,
    ah:{ line:-2.5, homeLabel:"FRA -2.5", awayLabel:"IRQ +2.5", homePayout:1.85, awayPayout:1.95 },
    simHomeWin:95, simCoverAH:70, marketCoverAH:50, edge:20,
    notes:"France vs Iraq (+7000 WC odds). Mbappé will be hungry. 95% win, 70% to win by 3+.",
    rec:"strong", recLabel:"🔥 FRA -2.5 STRONG VALUE", recDetail:"+20% edge. Mbappé against this level = routine. Lay with confidence." },

  { id:"J2", stage:"GRP", date:"Jun 22", group:"Group J", venue:"Dallas",
    home:"Argentina", homeFlag:"🇦🇷", homeCode:"ARG", homePlayers:["ARG"],
    away:"Austria", awayFlag:"🇦🇹", awayCode:"AUT",
    homeML:-300, awayML:450,
    ah:{ line:-1.5, homeLabel:"ARG -1.5", awayLabel:"AUT +1.5", homePayout:1.90, awayPayout:1.90 },
    simHomeWin:75, simCoverAH:55, marketCoverAH:50, edge:5,
    notes:"Argentina vs Austria. ARG in top gear after R1. Messi + Mac Allister vs organised Austria.",
    rec:"value", recLabel:"✅ ARG -1.5 VALUE", recDetail:"+5% at 1.90. Argentina in rhythm now. Consistent value pick." },

  { id:"L2", stage:"GRP", date:"Jun 22", group:"Group L", venue:"Boston",
    home:"England", homeFlag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", homeCode:"ENG", homePlayers:["ENG"],
    away:"Ghana", awayFlag:"🇬🇭", awayCode:"GHA",
    homeML:-350, awayML:500,
    ah:{ line:-1.5, homeLabel:"ENG -1.5", awayLabel:"GHA +1.5", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:79, simCoverAH:58, marketCoverAH:50, edge:8,
    notes:"England vs Ghana. Bellingham + Kane + Saka — quality difference is massive. 58% to cover -1.5.",
    rec:"value", recLabel:"✅ ENG -1.5 VALUE", recDetail:"+8% edge. England's attack depth too much for Ghana. Solid mid-tournament pick." },

  // ══════════════════════════════════════════════════════
  //  KNOCKOUT STAGE — PROJECTED LINES
  // ══════════════════════════════════════════════════════

  { id:"R16_1", stage:"R16", date:"~Jul 2", group:"R16 Proj.", venue:"MetLife Stadium",
    home:"France", homeFlag:"🇫🇷", homeCode:"FRA", homePlayers:["FRA"],
    away:"Senegal", awayFlag:"🇸🇳", awayCode:"SEN", awayPlayers:["SEN"],
    homeML:-280, awayML:480,
    ah:{ line:-1, homeLabel:"FRA -1", awayLabel:"SEN +1", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:72, simCoverAH:54, marketCoverAH:50, edge:4,
    notes:"PROJECTED R16. France vs Senegal — group bracket path rematch. Knockout intensity tightens margins.",
    rec:"slight", recLabel:"FRA -1 slight edge (R16)", recDetail:"Knockout games tighter — simulation gives +4% edge. Smaller stake than group stage." },

  { id:"R16_2", stage:"R16", date:"~Jul 2", group:"R16 Proj.", venue:"Allegiant Stadium",
    home:"Germany", homeFlag:"🇩🇪", homeCode:"GER", homePlayers:["GER"],
    away:"USA", awayFlag:"🇺🇸", awayCode:"USA", awayPlayers:["USA"],
    homeML:-180, awayML:360,
    ah:{ line:-0.5, homeLabel:"GER -0.5", awayLabel:"USA +0.5", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:61, simCoverAH:61, marketCoverAH:50, edge:11,
    notes:"PROJECTED R16. Germany vs USA host nation. USA home crowd roaring but GER quality significant edge.",
    rec:"value", recLabel:"✅ GER -0.5 VALUE (R16)", recDetail:"+11% edge. Wirtz + Musiala vs Adams + Pulisic — quality gap favours Germany." },

  { id:"R16_3", stage:"R16", date:"~Jul 3", group:"R16 Proj.", venue:"Hard Rock Stadium",
    home:"Spain", homeFlag:"🇪🇸", homeCode:"ESP", homePlayers:["ESP"],
    away:"Morocco", awayFlag:"🇲🇦", awayCode:"MAR", awayPlayers:["MAR"],
    homeML:-200, awayML:420,
    ah:{ line:-0.75, homeLabel:"ESP -0.75", awayLabel:"MAR +0.75", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:63, simCoverAH:52, marketCoverAH:50, edge:2,
    notes:"PROJECTED R16. Spain vs Morocco — exact 2022 QF rematch (Morocco won on penalties). Tight.",
    rec:"neutral", recLabel:"— Skip (too close)", recDetail:"Morocco beat Spain in 2022. Psychological edge for Morocco. Sim shows only +2% — not worth it." },

  { id:"R16_4", stage:"R16", date:"~Jul 3", group:"R16 Proj.", venue:"AT&T Stadium",
    home:"Argentina", homeFlag:"🇦🇷", homeCode:"ARG", homePlayers:["ARG"],
    away:"Colombia", awayFlag:"🇨🇴", awayCode:"COL", awayPlayers:["COL"],
    homeML:-220, awayML:420,
    ah:{ line:-0.75, homeLabel:"ARG -0.75", awayLabel:"COL +0.75", homePayout:1.90, awayPayout:1.90 },
    simHomeWin:66, simCoverAH:55, marketCoverAH:50, edge:5,
    notes:"PROJECTED R16. Argentina vs Colombia Copa América 2024 final rematch. ARG won 1-0.",
    rec:"slight", recLabel:"ARG -0.75 slight edge (R16)", recDetail:"+5% at 1.90. L.Díaz dangerous but Emiliano Martínez neutralises. Small stake." },

  { id:"QF_1", stage:"QF", date:"~Jul 8", group:"QF Proj.", venue:"MetLife Stadium",
    home:"France", homeFlag:"🇫🇷", homeCode:"FRA", homePlayers:["FRA"],
    away:"Germany", awayFlag:"🇩🇪", awayCode:"GER", homePlayers:["GER"],
    homeML:-160, awayML:320,
    ah:{ line:-0.5, homeLabel:"FRA -0.5", awayLabel:"GER +0.5", homePayout:1.90, awayPayout:1.90 },
    simHomeWin:62, simCoverAH:62, marketCoverAH:50, edge:12,
    notes:"PROJECTED QF. France vs Germany — classic European clash. Mbappé vs Rüdiger. France 62% win.",
    rec:"value", recLabel:"✅ FRA -0.5 VALUE (QF)", recDetail:"+12% edge. France ATK 94 DEF 92 — all-round superiority. Solid QF play." },

  { id:"QF_2", stage:"QF", date:"~Jul 9", group:"QF Proj.", venue:"Rose Bowl",
    home:"Argentina", homeFlag:"🇦🇷", homeCode:"ARG", homePlayers:["ARG"],
    away:"Brazil", awayFlag:"🇧🇷", awayCode:"BRA", awayPlayers:["BRA"],
    homeML:-140, awayML:290,
    ah:{ line:0, homeLabel:"ARG 0 (DNB)", awayLabel:"BRA 0 (DNB)", homePayout:1.90, awayPayout:1.90 },
    simHomeWin:55, simCoverAH:55, marketCoverAH:50, edge:5,
    notes:"PROJECTED QF. Argentina vs Brazil — the Superclásico on WC stage. Emiliano Martínez makes the difference. Tightest QF.",
    rec:"slight", recLabel:"ARG DNB slight edge (QF)", recDetail:"+5% edge. Draw refunded. Messi vs Vinícius is the headline battle — take Argentina." },

  { id:"SF_1", stage:"SF", date:"~Jul 14", group:"SF Proj.", venue:"MetLife Stadium",
    home:"France", homeFlag:"🇫🇷", homeCode:"FRA", homePlayers:["FRA"],
    away:"Spain", awayFlag:"🇪🇸", awayCode:"ESP", awayPlayers:["ESP"],
    homeML:-120, awayML:240,
    ah:{ line:0, homeLabel:"FRA 0 (DNB)", awayLabel:"ESP 0 (DNB)", homePayout:1.90, awayPayout:1.90 },
    simHomeWin:57, simCoverAH:57, marketCoverAH:50, edge:7,
    notes:"PROJECTED SF1. France vs Spain — the marquee European clash. Mbappé vs Rodri. France 57% win.",
    rec:"slight", recLabel:"FRA DNB edge (SF)", recDetail:"+7% but SF games highly volatile. Only if sim and market align. Cautious approach." },

  { id:"SF_2", stage:"SF", date:"~Jul 15", group:"SF Proj.", venue:"Rose Bowl",
    home:"Argentina", homeFlag:"🇦🇷", homeCode:"ARG", homePlayers:["ARG"],
    away:"England", awayFlag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", awayCode:"ENG", awayPlayers:["ENG"],
    homeML:-160, awayML:320,
    ah:{ line:-0.5, homeLabel:"ARG -0.5", awayLabel:"ENG +0.5", homePayout:1.88, awayPayout:1.92 },
    simHomeWin:63, simCoverAH:63, marketCoverAH:50, edge:13,
    notes:"PROJECTED SF2. Argentina vs England. Messi vs Bellingham. ARG 63% win — Emiliano Martínez GK 92 decisive.",
    rec:"value", recLabel:"✅ ARG -0.5 VALUE (SF)", recDetail:"+13% edge. Argentina's KO experience (EXP 96) is unmatched at this stage." },

  { id:"F1", stage:"F", date:"Jul 19", group:"Final", venue:"MetLife Stadium NJ",
    home:"France", homeFlag:"🇫🇷", homeCode:"FRA", homePlayers:["FRA"],
    away:"Argentina", awayFlag:"🇦🇷", awayCode:"ARG", awayPlayers:["ARG"],
    homeML:-130, awayML:260,
    ah:{ line:0, homeLabel:"FRA 0 (DNB)", awayLabel:"ARG 0 (DNB)", homePayout:1.90, awayPayout:1.90 },
    simHomeWin:54, simCoverAH:54, marketCoverAH:50, edge:4,
    notes:"PROJECTED FINAL. France vs Argentina — 2022 Final rematch. France 54% win. Mbappé vs Emiliano Martínez is the decisive duel.",
    rec:"slight", recLabel:"FRA DNB (Final — slim)", recDetail:"+4% edge only. Finals are coin-flip territory. Enjoy the match — small stake if anything." },
];

const REC_CONFIG = {
  strong:  { color:"#22c55e", bg:"rgba(34,197,94,.12)", border:"rgba(34,197,94,.3)" },
  value:   { color:"#4ade80", bg:"rgba(74,222,128,.08)", border:"rgba(74,222,128,.25)" },
  slight:  { color:"#facc15", bg:"rgba(250,204,21,.06)", border:"rgba(250,204,21,.2)" },
  neutral: { color:"#6b7f99", bg:"rgba(107,127,153,.05)", border:"rgba(107,127,153,.15)" },
  avoid:   { color:"#f97316", bg:"rgba(249,115,22,.08)", border:"rgba(249,115,22,.25)" },
};

function waterLabel(p) {
  if (p >= 1.93) return { txt: p + " 水位 ▲", col:"#22c55e" };
  if (p >= 1.88) return { txt: p + " 水位 ●", col:"#facc15" };
  return { txt: p + " 水位 ▼", col:"#f97316" };
}

const STAGE_ORDER = { GRP:0, R32:1, R16:2, QF:3, SF:4, F:5 };
