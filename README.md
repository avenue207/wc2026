# ⚽ FIFA World Cup 2026 — Semi-Final Predictor

A **Monte Carlo simulation engine** that runs 100,000 tournament simulations to predict the 2026 FIFA World Cup semi-finalists, finalists, and champion.

🔗 **Live site:** `https://<your-username>.github.io/wc2026`

---

## How It Works

### Simulation Engine
Every match probability is calculated from a **weighted composite** of 7 team metrics:

| Stat | Weight | What it measures |
|------|--------|-----------------|
| Attack | 22% | Star player ceiling + second-line quality |
| Midfield | 20% | Possession control + press resistance |
| Defense | 20% | Defensive record + structural solidity |
| GK | 10% | Goalkeeper quality (knockout-game impact) |
| Form | 15% | Win% across last 10 internationals |
| Experience | 8% | WC knockout stage history |
| Depth | 5% | Squad quality beyond starting XI |

A **sigmoid probability function** converts the strength differential into a base win probability. Then **±14% uniform noise** is added per match — modelling football's inherent unpredictability.

### Bracket
Based on realistic 2026 WC draw group seedings. 16 teams, R16 → QF → SF → Final.

---

## Teams

16 teams covering Europe, Americas, Africa, and Asia-Pacific:

🇫🇷 France · 🇪🇸 Spain · 🇦🇷 Argentina · 🏴󠁧󠁢󠁥󠁮󠁧󠁿 England · 🇧🇷 Brazil · 🇵🇹 Portugal · 🇩🇪 Germany · 🇲🇦 Morocco · 🇯🇵 Japan · 🇳🇱 Netherlands · 🇨🇴 Colombia · 🇺🇾 Uruguay · 🇧🇪 Belgium · 🇭🇷 Croatia · 🇸🇳 Senegal · 🇺🇸 USA

---

## Key Predictions

| Predicted Result | Team | Probability |
|-----------------|------|-------------|
| 🏆 World Cup Champion | France | ~32.6% |
| 🥈 Runner-up | Argentina | ~27.7% |
| Semi-Final 1 | France vs Spain | Most likely matchup |
| Semi-Final 2 | Argentina vs England | Most likely matchup |

> *Results vary slightly on each run due to Monte Carlo randomness*

---

## Tech Stack

- Pure **HTML / CSS / JavaScript** — zero dependencies
- Fonts: [Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) + [Barlow Condensed](https://fonts.google.com/specimen/Barlow+Condensed) via Google Fonts
- Hosted via **GitHub Pages**

---

## Local Development

```bash
git clone https://github.com/<your-username>/wc2026.git
cd wc2026
# open index.html in your browser — no build step needed
```

---

## Deploying Updates

```bash
git add .
git commit -m "update"
git push origin main
```

GitHub Pages auto-deploys from the `main` branch.

---

*Player ratings reflect 2024–25 club season performance. Simulation is for entertainment purposes.*
