# Blog posts

Markdown files in this folder are loaded automatically. There is no database
row and no entry in `apps/new_main/projects_config.py` to add. Drop a `.md`
file here, push, and it shows up on the Blogs tab.

This README is skipped by the scanner so it is not itself a post.

## File shape

```
| Aug 16, 2026
| updated Aug 20, 2026

# Title that appears on the card and the post page

First paragraph. This becomes the card blurb (truncated to 150 characters).

##### Section heading

Body text. Markdown is rendered with mistune.
```

The updated line is optional. Omit it on first publish. When you revise a
post, add or bump `| updated Mon D, YYYY`. Do not change the created line.

Existing posts that only have `| Aug 15, 2026` are treated as created-only.

## What the site derives

| Field | Source |
| --- | --- |
| Title | The markdown H1 (so punctuation like `Chewy thoughts:` survives) |
| URL slug | The filename, lowercased, non-alphanumerics turned into hyphens. `chewy thoughts foo.md` → `/blogs/chewy-thoughts-foo` |
| Card blurb | First non-empty line that is not a `\|` date line or a heading |
| Created date | First leading `\| Mon D, YYYY` line (optional `created` label) |
| Updated date | Optional leading `\| updated Mon D, YYYY` line |
| Listing order | Newest **created** date first. An edit does not reshuffle the grid |

On the post page, a created-only post shows `| Aug 16, 2026`. A revised post
shows `| Aug 16, 2026 · updated Aug 20, 2026`. Listing cards always show the
created date.

Date lines must sit at the top of the file, before the H1. Later markdown
tables are not treated as dates.

## Chewy thoughts

The `Chewy thoughts:` posts are first-person argumentative essays, not
listicles. Conventions from the existing ones:

- Title form: `Chewy thoughts: <claim>`
- Filename form: `chewy thoughts <claim>.md`
- `#####` section heads
- Separate mechanisms that look the same in a headline
- End with what would have to be true, then a short restatement of the thesis
- Footer: *The hypothesis is mine. I worked it out in conversation, then asked an AI to synthesize my notes into this essay.*
