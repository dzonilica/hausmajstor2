// Line drawings for the site, generated from simple 3D geometry: construction sketches for the
// process section, service icons for the homepage shortcuts and an exploded joint for the craft section.
// Oblique projection: front faces keep their true shape, depth recedes up and to the right.
// Every stroke has a start time (--at) and duration (--dur), so each structure is measured,
// planned, built and finished in the order of the four process steps. The phase start times
// below are repeated in styles.css, where they highlight the matching step.
export const PHASES = [0, 1.15, 1.85, 3.55];

const DX = 0.5 * Math.cos(32 * Math.PI / 180);
const DY = 0.5 * Math.sin(32 * Math.PI / 180);
const num = value => String(+value.toFixed(1));
const point = ([x, y]) => `${num(x)} ${num(y)}`;
const seconds = value => `${+value.toFixed(2)}s`;
const timing = (at, dur) => `--at:${seconds(at)}${dur === undefined ? '' : `;--dur:${seconds(dur)}`}`;
const polyline = (points, close = false) => 'M' + points.map(point).join('L') + (close ? 'Z' : '');

function sketch(scale, [ox, oy]) {
  const strokes = [];
  const plan = [];
  const labels = [];
  const P = (x, y, z) => [ox + (x + y * DX) * scale, oy - (z + y * DY) * scale];

  const raw = (d, { cls = '', at = 0, dur = 0.7 } = {}) => strokes.push(`<path class="s${cls ? ' ' + cls : ''}" d="${d}" pathLength="1" style="${timing(at, dur)}"/>`);
  const flat = (points, options = {}) => raw(polyline(points, options.close), options);
  const line = (points, options = {}) => flat(points.map(p => P(...p)), options);
  // A fill in the page colour hides whatever stands behind a solid part once that part is drawn.
  const shade = (points, at) => strokes.push(`<path class="o" d="${polyline(points, true)}" style="${timing(at)}"/>`);

  // Visible edges of a box: front, top and right faces. Posts rise with their edges side by side.
  function box([x0, y0, z0], [x1, y1, z1], { at = 0, dur = 0.6, cls = '', solid = true, rise = false } = {}) {
    if (solid) shade([P(x0, y0, z0), P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1), P(x0, y0, z1)], at + dur * 0.45);
    if (rise) {
      for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1]]) line([[x, y, z0], [x, y, z1]], { cls, at, dur });
      line([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [x0, y0, z1]], { cls, at: at + dur * 0.75, dur: 0.3 });
      line([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0]], { cls, at, dur: 0.3 });
      return;
    }
    line([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y0, z0]], { cls, at, dur });
    line([[x0, y0, z1], [x0, y1, z1], [x1, y1, z1], [x1, y0, z1]], { cls, at: at + dur * 0.35, dur });
    line([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], { cls, at: at + dur * 0.35, dur });
  }

  // Dashed outline of the proposal, shown between measuring and building.
  const sketchPlan = (points, at) => plan.push(`<path class="p" d="${polyline(points.map(p => P(...p)))}" style="${timing(at)}"/>`);
  function planBox([x0, y0, z0], [x1, y1, z1], at) {
    sketchPlan([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [x0, y0, z0]], at);
    sketchPlan([[x0, y0, z1], [x0, y1, z1], [x1, y1, z1], [x1, y0, z1]], at + 0.05);
    sketchPlan([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], at + 0.1);
  }

  // Wraps the parts drawn by `build` in a group, e.g. to move them together.
  function group(attributes, build) {
    strokes.push(`<g ${attributes}>`);
    build();
    strokes.push('</g>');
  }

  // Labels sit above the drawing unless `inline`, which keeps them in the current group.
  function label([x, y], text, { at = 0, angle = 0, inline = false, anchor = 'middle' } = {}) {
    const rotate = angle ? ` transform="rotate(${num(angle)} ${num(x)} ${num(y)})"` : '';
    (inline ? strokes : labels).push(`<text x="${num(x)}" y="${num(y)}"${rotate} text-anchor="${anchor}" dominant-baseline="central" style="${timing(at)}">${text}</text>`);
  }

  // Architectural dimension: extension lines, a line with slashed ends and the measured value.
  function dimension(a, b, [vx, vy], text, { at = 0, labelGap = 12 } = {}) {
    const length = Math.hypot(vx, vy);
    const [ux, uy] = [vx / length, vy / length];
    const [ex, ey] = [b[0] - a[0], b[1] - a[1]];
    const span = Math.hypot(ex, ey);
    const [dx, dy] = [ex / span, ey / span];
    const [ta, tb] = [[a[0] + vx, a[1] + vy], [b[0] + vx, b[1] + vy]];
    for (const p of [a, b]) flat([[p[0] + ux * 5, p[1] + uy * 5], [p[0] + vx + ux * 5, p[1] + vy + uy * 5]], { cls: 'mark', at, dur: 0.4 });
    flat([ta, tb], { cls: 'mark', at: at + 0.15, dur: 0.75 });
    const [sx, sy] = [(dx + ux) * 3.2, (dy + uy) * 3.2];
    for (const p of [ta, tb]) flat([[p[0] - sx, p[1] - sy], [p[0] + sx, p[1] + sy]], { cls: 'mark', at: at + 0.45, dur: 0.2 });
    let angle = Math.atan2(dy, dx) * 180 / Math.PI;
    if (angle > 90) angle -= 180;
    if (angle <= -90) angle += 180;
    label([(ta[0] + tb[0]) / 2 + ux * labelGap, (ta[1] + tb[1]) / 2 + uy * labelGap], text, { at: at + 0.5, angle });
  }

  // Corner stakes: a small cross on the ground where each post will stand.
  function stake(x, y, z, at) {
    line([[x - 0.16, y, z], [x + 0.16, y, z]], { cls: 'mark temp', at, dur: 0.3 });
    line([[x, y - 0.3, z], [x, y + 0.3, z]], { cls: 'mark temp', at: at + 0.05, dur: 0.3 });
  }

  // An almond-shaped leaf from `base`, pointing at `angle` degrees (0 = up, positive = right).
  function leaf([bx, by], angle, length, width, at) {
    const r = angle * Math.PI / 180;
    const [dx, dy] = [Math.sin(r), -Math.cos(r)];
    const tip = [bx + dx * length, by + dy * length];
    const mid = [bx + dx * length * 0.5, by + dy * length * 0.5];
    const c1 = [mid[0] - dy * width, mid[1] + dx * width];
    const c2 = [mid[0] + dy * width, mid[1] - dx * width];
    raw(`M${point([bx, by])}Q${point(c1)} ${point(tip)}Q${point(c2)} ${point([bx, by])}`, { cls: 'leaf', at, dur: 0.55 });
  }
  function sprout([bx, by], height, at, { lean = 0, spread = 46, size = 0.55, leaves = 2 } = {}) {
    const top = [bx + lean, by - height];
    raw(`M${point([bx, by])}Q${point([bx + lean * 0.2, by - height * 0.55])} ${point(top)}`, { cls: 'leaf', at, dur: 0.45 });
    const length = height * size;
    leaf(top, -spread + lean, length, length * 0.32, at + 0.25);
    leaf(top, spread + lean, length, length * 0.32, at + 0.32);
    if (leaves > 2) leaf([bx + lean * 0.45, by - height * 0.55], -spread * 1.5, length * 0.8, length * 0.26, at + 0.4);
  }

  const ground = (y, at = 0, [from, to] = [16, 624]) => flat([[from, y], [to, y]], { cls: 'mark', at, dur: 1.1 });
  const body = () => strokes.join('') + labels.join('');
  const insert = markup => strokes.push(markup);

  function svg(name) {
    return `<svg class="build-art" viewBox="0 0 640 360" role="img" aria-label="Skica izrade: ${name}. Merenje prostora, predlog, konstrukcija i završen prostor."><g>${strokes.join('')}</g><g class="build-plan">${plan.join('')}</g><g>${labels.join('')}</g></svg>`;
  }

  return { P, raw, flat, line, shade, box, group, sketchPlan, planBox, label, dimension, stake, leaf, sprout, ground, body, insert, svg };
}

