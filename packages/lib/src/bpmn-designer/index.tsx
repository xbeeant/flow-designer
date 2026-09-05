import { useCallback, useEffect, useState } from 'react';
import CanvasComponent from './components/CanvasComponent.tsx';
import Palette from './components/Palette';
import ProcessPreview from './components/ProcessPreview';
import ProcessSimulation from './components/ProcessSimulation';
import PropertiesPanel from './components/PropertiesPanel';
import ResizablePanel from './components/ResizablePanel';
import Toolbar from './components/Toolbar';
import ValidationPanel from './components/ValidationPanel';

import { useBpmnModeler } from './hooks/useBpmnModeler';
import { useProcessPreview } from './hooks/useProcessPreview';
import { useProcessSimulation } from './hooks/useProcessSimulation';
import {
  useProcessValidation,
  type ValidationError,
} from './hooks/useProcessValidation';
import { type Language, setLang } from './translate';
import type { BpmnDesignerProps } from './types';

const BpmnDesigner: React.FC<BpmnDesignerProps> = ({
  config,
  value,
  onSave,
  forms,
  enableValidation = true,
}) => {
  const [currentLang, setCurrentLang] = useState<Language>('zh');
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    [],
  );
  const [validationEnabled, setValidationEnabled] = useState(enableValidation);

  const {
    modeler,
    processElement,
    selectedElement,
    modelerVersion,
    handleModelerCreated,
    handleImportXml,
    handleGetXml,
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
    handleUndo,
    handleRedo,
    handleDeleteSelected,
    handleSetTool,
  } = useBpmnModeler(config, value);

  const { previewState, handleOpenPreview, handleClosePreview } =
    useProcessPreview();

  const { validateProcess, clearMarkers } = useProcessValidation();

  const { simulationState, handleOpenSimulation, handleCloseSimulation } =
    useProcessSimulation();

  const toggleValidation = useCallback(() => {
    setValidationEnabled((prev) => {
      const next = !prev;
      if (!next) {
        setValidationErrors([]);
        if (modeler) {
          clearMarkers(modeler);
        }
      }
      return next;
    });
  }, [modeler, clearMarkers]);

  useEffect(() => {
    if (!validationEnabled && modeler) {
      setValidationErrors([]);
      clearMarkers(modeler);
    }
  }, [validationEnabled, modeler, clearMarkers]);

  useEffect(() => {
    if (!validationEnabled) {
      return;
    }

    const runValidation = async () => {
      try {
        await handleGetXml();
        const errors = validateProcess('', modeler);
        setValidationErrors(errors);
      } catch {
        setValidationErrors([]);
      }
    };

    const timer = setTimeout(runValidation, 300);
    return () => clearTimeout(timer);
  }, [modelerVersion, handleGetXml, validateProcess, modeler, validationEnabled]);

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    setLang(lang);
  };

  const handlePreview = async () => {
    const xml = await handleGetXml();
    handleOpenPreview(xml);
  };

  const handleSimulate = async () => {
    const xml = await handleGetXml();
    handleOpenSimulation(xml);
  };

  return (
    <div className='flex flex-col h-full w-full rounded-xl overflow-hidden shadow-lg bg-white border border-gray-200 flow-designer'>
      <Toolbar
        currentLang={currentLang}
        onLangChange={handleLangChange}
        importXml={handleImportXml}
        getXml={handleGetXml}
        undo={handleUndo}
        redo={handleRedo}
        deleteSelected={handleDeleteSelected}
        zoomIn={handleZoomIn}
        zoomOut={handleZoomOut}
        fitViewport={handleZoomReset}
        onSave={onSave}
        onPreview={handlePreview}
        onSimulate={handleSimulate}
        validationEnabled={validationEnabled}
        onToggleValidation={toggleValidation}
      />

      <div className='flex flex-1 overflow-hidden bg-gray-50/50'>
        <Palette modeler={modeler} onToolChange={handleSetTool} />

        <div className='flex-1 flex overflow-hidden relative'>
          <ResizablePanel
            leftPanel={
              <div className='relative h-full w-full'>
                <CanvasComponent
                  modeler={modeler}
                  onModelerCreated={handleModelerCreated}
                />
                {validationEnabled && (
                  <ValidationPanel errors={validationErrors} modeler={modeler} />
                )}
              </div>
            }
            rightPanel={
              <PropertiesPanel
                modeler={modeler}
                selectedElement={selectedElement}
                processElement={processElement}
                modelerVersion={modelerVersion}
                forms={forms}
              />
            }
          />
        </div>
      </div>

      {previewState.open && (
        <ProcessPreview
          open={previewState.open}
          onCancel={handleClosePreview}
          xml={previewState.xml}
        />
      )}

      {simulationState.open && (
        <ProcessSimulation
          open={simulationState.open}
          onCancel={handleCloseSimulation}
          xml={simulationState.xml}
        />
      )}
    </div>
  );
};

export default BpmnDesigner;
