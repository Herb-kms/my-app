import React from 'react';
import { Box, Text } from '@react-three/drei';

// 5. 바닥 (Floor)
export function Floor({ graphicsQuality }) {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={graphicsQuality === 'high'}>
                <planeGeometry args={[100, 100]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.8} metalness={0.2} />
            </mesh>
            <gridHelper args={[100, 50, "#333", "#222"]} position={[0, 0, 0]} />

            {/* 주변 경계 안내선 (Industrial look) */}
            <Box args={[100, 0.5, 0.2]} position={[0, 0, 50]}><meshStandardMaterial color="#333" /></Box>
            <Box args={[100, 0.5, 0.2]} position={[0, 0, -50]}><meshStandardMaterial color="#333" /></Box>
            <Box args={[0.2, 0.5, 100]} position={[50, 0, 0]}><meshStandardMaterial color="#333" /></Box>
            <Box args={[0.2, 0.5, 100]} position={[-50, 0, 0]}><meshStandardMaterial color="#333" /></Box>
        </group>
    );
}

// 6. 공장 외형 (FactoryShell)
export function FactoryShell() {
    return (
        <group>
            {/* 공장 벽면 - 어두운 금속 질감 */}
            <mesh position={[0, 10, -50]} receiveShadow>
                <boxGeometry args={[100, 20, 1]} />
                <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[-50, 10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
                <boxGeometry args={[100, 20, 1]} />
                <meshStandardMaterial color="#0a0a0a" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* 천장 구조물 (Industrial Beams) */}
            {[...Array(6)].map((_, i) => (
                <group key={i} position={[0, 19, -45 + i * 15]}>
                    <Box args={[100, 1, 0.5]}>
                        <meshStandardMaterial color="#111" metalness={1} roughness={0} />
                    </Box>
                    <Box args={[0.5, 20, 0.5]} position={[45, -10, 0]}>
                        <meshStandardMaterial color="#111" />
                    </Box>
                </group>
            ))}

            {/* 바닥 장식 (Industrial Stripes) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -40]}>
                <planeGeometry args={[100, 2]} />
                <meshStandardMaterial color="#ffcc00" opacity={0.1} transparent />
            </mesh>
        </group>
    );
}

// 7. 추가 산업 에셋 (IndustrialAssets)
export function IndustrialAssets() {
    return (
        <group>
            {/* 가스 탱크 (Orange Cylinders) */}
            <group position={[8, 0, -5]}>
                <mesh position={[0, 1.25, 0]} castShadow>
                    <cylinderGeometry args={[0.5, 0.5, 2.5, 16]} />
                    <meshStandardMaterial color="#ff6600" metalness={0.7} roughness={0.3} />
                </mesh>
            </group>
            <group position={[9, 0, -4]}>
                <mesh position={[0, 1.25, 0]} castShadow>
                    <cylinderGeometry args={[0.5, 0.5, 2.5, 16]} />
                    <meshStandardMaterial color="#ff6600" metalness={0.7} roughness={0.3} />
                </mesh>
            </group>

            {/* 수납용 크레이트 (Crates) */}
            <group position={[-10, 0, 10]}>
                <Box args={[1.5, 1, 1.5]} position={[0, 0.5, 0]} castShadow>
                    <meshStandardMaterial color="#445566" />
                </Box>
                <Box args={[0.8, 0.8, 0.8]} position={[0, 1, 0]}>
                    <meshStandardMaterial color="#ccddff" />
                </Box>
            </group>
            <group position={[-8, 0, 11]}>
                <Box args={[1.5, 1, 1.5]} position={[0, 0.5, 0]} castShadow>
                    <meshStandardMaterial color="#556677" />
                </Box>
            </group>
            <group position={[-6, 0, 13]}>
                <Box args={[1, 0.8, 1]} position={[0, 0.4, 0]} castShadow>
                    <meshStandardMaterial color="#ff9900" />
                </Box>
            </group>

            {/* 배경 선반 (Shelving) */}
            <group position={[15, 0, 0]}>
                <Box args={[0.2, 5, 5]} position={[0, 2.5, 0]}><meshStandardMaterial color="#333" /></Box>
                <Box args={[2, 0.1, 5]} position={[-1, 1.5, 0]}><meshStandardMaterial color="#555" /></Box>
                <Box args={[2, 0.1, 5]} position={[-1, 3.5, 0]}><meshStandardMaterial color="#555" /></Box>
            </group>
        </group>
    );
}

