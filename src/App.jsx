import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';
import * as THREE from 'three';

// Data & Hooks
import { INITIAL_ITEMS, DEFAULT_MACHINES, DEFAULT_BELTS } from './data/constants';
import { useFactorySimulation } from './hooks/useFactorySimulation';

// Components
import { GameScene } from './components/3D/GameScene';
import { OverlayUI } from './components/UI/OverlayUI';

export default function App() {
    return <GameContent />;
}

function GameContent() {
    // 1. 상태 관리 (States)
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
    const [buildInventory, setBuildInventory] = useState(Array(16).fill(null));
    const [activeHotbarSlot, setActiveHotbarSlot] = useState(1);
    
    const [buildMode, setBuildMode] = useState(false);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [isBuildInventoryOpen, setIsBuildInventoryOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [canLock, setCanLock] = useState(true);
    
    const [settings, setSettings] = useState({
        perspective: 'third',
        graphicsQuality: 'high',
        zoom: 5,
        volume: 80
    });

    const playerRef = useRef();
    const currentInventory = buildMode ? buildInventory : normalInventory;
    const selectedItem = currentInventory[activeHotbarSlot - 1];

    // 2. 시뮬레이션 동기화 및 실행
    useEffect(() => { movingItemsRef.current = movingItems; }, [movingItems]);
    
    useFactorySimulation({
        gameState, movingItemsRef, placedMachines, placedBelts, 
        items, setItems, setMovingItems, setMoney, setResults
    });

    // 3. 핸들러 로직 (Handlers)
    const handleUnlock = useCallback(() => {
        setCanLock(false);
        setTimeout(() => setCanLock(true), 1200);
    }, []);

    const handleInventoryClick = (idx) => {
        if (idx === undefined || idx === null) return;
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
        setMovingItems([]);
        setPlacedBelts(DEFAULT_BELTS);
        setPlacedMachines(DEFAULT_MACHINES);
        setPlacedProps([]);
        setResults(["Simulation Initialized"]);
        setGameState('intro');
    };

    // 4. 입력 관리 (Input Handling)
    useEffect(() => {
        const onKeyDown = (e) => {
            if (gameState !== 'playing') return;
            if (e.code === 'KeyB') setBuildMode(prev => !prev);
            if (e.code === 'Tab' || e.code === 'KeyI') setIsInventoryOpen(prev => !prev);
            if (e.code === 'KeyV') setIsBuildInventoryOpen(prev => !prev);
            if (e.code.startsWith('Digit')) {
                const num = parseInt(e.code.replace('Digit', ''));
                if (num >= 1 && num <= 8) setActiveHotbarSlot(num);
            }
        };
        const onWheel = (e) => {
            if (gameState === 'playing') {
                setSettings(prev => ({ ...prev, zoom: Math.max(0, Math.min(100, prev.zoom + (e.deltaY > 0 ? 5 : -5))) }));
            }
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('wheel', onWheel);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('wheel', onWheel);
        };
    }, [gameState]);

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
                    selectedItem={selectedItem}
                    playerRef={playerRef}
                    canLock={canLock}
                    handleUnlock={handleUnlock}
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
                setGameState={setGameState}
                setSettings={setSettings}
                setIsSettingsOpen={setIsSettingsOpen}
                setIsInventoryOpen={setIsInventoryOpen}
                setIsBuildInventoryOpen={setIsBuildInventoryOpen}
                handleInventoryClick={handleInventoryClick}
                handleStart={handleStart}
            />
        </div>
    );
}