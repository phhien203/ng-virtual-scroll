import { httpResource } from '@angular/common/http';
import { inject, Service } from '@angular/core';

import { ConfigService } from '@core/config/config';

import {
  Organization,
  OrganizationSummary,
} from '@modules/virtual-scroll/showcase/models/organization.model';

@Service({ autoProvided: false })
export class OrganizationsApi {
  private readonly config = inject(ConfigService);

  readonly organizations = httpResource<readonly Organization[]>(() => this.organizationsUrl, {
    parse: parseOrganizations,
    debugName: 'organizations',
  });

  private get organizationsUrl(): string {
    return `${this.config.apiBaseURL.replace(/\/+$/, '')}/organizations`;
  }
}

function parseOrganizations(value: unknown): readonly Organization[] {
  if (!Array.isArray(value)) {
    throw invalidResponse('expected an array');
  }

  return value.map((organization, index) => parseOrganization(organization, index));
}

function parseOrganization(value: unknown, index: number): Organization {
  assertRecord(value, `organization at index ${index}`);

  return {
    ...parseOrganizationSummary(value, `organization at index ${index}`),
    subOrganizations: parseSubOrganizations(value['subOrganizations'], index),
  };
}

function parseSubOrganizations(
  value: unknown,
  parentIndex: number,
): readonly OrganizationSummary[] {
  if (!Array.isArray(value)) {
    throw invalidResponse(`organization at index ${parentIndex}.subOrganizations must be an array`);
  }

  return value.map((organization, index) => {
    assertRecord(organization, `sub-organization at index ${parentIndex}.${index}`);
    return parseOrganizationSummary(
      organization,
      `sub-organization at index ${parentIndex}.${index}`,
    );
  });
}

function parseOrganizationSummary(
  value: Record<string, unknown>,
  path: string,
): OrganizationSummary {
  return {
    id: readNumber(value, 'id', path),
    name: readString(value, 'name', path),
    location: readString(value, 'location', path),
    memberCount: readNumber(value, 'memberCount', path),
    initials: readString(value, 'initials', path),
    accent: readString(value, 'accent', path),
  };
}

function assertRecord(value: unknown, path: string): asserts value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw invalidResponse(`${path} must be an object`);
  }
}

function readString(value: Record<string, unknown>, property: string, path: string): string {
  if (typeof value[property] !== 'string') {
    throw invalidResponse(`${path}.${property} must be a string`);
  }

  return value[property];
}

function readNumber(value: Record<string, unknown>, property: string, path: string): number {
  if (typeof value[property] !== 'number' || !Number.isFinite(value[property])) {
    throw invalidResponse(`${path}.${property} must be a finite number`);
  }

  return value[property];
}

function invalidResponse(message: string): Error {
  return new Error(`Invalid organizations response: ${message}.`);
}
