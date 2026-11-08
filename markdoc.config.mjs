// Markdoc rendering rules for posts written in the admin.
import { defineMarkdocConfig, nodes, Markdoc } from '@astrojs/markdoc/config';
import { isSafeHref } from './src/lib/links.ts';

export default defineMarkdocConfig({
  nodes: {
    // The post title is the page's only <h1>: a "# Heading" in a post renders as <h2>.
    heading: {
      ...nodes.heading,
      transform(node, config) {
        if (node.attributes.level < 2) node.attributes.level = 2;
        return nodes.heading.transform(node, config);
      },
    },
    // Only web, email and same-site links become links; anything else (javascript:, data:)
    // is shown as plain text.
    link: {
      ...nodes.link,
      transform(node, config) {
        const children = node.transformChildren(config);
        if (!isSafeHref(node.attributes.href)) return children;
        return new Markdoc.Tag('a', node.transformAttributes(config), children);
      },
    },
  },
});
