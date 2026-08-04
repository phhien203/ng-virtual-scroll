import { TestBed } from '@angular/core/testing';
import {
  countOrganizationEntities,
  createOrganizations,
  filterOrganizationTree,
  OrganizationData,
} from './organization-data';

describe('OrganizationData', () => {
  let service: OrganizationData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrganizationData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should provide 10,000 deterministic organizations in 2,500 parent groups', () => {
    expect(service.organizations).toHaveLength(2_500);
    expect(countOrganizationEntities(service.organizations)).toBe(10_000);
    expect(service.organizations[0]).toMatchObject({ id: 1, name: 'Northstar Apparel 0001' });
    expect(
      service.organizations.some(({ subOrganizations }) => subOrganizations.length === 0),
    ).toBe(true);
    expect(
      service.organizations.some(({ subOrganizations }) => subOrganizations.length === 6),
    ).toBe(true);
    const ids = service.organizations.flatMap(({ id, subOrganizations }) => [
      id,
      ...subOrganizations.map((child) => child.id),
    ]);
    expect(new Set(ids).size).toBe(10_000);
  });

  it('should create smaller datasets for tests and demos', () => {
    expect(createOrganizations(24)).toHaveLength(24);
  });

  it('keeps matching children under their parent when filtering', () => {
    const organizations = createOrganizations(12);
    const child = organizations.find(({ subOrganizations }) => subOrganizations.length)
      ?.subOrganizations[0];
    expect(child).toBeTruthy();

    const filtered = filterOrganizationTree(organizations, child!.name);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].subOrganizations).toEqual([child]);
  });
});
