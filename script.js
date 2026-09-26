const canvas = document.getElementById("relicCanvas");
const ctx = canvas.getContext("2d");
const hero = document.querySelector(".hero-scroll");
const header = document.querySelector("[data-header]");
const heroCopy = document.querySelector("[data-hero-copy]");
const referenceOrb = document.querySelector(".reference-orb");
const seq = document.querySelector("[data-sequence]");
const bar = document.querySelector("[data-progress-bar]");
const cards = {
  one: document.querySelector('[data-card="one"]'),
  two: document.querySelector('[data-card="two"]'),
  three: document.querySelector('[data-card="three"]'),
};

let width = 0;
let height = 0;
let dpr = 1;
let latestProgress = 0;
let ticking = false;

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw(latestProgress);
}

function clamp(n, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function drawRelic(cx, cy, size, p) {
  const open = clamp((p - 0.32) / 0.42);
  const heat = clamp((p - 0.16) / 0.68);
  const rot = lerp(-0.18, 0.12, p);

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);

  const glow = ctx.createRadialGradient(0, 0, size * 0.12, 0, 0, size * 1.15);
  glow.addColorStop(0, `rgba(255, 207, 119, ${0.24 + heat * 0.26})`);
  glow.addColorStop(0.28, `rgba(245, 163, 59, ${0.15 + heat * 0.18})`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.25, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = `rgba(245, 163, 59, ${0.18 + heat * 0.34})`;
  ctx.shadowBlur = 34 + heat * 34;

  const half = size * 0.5;
  const split = open * size * 0.11;

  // rootbound puzzle-cube pieces: pale bone, muddy teal-gray, and rust plates
  drawPanel(-half - split, -half, size * 0.34, size * 0.48, "bone", heat);
  drawPanel(-half * 0.28, -half - split * 0.5, size * 0.35, size * 0.48, "bone", heat);
  drawPanel(half * 0.12 + split, -half * 0.92, size * 0.38, size * 0.46, "teal", heat);
  drawPanel(-half - split * 0.8, -half * 0.04, size * 0.42, size * 0.48, "teal", heat);
  drawPanel(-half * 0.08, -half * 0.03, size * 0.36, size * 0.45, "rust", heat);
  drawPanel(half * 0.24 + split * 0.8, -half * 0.02, size * 0.32, size * 0.5, "rust", heat);
  drawPanel(-half * 0.42, half * 0.36 + split * 0.3, size * 0.38, size * 0.22, "bone", heat);
  drawPanel(half * 0.02, half * 0.34 + split * 0.35, size * 0.34, size * 0.24, "teal", heat);

  drawMoss(-size * 0.34, -size * 0.48, size, heat);
  drawMoss(size * 0.33, -size * 0.38, size, heat);
  drawMoss(-size * 0.22, size * 0.37, size, heat);

  ctx.shadowBlur = 0;

  // inner ember aperture
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = `rgba(255, 191, 83, ${0.25 + open * 0.58})`;
  roundedRect(-size * 0.17, -size * 0.17, size * 0.34, size * 0.34, size * 0.045);
  ctx.fill();
  ctx.strokeStyle = `rgba(255, 220, 156, ${0.35 + open * 0.45})`;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.restore();

  // carved puzzle lines
  ctx.strokeStyle = `rgba(244, 211, 153, ${0.11 + heat * 0.12})`;
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(-size * 0.42, i * size * 0.16 + Math.sin(i + p * 4) * 3);
    ctx.lineTo(size * 0.42, i * size * 0.12);
    ctx.stroke();
  }

  ctx.restore();
}

