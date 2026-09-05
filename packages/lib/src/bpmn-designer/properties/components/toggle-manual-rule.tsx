import { Checkbox, Input } from 'antd';
import { useEffect, useState } from 'react';

const convertToStringNumber = (value?: boolean | string) => {
  if (typeof value === 'boolean') {
    return value ? '1' : '0';
  }

  return value;
};

const ToggleManualRule = ({
  value,
  onChange,
  label,
}: {
  label: string;
  value?: string | boolean;
  onChange: (value: string) => void;
}) => {
  const strValue = convertToStringNumber(value);
  const [mode, setMode] = useState(false);
  const [expression, setExpression] = useState(strValue || '');

  useEffect(() => {
    if (strValue) {
      setMode(strValue.length > 1);
    } else {
      setMode(false);
    }
  }, [strValue]);

  return (
    <div className={`flex gap-1 ${mode ? 'flex-col justify-start' : ''}`}>
      {mode ? (
        <Input.TextArea
          placeholder="请输入规则表达式: ${a === '1'}"
          value={expression}
          onChange={(e) => {
            onChange(expression);
            setExpression(e.target.value);
          }}
        />
      ) : (
        <Checkbox
          checked={strValue === '1'}
          onChange={(e) => onChange(e.target.checked ? '1' : '0')}
        >
          <span>{label}</span>
        </Checkbox>
      )}
      <div className='flex'>
        <Checkbox
          checked={mode}
          onChange={() => {
            setMode(!mode);
          }}
        >
          {'表达式'}
        </Checkbox>
      </div>
    </div>
  );
};

export default ToggleManualRule;
