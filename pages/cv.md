---
layout: cv
title: Curriculum Vitae
permalink: /cv/
extra_css:
  - /assets/css/cv.css
lang: en
---

{% assign profile = site.data.profile %}
{% assign contacts = profile.contacts %}
{% assign contact_email = contacts | where: 'label', 'Email' | first %}
{% assign contact_scholar = contacts | where: 'label', 'Google Scholar' | first %}
{% assign contact_github = contacts | where: 'label', 'GitHub' | first %}
{% assign contact_linkedin = contacts | where: 'label', 'LinkedIn' | first %}

<header class="cv-header">
  <div class="cv-title-block">
    <a class="cv-home-link" href="{{ '/' | relative_url }}">← Home</a>
    <h1>{{ profile.name }}</h1>
    <p>{{ profile.tagline }}</p>
  </div>
  <div class="cv-contact">
    {% if contact_email %}
      <a href="{{ contact_email.url }}">{{ contact_email.url | replace: 'mailto:', '' }}</a>
    {% endif %}
    {% if contact_scholar %}
      <a href="{{ contact_scholar.url }}">Google Scholar</a>
    {% endif %}
    {% if contact_github %}
      <a href="{{ contact_github.url }}">GitHub</a>
    {% endif %}
    {% if contact_linkedin %}
      <a href="{{ contact_linkedin.url }}">LinkedIn</a>
    {% endif %}
  </div>
  {% if profile.image %}
    <div class="cv-photo">
      <img src="{{ profile.image | relative_url }}" alt="{{ profile.name }} portrait" loading="lazy" />
    </div>
  {% endif %}
</header>

<section class="cv-section">
  <h2>Research Focus</h2>
  <p class="cv-summary">
    {{ profile.bio }}
  </p>
  <ul class="cv-bullets">
    <li>Designing instruction-tuned multimodal LLMs and evaluation pipelines that balance academic rigor with deployability.</li>
    <li>Building curated Japanese-language datasets for captioning, reasoning, and cultural understanding in vision-language systems.</li>
  </ul>
</section>

<section class="cv-section">
  <h2>Education</h2>
  <ul class="cv-timeline">
    {% for item in site.data.education %}
      <li class="cv-timeline-item">
        <div class="cv-timeline-years">{{ item.years }}</div>
        <div>
          <h3>{{ item.program }}</h3>
          {% if item.focus %}
            <p class="cv-timeline-meta">{{ item.focus }}</p>
          {% endif %}
          {% if item.advisors %}
            <p class="cv-timeline-meta">Advisors: {{ item.advisors | join: ', ' }}</p>
          {% endif %}
          {% if item.description %}
            <p>{{ item.description }}</p>
          {% endif %}
        </div>
      </li>
    {% endfor %}
  </ul>
</section>

{% assign cvpubs = site.data.cv_publications %}
{% assign international_count = cvpubs.international | size %}

