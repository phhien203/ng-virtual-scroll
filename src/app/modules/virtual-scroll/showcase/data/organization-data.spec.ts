import {
  countOrganizationEntities,
  estimateOrganizationHeight,
  filterOrganizationTree,
} from './organization-data';

const organizations = [
  {
    id: 1,
    name: 'Northstar Apparel',
    location: 'Helsinki, Finland',
    memberCount: 42,
    initials: 'NA',
    accent: '#7357ff',
    subOrganizations: [
      {
        id: 2,
        name: 'Northstar Design',
        location: 'Porto, Portugal',
        memberCount: 12,
        initials: 'ND',
        accent: '#117f74',
      },
    ],
  },
  {
    id: 3,
    name: 'Evergreen Retail',
    location: 'London, United Kingdom',
    memberCount: 84,
    initials: 'ER',
    accent: '#d96040',
    subOrganizations: [],
  },
];

describe('organization data helpers', () => {
  it('counts parent and child organizations', () => {
    expect(countOrganizationEntities(organizations)).toBe(3);
  });

  it('estimates parent group height from its children', () => {
    expect(estimateOrganizationHeight(organizations[0])).toBe(108);
    expect(estimateOrganizationHeight(organizations[1])).toBe(64);
  });

  it('keeps matching children under their parent when filtering', () => {
    const filtered = filterOrganizationTree(organizations, 'Porto');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].subOrganizations).toEqual([organizations[0].subOrganizations[0]]);
  });
});
