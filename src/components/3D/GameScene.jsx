import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { KeyboardControls, PerspectiveCamera, Sky, Stars, ContactShadows, Environment } from '@react-three/drei';
import { Physics } from '@react-three/cannon';

import { Machine, ConveyorBelt } from './MachineComponents';
import { TrashItem } from './ItemComponents';
import { Floor, PropComponents } from './EnvironmentComponents';
import { BuilderController } from './BuilderComponents';
import { Player, PlayerController, FirstPersonHeldItem } from './PlayerComponents';

// KeyboardControls 키 맵핑
const keyMap = [
    { name: 'forward',  keys: ['ArrowUp',    'KeyW'] },
    { name: 'backward', keys: ['ArrowDown',  'KeyS'] },
    { name: 'left',     keys: ['ArrowLeft',  'KeyA'] },
    { name: 'right',    keys: ['ArrowRight', 'KeyD'] },
    { name: 'jump',     keys: ['Space'] },
];

// ── 포인터 락 핸들러 ─────────────────────────────────────────────────────────
// drei PointerLockControls의 DOM 제거 오류를 우회하기 위해 직접 구현
function PointerLockHandler({ isUIOpen, canLock, onUnlock }) {
    const { gl } = useThree();

    useEffect(() => {
        // UI가 열리면 포인터락 즉시 해제
        if (isUIOpen || !canLock) {
            try {
                if (document.pointerLockElement) {
                    document.exitPointerLock();
                }
            } catch (e) { /* 무시 */ }
            return;
        }

        // Canvas 클릭 시 포인터 락 요청 (약간의 지연을 주어 DOM 안정화 대기)
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

        // 포인터 락 해제 이벤트
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
            // 언마운트 시 안전하게 해제
            try {
                if (document.pointerLockElement) document.exitPointerLock();
            } catch (e) { /* 무시 */ }
        };
    }, [isUIOpen, canLock, gl.domElement, onUnlock]);

    return null;
}

export function GameScene({
    settings,
    items,
    movingItems,
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
    const isUIOpen = isInventoryOpen || isSettingsOpen || isBuildInventoryOpen;

    return (
        <KeyboardControls map={keyMap}>
            <Canvas shadows gl={{ antialias: true }}>
                {/* FOV는 1인칭/3인칭에 따라 다름 */}
                <PerspectiveCamera
                    makeDefault
                    position={[12, 5, 12]}
                    fov={settings.perspective === 'first' ? 80 : 60}
                    near={0.05}
                    far={1000}
                />

                <Sky sunPosition={[100, 20, 100]} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Environment preset="city" />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />

                <Suspense fallback={null}>
                    <Physics gravity={[0, -9.81, 0]}>
                        <Floor />
                        <PropComponents placedProps={placedProps} />

                        {/* 벨트 및 기계 */}
                        <ConveyorBelt placedBelts={placedBelts} />
                        <Machine placedMachines={placedMachines} movingItems={movingItems} />

                        {/* 플레이어 */}
                        <Player
                            playerRef={playerRef}
                            perspective={settings.perspective}
                            selectedItem={selectedItem}
                        />
                        <PlayerController
                            playerRef={playerRef}
                            playerPositionRef={playerPositionRef}
                            perspective={settings.perspective}
                            zoom={settings.zoom}
                            sensitivity={settings.sensitivity}
                            buildMode={buildMode}
                            isUIOpen={isUIOpen}
                        />
                        <FirstPersonHeldItem item={selectedItem} perspective={settings.perspective} />

                        {/* 필드 아이템 (IDLE 상태) */}
                        {items.map(item => (
                            <TrashItem
                                key={item.id}
                                item={item}
                                currentStageIdx={-1}
                                isHandFull={isHandFull}
                            />
                        ))}

                        {/* 벨트 위 이동/가공 아이템 */}
                        {movingItems.map(item => (
                            <TrashItem
                                key={item.id}
                                item={item}
                                currentStageIdx={item.currentStageIdx ?? -1}
                                hidden={item.status === 'PROCESSING'}
                                isHandFull={isHandFull}
                            />
                        ))}

                        {/* 건설 컨트롤러 */}
                        <BuilderController
                            buildMode={buildMode}
                            selectedBuildItem={selectedItem}
                            playerRef={playerRef}
                            onPlaceItem={onPlaceItem}
                            onDemolishItem={onDemolishItem}
                        />
                    </Physics>
                </Suspense>

                <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2} far={4.5} />

                {/* 포인터 락: 안전한 직접 구현 (DOM 제거 오류 방지) */}
                <PointerLockHandler
                    isUIOpen={isUIOpen}
                    canLock={canLock}
                    onUnlock={handleUnlock}
                />
            </Canvas>
        </KeyboardControls>
    );
}
