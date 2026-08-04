export interface OrganizationSummary {
  id: number;
  name: string;
  location: string;
  memberCount: number;
  initials: string;
  accent: string;
}

export interface Organization extends OrganizationSummary {
  subOrganizations: readonly OrganizationSummary[];
}
