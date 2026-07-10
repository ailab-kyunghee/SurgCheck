# SurgCheck Dataset

Annotations for the SurgCheck benchmark. **The surgical frames themselves are not redistributed here** — download them from Endoscapes-SG201 (see below).

## Contents

```
data/
├── full/                             # complete dataset (train + test)
│   ├── train_original.jsonl          # 19,604 rows
│   ├── train_less_biased.jsonl       # 19,604 rows
│   ├── test_original.jsonl           #  3,860 rows
│   └── test_less_biased.jsonl        #  3,860 rows
└── balanced_4cue_test/               # cross-cue-aligned test subset (Sec. 3.5)
    ├── box_{original,less_biased}.jsonl         # 1,898 rows each
    ├── arrow_{original,less_biased}.jsonl       # 1,898 rows each
    ├── position_{original,less_biased}.jsonl    # 1,898 rows each
    └── periphrasis_{original,less_biased}.jsonl # 1,898 rows each
```

For each pair, line *i* of `*_original.jsonl` and `*_less_biased.jsonl` shares the same image, task, cue, and ground-truth answer — only the question wording differs.

In `balanced_4cue_test/`, the four cue files are additionally **cross-cue aligned**: line *i* of `box_*.jsonl`, `arrow_*.jsonl`, `position_*.jsonl`, `periphrasis_*.jsonl` refers to the same (frame, task-category, slot).

## Getting the images

Base surgical frames come from **Endoscapes-SG201** (Murali et al., 2023), derived from Cholec80:

- Endoscapes repository: <https://github.com/CAMMA-public/Endoscapes>
- Endoscapes paper: <https://arxiv.org/abs/2312.12429>

Each annotation row references `image` and `ori_img_tag`:
- `ori_img_tag` is the original frame filename (e.g., `164_2700.jpg`) — obtain it from Endoscapes.
- `image` may be the same base frame **or** a cue-augmented variant with a red bounding box or arrow drawn on it (e.g., `164_2700_bbox_lt.jpg`, `164_2700_arrow_cystic_duct.jpg`). Cue-augmented variants are rendered from the Endoscapes scene-graph annotations (object bounding boxes) — regenerate them by drawing the red box / arrow on the base frame at the annotated location.

## JSONL schema

```json
{
  "image": "164_2700_arrow_lt.jpg",
  "conversations": [
    {"from": "human", "value": "<image>\nYou are an assistant with surgical expertise. Given a surgical scene, answer the question in 1-5 words. Which tool, operated by the operator's left hand, is indicated by the red arrow?"},
    {"from": "gpt", "value": "grasper"}
  ],
  "ori_img_tag": "164_2700.jpg",
  "main_tag": "Visual_QA",
  "sub_sub_tag": "Instrument",
  "sub_tag": "Arrow_Cue"
}
```

- `main_tag` — `Visual_QA` or `Reasoning_QA`
- `sub_sub_tag` — task category: `Instrument_Count`, `anatomy`, `Instrument`, `Action`, `Target`, `Triplet`, `anatomy_hop`, `CVS`
- `sub_tag` — grounding cue: `No_Cue`, `Box_Cue`, `Arrow_Cue`, `Position_Cue`, `Word_Cue`

## License

SurgCheck's paired questions, less-biased phrasings, and cue-augmented image specifications are released for **non-commercial research** use. Respect the upstream Endoscapes-SG201 / Cholec80 licenses for the frames themselves.

## Citation

```bibtex
@inproceedings{shin2026surgcheck,
  title     = {SurgCheck: Do Vision--Language Models Really Look at Images in Surgical VQA?},
  author    = {Shin, Jongmin and Kim, Ka Young and Cho, Eunki and Kim, Seong Tae and Oh, Namkee},
  booktitle = {International Conference on Information Processing in Computer-Assisted Interventions (IPCAI)},
  year      = {2026}
}
```