function drawPanel(x, y, w, h, side, heat) {
  const palettes = {
    bone: ["#f0dfbd", "#c8a876", "#7f6b54", "#efe2c7"],
    teal: ["#5e7471", "#334c4d", "#8c7659", "#223332"],
    rust: ["#b65b38", "#7f3526", "#d18a55", "#472016"],
  };
  const c = palettes[side] || palettes.bone;
  const g = ctx.createLinearGradient(x, y, x + w, y + h);
  g.addColorStop(0, c[0]);
  g.addColorStop(0.42, c[1]);
  g.addColorStop(0.62, c[2]);
  g.addColorStop(1, c[3]);
  ctx.fillStyle = g;
  puzzlePiecePath(x, y, w, h);
  ctx.fill();

  ctx.strokeStyle = `rgba(41, 24, 17, ${0.55 + heat * 0.16})`;
  ctx.lineWidth = Math.max(1, w * 0.012);
  ctx.stroke();

  ctx.fillStyle = "rgba(40,28,18,.22)";
  for (let i = 0; i < 22; i++) {
    const px = x + ((i * 47) % Math.max(1, w));
    const py = y + ((i * 31) % Math.max(1, h));
    ctx.beginPath();
    ctx.arc(px, py, 1 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = `rgba(245, 232, 196, ${0.10 + heat * 0.12})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + w * 0.18, y + h * 0.24);
  ctx.bezierCurveTo(x + w * 0.38, y + h * 0.12, x + w * 0.55, y + h * 0.42, x + w * 0.82, y + h * 0.28);
  ctx.stroke();
}

function puzzlePiecePath(x, y, w, h) {
  const r = Math.min(w, h) * 0.09;
  const n = Math.min(w, h) * 0.13;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w * 0.42, y);
  ctx.bezierCurveTo(x + w * 0.46, y - n, x + w * 0.58, y - n, x + w * 0.62, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h * 0.42);
  ctx.bezierCurveTo(x + w + n, y + h * 0.46, x + w + n, y + h * 0.58, x + w, y + h * 0.62);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + w * 0.58, y + h);
  ctx.bezierCurveTo(x + w * 0.54, y + h - n, x + w * 0.42, y + h - n, x + w * 0.38, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + h * 0.62);
  ctx.bezierCurveTo(x - n, y + h * 0.58, x - n, y + h * 0.46, x, y + h * 0.42);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawMoss(x, y, size, heat) {
  ctx.save();
  ctx.fillStyle = `rgba(141, 155, 63, ${0.44 + heat * 0.22})`;
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const rr = size * (0.018 + (i % 4) * 0.004);
    ctx.beginPath();
    ctx.arc(x + Math.cos(a) * size * 0.035, y + Math.sin(a) * size * 0.022, rr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function roundedRect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function drawRoots(cx, cy, size, p) {
  const reach = clamp((p - 0.1) / 0.62);
  ctx.save();
  ctx.strokeStyle = `rgba(60, 36, 25, ${0.58 + reach * 0.28})`;
  ctx.lineCap = "round";
  for (let i = 0; i < 18; i++) {
    const angle = (i / 18) * Math.PI * 2 + Math.sin(i) * 0.45;
    const start = size * (0.4 + (i % 3) * 0.06);
    const len = size * (0.38 + (i % 4) * 0.11) * reach;
    ctx.lineWidth = 1.2 + (i % 4) * 0.65;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * start, cy + Math.sin(angle) * start);
    const c1x = cx + Math.cos(angle + 0.9) * (start + len * 0.45);
    const c1y = cy + Math.sin(angle + 0.5) * (start + len * 0.45);
    const ex = cx + Math.cos(angle + Math.sin(i) * 0.8) * (start + len);
    const ey = cy + Math.sin(angle + Math.cos(i) * 0.45) * (start + len);
    ctx.quadraticCurveTo(c1x, c1y, ex, ey);
    ctx.stroke();
  }
  ctx.restore();
}

function drawParticles(p) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 90; i++) {
    const seed = i * 9973;
    const x = ((Math.sin(seed) * 43758.5453) % 1 + 1) % 1 * width;
    const baseY = ((Math.cos(seed) * 24634.6345) % 1 + 1) % 1 * height;
    const y = (baseY - p * height * (0.4 + (i % 7) * 0.08) + height) % height;
    const a = 0.08 + (i % 5) * 0.03;
    ctx.fillStyle = `rgba(245, 163, 59, ${a})`;
    ctx.beginPath();
    ctx.arc(x, y, 0.7 + (i % 3) * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function draw(p) {
  latestProgress = p;
  ctx.clearRect(0, 0, width, height);

  const bg = ctx.createRadialGradient(width * 0.52, height * 0.52, 0, width * 0.52, height * 0.52, Math.max(width, height) * 0.75);
  bg.addColorStop(0, "#1b1810");
  bg.addColorStop(0.32, "#090b07");
  bg.addColorStop(1, "#010101");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  drawParticles(p);

  const cx = width * lerp(0.54, 0.5, clamp((p - 0.22) / 0.5));
  const cy = height * lerp(0.48, 0.42, clamp((p - 0.42) / 0.5));
  const size = Math.min(width, height) * lerp(0.42, 0.78, clamp(p / 0.78));

  drawRoots(cx, cy, size, p);
  drawRelic(cx, cy, size, p);

  // forest-floor grounding so the hero does not feel like an empty void
  const floor = ctx.createLinearGradient(0, height * 0.72, 0, height);
  floor.addColorStop(0, "rgba(0,0,0,0)");
  floor.addColorStop(0.44, "rgba(27,26,16,.34)");
  floor.addColorStop(1, "rgba(8,7,4,.86)");
  ctx.fillStyle = floor;
  ctx.fillRect(0, height * 0.68, width, height * 0.32);
  ctx.fillStyle = "rgba(117, 128, 58, .18)";
  for (let i = 0; i < 34; i++) {
    const x = ((Math.sin(i * 71) * 9999) % 1 + 1) % 1 * width;
    const y = height * (0.76 + (((Math.cos(i * 29) * 9999) % 1 + 1) % 1) * 0.2);
    ctx.beginPath();
    ctx.ellipse(x, y, 18 + (i % 5) * 8, 3 + (i % 3), Math.sin(i) * 0.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // shadow curtain for copy legibility
  const curtain = ctx.createLinearGradient(0, height * .42, 0, height);
  curtain.addColorStop(0, "rgba(0,0,0,0)");
  curtain.addColorStop(1, "rgba(0,0,0,.72)");
  ctx.fillStyle = curtain;
  ctx.fillRect(0, 0, width, height);
}

function update() {
  ticking = false;
  const rect = hero.getBoundingClientRect();
  const scrollable = hero.offsetHeight - window.innerHeight;
  const p = scrollable <= 0 ? 0 : clamp(-rect.top / scrollable);
  latestProgress = p;

  header.classList.toggle("is-scrolled", window.scrollY > 40);

  if (heroCopy) {
    const fade = clamp(1 - p / 0.18);
    heroCopy.style.opacity = fade.toFixed(3);
    heroCopy.style.transform = `translateY(${(1 - fade) * 18}px)`;
  }

  if (referenceOrb) {
    const refFade = clamp(1 - p / 0.34);
    referenceOrb.style.opacity = (refFade * 0.82).toFixed(3);
    referenceOrb.style.transform = `translateY(${(1 - refFade) * -18}px) scale(${1 - p * 0.04})`;
  }

  if (seq) seq.textContent = `SEQ ${String(Math.max(1, Math.round(p * 100))).padStart(3, "0")} / 100`;
  if (bar) bar.style.transform = `scaleX(${p})`;

  cards.one.classList.toggle("is-visible", p > 0.16 && p < 0.36);
  cards.two.classList.toggle("is-visible", p > 0.42 && p < 0.62);
  cards.three.classList.toggle("is-visible", p > 0.7 && p < 0.92);

  draw(p);
}

function requestUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
}

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) entry.target.classList.add("is-visible");
  }
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
window.addEventListener("resize", resize, { passive: true });
window.addEventListener("scroll", requestUpdate, { passive: true });
resize();
update();
