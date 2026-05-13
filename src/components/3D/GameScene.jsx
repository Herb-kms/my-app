import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, Sky, Stars, ContactShadows } from '@react-three/drei';
import { Physics } from '@react-three/cannon';

import { Machine } from './MachineComponents';
import { Belt } from './BeltComponents';
import { TrashItem } from './ItemComponents';
import { Floor, ShippingBin, PropComponents } from './EnvironmentComponents';
import { BuilderController } from './BuilderComponents';

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
    canLock,
    handleUnlock
}) {
    return (
        <Canvas shadows={settings.graphicsQuality === 'high'}>
            <PerspectiveCamera
                makeDefault
                position={[12, 5, 12]}
                fov={settings.perspective === 'first' ? 75 : 45 + (settings.zoom / 5)}
            />
            
            <Sky sunPosition={[100, 20, 100]} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1.5} castShadow />
            <directionalLight
                position={[5, 10, 5]}
                intensity={1}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />

            <Suspense fallback={null}>
                <Physics gravity={[0, -9.81, 0]}>
                    <Floor />
                    
                    {/* 설치된 벨트 및 기계 렌더링 */}
                    {placedBelts.map(b => (
                        <Belt key={b.id} position={b.position} rotation={b.rotation} />
                    ))}
                    <Machine machines={placedMachines} movingItems={movingItems} />
                    
                    {/* 필드 아이템 렌더링 */}
                    {items.map(item => (
                        <TrashItem key={item.id} item={item} />
                    ))}
                    
                    {/* 이동 중인 아이템 렌더링 */}
                    {movingItems.map(item => (
                        item.status === 'MOVING' && <TrashItem key={item.id} item={item} />
                    ))}

                    <PropComponents props={placedProps} />
                    
                    <BuilderController 
                        buildMode={buildMode}
                        selectedItem={selectedItem}
                        playerRef={playerRef}
                        onUnlock={handleUnlock}
                        canLock={canLock}
                    />
                </Physics>
            </Suspense>

            <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2} far={4.5} />
        </Canvas>
    );
}
