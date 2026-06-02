import { useEffect } from 'react';

import { playEnterMachineSound, playProcessingSound, playConveyorSound } from '../utils/audioManager';
import { MAZE_CORRIDORS } from '../components/3D/EnvironmentComponents';

/**
 * 공장 시뮬레이션의 핵심 비즈니스 로직(물리, 이동, 가공)을 담당하는 커스텀 훅입니다.
 */
export function useFactorySimulation({
    gameState,
    currentDay = 0,
    setShippedPurifierCore,
    movingItemsRef,
    placedMachines,
    placedBelts,
    items,
    setItems,
    setMovingItems,
    setMoney,
    setResults,
    playerPositionRef
}) {
    // ========================================================================
    // 1. 공정 시뮬레이션 (벨트 이동 및 기계 처리)
    // ========================================================================
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

                    // 1-1. 해당 타일에 기계가 있는지 감지
                    const machine = placedMachines.find(m => Math.abs(m.position[0] - gridX) < 1.5 && Math.abs(m.position[2] - gridZ) < 1.5);
                    if (machine) {
                        if (machine.type === 'SHIPPING_BIN') {
                            // 판매구역에 도착
                            if (item.isProduct || item.type === 'Upcycled' || item.type.includes('Ingot') || item.type.includes('Flakes') || item.type.includes('Cullet') || item.isPurifierCore) {
                                const val = item.value || 10;
                                soldAmount += val;
                                salesLog.push(`[판매] ${item.name || item.type} 판매 완료: +$${val}`);
                                
                                // 5일차 전용 목표 달성 감지
                                if (item.isPurifierCore && setShippedPurifierCore) {
                                    setShippedPurifierCore(true);
                                    salesLog.push(`[★목표★] 대기 정화 코어 적재 성공! 자정까지 세금($1000)을 보유하면 승리합니다.`);
                                }
                                return null;
                            }
                        } else {
                            // 독성 물질의 유출 패널티 (분류기(SORTING)가 아닌 일반 가공 기계에 들어갈 시 유출 벌금)
                            if (item.type === 'Toxic' && machine.type !== 'SORTING') {
                                soldAmount -= 100;
                                salesLog.push(`[🚨위험🚨] ${item.name} 오작동 유출! 벌금 -$100 부과.`);
                                return null; // 소멸
                            }

                            playEnterMachineSound(machine, playerPositionRef);
                            return { ...item, status: 'PROCESSING', machineId: machine.id, machineProgress: 0 };
                        }
                    }

                    // 1-2. 해당 타일에 컨베이어 벨트가 있는지 감지
                    const belt = placedBelts.find(b => Math.abs(b.position[0] - gridX) < 1.3 && Math.abs(b.position[2] - gridZ) < 1.3);
                    if (belt) {
                        playConveyorSound(belt.position, playerPositionRef);
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

                // [상태 2] 아이템이 기계 안에서 가공 중일 때
                } else if (item.status === 'PROCESSING') {
                    changed = true;
                    const m = placedMachines.find(m => m.id === item.machineId);
                    
                    if (!m) return { ...item, status: 'MOVING' };

                    if (m.type === 'SHIPPING_BIN') {
                        if (item.isProduct || item.type === 'Upcycled' || item.type.includes('Ingot') || item.type.includes('Flakes') || item.type.includes('Cullet') || item.isPurifierCore) {
                            const val = item.value || 10;
                            soldAmount += val;
                            salesLog.push(`[판매] ${item.name || item.type} 판매 완료: +$${val}`);
                            if (item.isPurifierCore && setShippedPurifierCore) {
                                setShippedPurifierCore(true);
                                salesLog.push(`[★목표★] 대기 정화 코어 적재 성공! 자정까지 세금($1000)을 보유하면 승리합니다.`);
                            }
                            return null;
                        }
                        return { ...item, status: 'MOVING' };
                    }

                    playProcessingSound(m, playerPositionRef);

                    const speedFactor = 0.5;
                    const newProg = item.machineProgress + (0.4 * speedFactor * 10);
                    
                    if (newProg >= 100) {
                        const isProduct = m.type === 'PACKAGING';
                        let newItemInfo = item;
                        
                        // 포장기 단계 (최종 생산물)
                        if (isProduct && !item.isProduct) {
                            if (currentDay === 5) {
                                // 5일차 전용 제작식: 대기 정화 코어 생산
                                newItemInfo = {
                                    ...item,
                                    type: 'PurifierCore',
                                    name: '대기 정화 코어',
                                    value: 300,
                                    color: '#00ffcc',
                                    isProduct: true,
                                    isPurifierCore: true
                                };
                            } else {
                                const productMap = {
                                    "Can": { type: "알루미늄 주괴", value: 50, color: "#C0C0C0" },
                                    "Plastic": { type: "재생 플라스틱 칩", value: 30, color: "#E0E0E0" },
                                    "Glass": { type: "재생 유리 파쇄물", value: 20, color: "#ADD8E6" },
                                    "Paper": { type: "재생 박스 패키지", value: 45, color: "#D2B48C" },
                                    "Toxic": { type: "정화된 유독 실린더", value: 80, color: "#44ffaa" }
                                };
                                const productInfo = productMap[item.type] || { type: "재활용 완제품", value: 15, color: "#fff" };
                                newItemInfo = { ...item, ...productInfo, isProduct: true, name: productInfo.type };
                            }
                        } else if (!item.isProduct) {
                            // 일반 가공단계 이름 가공
                            const prefixMap = {
                                "SORTING": "분류된 ",
                                "CRUSHING": "파쇄된 ",
                                "CLEANING": "세척된 ",
                                "DRYING": "건조된 "
                            };
                            const baseNameMap = {
                                "Can": "알루미늄 캔",
                                "Plastic": "플라스틱",
                                "Glass": "유리",
                                "Paper": "종이",
                                "Toxic": "독성 물질"
                            };
                            
                            const prefix = prefixMap[m.type];
                            if (prefix) {
                                const baseName = baseNameMap[item.type] || item.type;
                                newItemInfo = { ...item, name: prefix + baseName };
                            }
                        }
                        
                        const outDist = 1.4;
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

            if (changed || soldAmount !== 0) {
                if (soldAmount !== 0) {
                    setMoney(prev => prev + soldAmount);
                    setResults(prev => [...salesLog, ...prev].slice(0, 5));
                }
                setMovingItems(nextItems.filter(Boolean));
            }
        }, 50);
        
        return () => clearInterval(interval);
    }, [gameState, currentDay, setShippedPurifierCore, placedBelts, placedMachines, items.length, movingItemsRef, setItems, setMoney, setMovingItems, setResults, playerPositionRef]);

    // ========================================================================
    // 2. 랜덤 아이템 자동 생성 (스폰 시스템)
    // ========================================================================
    useEffect(() => {
        if (gameState !== 'playing') return;

        // 3초마다 랜덤으로 미로 내 복도 구역에 쓰레기를 생성합니다.
        const spawnInterval = setInterval(() => {
            setItems(prev => {
                if (prev.length >= 40) return prev;

                // 기본 스폰 아이템 종류
                const types = [
                    { type: 'Can', name: '폐알루미늄 캔', color: '#ff4444', icon: '🥫', value: 5 },
                    { type: 'Plastic', name: '폐플라스틱 소재', color: '#88ff44', icon: '🧪', value: 3 },
                    { type: 'Glass', name: '폐유리 조각', color: '#44ccff', icon: '💎', value: 2 }
                ];

                // 일차별 스폰 확장
                if (currentDay >= 3) {
                    types.push({ type: 'Paper', name: '버려진 고지', color: '#D2B48C', icon: '📰', value: 4 });
                }
                if (currentDay >= 4) {
                    types.push({ type: 'Toxic', name: '독성 폐기물 드럼통', color: '#ff00ff', icon: '☣️', value: 8 });
                }

                const selected = types[Math.floor(Math.random() * types.length)];
                
                let spawnX = 0, spawnZ = 0;
                if (MAZE_CORRIDORS.length > 0) {
                    const target = MAZE_CORRIDORS[Math.floor(Math.random() * MAZE_CORRIDORS.length)];
                    spawnX = target.x + (Math.random() - 0.5) * 6;
                    spawnZ = target.z + (Math.random() - 0.5) * 6;
                } else {
                    spawnX = (Math.random() - 0.5) * 180;
                    spawnZ = (Math.random() - 0.5) * 180;
                }

                const newItem = {
                    id: `spawn-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                    ...selected,
                    position: [spawnX, 0.5, spawnZ],
                    status: 'IDLE',
                    currentStageIdx: 0
                };
                
                return [...prev, newItem];
            });
        }, 3000);

        return () => clearInterval(spawnInterval);
    }, [gameState, currentDay, setItems]);
}
