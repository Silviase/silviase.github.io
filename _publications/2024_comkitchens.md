---
layout: publications
id: 2024_comkitchens
title: "COM Kitchens: An Unedited Overhead-view Procedural Videos Dataset as a Vision-Language Benchmark"
authors:
  - "Koki Maeda"
  - "Tosho Hirasawa"
  - "Atsushi Hashimoto"
  - "Jun Harashima"
  - "Leszek Rybicki"
  - "Yusuke Fukasawa"
  - "Yoshitaka Ushiku"
venue: "Proceedings of The 18th European Conference on Computer Vision (ECCV 2024)"
description: "Introducing a new vision-language dataset based on unedited overhead-view procedural cooking videos."
date: 2024-09-29
firstpage: 1
lastpage: 16
pdf_link: "https://doi.org/10.32130/rdata.6.1"
code_link: "https://github.com/omron-sinicx/com_kitchens"
url: "https://silviase.com/publications/2024_comkitchens.html"
type: "international"
bibtex: |
  @inproceedings{maeda2024comkitchens,
    title = {COM Kitchens: An Unedited Overhead-view Procedural Videos Dataset as a Vision-Language Benchmark},
    author = {Koki Maeda and Tosho Hirasawa and Atsushi Hashimoto and Jun Harashima and Leszek Rybicki and Yusuke Fukasawa and Yoshitaka Ushiku},
    booktitle = {Proceedings of The 18th European Conference on Computer Vision (ECCV 2024)},
    year = {2024},
    address = {Milan, Italy},
    publisher = {ECCV}
  }
---

## Abstract

COM Kitchens introduces a novel vision-language dataset aimed at overcoming the limitations of current procedural video datasets, typically sourced from the web or ego-centric views. The dataset comprises unedited, overhead-view cooking videos captured using modern smartphones, providing environmental diversity and detailed annotations. We introduce two novel vision-language tasks: Online Recipe Retrieval (OnRR) and Dense Video Captioning on unedited Overhead-View videos (DVC-OV). Our benchmarks demonstrate the dataset's capacity to highlight limitations in existing models, thus paving the way for future research.

## Methodology

Videos were collected by distributing smartphones to participants, who recorded themselves preparing recipes from the Cookpad Recipe Dataset. We provided comprehensive guidelines to ensure data consistency and privacy. Each video includes detailed manual annotations, forming structured visual action graphs that link textual instructions with visual elements via bounding boxes and edges, clearly indicating actions and ingredient transformations throughout the cooking process.

## Experimental Results

Experiments on baseline models such as UniVL, CLIP4Clip, and X-CLIP demonstrated significant challenges in handling OnRR and DVC-OV tasks. None of these models effectively solved the feasible recipe retrieval subtask, although fine-tuning significantly improved the accuracy of the recipe stage identification subtask. Dense video captioning experiments using models like Vid2Seq revealed a notable domain gap between web videos and unedited overhead-view videos, underscoring the dataset's unique challenges.

## Key Contributions

- Introduction of an unedited, diverse fixed-view procedural cooking video dataset.
- Manual annotation of structured visual action graphs for detailed event tracking.
- Proposal of novel vision-language tasks tailored for practical application scenarios.
- Benchmark analysis revealing critical limitations and gaps in current state-of-the-art models.

## Conclusion and Future Work

The COM Kitchens dataset addresses critical gaps in procedural video understanding by providing a comprehensive resource for the vision-language community. Future work includes expanding the dataset, exploring advanced models that leverage the unique structure of visual action graphs, and developing robust applications for practical, real-world scenarios.
