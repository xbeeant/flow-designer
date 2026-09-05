import { Collapse, Tooltip } from 'antd';
import { useCallback, useRef, useState } from 'react';
import {
  PALETTE_GROUPS,
  type PaletteEntry,
  type PaletteProps,
  type TargetConfig,
  TOOL_ITEMS,
} from './paletteData';

/* ─── 工具函数 ─── */

const getTargetKey = (target: string | TargetConfig): string =>
  typeof target === 'string' ? target : JSON.stringify(target);

const createDragGhost = (icon: string): HTMLDivElement => {
  const ghost = document.createElement('div');
  ghost.className = `bpmn-icon ${icon}`;
  ghost.style.cssText = `
    display:flex;align-items:center;justify-content:center;
    width:48px;height:48px;background:#fff;
    border:2px solid #3b82f6;border-radius:8px;
    box-shadow:0 4px 12px rgba(59,130,246,.25);
    color:#3b82f6;position:fixed;top:-9999px;left:-9999px;
    z-index:9999;cursor:grabbing;font-family:bpmn;font-size:24px;
  `;
  return ghost;
};

const TOOL_NEXT_STATE: Record<string, string> = {
  select: 'select',
  lasso: 'lasso',
  space: 'space',
  remove: 'space',
  delete: 'select',
};

/* ─── 子组件 ─── */

const BpmnIcon: React.FC<{
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}> = ({ icon, className = '', style }) => (
  <span className={`bpmn-icon ${icon} ${className}`} style={style} />
);

const GroupLabel: React.FC<{ icon: string; title: string; color?: string }> = ({
  icon,
  title,
  color,
}) => (
  <span className='flex gap-2'>
    <BpmnIcon icon={icon} style={color ? { color } : undefined} />
    <span>{title}</span>
  </span>
);

const ToolItems: React.FC<{
  activeTool: string;
  onToolClick: (toolType: string, event: React.MouseEvent) => void;
}> = ({ activeTool, onToolClick }) => (
  <div className='flow-palette-group-items'>
    {TOOL_ITEMS.map((item) => (
      <Tooltip key={getTargetKey(item.target)} title={item.title}>
        <div
          className={`flow-palette-tool-item ${activeTool === item.toolType ? 'flow-palette-tool-item-active' : ''}`}
          onClick={(e) => onToolClick(item.toolType || '', e)}
        >
          <BpmnIcon icon={item.icon} className='flow-palette-tool-icon' />
        </div>
      </Tooltip>
    ))}
  </div>
);

const ElementItems: React.FC<{
  items: PaletteEntry[];
  draggingTarget: string | null;
  onDragStart: (
    e: React.DragEvent,
    target: PaletteEntry['target'],
    icon: string,
  ) => void;
  onDragEnd: () => void;
}> = ({ items, draggingTarget, onDragStart, onDragEnd }) => (
  <div className='flow-palette-group-items'>
    {items.map((item, index) => {
      const targetKey = getTargetKey(item.target);
      return (
        <Tooltip key={`${targetKey}-${index}`} title={item.title}>
          <div
            className={`flow-palette-item ${draggingTarget === targetKey ? 'flow-palette-item-dragging' : ''}`}
            draggable
            onDragStart={(e) => onDragStart(e, item.target, item.icon)}
            onDragEnd={onDragEnd}
          >
            <BpmnIcon
              icon={item.icon}
              className='flow-palette-item-icon'
              style={{ color: item.color }}
            />
          </div>
        </Tooltip>
      );
    })}
  </div>
);

/* ─── 主组件 ─── */

const Palette: React.FC<PaletteProps> = ({ modeler, onToolChange }) => {
  const dragStartRef = useRef<{ target: string | TargetConfig } | null>(null);
  const [draggingTarget, setDraggingTarget] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string>('select');

  const handleDragStart = useCallback(
    (e: React.DragEvent, target: string | TargetConfig, icon: string) => {
      if (!e.dataTransfer) return;
      dragStartRef.current = { target };
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(
        'application/bpmn-element',
        JSON.stringify(target),
      );
      setDraggingTarget(getTargetKey(target));
      setActiveTool('select');

      const ghost = createDragGhost(icon);
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 24, 24);
      requestAnimationFrame(() => document.body.removeChild(ghost));
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    setDraggingTarget(null);
    dragStartRef.current = null;
  }, []);

  const handleToolClick = useCallback(
    (toolType: string, event: React.MouseEvent) => {
      onToolChange(toolType || 'selection', event.nativeEvent as MouseEvent);
      setActiveTool(TOOL_NEXT_STATE[toolType] ?? 'select');
    },
    [modeler, onToolChange],
  );

  const collapseItems = [
    {
      key: 'tools',
      label: <GroupLabel icon='bpmn-icon-screw-wrench' title='工具' />,
      children: (
        <ToolItems activeTool={activeTool} onToolClick={handleToolClick} />
      ),
    },
    ...PALETTE_GROUPS.map((group) => ({
      key: group.title,
      label: (
        <GroupLabel icon={group.icon} title={group.title} color={group.color} />
      ),
      children: (
        <ElementItems
          items={group.items}
          draggingTarget={draggingTarget}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      ),
    })),
  ];

  return (
    <div className='flow-palette'>
      <Collapse
        classNames={{
          body: 'flow-palette-body',
        }}
        bordered={false}
        defaultActiveKey={collapseItems.map((item) => item.key)}
        items={collapseItems}
      />
    </div>
  );
};

export default Palette;
