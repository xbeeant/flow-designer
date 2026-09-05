import { Button, Dropdown, type MenuProps, Modal, Switch, Tooltip } from 'antd';
import {
  BugIcon,
  Check,
  Code,
  Copy,
  Download,
  Eye,
  FolderOpen,
  Globe,
  Maximize2,
  Play,
  Plus,
  Redo2,
  Save,
  Trash2,
  Undo2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useToolbarActions } from '../hooks/useToolbarActions.ts';
import { useXmlPreview } from '../hooks/useXmlPreview.ts';
import type { Language } from '../translate';

interface XmlPreviewModalProps {
  open: boolean;
  onCancel: () => void;
  xmlContent: string;
  copied: boolean;
  onCopy: () => void;
}

interface ToolbarProps {
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  importXml: (xml: string) => Promise<void>;
  getXml: () => Promise<string>;
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitViewport: () => void;
  onSave?: (xml: string) => void;
  onPreview?: () => void;
  onSimulate?: () => void;
  validationEnabled?: boolean;
  onToggleValidation?: () => void;
}

const XmlPreviewModal: React.FC<XmlPreviewModalProps> = ({
  open,
  onCancel,
  xmlContent,
  copied,
  onCopy,
}) => (
  <Modal
    title='BPMN XML 预览'
    open={open}
    width={1024}
    onCancel={onCancel}
    footer={null}
    styles={{ body: { padding: 0 } }}
  >
    <div className='relative'>
      <button
        type='button'
        onClick={onCopy}
        className='absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white text-xs transition-all duration-200 border border-gray-700 hover:border-gray-500'
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? '已复制' : '复制'}
      </button>
      <pre className='bg-gray-950 text-gray-100 p-4 overflow-auto max-h-[70vh] text-xs leading-relaxed rounded-b-lg font-mono whitespace-pre-wrap break-all'>
        <code>{xmlContent}</code>
      </pre>
    </div>
  </Modal>
);

const Toolbar: React.FC<ToolbarProps> = ({
  currentLang,
  onLangChange,
  importXml,
  getXml,
  undo,
  redo,
  deleteSelected,
  zoomIn,
  zoomOut,
  fitViewport,
  onSave,
  onPreview,
  onSimulate,
  validationEnabled = true,
  onToggleValidation,
}) => {
  const {
    handleNew,
    handleOpen,
    handleSave,
    handleExport,
    handleUndo,
    handleRedo,
    handleDelete,
    handleZoomIn,
    handleZoomOut,
    handleFitViewport,
  } = useToolbarActions({
    importXml,
    getXml,
    undo,
    redo,
    deleteSelected,
    zoomIn,
    zoomOut,
    fitViewport,
    onSave,
  });

  const {
    xmlPreviewOpen,
    setXmlPreviewOpen,
    xmlContent,
    copied,
    handlePreviewXml,
    handleCopyXml,
  } = useXmlPreview({ getXml });

  const langMenuItems: MenuProps['items'] = [
    {
      key: 'zh',
      label: '中文',
      onClick: () => onLangChange('zh'),
    },
    {
      key: 'en',
      label: 'English',
      onClick: () => onLangChange('en'),
    },
  ];

  return (
    <div className='flex items-center px-4 py-2.5 border-b border-gray-200 bg-white shadow-sm'>
      <div className='flex items-center gap-0.5 pr-4 border-r border-gray-200'>
        <Tooltip title='新建'>
          <Button
            type='text'
            icon={<Plus className='w-4 h-4' />}
            onClick={handleNew}
          />
        </Tooltip>
        <Tooltip title='打开'>
          <Button
            type='text'
            icon={<FolderOpen className='w-4 h-4' />}
            onClick={handleOpen}
          />
        </Tooltip>
        <Tooltip title='保存'>
          <Button
            type='text'
            icon={<Save className='w-4 h-4' />}
            onClick={handleSave}
          />
        </Tooltip>
        <Tooltip title='导出 BPMN'>
          <Button
            type='text'
            icon={<Download className='w-4 h-4' />}
            onClick={handleExport}
          />
        </Tooltip>
        <Tooltip title='预览 XML'>
          <Button
            type='text'
            icon={<Code className='w-4 h-4' />}
            onClick={handlePreviewXml}
          />
        </Tooltip>
      </div>

      <div className='flex items-center gap-0.5 px-4 border-r border-gray-200'>
        <Tooltip title='撤销'>
          <Button
            type='text'
            icon={<Undo2 className='w-4 h-4' />}
            onClick={handleUndo}
          />
        </Tooltip>
        <Tooltip title='重做'>
          <Button
            type='text'
            icon={<Redo2 className='w-4 h-4' />}
            onClick={handleRedo}
          />
        </Tooltip>
        <Tooltip title='删除'>
          <Button
            type='text'
            danger
            icon={<Trash2 className='w-4 h-4' />}
            onClick={handleDelete}
          />
        </Tooltip>
      </div>

      <div className='flex items-center gap-0.5 pr-4 border-r border-gray-200'>
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
        <Tooltip title='适应画布'>
          <Button
            type='text'
            icon={<Maximize2 className='w-4 h-4' />}
            onClick={handleFitViewport}
          />
        </Tooltip>
      </div>

      <div className='flex items-center gap-0.5 px-4 border-r border-gray-200'>
        <Tooltip title='预览流程图'>
          <Button
            type='text'
            icon={<Eye className='w-4 h-4' />}
            onClick={onPreview}
          />
        </Tooltip>
        <Tooltip title='流程仿真'>
          <Button
            type='text'
            icon={<Play className='w-4 h-4' />}
            onClick={onSimulate}
          />
        </Tooltip>
      </div>

      <div className='flex items-center gap-2 px-3 border-r border-gray-200'>
        <Tooltip title={validationEnabled ? '关闭校验' : '开启校验'}>
          <div
            className='flex items-center gap-1.5 cursor-pointer select-none'
            onClick={onToggleValidation}
          >
            <BugIcon
              className={`w-4 h-4 ${validationEnabled ? 'text-green-500' : 'text-gray-400'}`}
            />
            <span className='text-xs text-gray-500'>校验</span>
            <Switch size='small' checked={validationEnabled} />
          </div>
        </Tooltip>
      </div>

      <div className='flex-1' />

      <Tooltip title='语言'>
        <Dropdown menu={{ items: langMenuItems }}>
          <Button type='text' icon={<Globe className='w-4 h-4' />}>
            {currentLang === 'zh' ? '中文' : 'English'}
          </Button>
        </Dropdown>
      </Tooltip>

      <div className='flex items-center gap-2 text-xs text-gray-400'>
        <span className='px-2 py-1 bg-gray-50 rounded-md border border-gray-100'>
          Flowable Designer
        </span>
      </div>

      {xmlPreviewOpen && (
        <XmlPreviewModal
          open={xmlPreviewOpen}
          onCancel={() => setXmlPreviewOpen(false)}
          xmlContent={xmlContent}
          copied={copied}
          onCopy={handleCopyXml}
        />
      )}
    </div>
  );
};

export default Toolbar;
