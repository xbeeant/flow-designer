import { message } from 'antd';
import { useCallback } from 'react';
import { DEFAULT_BPMN_XML } from '../constants';

interface UseToolbarActionsProps {
  importXml: (xml: string) => Promise<void>;
  getXml: () => Promise<string>;
  undo: () => void;
  redo: () => void;
  deleteSelected: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  fitViewport: () => void;
  onSave?: (xml: string) => void;
}

export const useToolbarActions = ({
  importXml,
  getXml,
  undo,
  redo,
  deleteSelected,
  zoomIn,
  zoomOut,
  fitViewport,
  onSave,
}: UseToolbarActionsProps) => {
  const handleNew = useCallback(async () => {
    try {
      await importXml(DEFAULT_BPMN_XML);
      message.success('已创建新流程');
    } catch {
      message.error('创建失败');
    }
  }, [importXml]);

  const handleOpen = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.bpmn,.xml';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        await importXml(text);
        message.success(`已打开文件: ${file.name}`);
      } catch {
        message.error('文件打开失败');
      }
    };
    input.click();
  }, [importXml]);

  const downloadXml = (
    xml: string,
    filename: string,
    successMsg: string,
    errorMsg: string,
  ) => {
    try {
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      message.success(successMsg);
    } catch {
      message.error(errorMsg);
    }
  };

  const handleExport = useCallback(async () => {
    const xml = await getXml();
    downloadXml(xml, 'process.bpmn', '保存成功', '保存失败');
  }, [getXml]);

  const handleSave = useCallback(async () => {
    const xml = await getXml();
    onSave?.(xml);
    return xml;
  }, [getXml, onSave]);

  return {
    handleNew,
    handleOpen,
    handleSave,
    handleExport,
    handleUndo: undo,
    handleRedo: redo,
    handleDelete: deleteSelected,
    handleZoomIn: zoomIn,
    handleZoomOut: zoomOut,
    handleFitViewport: fitViewport,
  };
};
