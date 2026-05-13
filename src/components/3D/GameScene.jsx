import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Sky, Stars, ContactShadows, Environment } from '@react-three/drei';
import { Physics } from '@react-three/cannon';

import { Machine, ConveyorBelt } from './MachineComponents';
import { TrashItem } from './ItemComponents';
import { Floor, PropComponents } from './EnvironmentComponents';
import { BuilderController } from './BuilderComponents';
import { Player, PlayerController, FirstPersonHeldItem } from './PlayerComponents';

export function GameScene({
    settings,
    items,
    movingItems,
    placedMachines,
    placedBelts,
    placedProps,
    buildMode,
    selectedItem,
    playerRef,
    playerPositionRef,
    canLock,
    handleUnlock,
    onPlaceItem,
    onDemolishItem
}) {
    return (
        <Canvas shadows gl={{ antialias: true }}>
            <PerspectiveCamera
                makeDefault
                position={[12, 5, 12]}
                fov={settings.perspective === 'first' ? 75 : 50}
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
                    
                    {/* 설치된 벨트 및 기계 렌더링 */}
                    <ConveyorBelt placedBelts={placedBelts} />
                    <Machine machines={placedMachines} movingItems={movingItems} />
                    
                    {/* 플레이어 및 아이템 */}
                    <Player playerRef={playerRef} perspective={settings.perspective} selectedItem={selectedItem} />
                    <PlayerController 
                        playerRef={playerRef} 
                        playerPositionRef={playerPositionRef}
                        perspective={settings.perspective} 
                        buildMode={buildMode} 
                    />
                    <FirstPersonHeldItem item={selectedItem} perspective={settings.perspective} />
                    
                    {/* 필드 아이템 렌더링 */}
                    {items.map(item => (
                        <TrashItem key={item.id} item={item} />
                    ))}
                    
                    {/* 이동 중인 아이템 렌더링 */}
                    {movingItems.map(item => (
                        item.status === 'MOVING' && <TrashItem key={item.id} item={item} />
                    ))}
                    
                    <BuilderController 
                        buildMode={buildMode}
                        selectedBuildItem={selectedItem}
                        playerRef={playerRef}
                        onPlaceItem={onPlaceItem}
                        onDemolishItem={onDemolishItem}
                        onUnlock={handleUnlock}
                        canLock={canLock}
                    />
                </Physics>
            </Suspense>

            <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2} far={4.5} />
        </Canvas>
    );
}
