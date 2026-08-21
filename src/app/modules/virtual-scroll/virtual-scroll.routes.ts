import { Routes } from '@angular/router';

import { OrganizationsApi } from '@modules/virtual-scroll/showcase/api/organizations-api';

export default [
  {
    path: '',
    providers: [OrganizationsApi],
    children: [
      {
        path: '',
        title: 'Virtual Scroll',
        loadComponent: () =>
          import('@modules/virtual-scroll/showcase/virtual-scroll-showcase').then(
            (m) => m.VirtualScrollShowcase,
          ),
      },
    ],
  },
] satisfies Routes;
