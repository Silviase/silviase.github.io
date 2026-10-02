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
  const categoryNames = {
    'craft-beer': ['Craft beer', 'クラフトビール'],
    wine: ['Wine', 'ワイン'],
    sake: ['Sake', '日本酒'],
    other: ['Other', 'その他'],
  };
  let area = 'world',
    view = [...views.world],
    selected = null,
    animationFrame;
  let labels;
  try {
    labels = JSON.parse(root.dataset.labels);
    if (!Array.isArray(labels)) throw new Error('Invalid catalog');
  } catch {
    list.textContent = text(
      'The records could not be loaded. Please refresh.',
      '記録を読み込めませんでした。再読み込みしてください。'
    );
    return;
  }
  const displayName = (item) => item.nameJa || item.name;
  const producerName = (item) =>
    lang() === 'ja' ? item.producerJa || item.producer : item.producer || item.producerJa;
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
  // Map navigation and collection filters are independent.
  const baseMatches = () =>
    labels.filter((item) => category.value === 'all' || item.category === category.value);
  const matches = () =>
    baseMatches().filter(
      (item) =>
        (regionFilter.value === 'all' || facetKey(item) === regionFilter.value) &&
        (producerFilter.value === 'all' || item.producer === producerFilter.value) &&
        decode(
          [
            item.name,
            item.nameJa,
            item.producer,
            item.producerJa,
            item.style,
            item.vintage,
            item.appellation,
            item.wineRegion,
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
    if (window.matchMedia('(max-width: 850px)').matches)
      requestAnimationFrame(() =>
        root.querySelector('.mobile-view-toggle').scrollIntoView({
          block: 'start',
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
            ? 'auto'
            : 'smooth',
        })
      );
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
      (value) => producerName(items.find((item) => item.producer === value))
    );
    root.querySelector('#origin-filter-label').textContent =
      category.value === 'sake'
        ? text('PREFECTURE', '都道府県')
        : category.value === 'other'
          ? text('TYPE', '種類')
          : text('REGION', '産地');
    root.querySelector('#producer-filter-label').textContent =
      category.value === 'sake'
        ? text('BREWERY', '蔵元')
        : category.value === 'craft-beer'
          ? text('BREWERY', 'ブルワリー')
          : text('PRODUCER', '生産者');
  }
  function animateView(target) {
    cancelAnimationFrame(animationFrame);
    const start = [...view],
      started = performance.now();
    const apply = (next) => {
      view = next;
      map.setAttribute('viewBox', view.join(' '));
      renderPins(matches());
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply([...target]);
      return;
    }
    const frame = (now) => {
      const progress = Math.min(1, (now - started) / 650),
        t = progress * progress * (3 - 2 * progress);
      const width = start[2] * (target[2] / start[2]) ** t,
        height = start[3] * (target[3] / start[3]) ** t;
      const centerX =
        start[0] + start[2] / 2 + (target[0] + target[2] / 2 - start[0] - start[2] / 2) * t;
      const centerY =
        start[1] + start[3] / 2 + (target[1] + target[3] / 2 - start[1] - start[3] / 2) * t;
      apply(
        progress === 1 ? [...target] : [centerX - width / 2, centerY - height / 2, width, height]
      );
      if (progress < 1) animationFrame = requestAnimationFrame(frame);
    };
    animationFrame = requestAnimationFrame(frame);
  }
  function navigateMap(nextArea) {
    area = nextArea;
    selected = null;
    render();
    animateView(views[area]);
  }
  function showOnMap(item) {
    area =
      item.origin.countryCode === 'JP'
        ? 'japan'
        : item.origin.countryCode === 'FR'
          ? 'france'
          : 'world';
    const width = { producer: 1.2, locality: 3.5, region: 7 }[item.origin.precision];
    render(false);
    if (window.matchMedia('(max-width: 850px)').matches) setMobileView('map');
    animateView([
      item.origin.longitude - width / 2,
      -item.origin.latitude - width * 0.4,
      width,
      width * 0.8,
    ]);
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
    empty.hidden = clusters.length > 0;
    if (!clusters.length)
      empty.querySelector('strong').textContent = items.length
        ? text('No drinks here yet', 'このあたりの記録はまだありません')
        : text('No drinks found', '見つかりませんでした');
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
        `${cluster.items.length} drinks near ${place(first)}`,
        `${place(first)}付近のお酒 ${cluster.items.length}本`
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
        if (window.matchMedia('(max-width: 850px)').matches) setMobileView('list');
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
        text(`All ${items.length} drinks`, `${items.length}本すべて見る`)
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
            ? text('No drinks found.', '見つかりませんでした。')
            : text('No drinks recorded yet.', 'まだ記録がありません。')
        )
      );
      return;
    }
    const groups = new Map();
    for (const item of shown) {
      const key = groupKey(item);
      groups.set(key, [...(groups.get(key) || []), item]);
    }
    for (const items of groups.values()) {
      const section = element('section', 'origin-group');
      section.dataset.origin = groupKey(items[0]);
      section.tabIndex = -1;
      section.setAttribute('aria-label', place(items[0]));
      for (const item of items) {
        const card = element('article', 'label-card');
        card.dataset.labelId = item.id;
        card.append(element('h3', 'label-name', displayName(item)));
        if (producerName(item)) card.append(element('p', 'label-producer', producerName(item)));
        const badges = element('div', 'label-badges');
        for (const [kind, caption] of [
          [
            'category',
            item.category === 'other' ? otherType(item) : text(...categoryNames[item.category]),
          ],
          ['origin', item.wineRegion || item.origin.region || countryName(item)],
          [
            'vintage',
            (lang() === 'ja'
              ? item.vintage?.replace(/^(\d{4}) release$/, '$1年発売')
              : item.vintage) ||
              (item.category === 'wine' ? text('Vintage unknown', '年不明') : ''),
          ],
          ['style', item.style],
        ])
          if (caption) badges.append(element('span', `label-badge label-badge--${kind}`, caption));
        card.append(badges);
        if (item.terroir) {
          const terroir = element('p', 'label-terroir');
          terroir.append(
            element('span', '', text('Terroir', '風土')),
            document.createTextNode(item.terroir)
          );
          card.append(terroir);
        }
        if (item.displayNote)
          card.append(element('p', 'uncertainty-tag', item.displayNote[lang()]));
        const actions = element('div', 'label-card-actions');
        const details = element('details', 'label-evidence');
        details.append(element('summary', '', text('About this drink', 'このお酒について')));
        if (item.appellation) details.append(element('p', '', item.appellation));
        const precision =
          item.origin.precision === 'producer'
            ? text('Brewery / winery', '醸造所')
            : text('Approximate origin', '産地の目安');
        details.append(element('p', '', `${precision} · ${place(item)}`));
        const links = element('div', 'label-links');
        const sources = [
          [item.officialSourceUrl || item.origin.sourceUrl, text('Drink', '銘柄')],
          [item.origin.coordinateSourceUrl, text('Origin', '産地')],
          ...(item.metadataSources || []).map((url, index) => [
            url,
            text(`More ${index + 1}`, `資料 ${index + 1}`),
          ]),
        ];
        const seen = new Set();
        for (const [url, caption] of sources)
          if (url && !seen.has(decode(url))) {
            seen.add(decode(url));
            const a = element('a', 'label-source', caption);
            a.href = decode(url);
            a.target = '_blank';
            a.rel = 'noreferrer';
            links.append(a);
          }
        details.append(links);
        const mapButton = element('button', 'card-map-button', text('Map ↗', '地図 ↗'));
        mapButton.type = 'button';
        mapButton.setAttribute(
          'aria-label',
          text(`Show ${displayName(item)} on the map`, `${displayName(item)}を地図で見る`)
        );
        mapButton.addEventListener('click', () => showOnMap(item));
        actions.append(details, mapButton);
        card.append(actions);
        section.append(card);
      }
      list.append(section);
    }
  }
  function render(refreshFacets = true) {
    if (refreshFacets) populateFacets();
    const items = matches();
    const filterCount = [regionFilter.value, producerFilter.value].filter(
      (value) => value !== 'all'
    ).length;
    root.querySelector('#filter-summary').textContent =
      text('Filters', '絞り込み') + (filterCount ? ` · ${filterCount}` : '');
    root
      .querySelectorAll('[data-area]')
      .forEach((button) =>
        button.setAttribute(
          'aria-pressed',
          String(
            button.dataset.area === area ||
              (button.dataset.area === 'france' && ['rhone', 'loire', 'burgundy'].includes(area))
          )
        )
      );
    root
      .querySelectorAll('[data-wine-view]')
      .forEach((button) =>
        button.setAttribute('aria-pressed', String(button.dataset.wineView === area))
      );
    root.querySelector('#wine-region-views').hidden = !['all', 'wine'].includes(category.value);
    root.querySelector('#river-layer').style.display =
      area === 'world' || area === 'japan' ? 'none' : '';
    map.setAttribute('viewBox', view.join(' '));
    count.textContent = text(
      `${items.length} / ${labels.length} drinks`,
      `${items.length} / ${labels.length}本`
    );
    empty.hidden = items.length > 0;
    if (!items.length)
      empty.querySelector('strong').textContent = text('No drinks found', '見つかりませんでした');
    renderPins(items);
    renderList(items);
  }
  root
    .querySelectorAll('[data-area], [data-wine-view]')
    .forEach((button) =>
      button.addEventListener('click', () =>
        navigateMap(button.dataset.area || button.dataset.wineView)
      )
    );
  category.addEventListener('change', () => {
    selected = null;
    regionFilter.value = producerFilter.value = 'all';
    search.value = '';
    navigateMap(
      category.value === 'sake' ? 'japan' : category.value === 'wine' ? 'france' : 'world'
    );
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
      if (action === 'reset') animateView(views[area]);
      else if (w * factor >= 0.15 && w * factor <= 500)
        animateView([
          x + (w * (1 - factor)) / 2,
          y + (h * (1 - factor)) / 2,
          w * factor,
          h * factor,
        ]);
    })
  );
  let drag;
  map.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.origin-pin-group') || event.button !== 0) return;
    cancelAnimationFrame(animationFrame);
    drag = { x: event.clientX, y: event.clientY, view: [...view] };
    map.setPointerCapture(event.pointerId);
  });
  map.addEventListener('pointermove', (event) => {
    if (!drag) return;
    const matrix = map.getScreenCTM();
    view = [
      drag.view[0] - (event.clientX - drag.x) / matrix.a,
      drag.view[1] - (event.clientY - drag.y) / matrix.d,
      drag.view[2],
      drag.view[3],
    ];
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
  map.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      cancelAnimationFrame(animationFrame);
      const factor = Math.exp(Math.max(-1, Math.min(1, event.deltaY * 0.002)));
      if (view[2] * factor < 0.15 || view[2] * factor > 500) return;
      const point = map.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const position = point.matrixTransform(map.getScreenCTM().inverse());
      view = [
        position.x + (view[0] - position.x) * factor,
        position.y + (view[1] - position.y) * factor,
        view[2] * factor,
        view[3] * factor,
      ];
      map.setAttribute('viewBox', view.join(' '));
      renderPins(matches());
    },
    { passive: false }
  );
  document.addEventListener('languagechange', () => render());
  new ResizeObserver(() => renderPins(matches())).observe(map);
  Promise.all(
    [
      '/assets/maps/natural-earth-admin-0-50m.svg',
      '/assets/maps/natural-earth-france-rivers.svg',
    ].map((url) =>
      fetch(url, { method: 'HEAD' }).then((response) => {
        if (!response.ok) throw new Error('Unavailable map asset');
      })
    )
  ).catch(() => {
    root.querySelector('#map-error').hidden = false;
  });
  layout.dataset.mobileView = 'list';
  render();
})();
