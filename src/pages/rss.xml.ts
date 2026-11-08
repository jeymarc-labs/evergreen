import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/content';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: 'Jeymarc Sison · Blog',
    description: 'Posts on what I’m working on, my interests, and learning AI in public.',
    site: context.site!,
    trailingSlash: false, // match canonical and internal links (/blog/slug)
    items: posts.filter((p) => !p.draft).map((p) => ({
      title: p.title,
      pubDate: p.date,
      description: p.summary,
      link: `/blog/${p.id}`,
    })),
  });
}
