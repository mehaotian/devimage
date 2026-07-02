import { seedToInt, seedToUnit } from '../../common/seed';
import {
  buildGlassShadowFilter,
  buildHeavyBlurFilter,
  buildNeonCoreGlowFilter,
  buildNeonOuterGlowFilter,
  buildRisoGrainFilter,
  pickGlassScheme,
  pickNeonScheme,
  pickPaperScheme,
  pickRisoPaper,
  pickRisoScheme,
  seedRange,
  type FilterMaterial,
  type GlassScheme,
} from './svg-filters';
import { type NativeRendererInput, wrapSvg } from './helpers';

/** 毛玻璃卡片规格 */
interface GlassCardSpec {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly rx: number;
  readonly rot: number;
  readonly id: string;
  readonly opacity: number;
}

/**
 * 渲染玻璃拟态滤镜头像
 */
export function renderGlass(input: NativeRendererInput): string {
  return renderFilterMaterial(input, 'glass');
}

/**
 * 渲染霓虹描边滤镜头像
 */
export function renderNeon(input: NativeRendererInput): string {
  return renderFilterMaterial(input, 'neon');
}

/**
 * 渲染纸雕多层滤镜头像
 */
export function renderPaper(input: NativeRendererInput): string {
  return renderFilterMaterial(input, 'paper');
}

/**
 * 渲染 Risograph 印刷滤镜头像
 */
export function renderRiso(input: NativeRendererInput): string {
  return renderFilterMaterial(input, 'riso');
}

/**
 * 按材质类型渲染 SVG Filter 风格头像
 */
function renderFilterMaterial(input: NativeRendererInput, material: FilterMaterial): string {
  const { seed, size } = input;

  switch (material) {
    case 'glass':
      return renderGlassSvg(size, seed);
    case 'neon':
      return renderNeonSvg(size, seed);
    case 'paper':
      return renderPaperSvg(size, seed);
    case 'riso':
      return renderRisoSvg(size, seed);
    default:
      throw new Error(`Unknown filter material: ${material}`);
  }
}

/**
 * 由 seed 生成 5–6 个背景光斑
 */
function buildGlassBlobLayer(scheme: GlassScheme, seed: string): string {
  const count = seedToInt(seed, 'glass-blobs', 5, 7);
  const colors = [scheme.blobA, scheme.blobB, scheme.blobC, scheme.blobD];
  const parts: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const cx = seedRange(seed, `gb-x-${i}`, 8, 92);
    const cy = seedRange(seed, `gb-y-${i}`, 8, 92);
    const r = seedRange(seed, `gb-r-${i}`, 14, 36);
    const c = colors[i % colors.length] ?? scheme.blobA;
    parts.push(`<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${c}"/>`);
  }

  return parts.join('');
}

/**
 * 由 seed 推导毛玻璃卡片布局（6 种模板 + 微偏移）
 */
