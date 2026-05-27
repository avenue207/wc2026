// ═══════════════════════════════════════════════
//  TEAM DATA — Player quality, form, records
// ═══════════════════════════════════════════════
const TEAMS = {
  FRA: { name:"France",      flag:"🇫🇷",
    stats:{atk:94,mid:90,def:92,gk:88,form:85,depth:92,exp:95},
    players:["Kylian Mbappé","Tchouaméni","William Saliba","Mike Maignan"],
    record:"8W-1D-1L", history:"WC 2018 Champion · Final 2022",
    edge:"Mbappé (ATK 94) + elite defensive block; Maignan world-class GK" },
  ESP: { name:"Spain",       flag:"🇪🇸",
    stats:{atk:88,mid:95,def:87,gk:83,form:90,depth:91,exp:88},
    players:["Pedri","Rodri","Lamine Yamal","Álvaro Morata"],
    record:"9W-1D-0L", history:"WC 2010 · Euro 2024 Champions",
    edge:"Highest midfield (95) — Rodri + Pedri suffocate any opponent" },
  ARG: { name:"Argentina",   flag:"🇦🇷",
    stats:{atk:93,mid:87,def:85,gk:92,form:82,depth:86,exp:96},
    players:["Lionel Messi","Emiliano Martínez","Mac Allister","C. Romero"],
    record:"7W-2D-1L", history:"WC 2022 Champion · Final 2014",
    edge:"Emiliano Martínez (GK 92) — best WC GK ever; Messi's last WC" },
  ENG: { name:"England",     flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    stats:{atk:89,mid:88,def:84,gk:86,form:78,depth:88,exp:78},
    players:["Jude Bellingham","Harry Kane","Bukayo Saka","Declan Rice"],
    record:"6W-2D-2L", history:"SF 2018 · Euro Final 2024",
    edge:"Bellingham + Kane: world's most dangerous 1-2 combination" },
  BRA: { name:"Brazil",      flag:"🇧🇷",
    stats:{atk:93,mid:86,def:85,gk:87,form:75,depth:91,exp:89},
    players:["Vinícius Jr.","Rodrygo","Alisson Becker","Marquinhos"],
    record:"6W-2D-2L", history:"QF 2022 · WC 2002 (last title)",
    edge:"Vinícius is world's most dangerous attacker 2025; historic depth" },
  POR: { name:"Portugal",    flag:"🇵🇹",
    stats:{atk:87,mid:86,def:83,gk:83,form:80,depth:84,exp:85},
    players:["Bruno Fernandes","Rafael Leão","Rúben Dias","João Neves"],
    record:"7W-1D-2L", history:"QF 2022 · SF 2006",
    edge:"Post-Ronaldo resurgence: Leão + young João Neves in midfield" },
  GER: { name:"Germany",     flag:"🇩🇪",
    stats:{atk:88,mid:85,def:84,gk:86,form:77,depth:87,exp:90},
    players:["Florian Wirtz","Jamal Musiala","Antonio Rüdiger","ter Stegen"],
    record:"6W-2D-2L", history:"WC 2014 · Euro 2024 QF host",
    edge:"Wirtz + Musiala = most exciting young midfield in world football" },
  MAR: { name:"Morocco",     flag:"🇲🇦",
    stats:{atk:80,mid:82,def:89,gk:87,form:82,depth:80,exp:78},
    players:["Achraf Hakimi","Yassine Bounou","Sofyan Amrabat","En-Nesyri"],
    record:"7W-1D-2L", history:"SF 2022 (historic run) · AFCON finalist",
    edge:"Elite defensive block (89) + Bounou's WC saves; giant-killers" },
  USA: { name:"USA",         flag:"🇺🇸",
    stats:{atk:76,mid:79,def:76,gk:78,form:74,depth:80,exp:68},
    players:["Christian Pulisic","Gio Reyna","Matt Turner","Tyler Adams"],
    record:"5W-2D-3L", history:"Co-host · R16 2022",
    edge:"Home advantage in front of massive crowds; Pulisic leading charge" },
  NED: { name:"Netherlands", flag:"🇳🇱",
    stats:{atk:85,mid:84,def:83,gk:84,form:76,depth:84,exp:82},
    players:["Virgil van Dijk","Cody Gakpo","Frenkie de Jong","Dumfries"],
    record:"6W-1D-3L", history:"SF 2014 · Final 2010",
    edge:"Van Dijk + de Jong world-class spine; Gakpo clinical in 2024-25" },
  COL: { name:"Colombia",    flag:"🇨🇴",
    stats:{atk:84,mid:83,def:80,gk:80,form:79,depth:82,exp:72},
    players:["Luis Díaz","James Rodríguez","Daniel Muñoz","D. Sánchez"],
    record:"7W-1D-2L", history:"Copa América 2024 runner-up",
    edge:"Luis Díaz in peak form; Copa América mentality proven" },
  URU: { name:"Uruguay",     flag:"🇺🇾",
    stats:{atk:82,mid:80,def:84,gk:82,form:75,depth:78,exp:84},
    players:["Federico Valverde","Darwin Núñez","Araújo","Olivera"],
    record:"5W-3D-2L", history:"SF 2010",
    edge:"Valverde (world's best box-to-box) + Núñez power; gritty DNA" },
  JPN: { name:"Japan",       flag:"🇯🇵",
    stats:{atk:80,mid:83,def:80,gk:80,form:80,depth:80,exp:72},
    players:["Kaoru Mitoma","Doan","Ko Itakura","Wataru Endō"],
    record:"7W-1D-2L", history:"R16 2022 · Beat Germany & Spain in groups",
    edge:"Disciplined pressing system; proven giant-killers when it clicks" },
  BEL: { name:"Belgium",     flag:"🇧🇪",
    stats:{atk:82,mid:82,def:80,gk:81,form:72,depth:80,exp:82},
    players:["Kevin De Bruyne","Romelu Lukaku","Thibaut Courtois","Tielemans"],
    record:"5W-2D-3L", history:"SF 2018 (golden gen swan song)",
    edge:"De Bruyne's vision at 34; Courtois single-handedly wins games" },
  CRO: { name:"Croatia",     flag:"🇭🇷",
    stats:{atk:79,mid:86,def:81,gk:80,form:72,depth:76,exp:88},
    players:["Luka Modrić","Mateo Kovačić","Joško Gvardiol","Kramarić"],
    record:"5W-2D-3L", history:"WC Final 2018 · SF 2022",
    edge:"Modrić's final WC — tournament-hardened experience (88); Gvardiol" },
  SEN: { name:"Senegal",     flag:"🇸🇳",
    stats:{atk:80,mid:78,def:80,gk:83,form:75,depth:76,exp:72},
    players:["Sadio Mané","Édouard Mendy","Idrissa Gueye","Jakobs"],
    record:"6W-1D-3L", history:"AFCON 2022 Champions · R16 2022",
    edge:"Mendy's world-class shot-stopping; AFCON winning mentality" },
};

