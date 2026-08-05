import { Injectable } from '@angular/core';
import { Organization, OrganizationSummary } from '../models/organization.model';

export const ORGANIZATION_GROUP_COUNT = 250;
export const ORGANIZATION_ENTITY_COUNT = 1_000;
export const ORGANIZATION_ROW_HEIGHT = 64;
export const SUB_ORGANIZATION_ROW_HEIGHT = 44;

const namePrefixes = [
  'Northstar',
  'Evergreen',
  'Meridian',
  'Bluepeak',
  'Goodwork',
  'Horizon',
  'Atlas',
  'Brightline',
  'Crescent',
  'Fieldstone',
] as const;

const nameSuffixes = [
  'Apparel',
  'Manufacturing',
  'Textiles',
  'Retail Group',
  'Footwear',
  'Consumer Goods',
  'Supply Co.',
  'Quality Labs',
] as const;

const locations = [
  'Helsinki, Finland',
  'Ho Chi Minh City, Vietnam',
  'Dhaka, Bangladesh',
  'Hong Kong',
  'New York, United States',
  'London, United Kingdom',
  'Porto, Portugal',
  'Jakarta, Indonesia',
] as const;

const accents = ['#7357ff', '#117f74', '#d96040', '#2474d2', '#9a5b0a', '#a83c78'] as const;

@Injectable({
  providedIn: 'root',
})
export class OrganizationData {
  readonly organizations = createOrganizations(ORGANIZATION_GROUP_COUNT);
}

export function createOrganizations(groupCount: number): readonly Organization[] {
  const childCounts = createChildCounts(groupCount);
  let nextId = 1;

  return Array.from({ length: groupCount }, (_, index) => {
    const organization = createOrganizationSummary(nextId++, index);
    const subOrganizations = Array.from({ length: childCounts[index] }, (_, childIndex) =>
      createSubOrganization(nextId++, index, childIndex),
    );

    return { ...organization, subOrganizations };
  });
}

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

function createOrganizationSummary(id: number, index: number): OrganizationSummary {
  const prefix = namePrefixes[index % namePrefixes.length];
  const suffix = nameSuffixes[Math.floor(index / namePrefixes.length) % nameSuffixes.length];
  const sequence = String(index + 1).padStart(4, '0');

  return {
    id,
    name: `${prefix} ${suffix} ${sequence}`,
    location: locations[index % locations.length],
    memberCount: 24 + ((index * 37) % 940),
    initials: `${prefix[0]}${suffix[0]}`,
    accent: accents[index % accents.length],
  };
}

function createSubOrganization(
  id: number,
  parentIndex: number,
  childIndex: number,
): OrganizationSummary {
  const prefix = namePrefixes[(parentIndex * 3 + childIndex + 2) % namePrefixes.length];
  const suffix = nameSuffixes[(parentIndex + childIndex * 5 + 3) % nameSuffixes.length];
  return {
    id,
    name: `${prefix} ${suffix} · Unit ${childIndex + 1}`,
    location: locations[(parentIndex + childIndex + 1) % locations.length],
    memberCount: 6 + ((parentIndex * 19 + childIndex * 31) % 180),
    initials: `${prefix[0]}${suffix[0]}`,
    accent: accents[(parentIndex + childIndex + 1) % accents.length],
  };
}

function createChildCounts(groupCount: number): number[] {
  const counts = Array.from(
    { length: groupCount },
    (_, index) => (index * 17 + index * index * 7) % 7,
  );

  if (groupCount === ORGANIZATION_GROUP_COUNT) {
    const desiredChildren = ORGANIZATION_ENTITY_COUNT - ORGANIZATION_GROUP_COUNT;
    let difference = desiredChildren - counts.reduce((sum, count) => sum + count, 0);
    for (let cursor = 0; difference !== 0; cursor++) {
      const index = (cursor * 7919 + 17) % groupCount;
      if (difference > 0 && counts[index] < 6) {
        counts[index]++;
        difference--;
      } else if (difference < 0 && counts[index] > 0) {
        counts[index]--;
        difference++;
      }
    }
  }

  return counts;
}

function matches(organization: OrganizationSummary, query: string): boolean {
  return `${organization.name} ${organization.location}`.toLocaleLowerCase().includes(query);
}
