import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, PerspectiveCamera, Sky, Stars, ContactShadows, Environment, PointerLockControls } from '@react-three/drei';
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

                        {/* 필드 아이템 */}
                        {items.map(item => (
                            <TrashItem key={item.id} item={item} isHandFull={isHandFull} />
                        ))}

                        {/* 이동 중인 아이템 */}
                        {movingItems.map(item => (
                            item.status === 'MOVING' && (
                                <TrashItem key={item.id} item={item} isHandFull={isHandFull} />
                            )
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

                {/* 포인터 락 - UI가 열려있지 않을 때만 활성화 */}
                {canLock && !isUIOpen && (
                    <PointerLockControls onUnlock={handleUnlock} />
                )}
            </Canvas>
        </KeyboardControls>
    );
}
