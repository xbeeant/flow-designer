import type Modeler from 'bpmn-js/lib/Modeler';
import { useCallback, useEffect, useRef } from 'react';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import type ElementFactory from 'bpmn-js/lib/features/modeling/ElementFactory';
import type Modeling from 'bpmn-js/lib/features/modeling/Modeling';
import type { Moddle } from 'bpmn-js/lib/model/Types';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import type Canvas from 'diagram-js/lib/core/Canvas';
import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import { generateId } from '../util/random-char.ts';

interface CanvasProps {
  modeler: Modeler;
  onModelerCreated?: (container: HTMLElement) => void;
}

type CreateShapeStrategy = (props: {
  elementFactory: ElementFactory;
  modeling: Moddle;
  elementRegistry: ElementRegistry;
  rootElement: ModdleElement;
  canvasX: number;
  canvasY: number;
  shapeConfig: Record<string, any>;
}) => void;

const SHAPE_STRATEGIES: Record<string, CreateShapeStrategy> = {
  'bpmn:Participant': ({
    elementFactory,
    modeling,
    rootElement,
    canvasX,
    canvasY,
  }) => {
    const participantShape = elementFactory.createParticipantShape({
      id: generateId(`Participant`),
    });
    modeling.createShape(
      participantShape,
      { x: canvasX, y: canvasY, width: 300, height: 200 },
      rootElement,
    );
  },

  'bpmn:Group': ({
    elementFactory,
    modeling,
    rootElement,
    canvasX,
    canvasY,
  }) => {
    const groupShape = elementFactory.createShape({
      type: 'bpmn:Group',
      id: generateId('Group'),
    });
    modeling.createShape(
      groupShape,
      { x: canvasX, y: canvasY, width: 200, height: 150 },
      rootElement,
    );
  },

  'bpmn:Lane': ({ elementFactory, modeling, elementRegistry }) => {
    const participants = elementRegistry.filter(
      (element: any) => element.type === 'bpmn:Participant',
    );
    if (participants.length > 0) {
      const participant = participants[participants.length - 1];
      const laneShape = elementFactory.createShape({
        type: 'bpmn:Lane',
        id: generateId('Lane'),
      });
      modeling.createShape(laneShape, { x: 0, y: 0 }, participant);
    }
  },
};

const createDefaultShape: CreateShapeStrategy = ({
  elementFactory,
  modeling,
  rootElement,
  canvasX,
  canvasY,
  shapeConfig,
}) => {
  const shape = elementFactory.createShape(shapeConfig);
  modeling.createShape(shape, { x: canvasX, y: canvasY }, rootElement);
};

const CanvasComponent: React.FC<CanvasProps> = ({
  modeler,
  onModelerCreated,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelerRef = useRef<Modeler>(modeler);
  modelerRef.current = modeler;

  useEffect(() => {
    if (!containerRef.current) return;
    onModelerCreated?.(containerRef.current);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const targetData = e.dataTransfer.getData('application/bpmn-element');
    if (!targetData || !modelerRef.current) return;

    const m = modelerRef.current;
    const canvasService = m.get('canvas') as Canvas;
    const elementFactory = m.get('elementFactory') as ElementFactory;
    const modeling = m.get('modeling') as Modeling;
    const elementRegistry = m.get('elementRegistry') as ElementRegistry;

    const container = canvasService.getContainer();
    const bounds = container.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    const zoom = canvasService.zoom();
    const viewbox = canvasService.viewbox();
    const canvasX = x / zoom + viewbox.x;
    const canvasY = y / zoom + viewbox.y;

    let shapeConfig: Record<string, any>;
    let elementType: string;
    try {
      const parsedTarget = JSON.parse(targetData);
      if (typeof parsedTarget === 'object' && parsedTarget.type) {
        shapeConfig = { type: parsedTarget.type };
        elementType = parsedTarget.type;
        if (parsedTarget.eventDefinitionType) {
          shapeConfig.eventDefinitionType = parsedTarget.eventDefinitionType;
        }
        if (parsedTarget.isExpanded !== undefined) {
          shapeConfig.isExpanded = parsedTarget.isExpanded;
        }
        if (parsedTarget.triggeredByEvent !== undefined) {
          shapeConfig.triggeredByEvent = parsedTarget.triggeredByEvent;
        }
      } else {
        shapeConfig = { type: parsedTarget };
        elementType = parsedTarget;
      }
    } catch {
      shapeConfig = { type: targetData };
      elementType = targetData;
    }

    const rootElement = canvasService.getRootElement();
    const strategy = SHAPE_STRATEGIES[elementType] || createDefaultShape;

    strategy({
      elementFactory,
      modeling,
      elementRegistry,
      rootElement,
      canvasX,
      canvasY,
      shapeConfig,
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className='h-full w-full bg-white rounded-lg'
      style={{ minHeight: 400 }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    />
  );
};

export default CanvasComponent;
