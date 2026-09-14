import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const postsPath = path.join(root, "src", "data", "migratedPosts.json");
const sitemapPath = path.join(root, "public", "sitemap.xml");

const requiredFields = [
  "id",
  "title",
  "slug",
  "cluster",
  "featured_image",
  "preview_snippet",
  "body_content",
  "seo_title",
  "meta_description",
  "created_at",
  "updated_at",
];

const errors = [];
const warnings = [];

function fail(message) {
  errors.push(message);
}

function warn(message) {
  warnings.push(message);
}

function stripHtml(value = "") {
  return String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function isReadableFile(publicPath) {
  if (!publicPath || !publicPath.startsWith("/")) return false;
  return fs.existsSync(path.join(root, "public", publicPath.replace(/^\//, "")));
}

let posts;
try {
  posts = JSON.parse(fs.readFileSync(postsPath, "utf8"));
} catch (error) {
  fail(`Could not read or parse ${path.relative(root, postsPath)}: ${error.message}`);
  posts = [];
}

if (!Array.isArray(posts)) {
  fail("migratedPosts.json must export an array of blog post objects.");
  posts = [];
}

const slugCounts = new Map();
const idCounts = new Map();

for (const post of posts) {
  if (!post || typeof post !== "object") {
    fail("Every blog post entry must be an object.");
    continue;
  }

  const label = post.slug || post.title || "Untitled post";

  for (const field of requiredFields) {
    if (!post[field]) fail(`${label}: missing required field "${field}".`);
  }

  if (post.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*-?$/.test(post.slug)) {
    fail(`${label}: slug should use lowercase letters, numbers, and hyphens only.`);
  }

  if (post.id) idCounts.set(post.id, (idCounts.get(post.id) || 0) + 1);
  if (post.slug) slugCounts.set(post.slug, (slugCounts.get(post.slug) || 0) + 1);

  if (post.featured_image && !isReadableFile(post.featured_image)) {
    fail(`${label}: featured_image does not exist at ${post.featured_image}.`);
  }

  const bodyText = stripHtml(post.body_content);
  if (bodyText.length < 600) {
    warn(`${label}: body_content is short (${bodyText.length} characters).`);
  }

  if (post.preview_snippet && post.preview_snippet.length > 360) {
    warn(`${label}: preview_snippet is long (${post.preview_snippet.length} characters). Aim for 140-260.`);
  }

  if (post.meta_description && post.meta_description.length > 170) {
    warn(`${label}: meta_description is long (${post.meta_description.length} characters). Aim for 140-160.`);
  }

  if (post.seo_title && post.seo_title.length > 70) {
    warn(`${label}: seo_title is long (${post.seo_title.length} characters). Aim for 45-65.`);
  }

  if (post.published !== true) {
    warn(`${label}: published is not true, so confirm whether it should appear publicly.`);
  }

  if (!Array.isArray(post.tags) || post.tags.length === 0) {
    warn(`${label}: add 2-6 topic tags for filtering and AI search context.`);
  }
}

for (const [slug, count] of slugCounts) {
  if (count > 1) fail(`Duplicate slug found: ${slug}`);
}

for (const [id, count] of idCounts) {
  if (count > 1) fail(`Duplicate id found: ${id}`);
}

if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  for (const post of posts.filter((item) => item?.published === true)) {
    const expectedUrl = `https://www.coirea.com/insights/${post.slug}`;
    if (!sitemap.includes(expectedUrl)) {
      warn(`${post.slug}: published post is missing from sitemap.xml.`);
    }
  }
} else {
  warn("public/sitemap.xml was not found.");
}

console.log(`Checked ${posts.length} blog posts.`);

if (warnings.length) {
  console.log("\nWarnings:");
  for (const item of warnings) console.log(`- ${item}`);
}

if (errors.length) {
  console.error("\nErrors:");
  for (const item of errors) console.error(`- ${item}`);
  process.exit(1);
}

console.log("\nBlog validation passed.");
