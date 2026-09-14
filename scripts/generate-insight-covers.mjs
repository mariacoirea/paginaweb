import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsPath = path.join(root, "src", "data", "migratedPosts.json");
const outputDir = path.join(root, "public", "assets", "insights");

const covers = [
  ["coirea-evolution", "Regeneration", "bridge"],
  ["five-pillars-regenerative-business", "Five pillars", "pillars"],
  ["7-principles-of-living-organizations", "Living logic", "rings"],
  ["develop-conscious-leadership-skills", "Leadership", "field"],
  ["organizational-systems-change", "Roots", "roots"],
  ["burnout-in-social-impact-teams", "Burnout", "pulse"],
  ["ai-ready-companies", "Human AI", "network"],
  ["organizational-resilience-in-a-living-world", "Resilience", "canopy"],
  ["why-self-management-fails", "Autonomy", "orbit"],
  ["why-gen-z-won-t-work-for-you", "Coherence", "signal"],
  ["the-operating-system-of-the-future-company", "Operating system", "system"],
  ["humanizing-ai-in-organizations", "Human AI", "human"],
  ["businesses-need-renewal", "Renewal", "cycles"],
  ["cultural-reset", "Culture reset", "threshold"],
  ["tealorganizations", "Teal future", "teal"],
  ["delegation-without-burnout", "Delegation", "handoff"],
  ["culture-is-what-you-do-when-no-one-s-watching", "Culture", "shadow"],
  ["company-as-a-body-safety-nervous-system", "Safety", "body"],
  ["what-s-missing-in-company-culture-today", "Missing signals", "gap"],
  ["conscious-companies-and-leaders-keys-to-sustainable-success", "Conscious company", "compass"],
  ["10-well-being-programs", "Well-being", "garden"],
  ["strategic-leadership-retreats-", "Retreats", "path"],
  ["regenerative-business-restoring-planet-and-society", "Restoration", "planet"],
  ["ancient-tools-modern-performance", "Ancient tools", "breath"],
  ["conscious-leadership-practice", "Presence", "presence"],
];

const palettes = [
  ["#173728", "#2f6b50", "#d2ad68", "#eef0df"],
  ["#193b2b", "#54724c", "#c29a58", "#f3eadb"],
  ["#12362d", "#23635b", "#d4b071", "#e8efe2"],
  ["#1f392b", "#6c7d52", "#bd8755", "#f1e5d4"],
  ["#163226", "#4f6e5a", "#dec78a", "#ece8d8"],
];

const escapeXml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const hash = (value) => [...value].reduce((sum, char) => sum + char.charCodeAt(0), 0);

const contourLines = (id, color) => Array.from({ length: 7 }, (_, index) => {
  const y = 118 + index * 82;
  const wiggle = 26 + (index % 3) * 9;
  return `<path d="M-40 ${y} C 170 ${y - wiggle}, 270 ${y + wiggle}, 480 ${y - 4} S 770 ${y + wiggle}, 980 ${y - 18} S 1210 ${y + wiggle}, 1460 ${y - 8}" fill="none" stroke="${color}" stroke-width="${index === 3 ? 2 : 1}" opacity="${0.16 + index * 0.018}"/>`;
}).join("");

const nodes = (seed, color, accent) => Array.from({ length: 13 }, (_, index) => {
  const x = 145 + ((seed * (index + 3) * 37) % 1050);
  const y = 130 + ((seed * (index + 5) * 29) % 500);
  const r = 5 + ((seed + index) % 9);
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${index % 4 === 0 ? accent : color}" opacity="${index % 4 === 0 ? 0.72 : 0.38}"/>`;
}).join("");

const networkLines = (seed, color) => Array.from({ length: 10 }, (_, index) => {
  const x1 = 170 + ((seed * (index + 2) * 41) % 940);
  const y1 = 160 + ((seed * (index + 4) * 31) % 440);
  const x2 = 230 + ((seed * (index + 7) * 43) % 940);
  const y2 = 160 + ((seed * (index + 8) * 23) % 440);
  return `<path d="M${x1} ${y1} C ${(x1 + x2) / 2} ${y1 - 70}, ${(x1 + x2) / 2} ${y2 + 70}, ${x2} ${y2}" fill="none" stroke="${color}" stroke-width="1.4" opacity=".24"/>`;
}).join("");

