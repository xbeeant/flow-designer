import { Button, Modal, Tooltip } from 'antd';
import Viewer from 'bpmn-js/lib/Viewer';
import HandToolModule from 'diagram-js/lib/features/hand-tool';
import ZoomScrollModule from 'diagram-js/lib/navigation/zoomscroll';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef } from 'react';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import type Canvas from 'diagram-js/lib/core/Canvas';
import type HandTool from 'diagram-js/lib/features/hand-tool/HandTool';

interface ProcessPreviewProps {
  open: boolean;
  onCancel: () => void;
  xml: string;
}

const ProcessPreview: React.FC<ProcessPreviewProps> = ({
  open,
  onCancel,
  xml,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  const handleZoomIn = () => {
    if (!viewerRef.current) return;
    const canvas = viewerRef.current.get('canvas') as Canvas;
    const current = canvas.zoom();
    if (typeof current === 'number' && Number.isFinite(current)) {
      canvas.zoom(Math.min(current + 0.1, 4));
    }
  };

  const handleZoomOut = () => {
    if (!viewerRef.current) return;
    const canvas = viewerRef.current.get('canvas') as Canvas;
    const current = canvas.zoom();
    if (typeof current === 'number' && Number.isFinite(current)) {
      canvas.zoom(Math.max(current - 0.1, 0.2));
    }
  };

  const handleFitViewport = () => {
    if (!viewerRef.current) return;
    const canvas = viewerRef.current.get('canvas') as Canvas;
    const container = canvas.getContainer();
    if (container) {
      const rect = container.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        canvas.zoom('fit-viewport');
      }
    }
  };

  useEffect(() => {
    if (!open) {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
      return;
    }

    const initViewer = () => {
      if (!containerRef.current || viewerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const viewer = new Viewer({
        container: container,
        keyboard: { bindTo: window },
        additionalModules: [HandToolModule, ZoomScrollModule],
        zoomScroll: {
          minZoom: 0.2,
          maxZoom: 4,
        },
      });

      viewerRef.current = viewer;

      viewer
        .importXML(xml)
        .then(() => {
          const canvas = viewer.get('canvas') as Canvas;
          const handTool = viewer.get('handTool') as HandTool;
          // @ts-expect-error
          handTool.activateHand();

          const tryFitViewport = () => {
            const containerEl = canvas.getContainer();
            if (containerEl) {
              const containerRect = containerEl.getBoundingClientRect();
              if (containerRect.width > 0 && containerRect.height > 0) {
                canvas.zoom('fit-viewport');
              } else {
                setTimeout(tryFitViewport, 50);
              }
            }
          };

          tryFitViewport();
        })
        .catch((err) => {
          console.error('Failed to import XML:', err);
        });
    };

    const timer = setTimeout(() => {
      initViewer();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [open, xml]);

  return (
    <Modal
      title={
        <div className='flex justify-between content-center pr-10'>
          <div>流程预览</div>
          <div className='flex items-center gap-2 border-gray-200'>
            <Tooltip title='缩小'>
              <Button
                type='text'
                icon={<ZoomOut className='w-4 h-4' />}
                onClick={handleZoomOut}
              />
            </Tooltip>
            <Tooltip title='放大'>
              <Button
                type='text'
                icon={<ZoomIn className='w-4 h-4' />}
                onClick={handleZoomIn}
              />
            </Tooltip>
            <Tooltip title='适应屏幕'>
              <Button
                type='text'
                icon={<Maximize2 className='w-4 h-4' />}
                onClick={handleFitViewport}
              />
            </Tooltip>
          </div>
        </div>
      }
      open={open}
      width='95vw'
      onCancel={onCancel}
      footer={null}
      centered
      styles={{
        body: {
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(90vh - 100px)',
        },
      }}
    >
      <div
        onClick={() => {
          const viewer = viewerRef.current as Viewer;
          const handTool = viewer.get('handTool') as HandTool;
          // @ts-expect-error
          handTool.activateHand();
        }}
        ref={containerRef}
        className='flex-1 w-full bg-white'
        style={{ minHeight: 400 }}
      />
    </Modal>
  );
};

export default ProcessPreview;
