import { Modal } from 'antd';
import Modeler from 'bpmn-js/lib/Modeler';
// @ts-expect-error
import TokenSimulation from 'bpmn-js-token-simulation';
import { useEffect, useRef } from 'react';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import 'bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css';
import type Canvas from 'diagram-js/lib/core/Canvas';

interface ProcessSimulationProps {
  open: boolean;
  onCancel: () => void;
  xml: string;
}

const ProcessSimulation: React.FC<ProcessSimulationProps> = ({
  open,
  onCancel,
  xml,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<Modeler | null>(null);

  useEffect(() => {
    if (!open) {
      if (modelerRef.current) {
        modelerRef.current.destroy();
        modelerRef.current = null;
      }
      return;
    }

    const initModeler = () => {
      if (!containerRef.current || modelerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        return;
      }

      const modeler = new Modeler({
        container: container,
        keyboard: { bindTo: document },
        additionalModules: [TokenSimulation],
      });

      modelerRef.current = modeler;

      modeler
        .importXML(xml)
        .then(() => {
          const canvas = modeler.get('canvas') as Canvas;
          setTimeout(() => {
            canvas.zoom('fit-viewport');
          }, 100);
        })
        .catch((err) => {
          console.error('Failed to import XML:', err);
        });
    };

    const timer = setTimeout(() => {
      initModeler();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (modelerRef.current) {
        modelerRef.current.destroy();
        modelerRef.current = null;
      }
    };
  }, [open, xml]);

  return (
    <Modal
      title='流程仿真'
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
      <div className='p-3 border-b border-gray-200 text-sm text-gray-500'>
        点击工具栏上的播放按钮开始仿真，点击各个节点进行流程流转
      </div>
      <div
        ref={containerRef}
        className='flex-1 w-full bg-white'
        style={{ minHeight: 500 }}
      />
    </Modal>
  );
};

export default ProcessSimulation;
