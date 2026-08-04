import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { VariableSizeVirtualScrollStrategy } from './variable-size-virtual-scroll';

describe('VariableSizeVirtualScrollStrategy', () => {
  it('uses estimated offsets and corrects them after measurement', () => {
    let totalSize = 0;
    let renderedRange = { start: 0, end: 0 };
    let renderedOffset = 0;
    let scrolledTo = -1;
    const viewport = {
      getDataLength: () => 3,
      getViewportSize: () => 70,
      measureScrollOffset: () => 0,
      setTotalContentSize: (size: number) => (totalSize = size),
      setRenderedRange: (range: { start: number; end: number }) => (renderedRange = range),
      setRenderedContentOffset: (offset: number) => (renderedOffset = offset),
      scrollToOffset: (offset: number) => (scrolledTo = offset),
    } as unknown as CdkVirtualScrollViewport;
    const strategy = new VariableSizeVirtualScrollStrategy(0);

    strategy.attach(viewport);
    strategy.updateItemSizes([64, 108, 152]);
    expect(totalSize).toBe(324);
    expect(renderedRange).toEqual({ start: 0, end: 2 });
    expect(renderedOffset).toBe(0);

    strategy.measure(0, 70);
    expect(totalSize).toBe(330);
    strategy.scrollToIndex(2, 'auto');
    expect(scrolledTo).toBe(178);
  });
});
