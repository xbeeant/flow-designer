import type Modeling from 'bpmn-js/lib/features/modeling/Modeling';
import Modeler from 'bpmn-js/lib/Modeler';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import type CommandStack from 'diagram-js/lib/command/CommandStack';
import type Canvas from 'diagram-js/lib/core/Canvas';
import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import type EventBus from 'diagram-js/lib/core/EventBus';
import type HandTool from 'diagram-js/lib/features/hand-tool/HandTool';
import type LassoTool from 'diagram-js/lib/features/lasso-tool/LassoTool';
import type Selection from 'diagram-js/lib/features/selection/Selection';
import type SpaceTool from 'diagram-js/lib/features/space-tool/SpaceTool';
import GridLineModule from 'diagram-js-grid-bg';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_BPMN_XML } from '../constants';
import flowableModdle from '../flowable.json';
import designModdle from '../flowable-design.json';
import { TranslateModule } from '../translate.ts';
import type { BpmnDesignerConfig, InternalEvent } from '../types';

export const useBpmnModeler = (config?: BpmnDesignerConfig, value?: string) => {
  // ─── 核心状态 ───
  const [processElement, setProcessElement] = useState<ModdleElement>(null);
  const [selectedElement, setSelectedElement] = useState<ModdleElement>(null);
  const [modelerVersion, setModelerVersion] = useState<number>(0);
  const initializedRef = useRef<boolean>(false);

  // ─── 全局唯一 Modeler 实例 ───
  const modeler = useMemo(() => {
    const moddleExtensions = { flowable: flowableModdle, design: designModdle };
    return new Modeler({
      additionalModules: [TranslateModule, GridLineModule],
      moddleExtensions,
      bpmnRenderer: {
        defaultFillColor: '#ffffff',
        defaultStrokeColor: '#475569',
        defaultLabelColor: '#1e293b',
        defaultStrokeWidth: 2,
        ...config?.bpmnRenderer,
      },
      gridLine: {
        smallGridSpacing: 10,
        gridSpacing: 50,
        gridLineStroke: 0.5,
        gridLineOpacity: 0.4,
        gridLineColor: '#e2e8f0',
      },
      ...config,
    });
  }, [config]);

  // ─── 注册 modeler 事件（仅执行一次） ───
  useEffect(() => {
    const eventBus = modeler.get('eventBus') as EventBus;

    eventBus.on('selection.changed', (e: InternalEvent) => {
      setSelectedElement(e.newSelection[0] || null);
    });
    eventBus.on('commandStack.changed', () => {
      setModelerVersion((v) => v + 1);
    });

    return () => {
      eventBus.off('selection.changed');
      eventBus.off('commandStack.changed');
    };
  }, [modeler]);

  // ─── 内部工具 ───
  const refreshProcessElement = useCallback((m: Modeler) => {
    const elementRegistry = m.get('elementRegistry') as ElementRegistry;

    let processElement = null;

    const processes = elementRegistry.filter((el: any) => {
      return el.type === 'bpmn:Process';
    });

    if (processes.length > 0) {
      processElement = processes[0];
    } else {
      const collaborations = elementRegistry.filter((el: any) => {
        return el.type === 'bpmn:Collaboration';
      });
      if (collaborations.length > 0) {
        const collaboration = collaborations[0];
        const participants =
          getBusinessObject(collaboration).participants || [];
        for (const participant of participants) {
          if (participant.processRef) {
            processElement = participant.processRef;
          }
        }
      }
    }
    if (processElement) {
      setProcessElement(processElement);
    }
  }, []);

  // ─── 回调 ───

  /** Canvas 挂载后调用：modeler attach 到 DOM 并初始化 */
  const handleModelerCreated = useCallback(
    (container: HTMLElement) => {
      modeler.attachTo(container);

      if (!initializedRef.current) {
        initializedRef.current = true;
        const initialXml = value || DEFAULT_BPMN_XML;
        modeler
          .importXML(initialXml)
          .then(() => {
            refreshProcessElement(modeler);
            setModelerVersion((v) => v + 1);
          })
          .catch((err: any) => {
            initializedRef.current = false;
            console.error('Failed to import default BPMN XML:', err);
          });
      }
    },
    [modeler, refreshProcessElement, value],
  );

  /** 导入 XML（封装 importXML + 选中重置 + 视口适配 + 状态刷新） */
  const handleImportXml = useCallback(
    async (xml: string) => {
      await modeler.importXML(xml);
      const selection = modeler.get('selection') as Selection;
      selection.select(null);
      const canvas = modeler.get('canvas') as Canvas;
      setTimeout(() => {
        try {
          const container = canvas.getContainer();
          const containerRect = container.getBoundingClientRect();
          if (containerRect.width > 0 && containerRect.height > 0) {
            canvas.zoom('fit-viewport');
          }
        } catch (e) {
          console.warn('Failed to zoom to fit viewport:', e);
        }
      }, 100);
      refreshProcessElement(modeler);
      setModelerVersion((v) => v + 1);
    },
    [modeler, refreshProcessElement],
  );

  /** 获取 XML */
  const handleGetXml = useCallback(async () => {
    const { xml } = await modeler.saveXML({ format: true });
    return xml || '';
  }, [modeler]);

  /** 缩放 */
  const handleZoom = useCallback(
    (factor: number | 'fit-viewport') => {
      const canvas = modeler.get('canvas') as Canvas;
      try {
        if (factor === 'fit-viewport') {
          const container = canvas.getContainer();
          const containerRect = container.getBoundingClientRect();
          if (containerRect.width > 0 && containerRect.height > 0) {
            canvas.zoom(factor);
          }
        } else {
          canvas.zoom(factor);
        }
      } catch (e) {
        console.warn('Failed to zoom:', e);
      }
    },
    [modeler],
  );

  const handleZoomIn = useCallback(() => {
    const canvas = modeler.get('canvas') as Canvas;
    try {
      const current = canvas.zoom();
      if (typeof current === 'number' && Number.isFinite(current)) {
        canvas.zoom(Math.min(current + 0.1, 4));
      }
    } catch (e) {
      console.warn('Failed to zoom in:', e);
    }
  }, [modeler]);

  const handleZoomOut = useCallback(() => {
    const canvas = modeler.get('canvas') as Canvas;
    try {
      const current = canvas.zoom();
      if (typeof current === 'number' && Number.isFinite(current)) {
        canvas.zoom(Math.max(current - 0.1, 0.2));
      }
    } catch (e) {
      console.warn('Failed to zoom out:', e);
    }
  }, [modeler]);

  const handleZoomReset = useCallback(() => {
    const canvas = modeler.get('canvas') as Canvas;
    try {
      const viewbox = canvas.viewbox();
      const container = canvas.getContainer();
      const containerRect = container.getBoundingClientRect();
      if (containerRect.width > 0 && containerRect.height > 0 && viewbox) {
        canvas.zoom('fit-viewport');
      }
    } catch (e) {
      console.warn('Failed to zoom to fit viewport:', e);
    }
  }, [modeler]);

  /** 撤销 / 重做 */
  const handleUndo = useCallback(() => {
    const commandStack = modeler.get('commandStack') as CommandStack;
    commandStack.undo();
  }, [modeler]);

  const handleRedo = useCallback(() => {
    const commandStack = modeler.get('commandStack') as CommandStack;
    commandStack.redo();
  }, [modeler]);

  /** 删除选中元素 */
  const handleDeleteSelected = useCallback(() => {
    const modeling = modeler.get('modeling') as Modeling;
    const selection = modeler.get('selection') as Selection;
    const selected = selection.get();
    if (selected.length > 0) {
      modeling.removeElements(selected);
    }
  }, [modeler]);

  /** 设置工具 */
  const handleSetTool = useCallback(
    (toolName: string, e: MouseEvent) => {
      switch (toolName) {
        case 'lasso': {
          const lassoTool = modeler.get('lassoTool') as LassoTool;
          lassoTool.activateSelection(e, true);
          break;
        }
        case 'space': {
          const spaceTool = modeler.get('spaceTool') as SpaceTool;
          spaceTool.activateSelection(e, true, true);
          break;
        }
        case 'delete': {
          const selection = modeler.get('selection') as Selection;
          const selected = selection.get();
          if (selected.length > 0) {
            const modeling = modeler.get('modeling') as Modeling;
            modeling.removeElements(selected);
          }
          const handTool = modeler.get('handTool') as HandTool;
          handTool.activateHand(e);
          break;
        }
        case 'select':
        default: {
          const handTool = modeler.get('handTool') as HandTool;
          handTool.activateHand(e, true);
          break;
        }
      }
    },
    [modeler],
  );

  return {
    // 核心：全局唯一 modeler
    modeler,
    // 状态
    processElement,
    selectedElement,
    modelerVersion,
    // 回调
    handleModelerCreated,
    handleImportXml,
    handleGetXml,
    handleZoom,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleUndo,
    handleRedo,
    handleDeleteSelected,
    handleSetTool,
  };
};
