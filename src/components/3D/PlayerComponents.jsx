import React, { useRef, useState, useEffect } from 'react';
import { Box } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { HeldItemMesh } from './ItemComponents';

// --- 플레이어 컨트롤러 (이동 로직) ---
export function PlayerController({ playerRef, playerPositionRef, perspective, buildMode }) {
    const { camera } = useThree();
    const velocity = useRef(new THREE.Vector3());
    const direction = useRef(new THREE.Vector3());
    const keys = useRef({});

    useEffect(() => {
        const handleKeyDown = (e) => keys.current[e.code] = true;
        const handleKeyUp = (e) => keys.current[e.code] = false;
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    useFrame((state, delta) => {
        if (buildMode) return;
        
        const speed = keys.current['ShiftLeft'] ? 12 : 6;
        direction.current.set(0, 0, 0);

        if (keys.current['KeyW']) direction.current.z -= 1;
        if (keys.current['KeyS']) direction.current.z += 1;
        if (keys.current['KeyA']) direction.current.x -= 1;
        if (keys.current['KeyD']) direction.current.x += 1;

        direction.current.normalize();

        // 카메라 방향에 맞게 이동 방향 계산
        const camEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
        const moveVector = new THREE.Vector3(direction.current.x, 0, direction.current.z);
        moveVector.applyEuler(new THREE.Euler(0, camEuler.y, 0));

        velocity.current.copy(moveVector).multiplyScalar(speed * delta);

        if (playerRef.current) {
            playerRef.current.position.add(velocity.current);
            
            // 위치 Ref 업데이트 (App.jsx에서 거리 계산용으로 사용)
            if (playerPositionRef) {
                playerPositionRef.current = [
                    playerRef.current.position.x,
                    playerRef.current.position.y,
                    playerRef.current.position.z
                ];
            }

            // 카메라가 플레이어를 따라다니게 함
            if (perspective === 'first') {
                camera.position.copy(playerRef.current.position).add(new THREE.Vector3(0, 1.6, 0));
            } else {
                const orbitOffset = new THREE.Vector3(0, 5, 8);
                orbitOffset.applyEuler(new THREE.Euler(0, camEuler.y, 0));
                camera.position.copy(playerRef.current.position).add(orbitOffset);
                camera.lookAt(playerRef.current.position.clone().add(new THREE.Vector3(0, 1, 0)));
            }
        }
    });

    return null;
}

// --- 플레이어 외형 컴포넌트 ---
export function Player({ playerRef, perspective, selectedItem }) {
    const modelRef = useRef();

    useFrame((state) => {
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
                {perspective === 'third' && (
                    <mesh position={[0, 1.6, 0]}>
                        <sphereGeometry args={[0.2, 16, 16]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>
                )}
                {perspective === 'third' && selectedItem && (
                    <group position={[0.4, 0.8, -0.3]}>
                        <HeldItemMesh item={selectedItem} scale={0.6} />
                    </group>
                )}
            </group>
        </group>
    );
}

// --- 1인칭 손에 든 아이템 ---
export function FirstPersonHeldItem({ item, perspective }) {
    const groupRef = useRef();
    useFrame((state) => {
        if (!groupRef.current || perspective !== 'first') return;
        const camera = state.camera;
        const offset = new THREE.Vector3(0.5, -0.4, -0.8);
        offset.applyQuaternion(camera.quaternion);
        groupRef.current.position.copy(camera.position).add(offset);
        groupRef.current.quaternion.copy(camera.quaternion);
        groupRef.current.rotateX(0.1);
        groupRef.current.rotateY(-0.3);
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
