/* etagere-scene.jsx — stainless étagère assembly animation (drives three.js from the composition clock) */
const { CompositionStage, Captions, Easing, animate, clamp, useComposition,
        useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakColor } = window;
const { useRef, useEffect, useLayoutEffect, useState } = React;

const MOTION = {
  drop: (T, s, d) => Easing.easeOutCubic(clamp((T - s) / d, 0, 1)),
  pop:  (T, s, d) => { const p = clamp((T - s) / d, 0, 1); return p <= 0 ? 0 : Easing.easeOutBack(p); },
  glide: (pts) => (T) => {
    if (T <= pts[0][0]) return pts[0][1];
    for (let i = 1; i < pts.length; i++) {
      if (T < pts[i][0]) {
        const a = pts[i - 1], b = pts[i];
        return a[1] + (b[1] - a[1]) * Easing.easeInOutSine((T - a[0]) / (b[0] - a[0]));
      }
    }
    return pts[pts.length - 1][1];
  }
};

const CORNERS = ['fl', 'fr', 'bl', 'br'];
function plan(CUES) {
  const P = {};
  CORNERS.forEach((c, i) => P['foot_' + c] = { s: CUES.Feet + 0.15 * i, d: 0.9, drop: 0.4, m: 'drop' });
  P['shelf_lower'] = { s: CUES['Lower shelf'], d: 1.1, drop: 0.55, m: 'drop' };
  CORNERS.forEach((c, i) => P['collar_above_lower_' + c] = { s: CUES['Lower shelf'] + 1.2 + 0.12 * i, d: 0.55, drop: 0.12, m: 'pop' });
  CORNERS.forEach((c, i) => P['post_lower_' + c] = { s: CUES['Lower posts'] + 0.15 * i, d: 0.9, drop: 0.5, m: 'drop' });
  CORNERS.forEach((c, i) => P['collar_below_middle_' + c] = { s: CUES['Middle shelf'] + 0.12 * i, d: 0.5, drop: 0.1, m: 'pop' });
  P['shelf_middle'] = { s: CUES['Middle shelf'] + 0.7, d: 1.1, drop: 0.55, m: 'drop' };
  CORNERS.forEach((c, i) => P['collar_above_middle_' + c] = { s: CUES['Middle shelf'] + 1.85 + 0.1 * i, d: 0.45, drop: 0.1, m: 'pop' });
  CORNERS.forEach((c, i) => P['post_upper_' + c] = { s: CUES['Upper posts'] + 0.15 * i, d: 0.9, drop: 0.5, m: 'drop' });
  CORNERS.forEach((c, i) => P['collar_below_upper_' + c] = { s: CUES['Upper shelf'] + 0.12 * i, d: 0.5, drop: 0.1, m: 'pop' });
  P['shelf_upper'] = { s: CUES['Upper shelf'] + 0.7, d: 1.1, drop: 0.55, m: 'drop' };
  CORNERS.forEach((c, i) => P['finial_' + c] = { s: CUES.Finials + 0.15 * i, d: 0.6, drop: 0.15, m: 'pop' });
  return P;
}

function makeEnv(renderer) {
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#e6e5e2'); grad.addColorStop(0.48, '#b5b2ac');
  grad.addColorStop(0.52, '#5c5955'); grad.addColorStop(1, '#2c2b29');
  g.fillStyle = grad; g.fillRect(0, 0, 512, 256);
  // soft horizontal bands = streaky reflections that read as brushed metal
  g.fillStyle = 'rgba(255,255,255,0.25)';
  [70, 96, 150, 176].forEach(y => g.fillRect(0, y, 512, 7));
  g.fillStyle = 'rgba(40,40,40,0.18)';
  [84, 138, 190].forEach(y => g.fillRect(0, y, 512, 5));
  g.fillStyle = 'rgba(255,255,255,0.92)';
  [50, 180, 320, 450].forEach(x => g.fillRect(x, 16, 24, 116));
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromEquirectangular(tex).texture;
  pm.dispose(); tex.dispose();
  return env;
}

function createStage(mount) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setSize(1080, 1920); renderer.setPixelRatio(1);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
  mount.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.environment = makeEnv(renderer);
  const camera = new THREE.PerspectiveCamera(44, 1080 / 1920, 0.05, 50);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8f94, 0.35));
  const dir = new THREE.DirectionalLight(0xffffff, 0.95);
  dir.position.set(1.6, 3, 1.4); dir.castShadow = true;
  dir.shadow.mapSize.set(2048, 2048);
  const sc = dir.shadow.camera;
  sc.left = -1; sc.right = 1; sc.top = 1; sc.bottom = -1; sc.near = 0.5; sc.far = 8;
  dir.shadow.radius = 6; dir.shadow.bias = -0.0004;
  scene.add(dir);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.ShadowMaterial({ opacity: 0.16 }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
  scene.add(floor);
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.04, depthWrite: false });
  return { renderer, scene, camera, floor, ghostMat, meshes: null, ghosts: new Map() };
}

