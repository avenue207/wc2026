#!/usr/bin/env python3
"""Daily AH odds updater for WC2026 predictor.
Fetches Asian Handicap (spreads) lines from The Odds API (free tier: 500 req/mo,
get a key at https://the-odds-api.com) and rewrites odds.js, then recomputes
simCoverAH / marketCoverAH / edge / rec via the same Monte Carlo model the site uses.
If ODDS_API_KEY is unset, exits cleanly without changes."""
import os, re, sys, json, math, random, urllib.request

API_KEY = os.environ.get("ODDS_API_KEY", "").strip()
if not API_KEY:
    print("No ODDS_API_KEY secret set — skipping odds refresh (no-op).")
    sys.exit(0)

SPORT = "soccer_fifa_world_cup"   # The Odds API sport key for WC
URL = (f"https://api.the-odds-api.com/v4/sports/{SPORT}/odds/"
       f"?apiKey={API_KEY}&regions=us,eu&markets=spreads&oddsFormat=decimal")

try:
    with urllib.request.urlopen(URL, timeout=30) as r:
        events = json.load(r)
except Exception as e:
    print("API fetch failed:", e); sys.exit(0)

# name normalisation: API team name -> our 3-letter code
NAME2CODE = {
 "Mexico":"MEX","South Africa":"RSA","South Korea":"KOR","Korea Republic":"KOR",
 "Czech Republic":"CZE","Czechia":"CZE","United States":"USA","USA":"USA","Paraguay":"PAR",
 "Brazil":"BRA","Morocco":"MAR","Germany":"GER","Curacao":"CUR","Curaçao":"CUR",
 "Netherlands":"NED","Japan":"JPN","Spain":"ESP","Cape Verde":"CPV","France":"FRA",
 "Senegal":"SEN","Argentina":"ARG","Algeria":"ALG","England":"ENG","Croatia":"CRO",
 "Portugal":"POR","Saudi Arabia":"KSA","Uruguay":"URU","Colombia":"COL","Belgium":"BEL",
 "Scotland":"SCO","Ecuador":"ECU","Sweden":"SWE","Iraq":"IRQ","Austria":"AUT","Ghana":"GHA",
 "Egypt":"EGY","DR Congo":"CGO","Congo DR":"CGO","Norway":"NOR",
}

