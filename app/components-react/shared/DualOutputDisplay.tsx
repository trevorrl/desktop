import React, { MouseEvent, useEffect } from 'react';
import { useVuex } from '../hooks';
import { Services } from '../service-provider';
import { ERenderingMode } from '../../../obs-api';
import { TDualOutputDisplayType } from 'services/dual-output';
import Display from 'components-react/shared/Display';
import Spinner from 'components-react/shared/Spinner';
import styles from '../root/StudioEditor.m.less';
import cx from 'classnames';

interface IDisplayEventHandlers {
  onOutputResize: (rect: IRectangle) => void;
  onMouseDown: (event: MouseEvent) => void;
  onMouseUp: (event: MouseEvent) => void;
  onMouseEnter: (event: MouseEvent) => void;
  onMouseDblClick: (event: MouseEvent) => void;
  onMouseMove: (event: MouseEvent) => void;
  enablePreview: () => void;
  onContextMenu: (event: MouseEvent) => void;
}

export default function DualOutputDisplay(p: { eventHandlers: IDisplayEventHandlers }) {
  const { DualOutputService, EditorService, EditorCommandsService, ScenesService } = Services;
  const v = useVuex(() => ({
    activeSceneId: ScenesService.views.activeSceneId,
    horizontalSceneId: DualOutputService.views.horizontalSceneId,
    verticalSceneId: DualOutputService.views.verticalSceneId,
    cursor: EditorService.state.cursor,
    setTemporaryScenes: DualOutputService.actions.setTemporaryScenes,
  }));

  v;

  useEffect(() => {
    /**
     * We need a separate scene to render differences in each display
     * so for dual output, we need to create additional duplicate scenes temporarily.
     * We only need to check one of the dual output scene ids
     * because the temporary scenes are created at the same time.
     */
    if (v.horizontalSceneId || v.verticalSceneId) {
      const activeSceneUid = v.activeSceneId.split('_')[1];
      const horizontalSceneUid = v.horizontalSceneId.split('_')[1];
      const verticalSceneUid = v.verticalSceneId.split('_')[1];
      if (activeSceneUid !== horizontalSceneUid || activeSceneUid !== verticalSceneUid) {
        v.setTemporaryScenes(v.activeSceneId);
      }
    } else {
      v.setTemporaryScenes(v.activeSceneId);
    }
  }, [v.activeSceneId]);

  return !!v.horizontalSceneId && !!v.verticalSceneId ? (
    <>
      <div
        className={cx(styles.dualOutputDisplayContainer)}
        style={{ cursor: v.cursor }}
        onMouseDown={p.eventHandlers.onMouseDown}
        onMouseUp={p.eventHandlers.onMouseUp}
        onMouseEnter={p.eventHandlers.onMouseEnter}
        onMouseMove={p.eventHandlers.onMouseMove}
        onDoubleClick={p.eventHandlers.onMouseDblClick}
        onContextMenu={p.eventHandlers.onContextMenu}
      >
        <Display
          type="horizontal"
          drawUI={true}
          paddingSize={10}
          paddingColor={{ r: 255, g: 238, b: 0 }} // @@@ temp
          onOutputResize={p.eventHandlers.onOutputResize}
          renderingMode={ERenderingMode.OBS_MAIN_RENDERING}
          sourceId={v.horizontalSceneId}
        />
      </div>

      <div
        className={cx(styles.dualOutputDisplayContainer)}
        style={{ cursor: v.cursor }}
        onMouseDown={p.eventHandlers.onMouseDown}
        onMouseUp={p.eventHandlers.onMouseUp}
        onMouseEnter={p.eventHandlers.onMouseEnter}
        onMouseMove={p.eventHandlers.onMouseMove}
        onDoubleClick={p.eventHandlers.onMouseDblClick}
        onContextMenu={p.eventHandlers.onContextMenu}
      >
        <Display
          type="vertical"
          drawUI={true}
          paddingSize={10}
          paddingColor={{ r: 255, g: 0, b: 0 }} // @@@ temp
          onOutputResize={p.eventHandlers.onOutputResize}
          renderingMode={ERenderingMode.OBS_MAIN_RENDERING}
          sourceId={v.verticalSceneId}
        />
      </div>
    </>
  ) : (
    <Spinner visible={true} />
  );
}