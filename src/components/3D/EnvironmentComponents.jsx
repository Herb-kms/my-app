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

// 8. 판매용 배송함 (ShippingBin)
export function ShippingBin({ position = [-10, 0, 10], rotation = [0, 0, 0] }) {
    return (
        <group position={position} rotation={rotation}>
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
