import React from 'react';
import { Box } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HeldItemMesh } from './ItemComponents';

// 1. 플레이어 컴포넌트
export function Player({ playerRef, perspective, selectedItem }) {
    const modelRef = React.useRef();

    useFrame((state) => {
        // 플레이어 모델이 3인칭일 때 카메라가 바라보는 방향을 향하게 함 (Y축 기준)
        if (modelRef.current && perspective === 'third') {
            const euler = new THREE.Euler().setFromQuaternion(state.camera.quaternion, 'YXZ');
            modelRef.current.rotation.y = euler.y;
        }
    });

    return (
        <group ref={playerRef}>
            <group ref={modelRef}>
                <Box args={[0.5, 1.8, 0.5]} position={[0, 0.9, 0]} castShadow>
                    <meshStandardMaterial
                        color="#4caf50"
                        opacity={perspective === 'first' ? 0 : 1}
                        transparent={perspective === 'first'}
                        metalness={0.8}
                        roughness={0.2}
                    />
                </Box>
                {/* 플레이어 머리 (3인칭에서 필요) */}
                {perspective === 'third' && (
                    <mesh position={[0, 1.6, 0]}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>
                )}
                {/* 오른손에 든 아이템 (3인칭) */}
                {perspective === 'third' && selectedItem && (
                    <group position={[0.4, 0.8, -0.3]}>
                        <HeldItemMesh item={selectedItem} scale={0.6} />
                    </group>
                )}
            </group>
        </group>
    );
}

// 8. 1인칭 화면 고정 아이템 (FirstPersonHeldItem)
export function FirstPersonHeldItem({ item, perspective }) {
    const groupRef = React.useRef();

    useFrame((state) => {
        if (!groupRef.current || perspective !== 'first') return;

        const camera = state.camera;

        // 화면 우측 하단 (오른손 위치)
        const offset = new THREE.Vector3(0.5, -0.4, -0.8);
        offset.applyQuaternion(camera.quaternion);

        groupRef.current.position.copy(camera.position).add(offset);
        groupRef.current.quaternion.copy(camera.quaternion);

        // 살짝 기울이기 (들고 있는 느낌)
        groupRef.current.rotateX(0.1);
        groupRef.current.rotateY(-0.3);
        groupRef.current.rotateZ(-0.1);

        // 숨쉬는 동작
        const time = state.clock.getElapsedTime();
        groupRef.current.translateY(Math.sin(time * 3) * 0.01);
    });

    if (!item || perspective !== 'first') return null;

    return (
        <group ref={groupRef}>
            <HeldItemMesh item={item} scale={0.4} />
        </group>
    );
}
