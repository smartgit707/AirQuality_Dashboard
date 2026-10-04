import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { mockCityData } from '../data/mockData';

// Accurate coordinates for our 5 metropolitan hubs
const CITY_COORDINATES = {
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Bengaluru': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 }
};

// Convert Lat/Lng to Vector3 on a sphere of given radius
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

// Generate color based on AQI
function getAqiColor(aqi) {
  if (aqi <= 50) return '#00f5a0';      // Good - Vibrant Emerald
  if (aqi <= 100) return '#34d399';     // Moderate - Cyan-Mint
  if (aqi <= 150) return '#facc15';     // Sensitive - Amber Yellow
  if (aqi <= 200) return '#fb923c';     // Unhealthy - Bright Orange
  if (aqi <= 300) return '#f87171';     // Very Unhealthy - Rose Red
  return '#c084fc';                     // Hazardous - Violet
}

// Generate an ultra-clean procedural holographic Earth canvas texture
function createProceduralEarthTexture() {
  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. Deep Space Deep Ocean Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#040d12');
  grad.addColorStop(0.5, '#051817');
  grad.addColorStop(1, '#020b0f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // 2. Latitude & Longitude Coordinate Grid Lines
  ctx.strokeStyle = 'rgba(0, 245, 160, 0.08)';
  ctx.lineWidth = 1;
  for (let lat = -80; lat <= 80; lat += 20) {
    const y = ((90 - lat) / 180) * height;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  for (let lng = -180; lng <= 180; lng += 30) {
    const x = ((lng + 180) / 360) * width;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Equator emphasis
  ctx.strokeStyle = 'rgba(0, 245, 160, 0.22)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, height / 2);
  ctx.lineTo(width, height / 2);
  ctx.stroke();

  // 3. Procedural Landmass Outlines (India, Asia, Europe, Africa, Americas)
  ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
  ctx.strokeStyle = 'rgba(0, 245, 160, 0.7)';
  ctx.lineWidth = 1.5;

  // Helper to project lon/lat polygon to canvas
  function drawPolygon(pts) {
    ctx.beginPath();
    pts.forEach(([lon, lat], i) => {
      const x = ((lon + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // India Subcontinent (High detail anchor)
  drawPolygon([
    [68, 24], [72, 31], [74, 35], [77, 36], [80, 31], [88, 27], [89, 22],
    [85, 19], [80, 13], [78, 8], [76, 10], [73, 16], [70, 21], [68, 24]
  ]);

  // Eurasia (Broad continent shape)
  drawPolygon([
    [-10, 36], [0, 48], [15, 55], [30, 70], [60, 72], [100, 75], [140, 70], [170, 65],
    [140, 45], [120, 30], [105, 20], [100, 5], [90, 15], [75, 25], [60, 25],
    [50, 30], [40, 30], [35, 36], [25, 37], [10, 37], [-5, 36]
  ]);

  // Africa
  drawPolygon([
    [-17, 15], [-5, 36], [10, 37], [32, 31], [43, 12], [51, 11], [40, -5],
    [32, -28], [20, -34], [18, -34], [12, -15], [9, 4], [-17, 15]
  ]);

  // North America
  drawPolygon([
    [-168, 65], [-140, 70], [-100, 75], [-60, 70], [-55, 50], [-70, 42],
    [-80, 25], [-95, 18], [-105, 20], [-120, 35], [-125, 48], [-160, 55]
  ]);

  // South America
  drawPolygon([
    [-80, 8], [-60, 10], [-35, -5], [-40, -22], [-50, -35], [-65, -55],
    [-75, -45], [-70, -20], [-80, -5], [-80, 8]
  ]);

  // Australia
  drawPolygon([
    [114, -22], [125, -15], [135, -12], [148, -20], [152, -32], [148, -38],
    [135, -35], [118, -35], [113, -25]
  ]);

  // Dot matrix texture overlay across continents for digital twin vibe
  ctx.fillStyle = 'rgba(0, 245, 160, 0.45)';
  for (let x = 0; x < width; x += 12) {
    for (let y = 0; y < height; y += 12) {
      if (ctx.isPointInPath) {
        ctx.fillRect(x, y, 1.2, 1.2);
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

export default function EarthGlobe3D({
  selectedCity = 'Hyderabad',
  onSelectCity,
  showWindParticles = true,
  autoRotate = true,
  height = '600px'
}) {
  const mountRef = useRef(null);
  const [activeCityInfo, setActiveCityInfo] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  // References for scene, camera, renderer, animation frame
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeGroupRef = useRef(null);
  const beaconsMapRef = useRef(new Map());
  const reqIdRef = useRef(null);
  const targetRotationRef = useRef({ x: 0.35, y: -1.35 });
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const pulseRingsRef = useRef([]);

  // Compute camera focus target for a city
  const rotateToCity = useCallback((cityName) => {
    const coords = CITY_COORDINATES[cityName];
    if (!coords || !globeGroupRef.current) return;

    // Target y rotation faces city longitude towards camera
    const targetY = -((coords.lng + 90) * (Math.PI / 180));
    const targetX = (coords.lat - 10) * (Math.PI / 180);

    targetRotationRef.current = { x: targetX, y: targetY };

    const data = mockCityData[cityName] || mockCityData['Hyderabad'];
    setActiveCityInfo({
      city: cityName,
      ...coords,
      ...data
    });
  }, []);

  // Sync selectedCity prop change
  useEffect(() => {
    if (selectedCity) {
      rotateToCity(selectedCity);
    }
  }, [selectedCity, rotateToCity]);

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const heightPx = container.clientHeight || 600;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / heightPx, 0.1, 1000);
    camera.position.set(0, 1.2, 13);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00f5a0, 2.2);
    dirLight1.position.set(10, 8, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 1.4);
    dirLight2.position.set(-10, -5, -8);
    scene.add(dirLight2);

    // 5. Starfield Background Particle Nebula
    const starCount = 600;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 80;
      starPos[i + 1] = (Math.random() - 0.5) * 80;
      starPos[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.15,
      transparent: true,
      opacity: 0.45
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 6. Main Globe Container
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    const globeRadius = 4.2;

    // A. Holographic Earth Sphere
    const earthTexture = createProceduralEarthTexture();
    const earthGeo = new THREE.SphereGeometry(globeRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.55,
      metalness: 0.35,
      emissive: new THREE.Color(0x00261c),
      emissiveIntensity: 0.85
    });
    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    globeGroup.add(earthMesh);

    // B. Inner Grid Wireframe Cage
    const wireGeo = new THREE.SphereGeometry(globeRadius + 0.02, 36, 18);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f5a0,
      wireframe: true,
      transparent: true,
      opacity: 0.07
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    globeGroup.add(wireMesh);

    // C. Atmospheric Glow Halo (Custom Outer Glow Shell)
    const glowGeo = new THREE.SphereGeometry(globeRadius * 1.15, 48, 48);
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.68 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.8);
          gl_FragColor = vec4(0.0, 0.96, 0.63, 1.0) * intensity * 0.75;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glowMesh);

    // 7. Atmospheric Wind Flow Swarm (Particles orbiting in latitude bands)
    const windCount = 900;
    const windGeo = new THREE.BufferGeometry();
    const windPos = new Float32Array(windCount * 3);
    const windSpeeds = new Float32Array(windCount);

    for (let i = 0; i < windCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 0.85;
      const r = globeRadius + 0.08 + Math.random() * 0.28;

      windPos[i * 3] = r * Math.cos(phi) * Math.cos(theta);
      windPos[i * 3 + 1] = r * Math.sin(phi);
      windPos[i * 3 + 2] = r * Math.cos(phi) * Math.sin(theta);
      windSpeeds[i] = 0.002 + Math.random() * 0.004;
    }
    windGeo.setAttribute('position', new THREE.BufferAttribute(windPos, 3));
    const windMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const windPoints = new THREE.Points(windGeo, windMat);
    globeGroup.add(windPoints);

    // 8. Metropolitan Hub Sensor Beacons
    beaconsMapRef.current.clear();
    pulseRingsRef.current = [];

    Object.entries(CITY_COORDINATES).forEach(([cityName, coords]) => {
      const cityData = mockCityData[cityName] || { aqi: 75 };
      const aqiHex = getAqiColor(cityData.aqi);
      const color = new THREE.Color(aqiHex);

      const pos = latLngToVector3(coords.lat, coords.lng, globeRadius);

      const beaconGroup = new THREE.Group();
      beaconGroup.position.copy(pos);
      beaconGroup.lookAt(new THREE.Vector3(0, 0, 0));

      // 1. Center Core Sphere
      const pinGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      beaconGroup.add(pinMesh);

      // 2. Vertical Atmospheric Laser Light Pillar
      const beamHeight = 0.9;
      const beamGeo = new THREE.CylinderGeometry(0.018, 0.045, beamHeight, 8);
      beamGeo.rotateX(Math.PI / 2);
      beamGeo.translate(0, 0, -beamHeight / 2);
      const beamMat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });
      const beamMesh = new THREE.Mesh(beamGeo, beamMat);
      beaconGroup.add(beamMesh);

      // 3. Concentric Expanding Ripple Ring
      const ringGeo = new THREE.RingGeometry(0.14, 0.22, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      beaconGroup.add(ringMesh);

      pulseRingsRef.current.push({
        mesh: ringMesh,
        scale: 1,
        opacity: 0.85
      });

      // Interactive Click Target (Invisible enlarged sphere)
      const hitGeo = new THREE.SphereGeometry(0.35, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { cityName };
      beaconGroup.add(hitMesh);

      globeGroup.add(beaconGroup);
      beaconsMapRef.current.set(cityName, beaconGroup);
    });

    // Raycaster for click / hover detection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const getPointerCoords = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * 2 - 1,
        y: -((clientY - rect.top) / rect.height) * 2 + 1
      };
    };

    // Interaction Events
    const handleMouseDown = (e) => {
      isDraggingRef.current = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      prevMousePosRef.current = { x: clientX, y: clientY };
    };

    const handleMouseMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (isDraggingRef.current) {
        const deltaX = clientX - prevMousePosRef.current.x;
        const deltaY = clientY - prevMousePosRef.current.y;

        targetRotationRef.current.y += deltaX * 0.005;
        targetRotationRef.current.x = Math.max(-1.1, Math.min(1.1, targetRotationRef.current.x + deltaY * 0.005));

        prevMousePosRef.current = { x: clientX, y: clientY };
      }

      // Check hover
      const pointer = getPointerCoords(e);
      mouse.x = pointer.x;
      mouse.y = pointer.y;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(globeGroup.children, true);
      const foundCity = hits.find(h => h.object.userData && h.object.userData.cityName);
      setIsHovered(Boolean(foundCity));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleClick = (e) => {
      const pointer = getPointerCoords(e);
      mouse.x = pointer.x;
      mouse.y = pointer.y;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(globeGroup.children, true);
      const foundHit = hits.find(h => h.object.userData && h.object.userData.cityName);

      if (foundHit) {
        const clickedName = foundHit.object.userData.cityName;
        rotateToCity(clickedName);
        if (onSelectCity) onSelectCity(clickedName);
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', handleMouseDown);
    domEl.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domEl.addEventListener('click', handleClick);

    // Touch support for mobile
    domEl.addEventListener('touchstart', handleMouseDown, { passive: true });
    domEl.addEventListener('touchmove', handleMouseMove, { passive: true });
    window.addEventListener('touchend', handleMouseUp);

    // Initial default focus
    rotateToCity(selectedCity || 'Hyderabad');

    // 9. Animation Loop
    let lastTime = performance.now();

    const animate = (time) => {
      reqIdRef.current = requestAnimationFrame(animate);

      const delta = (time - lastTime) * 0.001;
      lastTime = time;

      // Smooth dampening towards target rotation
      if (globeGroupRef.current) {
        if (autoRotate && !isDraggingRef.current) {
          targetRotationRef.current.y += 0.0012;
        }

        globeGroupRef.current.rotation.y += (targetRotationRef.current.y - globeGroupRef.current.rotation.y) * 0.06;
        globeGroupRef.current.rotation.x += (targetRotationRef.current.x - globeGroupRef.current.rotation.x) * 0.06;
      }

      // Animate Beacon Radar Pulse Rings
      pulseRingsRef.current.forEach(item => {
        item.scale += delta * 1.25;
        item.opacity = Math.max(0, 0.9 - (item.scale - 1) * 0.65);
        if (item.scale > 2.4) {
          item.scale = 1;
          item.opacity = 0.9;
        }
        item.mesh.scale.set(item.scale, item.scale, 1);
        item.mesh.material.opacity = item.opacity;
      });

      // Animate Wind Particles Streamlines
      if (showWindParticles && windPoints) {
        const positions = windGeo.attributes.position.array;
        for (let i = 0; i < windCount; i++) {
          const idx = i * 3;
          const x = positions[idx];
          const z = positions[idx + 2];
          const angle = windSpeeds[i];

          positions[idx] = x * Math.cos(angle) - z * Math.sin(angle);
          positions[idx + 2] = x * Math.sin(angle) + z * Math.cos(angle);
        }
        windGeo.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    reqIdRef.current = requestAnimationFrame(animate);

    // 10. Resize Observer
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

    // Clean up
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      resizeObserver.disconnect();
      domEl.removeEventListener('mousedown', handleMouseDown);
      domEl.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domEl.removeEventListener('click', handleClick);
      domEl.removeEventListener('touchstart', handleMouseDown);
      domEl.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);

      earthGeo.dispose();
      earthMat.dispose();
      earthTexture.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      windGeo.dispose();
      windMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
    };
  }, [rotateToCity, onSelectCity, autoRotate, showWindParticles]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: height,
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at center, #051a14 0%, #030d0a 65%, #010605 100%)',
        border: '1px solid rgba(0, 245, 160, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), inset 0 0 80px rgba(0, 245, 160, 0.08)',
        cursor: isHovered ? 'pointer' : 'grab'
      }}
    >
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Holographic Telemetry HUD Overlay */}
      {activeCityInfo && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '24px',
            maxWidth: '340px',
            background: 'rgba(5, 26, 20, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 245, 160, 0.45)',
            borderRadius: '16px',
            padding: '16px 20px',
            color: '#f8fafc',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 245, 160, 0.2)',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8' }}>
                Active Sensor Node
              </span>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#00f5a0' }}>
                {activeCityInfo.city}
              </h3>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                background: 'rgba(0, 245, 160, 0.12)',
                padding: '6px 10px',
                borderRadius: '8px',
                border: `1px solid ${getAqiColor(activeCityInfo.aqi)}`
              }}
            >
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>AQI</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: getAqiColor(activeCityInfo.aqi) }}>
                {activeCityInfo.aqi}
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>PM2.5</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                {activeCityInfo.pm25 || 32} <span style={{ fontSize: '0.65rem' }}>µg</span>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>TEMP</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                {activeCityInfo.temperature || 28}°C
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>HUMIDITY</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                {activeCityInfo.humidity || 62}%
              </div>
            </div>
          </div>

          <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
            <span>Lat: {activeCityInfo.lat?.toFixed(2)}°N</span>
            <span>Lng: {activeCityInfo.lng?.toFixed(2)}°E</span>
          </div>
        </div>
      )}

      {/* Control Hint in Top Left */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(5, 26, 20, 0.65)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(0, 245, 160, 0.25)',
          borderRadius: '12px',
          padding: '8px 14px',
          fontSize: '0.75rem',
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00f5a0', boxShadow: '0 0 8px #00f5a0' }} />
        <span>Drag to rotate • Click any city beacon to lock target</span>
      </div>
    </div>
  );
}