<section class="cv-section">
  <h2>Publications</h2>

  <h3>International Conferences &amp; Workshops</h3>
  <ol class="cv-pub-list">
    {% for entry in cvpubs.international %}
      {% assign paper = site.papers | where: 'slug', entry.id | first %}
      {% assign authors = paper.authors | default: entry.authors %}
      {% assign venue = paper.venue | default: paper.journal %}
      {% capture author_line -%}
        {%- for author in authors -%}
          {%- assign name = author | replace: ', ', ' ' | replace: ',', ' ' | strip -%}
          {%- assign highlight = false -%}
          {%- if name contains 'Koki Maeda' -%}
            {%- assign highlight = true -%}
          {%- elsif name contains '前田' and name contains '航希' -%}
            {%- assign highlight = true -%}
          {%- endif -%}
          {%- if highlight -%}
            {%- assign name = '<strong><u>' | append: name | append: '</u></strong>' -%}
          {%- endif -%}
          {{- name -}}{%- if forloop.last -%}.{%- else -%}, {% endif -%}
        {%- endfor -%}
      {%- endcapture %}
      {% assign meta_string = '' %}
      {% if entry.location %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: entry.location %}
      {% endif %}
      {% if entry.date %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: entry.date %}
      {% endif %}
      {% if venue %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: venue %}
      {% endif %}
      {% if entry.pages %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: entry.pages %}
      {% endif %}
      {% if entry.page_count %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: entry.page_count %}
      {% endif %}
      {% if entry.column %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: entry.column %}
      {% endif %}
      {% assign meta_parts = meta_string | split: '||' %}
      {% assign meta_line = meta_parts | join: ' · ' %}
      <li class="cv-pub-item">
        <span class="cv-pub-authors">{{ author_line | strip }}</span>
        <span class="cv-pub-title"> <em>{{ paper.title }}</em></span>
        {% if meta_line %}
          <span class="cv-pub-meta"> · {{ meta_line | strip }}</span>
        {% endif %}
      </li>
    {% endfor %}
  </ol>

  <h3>Domestic Conferences</h3>
  <ol class="cv-pub-list" start="{{ international_count | plus: 1 }}">
    {% for entry in cvpubs.domestic %}
      {% assign paper = site.papers | where: 'slug', entry.id | first %}
      {% assign authors = paper.authors | default: entry.authors %}
      {% assign venue = paper.venue | default: paper.journal %}
      {% capture author_line -%}
        {%- for author in authors -%}
          {%- assign name = author | replace: ', ', ' ' | replace: ',', ' ' | strip -%}
          {%- assign highlight = false -%}
          {%- if name contains 'Koki Maeda' -%}
            {%- assign highlight = true -%}
          {%- elsif name contains '前田' and name contains '航希' -%}
            {%- assign highlight = true -%}
          {%- endif -%}
          {%- if highlight -%}
            {%- assign name = '<strong><u>' | append: name | append: '</u></strong>' -%}
          {%- endif -%}
          {{- name -}}{%- if forloop.last -%}.{%- else -%}, {% endif -%}
        {%- endfor -%}
      {%- endcapture %}
      {% assign meta_string = '' %}
      {% if entry.location %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: entry.location %}
      {% endif %}
      {% if entry.date %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: entry.date %}
      {% endif %}
      {% if venue %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: venue %}
      {% endif %}
      {% if entry.pages %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: entry.pages %}
      {% endif %}
      {% if entry.page_count %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: entry.page_count %}
      {% endif %}
      {% if entry.column %}
        {% if meta_string != '' %}{% assign meta_string = meta_string | append: '||' %}{% endif %}
        {% assign meta_string = meta_string | append: entry.column %}
      {% endif %}
      {% assign meta_parts = meta_string | split: '||' %}
      {% assign meta_line = meta_parts | join: ' · ' %}
      <li class="cv-pub-item">
        <span class="cv-pub-authors">{{ author_line | strip }}</span>
        <span class="cv-pub-title"> <em>{{ paper.title }}</em></span>
        {% if meta_line %}
          <span class="cv-pub-meta"> · {{ meta_line | strip }}</span>
        {% endif %}
      </li>
    {% endfor %}
  </ol>
</section>

{% assign invited = site.data.invited_talks %}
{% if invited %}
  <section class="cv-section">
    <h2>Invited Talks &amp; Workshops</h2>
    <ol class="cv-pub-list">
      {% for talk in invited %}
        {% assign details = '' %}
        {% if talk.event %}
          {% assign details = details | append: talk.event %}
        {% endif %}
        {% if talk.location %}
          {% if details != '' %}{% assign details = details | append: ' · ' %}{% endif %}
          {% assign details = details | append: talk.location %}
        {% endif %}
        {% if talk.date %}
          {% if details != '' %}{% assign details = details | append: ' · ' %}{% endif %}
          {% assign details = details | append: talk.date %}
        {% endif %}
        {% if talk.note %}
          {% if details != '' %}{% assign details = details | append: ' · ' %}{% endif %}
          {% assign details = details | append: talk.note %}
        {% endif %}
        <li class="cv-pub-item">
          {% if talk.url %}
            <span class="cv-pub-title"><a href="{{ talk.url }}">{{ talk.title }}</a></span>
          {% else %}
            <span class="cv-pub-title">{{ talk.title }}</span>
          {% endif %}
          {% if details != '' %}
            <span class="cv-pub-meta"> · {{ details }}</span>
          {% endif %}
        </li>
      {% endfor %}
    </ol>
  </section>
{% endif %}

<section class="cv-section">
  <h2>Awards &amp; Fellowships</h2>
  <ul class="cv-list">
    {% for award in site.data.awards %}
      <li>{{ award }}</li>
    {% endfor %}
  </ul>
</section>

<section class="cv-section">
  <h2>Skills</h2>
  <ul class="cv-list">
    {% for group in site.data.skills %}
      <li>
        <h3>{{ group.name }}</h3>
        <div class="cv-pub-meta">{{ group.items | join: ', ' }}</div>
      </li>
    {% endfor %}
  </ul>
</section>
