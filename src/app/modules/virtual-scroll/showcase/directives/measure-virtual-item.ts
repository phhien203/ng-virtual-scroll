import { afterRenderEffect, Directive, ElementRef, inject, input, OnDestroy } from '@angular/core';

import { VariableSizeVirtualScroll } from './variable-size-virtual-scroll';

@Directive({
  selector: '[appMeasureVirtualItem]',
})
export class MeasureVirtualItem implements OnDestroy {
  readonly index = input.required<number>({ alias: 'appMeasureVirtualItem' });

  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly virtualScroll = inject(VariableSizeVirtualScroll);
  private readonly observer =
    typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver((entries) => {
          const entry = entries[0];
          const borderBox = Array.isArray(entry.borderBoxSize)
            ? entry.borderBoxSize[0]
            : entry.borderBoxSize;
          this.report(borderBox?.blockSize ?? entry.target.getBoundingClientRect().height);
        });

  constructor() {
    this.observer?.observe(this.element.nativeElement);
    afterRenderEffect({
      read: () => {
        const index = this.index();
        const size = this.element.nativeElement.getBoundingClientRect().height;
        this.virtualScroll.measure(index, size);
      },
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private report(size: number): void {
    this.virtualScroll.measure(this.index(), size);
  }
}
