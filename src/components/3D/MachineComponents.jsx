import React from 'react';
import { Box, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ShippingBin } from './EnvironmentComponents';
// ─── 컨베이어 벨트 ────────────────────────────────────────────────────────────
// placedBelts 배열을 받아 그리드에 맞게 배치
// 벨트 타일은 그리드(2.5) 전체를 꽉 채워 틈 없이 연결되도록 설계
export function ConveyorBelt({ placedBelts = [] }) {
    return (
        <group>
            {placedBelts.map((belt) => (
                <group key={belt.id} position={belt.position} rotation={belt.rotation}>
                    {/* 벨트 표면 - 그리드 전체 너비(2.5)를 채워 타일이 자연스럽게 이어짐 */}
                    <Box args={[2.45, 0.08, 2.45]} position={[0, 0.04, 0]} receiveShadow>
                        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
                    </Box>

                    {/* 테두리 금속 프레임 */}
                    <Box args={[2.5, 0.12, 2.5]} position={[0, -0.02, 0]}>
                        <meshStandardMaterial color="#2a2a2a" metalness={1} roughness={0.1} />
                    </Box>

                    {/* 중앙 방향 표시 화살표 (네온 청록) */}
                    <Box args={[0.1, 0.05, 1.2]} position={[0, 0.09, -0.1]}>
                        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.7} />
                    </Box>
                    <Box args={[0.35, 0.05, 0.35]} position={[0, 0.09, -0.75]}
                        rotation={[0, Math.PI / 4, 0]}>
                        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.7} />
                    </Box>
                </group>
            ))}
        </group>
    );
}

// ─── 유틸리티 컴포넌트 ────────────────────────────────────────────────────────

function WarningStripes({ position, width, rotation = [0, 0, 0], isRedWhite = true }) {
    const numStripes = Math.floor(width / 0.2);
    const color1 = isRedWhite ? "#dd2222" : "#222222";
    const color2 = isRedWhite ? "#ffffff" : "#ddcc00";
    
    return (
        <group position={position} rotation={rotation}>
            {Array.from({ length: numStripes }).map((_, i) => (
                <Box key={i} args={[0.2, 0.15, 0.05]} position={[-width/2 + i * 0.2 + 0.1, 0, 0]}>
                    <meshStandardMaterial color={i % 2 === 0 ? color1 : color2} roughness={0.9} />
                </Box>
            ))}
        </group>
    );
}

function ControlPanel({ position, rotation }) {
    return (
        <group position={position} rotation={rotation}>
            {/* Stand */}
            <Box args={[0.6, 0.8, 0.6]} position={[0, 0.4, 0]}>
                <meshStandardMaterial color="#555" roughness={0.8} />
            </Box>
            {/* Sloped Console */}
            <group position={[0, 0.8, 0.1]} rotation={[-Math.PI / 6, 0, 0]}>
                <Box args={[0.7, 0.5, 0.1]}>
                    <meshStandardMaterial color="#666" />
                </Box>
                {/* Screen */}
                <Box args={[0.5, 0.3, 0.02]} position={[0, 0.05, 0.05]}>
                    <meshStandardMaterial color="#111" emissive="#002200" />
                </Box>
                {/* Buttons */}
                <Box args={[0.08, 0.08, 0.05]} position={[-0.2, -0.15, 0.05]}>
                    <meshStandardMaterial color="#f00" />
                </Box>
                <Box args={[0.08, 0.08, 0.05]} position={[0.2, -0.15, 0.05]}>
                    <meshStandardMaterial color="#0f0" />
                </Box>
            </group>
        </group>
    );
}

// ─── 개별 기계 특성 컴포넌트 ──────────────────────────────────────────────────

