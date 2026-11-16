/* Tumbleforge Games: the hero orb.
   A molten core tumbling inside a forged chrome band, drawn with three.js.
   If WebGL or the library is unavailable, the CSS sphere underneath stays. */
(() => {
  'use strict';

  const host = document.querySelector('.orb');
  const canvas = host && host.querySelector('canvas');
  if (!host || !canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cssVar = (name, fallback) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

  const start = async () => {
    let THREE;
    try {
      THREE = await import('three');
    } catch (error) {
      return;
    }

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (error) {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    /* Lighting: a small procedural photo studio, painted into an HDR map.
       Bright ceiling, dark floor, three softboxes and a warm glow from
       below, so the chrome has something to reflect. */
    const makeStudio = () => {
      const W = 256;
      const H = 128;
      const data = new Uint16Array(W * H * 4);
      const half = THREE.DataUtils.toHalfFloat;
      const smooth = (a, b, x) => {
        const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
      };
      const unit = (x, y, z) => {
        const l = Math.hypot(x, y, z);
        return [x / l, y / l, z / l];
      };
      const lights = [
        { d: unit(0.45, 0.75, 0.6), outer: 0.86, inner: 0.97, c: [9, 8.6, 8] }, // key softbox
        { d: unit(-0.85, 0.25, 0.45), outer: 0.88, inner: 0.97, c: [3.2, 3.6, 4.2] }, // cool fill
        { d: unit(-0.2, 0.3, -1), outer: 0.84, inner: 0.95, c: [4.5, 4.6, 5] }, // back rim
        { d: unit(0.15, -1, 0.35), outer: 0.5, inner: 0.96, c: [3.4, 1.3, 0.2] } // forge glow
      ];
      for (let y = 0; y < H; y++) {
        const lat = ((y + 0.5) / H - 0.5) * Math.PI;
        const dy = Math.sin(lat);
        const ring = Math.cos(lat);
        for (let x = 0; x < W; x++) {
          const lon = ((x + 0.5) / W - 0.5) * Math.PI * 2;
          const dx = ring * Math.cos(lon);
          const dz = ring * Math.sin(lon);
          const up = dy * 0.5 + 0.5;
          let base = 0.1 + 1.25 * up * up;
          base *= 0.4 + 0.6 * smooth(0.02, 0.22, Math.abs(dy));
          let r = base;
          let g = base;
          let b = base * 1.04;
          for (const light of lights) {
            const k = smooth(light.outer, light.inner, dx * light.d[0] + dy * light.d[1] + dz * light.d[2]);
            r += light.c[0] * k;
            g += light.c[1] * k;
            b += light.c[2] * k;
          }
          const i = (y * W + x) * 4;
          data[i] = half(r);
          data[i + 1] = half(g);
          data[i + 2] = half(b);
          data[i + 3] = half(1);
        }
      }
      const texture = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.HalfFloatType);
      texture.mapping = THREE.EquirectangularReflectionMapping;
      texture.colorSpace = THREE.LinearSRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      return texture;
    };

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const studio = makeStudio();
    scene.environment = pmrem.fromEquirectangular(studio).texture;
    studio.dispose();
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 40);
    camera.position.z = 9.6;

    const key = new THREE.DirectionalLight(0xfff1dc, 0.9);
    key.position.set(4, 5, 6);
    scene.add(key);

    const rig = new THREE.Group(); // leans toward the pointer
    rig.scale.setScalar(1.06);
    scene.add(rig);

    const V = () => new THREE.Vector3();

    /* Molten core: a sphere pushed into soft lumps -------------------- */
    const bump = (x, y, z) =>
      (0.55 * Math.sin(2.7 * x + 1.3) * Math.cos(2.2 * y - 0.4) +
        0.35 * Math.sin(3.7 * y + 2.9 * z + 0.8) +
        0.3 * Math.sin(4.2 * z - 2.5 * x + 2.1) +
        0.16 * Math.sin(6.3 * x + 5.4 * y + 4.6 * z)) /
      1.36;
    const LUMP = 0.19;
    const surface = (dir, out) => {
      const scale = 1 + LUMP * bump(dir.x, dir.y, dir.z);
      return out.copy(dir).multiplyScalar(scale);
    };

    const coreGeo = new THREE.SphereGeometry(1, 144, 96);
    {
      const pos = coreGeo.attributes.position;
      const nor = coreGeo.attributes.normal;
      const colors = new Float32Array(pos.count * 3);
      const accent = new THREE.Color(cssVar('--accent', '#ffb224'));
      const ember = new THREE.Color(cssVar('--accent-2', '#f2601a'));
      const hot = accent.clone().lerp(new THREE.Color('#ffe08a'), 0.3);
      const mid = accent.clone().lerp(ember, 0.5);
      const deep = ember.clone().multiplyScalar(0.62);
      const tint = new THREE.Color();
      const d = V(), p = V(), t1 = V(), t2 = V(), a = V(), b = V(), n = V();
      const up = new THREE.Vector3(0, 1, 0);
      const side = new THREE.Vector3(1, 0, 0);
      const EPS = 0.004;

      for (let i = 0; i < pos.count; i++) {
        d.fromBufferAttribute(pos, i).normalize();
        surface(d, p);

        // Normal from two nearby points on the lumpy surface.
        t1.crossVectors(d, Math.abs(d.y) > 0.95 ? side : up).normalize();
        t2.crossVectors(d, t1).normalize();
        a.copy(d).addScaledVector(t1, EPS).normalize();
        surface(a, a);
        b.copy(d).addScaledVector(t2, EPS).normalize();
        surface(b, b);
        n.crossVectors(a.sub(p), b.sub(p)).normalize();
        if (n.dot(d) < 0) n.negate();

        pos.setXYZ(i, p.x, p.y, p.z);
        nor.setXYZ(i, n.x, n.y, n.z);

        // Peaks glow hot, valleys sink toward ember.
        const h = bump(d.x, d.y, d.z) * 0.5 + 0.5;
        if (h < 0.5) tint.copy(deep).lerp(mid, h / 0.5);
        else tint.copy(mid).lerp(hot, (h - 0.5) / 0.5);
        colors[i * 3] = tint.r;
        colors[i * 3 + 1] = tint.g;
        colors[i * 3 + 2] = tint.b;
      }
      coreGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
    const core = new THREE.Mesh(
      coreGeo,
      new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.2,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        envMapIntensity: 0.55,
        emissive: new THREE.Color(cssVar('--accent-2', '#f2601a')),
        emissiveIntensity: 0.3
      })
    );
    rig.add(core);

    /* Forged band: a flat chrome strap along a seam-shaped loop ------- */
    const chrome = new THREE.MeshStandardMaterial({ color: 0xf2f4f7, metalness: 1, roughness: 0.12, envMapIntensity: 1 });

    const A = 0.62;
    const B = 0.38;
    const C = 2 * Math.sqrt(A * B);
    const seamPoint = (t, out) =>
      out.set(A * Math.cos(t) + B * Math.cos(3 * t), A * Math.sin(t) - B * Math.sin(3 * t), C * Math.sin(2 * t));

    const bandGeometry = (radius, thickness, widthAt, segments = 520, sides = 28) => {
      const positions = [];
      const normals = [];
      const indices = [];
      const P = V(), Pn = V(), T = V(), R = V(), S = V(), v = V(), nn = V();

      for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * Math.PI * 2;
        seamPoint(t, P);
        seamPoint(t + 0.0015, Pn);
        T.subVectors(Pn, P).normalize();
        R.copy(P).normalize();
        S.crossVectors(R, T).normalize();
        const w = widthAt(t);
        for (let j = 0; j <= sides; j++) {
          const th = (j / sides) * Math.PI * 2;
          const cs = Math.cos(th);
          const sn = Math.sin(th);
          v.copy(P).multiplyScalar(radius).addScaledVector(S, cs * w).addScaledVector(R, sn * thickness);
          nn.set(0, 0, 0).addScaledVector(S, cs / w).addScaledVector(R, sn / thickness).normalize();
          positions.push(v.x, v.y, v.z);
          normals.push(nn.x, nn.y, nn.z);
        }
      }
      const row = sides + 1;
      for (let i = 0; i < segments; i++) {
        for (let j = 0; j < sides; j++) {
          const a0 = i * row + j;
          const b0 = (i + 1) * row + j;
          indices.push(a0, a0 + 1, b0, b0, a0 + 1, b0 + 1);
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      geometry.setIndex(indices);
      return geometry;
    };

    const band = new THREE.Mesh(bandGeometry(1.37, 0.075, (t) => 0.27 + 0.08 * Math.cos(4 * t)), chrome);
    band.rotation.set(0.5, 0.3, 0);
    rig.add(band);

    /* Orbit wires with a few embers riding them ----------------------- */
    const emberMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(cssVar('--accent', '#ffb224')),
      emissive: new THREE.Color(cssVar('--accent-2', '#f2601a')),
      emissiveIntensity: 0.9,
      roughness: 0.3,
      metalness: 0.2
    });
    const wire = (radius, tube, material, rx, ry, beadSize) => {
      const tilt = new THREE.Group();
      tilt.rotation.set(rx, ry, 0);
      const spin = new THREE.Group();
      spin.add(new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 12, 260), material));
      if (beadSize) {
        const bead = new THREE.Mesh(new THREE.SphereGeometry(beadSize, 24, 16), material === chrome ? emberMat : chrome);
        bead.position.set(radius, 0, 0);
        spin.add(bead);
      }
      tilt.add(spin);
      rig.add(tilt);
      return spin;
    };
    const wireA = wire(2.02, 0.013, chrome, 1.22, 0.36, 0.06);
    const wireB = wire(2.2, 0.011, emberMat, 1.02, -0.52, 0.045);
    const wireC = wire(1.86, 0.008, chrome, 1.42, 0.95, 0);

    /* Sizing, pointer, loop ------------------------------------------- */
    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (!running) draw(lastTime);
    };

    const pointer = { x: 0, y: 0 };
    window.addEventListener(
      'pointermove',
      (event) => {
        pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
      },
      { passive: true }
    );

    let lastTime = 0;
    const draw = (time) => {
      lastTime = time;
      const t = time / 1000;
      core.rotation.set(t * 0.11, t * 0.19, 0);
      band.rotation.set(0.5 + t * 0.07, 0.3 - t * 0.13, t * 0.05);
      wireA.rotation.z = t * 0.26;
      wireB.rotation.z = -t * 0.19;
      wireC.rotation.z = t * 0.12;

      rig.rotation.x += (pointer.y * 0.22 - rig.rotation.x) * 0.05;
      rig.rotation.y += (pointer.x * 0.34 - rig.rotation.y) * 0.05;
      rig.rotation.z = window.scrollY * 0.0005;
      rig.position.y = Math.sin(t * 0.8) * 0.05;

      renderer.render(scene, camera);
    };

    let running = false;
    let visible = true;
    const loop = (time) => {
      if (!running) return;
      draw(time);
      requestAnimationFrame(loop);
    };
    const setRunning = (next) => {
      if (next === running) return;
      running = next;
      if (running) requestAnimationFrame(loop);
    };
    const refresh = () => setRunning(visible && !document.hidden && !reduceMotion);

    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(host);
    else window.addEventListener('resize', resize);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        refresh();
      }).observe(host);
    }
    document.addEventListener('visibilitychange', refresh);

    resize();
    draw(4200); // a pleasant still frame, also what reduced-motion visitors see
    host.classList.add('is-live');
    refresh();
  };

  start();
})();
