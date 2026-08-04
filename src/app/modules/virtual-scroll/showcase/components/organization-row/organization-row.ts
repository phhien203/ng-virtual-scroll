import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronRight } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';

import { OrganizationSummary } from '@modules/virtual-scroll/showcase/models/organization.model';

@Component({
  selector: 'app-organization-row',
  imports: [HlmAvatarImports, NgIcon],
  providers: [provideIcons({ lucideChevronRight })],
  templateUrl: './organization-row.html',
  styleUrl: './organization-row.scss',
})
export class OrganizationRow {
  readonly organization = input.required<OrganizationSummary>();
}
