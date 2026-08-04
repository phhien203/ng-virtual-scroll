import { Routes } from '@angular/router';

export default [
  {
    path: '',
    providers: [],
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
