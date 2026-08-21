import { Organization, OrganizationSummary } from '../models/organization.model';

export const ORGANIZATION_ROW_HEIGHT = 64;
export const SUB_ORGANIZATION_ROW_HEIGHT = 44;

export function countOrganizationEntities(organizations: readonly Organization[]): number {
  return organizations.reduce(
    (total, organization) => total + 1 + organization.subOrganizations.length,
    0,
  );
}

export function estimateOrganizationHeight(organization: Organization): number {
  return (
    ORGANIZATION_ROW_HEIGHT + organization.subOrganizations.length * SUB_ORGANIZATION_ROW_HEIGHT
  );
}

export function filterOrganizationTree(
  organizations: readonly Organization[],
  query: string,
): readonly Organization[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) {
    return organizations;
  }

  return organizations.flatMap((organization) => {
    if (matches(organization, normalizedQuery)) {
      return [organization];
    }

    const matchingChildren = organization.subOrganizations.filter((child) =>
      matches(child, normalizedQuery),
    );
    return matchingChildren.length ? [{ ...organization, subOrganizations: matchingChildren }] : [];
  });
}

function matches(organization: OrganizationSummary, query: string): boolean {
  return `${organization.name} ${organization.location}`.toLocaleLowerCase().includes(query);
}
