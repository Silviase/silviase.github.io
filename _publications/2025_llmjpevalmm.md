---
layout: publications
title: "llm-jp-eval-mm"
venue: "NLP 2025"
description: "Methodology for quickly constructing multimodal datasets tailored for Japanese vision-language models."
pdf_link: "https://www.anlp.jp/proceedings/annual_meeting/2025/pdf_dir/Q3-23.pdf"
code_link: "https://github.com/llm-jp/llm-jp-eval-mm"
type: "domestic"
bibtex: |
  @inproceedings{maeda2025llm-jp-eval-mm,
    author = {前田 航希 and 杉浦 一瑳 and 小田 悠介 and 栗田 修平 and 岡崎 直観},
    month = mar,
    series = {言語処理学会第31回年次大会 (NLP2025)},
    title = {{llm-jp-eval-mm: 日本語視覚言語モデルの自動評価基盤}},
    year = {2025}
  }
---

## Abstract

The research rapidly advances vision-language models (VLM), but evaluation frameworks for Japanese vision-language (V&L) tasks are still inadequate. This paper introduces llm-jp-eval-mm, a toolkit for systematically evaluating Japanese multimodal tasks. It unifies six existing Japanese multimodal tasks, enabling consistent benchmarking across multiple metrics. The toolkit is publicly available, aiming to facilitate continuous improvement and evaluation of Japanese VLMs.

## Methodology

llm-jp-eval-mm standardizes input/output formats across diverse datasets, separating inference from evaluation. It uses a modular class structure (Task and Scorer) allowing easy extension and incorporation of new tasks and models. Evaluation setups are simplified, removing YAML-based configurations, thus enhancing maintainability and usability.

## Experimental Results

Evaluations were performed on 13 publicly available Japanese and multilingual VLMs. Among Japanese-specialized models, llm-jp-3 VILA exhibited top performance across most tasks. For multilingual models, Qwen2-VL showed superior results, particularly in multi-image tasks, indicating advantages of advanced training strategies.

## Key Contributions

- A unified evaluation toolkit (llm-jp-eval-mm) for Japanese multimodal tasks.
- Simplified integration of new models/tasks via modular implementation.
- Comprehensive benchmarking of existing VLMs, highlighting performance gaps and advancements.

## Conclusion and Future Work

llm-jp-eval-mm is the pioneering framework for systematic Japanese VLM evaluation, revealing both the advancement and remaining gaps compared to large-scale commercial models like GPT-4o. Future work includes expanding dataset diversity (e.g., specialized domains, image generation) and extending evaluations to other modalities such as 3D vision, audio, video, and Vision-Language-Action (VLA).
