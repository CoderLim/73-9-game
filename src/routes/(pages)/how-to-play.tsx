import { createFileRoute } from '@tanstack/react-router';

import { staticPageRouteOptions } from './-static-page';

export const Route = createFileRoute('/(pages)/how-to-play')(
  staticPageRouteOptions('how-to-play')
);