function SortingMachine({ isActive }) {
    return (
        <group>
            {/* 좌/우 파란 벽 */}
            <Box args={[0.5, 1.8, 3.0]} position={[0.95, 0.9, 0]}>
                <meshStandardMaterial color="#1f57a3" metalness={0.5} roughness={0.6} />
            </Box>
            <Box args={[0.5, 1.8, 3.0]} position={[-0.95, 0.9, 0]}>
                <meshStandardMaterial color="#1f57a3" metalness={0.5} roughness={0.6} />
            </Box>
            {/* 상단 덮개 */}
            <Box args={[2.4, 0.8, 3.0]} position={[0, 2.2, 0]}>
                <meshStandardMaterial color="#1f57a3" metalness={0.5} roughness={0.6} />
            </Box>

            {/* 터널 입구 가림막 */}
            <Box args={[2.4, 1.2, 0.2]} position={[0, 1.4, 1.4]}>
                <meshStandardMaterial color="#163f75" />
            </Box>
            <Box args={[2.4, 1.2, 0.2]} position={[0, 1.4, -1.4]}>
                <meshStandardMaterial color="#163f75" />
            </Box>

            {/* 내부 스캐너 빛 */}
            {isActive && (
                <Box args={[1.8, 0.1, 1.8]} position={[0, 1.0, 0]}>
                    <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={1} transparent opacity={0.5} />
                </Box>
            )}

            {/* 측면 경고 표지판 */}
            <Box args={[0.6, 0.4, 0.05]} position={[1.22, 1.2, 0.5]} rotation={[0, Math.PI / 2, 0]}>
                <meshStandardMaterial color="#ddd" />
            </Box>
            <Box args={[0.2, 0.2, 0.06]} position={[1.22, 1.2, 0.5]} rotation={[0, Math.PI / 2, 0]}>
                <meshStandardMaterial color="#c00" />
            </Box>

            <WarningStripes position={[1.25, 0.1, 0]} width={3.0} rotation={[0, Math.PI / 2, 0]} isRedWhite={true} />
            <WarningStripes position={[-1.25, 0.1, 0]} width={3.0} rotation={[0, -Math.PI / 2, 0]} isRedWhite={true} />

            <ControlPanel position={[-1.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
        </group>
    );
}

function CrushingMachine({ isActive }) {
    return (
        <group>
            {/* 좌/우 두꺼운 노란 벽 */}
            <Box args={[0.8, 2.2, 2.6]} position={[0.9, 1.1, 0]}>
                <meshStandardMaterial color="#d9a521" metalness={0.4} roughness={0.7} />
            </Box>
            <Box args={[0.8, 2.2, 2.6]} position={[-0.9, 1.1, 0]}>
                <meshStandardMaterial color="#d9a521" metalness={0.4} roughness={0.7} />
            </Box>
            
            {/* 상단 지붕 */}
            <Box args={[2.6, 0.8, 2.6]} position={[0, 2.6, 0]}>
                <meshStandardMaterial color="#d9a521" metalness={0.4} roughness={0.7} />
            </Box>

            {/* 경사진 전/후면 커버 (투박한 느낌) */}
            <Box args={[2.4, 1.2, 0.4]} position={[0, 1.6, 1.1]} rotation={[Math.PI / 6, 0, 0]}>
                <meshStandardMaterial color="#b38719" />
            </Box>
            <Box args={[2.4, 1.2, 0.4]} position={[0, 1.6, -1.1]} rotation={[-Math.PI / 6, 0, 0]}>
                <meshStandardMaterial color="#b38719" />
            </Box>

            {/* 파쇄 프레스 (가운데서 위아래로 움직임) */}
            <CrusherPress isActive={isActive} />

            {/* 측면 경고 줄무늬 */}
            <WarningStripes position={[1.35, 0.1, 0]} width={2.6} rotation={[0, Math.PI / 2, 0]} isRedWhite={false} />
            <WarningStripes position={[-1.35, 0.1, 0]} width={2.6} rotation={[0, -Math.PI / 2, 0]} isRedWhite={false} />
            
            {/* 컨트롤 패널 */}
            <ControlPanel position={[1.6, 0, 1.0]} rotation={[0, Math.PI / 4, 0]} />
        </group>
    );
}

function CrusherPress({ isActive }) {
    const pressRef = React.useRef();
    useFrame((state) => {
        if (pressRef.current) {
            if (isActive) {
                const t = (state.clock.getElapsedTime() * 8) % Math.PI;
                pressRef.current.position.y = 1.6 - Math.abs(Math.sin(t)) * 0.8;
            } else {
                pressRef.current.position.y = 1.6;
            }
        }
    });
    return (
        <group ref={pressRef}>
            <Box args={[1.0, 0.8, 1.0]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#333" metalness={0.8} />
            </Box>
        </group>
    );
}

function CleaningMachine({ isActive }) {
    return (
        <group>
            {/* 좌/우 초록 벽 */}
            <Box args={[0.6, 2.4, 2.6]} position={[0.9, 1.2, 0]}>
                <meshStandardMaterial color="#2e7d32" metalness={0.3} roughness={0.8} />
            </Box>
            <Box args={[0.6, 2.4, 2.6]} position={[-0.9, 1.2, 0]}>
                <meshStandardMaterial color="#2e7d32" metalness={0.3} roughness={0.8} />
            </Box>
            
            {/* 두꺼운 배관 장식 */}
            <mesh position={[1.3, 1.2, 0]}>
                <cylinderGeometry args={[0.2, 0.2, 2.2, 16]} />
                <meshStandardMaterial color="#999" metalness={0.8} />
            </mesh>

            {/* 거대한 상단 물탱크 (사각) */}
            <Box args={[2.4, 1.0, 2.6]} position={[0, 2.9, 0]}>
                <meshStandardMaterial color="#1b5e20" />
            </Box>

            {/* 세척 물줄기 효과 (내부) */}
            {isActive && (
                <Box args={[1.4, 1.4, 1.4]} position={[0, 0.8, 0]}>
                    <meshStandardMaterial color="#00aaff" transparent opacity={0.3} emissive="#00aaff" emissiveIntensity={0.5} />
                </Box>
            )}

            <WarningStripes position={[1.25, 0.1, 0]} width={2.6} rotation={[0, Math.PI / 2, 0]} isRedWhite={false} />
            <WarningStripes position={[-1.25, 0.1, 0]} width={2.6} rotation={[0, -Math.PI / 2, 0]} isRedWhite={false} />
            
            <ControlPanel position={[1.6, 0, 1.0]} rotation={[0, Math.PI / 4, 0]} />
        </group>
    );
}

function DryingMachine({ isActive }) {
    return (
        <group>
            {/* 진회색 철갑 바디 */}
            <Box args={[0.8, 2.2, 2.8]} position={[0.9, 1.1, 0]}>
                <meshStandardMaterial color="#444" metalness={0.7} roughness={0.5} />
            </Box>
            <Box args={[0.8, 2.2, 2.8]} position={[-0.9, 1.1, 0]}>
                <meshStandardMaterial color="#444" metalness={0.7} roughness={0.5} />
            </Box>
            
            {/* 오렌지색 지붕 (히터 팩) */}
            <Box args={[2.6, 0.8, 2.8]} position={[0, 2.6, 0]}>
                <meshStandardMaterial color="#d84315" metalness={0.4} />
            </Box>

            {/* 내부 발열판 */}
            <Box args={[1.2, 1.8, 2.4]} position={[0, 1.1, 0]}>
                <meshStandardMaterial color="#111" />
            </Box>
            {isActive && (
                <Box args={[1.0, 1.6, 2.2]} position={[0, 1.1, 0]}>
                    <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={1.5} transparent opacity={0.8} />
                </Box>
            )}

            <WarningStripes position={[1.35, 0.1, 0]} width={2.8} rotation={[0, Math.PI / 2, 0]} isRedWhite={true} />
            <WarningStripes position={[-1.35, 0.1, 0]} width={2.8} rotation={[0, -Math.PI / 2, 0]} isRedWhite={true} />
            
            <ControlPanel position={[-1.6, 0, 1.0]} rotation={[0, -Math.PI / 4, 0]} />
        </group>
    );
}

function PackagingMachine({ isActive }) {
    return (
        <group>
            {/* 하얀색 두꺼운 벽 */}
            <Box args={[0.7, 2.0, 2.6]} position={[0.85, 1.0, 0]}>
                <meshStandardMaterial color="#e0e0e0" metalness={0.2} roughness={0.8} />
            </Box>
            <Box args={[0.7, 2.0, 2.6]} position={[-0.85, 1.0, 0]}>
                <meshStandardMaterial color="#e0e0e0" metalness={0.2} roughness={0.8} />
            </Box>

            {/* 녹색 프레임 지붕 */}
            <Box args={[2.4, 0.6, 2.6]} position={[0, 2.3, 0]}>
                <meshStandardMaterial color="#2e7d32" />
            </Box>

            {/* 전면 롤 (비닐/종이) - 실린더 가로로 배치 */}
            <mesh position={[0, 2.3, 1.0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.4, 0.4, 2.0, 16]} />
                <meshStandardMaterial color="#cda434" roughness={0.9} /> {/* 갈색 종이 롤 느낌 */}
            </mesh>

            <WarningStripes position={[1.25, 0.1, 0]} width={2.6} rotation={[0, Math.PI / 2, 0]} isRedWhite={false} />
            <WarningStripes position={[-1.25, 0.1, 0]} width={2.6} rotation={[0, -Math.PI / 2, 0]} isRedWhite={false} />
            
            <ControlPanel position={[1.5, 0, -1.0]} rotation={[0, Math.PI / 4 * 3, 0]} />
        </group>
    );
}
// ─── 공장 기계 메인 ────────────────────────────────────────────────────────────
export function Machine({ placedMachines = [], movingItems = [] }) {
    return (
        <group>
            {placedMachines.map((cfg) => {
                const processingItem = movingItems.find(i => i.machineId === cfg.id && i.status === 'PROCESSING');
                const isActive = !!processingItem;
                const progress = processingItem ? processingItem.machineProgress : 0;

                return (
                    <group key={cfg.id} position={cfg.position} rotation={cfg.rotation}>

                        {/* ── 하단 공통 베이스 플레이트 (판매존 제외) ─────── */}
                        {cfg.type !== 'SHIPPING_BIN' && (
                            <Box args={[2.6, 0.25, 3.1]} position={[0, 0.12, 0]}>
                                <meshStandardMaterial color="#2a2a2a" metalness={1} roughness={0.2} />
                            </Box>
                        )}

                        {/* ── 기계 종류별 투박한 렌더링 ────────── */}
                        {cfg.type === 'SORTING' && <SortingMachine isActive={isActive} />}
                        {cfg.type === 'CRUSHING' && <CrushingMachine isActive={isActive} />}
                        {cfg.type === 'CLEANING' && <CleaningMachine isActive={isActive} />}
                        {cfg.type === 'DRYING' && <DryingMachine isActive={isActive} />}
                        {cfg.type === 'PACKAGING' && <PackagingMachine isActive={isActive} />}
                        {cfg.type === 'SHIPPING_BIN' && <ShippingBin position={[0, 0, 0]} />}

                        {/* ── 입구 / 출구 공통 터널 가이드 (판매존 제외) ────────── */}
                        {cfg.type !== 'SHIPPING_BIN' && (
                            <>
                                <Box args={[1.8, 0.6, 0.18]} position={[0, 0.55, 1.5]}>
                                    <meshStandardMaterial color="#444" metalness={0.8} />
                                </Box>
                                <Box args={[1.8, 0.6, 0.18]} position={[0, 0.55, -1.5]}>
                                    <meshStandardMaterial color="#444" metalness={0.8} />
                                </Box>
                            </>
                        )}

                        {/* ── 좌측 측면 모니터 암 부착형 전광판 (판매존 제외) ──────── */}
                        {cfg.type !== 'SHIPPING_BIN' && (
                            <group position={[-1.9, 1.8, 0.6]} rotation={[0, Math.PI / 12, 0]} scale={0.5}>
                                <Box args={[1.6, 0.2, 0.2]} position={[0.8, 0, -0.1]}>
                                    <meshStandardMaterial color="#222" metalness={0.8} />
                                </Box>
                                <mesh position={[0, 0, -0.1]}>
                                    <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
                                    <meshStandardMaterial color="#111" />
                                </mesh>
                                <Box args={[2.2, 1.2, 0.2]} position={[0, 0.5, 0]}>
                                    <meshStandardMaterial color="#222" metalness={0.8} roughness={0.6} />
                                </Box>
                                <Box args={[1.8, 0.2, 0.05]} position={[0, 0.15, 0.11]}>
                                    <meshStandardMaterial color="#000" />
                                </Box>
                                {isActive && (
                                    <Box
                                        args={[1.7 * (progress / 100), 0.1, 0.06]}
                                        position={[(-0.85 + 0.85 * (progress / 100)), 0.15, 0.12]}
                                    >
                                        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} />
                                    </Box>
                                )}
                                <group position={[-0.6, 0.7, 0.11]}>
                                    <mesh>
                                        <circleGeometry args={[0.22, 32]} />
                                        <meshStandardMaterial color="#ddd" />
                                    </mesh>
                                    <mesh position={[0, 0, 0.01]}>
                                        <ringGeometry args={[0.16, 0.2, 16, 1, 0, Math.PI]} />
                                        <meshBasicMaterial color="#333" />
                                    </mesh>
                                    <group rotation={[0, 0, Math.PI - (isActive ? (progress / 100) * Math.PI : 0)]}>
                                        <Box args={[0.18, 0.03, 0.02]} position={[0.09, 0, 0.02]}>
                                            <meshStandardMaterial color="red" />
                                        </Box>
                                    </group>
                                </group>
                                <Text position={[0.2, 0.7, 0.12]} fontSize={0.35} color="white" maxWidth={1.2} textAlign="center" fontWeight="bold">
                                    {cfg.type}
                                </Text>
                                <Box args={[0.15, 0.15, 0.1]} position={[0.9, 0.95, 0.1]}>
                                    <meshStandardMaterial color={isActive ? '#00ff00' : '#444'} emissive={isActive ? '#00ff00' : 'black'} emissiveIntensity={isActive ? 1.5 : 0} />
                                </Box>
                            </group>
                        )}
                    </group>
                );
            })}
        </group>
    );
}
