import React from 'react';
import { Box, Float, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// 아이템 시각화 공통 모듈 (들고 있는 아이템용)
export function HeldItemMesh({ item, scale = 0.5 }) {
    if (!item) return null;
    
    const color = item.color || "#ffffff";
    const type = item.type || item.id || "";

    // 1. 제품(Product) 시각화
    if (item.isProduct) {
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

    // 2. 건축 유닛(Build Units) 시각화 - 유닛별 개별 모델링
    if (item.category) {
        return (
            <group scale={scale}>
                {/* 기계류 공통 베이스 */}
                {item.category === 'Machines' && (
                    <Box args={[1, 0.2, 1.2]} position={[0, -0.4, 0]}>
                        <meshStandardMaterial color="#333" metalness={0.8} />
                    </Box>
                )}

                {/* 개별 유닛 형태 */}
                {item.id === 'CONVEYOR' && (
                    <group>
                        <Box args={[1, 0.1, 1]}>
                            <meshStandardMaterial color="#222" metalness={0.8} />
                        </Box>
                        <Box args={[0.1, 0.05, 0.6]} position={[0, 0.08, 0]}>
                            <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" />
                        </Box>
                    </group>
                )}
                {item.id === 'SORTING' && (
                    <group>
                        <Box args={[0.8, 0.8, 1]} position={[0, 0, 0]}>
                            <meshStandardMaterial color="#1f57a3" metalness={0.5} />
                        </Box>
                        <Box args={[0.9, 0.2, 1]} position={[0, 0.4, 0]}>
                            <meshStandardMaterial color="#1f57a3" />
                        </Box>
                    </group>
                )}
                {item.id === 'CRUSHING' && (
                    <group>
                        <Box args={[0.8, 0.8, 0.8]}>
                            <meshStandardMaterial color="#d9a521" />
                        </Box>
                        <Box args={[0.4, 0.4, 0.4]} position={[0, 0.2, 0]}>
                            <meshStandardMaterial color="#333" />
                        </Box>
                    </group>
                )}
                {item.id === 'CLEANING' && (
                    <group>
                        <Box args={[0.7, 1, 0.7]}>
                            <meshStandardMaterial color="#2e7d32" />
                        </Box>
                        <Box args={[0.1, 0.6, 0.1]} position={[0.4, 0, 0]}>
                            <meshStandardMaterial color="#999" metalness={0.9} />
                        </Box>
                    </group>
                )}
                {item.id === 'DRYING' && (
                    <group>
                        <Box args={[0.8, 0.8, 0.8]}>
                            <meshStandardMaterial color="#d84315" />
                        </Box>
                        <Box args={[0.6, 0.6, 0.6]} position={[0, 0, 0]}>
                            <meshStandardMaterial color="#ff3300" emissive="#ff3300" transparent opacity={0.5} />
                        </Box>
                    </group>
                )}
                {item.id === 'PACKAGING' && (
                    <Box args={[0.8, 0.9, 1]}>
                        <meshStandardMaterial color="#f0f0f0" />
                    </Box>
                )}
                {item.id === 'SHIPPING_BIN' && (
                    <group>
                        <Box args={[1.2, 0.1, 1.2]}>
                            <meshStandardMaterial color="#222" />
                        </Box>
                        <Box args={[1.1, 0.05, 1.1]} position={[0, 0.05, 0]}>
                            <meshStandardMaterial color="#4caf50" transparent opacity={0.3} />
                        </Box>
                    </group>
                )}
                {item.id === 'SHELF' && (
                    <group>
                        <Box args={[1.2, 0.05, 0.5]} position={[0, -0.2, 0]}><meshStandardMaterial color="#445566" /></Box>
                        <Box args={[1.2, 0.05, 0.5]} position={[0, 0.4, 0]}><meshStandardMaterial color="#445566" /></Box>
                        <Box args={[0.05, 1, 0.5]} position={[-0.55, 0, 0]}><meshStandardMaterial color="#222" /></Box>
                        <Box args={[0.05, 1, 0.5]} position={[0.55, 0, 0]}><meshStandardMaterial color="#222" /></Box>
                    </group>
                )}
                {item.id === 'BARREL' && (
                    <mesh rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
                        <meshStandardMaterial color="#ff6600" metalness={0.5} />
                    </mesh>
                )}
                {item.id === 'CRATE' && (
                    <Box args={[0.7, 0.7, 0.7]}>
                        <meshStandardMaterial color="#7B4F2E" roughness={0.9} />
                    </Box>
                )}
                {item.id === 'WALL' && (
                    <Box args={[0.8, 1.2, 0.1]}>
                        <meshStandardMaterial color="#2a2a2a" />
                    </Box>
                )}

                {/* 쓰레기 아이템들 */}
                {item.id?.includes('ITEM_') && (
                    <mesh>
                        {item.id === 'ITEM_CAN' ? <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} /> : <boxGeometry args={[0.3, 0.4, 0.3]} />}
                        <meshStandardMaterial color={color} />
                    </mesh>
                )}

                {/* 폴백 (정의되지 않은 경우) */}
                {!['CONVEYOR', 'SORTING', 'CRUSHING', 'CLEANING', 'DRYING', 'PACKAGING', 'SHIPPING_BIN', 'SHELF', 'BARREL', 'CRATE', 'WALL'].includes(item.id) && !item.id?.includes('ITEM_') && (
                    <Box args={[0.4, 0.4, 0.4]}>
                        <meshStandardMaterial color={color} />
                    </Box>
                )}
            </group>
        );
    }

    // 3. 필드 드랍 쓰레기 (Fallback)
    return (
        <mesh scale={scale} castShadow>
            {type === "Can" ? (
                <cylinderGeometry args={[0.2, 0.2, 0.5, 16]} />
            ) : (
                <boxGeometry args={[0.3, 0.4, 0.3]} />
            )}
            <meshStandardMaterial color={color} />
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
        if ((dist < 4.0) !== isNear) {
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
    // 흰색으로 변하는 오류를 막기 위해 초기 emissive 덮어쓰기를 제거합니다.
    if (currentStageIdx === 0) {
        // targetEmissive = "#ffffff";
        // emissiveIntensity = 0.8;
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
        const isMoving = item.status === 'MOVING' || item.status === 'PROCESSING';
        const mesh = (
            <Box args={[0.6, 0.4, 0.6]} castShadow>
                <meshStandardMaterial
                    color="#00ffcc"
                    emissive="#00ffcc"
                    emissiveIntensity={0.6}
                    metalness={0.9}
                    roughness={0.1}
                />
            </Box>
        );

        return (
            <group position={item.position}>
                {isMoving ? (
                    mesh
                ) : (
                    <Float speed={2.5} rotationIntensity={0.8} floatIntensity={0.6}>
                        {mesh}
                    </Float>
                )}
                {!isMoving && isNear && (
                    <Text position={[0, 1.2, 0]} fontSize={0.3} color="white" fontWeight="bold">
                        [F] 완제품 수거
                    </Text>
                )}
            </group>
        );
    }

    const isMoving = item.status === 'MOVING' || item.status === 'PROCESSING';

    return (
        <group position={item.position} scale={scale}>
            {/* IDLE 아이템만 Float 적용, 벨트 위 이동 아이템은 고정 */}
            {isMoving ? (
                <mesh castShadow>
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
                        color={item.color || color}
                        roughness={roughness}
                        metalness={metalness}
                        emissive={targetEmissive}
                        emissiveIntensity={emissiveIntensity}
                    />
                </mesh>
            ) : (
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <mesh castShadow>
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
                            {isHandFull ? "[인벤토리 가득 참] 주울 수 없음" : "[F] 아이템 줍기"}
                        </Text>
                    )}
                </Float>
            )}
        </group>
    );
}
