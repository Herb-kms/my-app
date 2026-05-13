import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import * as THREE from 'three';

// Data & Hooks
import { INITIAL_ITEMS, DEFAULT_MACHINES, DEFAULT_BELTS, BUILD_CATALOG } from './data/constants';
import { useFactorySimulation } from './hooks/useFactorySimulation';

// Components
import { GameScene } from './components/3D/GameScene';
import { OverlayUI } from './components/UI/OverlayUI';

export default function App() {
    return <GameContent />;
}

function GameContent() {
    // 1. 상태 관리
    const [gameState, setGameState] = useState('lobby');
    const [money, setMoney] = useState(0);
    const [items, setItems] = useState(INITIAL_ITEMS);
    const [movingItems, setMovingItems] = useState([]);
    const movingItemsRef = useRef([]);
    const [results, setResults] = useState([]);
    
    const [placedMachines, setPlacedMachines] = useState(DEFAULT_MACHINES);
    const [placedBelts, setPlacedBelts] = useState(DEFAULT_BELTS);
    const [placedProps, setPlacedProps] = useState([]);
    
    const [normalInventory, setNormalInventory] = useState(Array(16).fill(null));
    const [buildInventory, setBuildInventory] = useState(() => {
        const inv = Array(16).fill(null);
        BUILD_CATALOG.forEach((item, i) => { if (i < 16) inv[i] = item; });
        return inv;
    });
    const [activeHotbarSlot, setActiveHotbarSlot] = useState(1);
    
    const [buildMode, setBuildMode] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [isBuildInventoryOpen, setIsBuildInventoryOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [canLock, setCanLock] = useState(true);
    
    const [settings, setSettings] = useState({
        perspective: 'third',
        graphicsQuality: 'high',
        zoom: 45,
        volume: 80,
        sensitivity: 1.0
    });

    const playerRef = useRef();
    const playerPositionRef = useRef([10, 0, 8]);
    const currentInventory = buildMode ? buildInventory : normalInventory;
    const selectedItem = currentInventory[activeHotbarSlot - 1];
    // isHandFull: 일반 인벤토리(normalInventory) 기준으로만 계산 (빌드 인벤토리는 항상 풀이므로 제외)
    const isHandFull = normalInventory.filter(slot => slot !== null).length >= 16;

    // 2. 시뮬레이션 및 HUD 정보
    useEffect(() => { movingItemsRef.current = movingItems; }, [movingItems]);
    useFactorySimulation({
        gameState, movingItemsRef, placedMachines, placedBelts, 
        items, setItems, setMovingItems, setMoney, setResults
    });

    const activeProcessingItem = movingItems.find(i => i.status === 'PROCESSING');
    const hudInfo = {
        isProcessing: !!activeProcessingItem,
        stageProgress: activeProcessingItem ? activeProcessingItem.machineProgress : 0,
        currentStageIdx: activeProcessingItem ? activeProcessingItem.currentStageIdx || 0 : 0,
        STAGES: ["SORTING", "CRUSHING", "CLEANING", "DRYING", "PACKAGING"]
    };

    // 3. 핵심 핸들러 (복구된 기능들)
    const handlePlaceItem = (itemData) => {
        if (!itemData.type) return;
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
        setResults(prev => [`Placed: ${itemData.type}`, ...prev].slice(0, 5));
    };

    const handleDemolishItem = ([x, z]) => {
        const threshold = 1.2;
        setPlacedMachines(prev => prev.filter(m => Math.abs(m.position[0] - x) > threshold || Math.abs(m.position[2] - z) > threshold));
        setPlacedBelts(prev => prev.filter(b => Math.abs(b.position[0] - x) > threshold || Math.abs(b.position[2] - z) > threshold));
        setPlacedProps(prev => prev.filter(p => Math.abs(p.position[0] - x) > threshold || Math.abs(p.position[2] - z) > threshold));
        setItems(prev => prev.filter(i => Math.abs(i.position[0] - x) > threshold || Math.abs(i.position[2] - z) > threshold));
        setResults(prev => ["Demolished Object", ...prev].slice(0, 5));
    };

    const handleUnlock = useCallback(() => {
        setCanLock(false);
        setTimeout(() => setCanLock(true), 1200);
    }, []);

    const handleInventoryClick = (idx) => {
        const newInv = [...currentInventory];
        const activeIdx = activeHotbarSlot - 1;
        const temp = newInv[idx];
        newInv[idx] = newInv[activeIdx];
        newInv[activeIdx] = temp;
        if (buildMode) setBuildInventory(newInv);
        else setNormalInventory(newInv);
    };

    const handleStart = () => {
        setItems(INITIAL_ITEMS);
        setNormalInventory(Array(16).fill(null));
        setMovingItems([]);
        setPlacedBelts(DEFAULT_BELTS);
        setPlacedMachines(DEFAULT_MACHINES);
        setPlacedProps([]);
        setResults(["Simulation Initialized"]);
        setGameState('intro');
    };

    // 4. 입력 관리 (줍기/던지기/판매 로직 포함)
    useEffect(() => {
        const onKeyDown = (e) => {
            if (gameState !== 'playing') return;

            // UI Toggle
            if (e.code === 'Escape') {
                if (isBuildInventoryOpen) setIsBuildInventoryOpen(false);
                else if (isInventoryOpen) setIsInventoryOpen(false);
                else setIsSettingsOpen(prev => !prev);
                return;
            }
            // F5: 1인칭 / 3인칭 전환
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
            
            // Hotbar select
            if (e.code.startsWith('Digit')) {
                const num = parseInt(e.code.replace('Digit', ''));
                if (num >= 1 && num <= 8) setActiveHotbarSlot(num);
            }

            if (isInventoryOpen || isSettingsOpen || isBuildInventoryOpen) return;

            const [px, , pz] = playerPositionRef.current;

            // Pick Up (F) — 건축 모드일 때는 E키를 회전에 쓰므로 F만 사용
            if ((e.code === 'KeyF' || (e.code === 'KeyE' && !buildMode))) {
                const itemToPick = items.find(item => {
                    const dist = Math.sqrt(Math.pow(px - item.position[0], 2) + Math.pow(pz - item.position[2], 2));
                    return dist < 3.5;
                });

                if (itemToPick) {
                    const emptyIdx = currentInventory.findIndex(slot => slot === null);
                    if (emptyIdx !== -1) {
                        setItems(prev => prev.filter(i => i.id !== itemToPick.id));
                        const newInv = [...currentInventory];
                        newInv[emptyIdx] = itemToPick;
                        if (buildMode) setBuildInventory(newInv);
                        else setNormalInventory(newInv);
                        setResults(prev => [`Picked Up: ${itemToPick.type}`, ...prev].slice(0, 5));
                        return;
                    }
                }

                // Place on Belt
                const nearBelt = placedBelts.find(b => Math.sqrt(Math.pow(px - b.position[0], 2) + Math.pow(pz - b.position[2], 2)) < 2.5);
                if (nearBelt && selectedItem && !buildMode) {
                    setMovingItems(prev => [...prev, { ...selectedItem, id: `mov-${Date.now()}`, position: [nearBelt.position[0], 0.5, nearBelt.position[2]], status: 'MOVING' }]);
                    const newInv = [...currentInventory];
                    newInv[activeHotbarSlot - 1] = null;
                    setNormalInventory(newInv);
                    setResults(prev => ["Placed on Belt", ...prev].slice(0, 5));
                }
            }

            // Drop/Sell (G)
            if (e.code === 'KeyG' && selectedItem && !buildMode) {
                const nearSellZone = placedMachines.find(m => m.type === 'SHIPPING_BIN' && Math.sqrt(Math.pow(px - m.position[0], 2) + Math.pow(pz - m.position[2], 2)) < 4.0);
                if (nearSellZone && selectedItem.isProduct) {
                    const val = selectedItem.value || 15;
                    setMoney(prev => prev + val);
                    setResults(prev => [`SOLD: ${selectedItem.type} for $${val}`, ...prev].slice(0, 5));
                } else {
                    const dropPos = [px + (Math.random() - 0.5), 0.3, pz + (Math.random() - 0.5)];
                    setItems(prev => [...prev, { ...selectedItem, id: `trash-${Date.now()}`, position: dropPos, status: 'IDLE' }]);
                    setResults(prev => ["Dropped Item", ...prev].slice(0, 5));
                }
                const newInv = [...currentInventory];
                newInv[activeHotbarSlot - 1] = null;
                // buildMode 여부에 따라 올바른 인벤토리 업데이트
                if (buildMode) setBuildInventory(newInv);
                else setNormalInventory(newInv);
            }
        };

        const onWheel = (e) => {
            if (gameState === 'playing') {
                setActiveHotbarSlot(prev => {
                    let next = prev + (e.deltaY > 0 ? 1 : -1);
                    if (next > 8) next = 1; if (next < 1) next = 8;
                    return next;
                });
            }
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('wheel', onWheel);
        return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('wheel', onWheel); };
    }, [gameState, items, movingItems, selectedItem, currentInventory, activeHotbarSlot, buildMode, placedBelts, placedMachines, isInventoryOpen, isSettingsOpen, isBuildInventoryOpen]);

    return (
        <div className="game-container">
            {gameState !== 'lobby' && gameState !== 'intro' && (
                <GameScene 
                    settings={settings}
                    items={items}
                    movingItems={movingItems}
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
                activeHotbarSlot={activeHotbarSlot}
                settings={settings}
                hudInfo={hudInfo}
                setGameState={setGameState}
                setSettings={setSettings}
                setIsSettingsOpen={setIsSettingsOpen}
                setIsInventoryOpen={setIsInventoryOpen}
                setIsBuildInventoryOpen={setIsBuildInventoryOpen}
                handleInventoryClick={handleInventoryClick}
                handleStart={handleStart}
                onEquipBuildItem={(itemId) => {
                    // BUILD_CATALOG에서 아이템 찾아 활성 핑바에 장착
                    const found = BUILD_CATALOG.find(c => c.id === itemId);
                    if (found) {
                        const newInv = [...buildInventory];
                        newInv[activeHotbarSlot - 1] = found;
                        setBuildInventory(newInv);
                        setBuildMode(true);
                    }
                }}
            />
        </div>
    );
}