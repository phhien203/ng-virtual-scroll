import {
  CdkVirtualScrollViewport,
  VIRTUAL_SCROLL_STRATEGY,
  VirtualScrollStrategy,
} from '@angular/cdk/scrolling';
import { Directive, effect, forwardRef, input } from '@angular/core';
import { distinctUntilChanged, Observable, Subject } from 'rxjs';

export function variableSizeStrategyFactory(
  directive: VariableSizeVirtualScroll,
): VirtualScrollStrategy {
  return directive.strategy;
}

/**
 * Custom CDK strategy for dynamic-height organization groups. A fixed `itemSize` cannot represent
 * parents with different child counts, so this strategy maps measured per-item sizes to offsets.
 */
export class VariableSizeVirtualScrollStrategy implements VirtualScrollStrategy {
  private readonly indexChanges = new Subject<number>();
  private readonly sizes: number[] = [];
  private offsets = [0];
  private viewport: CdkVirtualScrollViewport | null = null;

  readonly scrolledIndexChange: Observable<number> = this.indexChanges.pipe(distinctUntilChanged());

  constructor(private readonly bufferPx = 320) {}

  attach(viewport: CdkVirtualScrollViewport): void {
    this.viewport = viewport;
    this.updateViewport();
  }

  detach(): void {
    this.viewport = null;
  }

  updateItemSizes(estimates: readonly number[]): void {
    this.sizes.splice(0, this.sizes.length, ...estimates);
    this.rebuildOffsets();
    this.updateViewport();
  }

  measure(index: number, size: number): void {
    if (!Number.isFinite(size) || size <= 0 || index < 0 || index >= this.sizes.length) {
      return;
    }
    if (Math.abs(this.sizes[index] - size) < 0.5) {
      return;
    }

    this.sizes[index] = size;
    this.rebuildOffsets();
    this.updateViewport();
  }

  onContentScrolled(): void {
    this.updateViewport();
  }

  onDataLengthChanged(): void {
    this.updateViewport();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- required interface callback
  onContentRendered(): void {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function -- required interface callback
  onRenderedOffsetChanged(): void {}

  scrollToIndex(index: number, behavior: ScrollBehavior): void {
    const safeIndex = Math.max(0, Math.min(index, this.sizes.length));
    this.viewport?.scrollToOffset(this.offsets[safeIndex] ?? 0, behavior);
  }

  private rebuildOffsets(): void {
    this.offsets = new Array(this.sizes.length + 1);
    this.offsets[0] = 0;
    for (let index = 0; index < this.sizes.length; index++) {
      this.offsets[index + 1] = this.offsets[index] + this.sizes[index];
    }
  }

  private updateViewport(): void {
    const viewport = this.viewport;
    if (!viewport) {
      return;
    }

    const dataLength = Math.min(viewport.getDataLength(), this.sizes.length);
    const totalSize = this.offsets[dataLength] ?? 0;
    const scrollOffset = Math.max(0, viewport.measureScrollOffset());
    const viewportSize = viewport.getViewportSize();
    const firstVisibleIndex = this.findIndexAtOffset(scrollOffset, dataLength);
    const start = this.findIndexAtOffset(Math.max(0, scrollOffset - this.bufferPx), dataLength);
    const end = Math.min(
      dataLength,
      this.findIndexAtOffset(scrollOffset + viewportSize + this.bufferPx, dataLength) + 1,
    );

    viewport.setTotalContentSize(totalSize);
    viewport.setRenderedRange({ start, end });
    viewport.setRenderedContentOffset(this.offsets[start] ?? 0);
    this.indexChanges.next(firstVisibleIndex);
  }

  private findIndexAtOffset(offset: number, dataLength: number): number {
    if (dataLength === 0) {
      return 0;
    }

    let low = 0;
    let high = dataLength;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (this.offsets[middle + 1] <= offset) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }
    return Math.min(low, dataLength - 1);
  }
}

@Directive({
  selector: 'cdk-virtual-scroll-viewport[appVariableSizeVirtualScroll]',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useFactory: variableSizeStrategyFactory,
      deps: [forwardRef(() => VariableSizeVirtualScroll)],
    },
  ],
})
export class VariableSizeVirtualScroll {
  readonly itemSizes = input.required<readonly number[]>({ alias: 'appVariableSizeVirtualScroll' });
  readonly strategy = new VariableSizeVirtualScrollStrategy();

  constructor() {
    effect(() => this.strategy.updateItemSizes(this.itemSizes()));
  }

  measure(index: number, size: number): void {
    this.strategy.measure(index, size);
  }
}
