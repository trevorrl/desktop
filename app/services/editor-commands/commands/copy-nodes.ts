import { Command } from './command';
import { Selection } from 'services/selection';
import { Inject } from 'services/core';
import { ScenesService, TSceneNode } from 'services/scenes';
import { TDisplayType, VideoSettingsService } from 'services/settings-v2';
import { SceneCollectionsService } from 'services/scene-collections';
import { DualOutputService } from 'services/dual-output';
import compact from 'lodash/compact';
import { $t } from 'services/i18n';

export class CopyNodesCommand extends Command {
  @Inject() scenesService: ScenesService;
  @Inject() dualOutputService: DualOutputService;
  @Inject() videoSettingsService: VideoSettingsService;
  @Inject() sceneCollectionsService: SceneCollectionsService;

  description: string;

  /**
   * Maps original source ids to new source ids for deterministic
   * generation of of sources with consistent ids.
   */
  private sourceIdsMap: Dictionary<string>;

  /**
   * Maps original node ids to new node ids for deterministic
   * generation of of sources with consistent ids.
   */
  private nodeIdsMap: Dictionary<string> = {};

  constructor(
    private selection: Selection,
    private destSceneId: string,
    private origSceneId?: string,
    private duplicateSources = false,
    private display?: TDisplayType,
  ) {
    super();
    this.selection.freeze();
    const nodes = this.selection.getNodes();
    this.description = $t('Paste %{nodeName}', { nodeName: nodes[0] ? nodes[0].name : '' });
  }

  execute() {
    const scene = this.scenesService.views.getScene(this.destSceneId);
    const insertedNodes: TSceneNode[] = [];

    const initialNodeOrder = scene.getNodesIds();

    const hasNodeMap = this.dualOutputService.views.hasNodeMap(scene.id);

    // Duplicate necessary sources if needed
    if (this.duplicateSources) {
      this.sourceIdsMap = {};

      this.selection.getSources().forEach(source => {
        const dup = source.duplicate(this.sourceIdsMap[source.sourceId]);

        // If the source was marked as do-not-duplicate, dup will be null
        // In this case, use the original source
        this.sourceIdsMap[source.sourceId] = dup ? dup.sourceId : source.sourceId;
      });
    }

    // Create all nodes first
    this.selection.getNodes().forEach(node => {
      if (node.isFolder()) {
        const folder = scene.createFolder(node.name, { id: this.nodeIdsMap[node.id] });
        this.nodeIdsMap[node.id] = folder.id;
        const display =
          this.display ?? this.dualOutputService.views.getNodeDisplay(node.id, this.origSceneId);
        const context = this.videoSettingsService.contexts[display];
        folder.setDisplay(display);

        if (this.display === 'vertical' || (hasNodeMap && display === 'horizontal')) {
          // when creating dual output nodes for a vanilla scene, the passed in display is set to vertical
          // if the scene has dual output nodes, add a node map entry only when copying a horizontal node
          this.sceneCollectionsService.createNodeMapEntry(this.destSceneId, node.id, folder.id);
        }
        insertedNodes.push(folder);
      } else {
        const sourceId =
          this.sourceIdsMap != null ? this.sourceIdsMap[node.sourceId] : node.sourceId;

        const item = scene.addSource(sourceId, { id: this.nodeIdsMap[node.id] });
        const display =
          this.display ?? this.dualOutputService.views.getNodeDisplay(node.id, this.origSceneId);
        const context = this.videoSettingsService.contexts[display];
        item.setSettings({ ...node.getSettings(), output: context, display });

        if (this.display === 'vertical' || (hasNodeMap && display === 'horizontal')) {
          // position all of the nodes in the upper left corner of the vertical display
          // so that all of the sources are visible
          item.setTransform({ position: { x: 0, y: 0 } });

          // when creating dual output scene nodes, the passed in display is set to vertical
          // if the scene has dual output nodes, add a node map entry only when copying a horizontal node
          this.sceneCollectionsService.createNodeMapEntry(this.destSceneId, node.id, item.id);
        }

        this.nodeIdsMap[node.id] = item.id;
        insertedNodes.push(item);
      }
    });

    // Recreate parent/child relationships
    this.selection.getNodes().forEach(node => {
      const mappedNode = scene.getNode(this.nodeIdsMap[node.id]);
      const mappedParent = this.nodeIdsMap[node.parentId]
        ? scene.getNode(this.nodeIdsMap[node.parentId])
        : null;

      if (mappedParent) {
        mappedNode.setParent(mappedParent.id);
      }
    });

    // Recreate node order
    // Selection does not have canonical node order - scene does
    const order = compact(
      this.selection
        .getScene()
        .getNodesIds()
        .map(origNodeId => {
          if (
            this.dualOutputService.views.getNodeDisplay(origNodeId, this.origSceneId) ===
            'horizontal'
          ) {
            // determine if node is horizontal in original scene
            // and get vertical node

            const origVerticalNodeId = this.dualOutputService.views.getVerticalNodeId(origNodeId);
            const newHorizontalNodeId = this.nodeIdsMap[origNodeId];
            const newVerticalNodeId = this.nodeIdsMap[origVerticalNodeId];

            this.sceneCollectionsService.createNodeMapEntry(
              scene.id,
              newHorizontalNodeId,
              newVerticalNodeId,
            );
          }
          return this.nodeIdsMap[origNodeId];
        }),
    );
    scene.setNodesOrder(order.concat(initialNodeOrder));

    return insertedNodes;
  }

