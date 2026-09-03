import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ShieldCheck } from 'lucide-react';

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = '';

    const width = container.clientWidth || 340;
    const height = container.clientHeight || 256;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 8.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const icoGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const wireGeo = new THREE.WireframeGeometry(icoGeo);
    const wireMat = new THREE.LineBasicMaterial({ color: 0x818cf8, transparent: true, opacity: 0.7, linewidth: 1.5 });
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    coreGroup.add(wireframe);

    const innerGeo = new THREE.OctahedronGeometry(0.9, 2);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5, roughness: 0.25, metalness: 0.85,
      emissive: 0x3730a3, emissiveIntensity: 0.65, transparent: true, opacity: 0.85,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    const ringGeo1 = new THREE.TorusGeometry(2.4, 0.022, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.5 });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.8, 0.018, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.4 });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 3.5;
    ring2.rotation.x = -Math.PI / 4;
    coreGroup.add(ring2);

    const particleCount = 130;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    const indigo = new THREE.Color(0x818cf8);
    const violet = new THREE.Color(0x6366f1);
    const emerald = new THREE.Color(0x34d399);

    for (let i = 0; i < particleCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = Math.cbrt(Math.random()) * 2.6 + 1.2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const choice = Math.random();
      const color = choice < 0.55 ? indigo : choice < 0.85 ? violet : emerald;
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.07, vertexColors: true, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particles);

    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);
    const pLight1 = new THREE.PointLight(0x818cf8, 4, 25);
    pLight1.position.set(4, 3, 5);
    scene.add(pLight1);
    const pLight2 = new THREE.PointLight(0x6366f1, 3.5, 25);
    pLight2.position.set(-4, -3, 4);
    scene.add(pLight2);

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = container.getBoundingClientRect();
      const clientX = 'touches' in e && e.touches[0] ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e && e.touches[0] ? e.touches[0].clientY : (e as MouseEvent).clientY;
      mouseX = ((clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((clientY - rect.top) / rect.height - 0.5) * 2;
    };
    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('touchmove', onPointerMove, { passive: true });

    let animId: number;
    const clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      targetX += (mouseX - targetX) * 0.06;
      targetY += (mouseY - targetY) * 0.06;
      coreGroup.rotation.y = t * 0.22 + targetX * 0.8;
      coreGroup.rotation.x = Math.sin(t * 0.18) * 0.15 + targetY * 0.5;
      innerCore.rotation.y = -t * 0.5;
      innerCore.rotation.z = t * 0.25;
      ring1.rotation.z = t * 0.3;
      ring2.rotation.z = -t * 0.38;
      particles.rotation.y = t * 0.08;
      const s = 1 + Math.sin(t * 2.2) * 0.07;
      innerCore.scale.set(s, s, s);
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        if (w > 0 && h > 0) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('touchmove', onPointerMove);
      renderer.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      icoGeo.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-64 rounded-2xl overflow-hidden bg-[#121212] border border-white/5 shadow-2xl">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded-md bg-[#050505]/90 backdrop-blur-md border border-white/5 flex items-center gap-1.5 pointer-events-none z-10">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        <span className="font-mono text-[10px] text-slate-400 tracking-wider">3D LEGAL INTEGRITY MATRIX</span>
      </div>
      <div className="absolute top-2.5 right-3 px-2 py-0.5 rounded-md bg-[#050505]/90 backdrop-blur-md border border-white/5 flex items-center gap-1 pointer-events-none z-10">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-mono text-[10px] text-emerald-400 tracking-wider font-medium">ZERO-LOG</span>
      </div>
    </div>
  );
};
