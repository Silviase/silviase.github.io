---
title: 'JaWildText: A Benchmark for Vision-Language Models on Japanese Scene Text Understanding'
authors:
  - Koki Maeda
  - Naoaki Okazaki
venue: arXiv preprint
description: A diagnostic benchmark for evaluating Japanese scene text understanding in vision-language models across STVQA, receipt KIE, and handwriting OCR.
date: 2026-03-30
type: international
pdf: https://arxiv.org/pdf/2603.27942
bibtex: |
  @misc{maeda2026jawildtext,
    title={JaWildText: A Benchmark for Vision-Language Models on Japanese Scene Text Understanding},
    author={Koki Maeda and Naoaki Okazaki},
    year={2026},
    eprint={2603.27942},
    archivePrefix={arXiv},
    primaryClass={cs.CV},
    url={https://arxiv.org/abs/2603.27942}
  }
---

## Abstract

JaWildText is a diagnostic benchmark for Japanese scene text understanding in vision-language models. It focuses on difficulties that multilingual benchmarks often miss, including mixed writing systems, frequent vertical text, and a much larger character inventory than Latin-script settings.

The benchmark contains 3,241 instances from 2,961 images collected in Japan, with 1.12 million annotated characters spanning 3,643 unique character types. It covers three complementary tasks: dense scene text visual question answering, receipt key information extraction, and handwriting OCR.

## Evaluation Highlights

The paper evaluates 14 open-weight vision-language models and reports that the strongest model reaches an average score of 0.64 across the three tasks. The analysis shows that text recognition remains the primary bottleneck, with kanji posing a particularly persistent challenge.

## Resources

JaWildText is positioned as a benchmark for fine-grained, script-aware diagnosis of Japanese scene text capabilities, and the authors note that the dataset will be released together with evaluation code.
