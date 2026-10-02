(() => {
  const root = document.querySelector('.label-page');
  if (!root) return;
  const list = root.querySelector('#labels-list');
  const count = root.querySelector('#label-count');
  const pins = root.querySelector('#label-pins');
  const map = root.querySelector('#origin-map');
  const category = root.querySelector('#category-filter');
  const regionFilter = root.querySelector('#origin-filter');
  const producerFilter = root.querySelector('#producer-filter');
  const search = root.querySelector('#label-search');
  const empty = root.querySelector('#map-empty');
  const layout = root.querySelector('.explorer-layout');
  const lang = () => (document.documentElement.dataset.lang === 'ja' ? 'ja' : 'en');
  const text = (en, ja) => (lang() === 'ja' ? ja : en);
  const decode = (value = '') => value.replaceAll('&amp;', '&');
  const views = {
    world: [-180, -85, 360, 170],
    japan: [122, -48, 34, 25],
    france: [-6, -52, 18, 13],
    rhone: [3.6, -46.3, 3.5, 3.2],
    loire: [-2, -48.4, 6, 3.5],
    burgundy: [2.8, -48.4, 3.6, 2.8],
  };
  const areaNames = {
    world: ['World', '世界'],
    japan: ['Japan', '日本'],
    france: ['France', 'フランス'],
    rhone: ['Rhône', 'ローヌ'],
    loire: ['Loire', 'ロワール'],
    burgundy: ['Burgundy', 'ブルゴーニュ'],
  };
  const wineRegions = {
    rhone: /ローヌ|rh[oô]ne/i,
    loire: /ロワール|loire/i,
    burgundy: /ブルゴーニュ|bourgogne|burgundy/i,
  };
  const categoryNames = {
    'craft-beer': ['Craft beer', 'クラフトビール'],
    wine: ['Wine', 'ワイン'],
    sake: ['Sake', '日本酒'],
    other: ['Other', 'その他'],
  };
  let area = 'france',
    view = [...views.france],
    manuallyNavigated = false,
    selected = null;
  let labels;
  try {
    labels = JSON.parse(root.dataset.labels);
    if (!Array.isArray(labels)) throw new Error('Invalid catalog');
  } catch {
    list.textContent = text(
      'Label data could not be loaded. Please refresh.',
      'ラベルを読み込めませんでした。再読み込みしてください。'
    );
    return;
  }
  const countryName = (item) =>
    new Intl.DisplayNames([lang()], { type: 'region' }).of(item.origin.countryCode) ||
    item.origin.country;
  const place = (item) =>
    [item.origin.locality, item.origin.region, countryName(item)].filter(Boolean).join(' · ');
  const groupKey = (item) =>
    `${item.origin.countryCode}:${item.origin.latitude}:${item.origin.longitude}`;
  const otherType = (item) =>
    /gin/i.test(item.style || '')
      ? text('Gin', 'ジン')
      : /shochu/i.test(item.style || '')
        ? text('Shochu', '焼酎')
        : item.style || text('Other', 'その他');
  const facetKey = (item) =>
    category.value === 'other'
      ? /gin/i.test(item.style || '')
        ? 'gin'
        : /shochu/i.test(item.style || '')
          ? 'shochu'
          : item.style || 'other'
      : item.origin.region || item.origin.country;
  const facetName = (key) =>
    key === 'gin' ? text('Gin', 'ジン') : key === 'shochu' ? text('Shochu', '焼酎') : key;
  const areaMatches = (item) =>
    area === 'world' ||
    (area === 'japan'
      ? item.origin.countryCode === 'JP'
      : item.origin.countryCode === 'FR' &&
        (!wineRegions[area] || wineRegions[area].test(item.origin.region || '')));
  const baseMatches = () =>
    labels.filter(
      (item) => (category.value === 'all' || item.category === category.value) && areaMatches(item)
    );
  const matches = () =>
    baseMatches().filter(
      (item) =>
        (regionFilter.value === 'all' || facetKey(item) === regionFilter.value) &&
        (producerFilter.value === 'all' || item.producer === producerFilter.value) &&
        decode(
          [
            item.name,
            item.producer,
            item.style,
            item.vintage,
            item.origin.region,
            item.origin.locality,
            countryName(item),
          ]
            .filter(Boolean)
            .join(' ')
        )
          .toLocaleLowerCase()
          .includes(search.value.trim().toLocaleLowerCase())
    );
  const element = (tag, className, content) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = decode(String(content));
    return node;
  };
  const setMobileView = (mode) => {
    layout.dataset.mobileView = mode;
    root
      .querySelectorAll('[data-mobile-view]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset.mobileView === mode))
      );
    if (mode === 'map') requestAnimationFrame(() => renderPins(matches()));
  };

  function populateFacets() {
    const items = baseMatches();
    const populate = (select, values, name) => {
      const previous = select.value;
      select.replaceChildren(new Option(text('All', 'すべて'), 'all'));
      for (const value of [...new Set(values.filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, lang())
      ))
        select.add(new Option(decode(name(value)), value));
      select.value = [...select.options].some((option) => option.value === previous)
        ? previous
        : 'all';
    };
    populate(regionFilter, items.map(facetKey), facetName);
    populate(
      producerFilter,
      items
        .filter((item) => regionFilter.value === 'all' || facetKey(item) === regionFilter.value)
        .map((item) => item.producer),
      (s) => s
    );
    root.querySelector('#origin-filter-label').textContent =
      category.value === 'sake'
        ? text('PREFECTURE', '都道府県')
        : category.value === 'other'
          ? text('TYPE', '酒の種類')
          : text('REGION', '産地・地域');
    root.querySelector('#producer-filter-label').textContent =
      category.value === 'craft-beer'
        ? text('BREWERY', 'ブルワリー')
        : category.value === 'sake'
          ? text('BREWERY', '酒蔵')
          : text('PRODUCER', '生産者');
  }

  function renderPins(items) {
    const matrix = map.getScreenCTM();
    if (!matrix || map.getBoundingClientRect().width === 0) return;
    pins.replaceChildren();
    const clusters = [];
    const riverLabels = root.querySelector('#river-labels');
    riverLabels.replaceChildren();
    if (area !== 'world' && area !== 'japan')
      for (const [name, lon, lat] of [
        ['Rhône', 4.9, 45.5],
        ['Loire', 0.2, 47.3],
        ['Seine', 2.2, 48.8],
        ['Garonne', 0.6, 44.8],
      ]) {
        if (lon < view[0] || lon > view[0] + view[2] || -lat < view[1] || -lat > view[1] + view[3])
          continue;
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute(
          'transform',
          `translate(${lon},${-lat}) scale(${1 / matrix.a},${1 / matrix.d})`
        );
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('class', 'river-name');
        label.textContent = name;
        group.append(label);
        riverLabels.append(group);
      }
    for (const item of items) {
      const pt = map.createSVGPoint();
      pt.x = item.origin.longitude;
      pt.y = -item.origin.latitude;
      if (pt.x < view[0] || pt.x > view[0] + view[2] || pt.y < view[1] || pt.y > view[1] + view[3])
        continue;
      const screen = pt.matrixTransform(matrix);
      const cluster = clusters.find((c) => Math.hypot(c.x - screen.x, c.y - screen.y) < 34);
      if (cluster) cluster.items.push(item);
      else clusters.push({ x: screen.x, y: screen.y, items: [item] });
    }
    for (const cluster of clusters) {
      const first = cluster.items[0],
        g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'origin-pin-group');
      g.setAttribute('role', 'button');
      g.setAttribute('tabindex', '0');
      g.setAttribute(
        'transform',
        `translate(${first.origin.longitude},${-first.origin.latitude}) scale(${1 / matrix.a},${1 / matrix.d})`
      );
      const description = text(
        `${cluster.items.length} label${cluster.items.length === 1 ? '' : 's'} near ${place(first)}. Open details.`,
        `${place(first)}付近のラベル${cluster.items.length}件。詳細を表示。`
      );
      g.setAttribute('aria-label', description);
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = description;
      g.append(title);
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', cluster.items.length > 1 ? '14' : '10');
      circle.setAttribute('class', 'origin-pin');
      g.append(circle);
      if (cluster.items.length > 1) {
        const n = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        n.setAttribute('class', 'origin-pin-count');
        n.textContent = cluster.items.length;
        g.append(n);
      }
      const activate = () => {
        selected = new Set(cluster.items.map((item) => item.id));
        renderList(items);
        if (window.matchMedia('(max-width: 600px)').matches) setMobileView('list');
        list.querySelector('.origin-group')?.focus({ preventScroll: true });
        list.scrollTop = 0;
      };
      g.addEventListener('click', activate);
      g.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          activate();
        }
      });
      pins.append(g);
    }
  }

  function renderList(items) {
    list.replaceChildren();
    const shown = selected ? items.filter((item) => selected.has(item.id)) : items;
    if (selected) {
      const reset = element(
        'button',
        'selection-reset',
        text(`Show all ${items.length} labels`, `${items.length}件すべてを表示`)
      );
      reset.type = 'button';
      reset.addEventListener('click', () => {
        selected = null;
        renderList(items);
      });
      list.append(reset);
    }
    if (!shown.length) {
      list.append(
        element(
          'p',
          'empty-list',
          labels.length
            ? text('No labels match these filters.', '条件に合うラベルはありません。')
            : text(
                'No reviewed labels have been added yet.',
                '確認済みのラベルはまだ登録されていません。'
              )
        )
      );
      return;
    }
    const sorted = [...shown].sort((a, b) =>
      [a.origin.countryCode, facetKey(a), a.producer, a.name]
        .join('|')
        .localeCompare([b.origin.countryCode, facetKey(b), b.producer, b.name].join('|'), lang())
    );
    const groups = new Map();
    for (const item of sorted) {
      const key = `${facetKey(item)}:${groupKey(item)}`;
      groups.set(key, [...(groups.get(key) || []), item]);
    }
    let previousRegion = '';
    for (const items of groups.values()) {
      const first = items[0],
        region =
          category.value === 'other'
            ? otherType(first)
            : [countryName(first), first.origin.region].filter(Boolean).join(' / ');
      if (region !== previousRegion) {
        list.append(element('h3', 'collection-region', region));
        previousRegion = region;
      }
      const section = element('section', 'origin-group');
      section.dataset.origin = groupKey(first);
      section.tabIndex = -1;
      const gh = element('div', 'origin-group-heading');
      gh.append(
        element('h4', '', first.origin.locality || first.origin.region || countryName(first)),
        element('span', 'origin-group-count', text(`${items.length} labels`, `${items.length}件`))
      );
      section.append(gh);
      for (const item of items) {
        const card = element('article', 'label-card');
        card.dataset.labelId = item.id;
        card.append(
          element(
            'span',
            'category-tag',
            category.value === 'other' ? otherType(item) : text(...categoryNames[item.category])
          )
        );
        if (item.producer) card.append(element('p', 'label-producer', item.producer));
        card.append(element('h4', 'label-name', item.name));
        const variant = [item.vintage, item.style].filter(Boolean).join(' · ');
        if (variant) card.append(element('p', 'label-variant', variant));
        const precision =
          lang() === 'ja'
            ? item.origin.precisionLabel
            : {
                producer: 'Producer facility reference',
                locality: 'Approximate locality or origin reference',
                region: 'Approximate regional reference',
              }[item.origin.precision];
        card.append(element('p', 'coordinate-precision', precision));
        if (item.confidence !== 'high')
          card.append(
            element('span', 'uncertainty-tag', text('Details unconfirmed', '詳細未確認'))
          );
        if (item.note && item.note !== item.origin.precisionLabel) {
          const details = element('details', 'label-evidence');
          details.append(
            element('summary', '', text('Origin notes', '産地・確認メモ')),
            element('p', '', item.note)
          );
          card.append(details);
        }
        const links = element('div', 'label-links');
        for (const [url, caption] of [
          [
            item.officialSourceUrl || item.origin.sourceUrl,
            text('Beverage / producer', '商品・生産者'),
          ],
          [item.origin.coordinateSourceUrl, text('Coordinate source', '座標の出典')],
        ])
          if (url) {
            const a = element('a', 'label-source', caption);
            a.href = decode(url);
            a.target = '_blank';
            a.rel = 'noreferrer';
            links.append(a);
          }
        card.append(links);
        section.append(card);
      }
      list.append(section);
    }
  }

  function render(refreshFacets = true) {
    if (!manuallyNavigated) {
      area = category.value === 'sake' ? 'japan' : category.value === 'wine' ? 'france' : 'world';
      view = [...views[area]];
    }
    if (refreshFacets) populateFacets();
    const items = matches();
    root.querySelector('#map-heading').textContent = text(...areaNames[area]);
    root
      .querySelectorAll('[data-area]')
      .forEach((b) =>
        b.setAttribute(
          'aria-pressed',
          String(b.dataset.area === area || (b.dataset.area === 'france' && !!wineRegions[area]))
        )
      );
    root
      .querySelectorAll('[data-wine-view]')
      .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.wineView === area)));
    root.querySelector('#wine-region-views').hidden = category.value !== 'wine';
    map.setAttribute('viewBox', view.join(' '));
    root.querySelector('#river-layer').style.display =
      area === 'world' || area === 'japan' ? 'none' : '';
    root.querySelector('#collection-hierarchy').textContent =
      category.value === 'sake'
        ? text('Prefecture → brewery → product', '都道府県 → 酒蔵 → 銘柄')
        : category.value === 'wine'
          ? text('Country → wine region → producer', '国 → ワイン産地 → 生産者')
          : category.value === 'other'
            ? text('Type → region → producer', '酒の種類 → 地域 → 生産者')
            : text('Country / region → brewery → style', '国・地域 → ブルワリー → スタイル');
    count.textContent = text(
      `${items.length} / ${labels.length} labels`,
      `${items.length} / ${labels.length}件`
    );
    empty.hidden = items.length > 0;
    if (!items.length) {
      empty.querySelector('strong').textContent = text(
        'No labels in this view',
        'この条件のラベルはありません'
      );
      empty.querySelector('.empty-hint').textContent = text(
        'Try another area or clear the filters.',
        'エリアを変えるか、絞り込みを解除してください。'
      );
    }
    renderPins(items);
    renderList(items);
  }
  root.querySelectorAll('[data-area], [data-wine-view]').forEach((button) =>
    button.addEventListener('click', () => {
      area = button.dataset.area || button.dataset.wineView;
      view = [...views[area]];
      manuallyNavigated = true;
      selected = null;
      regionFilter.value = producerFilter.value = 'all';
      render();
    })
  );
  category.addEventListener('change', () => {
    selected = null;
    regionFilter.value = producerFilter.value = 'all';
    render();
  });
  search.addEventListener('input', () => {
    selected = null;
    render(false);
  });
  regionFilter.addEventListener('change', () => {
    selected = null;
    producerFilter.value = 'all';
    render();
  });
  producerFilter.addEventListener('change', () => {
    selected = null;
    render(false);
  });
  root
    .querySelectorAll('[data-mobile-view]')
    .forEach((button) =>
      button.addEventListener('click', () => setMobileView(button.dataset.mobileView))
    );
  root.querySelectorAll('[data-map-zoom]').forEach((button) =>
    button.addEventListener('click', () => {
      const [x, y, w, h] = view,
        action = button.dataset.mapZoom,
        factor = action === 'in' ? 0.7 : 1.4;
      if (action === 'reset') view = [...views[area]];
      else if (w * factor >= 0.15 && w * factor <= 500)
        view = [x + (w * (1 - factor)) / 2, y + (h * (1 - factor)) / 2, w * factor, h * factor];
      manuallyNavigated = true;
      map.setAttribute('viewBox', view.join(' '));
      renderPins(matches());
    })
  );
  let drag;
  map.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.origin-pin-group') || event.button !== 0) return;
    drag = { x: event.clientX, y: event.clientY, view: [...view] };
    map.setPointerCapture(event.pointerId);
  });
  map.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const m = map.getScreenCTM();
    view = [
      drag.view[0] - (event.clientX - drag.x) / m.a,
      drag.view[1] - (event.clientY - drag.y) / m.d,
      drag.view[2],
      drag.view[3],
    ];
    manuallyNavigated = true;
    map.setAttribute('viewBox', view.join(' '));
  });
  const endDrag = () => {
    if (drag) {
      drag = null;
      renderPins(matches());
    }
  };
  map.addEventListener('pointerup', endDrag);
  map.addEventListener('pointercancel', endDrag);
  document.addEventListener('languagechange', () => render());
  new ResizeObserver(() => renderPins(matches())).observe(map);
  Promise.all(
    [
      '/assets/maps/natural-earth-admin-0-50m.svg',
      '/assets/maps/natural-earth-france-rivers.svg',
    ].map((url) =>
      fetch(url, { method: 'HEAD' }).then((r) => {
        if (!r.ok) throw new Error('Unavailable map asset');
      })
    )
  ).catch(() => {
    root.querySelector('#map-error').hidden = false;
  });
  layout.dataset.mobileView = 'map';
  render();
})();
