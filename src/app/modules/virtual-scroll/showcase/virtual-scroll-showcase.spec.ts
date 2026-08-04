import { TestBed } from '@angular/core/testing';

import { VirtualScrollShowcase } from './virtual-scroll-showcase';

describe('VirtualScroll', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualScrollShowcase],
    }).compileComponents();
  });

  it('hides the baseline selector until requested', async () => {
    const fixture = TestBed.createComponent(VirtualScrollShowcase);
    await fixture.whenStable();

    const toggleButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-controls="baseline-selector"]',
    );

    expect(fixture.nativeElement.querySelector('app-before-org-selector')).toBeNull();

    toggleButton.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-before-org-selector')).not.toBeNull();
    expect(toggleButton.textContent).toContain('Hide baseline selector');

    toggleButton.click();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('app-before-org-selector')).toBeNull();
    expect(toggleButton.textContent).toContain('Show baseline selector');
  });
});
