import { useEffect } from 'react';

export function useFactorySimulation({
    gameState,
    movingItemsRef,
    placedMachines,
    placedBelts,
    items,
    setItems,
    setMovingItems,
    setMoney,
    setResults
}) {
    useEffect(() => {
        if (gameState !== 'playing') return;
        
        const interval = setInterval(() => {
            const currentMoving = movingItemsRef.current;
            if (currentMoving.length === 0 && items.length === 0) return;

            let soldAmount = 0;
            let salesLog = [];
            let changed = false;

            const nextItems = currentMoving.map(item => {
                if (item.status === 'MOVING') {
                    changed = true;
                    const gridX = Math.round(item.position[0] / 2.5) * 2.5;
                    const gridZ = Math.round(item.position[2] / 2.5) * 2.5;

                    // 기계 감지 반경 1.5 (2.5 그리드의 절반)
                    const machine = placedMachines.find(m => Math.abs(m.position[0] - gridX) < 1.5 && Math.abs(m.position[2] - gridZ) < 1.5);
                    if (machine) {
                        if (machine.type === 'SHIPPING_BIN') {
                            if (item.isProduct || item.type === 'Upcycled' || item.type.includes('Ingot') || item.type.includes('Flakes') || item.type.includes('Cullet')) {
                                const val = item.value || 10;
                                soldAmount += val;
                                salesLog.push(`SOLD: ${item.name || item.type} for $${val}`);
                                return null;
                            }
                        } else {
                            return { ...item, status: 'PROCESSING', machineId: machine.id, machineProgress: 0 };
                        }
                    }

                    // 벨트 감지 반경 1.3 (2.5 그리드의 절 이상, 코너 전환 안정성 확보)
                    const belt = placedBelts.find(b => Math.abs(b.position[0] - gridX) < 1.3 && Math.abs(b.position[2] - gridZ) < 1.3);
                    if (belt) {
                        const speed = 0.05;
                        let newX = item.position[0];
                        let newZ = item.position[2];
                        const angle = typeof belt.rotation === 'number' ? belt.rotation : belt.rotation[1];
                        const rotAngle = Math.round(angle / (Math.PI / 2));
                        const rotMod = ((rotAngle % 4) + 4) % 4;

                        if (rotMod === 0 || rotMod === 2) {
                            newZ += rotMod === 0 ? -speed : speed;
                            let diffX = belt.position[0] - newX;
                            let stepX = diffX * 0.15;
                            if (stepX > speed) stepX = speed;
                            if (stepX < -speed) stepX = -speed;
                            newX += stepX;
                        } else {
                            newX += rotMod === 1 ? -speed : speed;
                            let diffZ = belt.position[2] - newZ;
                            let stepZ = diffZ * 0.15;
                            if (stepZ > speed) stepZ = speed;
                            if (stepZ < -speed) stepZ = -speed;
                            newZ += stepZ;
                        }
                        return { ...item, position: [newX, item.position[1], newZ] };
                    }

                    const dropItem = { ...item, id: `trash-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, status: 'IDLE' };
                    setItems(prev => [...prev, dropItem]);
                    return null;

                } else if (item.status === 'PROCESSING') {
                    changed = true;
                    const m = placedMachines.find(m => m.id === item.machineId);
                    if (!m) return { ...item, status: 'MOVING' };

                    if (m.type === 'SHIPPING_BIN') {
                        if (item.isProduct || item.type === 'Upcycled' || item.type.includes('Ingot') || item.type.includes('Flakes') || item.type.includes('Cullet')) {
                            const val = item.value || 10;
                            soldAmount += val;
                            salesLog.push(`SOLD: ${item.name || item.type} for $${val}`);
                            return null;
                        }
                        return { ...item, status: 'MOVING' };
                    }

                    const speedFactor = 0.5;
                    const newProg = item.machineProgress + (0.4 * speedFactor * 10);
                    if (newProg >= 100) {
                        const isProduct = m.type === 'PACKAGING';
                        let newItemInfo = item;
                        if (isProduct && !item.isProduct) {
                            const productMap = {
                                "Can": { type: "Aluminum Ingot", value: 50, color: "#C0C0C0" },
                                "Plastic": { type: "Plastic Flakes", value: 30, color: "#E0E0E0" },
                                "Glass": { type: "Glass Cullet", value: 20, color: "#ADD8E6" }
                            };
                            const productInfo = productMap[item.type] || { type: "Upcycled", value: 15, color: "#fff" };
                            newItemInfo = { ...item, ...productInfo, isProduct: true };
                        }
                        const outDist = 2.5;
                        let offX = 0, offZ = 0;
                        const angle = typeof m.rotation === 'number' ? m.rotation : m.rotation[1];
                        const mRot = Math.round(angle / (Math.PI / 2));
                        const rotMod = ((mRot % 4) + 4) % 4;
                        if (rotMod === 0) offZ = -outDist;
                        if (rotMod === 1) offX = -outDist;
                        if (rotMod === 2) offZ = outDist;
                        if (rotMod === 3) offX = outDist;

                        return {
                            ...newItemInfo,
                            status: 'MOVING',
                            position: [m.position[0] + offX, 0.5, m.position[2] + offZ],
                            machineId: null,
                            machineProgress: 0,
                            currentStageIdx: (item.currentStageIdx || 0) + 1
                        };
                    }
                    return { ...item, machineProgress: newProg };
                }
                return item;
            });

            if (changed || soldAmount > 0) {
                if (soldAmount > 0) {
                    setMoney(prev => prev + soldAmount);
                    setResults(prev => [...salesLog, ...prev].slice(0, 5));
                }
                setMovingItems(nextItems.filter(Boolean));
            }
        }, 50);
        return () => clearInterval(interval);
    }, [gameState, placedBelts, placedMachines, items.length]);
}
