import Modeler from 'bpmn-js/lib/Modeler';
// @ts-expect-error
import TokenSimulation from 'bpmn-js-token-simulation';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ProcessSimulationState {
  open: boolean;
  xml: string;
}

export const useProcessSimulation = () => {
  const [simulationState, setSimulationState] =
    useState<ProcessSimulationState>({
      open: false,
      xml: '',
    });
  const modelerRef = useRef<Modeler | null>(null);

  const handleOpenSimulation = useCallback(async (xml: string) => {
    setSimulationState({ open: true, xml });
  }, []);

  const handleCloseSimulation = useCallback(() => {
    setSimulationState({ open: false, xml: '' });
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
        additionalModules: [TokenSimulation],
      });

      modelerRef.current = modeler;

      if (simulationState.xml) {
        modeler.importXML(simulationState.xml).catch((err) => {
          console.error('Failed to import XML:', err);
        });
      }
    },
    [simulationState.xml],
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
    simulationState,
    handleOpenSimulation,
    handleCloseSimulation,
    handleModelerCreated,
  };
};
