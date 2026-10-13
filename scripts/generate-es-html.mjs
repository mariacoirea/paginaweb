import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distIndexPath = path.join(root, "dist", "index.html");
const distEsPath = path.join(root, "dist", "es.html");

const spanishTitle = "COIREA · People Operating System | Haz visible el sistema humano detrás de tus resultados";
const spanishDescription =
  "COIREA ayuda a los líderes a medir la salud organizacional y convertir señales invisibles en acción alineada.";

let html = fs.readFileSync(distIndexPath, "utf8");

html = html.replace('<html lang="en">', '<html lang="es">');
html = html.replace(
  /<meta name="description" content="[^"]*" \/>/,
  `<meta name="description" content="${spanishDescription}" />`
);
html = html.replace(
  /<meta property="og:title" content="[^"]*" \/>/,
  `<meta property="og:title" content="${spanishTitle}" />`
);
html = html.replace(
  /<meta property="og:description" content="[^"]*" \/>/,
  `<meta property="og:description" content="${spanishDescription}" />`
);
html = html.replace(
  /<meta property="og:url" content="[^"]*" \/>/,
  '<meta property="og:url" content="https://www.coirea.com/es" />'
);
html = html.replace(
  /<meta name="twitter:title" content="[^"]*" \/>/,
  `<meta name="twitter:title" content="${spanishTitle}" />`
);
html = html.replace(
  /<meta name="twitter:description" content="[^"]*" \/>/,
  `<meta name="twitter:description" content="${spanishDescription}" />`
);
html = html.replace(
  /<link rel="canonical" href="[^"]*" \/>/,
  '<link rel="canonical" href="https://www.coirea.com/es" />'
);
html = html.replace(/<title>[^<]*<\/title>/, `<title>${spanishTitle}</title>`);

if (!fs.existsSync(path.dirname(distEsPath))) {
  throw new Error("dist/ not found - run vite build first");
}
fs.writeFileSync(distEsPath, html, "utf8");
console.log("Generated dist/es.html with Spanish meta, canonical, and og tags for the /es* routes.");
