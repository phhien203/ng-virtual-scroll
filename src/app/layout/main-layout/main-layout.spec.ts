describe('MainLayout', () => {
  it('shows the active route title in the breadcrumb', async () => {
    // TestBed.configureTestingModule({
    //   providers: [
    //     provideRouter([
    //       {
    //         path: '',
    //         component: MainLayout,
    //         children: [
    //           {
    //             path: 'virtual-scroll',
    //             loadChildren: () => import('@modules/virtual-scroll/virtual-scroll.routes'),
    //           },
    //         ],
    //       },
    //     ]),
    //   ],
    // });
    // const harness = await RouterTestingHarness.create();
    // await harness.navigateByUrl('/virtual-scroll');
    // expect(harness.routeNativeElement?.textContent).toContain('Virtual Scroll');
    // expect(harness.routeNativeElement?.textContent).not.toContain('Dashboard');
  });
});