function buildGlassCards(seed: string): GlassCardSpec[] {
  const layout = seedToInt(seed, 'glass-layout', 0, 6);
  const jitter = (slot: string, amp: number) => seedToInt(seed, slot, -amp, amp + 1);

  const presets: GlassCardSpec[][] = [
    [
      { x: 18, y: 22, w: 64, h: 52, rx: 16, rot: -6, id: 'c0', opacity: 0.34 },
      { x: 38, y: 38, w: 48, h: 38, rx: 12, rot: 8, id: 'c1', opacity: 0.28 },
    ],
    [{ x: 14, y: 28, w: 72, h: 44, rx: 18, rot: 4, id: 'c0', opacity: 0.33 }],
    [
      { x: 22, y: 18, w: 56, h: 58, rx: 14, rot: -4, id: 'c0', opacity: 0.32 },
      { x: 32, y: 42, w: 52, h: 36, rx: 11, rot: 10, id: 'c1', opacity: 0.27 },
    ],
    [
      { x: 12, y: 14, w: 48, h: 40, rx: 14, rot: -10, id: 'c0', opacity: 0.3 },
      { x: 40, y: 32, w: 52, h: 48, rx: 16, rot: 5, id: 'c1', opacity: 0.32 },
      { x: 24, y: 58, w: 36, h: 28, rx: 10, rot: -5, id: 'c2', opacity: 0.24 },
    ],
    [{ x: 20, y: 20, w: 60, h: 60, rx: 20, rot: 0, id: 'c0', opacity: 0.35 }],
    [
      { x: 10, y: 24, w: 44, h: 56, rx: 12, rot: -12, id: 'c0', opacity: 0.3 },
      { x: 48, y: 18, w: 42, h: 36, rx: 10, rot: 6, id: 'c1', opacity: 0.28 },
    ],
    [
      { x: 16, y: 36, w: 68, h: 38, rx: 14, rot: 3, id: 'c0', opacity: 0.33 },
      { x: 28, y: 12, w: 44, h: 32, rx: 11, rot: -7, id: 'c1', opacity: 0.26 },
    ],
  ];

  const base = presets[layout] ?? presets[0]!;

  return base.map((card, i) => ({
    ...card,
    x: card.x + jitter(`gc-jx-${i}`, 5),
    y: card.y + jitter(`gc-jy-${i}`, 5),
    w: card.w + jitter(`gc-jw-${i}`, 4),
    h: card.h + jitter(`gc-jh-${i}`, 4),
    rot: card.rot + jitter(`gc-jr-${i}`, 8),
    opacity: card.opacity + seedToUnit(seed, `gc-op-${i}`) * 0.08,
  }));
}

/**
 * 绘制单块毛玻璃卡片
 */
function buildGlassCard(card: GlassCardSpec): string {
  const { x, y, w, h, rx, rot, opacity } = card;
  const cx = x + w / 2;
  const cy = y + h / 2;
  const transform = rot !== 0 ? ` transform="rotate(${rot} ${cx} ${cy})"` : '';
  const op = opacity.toFixed(2);

  return [
    `<g${transform}>`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#000000" opacity="0.06" filter="url(#glass-shadow)"/>`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="#ffffff" opacity="${op}"/>`,
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="none" stroke="#ffffff" stroke-width="0.85" stroke-opacity="0.62"/>`,
    `<rect x="${x + 5}" y="${y + 4}" width="${(w * 0.4).toFixed(1)}" height="2" rx="1" fill="#ffffff" opacity="0.48"/>`,
    `</g>`,
  ].join('');
}

/**
 * 毛玻璃卡片 clipPath defs
 */
function buildGlassClipDefs(cards: GlassCardSpec[]): string {
  return cards
    .map(
      (c) =>
        `<clipPath id="glass-clip-${c.id}"><rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="${c.rx}"/></clipPath>`,
    )
    .join('');
}

/**
 * 毛玻璃渲染
 */
function renderGlassSvg(size: number, seed: string): string {
  const scheme = pickGlassScheme(seed);
  const cards = buildGlassCards(seed);
  const blobLayer = buildGlassBlobLayer(scheme, seed);
  const blur = seedRange(seed, 'glass-blur', 6, 12).toFixed(1);
  const bgAngle = seedToInt(seed, 'glass-bg-angle', 0, 360);

  const defs = [
    `<defs>`,
    `<linearGradient id="glass-bg-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="100" y2="100" gradientTransform="rotate(${bgAngle} 50 50)">`,
    `<stop offset="0%" stop-color="${scheme.base}"/>`,
    `<stop offset="100%" stop-color="${scheme.blobB}" stop-opacity="0.85"/>`,
    `</linearGradient>`,
    buildHeavyBlurFilter('glass-heavy-blur', Number.parseFloat(blur)),
    buildGlassShadowFilter('glass-shadow'),
    buildGlassClipDefs(cards),
    `</defs>`,
  ].join('');

  const parts = [
    `<rect width="100" height="100" fill="url(#glass-bg-grad)"/>`,
    blobLayer,
  ];

  for (const card of cards) {
    parts.push(
      `<g clip-path="url(#glass-clip-${card.id})" filter="url(#glass-heavy-blur)" opacity="0.92">`,
      blobLayer,
      `</g>`,
      buildGlassCard(card),
    );
  }

  return wrapSvg(size, parts.join(''), defs);
}

