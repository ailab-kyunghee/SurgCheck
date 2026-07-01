# SurgCheck — Project Page

Interactive project page for **"SurgCheck: Do Vision–Language Models Really Look at Images in Surgical VQA?"** (IPCAI 2026).

🔗 **Live page:** https://ailab-kyunghee.github.io/SurgCheck/

## What's here
- `index.html` — single-page site (academic layout + interactive components)
- `static/css/style.css` — styles
- `static/js/data.js` — all data (paired-question examples, radar/table/ablation numbers) inlined so the page works even when opened locally
- `static/js/main.js` — interactions: reveal-on-scroll, count-up stats, paired-question explorer, cue tabs, sortable tables, Chart.js radars & ablation bar, BibTeX copy
- `static/images/figures/` — high-resolution figures/tables extracted from the paper
- `static/images/frames/` — real Endoscapes surgical frames used by the interactive explorer

## Interactive components
1. **Paired-Question Explorer** — pick a real frame, grounding cue, and task; see how only the *wording* changes while image + answer stay fixed.
2. **Grounding cue tabs** — the four cue types (box, arrow, spatial position, periphrasis).
3. **Sortable result tables** — Table 1 (zero-shot) & Table 2 (fine-tuned), with Δ highlighting.
4. **Interactive charts** — per-category & per-cue F1 radars (per model, original vs less-biased) and the text-only ablation bar chart. Numbers are extracted directly from model predictions and match the paper's figures.

## Local preview
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (GitHub Pages)
Push this folder to the repo, then in **Settings → Pages** set the source to the branch and root (`/`). `.nojekyll` disables Jekyll processing.
