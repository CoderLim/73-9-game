import { createFileRoute } from '@tanstack/react-router';

import { getConfig } from '@/modules/config/service';

export const Route = createFileRoute('/ads.txt')({
  server: {
    handlers: {
      GET: async () => {
        // The publisher ID carries a "ca-" prefix in the AdSense UI, but
        // ads.txt wants the bare "pub-…" form.
        // Admin DB overrides; keep the same publisher default as __root.tsx.
        const code =
          (await getConfig('adsense_code'))?.trim() ||
          'ca-pub-8028656293202971';
        const pubId = code.replace(/^ca-/, '');
        const body = pubId
          ? `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`
          : '';
        return new Response(body, {
          headers: { 'Content-Type': 'text/plain' },
        });
      },
    },
  },
});