const [MEASURE, PLAN, BUILD, FINISH] = PHASES;

function pergola() {
  const s = sketch(64, [138, 274]);
  const W = 4.2, D = 3, H = 2.4, half = 0.07;
  const posts = [[0, D], [W, D], [0, 0], [W, 0]];

  s.ground(s.P(0, -0.5, -0.14)[1]);
  s.box([-0.6, -0.5, -0.14], [4.8, 3.5, 0], { cls: 'soft', at: 0.1, dur: 0.9 });
  posts.forEach(([x, y], i) => s.stake(x, y, 0, 0.45 + i * 0.07));
  s.line([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0], [0, 0, 0]], { cls: 'mark temp', at: 0.55, dur: 0.8 });
  s.dimension(s.P(0, -0.5, -0.14), s.P(W, -0.5, -0.14), [0, 26], '4,20 m', { at: 0.6 });
  s.dimension(s.P(4.8, 0, -0.14), s.P(4.8, D, -0.14), [15, 24], '3,00 m', { at: 0.75, labelGap: 11 });
  s.dimension(s.P(-0.6, -0.5, 0), s.P(-0.6, -0.5, H), [-18, 0], '2,40 m', { at: 0.9 });

  posts.forEach(([x, y], i) => s.sketchPlan([[x, y, 0], [x, y, H]], PLAN + i * 0.06));
  s.planBox([-0.45, -0.4, H], [4.65, 3.4, 2.76], PLAN + 0.3);

  // Far posts and the left bench sit behind everything else.
  s.box([-half, D - half, 0], [half, D + half, H], { cls: 'soft', at: BUILD + 0.24, dur: 0.75, rise: true });
  s.box([W - half, D - half, 0], [W + half, D + half, H], { at: BUILD + 0.36, dur: 0.75, rise: true });
  s.box([0.75, 1.05, 0], [1.18, 1.95, 0.42], { at: FINISH + 0.05, dur: 0.55 });
  s.line([[2.1, 1.5, 2.62], [2.1, 1.5, 2.08]], { at: FINISH + 0.45, dur: 0.4 });
  const [lx, ly] = s.P(2.1, 1.5, 2.08);
  s.flat([[lx - 3.5, ly], [lx - 9, ly + 9], [lx + 9, ly + 9], [lx + 3.5, ly]], { close: true, cls: 'accent', at: FINISH + 0.7, dur: 0.45 });
  for (const [x, y] of [[1.52, 1.9], [1.52, 1.1], [2.68, 1.1], [2.68, 1.9]]) s.line([[x, y, 0], [x, y, 0.7]], { cls: y > 1.5 && x < 2 ? 'soft' : '', at: FINISH + 0.15, dur: 0.4 });
  s.box([1.42, 1.05, 0.7], [2.78, 1.95, 0.76], { at: FINISH + 0.2, dur: 0.55 });
  s.box([3.04, 1.05, 0], [3.47, 1.95, 0.42], { at: FINISH + 0.3, dur: 0.55 });

  s.box([-half, -half, 0], [half, half, H], { at: BUILD, dur: 0.75, rise: true });
  s.box([W - half, -half, 0], [W + half, half, H], { at: BUILD + 0.12, dur: 0.75, rise: true });
  // Knee braces between posts and beams.
  s.line([[0, 0.07, 1.92], [0, 0.55, H]], { at: BUILD + 0.95, dur: 0.35 });
  s.line([[W, 0.07, 1.92], [W, 0.55, H]], { at: BUILD + 1, dur: 0.35 });
  s.line([[W, D - 0.07, 1.92], [W, D - 0.55, H]], { at: BUILD + 1.05, dur: 0.35 });

  s.box([-half, -0.4, H], [half, 3.4, 2.62], { at: BUILD + 0.7, dur: 0.75 });
  s.box([W - half, -0.4, H], [W + half, 3.4, 2.62], { at: BUILD + 0.8, dur: 0.75 });
  const rafters = 10;
  for (let i = 0; i < rafters; i++) {
    const y = 3.24 - i * 0.39;
    s.box([-0.45, y, 2.62], [4.65, y + 0.06, 2.76], { at: BUILD + 1.05 + i * 0.065, dur: 0.5 });
  }

  // A planter of grasses beside the front corner post.
  s.box([4.42, -0.42, 0], [4.78, -0.12, 0.34], { at: FINISH + 0.4, dur: 0.5 });
  const base = s.P(4.6, -0.27, 0.34);
  s.sprout([base[0] - 3, base[1]], 28, FINISH + 0.65, { lean: 1, spread: 28 });
  s.sprout([base[0] + 5, base[1]], 38, FINISH + 0.75, { lean: 5, spread: 24, leaves: 3 });
  s.sprout([base[0] + 13, base[1]], 25, FINISH + 0.85, { lean: 9, spread: 32 });
  return s.svg('nadstrešnica');
}

