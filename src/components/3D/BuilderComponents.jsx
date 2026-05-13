import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, Text } from '@react-three/drei';

export function BuilderController({ buildMode, selectedBuildItem, onPlaceItem, onDemolishItem }) {
    const { camera, raycaster, scene } = useThree();
    const hologramRef = useRef();
    const [hologramPos, setHologramPos] = useState([0, 0, 0]);
    const [rotationIdx, setRotationIdx] = useState(0); // 0: 0, 1: 90, 2: 180, 3: 270

    // 방향 제어 (Q, E키)
    useEffect(() => {
        if (!buildMode) return;
        const handleKeyDown = (e) => {
            if (e.code === 'KeyQ') setRotationIdx(p => (p - 1 + 4) % 4);
            if (e.code === 'KeyE') setRotationIdx(p => (p + 1) % 4);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [buildMode]);

    useFrame(() => {
        if (!buildMode) return;

        // 화면 중심(조준점)에서 바닥으로 Raycast
        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        // 높이(Y)가 일정 미만인 물체(주로 바닥)를 교차점으로 침
        const floorIntersect = intersects.find(hit => hit.point.y < 1.0);

        if (floorIntersect) {
            // 그리드 크기 2.5에 맞게 스냅
            const gridSize = 2.5;
            const snapx = Math.round(floorIntersect.point.x / gridSize) * gridSize;
            const snapz = Math.round(floorIntersect.point.z / gridSize) * gridSize;
            // 바닥 위 높이 - 타입마다 다름
            let snapy = 0.05;
            if (selectedBuildItem === "CONVEYOR") {
                snapy = 0.0;
            } else if (["WALL", "SHELF", "CRATE", "BARREL"].includes(selectedBuildItem)) {
                snapy = 0;
            } else if (selectedBuildItem.startsWith("ITEM_")) {
                snapy = 0.3;
            } else {
                snapy = 0; // 기계: geometry가 이미 Y=0 바닥 기준 절대좌표
            }

            setHologramPos([snapx, snapy, snapz]);
            if (hologramRef.current) {
                hologramRef.current.position.set(snapx, snapy, snapz);
                hologramRef.current.rotation.y = rotationIdx * (Math.PI / 2);
            }
        }
    });

    useEffect(() => {
        if (!buildMode) return;
        const handleMouseClick = (e) => {
            if (document.pointerLockElement) {
                if (e.button === 0) { // Left-click: Build
                    onPlaceItem({
                        type: selectedBuildItem,
                        position: hologramPos,
                        rotation: [0, rotationIdx * (Math.PI / 2), 0]
                    });
                } else if (e.button === 2 && onDemolishItem) { // Right-click: Demolish
                    onDemolishItem([hologramPos[0], hologramPos[2]]);
                }
            }
        };
        window.addEventListener('mousedown', handleMouseClick);
        return () => window.removeEventListener('mousedown', handleMouseClick);
    }, [buildMode, hologramPos, rotationIdx, selectedBuildItem, onPlaceItem, onDemolishItem]);

    if (!buildMode) return null;

    const isBelt = selectedBuildItem === 'CONVEYOR';
    const isMachine = ['SORTING', 'CRUSHING', 'CLEANING', 'DRYING', 'PACKAGING', 'SHIPPING_BIN'].includes(selectedBuildItem);
    const isProp = ['SHELF', 'CRATE', 'BARREL', 'WALL'].includes(selectedBuildItem);
    const isSpawnItem = selectedBuildItem.startsWith('ITEM_');

    let color = isBelt ? '#00ffcc' : isProp ? '#ffaa00' : isSpawnItem ? '#88ff44' : '#55aaff';
    let size = isBelt ? [1.5, 0.15, 1.5] :
        selectedBuildItem === 'WALL' ? [2.5, 5, 0.3] :
            selectedBuildItem === 'SHELF' ? [3, 3, 1] :
                selectedBuildItem === 'CRATE' ? [1.8, 1.8, 1.8] :
                    selectedBuildItem === 'BARREL' ? [1.2, 2.2, 1.2] :
                        isSpawnItem ? [0.6, 0.6, 0.6] :
                            [2.5, 2, 3];

    const labelY = isSpawnItem ? 1.2 :
        selectedBuildItem === 'WALL' ? 5.8 :
            isBelt ? 0.8 : size[1] / 2 + 0.5;

    return (
        <group ref={hologramRef}>
            <Box args={size}>
                <meshStandardMaterial color={color} opacity={0.35} transparent wireframe />
            </Box>
            <Box args={size} castShadow>
                <meshStandardMaterial color={color} opacity={0.12} transparent />
            </Box>
            <Text position={[0, labelY, 0]} fontSize={0.45} outlineWidth={0.04} outlineColor="black" color={color}>
                {selectedBuildItem.startsWith('ITEM_') ? selectedBuildItem.replace('ITEM_', '') : selectedBuildItem}
            </Text>
            {/* 방향 표시 화살표 (향하는 쪽이 Z축 음수방향) */}
            <Box args={[0.4, 0.4, 1.2]} position={[0, 0.3, -size[2] / 2 - 0.4]}>
                <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.8} />
            </Box>
        </group>
    );
}
