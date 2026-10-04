import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Generates an organic stylized 3D respiratory bronchial tree with left and right lung lobes
export default function BreathIQSimulator3D({
  aqi = 100,
  pm25 = 35,
  activityType = 'jogger', // 'resting', 'commuter', 'jogger'
  isN95Active = false,
  height = '540px'
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const lungsGroupRef = useRef(null);
  const reqIdRef = useRef(null);
  const particlesRef = useRef(null);
  const particlePositionsRef = useRef(null);
  const particleVelocitiesRef = useRef(null);
  const n95MeshRef = useRef(null);

  const [isHovered, setIsHovered] = useState(false);

  // Breathing parameters based on activity
  const breathingRates = {
    resting: { speed: 1.2, depth: 0.05, count: 350 },
    commuter: { speed: 2.0, depth: 0.08, count: 650 },
    jogger: { speed: 3.2, depth: 0.12, count: 1200 }
  };
  const activeParam = breathingRates[activityType] || breathingRates.jogger;

  // Color mapping based on PM2.5 / AQI
  const getParticleColor = () => {
    if (aqi <= 50) return new THREE.Color(0x00f5a0);   // Emerald
    if (aqi <= 100) return new THREE.Color(0x34d399);  // Cyan-mint
    if (aqi <= 150) return new THREE.Color(0xfacc15);  // Amber
    if (aqi <= 200) return new THREE.Color(0xfb923c);  // Orange
    return new THREE.Color(0xef4444);                  // Crimson
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const heightPx = container.clientHeight || 540;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
    camera.position.set(0, 0, 10.5);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f5a0, 2.0);
    dirLight1.position.set(5, 8, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight2.position.set(-5, -4, -4);
    scene.add(dirLight2);

    // 4. Lungs Group Container
    const lungsGroup = new THREE.Group();
    lungsGroup.position.set(0, -0.4, 0);
    scene.add(lungsGroup);
    lungsGroupRef.current = lungsGroup;

    // A. Trachea (Windpipe)
    const tracheaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 3.2, 0),
      new THREE.Vector3(0, 1.8, 0.05),
      new THREE.Vector3(0, 1.2, 0)
    ]);
    const tracheaGeo = new THREE.TubeGeometry(tracheaCurve, 20, 0.22, 16, false);
    const airwayMat = new THREE.MeshStandardMaterial({
      color: 0x00f5a0,
      emissive: 0x003d28,
      roughness: 0.3,
      metalness: 0.2,
      transparent: true,
      opacity: 0.85
    });
    const tracheaMesh = new THREE.Mesh(tracheaGeo, airwayMat);
    lungsGroup.add(tracheaMesh);

    // B. Primary Left & Right Bronchi
    const makeBronchus = (start, mid, end, radius) => {
      const curve = new THREE.CatmullRomCurve3([start, mid, end]);
      const geo = new THREE.TubeGeometry(curve, 16, radius, 12, false);
      return new THREE.Mesh(geo, airwayMat);
    };

    // Right primary bronchus
    lungsGroup.add(makeBronchus(
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(0.65, 0.7, 0.1),
      new THREE.Vector3(1.3, 0.2, 0.15),
      0.15
    ));

    // Left primary bronchus
    lungsGroup.add(makeBronchus(
      new THREE.Vector3(0, 1.2, 0),
      new THREE.Vector3(-0.65, 0.7, 0.1),
      new THREE.Vector3(-1.3, 0.2, 0.15),
      0.15
    ));

    // Secondary & Tertiary Bronchioles
    const makeBranch = (start, end, radius) => {
      const curve = new THREE.CatmullRomCurve3([start, end]);
      const geo = new THREE.TubeGeometry(curve, 8, radius, 8, false);
      return new THREE.Mesh(geo, airwayMat);
    };

    lungsGroup.add(makeBranch(new THREE.Vector3(1.3, 0.2, 0.15), new THREE.Vector3(1.8, -0.4, 0.2), 0.09));
    lungsGroup.add(makeBranch(new THREE.Vector3(1.3, 0.2, 0.15), new THREE.Vector3(1.9, 0.7, 0.0), 0.08));
    lungsGroup.add(makeBranch(new THREE.Vector3(1.8, -0.4, 0.2), new THREE.Vector3(2.1, -1.3, 0.1), 0.06));

    lungsGroup.add(makeBranch(new THREE.Vector3(-1.3, 0.2, 0.15), new THREE.Vector3(-1.8, -0.4, 0.2), 0.09));
    lungsGroup.add(makeBranch(new THREE.Vector3(-1.3, 0.2, 0.15), new THREE.Vector3(-1.9, 0.7, 0.0), 0.08));
    lungsGroup.add(makeBranch(new THREE.Vector3(-1.8, -0.4, 0.2), new THREE.Vector3(-2.1, -1.3, 0.1), 0.06));

    // C. Translucent Holographic Lung Lobes (Organic volume)
    const lungMat = new THREE.MeshPhysicalMaterial({
      color: 0x052e22,
      emissive: 0x031c15,
      roughness: 0.2,
      transmission: 0.85,
      thickness: 1.2,
      transparent: true,
      opacity: 0.42,
      wireframe: false
    });

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f5a0,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });

    // Right Lung (3 lobes composite)
    const rightLungGeo = new THREE.SphereGeometry(1.65, 32, 32);
    rightLungGeo.scale(0.85, 1.45, 0.95);
    const rightLung = new THREE.Mesh(rightLungGeo, lungMat);
    rightLung.position.set(1.7, -0.3, 0);
    lungsGroup.add(rightLung);

    const rightLungWire = new THREE.Mesh(rightLungGeo, wireMat);
    rightLungWire.position.copy(rightLung.position);
    lungsGroup.add(rightLungWire);

    // Left Lung (2 lobes with cardiac notch)
    const leftLungGeo = new THREE.SphereGeometry(1.55, 32, 32);
    leftLungGeo.scale(0.8, 1.4, 0.9);
    const leftLung = new THREE.Mesh(leftLungGeo, lungMat);
    leftLung.position.set(-1.7, -0.3, 0);
    lungsGroup.add(leftLung);

    const leftLungWire = new THREE.Mesh(leftLungGeo, wireMat);
    leftLungWire.position.copy(leftLung.position);
    lungsGroup.add(leftLungWire);

    // D. Holographic N95 Mask Filter Barrier
    const maskGeo = new THREE.CylinderGeometry(0.55, 0.45, 0.4, 24, 1, true);
    const maskMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0369a1,
      roughness: 0.1,
      metalness: 0.8,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    const maskMesh = new THREE.Mesh(maskGeo, maskMat);
    maskMesh.position.set(0, 3.1, 0);
    maskMesh.visible = isN95Active;
    lungsGroup.add(maskMesh);
    n95MeshRef.current = maskMesh;

    // 5. Inhalation PM2.5 Micro-Particle Stream
    const maxParticles = 1400;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(maxParticles * 3);
    const pVels = new Float32Array(maxParticles * 3);

    const particleColor = getParticleColor();

    for (let i = 0; i < maxParticles; i++) {
      // Spawn around top entrance
      pPos[i * 3] = (Math.random() - 0.5) * 0.4;
      pPos[i * 3 + 1] = 3.3 + Math.random() * 2.0;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      pVels[i * 3] = 0;
      pVels[i * 3 + 1] = -(0.03 + Math.random() * 0.05);
      pVels[i * 3 + 2] = 0;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: particleColor,
      size: 0.11,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    lungsGroup.add(particles);
    particlesRef.current = particles;
    particlePositionsRef.current = pPos;
    particleVelocitiesRef.current = pVels;

    // 6. Interactive Drag Orbit
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let targetRotY = 0;
    let targetRotX = 0;

    const onMouseDown = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      prevMouse = { x: clientX, y: clientY };
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const dx = clientX - prevMouse.x;
      const dy = clientY - prevMouse.y;

      targetRotY += dx * 0.008;
      targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX + dy * 0.008));

      prevMouse = { x: clientX, y: clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    dom.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('touchstart', onMouseDown, { passive: true });
    dom.addEventListener('touchmove', onMouseMove, { passive: true });
    window.addEventListener('touchend', onMouseUp);

    // 7. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Rotation
      if (lungsGroupRef.current) {
        lungsGroupRef.current.rotation.y += (targetRotY - lungsGroupRef.current.rotation.y) * 0.08;
        lungsGroupRef.current.rotation.x += (targetRotX - lungsGroupRef.current.rotation.x) * 0.08;

        // Rhythmic Breathing Expansion (Sinusoidal tidal volume)
        const breathCycle = Math.sin(elapsedTime * activeParam.speed);
        const breathScale = 1 + breathCycle * activeParam.depth;
        rightLung.scale.set(0.85 * breathScale, 1.45 * breathScale, 0.95 * breathScale);
        rightLungWire.scale.set(0.85 * breathScale, 1.45 * breathScale, 0.95 * breathScale);

        leftLung.scale.set(0.8 * breathScale, 1.4 * breathScale, 0.9 * breathScale);
        leftLungWire.scale.set(0.8 * breathScale, 1.4 * breathScale, 0.9 * breathScale);
      }

      // N95 Barrier Visibility & Pulse
      if (n95MeshRef.current) {
        n95MeshRef.current.visible = isN95Active;
        if (isN95Active) {
          n95MeshRef.current.rotation.y += 0.02;
        }
      }

      // Particle Inhalation Simulation
      if (particlePositionsRef.current) {
        const positions = particlePositionsRef.current;
        const count = activeParam.count;

        for (let i = 0; i < count; i++) {
          const idx = i * 3;

          // If N95 is active, 95% of particles bounce off the mask barrier at y = 3.1
          if (isN95Active && positions[idx + 1] < 3.2 && positions[idx + 1] > 3.0) {
            // Deflect outward & upward
            positions[idx] += (Math.random() - 0.5) * 0.08;
            positions[idx + 1] += 0.04; // bounce back
            positions[idx + 2] += (Math.random() - 0.5) * 0.08;
            if (positions[idx + 1] > 4.5) {
              positions[idx + 1] = 3.3 + Math.random() * 1.5;
            }
            continue;
          }

          // Normal downward airflow through trachea
          if (positions[idx + 1] > 1.2) {
            positions[idx + 1] -= 0.04 * activeParam.speed;
            // Funnel into trachea center
            positions[idx] *= 0.97;
            positions[idx + 2] *= 0.97;
          } else {
            // Branch into left or right lung alveolar clouds
            const isRightSide = i % 2 === 0;
            const targetX = isRightSide ? 1.7 : -1.7;
            const targetY = -0.3;

            positions[idx] += (targetX - positions[idx]) * 0.025;
            positions[idx + 1] += (targetY - positions[idx + 1]) * 0.025;
            positions[idx + 2] += (Math.random() - 0.5) * 0.02;

            // Once deep in the alveolar lobe, reset or stick
            if (Math.abs(positions[idx] - targetX) < 0.6 && Math.abs(positions[idx + 1] - targetY) < 0.8) {
              if (Math.random() < 0.03) {
                // Respawn particle at top
                positions[idx] = (Math.random() - 0.5) * 0.35;
                positions[idx + 1] = 3.4 + Math.random() * 1.5;
                positions[idx + 2] = (Math.random() - 0.5) * 0.35;
              }
            }
          }

          // Safety reset boundary
          if (positions[idx + 1] < -2.2) {
            positions[idx] = (Math.random() - 0.5) * 0.35;
            positions[idx + 1] = 3.4 + Math.random() * 1.5;
            positions[idx + 2] = (Math.random() - 0.5) * 0.35;
          }
        }

        pGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    reqIdRef.current = requestAnimationFrame(animate);

    // 8. Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        const newHeight = entry.contentRect.height;
        if (newWidth && newHeight && cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = newWidth / newHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(newWidth, newHeight);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('touchstart', onMouseDown);
      dom.removeEventListener('touchmove', onMouseMove);
      window.removeEventListener('touchend', onMouseUp);

      tracheaGeo.dispose();
      rightLungGeo.dispose();
      leftLungGeo.dispose();
      maskGeo.dispose();
      pGeo.dispose();
      airwayMat.dispose();
      lungMat.dispose();
      wireMat.dispose();
      maskMat.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, [aqi, pm25, activityType, isN95Active]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, #05231c 0%, #031410 65%, #010605 100%)',
        border: '1px solid rgba(0, 245, 160, 0.3)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7), inset 0 0 70px rgba(0, 245, 160, 0.08)',
        cursor: 'grab'
      }}
    >
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Status Badge in Top Left */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(5, 26, 20, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 245, 160, 0.3)',
          borderRadius: '12px',
          padding: '8px 14px',
          fontSize: '0.75rem',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isN95Active ? '#38bdf8' : (aqi <= 100 ? '#00f5a0' : '#ef4444'),
          boxShadow: `0 0 8px ${isN95Active ? '#38bdf8' : (aqi <= 100 ? '#00f5a0' : '#ef4444')}`
        }} />
        <span>
          {isN95Active 
            ? 'N95 Barrier Active • 95% Filtration Efficiency' 
            : `Unfiltered Pulmonary Inhalation (${activityType.toUpperCase()})`}
        </span>
      </div>

      {/* Hint in bottom right */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '20px',
          fontSize: '0.72rem',
          color: '#64748b'
        }}
      >
        Drag to orbit 3D bronchial tree • Respiratory rate: {activeParam.speed * 12} bpm
      </div>
    </div>
  );
}
