import { Alert, Segmented } from 'antd';
import type Modeler from 'bpmn-js/lib/Modeler';
import type Canvas from 'diagram-js/lib/core/Canvas';
import type ElementRegistry from 'diagram-js/lib/core/ElementRegistry';
import type Selection from 'diagram-js/lib/features/selection/Selection';
import {
  BugIcon,
  ChevronDown,
  ChevronUp,
  TriangleAlertIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ValidationError } from '../hooks/useProcessValidation';

interface ValidationPanelProps {
  errors: ValidationError[];
  modeler?: Modeler;
}

type FilterMode = 'all' | 'error' | 'warning';

const ValidationPanel: React.FC<ValidationPanelProps> = ({
  errors,
  modeler,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  const errorCount = errors.filter((e) => e.type === 'error').length;
  const warningCount = errors.filter((e) => e.type === 'warning').length;

  const filteredErrors = useMemo(() => {
    if (filterMode === 'all') return errors;
    return errors.filter((e) => e.type === filterMode);
  }, [errors, filterMode]);

  if (errors.length === 0) {
    return null;
  }

  const handleErrorClick = (error: ValidationError) => {
    if (error.elementId && modeler) {
      const elementRegistry = modeler.get('elementRegistry') as ElementRegistry;
      const element = elementRegistry.get(error.elementId);

      if (element) {
        const canvas = modeler.get('canvas') as Canvas;
        const selection = modeler.get('selection') as Selection;

        selection.select(element);
        canvas.scrollToElement(element);
      }
    }
  };

  const filterOptions = [
    { label: `全部(${errors.length})`, value: 'all' },
    { label: `错误(${errorCount})`, value: 'error' },
    { label: `警告(${warningCount})`, value: 'warning' },
  ];

  return (
    <div className='absolute bottom-4 left-4 z-50'>
      <div className='bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden w-125'>
        <div
          className='flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-50'
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className='flex items-center gap-2'>
            {errorCount > 0 ? (
              <BugIcon className='w-4 h-4 text-red-500' />
            ) : (
              <TriangleAlertIcon className='w-4 h-4 text-yellow-500' />
            )}
            <span className='text-sm font-medium'>
              {errorCount > 0 ? '校验错误' : '校验警告'}
            </span>
            <span className='text-xs text-gray-500'>
              ({errorCount} 错误, {warningCount} 警告)
            </span>
          </div>
          {collapsed ? (
            <ChevronUp className='w-4 h-4 text-gray-400' />
          ) : (
            <ChevronDown className='w-4 h-4 text-gray-400' />
          )}
        </div>

        {!collapsed && (
          <>
            <div className='px-3 py-2 border-t border-gray-100 bg-gray-50/50' onClick={(e) => e.stopPropagation()}>
              <Segmented
                size='small'
                value={filterMode}
                onChange={(val) => setFilterMode(val as FilterMode)}
                options={filterOptions}
              />
            </div>

            <div className='max-h-75 overflow-y-auto flex flex-col gap-1 p-1'>
              {filteredErrors.map((error) => (
                <Alert
                  key={error.id}
                  type={error.type === 'error' ? 'error' : 'warning'}
                  icon={
                    error.type === 'error' ? (
                      <BugIcon size={14} />
                    ) : (
                      <TriangleAlertIcon size={14} />
                    )
                  }
                  description={
                    <div>
                      <span className='text-xs font-medium'>{error.title} :</span>
                      <span className='text-xs'> {error.message}</span>
                    </div>
                  }
                  showIcon
                  onClick={() => handleErrorClick(error)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ValidationPanel;
