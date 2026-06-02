import React, { useRef, useEffect } from 'react';
import { Box } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { HeldItemMesh } from './ItemComponents';
import { DECORATIVE_BUILDINGS } from './EnvironmentComponents';

function checkCollision(x, z, placedMachines = [], placedProps = []) {
    // 1. 배경 고층 빌딩 및 집 충돌 (Decorative Buildings)
    for (const b of DECORATIVE_BUILDINGS) {
        const buffer = 0.6; // 플레이어 두께 버퍼
        const halfW = b.w / 2 + buffer;
        const halfD = b.d / 2 + buffer;
        if (x >= b.x - halfW && x <= b.x + halfW && z >= b.z - halfD && z <= b.z + halfD) {
            return true;
        }
    }

    // 2. 배치된 기계 및 기본 생산 라인 기계 충돌
    for (const m of placedMachines) {
        const buffer = 0.6;
        let halfW = 1.1 + buffer;
        let halfD = 1.3 + buffer;
        if (m.type === 'SHIPPING_BIN') continue; // 판매 구역은 밟고 지날 수 있음
        if (x >= m.position[0] - halfW && x <= m.position[0] + halfW &&
            z >= m.position[2] - halfD && z <= m.position[2] + halfD) {
            return true;
        }
    }

    // 3. 배치된 가구/장식물 충돌 (Props)
    for (const p of placedProps) {
        const buffer = 0.5;
        let w = 1.5, d = 1.5;
        if (p.type === 'WALL') { w = 2.5; d = 0.3; }
        else if (p.type === 'SHELF') { w = 3.0; d = 1.0; }
        else if (p.type === 'CRATE') { w = 1.8; d = 1.8; }
        else if (p.type === 'BARREL') { w = 1.2; d = 1.2; }

        const angle = p.rotation ? p.rotation[1] : 0;
        const isRotated = Math.abs(Math.sin(angle)) > 0.7;
        const finalW = (isRotated ? d : w) / 2 + buffer;
        const finalD = (isRotated ? w : d) / 2 + buffer;

        if (x >= p.position[0] - finalW && x <= p.position[0] + finalW &&
            z >= p.position[2] - finalD && z <= p.position[2] + finalD) {
            return true;
        }
    }

    // 4. 중앙 기계 구역 정적 공장 벽 충돌 (Factory Building Walls)
    // 뒷벽 (북쪽): z = -12.5, x범위 -12.5 ~ 19.5 (길이 32)
    if (z >= -13.0 && z <= -12.0 && x >= -13.0 && x <= 20.0) return true;

    // 좌측벽 (서쪽): x = -12.5, z범위 -12.5 ~ 9.5 (길이 22)
    if (x >= -13.0 && x <= -12.0 && z >= -13.0 && z <= 10.0) return true;

    // 우측벽 (동쪽): x = 19.5, z범위 -12.5 ~ 9.5 (길이 22)
    if (x >= 19.0 && x <= 20.0 && z >= -13.0 && z <= 10.0) return true;

    // 앞벽 (남쪽): 입구(x: -4 ~ 10)를 제외한 벽면 세그먼트 충돌
    if (z >= 9.0 && z <= 10.0) {
        // 좌측 세그먼트 (x: -12.5 ~ -4)
        if (x >= -13.0 && x <= -4.0) return true;
        // 우측 세그먼트 (x: 10 ~ 19.5)
        if (x >= 10.0 && x <= 20.0) return true;
    }

    return false;
}

// ─── 플레이어 컨트롤러 ────────────────────────────────────────────────────────
// 원본 배그스타일 1인칭/3인칭 카메라 시스템 완전 복원
export function PlayerController({
    playerRef,
    playerPositionRef,
    perspective,
    zoom = 45,
    sensitivity = 1.0,
    buildMode,
    isUIOpen,
    placedMachines = [],
    placedProps = []
}) {
    const [, getKeys] = useKeyboardControls();
    const { camera } = useThree();
    const velocityY = useRef(0);
    const rotation = useRef({ pitch: 0, yaw: 0 });

    // 마우스 회전 처리
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isUIOpen || !document.pointerLockElement) return;
            
            const sense = sensitivity * 0.002;
            rotation.current.yaw -= e.movementX * sense;
            rotation.current.pitch -= e.movementY * sense;
            
            // 상하 각도 제한 (-85도 ~ 85도)
            rotation.current.pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, rotation.current.pitch));
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [isUIOpen, sensitivity]);

    useFrame((state, delta) => {
        if (!playerRef.current) return;

        // ── 카메라 회전 적용 ───────────────────────────
        const euler = new THREE.Euler(rotation.current.pitch, rotation.current.yaw, 0, 'YXZ');
        camera.quaternion.setFromEuler(euler);

        // UI가 열려있으면 이동 로직 중단
        if (isUIOpen) return;

        const { forward, backward, left, right, jump } = getKeys();

        // ── 수평 이동 ──────────────────────────────────
        // 속도를 delta와 sensitivity에 맞춤 (기본 속도 상향)
        const moveSpeed = 10 * delta;
        const direction   = new THREE.Vector3();

        // 카메라 방향 기준 이동 (Y축 무시)
        const cameraDirection = new THREE.Vector3();
        camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0;
        cameraDirection.normalize();

        const cameraSide = new THREE.Vector3().crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0));

        direction.addScaledVector(cameraDirection, Number(forward) - Number(backward));
        direction.addScaledVector(cameraSide, Number(right) - Number(left));
        direction.normalize().multiplyScalar(moveSpeed);

        const nextX = playerRef.current.position.x + direction.x;
        const nextZ = playerRef.current.position.z + direction.z;

        // X축 및 Z축 독립 충돌 검사 (벽면 슬라이딩 효과)
        const canMoveX = !checkCollision(nextX, playerRef.current.position.z, placedMachines, placedProps);
        const canMoveZ = !checkCollision(playerRef.current.position.x, nextZ, placedMachines, placedProps);

        if (canMoveX) {
            playerRef.current.position.x = Math.max(-124, Math.min(124, nextX));
        }
        if (canMoveZ) {
            playerRef.current.position.z = Math.max(-124, Math.min(124, nextZ));
        }

        // ── 중력 & 점프 ───────────────────────────────
        if (jump && playerRef.current.position.y <= 0.05) {
            velocityY.current = 10;
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
            // 1인칭: 눈 높이 (1.7m)
            targetPos.set(px, py + 1.7, pz);
        } else {
            // 3인칭: 어깨 위 (zoom 반영)
            const height = 1.8 + (zoom * 0.015);
            const dist = 4.0 + (zoom * 0.05);
            const side = 0.7; // 우측 어깨

            const offset = new THREE.Vector3(side, height, dist);
            offset.applyQuaternion(camera.quaternion);
            targetPos.set(px + offset.x, py + offset.y, pz + offset.z);
        }

        // 부드러운 추적
        const lerpFactor = perspective === 'first' ? 1.0 : 0.2;
        camera.position.lerp(targetPos, lerpFactor);
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
        <group ref={playerRef} position={[10, 0, 8]}>
            <group ref={modelRef}>
                {/* 몸통 (1인칭일 때는 숨김) */}
                <Box args={[0.6, 1.6, 0.4]} position={[0, 0.8, 0]} castShadow visible={perspective === 'third'}>
                    <meshStandardMaterial
                        color="#4caf50"
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
                    <group position={[0.65, 0.9, -0.3]}>
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
        // X축을 0.45에서 0.65로 늘려 화면 오른쪽으로 조금 더 치우치게 배치
        const offset = new THREE.Vector3(0.65, -0.38, -0.7);
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
