import { Component, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight, lucideGauge } from '@ng-icons/lucide';
import { HlmCollapsibleImports } from '@spartan-ng/helm/collapsible';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { filter, map, startWith } from 'rxjs';

import { SidebarNavigationItem, SidebarSubItem } from '@layout/main-layout/models/sidebar-data';

@Component({
  selector: 'app-nav-main',
  imports: [HlmSidebarImports, HlmCollapsibleImports, NgIcon, RouterLink],
  providers: [
    provideIcons({
      lucideChevronRight,
      lucideGauge,
    }),
  ],
  template: `
    <hlm-sidebar-group>
      <div hlmSidebarGroupLabel>Platform</div>
      <ul hlmSidebarMenu>
        @for (item of items(); track item.title) {
          <hlm-collapsible [expanded]="itemActive(item)">
            <li hlmSidebarMenuItem>
              <a hlmSidebarMenuButton [isActive]="itemActive(item)" [routerLink]="item.url">
                <ng-icon [name]="item.icon" />
                <span>{{ item.title }}</span>
              </a>
              @if (item.items; as subItems) {
                <button
                  hlmCollapsibleTrigger
                  hlmSidebarMenuAction
                  class="data-[state=open]:rotate-90"
                  type="button"
                >
                  <ng-icon name="lucideChevronRight" />
                  <span class="sr-only">Toggle {{ item.title }} navigation</span>
                </button>
                <hlm-collapsible-content>
                  <ul hlmSidebarMenuSub>
                    @for (subItem of subItems; track subItem.title) {
                      <li hlmSidebarMenuSubItem>
                        <a
                          hlmSidebarMenuSubButton
                          [isActive]="subItemActive(subItem)"
                          [routerLink]="subItem.url"
                        >
                          {{ subItem.title }}
                        </a>
                      </li>
                    }
                  </ul>
                </hlm-collapsible-content>
              }
            </li>
          </hlm-collapsible>
        }
      </ul>
    </hlm-sidebar-group>
  `,
})
export class NavMain {
  readonly items = input.required<SidebarNavigationItem[]>();

  private readonly router = inject(Router);

  /** The current URL path (minus query/hash and trailing slash), updated on navigation. */
  private readonly currentPath = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(() => this.pathOf(this.router.url)),
      startWith(this.pathOf(this.router.url)),
    ),
    { initialValue: this.pathOf(this.router.url) },
  );

  /**
   * A top-level item is active when the current URL matches its own link, or — for an item that
   * groups sub-items — when any of its sub-item links match (which also keeps its section expanded).
   */
  protected readonly itemActive = (item: SidebarNavigationItem): boolean => {
    if (item.items?.length) {
      return item.items.some((subItem) => this.subItemActive(subItem));
    }

    return this.pathOf(item.url) === this.currentPath();
  };

  protected readonly subItemActive = (subItem: SidebarSubItem): boolean =>
    this.pathOf(subItem.url) === this.currentPath();

  private pathOf(url: string): string {
    const withoutTrailingSlash = url.split('?')[0];
    return withoutTrailingSlash.endsWith('/') && withoutTrailingSlash.length > 1
      ? withoutTrailingSlash.slice(0, -1)
      : withoutTrailingSlash;
  }
}