function gazebo() {
  const s = sketch(57, [150, 292]);
  const W = 3.2, floor = 0.3, eave = 2.62, apexZ = 4.15, over = 0.42;
  const apex = [W / 2, W / 2, apexZ];
  const corners = { fl: [-over, -over, eave], fr: [W + over, -over, eave], br: [W + over, W + over, eave], bl: [-over, W + over, eave] };
  const inset = 0.12, half = 0.07;
  const posts = [[inset, W - inset], [W - inset, W - inset], [inset, inset], [W - inset, inset]];

  s.ground(s.P(0, -0.45, 0)[1]);
  posts.forEach(([x, y], i) => s.stake(x, y, 0, 0.3 + i * 0.07));
  s.line([[0, 0, 0], [W, 0, 0], [W, W, 0], [0, W, 0], [0, 0, 0]], { cls: 'mark temp', at: 0.45, dur: 0.8 });
  s.dimension(s.P(0, -0.45, 0), s.P(W, -0.45, 0), [0, 24], '3,20 m', { at: 0.55 });
  s.dimension(s.P(W, 0, 0), s.P(W, W, 0), [16, 25], '3,20 m', { at: 0.7, labelGap: 11 });
  s.dimension(s.P(-over, 0, 0), s.P(-over, 0, apexZ), [-30, 0], '4,15 m', { at: 0.85 });

  s.planBox([0, 0, 0], [W, W, floor], PLAN);
  posts.forEach(([x, y], i) => s.sketchPlan([[x, y, floor], [x, y, eave]], PLAN + 0.12 + i * 0.05));
  s.sketchPlan([corners.fl, corners.fr, corners.br], PLAN + 0.3);
  for (const corner of [corners.fl, corners.fr, corners.br]) s.sketchPlan([corner, apex], PLAN + 0.36);

  s.box([0, 0, 0], [W, W, floor], { at: BUILD, dur: 0.7 });
  s.box([1.1, -0.42, 0], [2.1, 0, 0.15], { at: BUILD + 0.15, dur: 0.5 });
  // Far posts and rails sit behind the furniture and the open front.
  s.box([inset - half, W - inset - half, floor], [inset + half, W - inset + half, eave], { cls: 'soft', at: BUILD + 0.42, dur: 0.7, rise: true });
  s.box([W - inset - half, W - inset - half, floor], [W - inset + half, W - inset + half, eave], { at: BUILD + 0.5, dur: 0.7, rise: true });
  for (const z of [1.15, 0.72]) {
    s.line([[inset, inset, z], [inset, W - inset, z], [W - inset, W - inset, z]], { cls: 'soft', at: BUILD + 1.05 + (z < 1 ? 0.1 : 0), dur: 0.6 });
  }
  // Table and bench.
  for (const [x, y] of [[1.25, 1.85], [1.25, 1.35], [2.15, 1.35], [2.15, 1.85]]) s.line([[x, y, floor], [x, y, 1.03]], { cls: x < 2 && y > 1.5 ? 'soft' : '', at: FINISH + 0.1, dur: 0.4 });
  s.box([1.15, 1.25, 1.03], [2.25, 1.95, 1.08], { at: FINISH + 0.15, dur: 0.5 });

  s.box([inset - half, inset - half, floor], [inset + half, inset + half, eave], { at: BUILD + 0.3, dur: 0.7, rise: true });
  s.box([W - inset - half, inset - half, floor], [W - inset + half, inset + half, eave], { at: BUILD + 0.36, dur: 0.7, rise: true });
  for (const z of [1.15, 0.72]) {
    const at = BUILD + 1.1 + (z < 1 ? 0.1 : 0);
    s.line([[inset, inset, z], [1, inset, z]], { at, dur: 0.35 });
    s.line([[2.2, inset, z], [W - inset, inset, z], [W - inset, W - inset, z]], { at, dur: 0.6 });
  }
  for (let y = 0.5; y < W - 0.3; y += 0.38) s.line([[W - inset, y, floor], [W - inset, y, 0.72]], { at: BUILD + 1.25 + y * 0.05, dur: 0.3 });

  // Roof: the visible front and right faces, then the courses of the covering.
  s.shade([s.P(...corners.fl), s.P(...corners.fr), s.P(...corners.br), s.P(...apex)], BUILD + 1.2);
  s.shade([s.P(...corners.fl), s.P(-over, -over, eave - 0.14), s.P(W + over, -over, eave - 0.14), s.P(W + over, W + over, eave - 0.14), s.P(...corners.br), s.P(...corners.fr)], BUILD + 1.2);
  s.line([[-over, -over, eave - 0.14], [W + over, -over, eave - 0.14], [W + over, W + over, eave - 0.14]], { at: BUILD + 0.9, dur: 0.7 });
  s.line([[-over, -over, eave - 0.14], corners.fl], { at: BUILD + 0.9, dur: 0.2 });
  s.line([corners.fl, corners.fr, corners.br], { at: BUILD + 0.95, dur: 0.7 });
  s.line([[W + over, -over, eave - 0.14], corners.fr], { at: BUILD + 1, dur: 0.2 });
  s.line([corners.fl, apex], { at: BUILD + 1.15, dur: 0.6 });
  s.line([corners.fr, apex], { at: BUILD + 1.2, dur: 0.6 });
  s.line([corners.br, apex], { at: BUILD + 1.25, dur: 0.6 });
  const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
  for (let i = 1; i <= 6; i++) {
    const t = i / 7;
    s.line([lerp(corners.fl, apex, t), lerp(corners.fr, apex, t)], { cls: 'fine', at: FINISH + 0.25 + i * 0.07, dur: 0.45 });
    s.line([lerp(corners.fr, apex, t), lerp(corners.br, apex, t)], { cls: 'fine', at: FINISH + 0.3 + i * 0.07, dur: 0.45 });
  }
  s.line([apex, [apex[0], apex[1], apexZ + 0.32]], { cls: 'accent', at: FINISH + 0.85, dur: 0.3 });

  // A shrub at the front corner.
  const base = s.P(-0.2, -0.55, 0);
  s.sprout([base[0], base[1]], 30, FINISH + 0.6, { lean: -4, spread: 40, leaves: 3 });
  s.sprout([base[0] + 11, base[1]], 22, FINISH + 0.72, { lean: 6, spread: 42 });
  return s.svg('letnjikovac');
}

