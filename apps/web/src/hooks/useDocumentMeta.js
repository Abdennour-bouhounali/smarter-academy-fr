import { useEffect } from 'react';

const DEFAULT_TITLE = 'Smarter Academy';
const SITE_SUFFIX = ' — Smarter Academy';

/**
 * Minimal per-page <title> + meta description, since nothing in this app
 * sets either per route today (every page ships the same static index.html
 * meta). Plain useEffect + direct DOM writes — no react-helmet — because a
 * two-field, no-SSR need doesn't justify a new dependency.
 *
 * @param {string} title    Page-specific title, without the site suffix.
 * @param {string} [description]
 */
export function useDocumentMeta(title, description) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title}${SITE_SUFFIX}` : DEFAULT_TITLE;

    let previousDescription;
    let metaTag;
    if (description) {
      metaTag = document.querySelector('meta[name="description"]');
      if (metaTag) {
        previousDescription = metaTag.getAttribute('content');
        metaTag.setAttribute('content', description);
      }
    }

    return () => {
      document.title = previousTitle;
      if (metaTag && previousDescription !== undefined) {
        metaTag.setAttribute('content', previousDescription);
      }
    };
  }, [title, description]);
}
