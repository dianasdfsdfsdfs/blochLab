/**
 * BlochScene — a hand-built Three.js scene for the Bloch sphere.
 *
 * Coordinate convention: the physics uses Bloch coordinates (x, y, z) with
 * |0⟩ at +z. Three.js is "Y-up", so we map Bloch (x, y, z) → Three (y, z, x).
 * That keeps the frame right-handed and puts |0⟩ at the top of the screen.
 */
import * as THREE from 'three'
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import { Line2 } from 'three/addons/lines/Line2.js'
import { LineMaterial } from 'three/addons/lines/LineMaterial.js'
import { LineGeometry } from 'three/addons/lines/LineGeometry.js'

export type Vec3 = [number, number, number]

const toThree = (v: Vec3, s = 1) => new THREE.Vector3(v[1] * s, v[2] * s, v[0] * s)

const PALETTE = {
  violet: new THREE.Color('#7C3AED'),
  purple: new THREE.Color('#A855F7'),
  lilac: new THREE.Color('#C084FC'),
  blue: new THREE.Color('#3B82F6'),
  cyan: new THREE.Color('#22D3EE'),
  white: new THREE.Color('#F7F3FF'),
  deep: new THREE.Color('#2A1670'),
}

export interface BlochSceneOptions {
  /** Lower particle count and pixel ratio — for phones and small embeds. */
  compact?: boolean
  reducedMotion?: boolean
  /** Show the |+⟩, |−⟩, |+i⟩, |−i⟩ labels on the equator. */
  equatorLabels?: boolean
}

function glowTexture(stops: [number, string][], size = 128): THREE.Texture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  for (const [o, col] of stops) g.addColorStop(o, col)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

// ---------------------------------------------------------------- shaders