/**
 * 霓虹造型 path（10 种）
 */
function neonShapePath(kind: number): string {
  const shapes = [
    'M 50 24 A 26 26 0 1 1 49.9 24',
    'M 32 58 Q 50 30 68 58 Q 50 44 32 58',
    'M 50 28 L 62 62 L 38 62 Z',
    'M 28 50 L 50 28 L 72 50 L 50 72 Z',
    'M 34 42 L 50 26 L 66 42 L 58 68 L 42 68 Z',
    'M 30 50 L 50 26 L 70 50 L 50 74 Z',
    'M 38 32 L 62 32 L 54 68 L 46 68 Z',
    'M 26 38 L 74 38 M 50 38 L 50 68 M 38 52 L 62 52',
    'M 34 62 Q 50 22 66 62',
    'M 42 28 L 58 28 L 64 44 L 50 72 L 36 44 Z',
  ];
  return shapes[kind % shapes.length] ?? shapes[0]!;
}

/**
 * 霓虹管三层 stroke
 */
function buildNeonTube(
  path: string,
  tubeColor: string,
  coreColor: string,
  outerId: string,
  coreId: string,
  scale = 1,
  strokeMul = 1,
): string {
  const swOuter = (7 * strokeMul * scale).toFixed(1);
  const swMid = (3.2 * strokeMul * scale).toFixed(1);
  const swCore = (1.2 * strokeMul * scale).toFixed(1);
  const transform =
    scale !== 1
      ? ` transform="translate(50 50) scale(${scale.toFixed(3)}) translate(-50 -50)"`
      : '';

  return [
    `<g${transform}>`,
    `<path d="${path}" fill="none" stroke="${tubeColor}" stroke-width="${swOuter}" stroke-linecap="round" stroke-linejoin="round" opacity="0.42" filter="url(#${outerId})"/>`,
    `<path d="${path}" fill="none" stroke="${tubeColor}" stroke-width="${swMid}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${coreId})"/>`,
    `<path d="${path}" fill="none" stroke="${coreColor}" stroke-width="${swCore}" stroke-linecap="round" stroke-linejoin="round" opacity="0.92"/>`,
    `</g>`,
  ].join('');
}

/**
 * 霓虹渲染
 */