function garage() {
  const s = sketch(55, [136, 286]);
  const W = 3.6, D = 6, H = 2.55, half = 0.05;
  const door = [0.55, 3.05, 2.15];
  const side = [1.1, 2.0, 2.05];

  s.ground(s.P(0, -0.3, -0.12)[1]);
  [[0, D], [W, D], [0, 0], [W, 0]].forEach(([x, y], i) => s.stake(x, y, 0, 0.3 + i * 0.07));
  s.line([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0], [0, 0, 0]], { cls: 'mark temp', at: 0.45, dur: 0.8 });
  s.dimension(s.P(0, -0.3, -0.12), s.P(W, -0.3, -0.12), [0, 24], '3,60 m', { at: 0.55 });
  s.dimension(s.P(3.9, 0, -0.12), s.P(3.9, D, -0.12), [14, 23], '6,00 m', { at: 0.7, labelGap: 11 });
  s.dimension(s.P(0, -0.3, 0), s.P(0, -0.3, H), [-22, 0], '2,55 m', { at: 0.85 });

  s.planBox([0, 0, 0], [W, D, H], PLAN);
  s.sketchPlan([[door[0], 0, 0], [door[0], 0, door[2]], [door[1], 0, door[2]], [door[1], 0, 0]], PLAN + 0.25);

  s.box([-0.3, -0.3, -0.12], [3.9, 6.3, 0], { at: BUILD, dur: 0.6 });
  // Steel frame: corner columns, the door posts and the ring beam. Walls later hide what lies behind.
  s.line([[0, D, 0], [0, D, H]], { cls: 'soft', at: BUILD + 0.3, dur: 0.6 });
  s.line([[0, D, H], [0, 0, H], [W, 0, H], [W, D, H], [0, D, H]], { at: BUILD + 0.75, dur: 0.75 });
  s.line([[W - 0.05, 3, 0], [W - 0.05, 3, H]], { cls: 'soft', at: BUILD + 0.5, dur: 0.6 });
  s.line([[door[0], 0, 0], [door[0], 0, door[2]], [door[1], 0, door[2]], [door[1], 0, 0]], { at: BUILD + 0.65, dur: 0.6 });

  // Walls close the frame: the fills fade in as the cladding goes on.
  const front = [s.P(0, 0, 0), s.P(W, 0, 0), s.P(W, 0, H), s.P(0, 0, H)];
  const right = [s.P(W, 0, 0), s.P(W, D, 0), s.P(W, D, H), s.P(W, 0, H)];
  s.shade(right, FINISH);
  s.shade(front, FINISH);
  s.box([-half, -half, 0], [half, half, H], { at: BUILD + 0.15, dur: 0.6, rise: true, solid: false });
  s.box([W - half, -half, 0], [W + half, half, H], { at: BUILD + 0.2, dur: 0.6, rise: true, solid: false });
  s.box([W - half, D - half, 0], [W + half, D + half, H], { at: BUILD + 0.25, dur: 0.6, rise: true, solid: false });
  s.line([[door[0], 0, 0], [door[0], 0, door[2]], [door[1], 0, door[2]], [door[1], 0, 0]], { at: FINISH, dur: 0.5 });

  // Vertical cladding on both visible walls, leaving the doors clear.
  let i = 0;
  for (let x = 0.2; x < W - 0.1; x += 0.2) {
    const inDoor = x > door[0] - 0.05 && x < door[1] + 0.05;
    s.line([[x, 0, inDoor ? door[2] + 0.05 : 0], [x, 0, H]], { cls: 'fine', at: FINISH + 0.05 + i++ * 0.03, dur: 0.4 });
  }
  i = 0;
  for (let y = 0.3; y < D - 0.1; y += 0.3) {
    const inDoor = y > side[0] - 0.05 && y < side[1] + 0.05;
    s.line([[W, y, inDoor ? side[2] + 0.05 : 0], [W, y, H]], { cls: 'fine', at: FINISH + 0.1 + i++ * 0.025, dur: 0.4 });
  }
  // Sectional door panels drop into place, then the side door, lamp and gutter.
  for (let p = 1; p <= 4; p++) {
    const z = door[2] - p * (door[2] / 4.2);
    s.line([[door[0] + 0.03, 0, z], [door[1] - 0.03, 0, z]], { at: FINISH + 0.25 + p * 0.09, dur: 0.4 });
  }
  s.line([[W, side[0], 0], [W, side[0], side[2]], [W, side[1], side[2]], [W, side[1], 0]], { at: FINISH + 0.45, dur: 0.5 });
  s.line([[W, side[1] - 0.12, 0.95], [W, side[1] - 0.12, 1.1]], { at: FINISH + 0.8, dur: 0.2 });
  s.box([door[1] + 0.12, 0, 1.95], [door[1] + 0.26, 0.04, 2.08], { cls: 'accent', at: FINISH + 0.85, dur: 0.35 });
  s.line([[W + 0.12, 0.08, 2.55], [W + 0.12, 0.08, 0.05]], { at: FINISH + 0.6, dur: 0.6 });

  s.box([-0.1, -0.1, H], [W + 0.1, D + 0.1, 2.82], { at: BUILD + 1.05, dur: 0.75 });

  return s.svg('garaža');
}

