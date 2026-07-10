(function () {
  const root = document.querySelector('[data-projection-lab]');
  if (!root) return;

  const sceneHost = root.querySelector('[data-scene]');
  const plotCanvas = root.querySelector('[data-projection-canvas]');
  const plotCtx = plotCanvas.getContext('2d');
  const datasetSelect = root.querySelector('[data-dataset-select]');
  const yawInput = root.querySelector('[data-yaw]');
  const pitchInput = root.querySelector('[data-pitch]');
  const yawValue = root.querySelector('[data-yaw-value]');
  const pitchValue = root.querySelector('[data-pitch-value]');
  const userVariance = root.querySelector('[data-user-variance]');
  const pcaVariance = root.querySelector('[data-pca-variance]');
  const axisAngle = root.querySelector('[data-axis-angle]');
  const intuitionScore = root.querySelector('[data-intuition-score]');
  const observation = root.querySelector('[data-observation]');
  const viewLabel = root.querySelector('[data-view-label]');
  const answerState = root.querySelector('[data-answer-state]');
  const answerButton = root.querySelector('[data-pca-view]');
  const scenePanel = root.querySelector('.projection-panel--scene');

  const state = {
    seed: 7,
    dataset: window.location.hash === '#curve' ? 'curve' : 'clusters',
    points: [],
    centered: [],
    colors: [],
    jitter: [],
    yaw: 38,
    pitch: 22,
    basis: null,
    pca: null,
    revealed: false,
    dragging: false,
    lastPointer: null,
  };

  const three = {
    renderer: null,
    scene: null,
    camera: null,
    pointCloud: null,
    cube: null,
    axis: null,
    pcaAxis: null,
    raf: 0,
  };

  init();

  function init() {
    if (!window.THREE) {
      scenePanel.classList.add('is-loading');
      observation.textContent =
        'Three.js を読み込めませんでした。ネットワーク接続を確認してください。';
      return;
    }

    initThree();
    datasetSelect.value = state.dataset;
    wireControls();
    regenerate();
    resize();
    window.addEventListener('resize', resize);
    animate();
  }

  function initThree() {
    three.scene = new THREE.Scene();
    three.scene.background = new THREE.Color(readCssColor('--bg', '#ffffff'));

    three.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
    three.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    three.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    sceneHost.appendChild(three.renderer.domElement);

    const cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cubeEdges = new THREE.EdgesGeometry(cubeGeometry);
    three.cube = new THREE.LineSegments(
      cubeEdges,
      new THREE.LineBasicMaterial({ color: 0x8a8f98, transparent: true, opacity: 0.62 })
    );
    three.scene.add(three.cube);

    const axisMaterialX = new THREE.LineBasicMaterial({ color: 0xd65f2e });
    const axisMaterialY = new THREE.LineBasicMaterial({ color: 0x0fa76e });
    const axisMaterialZ = new THREE.LineBasicMaterial({ color: 0x3b73d9 });
    three.scene.add(axisLine([-1.16, -1.16, -1.16], [1.16, -1.16, -1.16], axisMaterialX));
    three.scene.add(axisLine([-1.16, -1.16, -1.16], [-1.16, 1.16, -1.16], axisMaterialY));
    three.scene.add(axisLine([-1.16, -1.16, -1.16], [-1.16, -1.16, 1.16], axisMaterialZ));

    three.axis = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x0fa76e, transparent: true, opacity: 0.9 })
    );
    three.scene.add(three.axis);

    three.pcaAxis = new THREE.LineSegments(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xd65f2e, transparent: true, opacity: 0.9 })
    );
    three.pcaAxis.visible = false;
    three.scene.add(three.pcaAxis);
  }

  function axisLine(a, b, material) {
    return new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...a), new THREE.Vector3(...b)]),
      material
    );
  }

  function wireControls() {
    datasetSelect.addEventListener('change', () => {
      state.dataset = datasetSelect.value;
      state.seed += 17;
      state.revealed = false;
      regenerate();
    });

    root.querySelector('[data-reroll]').addEventListener('click', () => {
      state.seed += 101;
      state.revealed = false;
      regenerate();
    });

    root.querySelector('[data-reset-view]').addEventListener('click', () => {
      setAngles(38, 22);
      state.basis = basisFromAngles(state.yaw, state.pitch);
      updateAll();
    });

    answerButton.addEventListener('click', () => {
      state.revealed = true;
      updateAll('user');
    });

    [yawInput, pitchInput].forEach((input) => {
      input.addEventListener('input', () => {
        state.yaw = Number(yawInput.value);
        state.pitch = Number(pitchInput.value);
        state.basis = basisFromAngles(state.yaw, state.pitch);
        updateAll('user');
      });
    });

    sceneHost.addEventListener('pointerdown', (event) => {
      state.dragging = true;
      state.lastPointer = { x: event.clientX, y: event.clientY };
      sceneHost.setPointerCapture(event.pointerId);
    });

    sceneHost.addEventListener('pointermove', (event) => {
      if (!state.dragging || !state.lastPointer) return;
      const dx = event.clientX - state.lastPointer.x;
      const dy = event.clientY - state.lastPointer.y;
      state.lastPointer = { x: event.clientX, y: event.clientY };
      setAngles(state.yaw + dx * 0.45, state.pitch + dy * 0.32);
      state.basis = basisFromAngles(state.yaw, state.pitch);
      updateAll('user');
    });

    sceneHost.addEventListener('pointerup', (event) => {
      state.dragging = false;
      state.lastPointer = null;
      sceneHost.releasePointerCapture(event.pointerId);
    });
  }

  function regenerate() {
    const generated = makeDataset(state.dataset, state.seed);
    state.points = generated.points;
    state.colors = generated.colors;
    const jitterRandom = mulberry32(state.seed + 999);
    state.jitter = state.points.map(() => jitterRandom() * 2 - 1);
    state.centered = centerPoints(state.points);
    state.pca = computePca(state.centered);
    state.basis = basisFromAngles(state.yaw, state.pitch);
    updatePointCloud();
    updateAll('user');
  }

  function updatePointCloud() {
    if (three.pointCloud) {
      three.scene.remove(three.pointCloud);
      three.pointCloud.geometry.dispose();
      three.pointCloud.material.dispose();
    }

    const positions = [];
    const colors = [];
    state.points.forEach((point, index) => {
      positions.push(point[0], point[1], point[2]);
      colors.push(...state.colors[index]);
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 5.5,
      vertexColors: true,
      sizeAttenuation: false,
    });
    three.pointCloud = new THREE.Points(geometry, material);
    three.scene.add(three.pointCloud);
  }

  function updateAll(mode) {
    syncControls();
    updateCameraAndAxes();
    drawProjection();
    updateMetrics();
    viewLabel.textContent = mode === 'pca' ? 'PCA の軸' : '直感の軸';
    answerState.textContent = state.revealed ? '直感 vs PCA' : '正解は非表示';
    answerButton.textContent = state.revealed ? '正解を表示中' : '正解を見る';
  }

  function syncControls() {
    yawInput.value = String(Math.round(state.yaw));
    pitchInput.value = String(Math.round(state.pitch));
    yawValue.value = `${Math.round(state.yaw)} deg`;
    pitchValue.value = `${Math.round(state.pitch)} deg`;
  }

  function updateCameraAndAxes() {
    const b = state.basis;
    const aspect = Math.max(sceneHost.clientWidth / Math.max(sceneHost.clientHeight, 1), 0.5);
    const viewSize = 3.15;
    three.camera.left = (-viewSize * aspect) / 2;
    three.camera.right = (viewSize * aspect) / 2;
    three.camera.top = viewSize / 2;
    three.camera.bottom = -viewSize / 2;
    three.camera.position.set(b.n[0] * 4.2, b.n[1] * 4.2, b.n[2] * 4.2);
    three.camera.up.set(b.v[0], b.v[1], b.v[2]);
    three.camera.lookAt(0, 0, 0);
    three.camera.updateProjectionMatrix();

    setAxisGeometry(three.axis, b.u, b.v);
    if (state.pca) {
      setAxisGeometry(three.pcaAxis, state.pca.u, perpendicular(state.pca.u));
    }
    three.pcaAxis.visible = state.revealed;
  }

  function setAxisGeometry(line, direction, tickDirection) {
    const s = 1.7;
    const positions = [...scale(direction, -s), ...scale(direction, s)];
    [-1, -0.5, 0.5, 1].forEach((t) => {
      const p = scale(direction, t);
      positions.push(...add(p, scale(tickDirection, -0.06)), ...add(p, scale(tickDirection, 0.06)));
    });
    line.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    line.geometry.attributes.position.needsUpdate = true;
    line.geometry.computeBoundingSphere();
  }

  function drawProjection() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const box = plotCanvas.getBoundingClientRect();
    const width = Math.max(320, Math.floor(box.width * ratio));
    const height = Math.max(280, Math.floor(box.height * ratio));
    if (plotCanvas.width !== width || plotCanvas.height !== height) {
      plotCanvas.width = width;
      plotCanvas.height = height;
    }
    plotCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const cssWidth = width / ratio;
    const cssHeight = height / ratio;
    plotCtx.clearRect(0, 0, cssWidth, cssHeight);
    plotCtx.fillStyle = readCssColor('--surface', '#ffffff');
    plotCtx.fillRect(0, 0, cssWidth, cssHeight);

    const gap = 20;
    const panelW = (cssWidth - gap * 3) / 2;
    const panelH = cssHeight - 40;
    const userProjected = project(state.centered, state.basis.u);
    const pcaProjected = project(state.centered, state.pca.u);
    const maxAbs = Math.max(
      0.75,
      ...userProjected.map((value) => Math.abs(value)),
      ...pcaProjected.map((value) => Math.abs(value))
    );
    drawPlot(
      { x: gap, y: 20, w: panelW, h: panelH },
      userProjected,
      'あなたの射影',
      readCssColor('--accent', '#0fa76e'),
      maxAbs
    );
    const answerRect = { x: gap * 2 + panelW, y: 20, w: panelW, h: panelH };
    if (state.revealed) {
      drawPlot(answerRect, pcaProjected, 'PCA の射影', '#d65f2e', maxAbs);
    } else {
      drawHiddenPlot(answerRect);
    }
  }

  function drawPlot(rect, projected, title, color, maxAbs) {
    const { x, y, w, h } = rect;
    plotCtx.save();
    roundedRect(x, y, w, h, 8);
    plotCtx.fillStyle = colorMixSurface();
    plotCtx.fill();
    plotCtx.strokeStyle = readCssColor('--border-medium', 'rgba(0,0,0,.08)');
    plotCtx.stroke();

    const scaleFactor = (0.44 * w) / maxAbs;
    const cx = x + w / 2;
    const cy = y + h / 2 + 8;

    plotCtx.strokeStyle = readCssColor('--border-medium', 'rgba(0,0,0,.08)');
    plotCtx.lineWidth = 1;
    plotCtx.beginPath();
    plotCtx.moveTo(x + 12, cy);
    plotCtx.lineTo(x + w - 12, cy);
    plotCtx.moveTo(cx, cy - 6);
    plotCtx.lineTo(cx, cy + 6);
    plotCtx.stroke();

    projected.forEach((value, index) => {
      plotCtx.beginPath();
      plotCtx.fillStyle = rgbFromUnit(state.colors[index], 0.74);
      plotCtx.arc(
        cx + value * scaleFactor,
        cy + state.jitter[index] * h * 0.16,
        3.1,
        0,
        Math.PI * 2
      );
      plotCtx.fill();
    });

    plotCtx.fillStyle = readCssColor('--primary', '#111111');
    plotCtx.font = '700 14px Inter, system-ui, sans-serif';
    plotCtx.fillText(title, x + 14, y + 24);
    plotCtx.fillStyle = color;
    plotCtx.fillRect(x + 14, y + 32, 38, 3);
    plotCtx.restore();
  }

  function drawHiddenPlot(rect) {
    const { x, y, w, h } = rect;
    plotCtx.save();
    roundedRect(x, y, w, h, 8);
    plotCtx.fillStyle = colorMixSurface();
    plotCtx.fill();
    plotCtx.strokeStyle = readCssColor('--border-medium', 'rgba(0,0,0,.08)');
    plotCtx.stroke();

    plotCtx.fillStyle = readCssColor('--primary', '#111111');
    plotCtx.font = '700 14px Inter, system-ui, sans-serif';
    plotCtx.fillText('PCA の射影', x + 14, y + 24);
    plotCtx.fillStyle = '#d65f2e';
    plotCtx.fillRect(x + 14, y + 32, 38, 3);

    plotCtx.fillStyle = readCssColor('--text-muted', '#666666');
    plotCtx.font = '700 15px Inter, system-ui, sans-serif';
    plotCtx.textAlign = 'center';
    plotCtx.fillText('正解を見るまで非表示', x + w / 2, y + h / 2 - 6);
    plotCtx.font = '500 12px Inter, system-ui, sans-serif';
    plotCtx.fillText('左の射影を調整してから確認', x + w / 2, y + h / 2 + 18);
    plotCtx.restore();
  }

  function updateMetrics() {
    const userRetained = retainedVariance(state.centered, state.basis.u, state.pca.total);
    const pcaRetained = state.pca.values[0] / state.pca.total || 0;
    const angle = axisAngleDeg(state.basis.u, state.pca.u);
    const score = Math.round(
      clamp((1 - angle / 90) * 82 + (userRetained / pcaRetained) * 18, 0, 100)
    );

    if (!state.revealed) {
      userVariance.textContent = '--';
      pcaVariance.textContent = '--';
      axisAngle.textContent = '--';
      intuitionScore.textContent = '--';
      observation.textContent =
        '左の 3D キューブを動かして、点群が最も広がって見える軸（画面の横方向）を先に選んでください。正解を見ると PCA の第 1 主成分とスコアを表示します。';
      return;
    }

    userVariance.textContent = formatPercent(userRetained);
    pcaVariance.textContent = formatPercent(pcaRetained);
    axisAngle.textContent = `${angle.toFixed(1)} deg`;
    intuitionScore.textContent = String(score);

    if (angle < 8) {
      observation.textContent =
        '直感の軸は第 1 主成分とほぼ一致しています。点群の最大の広がりをかなり正確に捉えています。';
    } else if (userRetained > pcaRetained * 0.92) {
      observation.textContent =
        '第 1 主成分とは向きが少し違いますが、失っている分散は小さい状態です。分散がほぼ同じ軸が複数ある点群です。';
    } else if (state.dataset === 'clusters') {
      observation.textContent =
        'PCA は全体の分散を優先します。塊の分離が見やすい軸と、分散が最大の軸はずれることがあります。';
    } else {
      observation.textContent =
        '軸の向きを少し変えるだけで保持分散が変わります。PCA はこの探索を分散最大化として自動で解いています。';
    }
  }

  function animate() {
    three.raf = requestAnimationFrame(animate);
    three.renderer.render(three.scene, three.camera);
  }

  function resize() {
    if (!three.renderer) return;
    const width = Math.max(sceneHost.clientWidth, 320);
    const height = Math.max(sceneHost.clientHeight, 320);
    three.renderer.setSize(width, height, false);
    updateCameraAndAxes();
    drawProjection();
  }

  function makeDataset(kind, seed) {
    const random = mulberry32(seed);
    const points = [];
    const colors = [];
    const n = 180;

    for (let i = 0; i < n; i += 1) {
      let point;
      let colorKey = i / Math.max(n - 1, 1);
      if (kind === 'clusters') {
        const centers = [
          [-0.72, -0.5, 0.16],
          [0.74, -0.32, -0.18],
          [0.02, 0.74, 0.08],
        ];
        const c = i % centers.length;
        const base = centers[c];
        point = [
          base[0] + gaussian(random) * 0.1,
          base[1] + gaussian(random) * 0.1,
          base[2] + gaussian(random) * 0.07,
        ];
        colorKey = c / 2;
      } else {
        const t = random() * Math.PI * 2;
        const r = 0.64 + gaussian(random) * 0.05;
        const height = (t / Math.PI - 1) * 0.52;
        point = [
          Math.cos(t) * r + gaussian(random) * 0.04,
          Math.sin(t) * r * 0.72 + gaussian(random) * 0.04,
          height + gaussian(random) * 0.05,
        ];
        colorKey = t / (Math.PI * 2);
      }
      points.push(point.map((value) => clamp(value, -1, 1)));
      colors.push(colorRamp(colorKey));
    }

    return { points, colors };
  }

  function computePca(points) {
    const cov = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];
    points.forEach((p) => {
      for (let r = 0; r < 3; r += 1) {
        for (let c = 0; c < 3; c += 1) cov[r][c] += p[r] * p[c];
      }
    });
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) cov[r][c] /= Math.max(points.length - 1, 1);
    }

    const eig = jacobiEigen(cov).sort((a, b) => b.value - a.value);
    let u = normalize(eig[0].vector);
    let v = normalize(reject(eig[1].vector, u));
    if (length(v) < 1e-6) v = perpendicular(u);
    let n = normalize(cross(u, v));
    v = normalize(cross(n, u));
    return {
      u,
      v,
      n,
      values: eig.map((entry) => Math.max(entry.value, 0)),
      total: Math.max(cov[0][0] + cov[1][1] + cov[2][2], 1e-9),
    };
  }

  function jacobiEigen(matrix) {
    const a = matrix.map((row) => row.slice());
    const v = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];

    for (let iter = 0; iter < 40; iter += 1) {
      let p = 0;
      let q = 1;
      let max = Math.abs(a[0][1]);
      [
        [0, 2],
        [1, 2],
      ].forEach(([r, c]) => {
        const value = Math.abs(a[r][c]);
        if (value > max) {
          max = value;
          p = r;
          q = c;
        }
      });
      if (max < 1e-10) break;

      const theta = (a[q][q] - a[p][p]) / (2 * a[p][q]);
      const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
      const cos = 1 / Math.sqrt(t * t + 1);
      const sin = t * cos;
      const app = a[p][p];
      const aqq = a[q][q];
      const apq = a[p][q];
      a[p][p] = cos * cos * app - 2 * sin * cos * apq + sin * sin * aqq;
      a[q][q] = sin * sin * app + 2 * sin * cos * apq + cos * cos * aqq;
      a[p][q] = 0;
      a[q][p] = 0;

      for (let k = 0; k < 3; k += 1) {
        if (k !== p && k !== q) {
          const akp = a[k][p];
          const akq = a[k][q];
          a[k][p] = cos * akp - sin * akq;
          a[p][k] = a[k][p];
          a[k][q] = sin * akp + cos * akq;
          a[q][k] = a[k][q];
        }
        const vkp = v[k][p];
        const vkq = v[k][q];
        v[k][p] = cos * vkp - sin * vkq;
        v[k][q] = sin * vkp + cos * vkq;
      }
    }

    return [0, 1, 2].map((index) => ({
      value: a[index][index],
      vector: [v[0][index], v[1][index], v[2][index]],
    }));
  }

  function setAngles(yaw, pitch) {
    state.yaw = normalizeDeg(yaw);
    state.pitch = normalizeDeg(pitch);
  }

  function basisFromAngles(yawDeg, pitchDeg) {
    const yaw = degToRad(yawDeg);
    const pitch = degToRad(pitchDeg);
    const rotate = (vector) => rotateX(rotateY(vector, yaw), pitch);
    const u = normalize(rotate([1, 0, 0]));
    const v = normalize(rotate([0, 1, 0]));
    const n = normalize(rotate([0, 0, 1]));
    return { u, v, n };
  }

  function project(points, axis) {
    return points.map((point) => dot(point, axis));
  }

  function retainedVariance(points, axis, total) {
    let sum = 0;
    points.forEach((point) => {
      const x = dot(point, axis);
      sum += x * x;
    });
    return sum / Math.max(points.length - 1, 1) / total;
  }

  function axisAngleDeg(a, b) {
    const cosine = Math.abs(dot(normalize(a), normalize(b)));
    return radToDeg(Math.acos(clamp(cosine, -1, 1)));
  }

  function centerPoints(points) {
    const mean = [0, 0, 0];
    points.forEach((point) => {
      mean[0] += point[0];
      mean[1] += point[1];
      mean[2] += point[2];
    });
    mean[0] /= points.length;
    mean[1] /= points.length;
    mean[2] /= points.length;
    return points.map((point) => [point[0] - mean[0], point[1] - mean[1], point[2] - mean[2]]);
  }

  function colorRamp(t) {
    const stops = [
      [0.02, 0.32, 0.88],
      [0.0, 0.55, 0.32],
      [0.82, 0.28, 0.08],
    ];
    const scaled = clamp(t, 0, 1) * 2;
    const i = Math.min(1, Math.floor(scaled));
    const local = scaled - i;
    return stops[i].map((value, channel) => value * (1 - local) + stops[i + 1][channel] * local);
  }

  function rgbFromUnit(color, alpha) {
    return `rgba(${Math.round(color[0] * 255)}, ${Math.round(color[1] * 255)}, ${Math.round(color[2] * 255)}, ${alpha})`;
  }

  function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
  }

  function roundedRect(x, y, width, height, radius) {
    plotCtx.beginPath();
    plotCtx.moveTo(x + radius, y);
    plotCtx.arcTo(x + width, y, x + width, y + height, radius);
    plotCtx.arcTo(x + width, y + height, x, y + height, radius);
    plotCtx.arcTo(x, y + height, x, y, radius);
    plotCtx.arcTo(x, y, x + width, y, radius);
    plotCtx.closePath();
  }

  function colorMixSurface() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? '#181818' : '#fbfbfa';
  }

  function readCssColor(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gaussian(random) {
    const u = Math.max(random(), 1e-9);
    const v = Math.max(random(), 1e-9);
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  }

  function add(a, b) {
    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }

  function scale(a, s) {
    return [a[0] * s, a[1] * s, a[2] * s];
  }

  function rotateX(a, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [a[0], a[1] * c - a[2] * s, a[1] * s + a[2] * c];
  }

  function rotateY(a, angle) {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [a[0] * c + a[2] * s, a[1], -a[0] * s + a[2] * c];
  }

  function length(a) {
    return Math.sqrt(dot(a, a));
  }

  function normalize(a) {
    const l = length(a) || 1;
    return [a[0] / l, a[1] / l, a[2] / l];
  }

  function reject(a, direction) {
    return add(a, scale(direction, -dot(a, direction)));
  }

  function perpendicular(a) {
    return normalize(Math.abs(a[0]) < 0.9 ? cross(a, [1, 0, 0]) : cross(a, [0, 1, 0]));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function normalizeDeg(value) {
    let result = value;
    while (result > 180) result -= 360;
    while (result < -180) result += 360;
    return result;
  }

  function degToRad(value) {
    return (value * Math.PI) / 180;
  }

  function radToDeg(value) {
    return (value * 180) / Math.PI;
  }
})();