const glassVertex = /* glsl */ `
  varying vec3 vNormalV;
  varying vec3 vViewDir;
  varying vec3 vObj;
  void main() {
    vObj = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const glassFrontFragment = /* glsl */ `
  uniform vec3 uViolet; uniform vec3 uLilac; uniform vec3 uBlue; uniform vec3 uWhite;
  uniform float uTime; uniform float uFlash;
  varying vec3 vNormalV; varying vec3 vViewDir; varying vec3 vObj;
  void main() {
    vec3 N = normalize(vNormalV);
    vec3 V = normalize(vViewDir);
    float ndv = max(dot(N, V), 0.0);
    float fres = pow(1.0 - ndv, 2.4);

    // Rim colour drifts from blue (bottom) through violet to lilac (top).
    float h = vObj.y * 0.5 + 0.5;
    vec3 rim = mix(uBlue, uViolet, smoothstep(0.0, 0.55, h));
    rim = mix(rim, uLilac, smoothstep(0.55, 1.0, h));
    rim += 0.08 * sin(uTime * 0.6 + vObj.x * 3.0) * uLilac;

    // Two glossy highlights: a sharp key light and a broad soft one.
    vec3 L1 = normalize(vec3(-0.55, 0.75, 0.6));
    vec3 L2 = normalize(vec3(0.7, -0.2, 0.7));
    float spec1 = pow(max(dot(reflect(-L1, N), V), 0.0), 160.0) * 0.7;
    float spec2 = pow(max(dot(reflect(-L2, N), V), 0.0), 9.0) * 0.12;

    vec3 col = rim * (fres * 1.25 + 0.06) + uWhite * (spec1 * 1.1 + spec2);
    col += uLilac * uFlash * (0.25 + fres);
    float alpha = clamp(fres * 0.85 + 0.045 + spec1 * 0.9 + spec2 + uFlash * 0.25, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }
`

const glassBackFragment = /* glsl */ `
  uniform vec3 uViolet; uniform vec3 uBlue; uniform vec3 uDeep; uniform float uTime;
  varying vec3 vNormalV; varying vec3 vViewDir; varying vec3 vObj;
  void main() {
    vec3 N = normalize(vNormalV);
    vec3 V = normalize(vViewDir);
    float ndv = abs(dot(N, V));
    // Slow "plasma" inside the glass — gives the volume a living feel.
    vec3 p = vObj * 2.2;
    float n = sin(p.x * 1.7 + uTime * 0.35) * sin(p.y * 2.1 - uTime * 0.27) * sin(p.z * 1.9 + uTime * 0.21);
    vec3 col = mix(uDeep, uViolet, 0.35 + 0.35 * n);
    col = mix(col, uBlue, smoothstep(0.3, -0.9, vObj.y) * 0.45);
    // soft key light from the upper left gives the volume a sense of depth
    float light = 0.75 + 0.55 * max(dot(normalize(vObj), normalize(vec3(-0.5, 0.75, 0.45))), 0.0);
    col *= light;
    float alpha = 0.10 + 0.10 * pow(ndv, 2.0) + 0.04 * n;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
  }
`

const fadeVertex = /* glsl */ `
  uniform vec3 uCamDir;
  varying float vFront;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vFront = dot(normalize(wp.xyz), uCamDir);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`
const fadeFragment = /* glsl */ `
  uniform vec3 uColor; uniform float uFront; uniform float uBack;
  varying float vFront;
  void main() {
    float a = mix(uBack, uFront, smoothstep(-0.25, 0.25, vFront));
    gl_FragColor = vec4(uColor, a);
  }
`

const arrowVertex = /* glsl */ `
  varying vec3 vNormalV; varying vec3 vViewDir; varying float vT;
  void main() {
    vT = position.y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalV = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const arrowFragment = /* glsl */ `
  uniform vec3 uViolet; uniform vec3 uLilac; uniform vec3 uWhite;
  varying vec3 vNormalV; varying vec3 vViewDir; varying float vT;
  void main() {
    vec3 N = normalize(vNormalV);
    vec3 V = normalize(vViewDir);
    vec3 L = normalize(vec3(-0.4, 0.8, 0.6));
    vec3 base = mix(uViolet, uLilac, smoothstep(0.0, 0.65, vT));
    base = mix(base, uWhite, smoothstep(0.7, 1.0, vT));
    float diff = 0.55 + 0.45 * max(dot(N, L), 0.0);
    float spec = pow(max(dot(reflect(-L, N), V), 0.0), 40.0);
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.0);
    vec3 col = base * diff * 1.15 + uWhite * spec * 0.8 + uLilac * rim * 0.6;
    gl_FragColor = vec4(col, 1.0);
  }
`

const glowShellFragment = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; uniform float uGrad;
  varying vec3 vNormalV; varying vec3 vViewDir; varying float vT;
  void main() {
    float ndv = max(dot(normalize(vNormalV), normalize(vViewDir)), 0.0);
    float a = pow(ndv, 2.2) * uOpacity * mix(1.0, 0.5 + 0.5 * smoothstep(0.0, 1.0, vT), uGrad);
    gl_FragColor = vec4(uColor, a);
  }
`

const particleVertex = /* glsl */ `
  attribute float aSize; attribute float aPhase; attribute vec3 aColor;
  uniform float uTime; uniform float uPixelRatio;
  varying vec3 vColor; varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (6.0 / -mv.z);
    vColor = aColor;
    vAlpha = 0.25 + 0.75 * (0.5 + 0.5 * sin(uTime * 1.2 + aPhase));
  }
`
const particleFragment = /* glsl */ `
  varying vec3 vColor; varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, a * a * vAlpha);
  }
