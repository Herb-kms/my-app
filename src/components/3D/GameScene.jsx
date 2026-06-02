import React, { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { KeyboardControls, PerspectiveCamera, Stars, ContactShadows, Environment, Text, Float, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { Physics } from '@react-three/cannon';

import { Machine, ConveyorBelt } from './MachineComponents';
import { TrashItem } from './ItemComponents';
import { Floor, PropComponents, BackgroundBuildings, CityGridDecorations, FactoryBuilding } from './EnvironmentComponents';
import { BuilderController } from './BuilderComponents';
import { Player, PlayerController, FirstPersonHeldItem } from './PlayerComponents';

// ========================================================================
// 1. 키보드 컨트롤 매핑 설정
// ========================================================================
// @react-three/drei의 KeyboardControls에서 사용할 키 목록을 정의합니다.
// WASD와 방향키를 모두 지원하도록 설정되어 있습니다.
const keyMap = [
    { name: 'forward',  keys: ['ArrowUp',    'KeyW'] },
    { name: 'backward', keys: ['ArrowDown',  'KeyS'] },
    { name: 'left',     keys: ['ArrowLeft',  'KeyA'] },
    { name: 'right',    keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump',     keys: ['Space'] },
];

// ========================================================================
// 2. 마우스 포인터 잠금 핸들러 (PointerLockHandler)
// ========================================================================
/**
 * 1인칭 화면 제어를 위해 마우스를 캔버스 안에 가두는(Lock) 기능을 담당합니다.
 * drei 라이브러리의 내장 PointerLockControls를 쓰지 않고 직접 구현한 이유는,
 * React 컴포넌트가 언마운트되거나 UI 창(인벤토리 등)을 띄우기 위해 Lock을 강제로 해제할 때
 * DOM(Document Object Model)에서 발생하는 충돌 에러를 완벽하게 제어하고 회피하기 위함입니다.
 */
function PointerLockHandler({ isUIOpen, canLock, onUnlock }) {
    const { gl } = useThree();

    useEffect(() => {
        // 인벤토리나 설정창 등 UI가 열리면 마우스 포인터 잠금을 즉시 해제하여 마우스를 쓸 수 있게 합니다.
        if (isUIOpen || !canLock) {
            try {
                if (document.pointerLockElement) {
                    document.exitPointerLock();
                }
            } catch (e) { /* 무시 */ }
            return;
        }

        // 게임 화면(Canvas)을 클릭했을 때 다시 마우스 포인터를 잠금 처리합니다.
        // 약간의 지연(100ms)을 주어 브라우저가 DOM 상태를 안정화할 시간을 벌어줍니다.
        const canvas = gl.domElement;
        const handleClick = () => {
            if (document.pointerLockElement === canvas) return;
            setTimeout(() => {
                try {
                    if (canvas.isConnected) {
                        canvas.requestPointerLock();
                    }
                } catch (e) {
                    console.warn('PointerLock 요청 실패 (DOM 연결 상태 확인 필요):', e.message);
                }
            }, 100);
        };

        // ESC키 등을 눌러 포인터 락이 풀렸을 때를 감지하는 이벤트
        const handleLockChange = () => {
            if (!document.pointerLockElement) {
                onUnlock && onUnlock();
            }
        };

        canvas.addEventListener('click', handleClick);
        document.addEventListener('pointerlockchange', handleLockChange);

        return () => {
            canvas.removeEventListener('click', handleClick);
            document.removeEventListener('pointerlockchange', handleLockChange);
            // 컴포넌트 언마운트 시 안전하게 해제
            try {
                if (document.pointerLockElement) document.exitPointerLock();
            } catch (e) { /* 무시 */ }
        };
    }, [isUIOpen, canLock, gl.domElement, onUnlock]);

    return null; // UI를 렌더링하지 않고 백그라운드 로직만 실행하는 컴포넌트입니다.
}

// ========================================================================
// 3. 시점(카메라) 기준 3D 홀로그램 경고창
// ========================================================================
/**
 * 아이템을 잘못된 위치에 놓으려고 할 때 플레이어의 눈앞(카메라 정면)에 띄워지는 3D 텍스트입니다.
 * 단순히 화면(UI)에 글씨를 박아넣는 게 아니라, 실제 3D 공간 상에 생성되기 때문에
 * 글씨가 뜨자마자 고개를 돌리면 글씨가 허공에 남아있는 입체적인 느낌(홀로그램 효과)을 줍니다.
 */
function ViewAlignedAlert({ text }) {
    const { camera } = useThree();
    
    // 컴포넌트가 처음 생성될 때(마운트) 현재 카메라의 위치와 시선 방향을 계산하여 저장합니다.
    const [spawnPos] = useState(() => {
        const dir = new THREE.Vector3();
        camera.getWorldDirection(dir); // 카메라가 현재 바라보는 방향 벡터를 가져옴
        
        // 카메라 위치에서 정면(dir)으로 1.2m 앞당긴 좌표를 계산
        const pos = camera.position.clone().add(dir.multiplyScalar(1.2));
        // 시야 정중앙을 가리지 않도록 위치를 살짝 아래로(-0.15) 내립니다.
        pos.y -= 0.15;
        return pos;
    });

    return (
        // Float: 텍스트가 위아래로 살짝씩 둥둥 떠다니는 애니메이션 효과
        <Float speed={4} rotationIntensity={0} floatIntensity={0.2} position={spawnPos}>
            {/* Billboard: 텍스트가 항상 플레이어의 카메라 방향을 쳐다보게 만들어 가독성을 유지 */}
            <Billboard>
                <Text
                    fontSize={0.12}
                    color="#ff3333"
                    outlineWidth={0.015}
                    outlineColor="#000000"
                    anchorY="bottom"
                    renderOrder={999} // 3D 물체들에 파묻히지 않고 제일 위에 그려지도록 설정
                    material-depthTest={false} // 거리상 다른 물체 뒤에 있더라도 무시하고 투과시켜서 렌더링
                    fontWeight="bold"
                >
                    {text}
                </Text>
            </Billboard>
        </Float>
    );
}

// ========================================================================
// 4. 메인 게임 씬 렌더링 (GameScene)
// ========================================================================
/**
 * 실제 3D 공간을 구성하고 모든 물리 엔진, 빛, 배경, 기계, 아이템, 플레이어를 배치하는 핵심 컴포넌트입니다.
 */
export function GameScene({
    settings,
    items,
    movingItems,
    worldAlerts,
    placedMachines,
    placedBelts,
    placedProps,
    buildMode,
    isHandFull,
    selectedItem,
    playerRef,
    playerPositionRef,
    canLock,
    handleUnlock,
    onPlaceItem,
    onDemolishItem,
    isInventoryOpen,
    isSettingsOpen,
    isBuildInventoryOpen,
}) {
    // UI 창이 하나라도 열려있으면 마우스 조작이나 카메라 이동을 막기 위한 상태
    const isUIOpen = isInventoryOpen || isSettingsOpen || isBuildInventoryOpen;

    return (
        <KeyboardControls map={keyMap}>
            <Canvas shadows gl={{ antialias: true }}>
                {/* 메인 카메라 설정: 1인칭(FOV 80)과 3인칭(FOV 60) 모드에 따라 시야각을 동적으로 바꿉니다. */}
                <PerspectiveCamera
                    makeDefault
                    position={[12, 5, 12]}
                    fov={settings.perspective === 'first' ? 80 : 60}
                    near={0.05}
                    far={1000}
                />

                {/* 환경 및 조명 설정 (어두운 사이버펑크 밤하늘과 네온 대비 조명) */}
                <color attach="background" args={['#050110']} />
                <fog attach="fog" args={['#050110', 25, 200]} />
                <Stars radius={120} depth={60} count={6000} factor={6} saturation={1} fade speed={1.5} />
                <Environment preset="city" /> {/* 금속 재질 등에 반사될 주변 환경 맵 */}
                <ambientLight intensity={0.4} color="#0d0a1f" />
                
                {/* 사이버펑크 시그니처 듀얼 컬러 네온 조명 (Cyan & Magenta) */}
                <directionalLight position={[-80, 50, -80]} intensity={1.5} color="#00ffff" />
                <directionalLight position={[80, 50, 80]} intensity={1.5} color="#ff00a0" />
                
                {/* 메인 작업등 */}
                <pointLight position={[10, 15, 10]} intensity={2.5} castShadow />

                <Suspense fallback={null}>
                    {/* 물리 엔진(Cannon.js) 래퍼: 이 안의 물체들은 중력과 충돌의 영향을 받습니다. */}
                    <Physics gravity={[0, -9.81, 0]}>
                        
                        {/* 맵 배경 (바닥 등) 및 장식용 구조물(드럼통, 벽 등) */}
                        <Floor />
                        <BackgroundBuildings />
                        <CityGridDecorations />
                        <FactoryBuilding />
                        <PropComponents placedProps={placedProps} />

                        {/* 사용자가 건설한 컨베이어 벨트와 공장 기계들 */}
                        <ConveyorBelt placedBelts={placedBelts} />
                        <Machine placedMachines={placedMachines} movingItems={movingItems} />

                        {/* 플레이어 캐릭터 렌더링 및 물리 충돌체 박스 */}
                        <Player
                            playerRef={playerRef}
                            perspective={settings.perspective}
                            selectedItem={selectedItem}
                        />
                        
                        {/* 플레이어의 움직임, 카메라 회전 등을 담당하는 컨트롤러 로직 */}
                        <PlayerController
                            playerRef={playerRef}
                            playerPositionRef={playerPositionRef}
                            perspective={settings.perspective}
                            zoom={settings.zoom}
                            sensitivity={settings.sensitivity}
                            buildMode={buildMode}
                            isUIOpen={isUIOpen}
                            placedMachines={placedMachines}
                            placedProps={placedProps}
                        />
                        
                        {/* 1인칭 시점일 때 화면 우측 하단에 들고 있는 아이템이나 건설 도구를 띄워줌 */}
                        <FirstPersonHeldItem item={selectedItem} perspective={settings.perspective} />

                        {/* 바닥에 떨어져 대기 중(IDLE)인 아이템들 */}
                        {items.map(item => (
                            <TrashItem
                                key={item.id}
                                item={item}
                                currentStageIdx={-1}
                                isHandFull={isHandFull}
                            />
                        ))}

                        {/* 컨베이어 벨트 위에서 이동 중이거나 기계 안에서 가공 중인 아이템들 */}
                        {movingItems.map(item => (
                            <TrashItem
                                key={item.id}
                                item={item}
                                currentStageIdx={item.currentStageIdx ?? -1}
                                hidden={item.status === 'PROCESSING'} // 기계 안에 들어가면 렌더링을 숨깁니다.
                                isHandFull={isHandFull}
                            />
                        ))}

                        {/* 3D 에러/안내 텍스트 렌더링 (ViewAlignedAlert 호출) */}
                        {worldAlerts && worldAlerts.map(alert => (
                            <ViewAlignedAlert key={alert.id} text={alert.text} />
                        ))}

                        {/* 건설 모드 시 조준점에 홀로그램으로 미리보기를 띄우고 설치/철거 이벤트를 처리하는 컨트롤러 */}
                        <BuilderController
                            buildMode={buildMode}
                            selectedBuildItem={selectedItem}
                            playerRef={playerRef}
                            onPlaceItem={onPlaceItem}
                            onDemolishItem={onDemolishItem}
                        />
                    </Physics>
                </Suspense>

                {/* 바닥 전체에 부드러운 그림자를 생성해주는 가짜(접촉) 그림자 효과 */}
                <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2} far={4.5} />

                {/* 포인터 락 제어 (앞서 정의한 커스텀 핸들러) */}
                <PointerLockHandler
                    isUIOpen={isUIOpen}
                    canLock={canLock}
                    onUnlock={handleUnlock}
                />
            </Canvas>
        </KeyboardControls>
    );
}
