import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distIndexPath = path.join(root, "dist", "index.html");

// Pull the per-route Spanish SEO copy straight from the source of truth (App.jsx) instead of
// duplicating it here, so the static pages and the client-rendered SEOManager never drift apart.
const appSrc = fs.readFileSync(path.join(root, "src", "App.jsx"), "utf8");
function extractConst(name) {
  const start = appSrc.indexOf(`const ${name} = {`);
  const end = appSrc.indexOf("\n};", start) + 3;
  if (start === -1 || end === 2) throw new Error(`could not find const ${name} in App.jsx`);
  // eslint-disable-next-line no-eval
  return eval(`(function(){ ${appSrc.slice(start, end)} return ${name}; })()`);
}
const spanishSeoByRoute = extractConst("spanishSeoByRoute");

// route -> output filename served by that /es* path (see vercel.json for the matching rewrites).
const routeToFile = {
  "/": "es.html",
  "/about": "es-about.html",
  "/conversation": "es-conversation.html",
  "/insights": "es-insights.html",
  "/insights/what-is-a-people-operating-system": "es-insights-what-is-a-people-operating-system.html",
};

const baseHtml = fs.readFileSync(distIndexPath, "utf8");

function buildEsHtml(route, seo) {
  const enPath = route === "/" ? "/" : route;
  const esPath = route === "/" ? "/es" : `/es${route}`;
  const canonicalHref = `https://www.coirea.com${esPath}`;
  const enHref = `https://www.coirea.com${enPath}`;

  let html = baseHtml;
  html = html.replace('<html lang="en">', '<html lang="es">');
  html = html.replace(
    /<meta name="description" content="[^"]*" \/>/,
    `<meta name="description" content="${seo.description}" />`
  );
  html = html.replace(
    /<meta property="og:title" content="[^"]*" \/>/,
    `<meta property="og:title" content="${seo.title}" />`
  );
  html = html.replace(
    /<meta property="og:description" content="[^"]*" \/>/,
    `<meta property="og:description" content="${seo.description}" />`
  );
  html = html.replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${canonicalHref}" />`);
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*" \/>/,
    `<meta name="twitter:title" content="${seo.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*" \/>/,
    `<meta name="twitter:description" content="${seo.description}" />`
  );
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${canonicalHref}" />`);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${seo.title}</title>`);

  // The hreflang block is identical in shape to the one already in index.html; just point it at
  // this specific route's pair of URLs instead of the homepage's.
  html = html.replace(
    /<link rel="alternate" hreflang="en" href="[^"]*" \/>\s*<link rel="alternate" hreflang="es" href="[^"]*" \/>\s*<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/,
    `<link rel="alternate" hreflang="en" href="${enHref}" />\n    <link rel="alternate" hreflang="es" href="${canonicalHref}" />\n    <link rel="alternate" hreflang="x-default" href="${enHref}" />`
  );

  return html;
}

if (!fs.existsSync(path.join(root, "dist"))) {
  throw new Error("dist/ not found - run vite build first");
}

let count = 0;
for (const [route, filename] of Object.entries(routeToFile)) {
  const seo = spanishSeoByRoute[route];
  if (!seo) continue;
  const outPath = path.join(root, "dist", filename);
  fs.writeFileSync(outPath, buildEsHtml(route, seo), "utf8");
  count++;
  console.log(`Generated dist/${filename} for /es${route === "/" ? "" : route}`);
}
console.log(`Done: ${count} Spanish static pages generated with per-route meta, canonical, and hreflang.`);