function renderNeonSvg(size: number, seed: string): string {
  const scheme = pickNeonScheme(seed);
  const shapeKind = seedToInt(seed, 'neon-shape', 0, 10);
  const path = neonShapePath(shapeKind);
  const wall = seedToInt(seed, 'neon-wall', 0, 3);
  const tubeCount = seedToInt(seed, 'neon-tubes', 1, 3);
  const mainScale = seedRange(seed, 'neon-scale', 0.75, 1.08);
  const mainRot = seedToInt(seed, 'neon-rot', -18, 18);
  const shiftX = seedRange(seed, 'neon-sx', -8, 8);
  const shiftY = seedRange(seed, 'neon-sy', -6, 6);
  const outerBlur = seedRange(seed, 'neon-blur', 4, 8).toFixed(1);

  const defs = [
    `<defs>`,
    `<linearGradient id="neon-bg" x1="0" y1="0" x2="0" y2="1">`,
    `<stop offset="0%" stop-color="${scheme.bgTop}"/>`,
    `<stop offset="100%" stop-color="${scheme.bgBottom}"/>`,
    `</linearGradient>`,
    `<radialGradient id="neon-vig" cx="50%" cy="50%" r="58%">`,
    `<stop offset="50%" stop-color="#000000" stop-opacity="0"/>`,
    `<stop offset="100%" stop-color="#000000" stop-opacity="0.6"/>`,
    `</radialGradient>`,
    buildNeonOuterGlowFilter('neon-outer-a', scheme.tube, Number.parseFloat(outerBlur)),
    buildNeonCoreGlowFilter('neon-core-a', scheme.tube),
    buildNeonOuterGlowFilter('neon-outer-b', scheme.tubeSecondary, Number.parseFloat(outerBlur)),
    buildNeonCoreGlowFilter('neon-core-b', scheme.tubeSecondary),
    `</defs>`,
  ].join('');

  const parts = [`<rect width="100" height="100" fill="url(#neon-bg)"/>`];

  if (wall === 0) {
    for (let row = 0; row < 8; row += 1) {
      for (let col = 0; col < 8; col += 1) {
        if ((row + col) % 2 === 0) continue;
        parts.push(
          `<rect x="${col * 12.5}" y="${row * 12.5}" width="12.5" height="12.5" fill="#ffffff" opacity="${(0.015 + seedToUnit(seed, `nb-${row}-${col}`) * 0.02).toFixed(3)}"/>`,
        );
      }
    }
  } else if (wall === 1) {
    for (let i = 0; i < 12; i += 1) {
      parts.push(
        `<line x1="${seedRange(seed, `nw-x1-${i}`, 0, 100).toFixed(1)}" y1="0" x2="${seedRange(seed, `nw-x2-${i}`, 0, 100).toFixed(1)}" y2="100" stroke="#ffffff" stroke-width="0.3" opacity="0.04"/>`,
      );
    }
  } else {
    parts.push(`<rect width="100" height="100" fill="#000000" opacity="0.15"/>`);
  }

  parts.push(`<rect width="100" height="100" fill="url(#neon-vig)"/>`);

  parts.push(
    `<g transform="translate(${shiftX.toFixed(1)} ${shiftY.toFixed(1)}) rotate(${mainRot} 50 50)">`,
    buildNeonTube(path, scheme.tube, scheme.tubeCore, 'neon-outer-a', 'neon-core-a', mainScale),
    `</g>`,
  );

  if (tubeCount >= 2) {
    const path2 = neonShapePath(shapeKind + seedToInt(seed, 'neon-shape-2', 2, 6));
    parts.push(
      `<g transform="translate(${seedRange(seed, 'neon-2x', -12, 12).toFixed(1)} ${seedRange(seed, 'neon-2y', 4, 18).toFixed(1)}) scale(${seedRange(seed, 'neon-2s', 0.4, 0.65).toFixed(2)})" opacity="0.88">`,
      buildNeonTube(path2, scheme.tubeSecondary, scheme.tubeCore, 'neon-outer-b', 'neon-core-b', 1, 0.9),
      `</g>`,
    );
  }

  if (tubeCount >= 3) {
    const path3 = neonShapePath(shapeKind + seedToInt(seed, 'neon-shape-3', 4, 8));
    parts.push(
      `<g transform="translate(${seedRange(seed, 'neon-3x', -18, 10).toFixed(1)} ${seedRange(seed, 'neon-3y', -14, 8).toFixed(1)}) scale(${seedRange(seed, 'neon-3s', 0.35, 0.55).toFixed(2)}) rotate(${seedToInt(seed, 'neon-3r', -30, 30)} 50 50)" opacity="0.75">`,
      buildNeonTube(path3, scheme.tube, scheme.tubeCore, 'neon-outer-a', 'neon-core-a', 1, 0.75),
      `</g>`,
    );
  }

  return wrapSvg(size, parts.join(''), defs);
}

/** 纸雕场景：山峦 / 波浪 / 城市 */
const PAPER_SCENES = {
  mountain: [
    'M 0 72 L 0 58 Q 18 48 32 56 Q 48 38 62 52 Q 78 42 100 55 L 100 100 L 0 100 Z',
    'M 0 78 L 0 62 Q 22 52 38 64 Q 55 46 72 58 Q 88 50 100 62 L 100 100 L 0 100 Z',
    'M 0 75 L 0 60 Q 15 68 28 54 Q 42 62 58 48 Q 74 58 88 50 L 100 58 L 100 100 L 0 100 Z',
    'M 0 70 L 0 55 Q 20 65 35 50 Q 50 42 65 55 Q 80 45 100 52 L 100 100 L 0 100 Z',
  ],
  wave: [
    'M 0 68 Q 20 58 40 68 T 80 68 T 100 68 L 100 100 L 0 100 Z',
    'M 0 72 Q 25 62 50 72 T 100 72 L 100 100 L 0 100 Z',
    'M 0 65 Q 15 75 30 65 T 60 65 T 90 65 T 100 65 L 100 100 L 0 100 Z',
  ],
  city: [
    'M 0 100 L 0 55 L 12 55 L 12 42 L 22 42 L 22 58 L 34 58 L 34 35 L 44 35 L 44 62 L 56 62 L 56 48 L 66 48 L 66 38 L 76 38 L 76 55 L 88 55 L 88 45 L 100 45 L 100 100 Z',
    'M 0 100 L 0 60 L 10 60 L 10 50 L 20 50 L 20 68 L 32 68 L 32 40 L 42 40 L 42 58 L 54 58 L 54 52 L 64 52 L 64 36 L 74 36 L 74 65 L 86 65 L 86 48 L 100 48 L 100 100 Z',
  ],
} as const;

