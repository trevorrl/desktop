import React, { ReactChild, useEffect, useRef, useState } from 'react';
import { LayoutSlot, LayoutService, IVec2Array } from 'services/layout';
import { CustomizationService } from 'services/customization';
import { WindowsService } from 'services/windows';
import { inject, useModule } from 'slap';
import { useVuex } from 'components-react/hooks';
import { Services } from 'components-react/service-provider';

export class LayoutProps {
  onTotalWidth: (slots: IVec2Array, isColumns: boolean) => void = () => {};
}

export interface IResizeMins {
  rest: number | null;
  bar1: number | null;
  bar2?: number;
}

export interface ILayoutSlotArray extends Array<ILayoutSlotArray | LayoutSlot> {}

class LayoutModule {
  private layoutService = inject(LayoutService);
  private customizationService = inject(CustomizationService);
  private windowsService = inject(WindowsService);

  mins: IResizeMins = { rest: null, bar1: null };
  isColumns: boolean;
  firstRender: boolean;
  bar1: number = 0;
  bar2: number = 0;

  get chatCollapsed() {
    return this.customizationService.state.livedockCollapsed;
  }

  // get vectors(): ILayoutSlotArray {
  //   return null;
  // }
}

export default function useLayout(
  component: HTMLElement,
  vectors: ILayoutSlotArray,
  isColumns: boolean,
  children: ReactChild[],
) {
  const { CustomizationService, LayoutService, WindowsService } = Services;

  const { livedockSize, resizes, chatCollapsed } = useVuex(() => ({
    livedockSize: CustomizationService.state.livedockSize,
    resizes: LayoutService.views.currentTab.resizes,
    chatCollapsed: CustomizationService.state.livedockCollapsed,
  }));

  useEffect(() => {
    if (!component) return;
    //   this.$emit('totalWidth', await this.mapVectors(this.vectors), this.isColumns);

    window.addEventListener('resize', () => updateSize());
    updateSize();
    return () => {
      window.removeEventListener('resize', () => updateSize());
    };
  }, [component, chatCollapsed]);

  const [bars, setBars] = useState<{ bar1: number | null; bar2: number | null }>({
    bar1: null,
    bar2: null,
  });

  const mins = useRef({});

  async function setMins(
    restSlots: ILayoutSlotArray,
    bar1Slots: ILayoutSlotArray,
    bar2Slots?: ILayoutSlotArray,
  ) {
    const rest = calculateMinimum(restSlots);
    const bar1 = calculateMinimum(bar1Slots);
    const bar2 = calculateMinimum(bar2Slots);
    mins.current = { rest, bar1, bar2 };
  }

  function getBarPixels(bar: 'bar1' | 'bar2', offset: number) {
    // Migrate from pixels to proportions
    if (this.resizes[bar] >= 1) setBar(bar, this.resizes[bar]);
    const { height, width } = component.getBoundingClientRect();
    const offsetSize = isColumns ? width - offset : height;
    return Math.round(offsetSize * this.resizes[bar]);
  }

  function setBar(bar: 'bar1' | 'bar2', val: number) {
    if (val === 0) return;
    setBars({ ...bars, [bar]: val });
    const { height, width } = component.getBoundingClientRect();
    const totalSize = isColumns ? width : height;
    const proportion = parseFloat((val / totalSize).toFixed(2));
    LayoutService.actions.setBarResize(bar, proportion);
  }

  function minsFromSlot(slot: LayoutSlot) {
    // If there is no component slotted we return no minimum
    if (!children[slot]) return { x: 0, y: 0 };
    return children[slot].componentInstance.mins;
  }

  function calculateMinimum(slots?: ILayoutSlotArray) {
    if (!slots) return;
    const mins = mapVectors(slots);
    return calculateMin(mins);
  }

  function mapVectors(slots: ILayoutSlotArray): IVec2Array {
    return slots.map(slot => {
      if (Array.isArray(slot)) return mapVectors(slot);
      return minsFromSlot(slot);
    });
  }

  function calculateMin(slots: IVec2Array) {
    return LayoutService.views.calculateMinimum(isColumns ? 'x' : 'y', slots);
  }

  function resizeStartHandler() {
    WindowsService.actions.updateStyleBlockers('main', true);
  }

  function resizeStopHandler() {
    WindowsService.actions.updateStyleBlockers('main', false);
  }

  function updateSize(chatCollapsed = true, oldChatCollapsed?: boolean) {
    let offset = chatCollapsed ? 0 : CustomizationService.state.livedockSize;
    // Reverse offset if chat is collapsed from an uncollapsed state
    if (chatCollapsed && oldChatCollapsed === false) {
      offset = CustomizationService.state.livedockSize * -1;
    }
    const bar1 = getBarPixels('bar1', offset);
    const bar2 = getBarPixels('bar2', offset);
    setBars({ bar1, bar2 });
  }

  function calculateMax(restMin: number) {
    if (!component) return;
    const { height, width } = component.getBoundingClientRect();
    const max = isColumns ? width : height;
    return max - restMin;
  }

  return { mins: mins.current, setMins };
}
