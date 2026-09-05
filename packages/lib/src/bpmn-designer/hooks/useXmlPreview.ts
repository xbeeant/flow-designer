import { message } from 'antd';
import { useCallback, useState } from 'react';

interface UseXmlPreviewProps {
  getXml: () => Promise<string>;
}

export const useXmlPreview = ({ getXml }: UseXmlPreviewProps) => {
  const [xmlPreviewOpen, setXmlPreviewOpen] = useState(false);
  const [xmlContent, setXmlContent] = useState('');
  const [copied, setCopied] = useState(false);

  const handlePreviewXml = useCallback(async () => {
    try {
      const xml = await getXml();
      const formatted = formatXml(xml);
      setXmlContent(formatted);
      setXmlPreviewOpen(true);
      setCopied(false);
    } catch (e) {
      console.error(e);
      message.error('获取 XML 失败');
    }
  }, [getXml]);

  const handleCopyXml = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(xmlContent);
      setCopied(true);
      await message.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      await message.error('复制失败');
    }
  }, [xmlContent]);

  return {
    xmlPreviewOpen,
    setXmlPreviewOpen,
    xmlContent,
    copied,
    handlePreviewXml,
    handleCopyXml,
  };
};

const formatXml = (xml: string): string => {
  return xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3').replace(/\n/g, '\n  ');
};