function gardenBeds() {
  const s = sketch(112, [62, 268]);
  const Hb = 0.55, t = 0.05;
  const beds = [
    { x: [1.0, 3.3], y: [1.75, 2.65], at: 0.24, plants: 'tall' },
    { x: [0, 1.9], y: [0, 0.9], at: 0, plants: 'herbs' },
    { x: [2.4, 4.3], y: [0, 0.9], at: 0.12, plants: 'leafy' }
  ];

  s.ground(s.P(0, -0.25, 0)[1]);
  beds.forEach(({ x, y }, i) => {
    s.line([[x[0], y[0], 0], [x[1], y[0], 0], [x[1], y[1], 0], [x[0], y[1], 0], [x[0], y[0], 0]], { cls: 'mark temp', at: 0.35 + i * 0.12, dur: 0.75 });
    s.stake(x[0], y[0], 0, 0.3 + i * 0.1);
  });
  s.dimension(s.P(0, -0.25, 0), s.P(1.9, -0.25, 0), [0, 24], '1,90 m', { at: 0.6 });
  s.dimension(s.P(4.3, 0, 0), s.P(4.3, 0.9, 0), [14, 22], '0,90 m', { at: 0.75, labelGap: 11 });
  s.dimension(s.P(0, -0.25, 0), s.P(0, -0.25, Hb), [-18, 0], '0,55 m', { at: 0.9 });
  beds.forEach(({ x, y, at }) => s.planBox([x[0], y[0], 0], [x[1], y[1], Hb], PLAN + at));

  for (const { x: [x0, x1], y: [y0, y1], at: offset, plants } of beds) {
    const at = BUILD + offset * 2.5;
    s.box([x0, y0, 0], [x1, y1, Hb], { at, dur: 0.75 });
    // Rim seen from above: inner edge of the boards and the soil just below it.
    s.line([[x0 + t, y0 + t, Hb], [x0 + t, y1 - t, Hb], [x1 - t, y1 - t, Hb], [x1 - t, y0 + t, Hb], [x0 + t, y0 + t, Hb]], { at: at + 0.45, dur: 0.6 });
    for (const z of [0.185, 0.37]) s.line([[x0, y0, z], [x1, y0, z], [x1, y1, z]], { cls: 'fine', at: at + 0.55 + z, dur: 0.55 });
    s.line([[x0 + t, y0 + t + 0.4, Hb - 0.08], [x0 + t, y1 - t, Hb - 0.08], [x1 - t, y1 - t, Hb - 0.08]], { cls: 'mark', at: FINISH, dur: 0.5 });

    const row = (count, depth, height, options = {}) => {
      for (let i = 0; i < count; i++) {
        const px = x0 + 0.22 + i * ((x1 - x0 - 0.44) / Math.max(count - 1, 1));
        const base = s.P(px, depth, Hb - 0.08);
        const h = height * (0.85 + ((i * 7) % 4) * 0.08);
        s.sprout(base, h, FINISH + 0.2 + offset + i * 0.09, { lean: ((i % 3) - 1) * 3, ...options });
      }
    };
    if (plants === 'tall') {
      row(5, y0 + 0.62, 46, { spread: 32, leaves: 3, size: 0.45 });
      for (let i = 0; i < 3; i++) {
        const px = x0 + 0.5 + i * 0.65;
        s.line([[px, y0 + 0.75, Hb - 0.08], [px, y0 + 0.75, Hb + 0.75]], { cls: 'soft', at: FINISH + 0.1 + i * 0.08, dur: 0.45 });
      }
    }
    if (plants === 'herbs') row(5, y0 + 0.62, 26, { spread: 48 });
    if (plants === 'leafy') row(4, y0 + 0.6, 22, { spread: 62, size: 0.72, leaves: 3 });
  }
  return s.svg('drvene baštice');
}

