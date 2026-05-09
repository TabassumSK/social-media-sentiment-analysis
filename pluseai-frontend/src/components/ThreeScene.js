import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Float, MeshDistortMaterial, Sphere, 
  OrbitControls, GradientTexture, Stars,
  Text, PresentationControls
} from '@react-three/drei';
import * as THREE from 'three';

const AnimatedSphere = () => {
  const mesh = useRef();
  
  useFrame((state) => {
    const { clock } = state;
    mesh.current.rotation.x = clock.getElapsedTime() * 0.15;
    mesh.current.rotation.y = clock.getElapsedTime() * 0.2;
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.6, 64, 64]} />
      <MeshDistortMaterial
        color="#3b82f6"
        speed={1.5}
        distort={0.45}
        radius={1}
        emissive="#1e40af"
        emissiveIntensity={0.2}
        roughness={0.2}
        metalness={0.8}
      >
        <GradientTexture
          stops={[0, 0.4, 1]}
          colors={['#2563eb', '#9333ea', '#3b82f6']}
        />
      </MeshDistortMaterial>
    </mesh>
  );
};

const ConnectionCloud = () => {
  const count = 40;
  const points = useMemo(() => {
    const p = [];
    for (let i = 0; i < count; i++) {
      p.push({
        position: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 12,
        ],
        speed: Math.random() * 0.4 + 0.1,
        size: Math.random() * 0.05 + 0.02,
      });
    }
    return p;
  }, []);

  return (
    <group>
      {points.map((p, i) => (
        <Float key={i} speed={p.speed * 2} rotationIntensity={1} floatIntensity={1.5}>
          <mesh position={p.position}>
            <sphereGeometry args={[p.size, 16, 16]} />
            <meshStandardMaterial 
              color="#60a5fa" 
              emissive="#3b82f6" 
              emissiveIntensity={2} 
              transparent 
              opacity={0.8}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const Rig = ({ children }) => {
  const group = useRef();
  useFrame((state) => {
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, (state.mouse.x * Math.PI) / 10, 0.05);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, (state.mouse.y * Math.PI) / 15, 0.05);
  });
  return <group ref={group}>{children}</group>;
};

const ThreeScene = () => {
  return (
    <div className="three-scene-wrapper">
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }} dpr={[1, 2]}>
        <color attach="background" args={['#0d0d0f']} />
        <fog attach="fog" args={['#0d0d0f', 5, 15]} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
        <spotLight position={[-10, -10, -10]} intensity={0.5} color="#9333ea" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Rig>
          <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
            <AnimatedSphere />
          </Float>
          <ConnectionCloud />
        </Rig>
        
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  );
};

export default ThreeScene;
