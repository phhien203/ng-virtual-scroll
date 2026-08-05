import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, type Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { NavMain } from './nav-main';
import { type SidebarNavigationItem, sidebarData } from '@layout/main-layout/models/sidebar-data';

@Component({
  standalone: true,
  imports: [NavMain],
  template: `<app-nav-main [items]="items" />`,
})
class TestHost {
  readonly items: SidebarNavigationItem[] = [
    ...sidebarData.navMain,
    { title: 'Support', url: '/support', icon: 'lucideGauge' },
  ];
}

@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('NavMain', () => {
  const routes: Routes = [
    {
      path: '',
      component: TestHost,
      children: [
        { path: 'virtual-scroll', component: DummyComponent },
        { path: 'support', component: DummyComponent },
      ],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  function linkFor(harness: RouterTestingHarness, selector: string, label: string): HTMLElement {
    const root = harness.fixture.nativeElement as HTMLElement;
    const links = Array.from(root.querySelectorAll(selector)) as HTMLElement[];
    const link = links.find((el) => el.textContent?.includes(label));
    if (!link) {
      throw new Error(`No ${selector} link with label "${label}" found`);
    }
    return link;
  }

  it('highlights the sub-item and its parent group matching the current URL', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/virtual-scroll');
    await harness.fixture.whenStable();

    const virtualScroll = linkFor(harness, 'a[data-sidebar="menu-sub-button"]', 'Virtual Scroll');
    const performance = linkFor(harness, 'a[data-sidebar="menu-button"]', 'Performance');
    const support = linkFor(harness, 'a[data-sidebar="menu-button"]', 'Support');

    expect(virtualScroll.getAttribute('data-active')).toBe('true');
    expect(performance.getAttribute('data-active')).toBe('true');
    expect(support.getAttribute('data-active')).toBe('false');
  });

  it('highlights a standalone item and clears the previous route on navigation', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/virtual-scroll');
    await harness.fixture.whenStable();

    await harness.navigateByUrl('/support');
    await harness.fixture.whenStable();

    const virtualScroll = linkFor(harness, 'a[data-sidebar="menu-sub-button"]', 'Virtual Scroll');
    const performance = linkFor(harness, 'a[data-sidebar="menu-button"]', 'Performance');
    const support = linkFor(harness, 'a[data-sidebar="menu-button"]', 'Support');

    expect(support.getAttribute('data-active')).toBe('true');
    expect(virtualScroll.getAttribute('data-active')).toBe('false');
    expect(performance.getAttribute('data-active')).toBe('false');
  });
});
