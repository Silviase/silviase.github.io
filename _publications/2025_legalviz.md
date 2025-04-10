---
layout: publications
id: 2025_legalviz
title: "LegalViz: Legal Text Visualization by Text To Diagram Generation"
authors:
  - "Eri Onami"
  - "Taiki Miyanishi"
  - "Koki Maeda"
  - "Shuhei Kurita"
venue: "Proceedings of the 2025 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers)"
description: "Novel approach for visualizing complex legal document structures through diagram generation from text."
date: 2025-06-01
firstpage: 1
lastpage: 15
pdf_link: "https://arxiv.org/abs/2502.06147"
code_link: ""
type: "international"
bibtex: |
  @inproceedings{onami2024legalviz,
    title = {LegalViz: Legal Text Visualization by Text To Diagram Generation},
    author = {Eri Onami and Taiki Miyanishi and Koki Maeda and Shuhei Kurita},
    booktitle = {Proceedings of the 2025 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers)},
    year = {2025},
    address = {Albuquerque, USA},
    publisher = {Association for Computational Linguistics}
  }
---

## Abstract

LegalViz is a novel dataset and method designed to visualize complex legal documents as intuitive diagrams using Graphviz's DOT language. The dataset comprises 7,010 pairs of professional legal texts and corresponding diagrams, covering 23 languages from EUR-LEX. LegalViz facilitates understanding of legal documents by highlighting essential entities, relationships, transactions, and underlying legal rules. Experimental results demonstrate that large language models fine-tuned with LegalViz significantly outperform traditional methods, validating the effectiveness of our approach.

## Methodology

LegalViz introduces a diagrammatic representation using Graphviz's DOT language, capturing essential components: legal entities, relationships, transactions, sources, and statements. The dataset was constructed by annotating legal judgments sourced from EUR-LEX across multiple languages, followed by translations reviewed using GPT-4, DeepL, and expert annotators. Few-shot and fine-tuned language models were employed and evaluated using metrics considering graph structure, textual similarity (via BERTScore), and legal content.

## Experimental Results

Empirical studies compared fine-tuned models (Gemma-2-9B, CodeLlama-13B) with few-shot GPT models. Fine-tuned Gemma-2-9B achieved top performance, scoring highest in structural and textual accuracy. Finetuning notably improved models' capability to accurately generate valid DOT diagrams, with Gemma-2-9B reaching 100% validity across test sets.

## Key Contributions

- Creation of LegalViz, the first annotated dataset for legal diagram generation from text.
- Introduction of novel graph and legal-content based evaluation metrics.
- Demonstration of significant performance gains in multilingual and structurally complex legal text visualization tasks using fine-tuned large language models.

## Conclusion and Future Work

LegalViz successfully demonstrates how fine-tuned large language models can visualize complex legal texts effectively, enhancing accessibility for both professionals and laypersons. Future work includes expanding the dataset across additional jurisdictions, refining models for improved accuracy, and exploring interactive visualization capabilities.