/**
 * 绘制单层纸雕（硬边偏移阴影 + 细描边，不用 blur filter）
 */
function buildPaperLayer(
  silhouette: string,
  fill: string,
  stroke: string,
  ox: number,
  oy: number,
  dirX: number,
  withShadow: boolean,
): string {
  const tx = ox.toFixed(1);
  const ty = oy.toFixed(1);
  const shadowTx = (ox + 0.9 * dirX).toFixed(1);
  const shadowTy = (oy + 1.4).toFixed(1);
  const crisp = 'shape-rendering="geometricPrecision"';

  const shadow = withShadow
    ? `<path d="${silhouette}" fill="#1a1428" opacity="0.14" transform="translate(${shadowTx} ${shadowTy})" ${crisp}/>`
    : '';

  return [
    shadow,
    `<path d="${silhouette}" fill="${fill}" stroke="${stroke}" stroke-width="0.45" stroke-linejoin="round" transform="translate(${tx} ${ty})" ${crisp}/>`,
  ].join('');
}

/**
 * 纸雕渲染
 */
function renderPaperSvg(size: number, seed: string): string {
  const scheme = pickPaperScheme(seed);
  const sceneType = seedToInt(seed, 'paper-scene', 0, 3);
  const sceneKey = sceneType === 1 ? 'wave' : sceneType === 2 ? 'city' : 'mountain';
  const paths = PAPER_SCENES[sceneKey];
  const variant = seedToInt(seed, 'paper-variant', 0, paths.length);
  const silhouette = paths[variant] ?? paths[0]!;
  const isMoon = seedToInt(seed, 'paper-sun', 0, 100) > 48;
  const sunX = seedRange(seed, 'paper-sun-x', 58, 88);
  const sunY = seedRange(seed, 'paper-sun-y', 14, 38);
  const sunR = seedRange(seed, 'paper-sun-r', 7, 14);
  const layerCount = seedToInt(seed, 'paper-layers', 3, 5);
  const dirX = seedToInt(seed, 'paper-dx', 0, 100) > 50 ? 1 : -1;

  const parts = [
    `<rect width="100" height="100" fill="${scheme.sky}"/>`,
    `<g shape-rendering="geometricPrecision">`,
  ];

  const cloudCount = seedToInt(seed, 'paper-clouds', 0, 4);
  for (let i = 0; i < cloudCount; i += 1) {
    const cx = seedRange(seed, `pc-x-${i}`, 10, 85);
    const cy = seedRange(seed, `pc-y-${i}`, 12, 35);
    const w = seedRange(seed, `pc-w-${i}`, 12, 28);
    parts.push(
      `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${w.toFixed(1)}" ry="${(w * 0.32).toFixed(1)}" fill="#ffffff" opacity="${(0.35 + seedToUnit(seed, `pc-o-${i}`) * 0.25).toFixed(2)}"/>`,
    );
  }

  parts.push(
    `<circle cx="${sunX.toFixed(1)}" cy="${sunY.toFixed(1)}" r="${sunR.toFixed(1)}" fill="${scheme.accent}"/>`,
  );

  if (isMoon && seedToInt(seed, 'paper-moon-cut', 0, 100) > 40) {
    parts.push(
      `<circle cx="${(sunX + sunR * 0.35).toFixed(1)}" cy="${(sunY - sunR * 0.2).toFixed(1)}" r="${(sunR * 0.85).toFixed(1)}" fill="${scheme.sky}"/>`,
    );
  }

  for (let i = 0; i < layerCount; i += 1) {
    const color = scheme.layers[Math.min(i, scheme.layers.length - 1)] ?? scheme.layers[3];
    const stroke = scheme.layers[Math.min(i + 1, scheme.layers.length - 1)] ?? scheme.layers[3];
    const ox = i * (2 + seedToUnit(seed, 'paper-step') * 1.2) * dirX;
    const oy = i * (1.4 + seedToUnit(seed, 'paper-step-y') * 1);
    const isFront = i === layerCount - 1;
    parts.push(buildPaperLayer(silhouette, color, stroke, ox, oy, dirX, !isFront));
  }

  parts.push(`</g>`);

  return wrapSvg(size, parts.join(''), '');
}

