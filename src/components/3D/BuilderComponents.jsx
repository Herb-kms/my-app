import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, Text } from '@react-three/drei';

export function BuilderController({ buildMode, selectedBuildItem, onPlaceItem, onDemolishItem }) {
    const { camera, raycaster, scene } = useThree();
    const hologramRef = useRef();
    const [hologramPos, setHologramPos] = useState([0, 0, 0]);
    const [rotationIdx, setRotationIdx] = useState(0);

    // selectedBuildItem이 객체인 경우 ID나 type을 추출, 문자열인 경우 그대로 사용
    const itemType = typeof selectedBuildItem === 'object' ? selectedBuildItem?.id : selectedBuildItem;

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
        if (!buildMode || !itemType) return;

        raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        const floorIntersect = intersects.find(hit => hit.point.y < 1.0);

        if (floorIntersect) {
            const gridSize = 2.5;
            const snapx = Math.round(floorIntersect.point.x / gridSize) * gridSize;
            const snapz = Math.round(floorIntersect.point.z / gridSize) * gridSize;
            let snapy = 0.05;

            if (itemType === "CONVEYOR") {
                snapy = 0.0;
            } else if (["WALL", "SHELF", "CRATE", "BARREL"].includes(itemType)) {
                snapy = 0;
            } else if (itemType.startsWith?.("ITEM_")) {
                snapy = 0.3;
            }

            setHologramPos([snapx, snapy, snapz]);
            if (hologramRef.current) {
                hologramRef.current.position.set(snapx, snapy, snapz);
                hologramRef.current.rotation.y = rotationIdx * (Math.PI / 2);
            }
        }
    });

    const hologramPosRef = useRef([0, 0, 0]);
    const rotationIdxRef = useRef(0);

    useEffect(() => {
        hologramPosRef.current = hologramPos;
        rotationIdxRef.current = rotationIdx;
    }, [hologramPos, rotationIdx]);

    useEffect(() => {
        if (!buildMode || !itemType) return;
        const handleMouseClick = (e) => {
            if (document.pointerLockElement) {
                if (e.button === 0) {
                    onPlaceItem?.({
                        type: itemType,
                        position: hologramPosRef.current,
                        rotation: [0, rotationIdxRef.current * (Math.PI / 2), 0]
                    });
                } else if (e.button === 2 && onDemolishItem) {
                    onDemolishItem([hologramPosRef.current[0], hologramPosRef.current[2]]);
                }
            }
        };
        window.addEventListener('mousedown', handleMouseClick);
        return () => window.removeEventListener('mousedown', handleMouseClick);
    }, [buildMode, itemType, onPlaceItem, onDemolishItem]);

    if (!buildMode || !itemType) return null;

    const isBelt = itemType === 'CONVEYOR';
    const isProp = ['SHELF', 'CRATE', 'BARREL', 'WALL'].includes(itemType);
    const isSpawnItem = itemType.startsWith?.('ITEM_');

    let color = isBelt ? '#00ffcc' : isProp ? '#ffaa00' : isSpawnItem ? '#88ff44' : '#55aaff';
    let size = isBelt ? [1.5, 0.15, 1.5] :
        itemType === 'WALL' ? [2.5, 5, 0.3] :
            itemType === 'SHELF' ? [3, 3, 1] :
                itemType === 'CRATE' ? [1.8, 1.8, 1.8] :
                    itemType === 'BARREL' ? [1.2, 2.2, 1.2] :
                        isSpawnItem ? [0.6, 0.6, 0.6] :
                            [2.5, 2, 3];

    const labelY = isSpawnItem ? 1.2 :
        itemType === 'WALL' ? 5.8 :
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
                {typeof selectedBuildItem === 'object' ? selectedBuildItem.name : itemType}
            </Text>
            <Box args={[0.4, 0.4, 1.2]} position={[0, 0.3, -size[2] / 2 - 0.4]}>
                <meshStandardMaterial color="yellow" emissive="yellow" emissiveIntensity={0.8} />
            </Box>
        </group>
    );
}
