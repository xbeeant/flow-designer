import { Descriptions, Tag } from 'antd';
import type { ModdleElement } from 'bpmn-js/lib/model/Types.ts';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import type { Connection } from 'diagram-js/lib/model/Types.ts';
import { ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { getElementTypeColor, getElementTypeLabel } from '../util/element-type';

interface ElementInfoPropertiesProps {
  element: ModdleElement;
  incoming: Connection;
  outgoing: Connection;
}

const ElementInfoProperties: React.FC<ElementInfoPropertiesProps> = ({
  element,
  incoming,
  outgoing,
}) => {
  if (!element) return null;

  const { businessObject } = element;
  const elementType = businessObject.$type;
  const elementColor = getElementTypeColor(elementType, businessObject);

  return (
    <div className='space-y-3'>
      <Descriptions
        column={1}
        size='small'
        bordered={false}
        className='text-xs'
      >
        <Descriptions.Item label='元素类型' className='bg-white px-0 pb-2'>
          <Tag color={elementColor} className='text-xs px-2 py-0.5 font-medium'>
            {getElementTypeLabel(elementType, businessObject)}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item
          label='BusinessObject'
          className='bg-white px-0 pb-2'
        >
          <code className='text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-md font-mono'>
            {elementType}
          </code>
        </Descriptions.Item>
        {businessObject.asyncBefore && (
          <Descriptions.Item label='异步' className='bg-white px-0 pb-2'>
            <Tag color='green' className='text-xs px-2 py-0.5 font-medium'>
              异步前
            </Tag>
          </Descriptions.Item>
        )}
        {businessObject.asyncAfter && (
          <Descriptions.Item label='异步' className='bg-white px-0 pb-2'>
            <Tag color='green' className='text-xs px-2 py-0.5 font-medium'>
              异步后
            </Tag>
          </Descriptions.Item>
        )}
        {businessObject.exclusive && (
          <Descriptions.Item label='排他' className='bg-white px-0 pb-2'>
            <Tag color='orange' className='text-xs px-2 py-0.5 font-medium'>
              是
            </Tag>
          </Descriptions.Item>
        )}
        <Descriptions.Item
          label={`流入连接 (${incoming.length})`}
          className='bg-white px-0 pb-2'
        >
          {incoming.length === 0 ? (
            <div className='text-xs text-gray-400 bg-gray-50 px-2 py-1.5 rounded-lg'>
              无流入连接
            </div>
          ) : (
            <div className='space-y-1.5 flex gap-1'>
              {incoming.map((conn: any, index: number) => (
                <div
                  key={index}
                  className='text-xs bg-emerald-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-100'
                >
                  <ArrowLeft className='flow-icon-button-sm text-emerald-500' />
                  <span className='text-gray-600 truncate'>
                    {getBusinessObject(conn)?.name ||
                      conn.id ||
                      `连接 ${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Descriptions.Item>
        <Descriptions.Item
          label={`流出连接 (${outgoing.length})`}
          className='bg-white px-0 pb-2'
        >
          {outgoing.length === 0 ? (
            <div className='text-xs text-gray-400 bg-gray-50 px-2 py-1.5 rounded-lg'>
              无流出连接
            </div>
          ) : (
            <div className='space-y-1.5 flex gap-1'>
              {outgoing.map((conn: any, index: number) => (
                <div
                  key={index}
                  className='text-xs bg-blue-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100'
                >
                  <ArrowRight className='flow-icon-button-sm text-blue-500' />
                  <span className='text-gray-600 truncate'>
                    {getBusinessObject(conn)?.name ||
                      conn.id ||
                      `连接 ${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export const ElementInfoPropertiesPanel = {
  key: 'el-info',
  label: (
    <span className='flex items-center gap-2 text-gray-600 font-medium'>
      <Layers className='flow-icon-panel text-blue-500' />
      元素信息
    </span>
  ),
};

export default ElementInfoProperties;