const drawings = {
  nadstresnice: { draw: pergola, caption: 'Nadstrešnica. Od prve mere do jutarnje kafe u hladu.' },
  letnjikovci: { draw: gazebo, caption: 'Letnjikovac. Od prve mere do dugih popodneva.' },
  garaze: { draw: garage, caption: 'Garaža. Od prve mere do automobila na suvom.' },
  bastice: { draw: gardenBeds, caption: 'Drvene baštice. Od prve mere do prve sadnje.' }
};

export function buildDrawing(slug) {
  const { draw, caption } = drawings[slug];
  return `<figure class="build-drawing" data-build="${slug}">${draw()}<figcaption><span>${caption}</span><span>Skica izrade</span></figcaption></figure>`;
}

// Service icons for the shortcuts under the hero. They are drawn once on arrival, and each has its
// own small movement on hover (styles.css): slats ripple, the roof lifts, the door opens, sprouts grow.
const icons = {
  nadstresnice() {
    const s = sketch(6.6, [6, 29.5]);
    const W = 4.2, D = 3, H = 2.4;
    s.ground(29.5, 0, [1.5, 46.5]);
    s.line([[0, D, 0], [0, D, H]], { cls: 'soft', at: 0.2, dur: 0.5 });
    s.line([[W, D, 0], [W, D, H]], { at: 0.25, dur: 0.5 });
    s.line([[0, 0, 0], [0, 0, H]], { at: 0.1, dur: 0.5 });
    s.line([[W, 0, 0], [W, 0, H]], { at: 0.15, dur: 0.5 });
    s.line([[-0.4, D, H], [W + 0.4, D, H]], { cls: 'soft', at: 0.45, dur: 0.45 });
    s.line([[-0.4, 0, H], [W + 0.4, 0, H]], { at: 0.5, dur: 0.45 });
    for (let i = 0; i < 6; i++) {
      const x = i * W / 5;
      s.group(`class="icon-slat" style="--i:${i}"`, () => s.line([[x, -0.35, H + 0.2], [x, D + 0.35, H + 0.2]], { at: 0.6 + i * 0.06, dur: 0.4 }));
    }
    return s.body();
  },
  letnjikovci() {
    const s = sketch(5.6, [10, 29.5]);
    const W = 3.2, floor = 0.35, eave = 2.5, over = 0.5, apex = [W / 2, W / 2, 4.1];
    const [fl, fr, br] = [[-over, -over, eave], [W + over, -over, eave], [W + over, W + over, eave]];
    s.ground(29.5, 0, [1.5, 46.5]);
    s.box([0, 0, 0], [W, W, floor], { at: 0.1, dur: 0.5, solid: false });
    s.line([[W - 0.15, W - 0.15, floor], [W - 0.15, W - 0.15, eave]], { cls: 'soft', at: 0.3, dur: 0.4 });
    s.line([[0.15, 0.15, floor], [0.15, 0.15, eave]], { at: 0.25, dur: 0.4 });
    s.line([[W - 0.15, 0.15, floor], [W - 0.15, 0.15, eave]], { at: 0.28, dur: 0.4 });
    s.group('class="icon-roof"', () => {
      s.shade([s.P(...fl), s.P(...fr), s.P(...br), s.P(...apex)], 0.6);
      s.line([fl, fr, br], { at: 0.55, dur: 0.45 });
      s.line([fl, apex], { at: 0.65, dur: 0.4 });
      s.line([fr, apex], { at: 0.7, dur: 0.4 });
      s.line([br, apex], { at: 0.75, dur: 0.4 });
      s.line([apex, [apex[0], apex[1], apex[2] + 0.4]], { cls: 'accent', at: 0.95, dur: 0.25 });
    });
    return s.body();
  },
  garaze() {
    const s = sketch(5.1, [8, 29.5]);
    const W = 3.6, D = 6, H = 2.5, door = [0.55, 3.05, 2.05];
    const [left, bottom] = s.P(door[0], 0, 0);
    const [right, top] = s.P(door[1], 0, door[2]);
    s.ground(29.5, 0, [1.5, 46.5]);
    // The car waits behind the door and shows when the door rolls up.
    s.flat([[left + 1.5, bottom - 0.4], [left + 1.5, bottom - 3.4], [left + 2.7, bottom - 4.6], [left + 3.8, bottom - 6.8], [right - 3.8, bottom - 6.8], [right - 2.7, bottom - 4.6], [right - 1.5, bottom - 3.4], [right - 1.5, bottom - 0.4]], { cls: 'soft', dur: 0.1 });
    s.flat([[left + 2.7, bottom - 4.6], [right - 2.7, bottom - 4.6]], { cls: 'soft', dur: 0.1 });
    s.flat([[left + 2.6, bottom - 2.6], [left + 4, bottom - 2.6]], { cls: 'accent', dur: 0.1 });
    s.flat([[right - 4, bottom - 2.6], [right - 2.6, bottom - 2.6]], { cls: 'accent', dur: 0.1 });
    s.insert(`<clipPath id="shortcut-door"><rect x="${num(left)}" y="${num(top)}" width="${num(right - left)}" height="${num(bottom - top)}"/></clipPath>`);
    s.group('clip-path="url(#shortcut-door)"', () => s.group(`class="icon-door" style="--lift:${num(top - bottom + 1.2)}px"`, () => {
      s.shade([[left, bottom], [right, bottom], [right, top], [left, top]], 0);
      for (let i = 1; i <= 3; i++) s.line([[door[0], 0, door[2] * i / 4], [door[1], 0, door[2] * i / 4]], { cls: 'fine', at: 0.7 + i * 0.06, dur: 0.35 });
    }));
    s.box([0, 0, 0], [W, D, H], { at: 0.1, dur: 0.6, solid: false });
    s.line([[door[0], 0, 0], [door[0], 0, door[2]], [door[1], 0, door[2]], [door[1], 0, 0]], { at: 0.5, dur: 0.45 });
    s.box([-0.15, -0.15, H], [W + 0.15, D + 0.15, H + 0.35], { at: 0.45, dur: 0.5 });
    return s.body();
  },
  bastice() {
    const s = sketch(9.4, [3.5, 29.5]);
    s.ground(29.5, 0, [1.5, 46.5]);
    const beds = [{ x: [1.25, 3.55], y: [1.5, 2.3], plants: [1.75, 3.05] }, { x: [0, 2.35], y: [0, 0.85], plants: [0.45, 1.2, 1.95] }];
    let index = 0;
    beds.forEach(({ x: [x0, x1], y: [y0, y1], plants }, i) => {
      s.box([x0, y0, 0], [x1, y1, 0.6], { at: 0.1 + i * 0.15, dur: 0.55 });
      s.line([[x0, y0, 0.3], [x1, y0, 0.3], [x1, y1, 0.3]], { cls: 'fine', at: 0.4 + i * 0.15, dur: 0.4 });
      for (const px of plants) {
        const base = s.P(px, y0 + 0.5, 0.6);
        s.group(`class="icon-sprout" style="--i:${index}"`, () => s.sprout(base, 6.5, 0.65 + index * 0.08, { spread: 50, size: 0.62 }));
        index++;
      }
    });
    return s.body();
  }
};

