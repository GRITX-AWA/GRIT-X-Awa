import { useEffect, useState } from 'react';

interface CursorPosition {
  x: number;
  y: number;
}

export default function CustomCursor() {
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [cursorDotPosition, setCursorDotPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let rafId: number;
    let dotRafId: number;

    // Smooth cursor following with different speeds
    const updateCursorPosition = (e: MouseEvent) => {
      rafId = requestAnimationFrame(() => {
        setCursorPosition({ x: e.clientX, y: e.clientY });
      });
    };

    const updateDotPosition = (e: MouseEvent) => {
      dotRafId = requestAnimationFrame(() => {
        setCursorDotPosition({ x: e.clientX, y: e.clientY });
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateCursorPosition(e);
      updateDotPosition(e);

      // Check if hovering over clickable elements
      const target = e.target as HTMLElement;
      const isClickable = target.tagName === 'A' || 
                         target.tagName === 'BUTTON' || 
                         target.onclick !== null ||
                         target.classList.contains('cursor-pointer') ||
                         window.getComputedStyle(target).cursor === 'pointer';
      
      setIsPointer(isClickable);
    };

    const handleMouseDown = () => {
      setIsClicking(true);
    };

    const handleMouseUp = () => {
      setIsClicking(false);
    };

    const handleMouseEnter = () => {
      setIsHidden(false);
    };

    const handleMouseLeave = () => {
      setIsHidden(true);
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(dotRafId);
    };
  }, []);

  return (
    <>
      {/* Main cursor ring */}
      <div
        className={`custom-cursor-ring ${isPointer ? 'cursor-hover' : ''} ${isClicking ? 'cursor-click' : ''} ${isHidden ? 'cursor-hidden' : ''}`}
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
        }}
      />

      {/* Center dot */}
      <div
        className={`custom-cursor-dot ${isPointer ? 'cursor-hover' : ''} ${isClicking ? 'cursor-click' : ''} ${isHidden ? 'cursor-hidden' : ''}`}
        style={{
          left: `${cursorDotPosition.x}px`,
          top: `${cursorDotPosition.y}px`,
        }}
      />

      <style>{`
        /* Hide default cursor */
        * {
          cursor: none !important;
        }

        /* Custom cursor ring */
        .custom-cursor-ring {
          position: fixed;
          width: 40px;
          height: 40px;
          border: 2px solid rgba(139, 92, 246, 0.5);
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      height 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      border-color 0.3s ease,
                      opacity 0.3s ease;
          z-index: 9999;
          mix-blend-mode: difference;
          opacity: 1;
        }

        /* Custom cursor dot */
        .custom-cursor-dot {
          position: fixed;
          width: 8px;
          height: 8px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          pointer-events: none;
          transform: translate(-50%, -50%);
          transition: width 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      height 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                      background 0.3s ease,
                      opacity 0.3s ease;
          z-index: 10000;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5),
                      0 0 20px rgba(139, 92, 246, 0.3);
          opacity: 1;
        }

        /* Hover state */
        .custom-cursor-ring.cursor-hover {
          width: 60px;
          height: 60px;
          border-color: rgba(139, 92, 246, 0.8);
          animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }

        .custom-cursor-dot.cursor-hover {
          width: 4px;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.8),
                      0 0 30px rgba(139, 92, 246, 0.5);
        }

        /* Click state */
        .custom-cursor-ring.cursor-click {
          width: 35px;
          height: 35px;
          border-color: rgba(236, 72, 153, 0.9);
          animation: click-effect 0.3s ease;
        }

        .custom-cursor-dot.cursor-click {
          width: 12px;
          height: 12px;
          background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
          box-shadow: 0 0 20px rgba(236, 72, 153, 0.9),
                      0 0 40px rgba(236, 72, 153, 0.6);
        }

        /* Hidden state */
        .custom-cursor-ring.cursor-hidden,
        .custom-cursor-dot.cursor-hidden {
          opacity: 0;
        }

        /* Pulse animation for ring */
        @keyframes pulse-ring {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.1);
            opacity: 0.8;
          }
        }

        /* Click effect */
        @keyframes click-effect {
          0% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(0.9);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
        }

        /* Smooth transition for movement */
        .custom-cursor-ring {
          animation: cursor-ring-move 0.1s linear;
        }

        .custom-cursor-dot {
          animation: cursor-dot-move 0.05s linear;
        }

        @keyframes cursor-ring-move {
          from {
            transform: translate(-50%, -50%);
          }
          to {
            transform: translate(-50%, -50%);
          }
        }

        @keyframes cursor-dot-move {
          from {
            transform: translate(-50%, -50%);
          }
          to {
            transform: translate(-50%, -50%);
          }
        }

        /* Dark mode adjustments */
        .dark .custom-cursor-ring {
          border-color: rgba(167, 139, 250, 0.6);
        }

        .dark .custom-cursor-dot {
          background: linear-gradient(135deg, #a78bfa 0%, #c084fc 100%);
          box-shadow: 0 0 10px rgba(167, 139, 250, 0.6),
                      0 0 20px rgba(167, 139, 250, 0.4);
        }

        .dark .custom-cursor-ring.cursor-hover {
          border-color: rgba(167, 139, 250, 0.9);
        }

        .dark .custom-cursor-dot.cursor-hover {
          box-shadow: 0 0 15px rgba(167, 139, 250, 0.9),
                      0 0 30px rgba(167, 139, 250, 0.6);
        }

        .dark .custom-cursor-ring.cursor-click {
          border-color: rgba(244, 114, 182, 1);
        }

        .dark .custom-cursor-dot.cursor-click {
          background: linear-gradient(135deg, #f472b6 0%, #a78bfa 100%);
          box-shadow: 0 0 20px rgba(244, 114, 182, 1),
                      0 0 40px rgba(244, 114, 182, 0.7);
        }

        /* Mobile - hide custom cursor */
        @media (max-width: 768px) {
          .custom-cursor-ring,
          .custom-cursor-dot {
            display: none;
          }
          
          * {
            cursor: auto !important;
          }
        }

        /* For input fields, show text cursor */
        input, textarea {
          cursor: text !important;
        }

        /* For 3D visualization fullscreen, use normal cursor */
        .fixed.inset-0.z-50,
        .fixed.inset-0.z-50 *,
        canvas,
        div[class*="bg-gray-900"] canvas {
          cursor: auto !important;
        }

        /* Hide custom cursor when fullscreen is active */
        body:has(.fixed.inset-0.z-50) .custom-cursor-ring,
        body:has(.fixed.inset-0.z-50) .custom-cursor-dot {
          display: none !important;
        }
      `}</style>
    </>
  );
}