# --- pull latest median home spread per matchup ---
latest = {}   # (homeCode, awayCode) -> (line, homePayout, awayPayout)
for ev in events:
    h = NAME2CODE.get(ev.get("home_team","")); a = NAME2CODE.get(ev.get("away_team",""))
    if not h or not a: continue
    lines=[]
    for bk in ev.get("bookmakers",[]):
        for mk in bk.get("markets",[]):
            if mk["key"]!="spreads": continue
            pts={o["name"]:(o.get("point"),o.get("price")) for o in mk["outcomes"]}
            hp = pts.get(ev["home_team"]); ap = pts.get(ev["away_team"])
            if hp and hp[0] is not None:
                lines.append((float(hp[0]), float(hp[1] or 1.9), float((ap or (None,1.9))[1] or 1.9)))
    if lines:
        lines.sort(key=lambda x:x[0])
        latest[(h,a)] = lines[len(lines)//2]   # median line

print(f"Fetched lines for {len(latest)} matchups")
if not latest: sys.exit(0)

# --- Monte Carlo (same model as site) ---
data=open("data.js").read()
teams={}
for m in re.finditer(r'(\b[A-Z]{3}):\s*\{\s*name:"[^"]+"[^}]*?stats:\{([^}]+)\}',data,re.DOTALL):
    teams[m.group(1)]={kv.group(1):int(kv.group(2)) for kv in re.finditer(r'(\w+):(\d+)',m.group(2))}
MINNOW={"RSA":(60,58),"CZE":(70,69),"PAR":(66,68),"MAR":(80,84),"CUR":(45,42),"JPN":(78,76),
"CPV":(54,52),"SEN":(82,80),"ALG":(72,70),"SCO":(64,66),"ECU":(70,70),"SWE":(72,71),
"IRQ":(55,56),"AUT":(73,72),"GHA":(68,66),"EGY":(70,69),"CGO":(62,60),"KSA":(62,63),"NOR":(76,72)}
def gstats(c): return (teams[c]['atk'],teams[c]['def']) if c in teams else MINNOW.get(c,(60,60))
def xg(h,a):
    ah,dh=gstats(h);aa,da=gstats(a);b,avg=1.35,80
    return (max(.2,min(5.5,b*(ah/avg)*(avg/max(40,da))*1.10)),max(.1,min(4,b*(aa/avg)*(avg/max(40,dh)))))
def pois(l):
    L=math.exp(-l);k=0;p=1.0
    while True:
        k+=1;p*=random.random()
        if p<=L:return k-1
def cover(h,a,line,n=200000):
    xh,xa=xg(h,a)
    parts=[line-.25,line+.25] if abs((line*2)%1)>1e-9 else [line]
    w=0.0
    for _ in range(n):
        m=pois(xh)-pois(xa);s=0.0
        for p in parts:
            adj=m+p
            if abs(p-round(p))<1e-9: s+=1 if adj>.001 else (.5 if abs(adj)<.001 else 0)
            else: s+=1 if adj>0 else 0
        w+=s/len(parts)
    return round(w/n*100)
def rec(cov,hc,ac,hl,al):
    aw=100-cov
    if cov>=58:return("strong",f"🔥 Back {hl}",f"Sim cover {cov}% — strong value laying {hc}.")
    if cov>=52:return("value",f"✓ Back {hl}",f"Sim cover {cov}% — slight edge on {hc}.")
    if cov>=48:
        return ("slight",f"Lean {hl}",f"Sim cover {cov}% — marginal.") if cov>=50 else ("slight",f"Lean {al}",f"{ac} +line covers {aw}% — marginal.")
    if cov>=42:return("value",f"✓ Back {al}",f"Underdog covers {aw}% — value on {ac}.")
    return("strong",f"🔥 Back {al}",f"Underdog covers {aw}% — strong value on {ac}.")
def labels(hc,ac,line):
    if line==0:return f"{hc} 0",f"{ac} 0"
    ls=str(line) if line!=int(line) else str(int(line))
    return (f"{hc} {ls}",f"{ac} +{abs(line)}") if line<0 else (f"{hc} +{ls}",f"{ac} -{line}")

random.seed()
text=open("odds.js").read()
changed=0
for m in re.finditer(r'id:"([A-Z]\d+)"',text):
    mid=m.group(1)
    bs=text.find(f'id:"{mid}"');nx=text.find('{ id:"',bs+5);be=nx if nx>0 else len(text)
    block=text[bs:be]
    hcm=re.search(r'homeCode:"(\w+)"',block);acm=re.search(r'awayCode:"(\w+)"',block)
    if not hcm or not acm:continue
    hc,ac=hcm.group(1),acm.group(1)
    if (hc,ac) not in latest:continue
    line,hp,ap=latest[(hc,ac)]
    old=re.search(r'line:(-?[\d.]+)',block)
    if old and abs(float(old.group(1))-line)<0.01:continue   # unchanged
    hl,al=labels(hc,ac,line)
    ls=str(line) if line!=int(line) else str(int(line))
    block=re.sub(r'ah:\{[^}]*\}',f'ah:{{ line:{ls}, homeLabel:"{hl}", awayLabel:"{al}", homePayout:{hp}, awayPayout:{ap} }}',block,1)
    cov=cover(hc,ac,line);mkt=round((1/hp)/((1/hp)+(1/ap))*100);edge=cov-mkt
    sw=re.search(r'simHomeWin:(\d+)',block).group(1)
    block=re.sub(r'simHomeWin:\d+, simCoverAH:\d+, marketCoverAH:\d+, edge:-?\d+',
                 f'simHomeWin:{sw}, simCoverAH:{cov}, marketCoverAH:{mkt}, edge:{edge}',block,1)
    r,lab,det=rec(cov,hc,ac,hl,al)
    block=re.sub(r'rec:"[^"]*"',f'rec:"{r}"',block,1)
    block=re.sub(r'recLabel:"[^"]*"',f'recLabel:"{lab}"',block,1)
    block=re.sub(r'recDetail:"[^"]*"',f'recDetail:"{det}"',block,1)
    text=text[:bs]+block+text[be:]
    changed+=1
    print(f"  updated {mid}: {hc} {ls} vs {ac} cover={cov}%")

if changed:
    open("odds.js","w").write(text)
    print(f"{changed} matches updated.")
else:
    print("No line changes today.")

# ═══════════════════════════════════════════════════════════
#  PART 2 — FETCH FINAL SCORES → results.js (accuracy tab)
#  Uses The Odds API scores endpoint (included in free key).
#  daysFrom=3 returns games completed in the last 3 days.
# ═══════════════════════════════════════════════════════════
SCORES_URL = (f"https://api.the-odds-api.com/v4/sports/{SPORT}/scores/"
              f"?apiKey={API_KEY}&daysFrom=3")
try:
    with urllib.request.urlopen(SCORES_URL, timeout=30) as r:
        games = json.load(r)
except Exception as e:
    print("Scores fetch failed:", e); games = []

completed = {}
for g in games:
    if not g.get("completed"): continue
    h = NAME2CODE.get(g.get("home_team","")); a = NAME2CODE.get(g.get("away_team",""))
    if not h or not a or not g.get("scores"): continue
    sc = {s["name"]: int(s["score"]) for s in g["scores"]}
    hs = sc.get(g["home_team"]); as_ = sc.get(g["away_team"])
    if hs is None or as_ is None: continue
    completed[(h,a)] = (hs, as_)

print(f"Completed games found: {len(completed)}")

if completed:
    # map (homeCode, awayCode) -> match id from odds.js
    odds_txt = open("odds.js").read()
    id_of = {}
    for m in re.finditer(r'id:"([A-Z]+\d*)".*?homeCode:"(\w+)".*?awayCode:"(\w+)"', odds_txt, re.DOTALL):
        # restrict to within one block: re-find per id to avoid greedy cross-block capture
        pass
    for m in re.finditer(r'id:"([A-Z]+\d*)"', odds_txt):
        mid = m.group(1)
        bs = odds_txt.find(f'id:"{mid}"'); nx = odds_txt.find('{ id:"', bs+5)
        block = odds_txt[bs: nx if nx>0 else len(odds_txt)]
        hm = re.search(r'homeCode:"(\w+)"', block); am = re.search(r'awayCode:"(\w+)"', block)
        if hm and am: id_of[(hm.group(1), am.group(1))] = mid

    res_txt = open("results.js").read()
    added = 0
    for (h,a),(hs,as_) in completed.items():
        mid = id_of.get((h,a))
        if not mid: continue
        if f'"{mid}"' in res_txt: continue   # already recorded
        entry = f'  "{mid}": {{ home: {hs}, away: {as_} }},\n'
        res_txt = res_txt.replace("const RESULTS = {\n", "const RESULTS = {\n" + entry, 1)
        added += 1
        print(f"  recorded {mid}: {h} {hs}-{as_} {a}")
    if added:
        open("results.js","w").write(res_txt)
        print(f"{added} results written to results.js")
    else:
        print("No new results to record.")
