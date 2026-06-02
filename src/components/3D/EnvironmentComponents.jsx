import React from 'react';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';

// 5. 바닥 (Floor) & 외곽 거대 방벽 (Boundary Walls)
export function Floor({ graphicsQuality }) {
    return (
        <group>
            {/* 메인 콘크리트 바닥 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow={graphicsQuality === 'high'}>
                <planeGeometry args={[250, 250]} />
                <meshStandardMaterial color="#111215" roughness={0.9} metalness={0.1} />
            </mesh>
            <gridHelper args={[250, 100, "#22252a", "#15171a"]} position={[0, 0, 0]} />

            {/* 1) 북쪽 외곽 방벽 */}
            <group position={[0, 15, -125]}>
                <Box args={[250, 30, 4]} castShadow receiveShadow>
                    <meshStandardMaterial color="#1a1c22" roughness={0.8} metalness={0.7} />
                </Box>
                {/* 상단 네온 띠 */}
                <Box args={[250, 0.6, 4.15]} position={[0, 14.8, 0]}>
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={3} />
                </Box>
            </group>

            {/* 2) 남쪽 외곽 방벽 */}
            <group position={[0, 15, 125]}>
                <Box args={[250, 30, 4]} castShadow receiveShadow>
                    <meshStandardMaterial color="#1a1c22" roughness={0.8} metalness={0.7} />
                </Box>
                {/* 상단 네온 띠 */}
                <Box args={[250, 0.6, 4.15]} position={[0, 14.8, 0]}>
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={3} />
                </Box>
            </group>

            {/* 3) 서쪽 외곽 방벽 */}
            <group position={[-125, 15, 0]}>
                <Box args={[4, 30, 250]} castShadow receiveShadow>
                    <meshStandardMaterial color="#1a1c22" roughness={0.8} metalness={0.7} />
                </Box>
                {/* 상단 네온 띠 */}
                <Box args={[4.15, 0.6, 250]} position={[0, 14.8, 0]}>
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={3} />
                </Box>
            </group>

            {/* 4) 동쪽 외곽 방벽 */}
            <group position={[125, 15, 0]}>
                <Box args={[4, 30, 250]} castShadow receiveShadow>
                    <meshStandardMaterial color="#1a1c22" roughness={0.8} metalness={0.7} />
                </Box>
                {/* 상단 네온 띠 */}
                <Box args={[4.15, 0.6, 250]} position={[0, 14.8, 0]}>
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={3} />
                </Box>
            </group>
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

// 10. 사이버펑크 도시 배경 건물 및 집 (신도시 그리드 설계 - 다양한 규모의 빌딩과 단독주택, 빌라 배치)
// 15x15 그리드 구성 (외곽 경계는 거대 방벽이 둘러싸고 있으므로 내부 구조물만 배치)
// 0: 빈 통로, 1: 고층 오피스 빌딩, 2: 단독주택 1층, 3: 단독주택 2층, 4: 중형 빌라(6~10층)
const MAZE_GRID = [
    [1, 0, 4, 0, 1, 0, 2, 0, 2, 0, 1, 0, 4, 0, 1], // Row 0
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 1
    [4, 0, 1, 0, 2, 0, 3, 0, 3, 0, 2, 0, 1, 0, 4], // Row 2
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 3
    [2, 0, 3, 0, 1, 0, 2, 0, 2, 0, 1, 0, 3, 0, 2], // Row 4
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 5
    [4, 0, 2, 0, 3, 0, 0, 0, 0, 0, 3, 0, 2, 0, 4], // Row 6
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 7
    [4, 0, 2, 0, 3, 0, 0, 0, 0, 0, 3, 0, 2, 0, 4], // Row 8
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 9
    [2, 0, 3, 0, 1, 0, 2, 0, 2, 0, 1, 0, 3, 0, 2], // Row 10
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 11
    [4, 0, 1, 0, 2, 0, 3, 0, 3, 0, 2, 0, 1, 0, 4], // Row 12
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // Row 13
    [1, 0, 4, 0, 1, 0, 2, 0, 2, 0, 1, 0, 4, 0, 1], // Row 14
];

const NEON_COLORS = ['#ff0055', '#00ffff', '#ffff00', '#ff00ff', '#00ff66', '#ff5500', '#9900ff'];

export const DECORATIVE_BUILDINGS = [];
export const MAZE_CORRIDORS = [];

// 그리드 정보를 해독하여 개별 건물 속성값 빌드
for (let r = 0; r < MAZE_GRID.length; r++) {
    for (let c = 0; c < MAZE_GRID[r].length; c++) {
        const x = -112 + c * 16;
        const z = -112 + r * 16;
        const gridVal = MAZE_GRID[r][c];
        const neonColor = NEON_COLORS[(r + c) % NEON_COLORS.length];

        if (gridVal === 1) {
            // 고층 오피스 빌딩 (45m ~ 70m)
            DECORATIVE_BUILDINGS.push({ x, z, w: 12, h: 45 + Math.random() * 25, d: 12, neonColor, type: 'tower' });
        } else if (gridVal === 2) {
            // 단독주택 1층 (높이 4.2m)
            DECORATIVE_BUILDINGS.push({ x, z, w: 8, h: 4.2, d: 8, neonColor, type: 'house1' });
        } else if (gridVal === 3) {
            // 단독주택 2층 (높이 7.8m)
            DECORATIVE_BUILDINGS.push({ x, z, w: 9, h: 7.8, d: 9, neonColor, type: 'house2' });
        } else if (gridVal === 4) {
            // 빌라 (6~10층, 18m ~ 30m)
            const floors = 6 + Math.floor(Math.random() * 5);
            DECORATIVE_BUILDINGS.push({ x, z, w: 10.5, h: floors * 3.0, d: 10.5, neonColor, type: 'villa', floors });
        } else {
            // 빈 길목 통로
            if (r >= 5 && r <= 9 && c >= 5 && c <= 9) {
                continue;
            }
            MAZE_CORRIDORS.push({ x, z });
        }
    }
}

export function BackgroundBuildings() {
    return (
        <group>
            {DECORATIVE_BUILDINGS.map((b, i) => {
                if (b.type === 'house1') {
                    // 단독주택 1층
                    return (
                        <group key={i} position={[b.x, b.h / 2, b.z]}>
                            {/* 본체 */}
                            <Box args={[b.w, b.h, b.d]} castShadow receiveShadow>
                                <meshStandardMaterial color="#1f2229" roughness={0.7} metalness={0.6} />
                            </Box>
                            {/* 단층 경사지붕 */}
                            <mesh position={[0, b.h / 2 + 0.8, 0]} rotation={[0, Math.PI / 4, 0]}>
                                <coneGeometry args={[b.w * 0.72, 1.6, 4]} />
                                <meshStandardMaterial color="#2d313d" roughness={0.6} metalness={0.6} />
                            </mesh>
                            {/* 소형 정면 네온 창문 */}
                            <Box args={[b.w * 0.35, b.h * 0.4, 0.1]} position={[0, 0, b.d / 2 + 0.05]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={2.0} />
                            </Box>
                            {/* 지붕 네온 하이라이트 라인 */}
                            <Box args={[b.w + 0.1, 0.08, b.d + 0.1]} position={[0, b.h / 2, 0]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={2.5} />
                            </Box>
                        </group>
                    );
                } else if (b.type === 'house2') {
                    // 단독주택 2층
                    return (
                        <group key={i} position={[b.x, b.h / 2, b.z]}>
                            {/* 1층부 */}
                            <Box args={[b.w, b.h * 0.5, b.d]} position={[0, -b.h * 0.25, 0]} castShadow receiveShadow>
                                <meshStandardMaterial color="#1a1c22" roughness={0.7} metalness={0.6} />
                            </Box>
                            {/* 2층부 (약간의 테라스 유지를 위해 뒤로/좁게 설계) */}
                            <Box args={[b.w * 0.85, b.h * 0.5, b.d * 0.85]} position={[0, b.h * 0.25, 0]} castShadow receiveShadow>
                                <meshStandardMaterial color="#23262f" roughness={0.8} />
                            </Box>
                            {/* 2층 지붕 */}
                            <mesh position={[0, b.h * 0.5 + 0.9, 0]} rotation={[0, Math.PI / 4, 0]}>
                                <coneGeometry args={[b.w * 0.65, 1.8, 4]} />
                                <meshStandardMaterial color="#323746" roughness={0.5} metalness={0.7} />
                            </mesh>
                            {/* 1층 네온창 */}
                            <Box args={[b.w * 0.3, b.h * 0.2, 0.1]} position={[b.w * 0.2, -b.h * 0.25, b.d / 2 + 0.05]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={1.8} />
                            </Box>
                            {/* 2층 네온창 */}
                            <Box args={[b.w * 0.4, b.h * 0.2, 0.1]} position={[0, b.h * 0.25, (b.d * 0.85) / 2 + 0.05]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={2.5} />
                            </Box>
                        </group>
                    );
                } else if (b.type === 'villa') {
                    // 빌라 (6~10층)
                    // 층마다 개별적인 창문들을 쌓아서 표현
                    const floorHeight = 3.0;
                    const floorBoxes = [];
                    for (let f = 0; f < b.floors; f++) {
                        floorBoxes.push(f);
                    }
                    return (
                        <group key={i} position={[b.x, b.h / 2, b.z]}>
                            {/* 빌라 메인 바디 */}
                            <Box args={[b.w, b.h, b.d]} castShadow receiveShadow>
                                <meshStandardMaterial color="#252830" roughness={0.7} metalness={0.7} />
                            </Box>
                            {/* 층별 창문 네온 그리드 */}
                            {floorBoxes.map(f => {
                                const yPos = -b.h / 2 + (f + 0.5) * floorHeight;
                                return (
                                    <group key={f}>
                                        {/* 정면 왼쪽 창문 */}
                                        <Box args={[1.2, 1.0, 0.1]} position={[-2.2, yPos, b.d / 2 + 0.05]}>
                                            <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={2.2} />
                                        </Box>
                                        {/* 정면 오른쪽 창문 */}
                                        <Box args={[1.2, 1.0, 0.1]} position={[2.2, yPos, b.d / 2 + 0.05]}>
                                            <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={2.2} />
                                        </Box>
                                        {/* 배면 창문 */}
                                        <Box args={[1.2, 1.0, 0.1]} position={[0, yPos, -b.d / 2 - 0.05]}>
                                            <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={2.2} />
                                        </Box>
                                    </group>
                                );
                            })}
                            {/* 옥상 네온 사인 구조물 */}
                            <Box args={[b.w * 0.7, 0.3, b.d * 0.7]} position={[0, b.h / 2 + 0.15, 0]}>
                                <meshStandardMaterial color="#111" metalness={0.9} />
                            </Box>
                            <Box args={[0.2, 1.8, 0.2]} position={[-b.w * 0.25, b.h / 2 + 1.0, 0]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={3.0} />
                            </Box>
                            <Box args={[0.2, 1.8, 0.2]} position={[b.w * 0.25, b.h / 2 + 1.0, 0]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={3.0} />
                            </Box>
                            <Box args={[b.w * 0.5, 0.6, 0.1]} position={[0, b.h / 2 + 1.4, 0]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={3.5} />
                            </Box>
                        </group>
                    );
                } else if (b.type === 'wall') {
                    // 낮은 네온 차단벽 (Low guard wall)
                    return (
                        <group key={i} position={[b.x, b.h / 2, b.z]}>
                            <Box args={[b.w, b.h, b.d]} castShadow receiveShadow>
                                <meshStandardMaterial color="#2d3038" roughness={0.8} metalness={0.5} />
                            </Box>
                            {/* 벽면 경고 데칼(Neon Yellow stripe) */}
                            <Box args={[b.w + 0.1, 0.3, 0.1]} position={[0, b.h * 0.2, b.d / 2 + 0.05]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={2.5} />
                            </Box>
                            <Box args={[b.w + 0.1, 0.3, 0.1]} position={[0, b.h * 0.2, -b.d / 2 - 0.05]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={2.5} />
                            </Box>
                            {/* 벽 상단 LED 파이프 라인 */}
                            <Box args={[b.w + 0.1, 0.12, 0.12]} position={[0, b.h / 2, b.d / 2 + 0.05]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={4.0} />
                            </Box>
                        </group>
                    );
                } else {
                    // 고층 오피스 빌딩
                    return (
                        <group key={i} position={[b.x, b.h / 2, b.z]}>
                            {/* 빌딩 본체 */}
                            <Box args={[b.w, b.h, b.d]} castShadow receiveShadow>
                                <meshStandardMaterial color="#111317" roughness={0.7} metalness={0.8} />
                            </Box>
                            {/* 모서리 고휘도 수직 네온 데코 */}
                            <Box args={[0.25, b.h, 0.25]} position={[b.w / 2 + 0.05, 0, b.d / 2 + 0.05]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={3.5} />
                            </Box>
                            <Box args={[0.25, b.h, 0.25]} position={[-b.w / 2 - 0.05, 0, -b.d / 2 - 0.05]}>
                                <meshStandardMaterial color={b.neonColor} emissive={b.neonColor} emissiveIntensity={3.5} />
                            </Box>
                            {/* 옥상 송전 안테나 타워 */}
                            <mesh position={[0, b.h / 2 + 2, 0]}>
                                <cylinderGeometry args={[0.06, 0.06, 4, 8]} />
                                <meshStandardMaterial color="#fff" emissive={b.neonColor} emissiveIntensity={1.5} />
                            </mesh>
                            <mesh position={[0, b.h / 2 + 4, 0]}>
                                <sphereGeometry args={[0.25, 8, 8]} />
                                <meshStandardMaterial color="#fff" emissive="#ffffff" emissiveIntensity={5.0} />
                            </mesh>
                        </group>
                    );
                }
            })}
        </group>
    );
}

// 11. 도시 분위기 꾸미기 데코레이션 (신도시 바둑판식 도로망 및 인도 경계 네온 가로등)
export function CityGridDecorations() {
    // 신도시 도로 목록 (바둑판식 격자)
    const nsRoads = [-95, -35, 35, 95];
    const ewRoads = [-95, -35, 35, 95];

    // 가로등 배치용 좌표 목록 (도로 가장자리에 겹치지 않게 정밀 분배)
    const lightZCoords = [-115, -75, -55, -15, 15, 55, 75, 115];

    return (
        <group>
            {/* 남북 방향 도로 (NS Roads) */}
            {nsRoads.map((xVal, idx) => (
                <group key={`ns-road-${idx}`}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[xVal, 0.015, 0]}>
                        <planeGeometry args={[10, 248]} />
                        <meshStandardMaterial color="#16171a" roughness={0.9} />
                    </mesh>
                    {/* 도로 중앙 차선 (Cyan / Magenta 번갈아 배치) */}
                    <Box args={[0.1, 0.015, 248]} position={[xVal, 0.025, 0]}>
                        <meshStandardMaterial
                            color={idx % 2 === 0 ? "#00ffff" : "#ff00a0"}
                            emissive={idx % 2 === 0 ? "#00ffff" : "#ff00a0"}
                            emissiveIntensity={2.5}
                        />
                    </Box>
                </group>
            ))}

            {/* 동서 방향 도로 (EW Roads) */}
            {ewRoads.map((zVal, idx) => (
                <group key={`ew-road-${idx}`}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, zVal]}>
                        <planeGeometry args={[248, 10]} />
                        <meshStandardMaterial color="#16171a" roughness={0.9} />
                    </mesh>
                    <Box args={[248, 0.015, 0.1]} position={[0, 0.025, zVal]}>
                        <meshStandardMaterial
                            color={idx % 2 === 0 ? "#00ffff" : "#ff00a0"}
                            emissive={idx % 2 === 0 ? "#00ffff" : "#ff00a0"}
                            emissiveIntensity={2.5}
                        />
                    </Box>
                </group>
            ))}

            {/* 가로등 시스템: 도로 좌우 보도(Sidewalk) 위 정교한 배치 */}
            {nsRoads.map((xVal) => (
                <group key={`ns-lights-${xVal}`}>
                    {lightZCoords.map((zVal, idx) => {
                        // 가로등이 도로 한가운데 서지 않도록, 도로 중심선에서 보도쪽인 ±5.2m만큼 X값을 오프셋 조정
                        const isLeft = idx % 2 === 0;
                        const lightX = xVal + (isLeft ? -5.2 : 5.2);
                        const neonColor = isLeft ? "#ff00a0" : "#00ffff";

                        return (
                            <group key={`light-pole-${zVal}`} position={[lightX, 0, zVal]}>
                                {/* 가로등 지지 기둥 */}
                                <mesh position={[0, 4, 0]}>
                                    <cylinderGeometry args={[0.07, 0.11, 8, 8]} />
                                    <meshStandardMaterial color="#22252a" metalness={0.95} />
                                </mesh>
                                {/* 네온 램프 헤드 (도로 중앙쪽을 바라보도록 X축 방향 연장) */}
                                <Box args={[1.5, 0.12, 0.25]} position={[isLeft ? 0.7 : -0.7, 8, 0]}>
                                    <meshStandardMaterial color={neonColor} emissive={neonColor} emissiveIntensity={3} />
                                </Box>
                                {/* 램프 아래에 부착되는 전선 보조 박스 */}
                                <Box args={[0.3, 0.4, 0.3]} position={[0, 7.6, 0]}>
                                    <meshStandardMaterial color="#111" metalness={0.8} />
                                </Box>
                            </group>
                        );
                    })}
                </group>
            ))}
        </group>
    );
}

// 12. 공장 외벽 및 천장 프레임 구조 (기계 주변 배치 - 어두운 회색 스타일 & 천장 완전히 덮음)
export function FactoryBuilding() {
    return (
        <group>
            {/* 바닥 철판 보도 */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3.5, 0.005, -1.5]}>
                <planeGeometry args={[32.5, 22.5]} />
                <meshStandardMaterial color="#2d2f34" roughness={0.7} metalness={0.5} />
            </mesh>

            {/* 외곽 가이드 라인 네온 */}
            <Box args={[32.5, 0.05, 0.15]} position={[3.5, 0.01, -12.75]}><meshStandardMaterial color="#ff00a0" emissive="#ff00a0" emissiveIntensity={2} /></Box>
            <Box args={[32.5, 0.05, 0.15]} position={[3.5, 0.01, 9.75]}><meshStandardMaterial color="#ff00a0" emissive="#ff00a0" emissiveIntensity={2} /></Box>
            <Box args={[0.15, 0.05, 22.5]} position={[-12.75, 0.01, -1.5]}><meshStandardMaterial color="#ff00a0" emissive="#ff00a0" emissiveIntensity={2} /></Box>
            <Box args={[0.15, 0.05, 22.5]} position={[19.75, 0.01, -1.5]}><meshStandardMaterial color="#ff00a0" emissive="#ff00a0" emissiveIntensity={2} /></Box>

            {/* 1. 외벽 (Factory Walls) - 어두운 회색(Dark Grey) 벽판 구조 */}
            {/* 뒷벽 (북쪽): z = -12.5 */}
            <Box args={[32, 6.5, 0.4]} position={[3.5, 3.25, -12.5]} castShadow receiveShadow>
                <meshStandardMaterial color="#2b2d32" roughness={0.7} metalness={0.6} />
            </Box>

            {/* 좌측벽 (서쪽): x = -12.5 */}
            <Box args={[0.4, 6.5, 22]} position={[-12.5, 3.25, -1.5]} castShadow receiveShadow>
                <meshStandardMaterial color="#2b2d32" roughness={0.7} metalness={0.6} />
            </Box>

            {/* 우측벽 (동쪽): x = 19.5 */}
            <Box args={[0.4, 6.5, 22]} position={[19.5, 3.25, -1.5]} castShadow receiveShadow>
                <meshStandardMaterial color="#2b2d32" roughness={0.7} metalness={0.6} />
            </Box>

            {/* 앞벽 (남쪽): 입구(Gate)용 분할 벽 */}
            {/* 좌측 세그먼트 */}
            <Box args={[8.5, 6.5, 0.4]} position={[-8.25, 3.25, 9.5]} castShadow receiveShadow>
                <meshStandardMaterial color="#2b2d32" roughness={0.7} metalness={0.6} />
            </Box>
            {/* 우측 세그먼트 */}
            <Box args={[9.5, 6.5, 0.4]} position={[14.75, 3.25, 9.5]} castShadow receiveShadow>
                <meshStandardMaterial color="#2b2d32" roughness={0.7} metalness={0.6} />
            </Box>
            {/* 입구 상단 인방 */}
            <Box args={[14, 1.5, 0.4]} position={[3.25, 5.75, 9.5]} castShadow>
                <meshStandardMaterial color="#2b2d32" roughness={0.7} metalness={0.6} />
            </Box>

            {/* 2. 어두운 철골 기둥 (Industrial Support Columns) */}
            {/* 뒷벽 기둥들 (북쪽: z = -12.5) */}
            {[-12.5, -4, 4, 12, 19.5].map((coordX, idx) => (
                <Box key={`col-back-${idx}`} args={[0.6, 6.5, 0.6]} position={[coordX, 3.25, -12.5]}>
                    <meshStandardMaterial color="#1f2125" metalness={0.9} />
                </Box>
            ))}
            {/* 앞벽 기둥들 (남쪽 입구 기둥: z = 9.5, 입구를 가로막지 않도록 x = 4 기둥 제외) */}
            {[-12.5, -4, 12, 19.5].map((coordX, idx) => (
                <Box key={`col-front-${idx}`} args={[0.6, 6.5, 0.6]} position={[coordX, 3.25, 9.5]}>
                    <meshStandardMaterial color="#1f2125" metalness={0.9} />
                </Box>
            ))}

            {/* 3. 완전히 덮인 공장 천장 (Solid Ceiling / Roof with Neon Blue Skylight) */}
            {/* 좌측 천장 덮개 */}
            <Box args={[12, 0.2, 22]} position={[-6.5, 6.5, -1.5]} castShadow receiveShadow>
                <meshStandardMaterial color="#1e2024" roughness={0.8} metalness={0.6} />
            </Box>
            {/* 우측 천장 덮개 */}
            <Box args={[12, 0.2, 22]} position={[13.5, 6.5, -1.5]} castShadow receiveShadow>
                <meshStandardMaterial color="#1e2024" roughness={0.8} metalness={0.6} />
            </Box>
            {/* 중앙 네온 스카이라이트 글래스 스트립 (glowing light panel) */}
            <Box args={[8, 0.1, 22]} position={[3.5, 6.5, -1.5]}>
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={1.5} transparent opacity={0.8} />
            </Box>

            {/* 천장 내부 보강 보강재 들보 */}
            <Box args={[32, 0.3, 0.3]} position={[3.5, 6.3, -5]}><meshStandardMaterial color="#111" metalness={0.9} /></Box>
            <Box args={[32, 0.3, 0.3]} position={[3.5, 6.3, 2]}><meshStandardMaterial color="#111" metalness={0.9} /></Box>

            {/* 4. 고압 산업 배관 시스템 (Industrial Wall Piping) */}
            <group position={[3.5, 4.5, -12.2]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.12, 0.12, 31, 12]} />
                    <meshStandardMaterial color="#ff00a0" emissive="#ff00a0" emissiveIntensity={2.5} metalness={0.8} roughness={0.3} />
                </mesh>
                <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.08, 0.08, 31, 12]} />
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2.5} metalness={0.8} roughness={0.3} />
                </mesh>
            </group>

            {/* 5. 공장 정문 외부 표지판 홀로그램 및 텍스트 (사다리꼴 투명 네온 사인 구조) */}
            <FactoryGateSign />

            {/* 6. 산소 필터 충전기 스테이션 */}
            <OxygenStation />
        </group>
    );
}

// 13. 공장 정문 네온 사다리꼴 표지판 컴포넌트
function FactoryGateSign() {
    const signShape = React.useMemo(() => {
        const s = new THREE.Shape();
        s.moveTo(-4.5, -0.6);
        s.lineTo(4.5, -0.6);
        s.lineTo(6.0, 0.7);
        s.lineTo(-6.0, 0.7);
        s.closePath();
        return s;
    }, []);

    return (
        <group position={[3.25, 5.75, 9.71]}>
            {/* 배경 반투명 발광 사다리꼴 (Hologram Trapezoid) */}
            <mesh position={[0, 0, -0.05]}>
                <shapeGeometry args={[signShape]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.3} depthWrite={false} toneMapped={false} />
            </mesh>

            {/* 텍스트 */}
            <Text
                position={[0, 0.05, 0]}
                fontSize={0.48}
                color="#e0ffff"
                fontWeight="bold"
                anchorX="center"
                anchorY="middle"
            >
                RECYCLING CENTER
            </Text>

            {/* 텍스트 아래 밑줄 네온 라인 */}
            <Box args={[7.2, 0.06, 0.06]} position={[0, -0.32, 0]}>
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={3.5} />
            </Box>
        </group>
    );
}

// 14. 산소 필터 충전기 스테이션 (Oxygen Recharge Station)
export function OxygenStation() {
    return (
        <group position={[-3.5, 0, 8.0]}>
            {/* 충전기 기둥 */}
            <Box args={[1.0, 2.3, 1.0]} castShadow position={[0, 1.15, 0]}>
                <meshStandardMaterial color="#2d3035" roughness={0.5} metalness={0.8} />
            </Box>
            
            {/* 파란색 네온 코일/액체 실린더 */}
            <mesh position={[0, 1.25, 0]}>
                <cylinderGeometry args={[0.25, 0.25, 1.2, 16]} />
                <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={2.5} transparent opacity={0.8} />
            </mesh>

            {/* 충전기 상부 캡 */}
            <Box args={[1.15, 0.15, 1.15]} position={[0, 1.9, 0]}>
                <meshStandardMaterial color="#1a1c22" roughness={0.7} metalness={0.9} />
            </Box>

            {/* 안내 텍스트 */}
            <Text
                position={[0, 2.3, 0]}
                fontSize={0.24}
                color="#00aaff"
                fontWeight="bold"
                anchorX="center"
            >
                산소 충전기 [E]
            </Text>
            <Text
                position={[0, 2.05, 0]}
                fontSize={0.16}
                color="#00ffcc"
                fontWeight="bold"
                anchorX="center"
            >
                비용: $10
            </Text>
        </group>
    );
}


