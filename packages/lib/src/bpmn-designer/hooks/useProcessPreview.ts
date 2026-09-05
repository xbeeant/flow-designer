import Modeler from 'bpmn-js/lib/Modeler';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ProcessPreviewState {
  open: boolean;
  xml: string;
}

export const useProcessPreview = () => {
  const [previewState, setPreviewState] = useState<ProcessPreviewState>({
    open: false,
    xml: '',
  });
  const modelerRef = useRef<Modeler | null>(null);

  const handleOpenPreview = useCallback(async (xml: string) => {
    setPreviewState({ open: true, xml });
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewState({ open: false, xml: '' });
    if (modelerRef.current) {
      modelerRef.current.destroy();
      modelerRef.current = null;
    }
  }, []);

  const handleModelerCreated = useCallback(
    (container: HTMLElement) => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
      }

      const modeler = new Modeler({
        container,
        keyboard: { bindTo: window },
        readOnly: true,
      });

      modelerRef.current = modeler;

      if (previewState.xml) {
        modeler.importXML(previewState.xml).catch((err) => {
          console.error('Failed to import XML:', err);
        });
      }
    },
    [previewState.xml],
  );

  useEffect(() => {
    return () => {
      if (modelerRef.current) {
        modelerRef.current.destroy();
        modelerRef.current = null;
      }
    };
  }, []);

  return {
    previewState,
    handleOpenPreview,
    handleClosePreview,
    handleModelerCreated,
  };
};
