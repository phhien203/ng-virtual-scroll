import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { Component, computed, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';

import { OrganizationRow } from '@modules/virtual-scroll/showcase/components/organization-row/organization-row';
import {
  countOrganizationEntities,
  estimateOrganizationHeight,
  filterOrganizationTree,
} from '@modules/virtual-scroll/showcase/data/organization-data';
import { MeasureVirtualItem } from '@modules/virtual-scroll/showcase/directives/measure-virtual-item';
import { VariableSizeVirtualScroll } from '@modules/virtual-scroll/showcase/directives/variable-size-virtual-scroll';
import {
  Organization,
  OrganizationSummary,
} from '@modules/virtual-scroll/showcase/models/organization.model';

@Component({
  selector: 'app-after-org-selector',
  imports: [
    HlmBadgeImports,
    HlmCardImports,
    HlmEmptyImports,
    HlmInputImports,
    HlmSeparatorImports,
    MeasureVirtualItem,
    NgIcon,
    OrganizationRow,
    ScrollingModule,
    VariableSizeVirtualScroll,
  ],
  providers: [provideIcons({ lucideSearch })],
  templateUrl: './after-org-selector.html',
})
export class AfterOrgSelector {
  readonly organizations = input.required<readonly Organization[]>();

  protected readonly query = signal('');
  protected readonly selectedId = signal<number | null>(null);
  protected readonly interactionLatency = signal<number | null>(null);
  protected readonly filteredOrganizations = computed(() =>
    filterOrganizationTree(this.organizations(), this.query()),
  );
  protected readonly visibleEntityCount = computed(() =>
    countOrganizationEntities(this.filteredOrganizations()),
  );
  protected readonly estimatedHeights = computed(() =>
    this.filteredOrganizations().map(estimateOrganizationHeight),
  );

  protected onSearch(event: Event): void {
    const startedAt = performance.now();
    this.query.set((event.target as HTMLInputElement).value);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.interactionLatency.set(performance.now() - startedAt));
    });
  }

  protected select(organization: OrganizationSummary): void {
    this.selectedId.set(organization.id);
  }

  protected trackById(_index: number, organization: Organization): number {
    return organization.id;
  }

  protected renderedCount(viewport: CdkVirtualScrollViewport): number {
    const range = viewport.getRenderedRange();
    return countOrganizationEntities(this.filteredOrganizations().slice(range.start, range.end));
  }
}
