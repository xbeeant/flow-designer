import { ChevronLeft, ChevronRight } from 'lucide-react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ResizablePanelProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  leftPanel,
  rightPanel,
}) => {
  const [leftWidth, setLeftWidth] = useState<number>(45);
  const [isDragging, setIsDragging] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const containerWidthRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!containerRef.current) return;

      containerWidthRef.current = containerRef.current.clientWidth;
      startXRef.current = e.clientX;
      startWidthRef.current = leftWidth;

      setIsDragging(true);
    },
    [leftWidth],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startXRef.current;
      const deltaPercent = (deltaX / containerWidthRef.current) * 100;
      let newWidth = startWidthRef.current + deltaPercent;

      newWidth = Math.max(0, Math.min(100, newWidth));
      setLeftWidth(newWidth);
    },
    [isDragging],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mouseleave', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const toggleRightPanel = useCallback(() => {
    setIsRightCollapsed((prev) => !prev);
  }, []);

  return (
    <div
      ref={containerRef}
      className='flex flex-1 overflow-hidden mx-2 my-2 rounded-lg border border-gray-200 shadow-sm bg-white'
    >
      <div
        className='h-full overflow-hidden'
        style={{
          width: isRightCollapsed ? '100%' : `${leftWidth}%`,
          transition: isDragging ? 'none' : 'width 0.3s ease-out',
        }}
      >
        {leftPanel}
      </div>

      {!isRightCollapsed && (
        <>
          <div
            className={`w-2 h-full cursor-col-resize flex items-center justify-center ${
              isDragging ? 'bg-primary' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            onMouseDown={handleMouseDown}
          >
            <div
              className={`w-1 h-6 rounded-full ${
                isDragging ? 'bg-white' : 'bg-gray-400'
              }`}
            />
          </div>

          <div
            className='h-full overflow-hidden'
            style={{
              width: `${100 - leftWidth}%`,
              transition: isDragging ? 'none' : 'width 0.3s ease-out',
            }}
          >
            {rightPanel}
          </div>
        </>
      )}

      <button
        type='button'
        onClick={toggleRightPanel}
        className={`absolute top-1/2 -translate-y-1/2 z-10 w-8 h-12 flex items-center justify-center rounded-lg shadow-md transition-all duration-200 ${
          isRightCollapsed
            ? 'right-2 bg-white border border-gray-200 hover:border-primary hover:text-primary'
            : '-right-4 bg-white border border-gray-200 hover:border-primary hover:text-primary'
        }`}
      >
        {isRightCollapsed ? (
          <ChevronLeft className='w-4 h-4' />
        ) : (
          <ChevronRight className='w-4 h-4' />
        )}
      </button>
    </div>
  );
};

export default ResizablePanel;
