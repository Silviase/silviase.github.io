---
title: Constructing Multimodal Datasets from Scratch for Rapid Development of a Japanese
  Visual Language Model
authors:
  - Keito Sasagawa
  - Koki Maeda
  - Issa Sugiura
  - Shuhei Kurita
  - Naoaki Okazaki
  - Daisuke Kawahara
venue: 'Proceedings of the 2025 Conference of the North American Chapter of the Association
  for Computational Linguistics: Human Language Technologies (Volume 3: System Demonstrations)'
description: Methodology for quickly constructing multimodal datasets tailored for
  Japanese vision-language models.
date: 2025-06-01
type: international
firstpage: 1
lastpage: 10
pdf: https://arxiv.org/pdf/2410.22736
code_link: https://huggingface.co/llm-jp/llm-jp-3-vila-14b
bibtex: "@inproceedings{sasagawa2025llmjp3vila,\n  title = {Constructing Multimodal\
  \ Datasets from Scratch for Rapid Development of a Japanese Visual Language Model},\n\
  \  author = {Keito Sasagawa and Koki Maeda and Issa Sugiura and Shuhei Kurita and\
  \ Naoaki Okazaki and Daisuke Kawahara},\n  booktitle = {Proceedings of the 2025\
  \ Conference of the North American Chapter of the Association for Computational\
  \ Linguistics: Human Language Technologies (Volume 3: System Demonstrations)},\n\
  \  year = {2025},\n  address = {Albuquerque, USA},\n  publisher = {Association for\
  \ Computational Linguistics}\n}"
---

## Abstract

This study addresses the scarcity of multimodal datasets for non-English languages, specifically focusing on Japanese, for visual language models (VLMs). We present an efficient method for rapidly creating comprehensive Japanese multimodal datasets. This involves extracting Japanese image-text pairs from web archives and generating instruction data directly from images using established vision-language models (VLMs). Our datasets significantly enhance the alignment between visual and textual content compared to machine-translated alternatives. Experimental evaluations demonstrate that VLMs trained on our datasets achieve superior accuracy, promoting regional localization and cultural accuracy in multimodal tasks.

## Methodology

We introduce a streamlined pipeline for constructing multimodal datasets from scratch:

- **Pretraining Data:** Curated from web archives, we extracted 6 million Japanese image-text pairs and interleaved data, employing extensive filtering techniques to ensure quality and relevance.
- **Instruction Tuning Data:** Leveraging existing VLMs (e.g., LLaVA), we generated a rich, contextually accurate dataset directly from Japanese images, resulting in 369K samples across various instruction types.
- **Architecture:** Our llm-jp-3 VILA 14B model combines a vision transformer (SigLIP) with a Japanese language model (llm-jp-3-13b-instruct), connected via a two-layer MLP projector.

## Experimental Results

llm-jp-3 VILA 14B demonstrated state-of-the-art performance on Japanese benchmarks including Heron-Bench, JA-VLM-Bench-In-the-Wild, and JA-VG-VQA-500. Notably:

- Achieved superior scores in LLM-as-a-Judge evaluations, indicating excellent multimodal understanding and alignment.
- Surpassed GPT-4o performance on certain benchmarks, underscoring the effectiveness of native Japanese datasets over translated ones.

## Key Contributions

- Developed a novel method for rapidly creating high-quality Japanese multimodal datasets.
- Demonstrated the limitations of relying on translated datasets for non-English languages in multimodal contexts.
- Provided llm-jp-3 VILA 14B, a robust Japanese VLM capable of cultural and contextual accuracy in multimodal tasks.

## Conclusion and Future Work

Our methodology significantly enriches resources for Japanese VLMs, addressing the critical gap in non-English multimodal datasets. Future research includes expanding dataset diversity and enhancing dataset quality through advanced filtering and synthesis techniques.
