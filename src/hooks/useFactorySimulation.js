import { useEffect } from 'react';

import { playEnterMachineSound, playProcessingSound, playConveyorSound } from '../utils/audioManager';
import { MAZE_CORRIDORS } from '../components/3D/EnvironmentComponents';

/**
 * 공장 시뮬레이션의 핵심 비즈니스 로직(물리, 이동, 가공)을 담당하는 커스텀 훅입니다.
 * React의 렌더링 사이클과 별개로 setInterval을 사용해 초당 20번(50ms)씩 상태를 업데이트합니다.
 */
export function useFactorySimulation({
    gameState,
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
        
        // 50ms마다(초당 20프레임) 전체 아이템의 위치와 가공 상태를 계산합니다.
        const interval = setInterval(() => {
            const currentMoving = movingItemsRef.current;
            
            // 처리할 아이템이 아예 없으면 연산을 스킵 (최적화)
            if (currentMoving.length === 0 && items.length === 0) return;

            let soldAmount = 0;
            let salesLog = [];
            let changed = false;

            // map 함수를 통해 기존 movingItems 배열을 순회하며 새로운 상태 배열을 만듭니다.
            const nextItems = currentMoving.map(item => {
                
                // ─────────────────────────────────────────────────────────────────
                // [상태 1] 아이템이 벨트 위에서 이동 중일 때 (MOVING)
                // ─────────────────────────────────────────────────────────────────
                if (item.status === 'MOVING') {
                    changed = true;
                    
                    // 현재 아이템의 실제 좌표를 2.5m 단위의 그리드 좌표로 변환(스냅)합니다.
                    // 아이템이 속해있는 '칸(타일)'이 어디인지 파악하기 위함입니다.
                    const gridX = Math.round(item.position[0] / 2.5) * 2.5;
                    const gridZ = Math.round(item.position[2] / 2.5) * 2.5;

                    // 1-1. 해당 타일에 기계가 있는지 먼저 감지
                    const machine = placedMachines.find(m => Math.abs(m.position[0] - gridX) < 1.5 && Math.abs(m.position[2] - gridZ) < 1.5);
                    if (machine) {
                        // 만약 판매존(SHIPPING_BIN)이라면 도착 즉시 돈으로 환산하고 아이템을 소멸시킵니다.
                        if (machine.type === 'SHIPPING_BIN') {
                            if (item.isProduct || item.type === 'Upcycled' || item.type.includes('Ingot') || item.type.includes('Flakes') || item.type.includes('Cullet')) {
                                const val = item.value || 10;
                                soldAmount += val;
                                salesLog.push(`SOLD: ${item.name || item.type} for $${val}`);
                                return null; // 배열에서 삭제
                            }
                        } else {
                            // 일반 기계라면 아이템의 상태를 'PROCESSING(가공 중)'으로 바꾸고 렌더링을 숨깁니다.
                            playEnterMachineSound(machine, playerPositionRef);
                            return { ...item, status: 'PROCESSING', machineId: machine.id, machineProgress: 0 };
                        }
                    }

                    // 1-2. 해당 타일에 컨베이어 벨트가 있는지 감지
                    const belt = placedBelts.find(b => Math.abs(b.position[0] - gridX) < 1.3 && Math.abs(b.position[2] - gridZ) < 1.3);
                    if (belt) {
                        playConveyorSound(belt.position, playerPositionRef);
                        const speed = 0.05; // 1프레임당 이동 거리
                        let newX = item.position[0];
                        let newZ = item.position[2];
                        
                        // 벨트의 회전값을 바탕으로 방향(rotMod: 0,1,2,3)을 구합니다.
                        const angle = typeof belt.rotation === 'number' ? belt.rotation : belt.rotation[1];
                        const rotAngle = Math.round(angle / (Math.PI / 2));
                        const rotMod = ((rotAngle % 4) + 4) % 4;

                        // 벨트가 바라보는 방향으로 아이템을 밀어내고, 
                        // 벨트의 정중앙에서 벗어나 있으면 중앙으로 부드럽게 끌어당깁니다. (자동 정렬 효과)
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

                    // 1-3. 기계도 없고 벨트도 없다면? (벨트가 끊김)
                    // 아이템을 바닥에 떨어뜨리고(IDLE) 이동 대기열에서 뺍니다.
                    const dropItem = { ...item, id: `trash-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, status: 'IDLE' };
                    setItems(prev => [...prev, dropItem]);
                    return null;

                // ─────────────────────────────────────────────────────────────────
                // [상태 2] 아이템이 기계 안에서 가공 중일 때 (PROCESSING)
                // ─────────────────────────────────────────────────────────────────
                } else if (item.status === 'PROCESSING') {
                    changed = true;
                    const m = placedMachines.find(m => m.id === item.machineId);
                    
                    // 기계가 갑자기 철거됐다면 다시 벨트로 뱉어냅니다.
                    if (!m) return { ...item, status: 'MOVING' };

                    // 판매 구역 로직 (위와 동일)
                    if (m.type === 'SHIPPING_BIN') {
                        if (item.isProduct || item.type === 'Upcycled' || item.type.includes('Ingot') || item.type.includes('Flakes') || item.type.includes('Cullet')) {
                            const val = item.value || 10;
                            soldAmount += val;
                            salesLog.push(`SOLD: ${item.name || item.type} for $${val}`);
                            return null;
                        }
                        return { ...item, status: 'MOVING' };
                    }

                    // 기계 작동음 재생
                    playProcessingSound(m, playerPositionRef);

                    // 가공 진척도(Progress) 올리기
                    const speedFactor = 0.5;
                    const newProg = item.machineProgress + (0.4 * speedFactor * 10);
                    
                    // 가공이 완료(100%)되었을 때
                    if (newProg >= 100) {
                        const isProduct = m.type === 'PACKAGING';
                        let newItemInfo = item;
                        
                        // 마지막 단계(포장기)라면 아이템을 완제품(Product)으로 변환합니다.
                        if (isProduct && !item.isProduct) {
                            const productMap = {
                                "Can": { type: "알루미늄 주괴", value: 50, color: "#C0C0C0" },
                                "Plastic": { type: "재생 플라스틱 칩", value: 30, color: "#E0E0E0" },
                                "Glass": { type: "재생 유리 파쇄물", value: 20, color: "#ADD8E6" }
                            };
                            const productInfo = productMap[item.type] || { type: "재활용 완제품", value: 15, color: "#fff" };
                            newItemInfo = { ...item, ...productInfo, isProduct: true, name: productInfo.type };
                        } else if (!item.isProduct) {
                            // 중간 공정 기계를 통과했을 때 아이템 이름 변경
                            const prefixMap = {
                                "SORTING": "분류된 ",
                                "CRUSHING": "파쇄된 ",
                                "CLEANING": "세척된 ",
                                "DRYING": "건조된 "
                            };
                            const baseNameMap = {
                                "Can": "알루미늄 캔",
                                "Plastic": "플라스틱",
                                "Glass": "유리"
                            };
                            
                            const prefix = prefixMap[m.type];
                            if (prefix) {
                                const baseName = baseNameMap[item.type] || item.type;
                                newItemInfo = { ...item, name: prefix + baseName };
                            }
                        }
                        
                        // 기계 배출구 설정
                        // 기존(2.5)에는 기계 다음 칸의 벨트 정중앙에서 스폰되었지만, 
                        // 자연스러운 연출을 위해 기계 본체 끝부분(1.4m)에서부터 스폰되어 벨트를 타고 나오도록 수정했습니다.
                        const outDist = 1.4;
                        let offX = 0, offZ = 0;
                        const angle = typeof m.rotation === 'number' ? m.rotation : m.rotation[1];
                        const mRot = Math.round(angle / (Math.PI / 2));
                        const rotMod = ((mRot % 4) + 4) % 4;
                        
                        // 기계가 바라보는 방향(회전)에 따라 아이템을 뱉어낼 출구 방향을 결정
                        if (rotMod === 0) offZ = -outDist;
                        if (rotMod === 1) offX = -outDist;
                        if (rotMod === 2) offZ = outDist;
                        if (rotMod === 3) offX = outDist;

                        // 처리가 끝난 아이템을 기계 바깥(배출구)으로 다시 던져줍니다.
                        return {
                            ...newItemInfo,
                            status: 'MOVING',
                            position: [m.position[0] + offX, 0.5, m.position[2] + offZ],
                            machineId: null,
                            machineProgress: 0,
                            currentStageIdx: (item.currentStageIdx || 0) + 1
                        };
                    }
                    
                    // 아직 가공 중이면 진행도만 업데이트
                    return { ...item, machineProgress: newProg };
                }
                return item;
            }); // end of map

            // 상태가 변경되었거나 돈을 벌었다면 React State에 일괄 업데이트
            if (changed || soldAmount > 0) {
                if (soldAmount > 0) {
                    setMoney(prev => prev + soldAmount);
                    setResults(prev => [...salesLog, ...prev].slice(0, 5));
                }
                // null로 반환된(삭제된) 아이템들을 필터링
                setMovingItems(nextItems.filter(Boolean));
            }
        }, 50); // setInterval 50ms 종료
        
        return () => clearInterval(interval);
    }, [gameState, placedBelts, placedMachines, items.length, movingItemsRef, setItems, setMoney, setMovingItems, setResults, playerPositionRef]);

    // ========================================================================
    // 2. 랜덤 아이템 자동 생성 (스폰 시스템)
    // ========================================================================
    useEffect(() => {
        if (gameState !== 'playing') return;

        // 3초마다 랜덤으로 미로 내 복도 구역에 쓰레기를 하나씩 생성합니다.
        const spawnInterval = setInterval(() => {
            setItems(prev => {
                // 바닥에 떨어진 쓰레기가 너무 많아지면(40개 이상) 렉 방지를 위해 스폰 중단
                if (prev.length >= 40) return prev;

                const types = [
                    { type: 'Can', name: '폐알루미늄 캔', color: '#ff4444', icon: '🥫', value: 5 },
                    { type: 'Plastic', name: '폐플라스틱 소재', color: '#88ff44', icon: '🧪', value: 3 },
                    { type: 'Glass', name: '폐유리 조각', color: '#44ccff', icon: '💎', value: 2 }
                ];
                const selected = types[Math.floor(Math.random() * types.length)];
                
                let spawnX = 0, spawnZ = 0;
                if (MAZE_CORRIDORS.length > 0) {
                    // 미로 코리도 리스트 중 하나를 랜덤 지정하고 약간의 랜덤 오프셋을 더함
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
    }, [gameState, setItems]);
}