function motif(type, seed, forest, moss, gold, paper) {
  const common = `${contourLines(seed, paper)}${networkLines(seed, paper)}${nodes(seed, moss, gold)}`;
  if (["network", "system", "human", "signal", "gap"].includes(type)) {
    return `${common}<g transform="translate(920 180)" opacity=".9"><circle cx="120" cy="160" r="116" fill="none" stroke="${gold}" stroke-width="2" opacity=".52"/><circle cx="120" cy="160" r="62" fill="${forest}" opacity=".74"/><path d="M28 160H212M120 68V252M70 110L170 210M170 110L70 210" stroke="${paper}" stroke-width="2" opacity=".42"/></g>`;
  }
  if (["roots", "garden", "regeneration", "planet", "bridge"].includes(type)) {
    return `${common}<g transform="translate(835 110)" fill="none" stroke="${gold}" stroke-linecap="round" opacity=".76"><path d="M170 70 C138 150 124 205 160 285 C196 365 156 425 118 498" stroke-width="4"/><path d="M158 284 C98 286 64 326 38 382" stroke-width="2"/><path d="M158 285 C218 286 266 326 300 392" stroke-width="2"/><path d="M144 180 C92 164 70 124 48 82" stroke-width="2"/><path d="M154 188 C214 158 250 114 284 58" stroke-width="2"/></g>`;
  }
  if (["cycles", "rings", "orbit", "teal", "presence"].includes(type)) {
    return `${common}<g transform="translate(930 142)" fill="none"><circle cx="130" cy="210" r="148" stroke="${gold}" stroke-width="2" opacity=".66"/><circle cx="130" cy="210" r="98" stroke="${paper}" stroke-width="1.5" opacity=".34"/><circle cx="130" cy="210" r="48" fill="${moss}" opacity=".54"/><path d="M130 62 A148 148 0 0 1 278 210" stroke="${gold}" stroke-width="9" stroke-linecap="round"/><path d="M130 358 A148 148 0 0 1 -18 210" stroke="${paper}" stroke-width="5" stroke-linecap="round" opacity=".4"/></g>`;
  }
  if (["pulse", "body", "breath", "field"].includes(type)) {
    return `${common}<g transform="translate(815 170)" fill="none" stroke-linecap="round"><path d="M30 210 C110 210 90 120 150 120 C220 120 190 318 265 318 C334 318 318 210 410 210" stroke="${gold}" stroke-width="5"/><path d="M42 278 C122 278 120 220 182 220 C252 220 238 356 318 356 C370 356 382 278 428 278" stroke="${paper}" stroke-width="2" opacity=".35"/></g>`;
  }
  if (["handoff", "threshold", "compass", "path", "canopy", "shadow"].includes(type)) {
    return `${common}<g transform="translate(800 112)"><path d="M30 410 C150 260 220 330 310 185 C370 90 430 80 512 54" fill="none" stroke="${gold}" stroke-width="5" stroke-linecap="round"/><circle cx="30" cy="410" r="18" fill="${paper}" opacity=".8"/><circle cx="310" cy="185" r="24" fill="${moss}" opacity=".62"/><circle cx="512" cy="54" r="30" fill="${gold}" opacity=".78"/></g>`;
  }
  return common;
}

function svgForPost(post, index, label, type) {
  const [forest, moss, gold, paper] = palettes[index % palettes.length];
  const seed = hash(post.slug);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="788" viewBox="0 0 1400 788" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(post.title)}</title>
  <desc id="desc">Abstract COIREA insight cover representing ${escapeXml(label.toLowerCase())} through living-system lines, nodes, and natural rhythms.</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${forest}"/>
      <stop offset=".58" stop-color="${moss}"/>
      <stop offset="1" stop-color="${forest}"/>
    </linearGradient>
    <radialGradient id="glow" cx=".22" cy=".18" r=".72">
      <stop offset="0" stop-color="${gold}" stop-opacity=".5"/>
      <stop offset=".42" stop-color="${gold}" stop-opacity=".12"/>
      <stop offset="1" stop-color="${forest}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft"><feGaussianBlur stdDeviation="28"/></filter>
  </defs>
  <rect width="1400" height="788" fill="url(#bg)"/>
  <rect width="1400" height="788" fill="url(#glow)"/>
  <circle cx="${180 + (seed % 180)}" cy="${110 + (seed % 90)}" r="210" fill="${gold}" opacity=".18" filter="url(#soft)"/>
  <circle cx="${1040 - (seed % 140)}" cy="${600 - (seed % 110)}" r="260" fill="${paper}" opacity=".08" filter="url(#soft)"/>
  ${motif(type, seed, forest, moss, gold, paper)}
  <g opacity=".92">
    <text x="92" y="116" font-size="18" font-family="Arial, sans-serif" font-weight="800" letter-spacing="5" fill="${gold}">COIREA INSIGHT</text>
    <text x="92" y="616" font-size="54" font-family="Georgia, 'Times New Roman', serif" font-weight="700" fill="${paper}" opacity=".94">${escapeXml(label)}</text>
  </g>
  <path d="M92 664H420" stroke="${gold}" stroke-width="2" opacity=".72"/>
  <text x="92" y="714" font-size="18" font-family="Arial, sans-serif" fill="${paper}" opacity=".7">${escapeXml(post.cluster || "Organizational evolution")}</text>
</svg>
`;
}

fs.mkdirSync(outputDir, { recursive: true });

const posts = JSON.parse(fs.readFileSync(postsPath, "utf8").replace(/^\uFEFF/, ""));
const coverMap = new Map(covers.map(([slug, label, type], index) => [slug, { label, type, index }]));

for (const post of posts) {
  const config = coverMap.get(post.slug);
  if (!config) continue;
  const filename = `${post.slug}.svg`;
  fs.writeFileSync(path.join(outputDir, filename), svgForPost(post, config.index, config.label, config.type));
  post.featured_image = `/assets/insights/${filename}`;
}

fs.writeFileSync(postsPath, `${JSON.stringify(posts, null, 2)}\n`);
console.log(`Generated ${covers.length} insight covers in ${path.relative(root, outputDir)} and updated featured_image fields.`);
