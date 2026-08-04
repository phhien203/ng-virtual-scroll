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
  filterOrganizationTree,
} from '@modules/virtual-scroll/showcase/data/organization-data';
import {
  Organization,
  OrganizationSummary,
} from '@modules/virtual-scroll/showcase/models/organization.model';

@Component({
  selector: 'app-before-org-selector',
  imports: [
    HlmBadgeImports,
    HlmCardImports,
    HlmEmptyImports,
    HlmInputImports,
    HlmSeparatorImports,
    NgIcon,
    OrganizationRow,
  ],
  providers: [provideIcons({ lucideSearch })],
  templateUrl: './before-org-selector.html',
})
export class BeforeOrgSelector {
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
}