// ─── R16 BRACKET ───
// Left half → Semi-Final 1 | Right half → Semi-Final 2
const R16 = [
  { id:0, half:"L", t1:"FRA", t2:"SEN",  label:"R16 — A" },
  { id:1, half:"L", t1:"GER", t2:"USA",  label:"R16 — B" },
  { id:2, half:"L", t1:"ESP", t2:"JPN",  label:"R16 — C" },
  { id:3, half:"L", t1:"MAR", t2:"NED",  label:"R16 — D" },
  { id:4, half:"R", t1:"ARG", t2:"COL",  label:"R16 — E" },
  { id:5, half:"R", t1:"BRA", t2:"URU",  label:"R16 — F" },
  { id:6, half:"R", t1:"ENG", t2:"CRO",  label:"R16 — G" },
  { id:7, half:"R", t1:"POR", t2:"BEL",  label:"R16 — H" },
];

// ─── STAT METADATA ───
const STAT_META = {
  atk:  { label:"ATK",  color:"#f97316" },
  mid:  { label:"MID",  color:"#a78bfa" },
  def:  { label:"DEF",  color:"#22d3ee" },
  gk:   { label:"GK",   color:"#facc15" },
  form: { label:"FORM", color:"#4ade80" },
  depth:{ label:"DPTH", color:"#60a5fa" },
  exp:  { label:"EXP",  color:"#f472b6" },
};

// ─── OVERALL RATING ───
function overallRating(id) {
  const s = TEAMS[id].stats;
  return Math.round(
    s.atk   * 0.22 +
    s.mid   * 0.20 +
    s.def   * 0.20 +
    s.gk    * 0.10 +
    s.form  * 0.15 +
    s.exp   * 0.08 +
    s.depth * 0.05
  );
}