// 8. 판매용 배송함 (ShippingBin)
export function ShippingBin() {
    return (
        <group position={[-10, 0, 10]}>
            <Box args={[4, 0.2, 4]} receiveShadow position={[0, 0.1, 0]}>
                <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
            </Box>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.21, 0]}>
                <planeGeometry args={[3.8, 3.8]} />
                <meshStandardMaterial color="#4caf50" opacity={0.1} transparent />
            </mesh>
            <Text
                position={[0, 0.3, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={0.4}
                color="#4caf50"
                fontWeight="900"
            >
                SELL ZONE (G)
            </Text>
            {/* 구역 표시 네온 라인 */}
            <Box args={[4.2, 0.1, 0.1]} position={[0, 0.2, 2]}><meshStandardMaterial color="#4caf50" emissive="#4caf50" emissiveIntensity={2} /></Box>
            <Box args={[4.2, 0.1, 0.1]} position={[0, 0.2, -2]}><meshStandardMaterial color="#4caf50" emissive="#4caf50" emissiveIntensity={2} /></Box>
            <Box args={[0.1, 0.1, 4.2]} position={[2, 0.2, 0]}><meshStandardMaterial color="#4caf50" emissive="#4caf50" emissiveIntensity={2} /></Box>
            <Box args={[0.1, 0.1, 4.2]} position={[-2, 0.2, 0]}><meshStandardMaterial color="#4caf50" emissive="#4caf50" emissiveIntensity={2} /></Box>
        </group>
    );
}

// 9. 배치 가능한 소품 (PlacedProps)
export function PropComponents({ placedProps = [] }) {
    return (
        <group>
            {placedProps.map(prop => {
                const pos = prop.position;
                const rot = prop.rotation || [0, 0, 0];
                return (
                    <group key={prop.id} position={pos} rotation={rot}>
                        {prop.type === 'SHELF' && (
                            <group>
                                <Box args={[3, 0.1, 1]} position={[0, 1.5, 0]} castShadow>
                                    <meshStandardMaterial color="#445566" metalness={0.6} roughness={0.4} />
                                </Box>
                                <Box args={[3, 0.1, 1]} position={[0, 2.8, 0]} castShadow>
                                    <meshStandardMaterial color="#445566" metalness={0.6} roughness={0.4} />
                                </Box>
                                <Box args={[0.1, 3, 1]} position={[-1.4, 1.5, 0]}>
                                    <meshStandardMaterial color="#333" metalness={1} />
                                </Box>
                                <Box args={[0.1, 3, 1]} position={[1.4, 1.5, 0]}>
                                    <meshStandardMaterial color="#333" metalness={1} />
                                </Box>
                            </group>
                        )}
                        {prop.type === 'CRATE' && (
                            <group>
                                <Box args={[1.8, 1.8, 1.8]} position={[0, 0.9, 0]} castShadow>
                                    <meshStandardMaterial color="#7B4F2E" roughness={0.9} />
                                </Box>
                                <Box args={[1.85, 0.1, 1.85]} position={[0, 0.05, 0]}>
                                    <meshStandardMaterial color="#5a3a1e" />
                                </Box>
                                <Box args={[1.85, 0.1, 1.85]} position={[0, 1.8, 0]}>
                                    <meshStandardMaterial color="#5a3a1e" />
                                </Box>
                            </group>
                        )}
                        {prop.type === 'BARREL' && (
                            <group>
                                <mesh position={[0, 1.1, 0]} castShadow>
                                    <cylinderGeometry args={[0.55, 0.6, 2.2, 16]} />
                                    <meshStandardMaterial color="#ff6600" metalness={0.6} roughness={0.3} />
                                </mesh>
                                <mesh position={[0, 0.05, 0]}>
                                    <cylinderGeometry args={[0.62, 0.62, 0.1, 16]} />
                                    <meshStandardMaterial color="#444" metalness={1} />
                                </mesh>
                                <mesh position={[0, 2.15, 0]}>
                                    <cylinderGeometry args={[0.62, 0.62, 0.1, 16]} />
                                    <meshStandardMaterial color="#444" metalness={1} />
                                </mesh>
                            </group>
                        )}
                        {prop.type === 'WALL' && (
                            <group>
                                <Box args={[2.5, 5, 0.3]} position={[0, 2.5, 0]} castShadow>
                                    <meshStandardMaterial color="#2a2a2a" roughness={0.8} metalness={0.3} />
                                </Box>
                                <Box args={[2.3, 4.8, 0.05]} position={[0, 2.5, 0.2]}>
                                    <meshStandardMaterial color="#333" roughness={0.6} />
                                </Box>
                                <Box args={[2.5, 0.1, 0.35]} position={[0, 0.05, 0]}>
                                    <meshStandardMaterial color="#111" metalness={1} />
                                </Box>
                            </group>
                        )}
                    </group>
                );
            })}
        </group>
    );
}
