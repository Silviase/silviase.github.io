---
layout: papers
id: 2022_d_impara
title: 'IMPARA: パラレルデータにおける修正の影響度に基づいた文法誤り訂正の自動評価法'
authors:
  - '前田, 航希'
  - '金子, 正弘'
  - '岡崎, 直観'
venue: '言語処理学会第28回年次大会 (NLP2022)'
description: '文法誤り訂正（Grammatical Error Correction; GEC）の自動評価は，低コストかつ定量的な評価に不可欠である．しかし，既存の GEC 自動評価手法は評価時に複数の参照文を必要としたり，評価モデルの学習に特化した訓練データが必要になるなど，自動評価の実現のためのデータ作成コストが高いという難点がある．本稿では，誤文と正文の組からなるパラレルデータのみを用い，修正の影響度を考慮しながら GEC の評価尺度を学習する手法である IMPARA を提案する．提案手法は GEC の自動評価におけるデータ作成コストを大幅に軽減しつつ，人手評価との相関において既存手法と同等以上の性能を示した．また，評価尺度を学習するパラレルデータを変更することで，異なるドメインや訂正スタイルに適合した評価を実現できることを実験的に示した．'
date: 2022-03-01
firstpage: '328'
lastpage: '333'
pdf_link: '/assets/papers/2022_d_impara.pdf'
code_link: 'https://github.com/Silviase/IMPARA'
url: 'https://silviase.com/publications/2022_d_impara.html'
type: 'domestic'
bibtex: |
  @inproceedings{maeda2022impara,
    title={IMPARA: パラレルデータにおける修正の影響度に基づいた文法誤り訂正の自動評価法},
    author={前田 航希 and 金子 正弘 and 岡崎 直観},
    booktitle={言語処理学会第28回年次大会 (NLP2022)},
    pages={328--333},
    year={2022},
    address={東京}
  }
---

[PDF](/assets/papers/2022_d_impara.pdf)
