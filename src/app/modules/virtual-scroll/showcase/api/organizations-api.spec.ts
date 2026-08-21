import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '@core/config/config';

import { OrganizationsApi } from './organizations-api';

const organizationsResponse = [
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
];

describe('OrganizationsApi', () => {
  let service: OrganizationsApi;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OrganizationsApi,
        {
          provide: ConfigService,
          useValue: { apiBaseURL: '/api/' },
        },
      ],
    });
    service = TestBed.inject(OrganizationsApi);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('loads organizations from the configured backend endpoint', async () => {
    TestBed.tick();
    const request = httpTesting.expectOne('/api/organizations');

    expect(request.request.method).toBe('GET');
    request.flush(organizationsResponse);
    await TestBed.inject(ApplicationRef).whenStable();

    expect(service.organizations.value()).toEqual(organizationsResponse);
  });

  it('exposes unsuccessful responses as resource errors', async () => {
    TestBed.tick();
    httpTesting
      .expectOne('/api/organizations')
      .flush(null, { status: 503, statusText: 'Service Unavailable' });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(service.organizations.error()).toBeInstanceOf(HttpErrorResponse);
    expect((service.organizations.error() as HttpErrorResponse).status).toBe(503);
  });

  it('rejects responses that do not match the organization contract', async () => {
    TestBed.tick();
    httpTesting
      .expectOne('/api/organizations')
      .flush([{ ...organizationsResponse[0], subOrganizations: null }]);
    await TestBed.inject(ApplicationRef).whenStable();

    expect((service.organizations.error() as Error).message).toBe(
      'Invalid organizations response: organization at index 0.subOrganizations must be an array.',
    );
  });
});
