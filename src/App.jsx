import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

// Data & Hooks
import { INITIAL_ITEMS, DEFAULT_MACHINES, DEFAULT_BELTS, BUILD_CATALOG } from './data/constants';
import { useFactorySimulation } from './hooks/useFactorySimulation';
import { useSurvivalSystem } from './hooks/useSurvivalSystem';
import { setMasterVolume } from './utils/audioManager';

// Components
import { GameScene } from './components/3D/GameScene';
import { OverlayUI } from './components/UI/OverlayUI';

/**
 * 최상위 App 컴포넌트
 * - 리액트의 진입점으로, 실제 게임 로직이 담긴 GameContent를 렌더링합니다.
 */
export default function App() {
    return <GameContent />;
}

/**
 * GameContent 컴포넌트
 * - 게임의 핵심 상태(데이터)와 로직(상호작용, 키보드 입력 등)을 중앙에서 관리하는 최상위 컨테이너입니다.
 */
function GameContent() {
    // ========================================================================
    // 1. 상태 관리 (State Management)
    // ========================================================================
    
    // 게임 진행 상태: 'intro'(타자기 인트로), 'playing'(본 게임), 'outro'(엔딩 아웃트로)
    const [gameState, setGameState] = useState('intro');
    
    // 플레이어의 자산 (돈)
    const [money, setMoney] = useState(0);
    
    // 바닥에 떨어져 있는 유휴 상태(IDLE)의 아이템들
    const [items, setItems] = useState(INITIAL_ITEMS);
    
    // 컨베이어 벨트나 기계 안에서 이동/가공 중인 아이템들 (최적화를 위해 분리)
    const [movingItems, setMovingItems] = useState([]);
    
    // setInterval 등 비동기 콜백에서 최신 movingItems를 참조하기 위한 Ref
    const movingItemsRef = useRef([]);
    
    // 시스템 로그(HUD의 하단)에 표시될 텍스트 배열
    const [results, setResults] = useState([]);
    
    // 3D 공간 상에 띄울 홀로그램 텍스트 알림창 데이터
    const [worldAlerts, setWorldAlerts] = useState([]);
    
    // 맵에 배치된 기계, 벨트, 구조물 데이터
    const [placedMachines, setPlacedMachines] = useState(DEFAULT_MACHINES);
    const [placedBelts, setPlacedBelts] = useState(DEFAULT_BELTS);
    const [placedProps, setPlacedProps] = useState([]);
    
    // 인벤토리 상태 관리 (일반 모드 vs 건설 모드 분리)
    const [normalInventory, setNormalInventory] = useState(Array(10).fill(null));
    
    // buildInventory: 건설 모드일 때 사용할 건축물 카탈로그 단축키 슬롯
    const [buildInventory, setBuildInventory] = useState(() => {
        const inv = Array(10).fill(null);
        BUILD_CATALOG.forEach((item, i) => { if (i < 10) inv[i] = item; });
        return inv;
    });
    
    // 핫바(1~10번 슬롯) 중 현재 선택된 슬롯 번호
    const [activeHotbarSlot, setActiveHotbarSlot] = useState(1);
    
    // UI 및 모드 토글 상태들
    const [buildMode, setBuildMode] = useState(false);               // 건설 모드 켜기/끄기
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);   // 일반 인벤토리 창 켜기/끄기
    const [isBuildInventoryOpen, setIsBuildInventoryOpen] = useState(false); // 건설 카탈로그 창 켜기/끄기
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);     // 환경설정 창 켜기/끄기
    
    // 마우스 포인터 잠금 허용 여부 (UI 클릭 등을 위해 일시 해제할 때 사용)
    const [canLock, setCanLock] = useState(true);
    
    // 게임 그래픽 및 카메라 환경 설정 데이터
    const [settings, setSettings] = useState({
        perspective: 'first',      // 'first'(1인칭) or 'third'(3인칭)
        graphicsQuality: 'high',
        zoom: 45,                  // 카메라 시야각(FOV) 설정
        volume: 50,                // 사운드 볼륨
        sensitivity: 1.0           // 마우스 회전 감도
    });

    useEffect(() => {
        setMasterVolume(settings.volume);
    }, [settings.volume]);

    // 3D 씬 내의 실제 플레이어 오브젝트 및 위치에 접근하기 위한 참조(Ref)
    const playerRef = useRef();
    const playerPositionRef = useRef([10, 0, 8]); // 플레이어의 현재 x, y, z 좌표 저장

    // 게임적인 서바이벌 시스템 및 캠페인(일차/시간) 훅
    const {
        oxygen,
        isCompromised,
        currentDay,
        setCurrentDay,
        gameHour,
        setGameHour,
        gameMinute,
        setGameMinute,
        shippedPurifierCore,
        setShippedPurifierCore,
        tutorialStep,
        setTutorialStep,
        handleReboot,
        handleChargeInteraction,
        resetSystem
    } = useSurvivalSystem({
        gameState,
        setGameState,
        money,
        setMoney,
        setNormalInventory,
        setResults,
        setWorldAlerts,
        playerPositionRef,
        playerRef
    });

    // 현재 모드(건설/일반)에 따라 보여줄 인벤토리와 선택된 아이템을 동적으로 결정
    const currentInventory = buildMode ? buildInventory : normalInventory;
    const selectedItem = currentInventory[activeHotbarSlot - 1];
    
    // 일반 인벤토리가 가득 찼는지 검사
    const isHandFull = normalInventory.filter(slot => slot !== null).length >= 10;

    // ========================================================================
    // 2. 이벤트 리스너용 최신 상태 캐싱 (State Ref)
    // ========================================================================
    const stateRef = useRef({ 
        items, movingItems, currentInventory, selectedItem, 
        activeHotbarSlot, buildMode, placedBelts, placedMachines,
        normalInventory, buildInventory, oxygen, isCompromised, currentDay, tutorialStep
    });

    useEffect(() => {
        stateRef.current = { 
            items, movingItems, currentInventory, selectedItem, 
            activeHotbarSlot, buildMode, placedBelts, placedMachines,
            normalInventory, buildInventory, oxygen, isCompromised, currentDay, tutorialStep
        };
        movingItemsRef.current = movingItems;
    }, [items, movingItems, currentInventory, selectedItem, activeHotbarSlot, buildMode, placedBelts, placedMachines, normalInventory, buildInventory, oxygen, isCompromised, currentDay, tutorialStep]);

    // 0일차(튜토리얼) 2단계 완료 트리거: 아이템 슬롯 장착 시 3단계로 전진
    useEffect(() => {
        if (gameState === 'playing' && currentDay === 0 && tutorialStep === 'equip' && selectedItem) {
            setTutorialStep('place_belt');
        }
    }, [selectedItem, tutorialStep, currentDay, gameState, setTutorialStep]);

    // ========================================================================
    // 3. 외부 시뮬레이션 훅 연결
    // ========================================================================
    useFactorySimulation({
        gameState,
        currentDay,
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
    });

    // HUD에 표시할 기계 작동 상태
    const processingItems = movingItems.filter(i => i.status === 'PROCESSING');
    const hudInfo = {
        isProcessing: processingItems.length > 0,
        processingItems: processingItems.map(item => {
            const machine = placedMachines.find(m => m.id === item.machineId);
            return {
                id: item.id,
                name: item.name || item.type,
                type: item.type,
                progress: item.machineProgress || 0,
                stageIdx: item.currentStageIdx || 0,
                machineName: machine ? machine.name : "가공 중"
            };
        }),
        STAGES: ["분류", "파쇄", "세척", "건조", "포장"]
    };

    // ========================================================================
    // 4. 핵심 핸들러 (사용자 액션 처리)
    // ========================================================================
    const handlePlaceItem = (itemData) => {
        if (!itemData.type) return;
        let displayName = itemData.name || itemData.type;
        
        if (itemData.type === "CONVEYOR") {
            setPlacedBelts(prev => [...prev, { ...itemData, id: `belt-${Date.now()}` }]);
        } else if (itemData.type.startsWith("ITEM_")) {
            const trashType = itemData.type.split("_")[1];
            const formattedType = trashType.charAt(0).toUpperCase() + trashType.slice(1).toLowerCase();
            const colorMap = { "Plastic": "#4444ff", "Can": "#ff4444", "Glass": "#44ff44" };
            setItems(prev => [...prev, {
                id: `trash-${Date.now()}`,
                type: formattedType,
                color: colorMap[formattedType] || "#FFF",
                position: [itemData.position[0], 0.3, itemData.position[2]],
                status: 'IDLE', value: 10
            }]);
        } else if (["SHELF", "CRATE", "BARREL", "WALL"].includes(itemData.type)) {
            setPlacedProps(prev => [...prev, { ...itemData, id: `prop-${Date.now()}` }]);
        } else {
            setPlacedMachines(prev => [...prev, { ...itemData, id: `machine-${Date.now()}` }]);
        }
        setResults(prev => [`배치됨: ${displayName}`, ...prev].slice(0, 5));
    };

    const handleDemolishItem = ([x, z]) => {
        const threshold = 1.5;
        setPlacedMachines(prev => prev.filter(m => Math.abs(m.position[0] - x) > threshold || Math.abs(m.position[2] - z) > threshold));
        setPlacedBelts(prev => prev.filter(b => Math.abs(b.position[0] - x) > threshold || Math.abs(b.position[2] - z) > threshold));
        setPlacedProps(prev => prev.filter(p => Math.abs(p.position[0] - x) > threshold || Math.abs(p.position[2] - z) > threshold));
        setItems(prev => prev.filter(i => Math.abs(i.position[0] - x) > threshold || Math.abs(i.position[2] - z) > threshold));
        setResults(prev => ["오브젝트 철거함", ...prev].slice(0, 5));
    };

    const handleUnlock = useCallback(() => {
        setCanLock(false);
        setTimeout(() => setCanLock(true), 1200);
    }, []);

    const handleInventoryClick = (idx, sourceIdx = null, type = 'storage') => {
        const isBuild = type === 'build-storage';
        const targetInv = isBuild ? buildInventory : normalInventory;
        const setTargetInv = isBuild ? setBuildInventory : setNormalInventory;

        const newInv = [...targetInv];
        const activeIdx = activeHotbarSlot - 1;
        
        if (sourceIdx !== null) {
            const temp = newInv[idx];
            newInv[idx] = newInv[sourceIdx];
            newInv[sourceIdx] = temp;
        } else {
            const temp = newInv[idx];
            newInv[idx] = newInv[activeIdx];
            newInv[activeIdx] = temp;
        }
        
        setTargetInv(newInv);
    };

    const handleStart = () => {
        setItems(INITIAL_ITEMS);
        setNormalInventory(Array(10).fill(null));
        setMovingItems([]);
        setPlacedBelts(DEFAULT_BELTS);
        setPlacedMachines(DEFAULT_MACHINES);
        setPlacedProps([]);
        setResults(["공정 시뮬레이션 초기화 완료"]);
        resetSystem();
        setGameState('intro');
    };

    // ========================================================================
    // 5. 키보드 입력 관리 (useEffect)
    // ========================================================================
    useEffect(() => {
        const onKeyDown = (e) => {
            if (gameState !== 'playing') return;

            if (e.code === 'Escape') {
                if (isBuildInventoryOpen) setIsBuildInventoryOpen(false);
                else if (isInventoryOpen) setIsInventoryOpen(false);
                else setIsSettingsOpen(prev => !prev);
                return;
            }

            if (e.code === 'F5') {
                e.preventDefault();
                setSettings(prev => ({
                    ...prev,
                    perspective: prev.perspective === 'first' ? 'third' : 'first'
                }));
                return;
            }
            
            if (e.code === 'KeyB') setBuildMode(prev => !prev);
            if (e.code === 'Tab' || e.code === 'KeyI') { e.preventDefault(); setIsInventoryOpen(prev => !prev); }
            if (e.code === 'KeyV') setIsBuildInventoryOpen(prev => !prev);
            
            if (e.code.startsWith('Digit')) {
                const numStr = e.code.replace('Digit', '');
                let num = parseInt(numStr);
                if (num === 0) num = 10;
                if (num >= 1 && num <= 10) setActiveHotbarSlot(num);
            }

            if (isInventoryOpen || isSettingsOpen || isBuildInventoryOpen) return;

            const [px, , pz] = playerPositionRef.current;

            // [E] 또는 [F] 키: 상호작용 (아이템 줍기 & 벨트에 올리기 & 산소 충전)
            if ((e.code === 'KeyF' || (e.code === 'KeyE' && !stateRef.current.buildMode))) {
                const { items: curItems, currentInventory: curInv, tutorialStep: curTutStep } = stateRef.current;
                
                // 0. 산소 충전기 상호작용 체크
                if (handleChargeInteraction()) {
                    return;
                }
                
                // 1. 바닥에 있는 아이템 줍기 시도 (거리 3.5 이내)
                const itemToPick = curItems.find(item => {
                    const dist = Math.sqrt(Math.pow(px - item.position[0], 2) + Math.pow(pz - item.position[2], 2));
                    return dist < 3.5;
                });

                if (itemToPick) {
                    const emptyIdx = stateRef.current.normalInventory.findIndex(slot => slot === null);
                    if (emptyIdx !== -1) {
                        setItems(prev => prev.filter(i => i.id !== itemToPick.id));
                        const newInv = [...stateRef.current.normalInventory];
                        newInv[emptyIdx] = { ...itemToPick };
                        setNormalInventory(newInv);
                        setResults(prev => [`아이템 습득: ${itemToPick.name || itemToPick.type}`, ...prev].slice(0, 5));
                        
                        // 0일차 튜토리얼 1단계 완료 트리거
                        if (currentDay === 0 && curTutStep === 'pick_up') {
                            setTutorialStep('equip');
                        }
                        return;
                    }
                }

                // 2. 들고 있는 아이템을 컨베이어 벨트 위에 올려놓기 (거리 2.5 이내)
                const nearBelt = stateRef.current.placedBelts.find(b => Math.sqrt(Math.pow(px - b.position[0], 2) + Math.pow(pz - b.position[2], 2)) < 2.5);
                if (nearBelt && stateRef.current.selectedItem && !stateRef.current.buildMode) {
                    const { placedBelts, placedMachines } = stateRef.current;
                    let isStartingBelt = true;
                    
                    const checkFeedsInto = (obj) => {
                        const angle = typeof obj.rotation === 'number' ? obj.rotation : obj.rotation[1];
                        const rotMod = ((Math.round(angle / (Math.PI / 2)) % 4) + 4) % 4;
                        let fx = obj.position[0], fz = obj.position[2];
                        if (rotMod === 0) fz -= 2.5;
                        if (rotMod === 1) fx -= 2.5;
                        if (rotMod === 2) fz += 2.5;
                        if (rotMod === 3) fx += 2.5;
                        return Math.abs(fx - nearBelt.position[0]) < 1.0 && Math.abs(fz - nearBelt.position[2]) < 1.0;
                    };

                    for (const b of placedBelts) {
                        if (b.id !== nearBelt.id && checkFeedsInto(b)) isStartingBelt = false;
                    }
                    for (const m of placedMachines) {
                        if (m.type !== 'SHIPPING_BIN' && checkFeedsInto(m)) isStartingBelt = false;
                    }

                    if (!isStartingBelt) {
                        const alertId = Date.now();
                        const alertX = px + (nearBelt.position[0] - px) * 0.5;
                        const alertZ = pz + (nearBelt.position[2] - pz) * 0.5;
                        setWorldAlerts(prev => [...prev, { id: alertId, text: "처음 시작하는 벨트 위에 올려놔주세요", position: [alertX, 1.6, alertZ] }]);
                        
                        setTimeout(() => {
                            setWorldAlerts(prev => prev.filter(a => a.id !== alertId));
                        }, 2500);
                        return;
                    }

                    // 정상 배치
                    const sel = stateRef.current.selectedItem;
                    setMovingItems(prev => [...prev, { ...sel, id: `mov-${Date.now()}`, position: [nearBelt.position[0], 0.5, nearBelt.position[2]], status: 'MOVING' }]);
                    
                    const newInv = [...curInv];
                    newInv[stateRef.current.activeHotbarSlot - 1] = null;
                    setNormalInventory(newInv);
                    setResults(prev => ["벨트에 아이템 배치함", ...prev].slice(0, 5));

                    // 0일차 튜토리얼 3단계 완료 및 1일차 즉시 진입
                    if (currentDay === 0 && curTutStep === 'place_belt' && nearBelt.position[0] === 15 && nearBelt.position[2] === 5) {
                        setTutorialStep('completed');
                        setResults(prev => ["★ 튜토리얼 완료! 1일차 가동 시작 (기본 산소 구독세 $100)", ...prev].slice(0, 5));
                        setCurrentDay(1);
                        setGameHour(8);
                        setGameMinute(0);
                    }
                }
            }

            // [G] 키: 들고 있는 아이템 버리기 (또는 판매)
            if (e.code === 'KeyG' && stateRef.current.selectedItem && !stateRef.current.buildMode) {
                const { selectedItem: sel, activeHotbarSlot: slot, buildMode: curBuild } = stateRef.current;
                const nearSellZone = stateRef.current.placedMachines.find(m => m.type === 'SHIPPING_BIN' && Math.sqrt(Math.pow(px - m.position[0], 2) + Math.pow(pz - m.position[2], 2)) < 4.0);
                
                if (nearSellZone && (sel.isProduct || sel.isPurifierCore)) {
                    const val = sel.value || 15;
                    setMoney(prev => prev + val);
                    setResults(prev => [`판매 완료: ${sel.name || sel.type} ($${val})`, ...prev].slice(0, 5));
                    
                    // 5일차 목표 수동 판매 대응
                    if (sel.isPurifierCore && currentDay === 5) {
                        setShippedPurifierCore(true);
                        setResults(prev => [`[★목표★] 대기 정화 코어 직접 납품 성공!`, ...prev].slice(0, 5));
                    }
                } else {
                    const dropPos = [px + (Math.random() - 0.5), 0.3, pz + (Math.random() - 0.5)];
                    setItems(prev => [...prev, { ...sel, id: `trash-${Date.now()}`, position: dropPos, status: 'IDLE' }]);
                    setResults(prev => ["아이템을 버림", ...prev].slice(0, 5));
                }
                
                const newInv = [...stateRef.current.currentInventory];
                newInv[slot - 1] = null;
                if (curBuild) setBuildInventory(newInv);
                else setNormalInventory(newInv);
            }
        };

        const onWheel = (e) => {
            if (gameState === 'playing') {
                setActiveHotbarSlot(prev => {
                    let next = prev + (e.deltaY > 0 ? 1 : -1);
                    if (next > 10) next = 1; if (next < 1) next = 10;
                    return next;
                });
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('wheel', onWheel);
        return () => { 
            window.removeEventListener('keydown', onKeyDown); 
            window.removeEventListener('wheel', onWheel); 
        };
    }, [gameState, currentDay, isInventoryOpen, isSettingsOpen, isBuildInventoryOpen, handleChargeInteraction, setCurrentDay, setGameHour, setGameMinute, setShippedPurifierCore, setTutorialStep]);

    // ========================================================================
    // 6. 컴포넌트 렌더링
    // ========================================================================
    return (
        <div className="game-container">
            {gameState !== 'intro' && (
                <GameScene 
                    settings={settings}
                    items={items}
                    movingItems={movingItems}
                    worldAlerts={worldAlerts}
                    placedMachines={placedMachines}
                    placedBelts={placedBelts}
                    placedProps={placedProps}
                    buildMode={buildMode}
                    isHandFull={isHandFull}
                    selectedItem={selectedItem}
                    playerRef={playerRef}
                    playerPositionRef={playerPositionRef}
                    canLock={canLock}
                    handleUnlock={handleUnlock}
                    onPlaceItem={handlePlaceItem}
                    onDemolishItem={handleDemolishItem}
                    isInventoryOpen={isInventoryOpen}
                    isSettingsOpen={isSettingsOpen}
                    isBuildInventoryOpen={isBuildInventoryOpen}
                    currentDay={currentDay}
                    tutorialStep={tutorialStep}
                />
            )}

            <OverlayUI 
                gameState={gameState}
                money={money}
                results={results}
                isInventoryOpen={isInventoryOpen}
                isSettingsOpen={isSettingsOpen}
                isBuildInventoryOpen={isBuildInventoryOpen}
                buildMode={buildMode}
                currentInventory={currentInventory}
                normalInventory={normalInventory}
                buildInventory={buildInventory}
                activeHotbarSlot={activeHotbarSlot}
                setActiveHotbarSlot={setActiveHotbarSlot}
                settings={settings}
                hudInfo={hudInfo}
                setGameState={setGameState}
                setSettings={setSettings}
                setIsSettingsOpen={setIsSettingsOpen}
                setIsInventoryOpen={setIsInventoryOpen}
                setIsBuildInventoryOpen={setIsBuildInventoryOpen}
                handleInventoryClick={handleInventoryClick}
                handleStart={handleStart}
                oxygen={oxygen}
                isCompromised={isCompromised}
                handleReboot={handleReboot}
                currentDay={currentDay}
                gameHour={gameHour}
                gameMinute={gameMinute}
                shippedPurifierCore={shippedPurifierCore}
                tutorialStep={tutorialStep}
                setTutorialStep={setTutorialStep}
                onEquipBuildItem={(itemId, targetIdx = null) => {
                    const found = BUILD_CATALOG.find(c => c.id === itemId);
                    if (found) {
                        const newInv = [...buildInventory];
                        const slotToUse = targetIdx !== null ? targetIdx : (activeHotbarSlot - 1);
                        newInv[slotToUse] = found;
                        setBuildInventory(newInv);
                        if (targetIdx === null) setBuildMode(true);
                    }
                }}
            />
        </div>
    );
}