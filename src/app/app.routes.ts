import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'virtual-scroll',
  },
  {
    path: 'virtual-scroll',
    loadChildren: () => import('@modules/virtual-scroll/virtual-scroll.routes'),
  },
];
