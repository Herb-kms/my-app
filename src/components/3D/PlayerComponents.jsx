import React, { useRef } from 'react';
import { Box } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { HeldItemMesh } from './ItemComponents';

// ─── 플레이어 컨트롤러 ────────────────────────────────────────────────────────
// 원본 배그스타일 1인칭/3인칭 카메라 시스템 완전 복원
export function PlayerController({
    playerRef,
    playerPositionRef,
    perspective,
    zoom = 45,
    sensitivity = 1.0,
    buildMode,
    isUIOpen
}) {
    const [, getKeys] = useKeyboardControls();
    const velocityY = useRef(0);

    useFrame((state, delta) => {
        // UI가 열려있거나 빌드 모드면 이동 불가
        if (isUIOpen) return;
        if (!playerRef.current) return;

        const { forward, backward, left, right, jump } = getKeys();

        // ── 수평 이동 ──────────────────────────────────
        const speed = 7 * delta * Math.max(sensitivity, 0.1);
        const frontVector = new THREE.Vector3(0, 0, Number(backward) - Number(forward));
        const sideVector  = new THREE.Vector3(Number(left) - Number(right), 0, 0);
        const direction   = new THREE.Vector3();

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(speed)
            .applyQuaternion(state.camera.quaternion);

        playerRef.current.position.x += direction.x;
        playerRef.current.position.z += direction.z;

        // ── 중력 & 점프 ───────────────────────────────
        if (jump && playerRef.current.position.y <= 0.05) {
            velocityY.current = 9;
        }
        velocityY.current -= 28 * delta;
        playerRef.current.position.y += velocityY.current * delta;

        if (playerRef.current.position.y < 0) {
            playerRef.current.position.y = 0;
            velocityY.current = 0;
        }

        // ── playerPositionRef 업데이트 (상호작용 거리 계산용) ──
        if (playerPositionRef) {
            playerPositionRef.current = [
                playerRef.current.position.x,
                playerRef.current.position.y,
                playerRef.current.position.z,
            ];
        }

        // ── 카메라 목표 위치 계산 ──────────────────────
        const targetPos = new THREE.Vector3();
        const px = playerRef.current.position.x;
        const py = playerRef.current.position.y;
        const pz = playerRef.current.position.z;

        if (perspective === 'first') {
            // 1인칭: 눈 높이에 딱 붙이기
            targetPos.set(px, py + 1.8, pz);
        } else {
            // 3인칭 배그스타일: 오른쪽 어깨 위에서 내려다보기
            const heightOffset  = 1.8 + (zoom * 0.018);
            const depthOffset   = 3.5 + (zoom * 0.045);
            const shoulderOffset = 0.6; // 오른쪽 어깨

            const offset = new THREE.Vector3(shoulderOffset, heightOffset, depthOffset);
            offset.applyQuaternion(state.camera.quaternion);
            targetPos.set(px + offset.x, py + offset.y, pz + offset.z);
        }

        // ── 부드러운 카메라 이동 (lerp) ──────────────
        const lerpFactor = perspective === 'first' ? 0.5 : 0.15;
        state.camera.position.lerp(targetPos, lerpFactor);

        // 1인칭: 너무 가까우면 스냅
        if (perspective === 'first' && state.camera.position.distanceTo(targetPos) < 0.01) {
            state.camera.position.copy(targetPos);
        }
    });

    return null;
}

// ─── 플레이어 외형 ─────────────────────────────────────────────────────────
export function Player({ playerRef, perspective, selectedItem }) {
    const modelRef = useRef();

    useFrame((state) => {
        // 3인칭일 때 카메라 방향에 맞게 플레이어 몸 회전
        if (modelRef.current && perspective === 'third') {
            const euler = new THREE.Euler().setFromQuaternion(state.camera.quaternion, 'YXZ');
            modelRef.current.rotation.y = euler.y;
        }
    });

    return (
        <group ref={playerRef} position={[12, 0, 12]}>
            <group ref={modelRef}>
                {/* 몸통 */}
                <Box args={[0.6, 1.6, 0.4]} position={[0, 0.8, 0]} castShadow>
                    <meshStandardMaterial
                        color="#4caf50"
                        opacity={perspective === 'first' ? 0 : 1}
                        transparent={perspective === 'first'}
                        metalness={0.6}
                        roughness={0.4}
                    />
                </Box>
                {/* 머리 */}
                {perspective === 'third' && (
                    <mesh position={[0, 1.75, 0]}>
                        <sphereGeometry args={[0.22, 16, 16]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>
                )}
                {/* 다리 */}
                {perspective === 'third' && (
                    <>
                        <Box args={[0.25, 0.7, 0.3]} position={[-0.17, 0.35, 0]} castShadow>
                            <meshStandardMaterial color="#1a1a2e" />
                        </Box>
                        <Box args={[0.25, 0.7, 0.3]} position={[0.17, 0.35, 0]} castShadow>
                            <meshStandardMaterial color="#1a1a2e" />
                        </Box>
                    </>
                )}
                {/* 손에 든 아이템 (3인칭) */}
                {perspective === 'third' && selectedItem && (
                    <group position={[0.45, 0.9, -0.3]}>
                        <HeldItemMesh item={selectedItem} scale={0.55} />
                    </group>
                )}
            </group>
        </group>
    );
}

// ─── 1인칭 손에 든 아이템 ────────────────────────────────────────────────────
export function FirstPersonHeldItem({ item, perspective }) {
    const groupRef = useRef();

    useFrame((state) => {
        if (!groupRef.current || perspective !== 'first') return;
        const camera = state.camera;
        const offset = new THREE.Vector3(0.45, -0.38, -0.7);
        offset.applyQuaternion(camera.quaternion);
        groupRef.current.position.copy(camera.position).add(offset);
        groupRef.current.quaternion.copy(camera.quaternion);
        groupRef.current.rotateX(0.12);
        groupRef.current.rotateY(-0.25);
        // 걷기 흔들림
        const time = state.clock.getElapsedTime();
        groupRef.current.translateY(Math.sin(time * 4) * 0.008);
    });

    if (!item || perspective !== 'first') return null;

    return (
        <group ref={groupRef}>
            <HeldItemMesh item={item} scale={0.45} />
        </group>
    );
}
