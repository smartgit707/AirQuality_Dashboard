import React, { useRef, useState } from 'react';

export default function TiltCard3D({
  children,
  className = '',
  style = {},
  maxTilt = 14,
  scale = 1.02,
  glare = true,
  onClick
}) {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    translateZ: 0,
    scale: 1
  });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xRatio = (x / rect.width) - 0.5;
    const yRatio = (y / rect.height) - 0.5;

    const rotateX = -yRatio * maxTilt;
    const rotateY = xRatio * maxTilt;

    setTransform({
      rotateX,
      rotateY,
      translateZ: 14,
      scale
    });

    if (glare) {
      setGlarePos({
        x: (x / rect.width) * 100,
        y: (y / rect.height) * 100,
        opacity: 0.18
      });
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTransform({
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      scale: 1
    });
    setGlarePos(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        ...style
      }}
      className={className}
      onClick={onClick}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          width: '100%',
          height: '100%',
          transition: isHovered
            ? 'transform 0.12s cubic-bezier(0.2, 0.8, 0.4, 1)'
            : 'transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transform: `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translateZ(${transform.translateZ}px) scale(${transform.scale})`,
          position: 'relative',
          willChange: 'transform',
          transformStyle: 'preserve-3d'
        }}
      >
        {children}

        {/* Dynamic Holographic Specular Glare */}
        {glare && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              borderRadius: 'inherit',
              background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.28) 0%, rgba(0, 245, 160, 0.08) 45%, transparent 75%)`,
              opacity: glarePos.opacity,
              transition: 'opacity 0.25s ease-out',
              zIndex: 10
            }}
          />
        )}
      </div>
    </div>
  );
}
