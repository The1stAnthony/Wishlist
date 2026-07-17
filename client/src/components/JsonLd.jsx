import { useEffect } from 'react';

/**
 * Injects a JSON-LD <script> into <head> while the component is mounted.
 * Pass any valid Schema.org object (or array of objects) as `data`.
 */
export default function JsonLd({ data }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);
  return null;
}
