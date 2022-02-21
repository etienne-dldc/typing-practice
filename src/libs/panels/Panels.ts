export type Panel = {
  width: number;
  content: React.ReactNode;
  key: string;
  flex?: number;
  optional?: boolean;
};

export type Panels = Array<Panel>;

type FullPanel = Required<Panel>;

export type DisplayedPanel = FullPanel & {
  canShowParent: boolean;
  canShowChildren: boolean;
  left: number;
};

export type SolvePanelsOptions = {
  spaceBetween?: number;
  spaceAround?: number;
  space?: number;
};

export type Spacing = {
  spaceBetween: number;
  spaceAround: number;
};

export function solvePanelsPages(
  panels: Array<Panel>,
  width: number,
  options: SolvePanelsOptions = {}
): Array<Array<DisplayedPanel>> {
  const spacing: Spacing = {
    spaceBetween: options.spaceBetween ?? options.space ?? 0,
    spaceAround: options.spaceAround ?? options.space ?? 0,
  };
  // init panels data
  const panelsFull = panels.map(
    (panel): DisplayedPanel => ({
      content: panel.content,
      key: panel.key,
      width: panel.width,
      flex: panel.flex ?? 0,
      optional: panel.optional ?? false,
      canShowChildren: false,
      canShowParent: false,
      left: 0,
    })
  );
  // Find the last pageIndex,
  // If we there are 5 items and we can swhow the last 3
  // then maxFirstPanelIndex is 2
  const maxFirstPanelIndex = solveMaxFirstPanelIndex(
    panelsFull,
    width,
    spacing
  );
  // this means that valid pages are [0, 1, 2]
  const pagesIndexes = Array.from(Array(maxFirstPanelIndex + 1).keys());
  // Now we need to find for each pageIndex which panels are displayed
  const pages = pagesIndexes.map((firstIndex) =>
    solvePanelsPage(panelsFull, firstIndex, width, spacing)
  );
  // If page can backfill then it return null and we discard it
  const filtered = pages.filter((p): p is Array<DisplayedPanel> => p !== null);
  return filtered;
}

function solveMaxFirstPanelIndex(
  panels: Array<DisplayedPanel>,
  width: number,
  spacing: Spacing
): number {
  // Fill in reverse order to find how many items we can display
  const { queue } = fillPanels([], [...panels].reverse(), width, spacing);
  if (queue.length === 0) {
    // empty queue: everything fits (with or without optional)
    return 0;
  }
  return queue.length;
}

function solvePanelsPage(
  panels: Array<DisplayedPanel>,
  firstIndex: number,
  width: number,
  spacing: Spacing
): Array<DisplayedPanel> | null {
  const filled = fillPanels([], panels.slice(firstIndex), width, spacing);
  const displayed = filled.displayed.map((p) => Object.assign({}, p));
  // try to fill the other way
  // if panels are [200, 200, 300], width is 450 and firstIndex is 1
  // we can't put [1, 2] because it would be too wide (200 + 300 > 450)
  // so we try to put [0, 1] which is ok
  // this mean this pageIndex can be ignored because it will be handled by pageIndex 0
  const backFilled = fillPanels(
    displayed,
    panels.slice(0, firstIndex).reverse(),
    width,
    spacing
  );
  if (backFilled.displayed.length > displayed.length) {
    // we can backfill so we discard this page
    return null;
  }
  let finalWidth = sumWithSpacing([...displayed.map((p) => p.width)], spacing);
  // if there is a single panel bigger then the available width
  // then finalWidth is bigger then width
  // in this case we squeeze the panel
  if (finalWidth > width) {
    const diff = finalWidth - width;
    const lastPanel = displayed[displayed.length - 1];
    lastPanel.width -= diff;
    finalWidth = width;
  }
  // now we need to allocate the available space to the flex panels
  const rest = width - finalWidth;
  const hasFlex = displayed.some((p) => p.flex !== 0);
  // if there are no flex panels then we pretend all panels have flex = 1
  const flexValues = displayed.map((p) =>
    p.flex === 0 ? (hasFlex ? 0 : 1) : p.flex
  );
  const flexSum = flexValues.reduce((acc, v) => acc + v, 0);
  // found how many pixel to add to each panel (rounded down to exact piwel)
  const flexSizes = flexValues.map((flex) =>
    Math.floor((rest / flexSum) * flex)
  );
  const flexSizeSum = flexSizes.reduce((acc, v) => acc + v, 0);
  // remaining pixels due to rounding
  const pixelRest = rest - flexSizeSum;
  // remaining pixels are added to the first flex panel
  const firstFlexIndex = flexValues.findIndex((v) => v !== 0);
  flexSizes[firstFlexIndex] += pixelRest;
  // distribute the pixels to the flex panels
  displayed.forEach((item, index) => {
    const flexSize = flexSizes[index];
    item.width += flexSize;
  });
  // compute left offset
  let left = spacing.spaceAround;
  displayed.forEach((item) => {
    item.left = left;
    left += item.width + spacing.spaceBetween;
  });
  if (firstIndex > 0) {
    displayed[0].canShowParent = true;
  }
  if (filled.queue.length > 0) {
    displayed[displayed.length - 1].canShowChildren = true;
  }
  return displayed;
}

function fillPanels<P extends Panel>(
  currentPanels: Array<P>,
  panels: Array<P>,
  width: number,
  spacing: Spacing
): { displayed: Array<P>; queue: Array<P> } {
  const displayedPanels: Array<P> = [...currentPanels];
  let queue = [...panels];
  while (queue.length > 0) {
    const panel = queue.shift();
    if (!panel) {
      break;
    }
    const displayedPanelsWidth = displayedPanels.map((p) => p.width);
    const nextWidth = sumWithSpacing(
      [...displayedPanelsWidth, panel.width],
      spacing
    );
    if (displayedPanels.length === 0 || nextWidth < width) {
      displayedPanels.push(panel);
    } else {
      // next panel does not fit => try to remove optional to gain size
      // put panel back in the queue because it was not inserted
      queue = [...queue, panel].filter((p) => p.optional !== true);
      const hasOptionalDisplayed = displayedPanels.filter(
        (p) => p.optional === true
      );
      if (queue.length === 0 || hasOptionalDisplayed.length === 0) {
        break;
      }
      // remove first optional
      const panelToRemove = displayedPanels.find((p) => p.optional === true);
      if (panelToRemove) {
        const panelIndex = displayedPanels.indexOf(panelToRemove);
        displayedPanels.splice(panelIndex, 1);
      }
    }
  }
  return { displayed: displayedPanels, queue };
}

function sumWithSpacing(sizes: Array<number>, spacing: Spacing): number {
  const sizesSum = sum(...sizes);
  if (sizes.length === 0) {
    return 0;
  }
  if (sizes.length === 1) {
    return sizesSum + spacing.spaceAround * 2;
  }
  return (
    sizesSum +
    spacing.spaceAround * 2 +
    (sizes.length - 1) * spacing.spaceBetween
  );
}

function sum(...nums: Array<number>): number {
  let sum = 0;
  for (const num of nums) {
    sum += num;
  }
  return sum;
}
