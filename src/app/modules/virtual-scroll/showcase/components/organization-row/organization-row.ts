import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

import { OrganizationSummary } from '@modules/virtual-scroll/showcase/models/organization.model';

@Component({
  selector: 'app-organization-row',
  imports: [HlmAvatarImports, NgIcon],
  providers: [provideIcons({ lucideChevronRight })],
  host: {
    class:
      'grid w-full min-w-0 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 text-left bg-inherit',
  },
  templateUrl: './organization-row.html',
})
export class OrganizationRow {
  readonly organization = input.required<OrganizationSummary>();
}
