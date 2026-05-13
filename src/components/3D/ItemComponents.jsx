import React from 'react';
import { Box, Float, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// 아이템 시각화 공통 모듈 (들고 있는 아이템용)
export function HeldItemMesh({ item, scale = 0.5 }) {
    const geometryType = item?.type || "";
    const color = item?.color || "#ffffff";
    const metalness = geometryType === "Can" ? 0.9 : 0.4;
    const isProduct = item?.isProduct;

    if (isProduct) {
        return (
            <mesh scale={scale} castShadow>
                <boxGeometry args={[0.6, 0.4, 0.6]} />
                <meshStandardMaterial
                    color="#00ffcc"
                    emissive="#00ffcc"
                    emissiveIntensity={0.6}
                    metalness={0.9}
                    roughness={0.1}
                />
            </mesh>
        );
    }
    
    // Build Item Fallback (no type but has category)
    if (item?.category) {
        return (
            <mesh scale={scale} castShadow>
                <boxGeometry args={[0.4, 0.4, 0.4]} />
                <meshStandardMaterial
                    color="#aaa"
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>
        );
    }

    return (
        <mesh scale={scale} castShadow>
            {geometryType === "Can" ? (
                <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
            ) : geometryType === "Plastic" ? (
                <boxGeometry args={[0.3, 0.4, 0.3]} />
            ) : geometryType === "Crushed" ? (
                <boxGeometry args={[0.4, 0.1, 0.4]} />
            ) : (
                <sphereGeometry args={[0.25, 16, 16]} />
            )}
            <meshStandardMaterial
                color={color}
                roughness={0.2}
                metalness={metalness}
            />
        </mesh>
    );
}

// 4. 쓰레기 아이템 (TrashItem) - 단계별 시각적 변환 로직 포함
export function TrashItem({ item, currentStageIdx = -1, isHandFull, hidden }) {
    const [isNear, setIsNear] = React.useState(false);

    useFrame((state) => {
        if (!item.position || hidden) return;
        const dist = Math.sqrt(
            Math.pow(state.camera.position.x - item.position[0], 2) +
            Math.pow(state.camera.position.z - item.position[2], 2)
        );
        if (dist < 4.0 !== isNear) {
            setIsNear(dist < 4.0);
        }
    });

    // 단계별 변환 속성 계산
    let scale = 1;
    let color = item.color;
    let roughness = 0.2;
    let metalness = item.type === "Can" ? 0.9 : 0.4;
    let emissiveIntensity = isNear ? 0.5 : 0;
    let targetEmissive = isNear ? color : "black";
    let geometryType = item.type;

    // 1단계: Sorting (준비)
    if (currentStageIdx === 0) {
        targetEmissive = "#ffffff";
        emissiveIntensity = 0.8;
    }
    // 2단계: Crushing (형태 파괴)
    if (currentStageIdx >= 1) {
        scale = 0.6;
        geometryType = "Crushed"; // 납작해진 형태
    }
    // 3단계: Cleaning (강렬한 세척 광택)
    if (currentStageIdx >= 2) {
        roughness = 0.01;
        metalness = 1.0;
        if (currentStageIdx === 2) {
            targetEmissive = "#00ffcc";
            emissiveIntensity = 2.0;
        }
    }
    // 4단계: Drying (질감 변화)
    if (currentStageIdx >= 3) {
        roughness = 1.0;
        targetEmissive = "orange";
        emissiveIntensity = currentStageIdx === 3 ? 1.0 : 0;
    }
    // 5단계: Packaging (포장)
    const isPacked = currentStageIdx >= 4;

    if (hidden) return null;

    if (item.isProduct) {
        return (
            <group position={item.position}>
                <Float speed={2.5} rotationIntensity={0.8} floatIntensity={0.6}>
                    <Box args={[0.6, 0.4, 0.6]} castShadow>
                        <meshStandardMaterial
                            color="#00ffcc"
                            emissive="#00ffcc"
                            emissiveIntensity={0.6}
                            metalness={0.9}
                            roughness={0.1}
                        />
                    </Box>
                </Float>
                {isNear && (
                    <Text position={[0, 1.2, 0]} fontSize={0.3} color="white" fontWeight="bold">
                        [F] COLLECT PRODUCT
                    </Text>
                )}
            </group>
        );
    }

    return (
        <group position={item.position} scale={scale}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh castShadow>
                    {geometryType === "Can" ? (
                        <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
                    ) : geometryType === "Plastic" ? (
                        <boxGeometry args={[0.3, 0.4, 0.3]} />
                    ) : geometryType === "Crushed" ? (
                        <boxGeometry args={[0.4, 0.1, 0.4]} /> // 납작하게 으깨진 형태
                    ) : (
                        <sphereGeometry args={[0.25, 16, 16]} />
                    )}
                    <meshStandardMaterial
                        color={color}
                        roughness={roughness}
                        metalness={metalness}
                        emissive={targetEmissive}
                        emissiveIntensity={emissiveIntensity}
                    />
                </mesh>
                {/* 포장 박스 시각화 (5단계) */}
                {isPacked && (
                    <Box args={[0.5, 0.5, 0.5]} castShadow>
                        <meshStandardMaterial color="white" opacity={0.3} transparent wireframe />
                    </Box>
                )}
                {isNear && (
                    <Text
                        position={[0, 1, 0]}
                        fontSize={0.25}
                        color={isHandFull ? "#ff4444" : "white"}
                        fontWeight="bold"
                    >
                        {isHandFull ? "[FULL] CANNOT PICK UP" : "[F] PICK UP"}
                    </Text>
                )}
            </Float>
        </group>
    );
}