export function shortcutIcon(slug) {
  return `<svg class="shortcut-icon" viewBox="0 0 48 32" aria-hidden="true" focusable="false">${icons[slug]()}</svg>`;
}

// Exploded view of a post and beam connection for the craft section. app.js moves each part
// from its offset (data-from, in drawing units) into place while the reader scrolls; data-window
// is the share of that scroll in which the part travels. Dashed guides show where the bolts go
// and fade as they arrive; the labels appear once the joint is complete. Assembled is the default.
export function jointDrawing() {
  const s = sketch(210, [232, 228]);
  const toward = distance => [-0.848 * distance, 0.53 * distance];
  const part = ([dx, dy], window, build, extra = '') => s.group(`class="joint-part" data-from="${num(dx)} ${num(dy)}" data-window="${window}"${extra}`, build);
  const front = (x, z) => s.P(x, -0.012, z);
  const [w, d, top] = [0.09, 0.18, 0.55];

  // The post stays in place; its lower end is left open like a cut detail.
  s.shade([s.P(-w, 0, 0), s.P(w, 0, 0), s.P(w, d, 0), s.P(w, d, top), s.P(-w, d, top), s.P(-w, 0, top)], 0);
  for (const [x, y] of [[-w, 0], [w, 0], [w, d]]) s.line([[x, y, 0], [x, y, top]]);
  s.line([[-0.03, 0, 0.02], [-0.03, 0, 0.22]], { cls: 'fine' });
  s.line([[0.035, 0, 0.08], [0.035, 0, 0.16]], { cls: 'fine' });

  part([34, 24], '.18 .5', () => {
    const brace = [[w, 0.03, 0.12], [0.62, 0.03, top], [0.42, 0.03, top], [w, 0.03, 0.3]].map(p => s.P(...p));
    s.shade(brace, 0);
    s.flat(brace, { close: true });
  });

  part([0, -44], '0 .38', () => {
    s.box([-0.85, 0, top], [0.78, d, 0.79]);
    s.line([[-0.76, 0, 0.64], [-0.3, 0, 0.64]], { cls: 'fine' });
    s.line([[-0.62, 0, 0.71], [-0.44, 0, 0.71]], { cls: 'fine' });
    s.line([[0.3, 0, 0.67], [0.68, 0, 0.67]], { cls: 'fine' });
  });

  part(toward(50), '.38 .7', () => {
    const plate = [[-0.055, 0.3], [0.055, 0.3], [0.055, top], [0.2, top], [0.2, 0.72], [-0.2, 0.72], [-0.2, top], [-0.055, top]].map(([x, z]) => front(x, z));
    s.flat(plate, { cls: 'steel', close: true });
  });

  const bolts = [[0, 0.37], [0, 0.48], [-0.13, 0.635], [0.13, 0.635]];
  const windows = ['.58 .84', '.64 .88', '.7 .93', '.76 .97'];
  const travel = toward(84);
  bolts.forEach(([x, z], i) => {
    const c = front(x, z);
    s.insert(`<path class="joint-guide" d="M${point(c)}L${point([c[0] + travel[0], c[1] + travel[1]])}" data-window="${windows[i]}"/>`);
  });
  bolts.forEach(([x, z], i) => {
    const [cx, cy] = front(x, z);
    const hexagon = Array.from({ length: 6 }, (_, k) => [cx + 5 * Math.cos(k * Math.PI / 3), cy + 5 * Math.sin(k * Math.PI / 3)]);
    part(travel, windows[i], () => s.flat(hexagon, { cls: 'bolt', close: true }), ` data-spin="-300 ${num(cx)} ${num(cy)}"`);
  });

  s.group('class="joint-notes" data-window=".9 1"', () => {
    const beam = s.P(-0.7, 0, 0.79);
    s.label([beam[0], beam[1] - 22], 'Greda', { inline: true });
    const foot = s.P(-w, 0, 0.06);
    s.label([foot[0] - 26, foot[1]], 'Stub', { inline: true });
    const brace = s.P(0.36, 0.03, 0.335);
    s.flat([[brace[0] + 4, brace[1] + 4], [brace[0] + 16, brace[1] + 14]], { cls: 'mark' });
    s.label([brace[0] + 20, brace[1] + 18], 'Kosnik', { inline: true, anchor: 'start' });
    const [from, to] = [front(-0.07, 0.42), front(-0.33, 0.42)];
    s.flat([from, to], { cls: 'mark' });
    s.label([to[0] - 4, to[1]], 'Metalni nosač', { inline: true, anchor: 'end' });
  });

  return `<figure class="joint-drawing" data-assemble><svg class="build-art" viewBox="44 0 384 240" role="img" aria-label="Skica spoja: stub, greda, kosnik i metalni nosač sa vijcima.">${s.body()}</svg><figcaption><span>Spoj grede i stuba, deo po deo.</span><span>Skica detalja</span></figcaption></figure>`;
}
