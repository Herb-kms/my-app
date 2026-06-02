import React, { useState, useRef } from 'react';
import { Box, Text, Float, Billboard } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { ShippingBin } from './EnvironmentComponents';
import { MACHINE_CONFIGS } from '../../data/constants';

// ========================================================================
// 헬퍼 함수
// ========================================================================
/**
 * 기계와 벨트의 rotation(회전값)을 Three.js가 인식할 수 있는 배열 형식[x, y, z]으로 정규화합니다.
 * Y축(좌우 회전) 하나만 숫자로 들어올 경우를 대비한 유틸리티입니다.
 */
function toEuler(r) {
    if (Array.isArray(r)) return r;
    if (typeof r === 'number') return [0, r, 0];
    return [0, 0, 0];
}

// ========================================================================
// 1. 컨베이어 벨트 (ConveyorBelt)
// ========================================================================
/**
 * 맵에 설치된 모든 컨베이어 벨트들을 렌더링하는 컴포넌트입니다.
 * 방향 화살표에 emissive(발광) 속성을 주어 기계적인 네온 느낌을 살렸습니다.
 */
export function ConveyorBelt({ placedBelts = [] }) {
    return (
        <group>
            {placedBelts.map((belt) => (
                <group key={belt.id} position={belt.position} rotation={toEuler(belt.rotation)}>
                    {/* 벨트 표면 (고무 재질 느낌의 짙은 회색) */}
                    <Box args={[2.45, 0.08, 2.45]} position={[0, 0.04, 0]} receiveShadow>
                        <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
                    </Box>

                    {/* 테두리 금속 프레임 */}
                    <Box args={[2.5, 0.12, 2.5]} position={[0, -0.02, 0]}>
                        <meshStandardMaterial color="#2a2a2a" metalness={1} roughness={0.1} />
                    </Box>

                    {/* 중앙 방향 표시 화살표 (네온 청록색, 진행 방향인 -Z 방향을 가리킴) */}
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

// ========================================================================
// 2. 재사용 가능한 공용 기계 부품들 (유틸리티 컴포넌트)
// ========================================================================


/**
 * 기계 하단에 둘러쳐지는 공사현장 스타일의 위험 경고 띠(노랑-검정 또는 빨강-흰색)입니다.
 * 팩토리 시뮬레이션 특유의 인더스트리얼한 분위기를 더해줍니다.
 */
function WarningStripes({ position, width, rotation = [0, 0, 0], isRedWhite = true }) {
    const numStripes = Math.floor(width / 0.2);
    const color1 = isRedWhite ? "#dd2222" : "#222222";
    const color2 = isRedWhite ? "#ffffff" : "#ddcc00";

    return (
        <group position={position} rotation={rotation}>
            {Array.from({ length: numStripes }).map((_, i) => (
                <Box key={i} args={[0.2, 0.15, 0.05]} position={[-width / 2 + i * 0.2 + 0.1, 0, 0]}>
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

// ========================================================================
// 3. 개별 기계 블록 (디자인 및 애니메이션)
// ========================================================================

/**
 * 1. 자동 분류기 (Sorting Machine)
 * 위쪽의 스캐너가 좌우로 움직이며 레이저를 쏩니다.
 */
function SortingMachine({ isActive }) {
    const scannerRef = React.useRef();
    useFrame((state) => {
        if (isActive && scannerRef.current) {
            scannerRef.current.position.x = Math.sin(state.clock.elapsedTime * 5) * 0.5;
        }
    });
    return (
        <group>
            {/* Main Base Frame */}
            <Box args={[2.4, 0.4, 2.8]} position={[0, 0.2, 0]}><meshStandardMaterial color="#141414" metalness={0.8} /></Box>
            {/* Vertical Supports */}
            <Box args={[0.2, 1.0, 0.2]} position={[1.1, 0.7, 1.3]}><meshStandardMaterial color="#2d6299" /></Box>
            <Box args={[0.2, 1.0, 0.2]} position={[-1.1, 0.7, 1.3]}><meshStandardMaterial color="#2d6299" /></Box>
            <Box args={[0.2, 1.0, 0.2]} position={[1.1, 0.7, -1.3]}><meshStandardMaterial color="#2d6299" /></Box>
            <Box args={[0.2, 1.0, 0.2]} position={[-1.1, 0.7, -1.3]}><meshStandardMaterial color="#2d6299" /></Box>

            {/* Scanner Arch */}
            <Box args={[2.4, 0.4, 1.0]} position={[0, 2.2, 0]}><meshStandardMaterial color="#1e1e1e" metalness={0.6} /></Box>
            <Box args={[0.4, 1.0, 1.0]} position={[1.0, 1.5, 0]}><meshStandardMaterial color="#2a2a2a" metalness={0.6} /></Box>
            <Box args={[0.4, 1.0, 1.0]} position={[-1.0, 1.5, 0]}><meshStandardMaterial color="#2a2a2a" metalness={0.6} /></Box>

            {/* Moving Scanner Head */}
            <group position={[0, 1.9, 0]} ref={scannerRef}>
                <Box args={[0.6, 0.2, 0.6]}><meshStandardMaterial color="#2d2d2d" /></Box>
                {/* Laser beam */}
                {isActive && (
                    <mesh position={[0, -0.6, 0]}>
                        <cylinderGeometry args={[0.05, 0.8, 1.2, 16]} />
                        <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} transparent opacity={0.4} />
                    </mesh>
                )}
            </group>

            {/* Side Panels */}
            <Box args={[2.4, 1.0, 0.1]} position={[0, 0.7, 1.4]}><meshStandardMaterial color="#2d6299" metalness={0.4} /></Box>
            <Box args={[2.4, 1.0, 0.1]} position={[0, 0.7, -1.4]}><meshStandardMaterial color="#2d6299" metalness={0.4} /></Box>

            <WarningStripes position={[1.35, 0.1, 0]} width={2.8} rotation={[0, Math.PI / 2, 0]} isRedWhite={true} />
            <WarningStripes position={[-1.35, 0.1, 0]} width={2.8} rotation={[0, -Math.PI / 2, 0]} isRedWhite={true} />
            <ControlPanel position={[-1.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
        </group>
    );
}

/**
 * 2. 압착 파쇄기 (Crushing Machine)
 * 두 개의 거대한 롤러가 서로 반대 방향으로 회전하며 아이템을 으깨는 애니메이션을 보여줍니다.
 */
function CrushingMachine({ isActive }) {
    const roller1Ref = React.useRef();
    const roller2Ref = React.useRef();
    useFrame((state) => {
        if (isActive) {
            if (roller1Ref.current) roller1Ref.current.rotation.x += 0.15;
            if (roller2Ref.current) roller2Ref.current.rotation.x -= 0.15;
        }
    });

    return (
        <group>
            <Box args={[2.2, 0.6, 2.6]} position={[0, 0.3, 0]}><meshStandardMaterial color="#1e1e1e" metalness={0.8} /></Box>
            <Box args={[0.6, 2.2, 2.4]} position={[0.8, 1.7, 0]}><meshStandardMaterial color="#997a00" metalness={0.4} roughness={0.7} /></Box>
            <Box args={[0.6, 2.2, 2.4]} position={[-0.8, 1.7, 0]}><meshStandardMaterial color="#997a00" metalness={0.4} roughness={0.7} /></Box>

            {/* Top Hopper (Funnel) 깔때기 */}
            <group position={[0, 2.8, 0]}>
                <Box args={[2.0, 0.6, 0.2]} position={[0, 0.3, 1.1]} rotation={[Math.PI / 6, 0, 0]}><meshStandardMaterial color="#665200" /></Box>
                <Box args={[2.0, 0.6, 0.2]} position={[0, 0.3, -1.1]} rotation={[-Math.PI / 6, 0, 0]}><meshStandardMaterial color="#665200" /></Box>
            </group>

            {/* Crush Rollers 톱니바퀴 롤러 */}
            <group position={[0, 1.5, 0]}>
                <mesh ref={roller1Ref} position={[0, 0, 0.4]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.3, 0.3, 1.6, 12]} />
                    <meshStandardMaterial color="#555" metalness={0.9} roughness={0.4} />
                </mesh>
                <mesh ref={roller2Ref} position={[0, 0, -0.4]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.3, 0.3, 1.6, 12]} />
                    <meshStandardMaterial color="#555" metalness={0.9} roughness={0.4} />
                </mesh>
            </group>

            <Box args={[1.0, 1.0, 2.4]} position={[0, 1.5, 0]}><meshStandardMaterial color="#111" transparent opacity={0.3} wireframe /></Box>
            <WarningStripes position={[1.35, 0.1, 0]} width={2.6} rotation={[0, Math.PI / 2, 0]} isRedWhite={false} />
            <WarningStripes position={[-1.35, 0.1, 0]} width={2.6} rotation={[0, -Math.PI / 2, 0]} isRedWhite={false} />
            <ControlPanel position={[1.6, 0, 1.0]} rotation={[0, Math.PI / 4, 0]} />
        </group>
    );
}

/**
 * 3. 고압 세척기 (Cleaning Machine)
 * 투명한 원통형 물탱크 안에서 브러시가 회전하며, 가동 중엔 흰색 반투명 박스로 물보라 효과를 냅니다.
 */
function CleaningMachine({ isActive }) {
    const brushRef = React.useRef();
    useFrame(() => {
        if (isActive && brushRef.current) brushRef.current.rotation.z += 0.2;
    });

    return (
        <group>
            <Box args={[2.4, 0.8, 2.6]} position={[0, 0.4, 0]}><meshStandardMaterial color="#111111" metalness={0.5} /></Box>

            {/* Main Body Cylindrical Tank */}
            <mesh position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[1.2, 1.2, 2.4, 32]} />
                <meshStandardMaterial color="#00b38f" metalness={0.3} roughness={0.2} transparent opacity={0.6} />
            </mesh>

            {/* Metal Rings around Tank */}
            <mesh position={[0, 1.6, 1.0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.22, 0.05, 16, 32]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>
            <mesh position={[0, 1.6, -1.0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[1.22, 0.05, 16, 32]} /><meshStandardMaterial color="#333" metalness={0.8} /></mesh>

            {/* Top Water Pipe */}
            <mesh position={[0, 2.9, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.15, 0.15, 2.6, 16]} /><meshStandardMaterial color="#444" metalness={0.9} /></mesh>
            <mesh position={[1.2, 2.3, 0]}><cylinderGeometry args={[0.15, 0.15, 1.2, 16]} /><meshStandardMaterial color="#444" metalness={0.9} /></mesh>

            {/* Internal Brushes */}
            <mesh ref={brushRef} position={[0, 1.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.8, 0.8, 2.0, 16]} />
                <meshStandardMaterial color="#00aa88" wireframe />
            </mesh>

            {/* Splashing Water Effect */}
            {isActive && (
                <Box args={[1.8, 1.8, 2.0]} position={[0, 1.6, 0]}>
                    <meshStandardMaterial color="#ffffff" transparent opacity={0.2} />
                </Box>
            )}

            <WarningStripes position={[1.35, 0.1, 0]} width={2.8} rotation={[0, Math.PI / 2, 0]} isRedWhite={false} />
            <WarningStripes position={[-1.35, 0.1, 0]} width={2.8} rotation={[0, -Math.PI / 2, 0]} isRedWhite={false} />
            <ControlPanel position={[1.6, 0, 1.0]} rotation={[0, Math.PI / 4, 0]} />
        </group>
    );
}

/**
 * 4. 열풍 건조기 (Drying Machine)
 * 검붉은 화로 느낌이며 전면에 달린 환풍기(팬)가 돌아가고 가동 시 붉은 발열판이 점등됩니다.
 */
function DryingMachine({ isActive }) {
    const fanRef = React.useRef();
    useFrame(() => {
        if (isActive && fanRef.current) fanRef.current.rotation.z += 0.3;
    });

    return (
        <group>
            <Box args={[2.0, 2.4, 2.8]} position={[0, 1.2, 0]}><meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.8} /></Box>
            <mesh position={[0.6, 2.8, 0]}><cylinderGeometry args={[0.3, 0.3, 1.0, 16]} /><meshStandardMaterial color="#333" metalness={0.7} /></mesh>
            <mesh position={[0.6, 3.2, 0.2]} rotation={[Math.PI / 4, 0, 0]}><cylinderGeometry args={[0.3, 0.3, 0.6, 16]} /><meshStandardMaterial color="#333" metalness={0.7} /></mesh>

            <Box args={[2.05, 0.2, 2.85]} position={[0, 2.2, 0]}><meshStandardMaterial color="#b33c00" metalness={0.3} /></Box>
            <Box args={[2.05, 0.2, 2.85]} position={[0, 0.4, 0]}><meshStandardMaterial color="#b33c00" metalness={0.3} /></Box>

            {/* Front Grill / Fan */}
            <group position={[0, 1.4, 1.45]}>
                <mesh><torusGeometry args={[0.6, 0.05, 16, 32]} /><meshStandardMaterial color="#222" /></mesh>
                <group ref={fanRef}>
                    <Box args={[1.1, 0.1, 0.05]}><meshStandardMaterial color="#111" /></Box>
                    <Box args={[0.1, 1.1, 0.05]}><meshStandardMaterial color="#111" /></Box>
                </group>
                {isActive && (
                    <mesh position={[0, 0, -0.1]}>
                        <circleGeometry args={[0.55, 32]} />
                        <meshStandardMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={1.5} transparent opacity={0.6} />
                    </mesh>
                )}
            </group>

            <WarningStripes position={[1.35, 0.1, 0]} width={2.8} rotation={[0, Math.PI / 2, 0]} isRedWhite={true} />
            <WarningStripes position={[-1.35, 0.1, 0]} width={2.8} rotation={[0, -Math.PI / 2, 0]} isRedWhite={true} />
            <ControlPanel position={[-1.6, 0, 1.0]} rotation={[0, -Math.PI / 4, 0]} />
        </group>
    );
}

/**
 * 5. 최종 포장기 (Packaging Machine)
 * 깨끗한 흰색/보라색 톤을 썼으며 상단의 비닐 롤러가 돌아가고 레이저 커팅 암(arm)이 위아래로 움직입니다.
 */
function PackagingMachine({ isActive }) {
    const spoolRef = React.useRef();
    const armRef = React.useRef();
    useFrame((state) => {
        if (isActive) {
            if (spoolRef.current) spoolRef.current.rotation.x += 0.05;
            if (armRef.current) armRef.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.3;
        }
    });

    return (
        <group>
            <Box args={[2.2, 1.0, 2.6]} position={[0, 0.5, 0]}><meshStandardMaterial color="#666666" metalness={0.2} roughness={0.3} /></Box>
            <Box args={[2.4, 0.1, 2.8]} position={[0, 1.05, 0]}><meshStandardMaterial color="#a04cd0" metalness={0.4} /></Box>
            <Box args={[2.2, 1.8, 0.6]} position={[0, 2.0, -1.0]}><meshStandardMaterial color="#888" metalness={0.3} /></Box>

            {/* Top Spool of Wrap */}
            <group position={[0, 3.2, -1.0]}>
                <mesh position={[-1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 0.2, 16]} /><meshStandardMaterial color="#222" /></mesh>
                <mesh position={[1.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.1, 0.1, 0.2, 16]} /><meshStandardMaterial color="#222" /></mesh>
                <mesh ref={spoolRef} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.6, 0.6, 2.2, 32]} />
                    <meshStandardMaterial color="#bbb" transparent opacity={0.7} />
                </mesh>
            </group>

            {/* Wrapping Arm */}
            <group position={[0, 1.8, 0.2]} ref={armRef}>
                <Box args={[1.8, 0.1, 1.4]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#555" metalness={0.8} transparent opacity={0.5} wireframe />
                </Box>
                <Box args={[1.8, 0.05, 0.05]} position={[0, -0.4, 0]}>
                    <meshStandardMaterial color="#a04cd0" emissive="#a04cd0" emissiveIntensity={isActive ? 1 : 0} />
                </Box>
            </group>

            {/* Package Output Box Placeholder */}
            {isActive && (
                <Box args={[0.8, 0.6, 0.8]} position={[0, 1.4, 0.2]}>
                    <meshStandardMaterial color="#aaa" />
                </Box>
            )}

            <WarningStripes position={[1.35, 0.1, 0]} width={3.0} rotation={[0, Math.PI / 2, 0]} isRedWhite={false} />
            <WarningStripes position={[-1.35, 0.1, 0]} width={3.0} rotation={[0, -Math.PI / 2, 0]} isRedWhite={false} />
            <ControlPanel position={[1.6, 0, -1.0]} rotation={[0, Math.PI / 4 * 3, 0]} />
        </group>
    );
}

// ========================================================================
// 4. 기계 컨테이너 / 로직 통합부 (MachineItem)
// ========================================================================

/**
 * 맵에 배치된 기계 하나를 관리하는 래퍼 컴포넌트입니다.
 * 기계 내부의 가공률(progress) 데이터를 받아 측면 전광판 게이지를 그려주고,
 * 플레이어가 근처에 다가왔을 때 3D 홀로그램 이름을 띄우는 거리 측정 로직을 포함합니다.
 */
function MachineItem({ cfg, movingItems }) {
    // 이 기계 안에서 가공 중인(PROCESSING) 아이템이 있는지 검사합니다.
    const processingItem = movingItems.find(i => i.machineId === cfg.id && i.status === 'PROCESSING');
    const isActive = !!processingItem;
    const progress = processingItem ? processingItem.machineProgress : 0;

    // 기계의 종류별 시그니처 컬러
    const STAGE_COLORS = {
        'SORTING': '#55aaff',
        'CRUSHING': '#ffcc00',
        'CLEANING': '#00ffcc',
        'DRYING': '#ff5500',
        'PACKAGING': '#d477ff'
    };
    const themeColor = STAGE_COLORS[cfg.type] || '#00ffcc';

    // 가까이 다가갔을 때 이름 띄우기를 위한 상태들
    const [showLabel, setShowLabel] = useState(false);
    const triggerTime = useRef(0);
    const hasTriggered = useRef(false);

    // 매 프레임마다 카메라(플레이어 눈)와 기계 사이의 물리적 거리를 계산합니다.
    useFrame((state) => {
        const cp = state.camera.position;
        const mp = cfg.position;
        // 피타고라스 3D 거리 공식
        const dist = Math.sqrt(Math.pow(cp.x - mp[0], 2) + Math.pow(cp.y - mp[1], 2) + Math.pow(cp.z - mp[2], 2));

        if (dist < 6.0) { // 반경 6m 이내로 들어왔을 때
            if (!hasTriggered.current) {
                // 방금 막 진입했으면 홀로그램을 켜고 시간을 기록
                hasTriggered.current = true;
                triggerTime.current = state.clock.elapsedTime;
                setShowLabel(true);
            }
            // 진입하고 나서 3초가 지났다면 시야가 가리지 않도록 홀로그램을 서서히 지움
            if (showLabel && state.clock.elapsedTime - triggerTime.current > 3.0) {
                setShowLabel(false);
            }
        } else {
            // 거리가 멀어지면 플래그를 초기화하여 나중에 다시 다가왔을 때 뜰 수 있게 함
            hasTriggered.current = false;
            if (showLabel) setShowLabel(false);
        }
    });

    return (
        <group position={cfg.position} rotation={toEuler(cfg.rotation)}>

            {/* 플레이어가 근처로 다가갔을 때 위에 뜨는 3D 홀로그램 기계 이름표 */}
            {showLabel && cfg.type !== 'SHIPPING_BIN' && (
                <Float speed={4} rotationIntensity={0} floatIntensity={0.5} position={[0, 4.0, 0]}>
                    <Billboard>
                        <Text
                            fontSize={0.6}
                            color={themeColor}
                            outlineWidth={0.03}
                            outlineColor="#000000"
                            fontWeight="bold"
                        >
                            {MACHINE_CONFIGS[cfg.type]?.label || cfg.type}
                        </Text>
                    </Billboard>
                </Float>
            )}

            {/* 모든 기계가 공통으로 딛고 있는 검은색 하단 베이스 플레이트 */}
            {cfg.type !== 'SHIPPING_BIN' && (
                <Box args={[2.6, 0.25, 3.1]} position={[0, 0.12, 0]}>
                    <meshStandardMaterial color="#2a2a2a" metalness={1} roughness={0.2} />
                </Box>
            )}

            {/* 기계 타입에 맞는 모델링 매핑 */}
            {cfg.type === 'SORTING' && <SortingMachine isActive={isActive} />}
            {cfg.type === 'CRUSHING' && <CrushingMachine isActive={isActive} />}
            {cfg.type === 'CLEANING' && <CleaningMachine isActive={isActive} />}
            {cfg.type === 'DRYING' && <DryingMachine isActive={isActive} />}
            {cfg.type === 'PACKAGING' && <PackagingMachine isActive={isActive} />}
            {cfg.type === 'SHIPPING_BIN' && <ShippingBin position={[0, 0, 0]} />}

            {/* 입구 / 출구 쪽에 달린 회색 공통 띠 가이드 */}
            {cfg.type !== 'SHIPPING_BIN' && (
                <>
                    <Box args={[1.8, 0.6, 0.18]} position={[0, 0.55, 1.5]}><meshStandardMaterial color="#444" metalness={0.8} /></Box>
                    <Box args={[1.8, 0.6, 0.18]} position={[0, 0.55, -1.5]}><meshStandardMaterial color="#444" metalness={0.8} /></Box>
                </>
            )}

            {/* 
                기계 측면 하단에 부착된 하드웨어 UI 모니터 시스템 
                (가상 UI창 대신 실제 3D 모델에 전광판을 달아 높은 몰입감을 제공)
            */}
            {cfg.type !== 'SHIPPING_BIN' && (
                // 기계 왼쪽 옆면(X: -1.35)을 보도록 회전(-Math.PI / 2)시켜서 부착
                <group position={[-1.35, 0.8, 0]} rotation={[0, -Math.PI / 2, 0]} scale={0.6}>
                    {/* 모니터 검은 베젤 바탕 */}
                    <Box args={[2.2, 1.2, 0.2]} position={[0, 0, 0]}>
                        <meshStandardMaterial color="#222" metalness={0.8} roughness={0.6} />
                    </Box>

                    {/* 하단 진척도(Progress) 게이지 바의 빈 배경 */}
                    <Box args={[1.8, 0.2, 0.05]} position={[0, -0.35, 0.11]}>
                        <meshStandardMaterial color="#000" />
                    </Box>

                    {/* 실제 차오르는 진척도 게이지 바 (progress 퍼센트에 비례해 폭이 길어짐) */}
                    {isActive && (
                        <Box
                            args={[1.7 * (progress / 100), 0.1, 0.06]}
                            position={[(-0.85 + 0.85 * (progress / 100)), -0.35, 0.12]}
                        >
                            {/* 발광(emissive) 효과로 실제 LED 전광판처럼 빛남 */}
                            <meshStandardMaterial color={themeColor} emissive={themeColor} emissiveIntensity={2} />
                        </Box>
                    )}

                    {/* 아날로그 속도계 (RPM 게이지) 모형 */}
                    <group position={[-0.6, 0.2, 0.11]}>
                        <mesh><circleGeometry args={[0.22, 32]} /><meshStandardMaterial color="#ddd" /></mesh>
                        <mesh position={[0, 0, 0.01]}><ringGeometry args={[0.16, 0.2, 16, 1, 0, Math.PI]} /><meshBasicMaterial color="#333" /></mesh>
                        {/* 작동 퍼센트에 따라 빨간 바늘이 회전함 */}
                        <group rotation={[0, 0, Math.PI - (isActive ? (progress / 100) * Math.PI : 0)]}>
                            <Box args={[0.18, 0.03, 0.02]} position={[0.09, 0, 0.02]}><meshStandardMaterial color="red" /></Box>
                        </group>
                    </group>

                    {/* 모니터에 출력되는 기계 한글 이름 */}
                    <Text position={[0.2, 0.2, 0.12]} fontSize={0.35} color="white" maxWidth={1.2} textAlign="center" fontWeight="bold">
                        {MACHINE_CONFIGS[cfg.type]?.label || cfg.type}
                    </Text>

                    {/* 우측 하단 작동 상태 알림 LED 등 (켜지면 초록색 발광, 꺼지면 짙은 회색) */}
                    <Box args={[0.15, 0.15, 0.1]} position={[0.9, 0.45, 0.1]}>
                        <meshStandardMaterial color={isActive ? '#00ff00' : '#444'} emissive={isActive ? '#00ff00' : 'black'} emissiveIntensity={isActive ? 1.5 : 0} />
                    </Box>
                </group>
            )}
        </group>
    );
}

// ========================================================================
// 5. 엔트리 포인트 (전체 묶음)
// ========================================================================
/**
 * 씬에서 호출되는 최상위 부모입니다. 모든 배치된 기계 정보(placedMachines)를 받아
 * 각각의 MachineItem들을 렌더링합니다.
 */
export function Machine({ placedMachines = [], movingItems = [] }) {
    return (
        <group>
            {placedMachines.map((cfg) => (
                <MachineItem key={cfg.id} cfg={cfg} movingItems={movingItems} />
            ))}
        </group>
    );
}
