import { Alert, Modal, Space } from 'antd';
import { BugIcon, CheckCircle, TriangleAlertIcon } from 'lucide-react';
import type { ValidationError } from '../hooks/useProcessValidation';

interface ProcessValidationProps {
  open: boolean;
  onCancel: () => void;
  errors: ValidationError[];
}

const ProcessValidation: React.FC<ProcessValidationProps> = ({
  open,
  onCancel,
  errors,
}) => {
  const errorCount = errors.filter((e) => e.type === 'error').length;
  const warningCount = errors.filter((e) => e.type === 'warning').length;

  return (
    <Modal
      title='流程校验'
      open={open}
      width={700}
      onCancel={onCancel}
      footer={null}
    >
      <div className='mb-4'>
        <Space size='middle'>
          <span className='text-sm'>
            共发现 <span className='text-red-500 font-bold'>{errorCount}</span>{' '}
            个错误，
            <span className='text-yellow-500 font-bold'>{warningCount}</span>{' '}
            个警告
          </span>
          {errorCount === 0 && warningCount === 0 && (
            <span className='flex items-center gap-1 text-green-500'>
              <CheckCircle size={16} />
              流程校验通过
            </span>
          )}
        </Space>
      </div>

      <div className='max-h-100 overflow-y-auto space-y-3'>
        {errors.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-8'>
            <CheckCircle className='w-16 h-16 text-green-500 mb-4' />
            <p className='text-gray-500'>流程校验通过，没有发现问题</p>
          </div>
        ) : (
          errors.map((error) => (
            <Alert
              key={error.id}
              type={error.type === 'error' ? 'error' : 'warning'}
              icon={
                error.type === 'error' ? (
                  <BugIcon size={16} />
                ) : (
                  <TriangleAlertIcon size={16} />
                )
              }
              message={
                <div className='flex items-center justify-between'>
                  <span>{error.title}</span>
                  {error.elementName && (
                    <span className='text-xs text-gray-400'>
                      {error.elementName}
                    </span>
                  )}
                </div>
              }
              description={error.message}
              showIcon
            />
          ))
        )}
      </div>
    </Modal>
  );
};

export default ProcessValidation;