`

// ---------------------------------------------------------------- scene

export class BlochScene {
  private container: HTMLElement
  private renderer: THREE.WebGLRenderer
  private labelRenderer: CSS2DRenderer
  private scene = new THREE.Scene()
  private camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100)
  private lastT = 0
  private elapsed = 0
  private opts: Required<BlochSceneOptions>

  // camera orbit
  private az = 0.68
  private el = 0.3
  private dist = 6
  private velAz = 0
  private velEl = 0
  private dragging = false
  private pointerType = 'mouse'
  private lastX = 0
  private lastY = 0
  private lastInteraction = -10

  // state
  private vector: Vec3 = [0, 0, 1]
  private axis: Vec3 | null = null
  private axisOpacity = 0
  private trail: Vec3[] = []
  private trailOpacity = 0
  private flashT = 10
  private flashPole = 1
  private running = false
  private disposed = false

  // objects
  private camDir = { value: new THREE.Vector3() }
  private uTime = { value: 0 }
  private uFlash = { value: 0 }
  private arrow = new THREE.Group()
  private tipGlow!: THREE.Sprite
  private axisGroup = new THREE.Group()
  private axisMats: THREE.Material[] = []
  private trailLine!: Line2
  private trailMat!: LineMaterial
  private guideToFoot!: THREE.Line
  private guideFromCenter!: THREE.Line
  private latRing!: THREE.LineLoop
  private flashSprite!: THREE.Sprite
  private particles!: THREE.Points
  private labels: { obj: CSS2DObject; pos: THREE.Vector3 }[] = []
  private disposables: { dispose(): void }[] = []
  private resizeObs?: ResizeObserver
  private visObs?: IntersectionObserver
  private visible = true

  constructor(container: HTMLElement, options: BlochSceneOptions = {}) {
    this.container = container
    this.opts = { compact: false, reducedMotion: false, equatorLabels: true, ...options }

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.outputColorSpace = THREE.SRGBColorSpace
    const maxDpr = this.opts.compact ? 1.75 : 2
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr))
    const canvas = this.renderer.domElement
    canvas.classList.add('bloch-canvas')
    canvas.setAttribute('aria-hidden', 'true')
    container.appendChild(canvas)

    this.labelRenderer = new CSS2DRenderer()
    const le = this.labelRenderer.domElement
    le.classList.add('bloch-labels')
    le.style.position = 'absolute'
    le.style.inset = '0'
    le.style.pointerEvents = 'none'
    container.appendChild(le)

    this.build()
    this.bindInput()
    this.resize()

    this.resizeObs = new ResizeObserver(() => this.resize())
    this.resizeObs.observe(container)
    this.visObs = new IntersectionObserver(entries => {
      this.visible = entries[0]?.isIntersecting ?? true
      this.updateLoop()
    })
    this.visObs.observe(container)
    document.addEventListener('visibilitychange', this.updateLoop)
  }

  // ------------------------------------------------------------ public API

  setVector(v: Vec3) {
    this.vector = v
  }
  setAxis(a: Vec3 | null) {
    this.axis = a
    if (a) {
      const dir = toThree(a).normalize()
      this.axisGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
    }
  }
  setTrail(points: Vec3[]) {
    this.trail = points
    if (points.length > 1) this.trailOpacity = 1
    this.rebuildTrail()
  }
  /** Flash the pole the qubit collapsed to (0 = north / |0⟩, 1 = south / |1⟩). */
  flash(outcome: 0 | 1) {
    this.flashPole = outcome === 0 ? 1 : -1
    this.flashT = 0
    this.flashSprite.position.set(0, this.flashPole, 0)
  }

  start() {
    this.running = true
    this.updateLoop()
  }
  stop() {
    this.running = false
    this.updateLoop()
  }

  dispose() {
    this.disposed = true
    this.renderer.setAnimationLoop(null)
    this.resizeObs?.disconnect()
    this.visObs?.disconnect()
    document.removeEventListener('visibilitychange', this.updateLoop)
    const c = this.renderer.domElement
    c.removeEventListener('pointerdown', this.onDown)
    c.removeEventListener('pointermove', this.onMove)
    c.removeEventListener('pointerup', this.onUp)
    c.removeEventListener('pointercancel', this.onUp)
    this.scene.traverse(o => {
      const m = o as THREE.Mesh
      m.geometry?.dispose?.()
      const mat = m.material as THREE.Material | THREE.Material[] | undefined
      if (Array.isArray(mat)) mat.forEach(x => x.dispose())
      else mat?.dispose?.()
    })
    this.disposables.forEach(d => d.dispose())
    this.renderer.dispose()
    c.remove()
    this.labelRenderer.domElement.remove()
  }

  /** Rotate the view a little (keyboard accessibility). */
  nudge(dAz: number, dEl = 0) {
    this.az += dAz
    this.el = THREE.MathUtils.clamp(this.el + dEl, -1.1, 1.25)
    this.lastInteraction = this.elapsed
  }

  // ------------------------------------------------------------ build

  private build() {
    const s = this.scene

    // Halo behind the sphere
    const haloTex = glowTexture([
      [0, 'rgba(124,58,237,0.55)'],
      [0.35, 'rgba(124,58,237,0.22)'],
      [0.7, 'rgba(59,130,246,0.06)'],
      [1, 'rgba(59,130,246,0)'],
    ], 256)
    this.disposables.push(haloTex)
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
    halo.scale.setScalar(4.2)
    halo.renderOrder = -10
    s.add(halo)

    // Floor glow under the sphere — makes it feel like it floats in space
    const floorTex = glowTexture([
      [0, 'rgba(168,85,247,0.55)'],
      [0.4, 'rgba(124,58,237,0.18)'],
      [1, 'rgba(59,130,246,0)'],
    ], 256)
    this.disposables.push(floorTex)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(2.6, 2.6),
      new THREE.MeshBasicMaterial({ map: floorTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -1.38
    floor.renderOrder = -9
    s.add(floor)

    // Glass sphere: inner volume (back faces) + front shell with fresnel rim
    const sphereGeo = new THREE.SphereGeometry(1, 96, 64)
    const back = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({
      vertexShader: glassVertex,
      fragmentShader: glassBackFragment,
      uniforms: { uViolet: { value: PALETTE.violet }, uBlue: { value: PALETTE.blue }, uDeep: { value: PALETTE.deep }, uTime: this.uTime },
      transparent: true, depthWrite: false, side: THREE.BackSide,
    }))
    back.renderOrder = -5
    s.add(back)

    const front = new THREE.Mesh(sphereGeo, new THREE.ShaderMaterial({
      vertexShader: glassVertex,
      fragmentShader: glassFrontFragment,
      uniforms: {
        uViolet: { value: PALETTE.violet }, uLilac: { value: PALETTE.lilac }, uBlue: { value: PALETTE.blue },
        uWhite: { value: PALETTE.white }, uTime: this.uTime, uFlash: this.uFlash,
      },
      transparent: true, depthWrite: false, side: THREE.FrontSide,
    }))
    front.renderOrder = 10
    s.add(front)

    // Grid: meridians + latitudes, brighter on the near side
    const fadeMat = (color: THREE.Color, frontA: number, backA: number) => new THREE.ShaderMaterial({
      vertexShader: fadeVertex, fragmentShader: fadeFragment,
      uniforms: { uCamDir: this.camDir, uColor: { value: color }, uFront: { value: frontA }, uBack: { value: backA } },
      transparent: true, depthWrite: false,
    })
    const circlePts = (n = 128) => Array.from({ length: n }, (_, i) => {
      const t = (i / n) * Math.PI * 2
      return new THREE.Vector3(Math.cos(t), 0, Math.sin(t))
    })
    const gridMat = fadeMat(PALETTE.lilac, 0.2, 0.06)
    const ringGeo = new THREE.BufferGeometry().setFromPoints(circlePts())
    for (let k = 0; k < 6; k++) {
      const m = new THREE.LineLoop(ringGeo, gridMat)
      m.rotation.set(Math.PI / 2, 0, 0)
      m.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), (k / 6) * Math.PI)
      s.add(m)
    }
    for (const lat of [-60, -30, 30, 60]) {
      const r = Math.cos(THREE.MathUtils.degToRad(lat))
      const m = new THREE.LineLoop(ringGeo, gridMat)
      m.scale.set(r, 1, r)
      m.position.y = Math.sin(THREE.MathUtils.degToRad(lat))
      s.add(m)
    }

    // Equator: thin bright torus + soft additive glow
    const eq = new THREE.Mesh(new THREE.TorusGeometry(1, 0.0055, 8, 200), fadeMat(new THREE.Color('#D9C8FF'), 0.9, 0.3))
    eq.rotation.x = Math.PI / 2
    s.add(eq)
    const eqGlow = new THREE.Mesh(new THREE.TorusGeometry(1, 0.03, 8, 200), new THREE.ShaderMaterial({
      vertexShader: fadeVertex, fragmentShader: fadeFragment,
      uniforms: { uCamDir: this.camDir, uColor: { value: PALETTE.purple }, uFront: { value: 0.22 }, uBack: { value: 0.06 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }))
    eqGlow.rotation.x = Math.PI / 2
    s.add(eqGlow)

    // Axes (dashed)
    const axisLine = (v: Vec3, color: THREE.Color, opacity: number) => {
      const g = new THREE.BufferGeometry().setFromPoints([toThree(v, -1.32), toThree(v, 1.32)])
      const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color, dashSize: 0.05, gapSize: 0.04, transparent: true, opacity, depthWrite: false }))
      l.computeLineDistances()
      s.add(l)
    }
    axisLine([1, 0, 0], PALETTE.lilac, 0.4)
    axisLine([0, 1, 0], PALETTE.lilac, 0.4)
    axisLine([0, 0, 1], new THREE.Color('#D9C8FF'), 0.55)

    // Pole dots
    const dotTex = glowTexture([[0, 'rgba(255,255,255,1)'], [0.25, 'rgba(216,200,255,0.8)'], [0.6, 'rgba(168,85,247,0.25)'], [1, 'rgba(168,85,247,0)']])
    this.disposables.push(dotTex)
    for (const y of [1, -1]) {
      const d = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0.8 }))
      d.scale.setScalar(0.16)
      d.position.set(0, y, 0)
      s.add(d)
    }

    // Labels
    const addLabel = (text: string, v: Vec3, cls: string) => {
      const el = document.createElement('div')
      el.className = `bloch-label ${cls}`
      el.textContent = text
      const obj = new CSS2DObject(el)
      const pos = toThree(v)
      obj.position.copy(pos)
      s.add(obj)
      this.labels.push({ obj, pos })
    }
    addLabel('|0⟩', [0, 0, 1.2], 'pole')
    addLabel('|1⟩', [0, 0, -1.2], 'pole')
    if (this.opts.equatorLabels) {
      addLabel('|+⟩', [1.24, 0, 0], 'eq')
      addLabel('|−⟩', [-1.24, 0, 0], 'eq')
      addLabel('|+i⟩', [0, 1.24, 0], 'eq')
      addLabel('|−i⟩', [0, -1.24, 0], 'eq')
    }

    // Projection guides: tip → equatorial plane, centre → foot, latitude ring
    const dashed = (color: THREE.Color, opacity: number) =>
      new THREE.LineDashedMaterial({ color, dashSize: 0.035, gapSize: 0.03, transparent: true, opacity, depthWrite: false })
    this.guideToFoot = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), dashed(PALETTE.cyan, 0.65))
    this.guideFromCenter = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]), dashed(PALETTE.cyan, 0.45))
    s.add(this.guideToFoot, this.guideFromCenter)
    this.latRing = new THREE.LineLoop(ringGeo, new THREE.LineBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0.28, depthWrite: false }))
    s.add(this.latRing)

    // Rotation axis (shown while a gate is acting)
    const axisCore = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 2.9, 12), new THREE.MeshBasicMaterial({ color: PALETTE.cyan, transparent: true, opacity: 0, depthWrite: false }))
    const axisGlow = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.9, 16, 1, true), new THREE.ShaderMaterial({
      vertexShader: arrowVertex, fragmentShader: glowShellFragment,
      uniforms: { uColor: { value: PALETTE.cyan }, uOpacity: { value: 0 }, uGrad: { value: 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }))
    const capTex = glowTexture([[0, 'rgba(255,255,255,1)'], [0.3, 'rgba(34,211,238,0.7)'], [1, 'rgba(34,211,238,0)']])
    this.disposables.push(capTex)
    const capA = new THREE.Sprite(new THREE.SpriteMaterial({ map: capTex, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }))
    const capB = capA.clone()
    capB.material = (capA.material as THREE.SpriteMaterial).clone()
    capA.position.y = 1.45
    capB.position.y = -1.45
    capA.scale.setScalar(0.22)
    capB.scale.setScalar(0.22)
    this.axisGroup.add(axisCore, axisGlow, capA, capB)
    this.axisMats = [axisCore.material, axisGlow.material as THREE.Material, capA.material, capB.material]
    s.add(this.axisGroup)

    // Trail of the arrow tip
    this.trailMat = new LineMaterial({
      linewidth: this.opts.compact ? 2.5 : 3,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      worldUnits: false,
    })
    this.trailLine = new Line2(new LineGeometry(), this.trailMat)
    this.trailLine.visible = false
    this.trailLine.renderOrder = 5
    s.add(this.trailLine)

    // State arrow: gradient shaft + cone head + glow shell + tip sprite
    const HEAD = 0.13
    const SHAFT = 1 - HEAD
    const arrowMat = new THREE.ShaderMaterial({
      vertexShader: arrowVertex, fragmentShader: arrowFragment,
      uniforms: { uViolet: { value: PALETTE.violet }, uLilac: { value: PALETTE.lilac }, uWhite: { value: PALETTE.white } },
    })
    const shaftGeo = new THREE.CylinderGeometry(0.017, 0.017, SHAFT, 24)
    shaftGeo.translate(0, SHAFT / 2, 0)
    const headGeo = new THREE.ConeGeometry(0.052, HEAD, 32)
    headGeo.translate(0, SHAFT + HEAD / 2, 0)
    const shaft = new THREE.Mesh(shaftGeo, arrowMat)
    const head = new THREE.Mesh(headGeo, arrowMat)
    const glowGeo = new THREE.CylinderGeometry(0.07, 0.07, 1, 24, 1, true)
    glowGeo.translate(0, 0.5, 0)
    const glow = new THREE.Mesh(glowGeo, new THREE.ShaderMaterial({
      vertexShader: arrowVertex, fragmentShader: glowShellFragment,
      uniforms: { uColor: { value: PALETTE.lilac }, uOpacity: { value: 0.55 }, uGrad: { value: 1 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }))
    shaft.renderOrder = head.renderOrder = 6
    glow.renderOrder = 7
    this.arrow.add(shaft, head, glow)
    s.add(this.arrow)

    const tipTex = glowTexture([[0, 'rgba(255,255,255,1)'], [0.18, 'rgba(240,226,255,0.9)'], [0.45, 'rgba(192,132,252,0.35)'], [1, 'rgba(124,58,237,0)']])
    this.disposables.push(tipTex)
    this.tipGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: tipTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
    this.tipGlow.scale.setScalar(0.5)
    this.tipGlow.renderOrder = 8
    s.add(this.tipGlow)

    const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }))
    core.scale.setScalar(0.12)
    s.add(core)

    // Measurement flash
    this.flashSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tipTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }))
    this.flashSprite.renderOrder = 9
    s.add(this.flashSprite)

    // Quantum dust
    const count = this.opts.compact ? 260 : 520
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const size = new Float32Array(count)
    const phase = new Float32Array(count)
    const choices = [PALETTE.lilac, PALETTE.blue, PALETTE.cyan, PALETTE.purple, PALETTE.white]
    for (let i = 0; i < count; i++) {
      const r = 1.45 + Math.pow(Math.random(), 1.6) * 2.4
      const u = Math.random() * 2 - 1
      const t = Math.random() * Math.PI * 2
      const q = Math.sqrt(1 - u * u)
      pos.set([r * q * Math.cos(t), r * u * 0.8, r * q * Math.sin(t)], i * 3)
      const cc = choices[Math.floor(Math.random() * choices.length)]!
      col.set([cc.r, cc.g, cc.b], i * 3)
      size[i] = 1.5 + Math.random() * 3.5
      phase[i] = Math.random() * Math.PI * 2
    }
    const pg = new THREE.BufferGeometry()
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    pg.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    pg.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
    pg.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
    this.particles = new THREE.Points(pg, new THREE.ShaderMaterial({
      vertexShader: particleVertex, fragmentShader: particleFragment,
      uniforms: { uTime: this.uTime, uPixelRatio: { value: this.renderer.getPixelRatio() } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    }))
    this.particles.renderOrder = -8
    s.add(this.particles)
  }

  private rebuildTrail() {
    const pts = this.trail
    if (pts.length < 2) {
      this.trailLine.visible = false
      return
    }
    const positions: number[] = []
    const colors: number[] = []
    const n = pts.length
    pts.forEach((p, i) => {
      const v = toThree(p)
      positions.push(v.x, v.y, v.z)
      const t = Math.pow(i / (n - 1), 1.4)
      const c = PALETTE.violet.clone().lerp(PALETTE.lilac, t).multiplyScalar(0.15 + 0.85 * t)
      colors.push(c.r, c.g, c.b)
    })
    const geo = new LineGeometry()
    geo.setPositions(positions)
    geo.setColors(colors)
    this.trailLine.geometry.dispose()
    this.trailLine.geometry = geo
    this.trailLine.visible = true
  }

  // ------------------------------------------------------------ input

  private bindInput() {
    const c = this.renderer.domElement
    c.style.touchAction = 'pan-y'
    c.addEventListener('pointerdown', this.onDown)
    c.addEventListener('pointermove', this.onMove)
    c.addEventListener('pointerup', this.onUp)
    c.addEventListener('pointercancel', this.onUp)
  }

  private onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    this.dragging = true
    this.pointerType = e.pointerType
    this.lastX = e.clientX
    this.lastY = e.clientY
    this.velAz = this.velEl = 0
    this.container.classList.add('is-dragging')
    try {
      this.renderer.domElement.setPointerCapture(e.pointerId)
    } catch {}
  }
  private onMove = (e: PointerEvent) => {
    if (!this.dragging) return
    const dx = e.clientX - this.lastX
    const dy = e.clientY - this.lastY
    this.lastX = e.clientX
    this.lastY = e.clientY
    const k = 0.0085
    this.velAz = -dx * k
    this.az += this.velAz
    if (this.pointerType === 'mouse') {
      this.velEl = dy * k * 0.7
      this.el = THREE.MathUtils.clamp(this.el + this.velEl, -1.1, 1.25)
    }
    this.lastInteraction = this.elapsed
  }
  private onUp = (e: PointerEvent) => {
    this.dragging = false
    this.container.classList.remove('is-dragging')
    try {
      this.renderer.domElement.releasePointerCapture(e.pointerId)
    } catch {}
    this.lastInteraction = this.elapsed
  }

  // ------------------------------------------------------------ loop

  private updateLoop = () => {
    if (this.disposed) return
    const shouldRun = this.running && this.visible && document.visibilityState !== 'hidden'
    this.renderer.setAnimationLoop(shouldRun ? this.frame : null)
    if (shouldRun) this.lastT = performance.now()
  }

  private resize() {
    const w = Math.max(1, this.container.clientWidth)
    const h = Math.max(1, this.container.clientHeight)
    this.renderer.setSize(w, h)
    this.labelRenderer.setSize(w, h)
    this.camera.aspect = w / h
    // Fit a radius of ~1.55 (sphere + labels) in both directions.
    const half = THREE.MathUtils.degToRad(this.camera.fov / 2)
    const fit = 1.55
    this.dist = Math.max(fit / Math.tan(half), fit / (Math.tan(half) * this.camera.aspect))
    this.camera.updateProjectionMatrix()
    // draw immediately so the sphere is correct even before the next animation frame
    this.renderOnce()
  }

  private renderOnce() {
    this.updateCamera()
    this.updateObjects(0)
    this.renderer.render(this.scene, this.camera)
    this.labelRenderer.render(this.scene, this.camera)
  }

  private updateCamera() {
    const ce = Math.cos(this.el)
    this.camera.position.set(this.dist * ce * Math.sin(this.az), this.dist * Math.sin(this.el), this.dist * ce * Math.cos(this.az))
    this.camera.lookAt(0, 0, 0)
    this.camDir.value.copy(this.camera.position).normalize()
  }

  private updateObjects(dt: number) {
    // Arrow
    const dir = toThree(this.vector)
    const len = Math.max(dir.length(), 1e-6)
    const unit = dir.clone().divideScalar(len)
    this.arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), unit)
    this.arrow.scale.set(1, len, 1)
    this.tipGlow.position.copy(dir)
    const pulse = this.opts.reducedMotion ? 1 : 1 + 0.06 * Math.sin(this.uTime.value * 3)
    this.tipGlow.scale.setScalar(0.5 * pulse)

    // Projection guides
    const foot = new THREE.Vector3(dir.x, 0, dir.z)
    const setLine = (line: THREE.Line, a: THREE.Vector3, b: THREE.Vector3) => {
      const attr = line.geometry.getAttribute('position') as THREE.BufferAttribute
      attr.setXYZ(0, a.x, a.y, a.z)
      attr.setXYZ(1, b.x, b.y, b.z)
      attr.needsUpdate = true
      line.computeLineDistances()
      line.geometry.computeBoundingSphere()
    }
    setLine(this.guideToFoot, dir, foot)
    setLine(this.guideFromCenter, new THREE.Vector3(), foot)
    const showGuides = Math.abs(dir.y) < 0.995 * len && foot.length() > 0.02
    this.guideToFoot.visible = this.guideFromCenter.visible = showGuides
    const r = Math.sqrt(Math.max(0, 1 - dir.y * dir.y))
    this.latRing.visible = r > 0.03 && r < 0.999
    this.latRing.scale.set(r, 1, r)
    this.latRing.position.y = dir.y

    // Rotation axis fade
    const target = this.axis ? 1 : 0
    this.axisOpacity += (target - this.axisOpacity) * Math.min(1, dt * 8)
    this.axisGroup.visible = this.axisOpacity > 0.01
    const [core, glow, capA, capB] = this.axisMats as [THREE.MeshBasicMaterial, THREE.ShaderMaterial, THREE.SpriteMaterial, THREE.SpriteMaterial]
    core.opacity = this.axisOpacity * 0.9
    glow.uniforms.uOpacity!.value = this.axisOpacity * 0.9
    capA.opacity = capB.opacity = this.axisOpacity

    // Trail fades after the motion stops
    if (!this.axis && this.trailOpacity > 0) this.trailOpacity = Math.max(0, this.trailOpacity - dt * 0.35)
    this.trailMat.opacity = this.trailOpacity
    this.trailLine.visible = this.trail.length > 1 && this.trailOpacity > 0.01

    // Measurement flash
    if (this.flashT < 1.2) {
      this.flashT += dt
      const t = Math.min(1, this.flashT / 0.9)
      const m = this.flashSprite.material as THREE.SpriteMaterial
      m.opacity = (1 - t) * 0.95
      this.flashSprite.scale.setScalar(0.3 + t * 1.6)
      this.uFlash.value = (1 - t) * 0.6
    } else {
      ;(this.flashSprite.material as THREE.SpriteMaterial).opacity = 0
      this.uFlash.value = 0
    }

    // Labels: dim the ones behind the sphere
    for (const l of this.labels) {
      const d = l.pos.clone().normalize().dot(this.camDir.value)
      const a = 0.32 + 0.68 * THREE.MathUtils.smoothstep(d, -0.35, 0.35)
      l.obj.element.style.opacity = a.toFixed(2)
    }
  }

  private frame = () => {
    const t = performance.now()
    const dt = Math.min((t - this.lastT) / 1000, 0.05)
    this.lastT = t
    this.elapsed += dt
    this.uTime.value += dt
    const now = this.elapsed

    if (!this.dragging) {
      // inertia
      this.az += this.velAz
      this.el = THREE.MathUtils.clamp(this.el + this.velEl, -1.1, 1.25)
      this.velAz *= 0.92
      this.velEl *= 0.9
      // idle auto-rotation, and gently return to a pleasant elevation
      if (!this.opts.reducedMotion && now - this.lastInteraction > 2.5) {
        this.az += dt * 0.13
        this.el += (0.3 - this.el) * dt * 0.4
      }
    }
    if (!this.opts.reducedMotion) this.particles.rotation.y += dt * 0.025

    this.updateCamera()
    this.updateObjects(dt)
    this.renderer.render(this.scene, this.camera)
    this.labelRenderer.render(this.scene, this.camera)
  }
}

export function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}
