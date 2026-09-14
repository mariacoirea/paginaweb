# COIREA blog editor guide

This site does not use WordPress yet. The blog is intentionally simple: posts are stored as structured content inside the codebase, and Vercel publishes the site after the repository is updated.

Use this guide when María José or Codex needs to add, edit, or review insight posts.

## Where the blog lives

- Blog data: `src/data/migratedPosts.json`
- Blog cover images: `public/assets/insights/`
- Cover generator: `scripts/generate-insight-covers.mjs`
- Blog safety check: `npm run validate:blog`

Each post has a `slug`. The public URL becomes:

```txt
https://coirea.com/insights/the-post-slug
```

## The safe workflow

1. Open `src/data/migratedPosts.json`.
2. Duplicate the template from `BLOG_POST_TEMPLATE.json`.
3. Fill every required field.
4. Keep `body_content` as HTML, because the site renders the post body from that field.
5. Add or generate a matching cover image in `public/assets/insights/`.
6. Run:

```bash
npm run validate:blog
npm run build
```

7. Preview the post locally before deploying.
8. Commit and push only after the validator and build pass.

## Required fields

- `id`: unique identifier. Use a UUID or a clear unique string.
- `title`: visible article title.
- `slug`: lowercase URL text, using hyphens only.
- `cluster`: topic group, for example `Leadership`, `Strategy`, `Collaboration`, `Well-Being`, `Culture`, or `Systems`.
- `tags`: short list of topic tags.
- `featured_image`: public image path, for example `/assets/insights/my-post.svg`.
- `preview_snippet`: short summary used on the insights listing.
- `body_content`: full article content in HTML.
- `seo_title`: title used by search engines and AI answer engines.
- `meta_description`: concise search description.
- `author`: usually `María José Figueroa`.
- `published`: `true` when it should appear publicly.
- `created_at`: date in `YYYY-MM-DD`.
- `updated_at`: date in `YYYY-MM-DD`.

## Writing rules

- Do not say “migrated posts” or mention internal migration work on the public site.
- Keep titles human and specific.
- Use the first paragraph to explain the tension the reader feels.
- Use short paragraphs; the COIREA tone should feel reflective, precise, and grounded.
- Connect every post back to COIREA’s central idea: organizational evolution, human systems, coherence, leadership, signals, and Steward-supported transformation.

## Codex prompt for adding a new post

```txt
You are working on the COIREA website. Add a new insight post to src/data/migratedPosts.json using the structure in BLOG_POST_TEMPLATE.json. Keep the COIREA voice: systemic, human, precise, non-salesy. Create or assign a cover image under public/assets/insights/. Then run npm run validate:blog and npm run build. Do not deploy until I review the local result.

Post draft:
[paste title, summary, and article text here]
```

## Codex prompt for reviewing the blog

```txt
Review the COIREA insights section. Check that every card links to its post, every post has full body text, cover images feel relevant, and no public copy exposes internal migration language. Run npm run validate:blog and npm run build. Give me a short list of issues before changing anything.
```

## Future WordPress option

If COIREA later wants a true editor dashboard, the clean path is to connect a headless CMS or WordPress API and keep this frontend on Vercel. Until then, this file-based setup is safer, faster, and easier for Codex to maintain through GitHub.
