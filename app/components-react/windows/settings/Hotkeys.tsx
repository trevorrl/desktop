import HotKeyGroup from 'components-react/shared/HotKeyGroup';
import React, { useEffect, useMemo } from 'react';
import { Services } from '../../service-provider';
import { IHotkey, IHotkeysSet } from 'services/hotkeys';
import { mapValues } from 'lodash';
import Fuse from 'fuse.js';

interface IAugmentedHotkey extends IHotkey {
  // Will be scene or source name
  categoryName?: string;
}

interface IAugmentedHotkeySet {
  general: IAugmentedHotkey[];
  sources: Dictionary<IAugmentedHotkey[]>;
  scenes: Dictionary<IAugmentedHotkey[]>;
}

export default function Hotkeys() {
  const { SourcesService, ScenesService, HotkeysService } = Services;

  const searchString: string | null = null;


  let hotkeySet: IHotkeysSet | null = null;

  useEffect(() => {
    HotkeysService.actions.unregisterAll();

    setHotKeySet();

    return () => {
      if (hotkeySet) {
        HotkeysService.actions.applyHotkeySet(hotkeySet);
      }
    };
  }, []);

  async function setHotKeySet() {
    hotkeySet = await HotkeysService.actions.return.getHotkeysSet();
  }

  const sources = () => SourcesService.views.sources;

  const augmentedHotkeySet = useMemo(() => {
    return {
      general: hotkeySet?.general,
      sources: mapValues(hotkeySet?.sources, (hotkeys, sourceId) => {
        return hotkeys.map((hotkey: IAugmentedHotkey) => {
          // Mutating the original object is required for bindings to work
          // TODO: We should refactor this to not rely on child components
          // mutating the original objects.
          hotkey.categoryName = SourcesService.views.getSource(sourceId)?.name;
          return hotkey;
        });
      }),
      scenes: mapValues(hotkeySet?.scenes, (hotkeys, sceneId) => {
        return hotkeys.map((hotkey: IAugmentedHotkey) => {
          hotkey.categoryName = ScenesService.views.getScene(sceneId)?.name;
          return hotkey;
        });
      }),
    };
  }, []);

  const filteredHotkeySet = (): IAugmentedHotkeySet => {
    if (searchString) {
      return {
        general: filterHotkeys(augmentedHotkeySet.general),
        sources: mapValues(augmentedHotkeySet.sources, hotkeys => filterHotkeys(hotkeys)),
        scenes: mapValues(augmentedHotkeySet.scenes, hotkeys => filterHotkeys(hotkeys)),
      };
    }

    return augmentedHotkeySet;
  }

  const hasHotkeys = (hotkeyDict: Dictionary<IAugmentedHotkey[]>) => {
    for (const key in hotkeyDict) {
      if (hotkeyDict[key].length) return true;
    }

    return false;
  }

  const filterHotkeys = (hotkeys?: IHotkey[]): IHotkey[] => {
    if (hotkeys?.length) {
      return new Fuse(hotkeys, {
        keys: ['description', 'categoryName'],
        threshold: 0.4,
        shouldSort: true,
      }).search(searchString);
    }
  }

  if (hotkeySet) {
    return (
      <div>
        <HotKeyGroup/>
        <h2>Scenes</h2>
        <HotKeyGroup />
      </div>
    );
  }
}
