import { Component, computed, inject, signal } from '@angular/core';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';

import { OrganizationsApi } from '@modules/virtual-scroll/showcase/api/organizations-api';
import { AfterOrgSelector } from '@modules/virtual-scroll/showcase/components/after-org-selector/after-org-selector';
import { BeforeOrgSelector } from '@modules/virtual-scroll/showcase/components/before-org-selector/before-org-selector';
import { countOrganizationEntities } from '@modules/virtual-scroll/showcase/data/organization-data';

@Component({
  selector: 'app-virtual-scroll',
  imports: [
    AfterOrgSelector,
    BeforeOrgSelector,
    HlmAlertImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmEmptyImports,
    HlmSkeletonImports,
  ],
  templateUrl: './virtual-scroll-showcase.html',
})
export class VirtualScrollShowcase {
  private readonly organizationsApi = inject(OrganizationsApi);

  protected readonly organizationsResource = this.organizationsApi.organizations;
  protected readonly organizations = computed(() => this.organizationsResource.value() ?? []);
  protected readonly organizationCount = computed(() =>
    countOrganizationEntities(this.organizations()),
  );
  protected readonly showBaseline = signal(false);

  protected readonly steps = [
    {
      number: '01',
      title: 'Estimate group heights',
      description: 'Use the known 64px parent row and 44px child row dimensions.',
    },
    {
      number: '02',
      title: 'Resolve the visible range',
      description: 'Binary-search cumulative offsets and include a small pixel buffer.',
    },
    {
      number: '03',
      title: 'Measure and correct',
      description: 'Observe rendered groups and update offsets when browser dimensions differ.',
    },
  ];

  protected reloadOrganizations(): void {
    this.organizationsResource.reload();
  }
}
