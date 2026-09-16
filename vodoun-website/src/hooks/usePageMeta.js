import { useEffect } from 'react';

const SITE_NAME = 'Vodoun Concept Store';

/**
 * Sets document title and meta description for the current page.
 * Falls back to site defaults if no values provided.
 */
export default function usePageMeta({ title, description } = {}) {
  useEffect(() => {
    // Title
    document.title = title
      ? `${title} — ${SITE_NAME}`
      : `${SITE_NAME} — Là où le sacré devient désirable`;

    // Description
    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
      meta.setAttribute(
        'content',
        description ||
          'Vodoun Concept Store : mobilier d\'art, bijoux, décorations festives et mode inspirés de la culture Vodoun. Artisanat béninois d\'exception. Ouidah, Bénin.'
      );
    }

    // Cleanup on unmount — restore defaults
    return () => {
      document.title = `${SITE_NAME} — Là où le sacré devient désirable`;
    };
  }, [title, description]);
}
