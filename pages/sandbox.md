---
layout: page
title: Sandbox
permalink: /sandbox/
lang: ja
extra_css:
  - /assets/css/sandbox.css
---

<header class="sandbox-header">
  <p class="sandbox-kicker">Sandbox</p>
  <h1>Interactive research demos</h1>
  <p>
    研究や説明用に作った小さなインタラクティブデモを置いています。ブラウザ上で動かしながら、モデル・データ・評価の直感を確かめるためのページです。
  </p>
</header>

<div class="sandbox-grid">
  <article class="sandbox-panel">
    <div class="sandbox-panel-preview" aria-hidden="true">
      <span class="sandbox-cube"></span>
      <span class="sandbox-dot sandbox-dot--blue"></span>
      <span class="sandbox-dot sandbox-dot--green"></span>
      <span class="sandbox-dot sandbox-dot--orange"></span>
    </div>
    <div class="sandbox-panel-body">
      <p class="sandbox-panel-label">Dimensionality Reduction</p>
      <h2>Projection Lab</h2>
      <p>
        3D 点群を眺める向きを選んで 1 本の軸へ射影し、自分の直感的な軸と PCA の第 1 主成分を比較します。
      </p>
      <a class="button" href="{{ '/sandbox/projection-lab/' | relative_url }}">Open demo</a>
    </div>
  </article>
</div>
