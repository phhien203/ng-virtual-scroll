import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ConfigService } from '@core/config/config';

import { OrganizationsApi } from '@modules/virtual-scroll/showcase/api/organizations-api';
import { AfterOrgSelector } from '@modules/virtual-scroll/showcase/components/after-org-selector/after-org-selector';
import { BeforeOrgSelector } from '@modules/virtual-scroll/showcase/components/before-org-selector/before-org-selector';
import { Organization } from '@modules/virtual-scroll/showcase/models/organization.model';

import { VirtualScrollShowcase } from './virtual-scroll-showcase';

const organizations: readonly Organization[] = [
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

@Component({
  selector: 'app-before-org-selector',
  template: '<p data-testid="before-organizations">{{ organizations()[0]?.name }}</p>',
})
class BeforeOrgSelectorStub {
  readonly organizations = input.required<readonly Organization[]>();
}

@Component({
  selector: 'app-after-org-selector',
  template: '<p data-testid="after-organizations">{{ organizations()[0]?.name }}</p>',
})
class AfterOrgSelectorStub {
  readonly organizations = input.required<readonly Organization[]>();
}

describe('VirtualScrollShowcase', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualScrollShowcase],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        OrganizationsApi,
        {
          provide: ConfigService,
          useValue: { apiBaseURL: '/api' },
        },
      ],
    })
      .overrideComponent(VirtualScrollShowcase, {
        remove: { imports: [BeforeOrgSelector, AfterOrgSelector] },
        add: { imports: [BeforeOrgSelectorStub, AfterOrgSelectorStub] },
      })
      .compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('renders organizations returned by the backend', async () => {
    const fixture = TestBed.createComponent(VirtualScrollShowcase);
    TestBed.tick();
    httpTesting.expectOne('/api/organizations').flush(organizations);

    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('2 organizations');
    expect(
      fixture.nativeElement.querySelector('[data-testid="before-organizations"]').textContent,
    ).toContain('Northstar Apparel');
    expect(
      fixture.nativeElement.querySelector('[data-testid="after-organizations"]').textContent,
    ).toContain('Northstar Apparel');
  });

  it('renders an explicit empty state', async () => {
    const fixture = TestBed.createComponent(VirtualScrollShowcase);
    TestBed.tick();
    httpTesting.expectOne('/api/organizations').flush([]);

    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('No organizations available');
  });

  it('allows a failed request to be retried', async () => {
    const fixture = TestBed.createComponent(VirtualScrollShowcase);
    TestBed.tick();
    httpTesting
      .expectOne('/api/organizations')
      .flush(null, { status: 503, statusText: 'Service Unavailable' });

    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Organizations could not be loaded');

    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    TestBed.tick();
    httpTesting.expectOne('/api/organizations').flush(organizations);
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Northstar Apparel');
  });
});