/**
 * Risograph 渲染
 */
function renderRisoSvg(size: number, seed: string): string {
  const [inkA, inkB, inkC] = pickRisoScheme(seed);
  const misX = seedToInt(seed, 'riso-mx', 2, 7);
  const misY = seedToInt(seed, 'riso-my', 2, 7);
  const layout = seedToInt(seed, 'riso-layout', 0, 5);
  const paper = pickRisoPaper(seed);
  const grainSeed = seedToInt(seed, 'riso-grain', 1, 99);
  const scale = seedRange(seed, 'riso-scale', 0.85, 1.12);
  const shiftX = seedRange(seed, 'riso-shift-x', -8, 8);
  const shiftY = seedRange(seed, 'riso-shift-y', -8, 8);

  const defs = [`<defs>`, buildRisoGrainFilter('riso-grain', grainSeed), `</defs>`].join('');
  const parts = [`<rect width="100" height="100" fill="${paper}"/>`];
  const gOpen = `<g transform="translate(${shiftX.toFixed(1)} ${shiftY.toFixed(1)}) translate(50 50) scale(${scale.toFixed(2)}) translate(-50 -50)">`;
  const gClose = `</g>`;

  parts.push(gOpen);

  const cx = seedRange(seed, 'riso-cx', 35, 55);
  const cy = seedRange(seed, 'riso-cy', 40, 58);
  const r = seedRange(seed, 'riso-r', 24, 34);
  const rot = seedToInt(seed, 'riso-rot', -14, 14);

  if (layout === 0) {
    parts.push(
      `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="${inkA}" opacity="0.88"/>`,
      `<circle cx="${(cx + misX).toFixed(1)}" cy="${(cy + misY).toFixed(1)}" r="${r.toFixed(1)}" fill="${inkB}" opacity="0.76"/>`,
      `<rect x="${(cx + 8).toFixed(1)}" y="${(cy - r - 4).toFixed(1)}" width="${(r + 8).toFixed(1)}" height="${(r * 1.6).toFixed(1)}" rx="4" fill="${inkC}" opacity="0.82" transform="rotate(${rot} ${(cx + r).toFixed(1)} ${cy.toFixed(1)})"/>`,
    );
  } else if (layout === 1) {
    const rx = seedRange(seed, 'riso-rx', 28, 38);
    const ry = seedRange(seed, 'riso-ry', 24, 34);
    parts.push(
      `<rect x="${(50 - rx).toFixed(1)}" y="${(50 - ry).toFixed(1)}" width="${(rx * 2).toFixed(1)}" height="${(ry * 2).toFixed(1)}" rx="6" fill="${inkA}" opacity="0.85"/>`,
      `<rect x="${(50 - rx + misX).toFixed(1)}" y="${(50 - ry + misY).toFixed(1)}" width="${(rx * 2).toFixed(1)}" height="${(ry * 2).toFixed(1)}" rx="6" fill="${inkB}" opacity="0.72"/>`,
      `<circle cx="${seedRange(seed, 'riso-dot-x', 62, 82).toFixed(1)}" cy="${seedRange(seed, 'riso-dot-y', 22, 42).toFixed(1)}" r="${seedRange(seed, 'riso-dot-r', 12, 22).toFixed(1)}" fill="${inkC}" opacity="0.9"/>`,
    );
  } else if (layout === 2) {
    parts.push(
      `<polygon points="50,18 82,78 18,78" fill="${inkA}" opacity="0.86"/>`,
      `<polygon points="${50 + misX},${18 + misY} ${82 + misX},${78 + misY} ${18 + misX},${78 + misY}" fill="${inkB}" opacity="0.7"/>`,
      `<circle cx="${seedRange(seed, 'riso-c2x', 42, 58).toFixed(1)}" cy="${seedRange(seed, 'riso-c2y', 55, 68).toFixed(1)}" r="${seedRange(seed, 'riso-c2r', 10, 18).toFixed(1)}" fill="${inkC}" opacity="0.88"/>`,
    );
  } else if (layout === 3) {
    parts.push(
      `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(r * 1.2).toFixed(1)}" ry="${r.toFixed(1)}" fill="${inkA}" opacity="0.84"/>`,
      `<ellipse cx="${(cx + misX).toFixed(1)}" cy="${(cy + misY).toFixed(1)}" rx="${(r * 1.2).toFixed(1)}" ry="${r.toFixed(1)}" fill="${inkB}" opacity="0.72"/>`,
      `<rect x="${seedRange(seed, 'riso-bar-x', 20, 35).toFixed(1)}" y="${seedRange(seed, 'riso-bar-y', 25, 40).toFixed(1)}" width="${seedRange(seed, 'riso-bar-w', 18, 30).toFixed(1)}" height="${seedRange(seed, 'riso-bar-h', 40, 55).toFixed(1)}" fill="${inkC}" opacity="0.8" transform="rotate(${rot} 50 50)"/>`,
    );
  } else if (layout === 4) {
    parts.push(
      `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${(r * 0.7).toFixed(1)}" fill="${inkC}" opacity="0.9"/>`,
      `<rect x="${(cx - r).toFixed(1)}" y="${(cy - 8).toFixed(1)}" width="${(r * 2).toFixed(1)}" height="16" fill="${inkA}" opacity="0.85"/>`,
      `<rect x="${(cx - 8 + misX).toFixed(1)}" y="${(cy - r + misY).toFixed(1)}" width="16" height="${(r * 2).toFixed(1)}" fill="${inkB}" opacity="0.75"/>`,
    );
  } else {
    parts.push(
      `<path d="M 20 75 Q 50 25 80 75 L 80 100 L 20 100 Z" fill="${inkA}" opacity="0.85"/>`,
      `<path d="M ${20 + misX} 75 Q ${50 + misX} 25 ${80 + misX} 75 L ${80 + misX} 100 L ${20 + misX} 100 Z" fill="${inkB}" opacity="0.72"/>`,
      `<circle cx="${seedRange(seed, 'riso-sx', 65, 80).toFixed(1)}" cy="${seedRange(seed, 'riso-sy', 28, 42).toFixed(1)}" r="${seedRange(seed, 'riso-sr', 8, 16).toFixed(1)}" fill="${inkC}" opacity="0.88"/>`,
    );
  }

  if (seedToInt(seed, 'riso-extra', 0, 100) > 55) {
    parts.push(
      `<rect x="${seedRange(seed, 'riso-ex-x', 8, 75).toFixed(1)}" y="${seedRange(seed, 'riso-ex-y', 8, 75).toFixed(1)}" width="${seedRange(seed, 'riso-ex-w', 8, 22).toFixed(1)}" height="${seedRange(seed, 'riso-ex-h', 8, 22).toFixed(1)}" fill="${inkB}" opacity="0.55" transform="rotate(${seedToInt(seed, 'riso-ex-r', 0, 360)} 50 50)"/>`,
    );
  }

  parts.push(gClose);
  parts.push(
    `<g filter="url(#riso-grain)" opacity="${seedRange(seed, 'riso-grain-op', 0.25, 0.42).toFixed(2)}"><rect width="100" height="100" fill="#ffffff"/></g>`,
  );

  return wrapSvg(size, parts.join(''), defs);
}