function buildModel(st, txt) {
  const obj = new THREE.OBJLoader().parse(txt);
  const mats = {
    brushed:  new THREE.MeshStandardMaterial({ color: 0x8f8b85, metalness: 0.88, roughness: 0.42 }),
    polished: new THREE.MeshStandardMaterial({ color: 0xa9a5a0, metalness: 1.0, roughness: 0.16 }),
    satin:    new THREE.MeshStandardMaterial({ color: 0x827e78, metalness: 0.92, roughness: 0.32 })
  };
  const src = [];
  obj.traverse(ch => { if (ch.isMesh) src.push(ch); });
  const group = new THREE.Group(), ghostGroup = new THREE.Group();
  const meshes = [];
  for (const ch of src) {
    const geo = ch.geometry;
    if (!geo.attributes.normal) geo.computeVertexNormals();
    geo.computeBoundingBox();
    const c = new THREE.Vector3(); geo.boundingBox.getCenter(c);
    geo.translate(-c.x, -c.y, -c.z);
    const base = ch.name.startsWith('shelf') ? mats.brushed : ch.name.startsWith('post') ? mats.polished : mats.satin;
    const mat = base.clone(); mat.transparent = true;
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = ch.name; mesh.position.copy(c);
    mesh.userData.baseY = c.y;
    mesh.castShadow = true; mesh.visible = false;
    group.add(mesh); meshes.push(mesh);
    const ghost = new THREE.Mesh(geo, st.ghostMat);
    ghost.position.copy(c); ghost.visible = false;
    ghostGroup.add(ghost); st.ghosts.set(mesh.name, ghost);
  }
  st.scene.add(group); st.scene.add(ghostGroup);
  st.meshes = meshes;
}

function renderAt(st, T, CUES, total, dark, shadows) {
  st.floor.visible = !!shadows;
  const P = plan(CUES);
  st.ghostMat.color.set(dark ? 0xffffff : 0x000000);
  for (const m of st.meshes) {
    const p = P[m.name];
    if (!p) { m.visible = true; continue; }
    const started = T > p.s;
    const e = p.m === 'pop' ? MOTION.pop(T, p.s, p.d) : MOTION.drop(T, p.s, p.d);
    m.visible = started;
    const g = st.ghosts.get(m.name);
    if (g) g.visible = T > 0.45 && e < 1;
    if (!started) continue;
    if (p.m === 'pop') {
      const sc = Math.max(0.001, e);
      m.scale.set(sc, sc, sc);
      m.position.y = m.userData.baseY + p.drop * (1 - clamp(e, 0, 1));
    } else {
      m.scale.set(1, 1, 1);
      m.position.y = m.userData.baseY + p.drop * (1 - e);
    }
    const op = clamp((T - p.s) / (p.d * 0.35), 0, 1);
    m.material.opacity = op;
    if (m.material.transparent !== (op < 1)) { m.material.transparent = op < 1; m.material.needsUpdate = true; }
  }
  const focus = MOTION.glide([[0, 0.32], [CUES.Feet, 0.08], [CUES['Lower posts'], 0.24], [CUES['Middle shelf'], 0.40],
    [CUES['Upper posts'], 0.56], [CUES['Upper shelf'], 0.70], [CUES.Finials, 0.76], [CUES.Reveal + 1.4, 0.38]])(T);
  const radius = MOTION.glide([[0, 2.1], [CUES.Feet, 1.3], [CUES['Lower shelf'], 1.5], [CUES['Middle shelf'], 1.65], [CUES.Finials, 1.6], [CUES.Reveal + 1.6, 1.9]])(T);
  const az = -0.65 + T * 0.09 + animate({ from: 0, to: 0.9, start: CUES.Reveal, end: total, ease: Easing.easeInOutSine })(T);
  st.camera.position.set(Math.sin(az) * radius, focus + 0.30 + radius * 0.10, Math.cos(az) * radius);
  st.camera.lookAt(0, focus, 0);
  st.renderer.render(st.scene, st.camera);
}

function Piece({ dark, shadows }) {
  const { T, CUES, authoredTotal } = useComposition();
  const hostRef = useRef(null), stRef = useRef(null);
  const [, force] = useState(0);
  useEffect(() => {
    let dead = false;
    const st = createStage(hostRef.current);
    stRef.current = st;
    // The stage can measure its container before layout settles; nudge a remeasure.
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    fetch('./stainless-etagere.obj').then(r => r.text()).then(txt => {
      if (dead) return;
      buildModel(st, txt);
      force(x => x + 1);
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    });
    return () => {
      dead = true;
      st.renderer.dispose();
      if (st.renderer.domElement.parentNode) st.renderer.domElement.parentNode.removeChild(st.renderer.domElement);
    };
  }, []);
  useLayoutEffect(() => {
    const st = stRef.current;
    if (st && st.meshes) renderAt(st, T, CUES, authoredTotal, dark, shadows);
    const root = document.querySelector('[data-om-exportable-video-with-duration-secs]');
    if (root) root.setAttribute('data-screen-label', 't=' + Math.round(T) + 's');
  });
  const ink = dark ? '#f0efec' : '#1b1c1d';
  const sub = dark ? 'rgba(240,239,236,0.55)' : 'rgba(27,28,29,0.5)';
  const font = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  return (
    <div style={{ position: 'absolute', inset: 0, fontFamily: font }}>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }}></div>
    </div>
  );
}

window.EtagereAnimation = function EtagereAnimation() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const dark = t.background === '#16171a';
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CompositionStage width={1080} height={1920} scenes={window.OM_SCENES} playback={window.OM_PLAYBACK} bg={t.background}>
        <Piece dark={dark} shadows={t.shadows} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Video" />
        <TweakColor label="Backdrop" value={t.background} options={['#edeae5', '#e6e9ec', '#16171a']} onChange={v => setTweak('background', v)} />
        <TweakToggle label="Shadows" value={t.shadows} onChange={v => setTweak('shadows', v)} />
        <TweakSection label="Editing" />
        <TweakToggle label="Motion editor" value={t.motionEditor} onChange={v => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </div>
  );
};