  rollback() {
    // Rolling back this operation is as simple as removing all created items.
    // Any duplicated sources will be automatically deleted as the last scene
    // item referencing them is removed.
    const scene = this.scenesService.views.getScene(this.destSceneId);

    Object.values(this.nodeIdsMap).forEach(nodeId => {
      const node = scene.getNode(nodeId);
      if (node) node.remove();
    });

    if (this.dualOutputService.views.hasNodeMap(scene.id)) {
      this.sceneCollectionsService.removeNodeMap(scene.id);
    }
  }
}

// import { Command } from './command';
// import { Selection } from 'services/selection';
// import { Inject } from 'services/core';
// import { ScenesService, TSceneNode } from 'services/scenes';
// import { DualOutputService } from 'services/dual-output';
// import compact from 'lodash/compact';
// import { $t } from 'services/i18n';
// import { VideoSettingsService } from 'services/settings-v2';
// import { SceneCollectionsService } from 'services/scene-collections';

// export class CopyNodesCommand extends Command {
//   @Inject() scenesService: ScenesService;
//   @Inject() dualOutputService: DualOutputService;
//   @Inject() videoSettingsService: VideoSettingsService;
//   @Inject() sceneCollectionsService: SceneCollectionsService;

//   description: string;

//   /**
//    * Maps original source ids to new source ids for deterministic
//    * generation of of sources with consistent ids.
//    */
//   private sourceIdsMap: Dictionary<string>;

//   /**
//    * Maps original node ids to new node ids for deterministic
//    * generation of of sources with consistent ids.
//    */
//   private nodeIdsMap: Dictionary<string> = {};

//   constructor(
//     private selection: Selection,
//     private destSceneId: string,
//     private origSceneId?: string,
//     private duplicateSources = false,
//   ) {
//     super();
//     this.selection.freeze();
//     const nodes = this.selection.getNodes();
//     this.description = $t('Paste %{nodeName}', { nodeName: nodes[0] ? nodes[0].name : '' });
//   }

//   get idsMap() {
//     return this.nodeIdsMap;
//   }

//   execute() {
//     const scene = this.scenesService.views.getScene(this.destSceneId);
//     const insertedNodes: TSceneNode[] = [];

//     const initialNodeOrder = scene.getNodesIds();

//     // Duplicate necessary sources if needed
//     if (this.duplicateSources) {
//       this.sourceIdsMap = {};

//       this.selection.getSources().forEach(source => {
//         const dup = source.duplicate(this.sourceIdsMap[source.sourceId]);

//         // If the source was marked as do-not-duplicate, dup will be null
//         // In this case, use the original source
//         this.sourceIdsMap[source.sourceId] = dup ? dup.sourceId : source.sourceId;
//       });
//     }

//     // Create all nodes first
//     this.selection.getNodes().forEach(node => {
//       if (node.isFolder()) {
//         const folder = scene.createFolder(node.name, { id: this.nodeIdsMap[node.id] });
//         this.nodeIdsMap[node.id] = folder.id;
//         insertedNodes.push(folder);
//       } else {
//         const sourceId =
//           this.sourceIdsMap != null ? this.sourceIdsMap[node.sourceId] : node.sourceId;

//         const item = scene.addSource(sourceId, { id: this.nodeIdsMap[node.id] });
//         const display = this.dualOutputService.views.getNodeDisplay(node.id, this.origSceneId);
//         const context = this.videoSettingsService.contexts[display];
//         item.setSettings({ ...node.getSettings(), output: context, display });
//         this.nodeIdsMap[node.id] = item.id;
//         insertedNodes.push(item);
//       }
//     });

//     // Recreate parent/child relationships
//     this.selection.getNodes().forEach(node => {
//       const mappedNode = scene.getNode(this.nodeIdsMap[node.id]);
//       const mappedParent = this.nodeIdsMap[node.parentId]
//         ? scene.getNode(this.nodeIdsMap[node.parentId])
//         : null;

//       if (mappedParent) {
//         mappedNode.setParent(mappedParent.id);
//       }
//     });

//     // Recreate node order and node map, if it exists
//     // Selection does not have canonical node order - scene does
//     const order = compact(
//       this.selection
//         .getScene()
//         .getNodesIds()
//         .map(origNodeId => {
//           if (
//             this.dualOutputService.views.getNodeDisplay(origNodeId, this.origSceneId) ===
//             'horizontal'
//           ) {
//             // determine if node is horizontal in original scene
//             // and get vertical node

//             const origVerticalNodeId = this.dualOutputService.views.getVerticalNodeId(origNodeId);
//             const newHorizontalNodeId = this.nodeIdsMap[origNodeId];
//             const newVerticalNodeId = this.nodeIdsMap[origVerticalNodeId];

//             this.sceneCollectionsService.createNodeMapEntry(
//               scene.id,
//               newHorizontalNodeId,
//               newVerticalNodeId,
//             );
//           }
//           return this.nodeIdsMap[origNodeId];
//         }),
//     );

//     scene.setNodesOrder(order.concat(initialNodeOrder));

//     return insertedNodes;
//   }

//   rollback() {
//     // Rolling back this operation is as simple as removing all created items.
//     // Any duplicated sources will be automatically deleted as the last scene
//     // item referencing them is removed.
//     const scene = this.scenesService.views.getScene(this.destSceneId);

//     Object.values(this.nodeIdsMap).forEach(nodeId => {
//       const node = scene.getNode(nodeId);
//       if (node) node.remove();
//     });

//     if (this.dualOutputService.views.hasNodeMap(scene.id)) {
//       this.sceneCollectionsService.removeNodeMap(scene.id);
//     }
//   }
// }
