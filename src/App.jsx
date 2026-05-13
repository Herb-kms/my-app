import React, { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Environment,
    ContactShadows,
    PerspectiveCamera,
    KeyboardControls,
    useKeyboardControls,
    PointerLockControls
} from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

// 모듈화된 상수 및 컴포넌트 임포트
import { INITIAL_ITEMS, STAGES } from './constants/gameConstants';
import { Player, FirstPersonHeldItem } from './components/3D/PlayerComponents';
import { ConveyorBelt, Machine } from './components/3D/MachineComponents';
import { TrashItem } from './components/3D/ItemComponents';
import { Floor, ShippingBin, PropComponents } from './components/3D/EnvironmentComponents';
import { BuilderController } from './components/3D/BuilderComponents';
import { Lobby, HUD, SettingsMenu, BuildInventory, BUILD_CATALOG } from './components/UI/UIComponents';

// 1인칭/3인칭 이동 및 카메라 컨트롤러
function PlayerController({
    gameState,
    isInventoryOpen,
    isSettingsOpen,
    settings,
    playerPositionRef,
    playerRef
}) {
    const [, getKeys] = useKeyboardControls();
    const velocity = useRef(0);
    const { sensitivity, zoom, perspective } = settings;

    useFrame((state, delta) => {
        if (gameState !== 'playing' || isInventoryOpen || isSettingsOpen) return;

        const { forward, backward, left, right, jump } = getKeys();

        // 이동 입력 계산
        const speed = 7 * delta * sensitivity;
        const frontVector = new THREE.Vector3(0, 0, Number(backward) - Number(forward));
        const sideVector = new THREE.Vector3(Number(left) - Number(right), 0, 0);
        const direction = new THREE.Vector3();

        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(speed)
            .applyQuaternion(state.camera.quaternion);

        // 1. 물리/이동 적용 (무조건 플레이어 몸체 기준)
        if (playerRef.current) {
            // 수평 이동
            playerRef.current.position.x += direction.x;
            playerRef.current.position.z += direction.z;

            // 중력 및 점프
            if (jump && playerRef.current.position.y <= 0.05) {
                velocity.current = 10;
            }
            velocity.current -= 30 * delta;
            playerRef.current.position.y += velocity.current * delta;

            if (playerRef.current.position.y < 0) {
                playerRef.current.position.y = 0;
                velocity.current = 0;
            }

            // 전역 좌표 레퍼런스 업데이트
            if (playerPositionRef.current) {
                playerPositionRef.current = [
                    playerRef.current.position.x,
                    playerRef.current.position.y,
                    playerRef.current.position.z
                ];
            }
        }

        // 2. 카메라 목표 위치 계산
        const targetPos = new THREE.Vector3();
        if (perspective === 'first') {
            // 1인칭: 플레이어 머리 위치
            targetPos.set(
                playerRef.current.position.x,
                playerRef.current.position.y + 2.0, // 눈높이
                playerRef.current.position.z
            );
        } else {
            // 3인칭: 배그 스타일 숄더뷰 (약간 낮고 오른쪽 어깨 쪽)
            const heightOffset = 1.8 + (zoom * 0.02);
            const depthOffset = 3.5 + (zoom * 0.05);
            const shoulderOffset = 0.6; // 오른쪽 어깨 쪽으로 살짝 이동

            const offset = new THREE.Vector3(shoulderOffset, heightOffset, depthOffset);
            offset.applyQuaternion(state.camera.quaternion);
            targetPos.set(
                playerRef.current.position.x + offset.x,
                playerRef.current.position.y + offset.y,
                playerRef.current.position.z + offset.z
            );
        }

        // 3. 카메라 이동 (전환 부드럽게)
        // 1인칭일 때는 반응성이 중요하므로 아주 빠르게 붙임
        const lerpFactor = perspective === 'first' ? 0.4 : 0.15;
        state.camera.position.lerp(targetPos, lerpFactor);

        // 1인칭일 때 정밀도를 위해 아주 가까우면 스냅
        if (perspective === 'first' && state.camera.position.distanceTo(targetPos) < 0.01) {
            state.camera.position.copy(targetPos);
        }
    });

    return null;
}

function GameContent() {
    const [gameState, setGameState] = useState('start');

    // 게임 설정 상태
    const [settings, setSettings] = useState({
        sensitivity: 1.0,
        zoom: 50,
        perspective: 'first', // 'first' or 'third'
        graphicsQuality: 'high'
    });
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isBuildInventoryOpen, setIsBuildInventoryOpen] = useState(false);

    // 기본 공장 레이아웃 (직선 컨베이어 + 기계 5종)
    const DEFAULT_BELTS = [
        { id: 'db1', type: 'CONVEYOR', position: [0, 0, 12.5], rotation: [0, 0, 0] },
        { id: 'db2', type: 'CONVEYOR', position: [0, 0, 10], rotation: [0, 0, 0] },
        { id: 'db3', type: 'CONVEYOR', position: [0, 0, 7.5], rotation: [0, 0, 0] },
        { id: 'db4', type: 'CONVEYOR', position: [0, 0, 2.5], rotation: [0, 0, 0] },
        { id: 'db5', type: 'CONVEYOR', position: [0, 0, 0], rotation: [0, 0, 0] },
        { id: 'db6', type: 'CONVEYOR', position: [0, 0, -5], rotation: [0, 0, 0] },
        { id: 'db7', type: 'CONVEYOR', position: [0, 0, -7.5], rotation: [0, 0, 0] },
        { id: 'db8', type: 'CONVEYOR', position: [0, 0, -12.5], rotation: [0, 0, 0] },
        { id: 'db9', type: 'CONVEYOR', position: [0, 0, -15], rotation: [0, 0, 0] },
        { id: 'db10', type: 'CONVEYOR', position: [0, 0, -20], rotation: [0, 0, 0] },
        { id: 'db11', type: 'CONVEYOR', position: [0, 0, -22.5], rotation: [0, 0, 0] },
        { id: 'db12', type: 'CONVEYOR', position: [0, 0, -27.5], rotation: [0, 0, 0] },
        { id: 'db13', type: 'CONVEYOR', position: [0, 0, -30], rotation: [0, 0, 0] },
    ];
    const DEFAULT_MACHINES = [
        { id: 'dm1', type: 'SORTING', position: [0, 0, 5], rotation: [0, 0, 0] },
        { id: 'dm2', type: 'CRUSHING', position: [0, 0, -2.5], rotation: [0, 0, 0] },
        { id: 'dm3', type: 'CLEANING', position: [0, 0, -10], rotation: [0, 0, 0] },
        { id: 'dm4', type: 'DRYING', position: [0, 0, -17.5], rotation: [0, 0, 0] },
        { id: 'dm5', type: 'PACKAGING', position: [0, 0, -25], rotation: [0, 0, 0] },
        { id: 'dm-sell', type: 'SHIPPING_BIN', position: [-10, 0, 10], rotation: [0, 0, 0] },
    ];

    // 건축 모드 상태
    const [buildMode, setBuildMode] = useState(false);
    const [activeHotbarSlot, setActiveHotbarSlot] = useState(1);
    const [placedMachines, setPlacedMachines] = useState(DEFAULT_MACHINES);
    const [placedBelts, setPlacedBelts] = useState(DEFAULT_BELTS);
    const [placedProps, setPlacedProps] = useState([]);

    const handlePlaceItem = (itemData) => {
        if (itemData.type === "CONVEYOR") {
            setPlacedBelts(prev => [...prev, { ...itemData, id: `belt-${Date.now()}` }]);
        } else if (itemData.type.startsWith("ITEM_")) {
            const trashType = itemData.type.split("_")[1];
            const formattedType = trashType.charAt(0).toUpperCase() + trashType.slice(1).toLowerCase();
            const colorMap = { "Plastic": "#E0E0E0", "Can": "#C0C0C0", "Glass": "#ADD8E6" };
            setItems(prev => [...prev, {
                id: `trash-${Date.now()}`,
                type: formattedType,
                color: colorMap[formattedType] || "#FFF",
                position: [itemData.position[0], 0.3, itemData.position[2]]
            }]);
        } else if (["SHELF", "CRATE", "BARREL", "WALL", "FLOOR"].includes(itemData.type)) {
            setPlacedProps(prev => [...prev, { ...itemData, id: `prop-${Date.now()}` }]);
        } else {
            setPlacedMachines(prev => [...prev, { ...itemData, id: `machine-${Date.now()}` }]);
        }
    };

    const handleDemolishItem = ([x, z]) => {
        const threshold = 1.0;
        setPlacedMachines(prev => prev.filter(m => Math.abs(m.position[0] - x) > threshold || Math.abs(m.position[2] - z) > threshold));
        setPlacedBelts(prev => prev.filter(b => Math.abs(b.position[0] - x) > threshold || Math.abs(b.position[2] - z) > threshold));
        setPlacedProps(prev => prev.filter(p => Math.abs(p.position[0] - x) > threshold || Math.abs(p.position[2] - z) > threshold));
        setItems(prev => prev.filter(i => Math.abs(i.position[0] - x) > threshold || Math.abs(i.position[2] - z) > threshold));
    };

    // 게임 상태 정의
    const playerPositionRef = useRef([12, 0, 12]);
    const [items, setItems] = useState(INITIAL_ITEMS);

    // Unified Inventory System (16 slots = 8 hotbar + 8 storage)
    const [normalInventory, setNormalInventory] = useState(Array(16).fill(null));
    const [buildInventory, setBuildInventory] = useState(() => {
        const inv = Array(16).fill(null);
        BUILD_CATALOG.forEach((item, i) => { if (i < 16) inv[i] = item; });
        return inv;
    });

    const currentInventory = buildMode ? buildInventory : normalInventory;
    const selectedItem = currentInventory[activeHotbarSlot - 1] || null;

    const [money, setMoney] = useState(0);
    const [movingItems, setMovingItems] = useState([]);
    const [results, setResults] = useState([]);
    const [isInventoryOpen, setIsInventoryOpen] = useState(false);
    const [canLock, setCanLock] = useState(true);
    const playerRef = useRef();

    // 마우스 잠금 해제 시 쿨타임 적용 (브라우저 에러 방지)
    const handleUnlock = () => {
        setCanLock(false);
        setTimeout(() => setCanLock(true), 1200); // 1.2초 후 다시 잠금 가능
    };

    // 메인 HUD 정보 호환용 (첫 번째로 처리 중인 아이템 기준)
    const activeProcessingItem = movingItems.find(i => i.status === 'PROCESSING');
    const isProcessingHUD = !!activeProcessingItem;
    const stageProgressHUD = activeProcessingItem ? activeProcessingItem.machineProgress : 0;
    const currentStageIdxHUD = activeProcessingItem ? activeProcessingItem.currentStageIdx || 0 : 0;
    const isStationaryHUD = true;

    // ESC 및 V 키 리스너
    useEffect(() => {
        const onKeyDown = (e) => {
            if (gameState !== 'playing') return;

            if (e.code === 'Escape') {
                if (isBuildInventoryOpen) {
                    setIsBuildInventoryOpen(false);
                } else {
                    setIsSettingsOpen(prev => !prev);
                    setIsInventoryOpen(false);
                }
            }
            if (e.code === 'Tab' || e.code === 'KeyI') {
                e.preventDefault();
                setIsInventoryOpen(prev => !prev);
                setIsSettingsOpen(false);
                setIsBuildInventoryOpen(false);
            }
            if (e.code === 'KeyV') {
                // V키는 빌드 인벤토리 토글로 변경됨
                setIsBuildInventoryOpen(prev => !prev);
                setIsInventoryOpen(false);
                setIsSettingsOpen(false);
            }
            if (e.code === 'KeyB') {
                // B키로 건축 모드 ON/OFF 토글
                setBuildMode(prev => {
                    if (prev) setResults(r => ['Build Mode OFF', ...r].slice(0, 5));
                    else setResults(r => ['Build Mode ON  [B]=Exit  [V]=Catalog', ...r].slice(0, 5));
                    return !prev;
                });
                setIsBuildInventoryOpen(false);
            }

            // 숫자 키패드 1~8: 핫바 아이템 선택
            if (e.code.startsWith('Digit') || e.code.startsWith('Numpad')) {
                const digit = parseInt(e.code.replace('Digit', '').replace('Numpad', ''));
                if (digit >= 1 && digit <= 8) {
                    setActiveHotbarSlot(digit);
                    const targetItem = currentInventory[digit - 1];
                    if (targetItem) {
                        setResults(prev => [`Selected: ${targetItem.name || targetItem.type}`, ...prev].slice(0, 5));
                    }
                }
            }

            if (isInventoryOpen || isSettingsOpen || isBuildInventoryOpen) return;

            const [x, , z] = playerPositionRef.current;

            if (e.code === 'KeyF' || e.code === 'KeyE') {
                // 1. 일반 아이템 줍기 (필드에 있는 것만 가능, 벨트 위 아이템은 줍기 불가)
                const itemToPick = items.find(item => {
                    const dist = Math.sqrt(Math.pow(x - item.position[0], 2) + Math.pow(z - item.position[2], 2));
                    return dist < 4.0;
                });

                if (itemToPick) {
                    const firstEmptyIdx = currentInventory.findIndex(slot => slot === null);
                    if (firstEmptyIdx === -1) {
                        setResults(prev => ["Inventory is FULL!", ...prev].slice(0, 5));
                        return;
                    }
                    setItems(prev => prev.filter(i => i.id !== itemToPick.id));
                    setMovingItems(prev => prev.filter(i => i.id !== itemToPick.id));

                    const newInv = [...currentInventory];
                    newInv[firstEmptyIdx] = itemToPick;
                    if (buildMode) setBuildInventory(newInv);
                    else setNormalInventory(newInv);
                    return;
                }

                // 2. 벨트 투입 (가장 가까운 배치된 벨트 탐색)
                const nearestBelt = placedBelts.find(belt => {
                    return Math.sqrt(Math.pow(x - belt.position[0], 2) + Math.pow(z - belt.position[2], 2)) < 3.0;
                });

                if (nearestBelt && selectedItem && !buildMode) {
                    setMovingItems(prev => [...prev, {
                        ...selectedItem,
                        id: `moving-${Date.now()}`,
                        position: [nearestBelt.position[0], 0.5, nearestBelt.position[2]],
                        status: 'MOVING'
                    }]);

                    const newInv = [...currentInventory];
                    newInv[activeHotbarSlot - 1] = null;
                    if (buildMode) setBuildInventory(newInv);
                    else setNormalInventory(newInv);

                    setResults(prev => ["Placed on Belt", ...prev].slice(0, 5));
                }
            }
            if (e.code === 'KeyG' && selectedItem && !buildMode) {
                const dropPos = [x + (Math.random() - 0.5) * 2, 0.3, z + (Math.random() - 0.5) * 2];
                // 설치된 모든 Sell Zone 중 가장 가까운 것 탐색
                const nearestSellZone = placedMachines.find(m => 
                    m.type === 'SHIPPING_BIN' && 
                    Math.sqrt(Math.pow(x - m.position[0], 2) + Math.pow(z - m.position[2], 2)) < 5.0
                );

                if (nearestSellZone && (selectedItem.isProduct || selectedItem.type === 'Upcycled')) {
                    const sellValue = selectedItem.value || 10;
                    setMoney(prev => prev + sellValue);
                    setResults(prev => [`SOLD: ${selectedItem.type} for $${sellValue}`, ...prev].slice(0, 5));
                } else {
                    const newItemId = `trash-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
                    setItems(prev => [...prev, { ...selectedItem, position: dropPos, id: newItemId }]);
                }

                const newInv = [...currentInventory];
                newInv[activeHotbarSlot - 1] = null;
                setNormalInventory(newInv);
            }
        };

        const onWheel = (e) => {
            if (gameState !== 'playing' || isInventoryOpen || isSettingsOpen || isBuildInventoryOpen) return;

            setActiveHotbarSlot(prev => {
                let next = prev + (e.deltaY > 0 ? 1 : -1);
                if (next > 8) next = 1;
                if (next < 1) next = 8;

                const targetItem = currentInventory[next - 1];
                if (targetItem) {
                    setResults(res => [`Selected: ${targetItem.name || targetItem.type}`, ...res].slice(0, 5));
                }
                return next;
            });
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('wheel', onWheel, { passive: true });

        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('wheel', onWheel);
        };
    }, [gameState, items, movingItems, isInventoryOpen, isSettingsOpen, isBuildInventoryOpen, selectedItem, currentInventory, activeHotbarSlot, settings.perspective, buildMode, placedBelts]);

    // 시뮬레이션 메인 루프 (샌드박스 라우팅)
    useEffect(() => {
        if (gameState !== 'playing') return;
        const interval = setInterval(() => {
            setMovingItems(prevItems => {
                let changed = false;
                const nextItems = prevItems.map(item => {
                    if (item.status === 'MOVING') {
                        changed = true;
                        const gridX = Math.round(item.position[0] / 2.5) * 2.5;
                        const gridZ = Math.round(item.position[2] / 2.5) * 2.5;

                        // Check Machine (기계 및 판매 구역 감지)
                        const machine = placedMachines.find(m => Math.abs(m.position[0] - gridX) < 1.2 && Math.abs(m.position[2] - gridZ) < 1.2);
                        if (machine) {
                            // 판매 구역(SHIPPING_BIN)일 경우: 모든 아이템 즉시 판매
                            if (machine.type === 'SHIPPING_BIN') {
                                const val = item.value || 10; // 제품이 아니면 기본값 10원
                                setMoney(prev => prev + val);
                                setResults(prev => [`SOLD: ${item.name || item.type} for $${val}`, ...prev].slice(0, 5));
                                changed = true;
                                return null; // 벨트 및 시뮬레이션에서 즉시 제거
                            }
                            return { ...item, status: 'PROCESSING', machineId: machine.id, machineProgress: 0 };
                        }

                        // Check Belt
                        const belt = placedBelts.find(b => Math.abs(b.position[0] - gridX) < 1.0 && Math.abs(b.position[2] - gridZ) < 1.0);
                        if (belt) {
                            const speed = 0.05;
                            let newX = item.position[0];
                            let newZ = item.position[2];

                            const angle = typeof belt.rotation === 'number' ? belt.rotation : belt.rotation[1];
                            const rotAngle = Math.round(angle / (Math.PI / 2));
                            const rotMod = ((rotAngle % 4) + 4) % 4;

                            if (rotMod === 0 || rotMod === 2) {
                                // Z축 진행 (-Z / +Z)
                                newZ += rotMod === 0 ? -speed : speed;
                                // X축 중심 맞추기
                                let diffX = belt.position[0] - newX;
                                let stepX = diffX * 0.15;
                                if (stepX > speed) stepX = speed;
                                if (stepX < -speed) stepX = -speed;
                                newX += stepX;
                            } else {
                                // X축 진행 (-X / +X)
                                newX += rotMod === 1 ? -speed : speed;
                                // Z축 중심 맞추기
                                let diffZ = belt.position[2] - newZ;
                                let stepZ = diffZ * 0.15;
                                if (stepZ > speed) stepZ = speed;
                                if (stepZ < -speed) stepZ = -speed;
                                newZ += stepZ;
                            }

                            return { ...item, position: [newX, item.position[1], newZ] };
                        }

                        // 벨트가 없으면 필드로 떨어뜨리기
                        const dropItem = { ...item, id: `trash-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, status: 'IDLE' };
                        setItems(prev => [...prev, dropItem]);
                        return null; // movingItems에서 제거됨 (filter(Boolean) 처리 필요)

                    } else if (item.status === 'PROCESSING') {
                        changed = true;
                        const m = placedMachines.find(m => m.id === item.machineId);
                        if (!m) return { ...item, status: 'MOVING' }; // machine deleted by user somehow

                        // 예외 처리: 만약 기계가 판매 구역(SHIPPING_BIN)이라면 여기서도 즉시 판매
                        if (m.type === 'SHIPPING_BIN') {
                            const val = item.value || 10;
                            setMoney(prev => prev + val);
                            setResults(prev => [`SOLD: ${item.name || item.type} for $${val}`, ...prev].slice(0, 5));
                            return null;
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
                    return item; // IDLE status
                });
                return changed ? nextItems.filter(Boolean) : prevItems;
            });
        }, 50);
        return () => clearInterval(interval);
    }, [gameState, placedBelts, placedMachines]);

    const handleInventoryClick = (idx) => {
        if (idx === undefined || idx === null) return;
        const newInv = [...currentInventory];
        const activeIdx = activeHotbarSlot - 1;

        // Swap clicked slot with active hotbar slot
        const temp = newInv[idx];
        newInv[idx] = newInv[activeIdx];
        newInv[activeIdx] = temp;

        if (buildMode) setBuildInventory(newInv);
        else setNormalInventory(newInv);
    };

    const isHandFull = currentInventory.filter(Boolean).length >= 16;

    return (
        <div className="game-container">
            <Canvas shadows={settings.graphicsQuality === 'high'}>
                <PerspectiveCamera
                    makeDefault
                    position={[12, 5, 12]}
                    fov={settings.perspective === 'first' ? 75 : 45 + (settings.zoom / 5)}
                />
                <Environment preset={settings.graphicsQuality === 'high' ? "city" : "night"} />
                <ambientLight intensity={settings.graphicsQuality === 'high' ? 0.5 : 0.3} />
                <spotLight position={[20, 20, 10]} angle={0.3} penumbra={1} castShadow={settings.graphicsQuality === 'high'} intensity={1.5} />
                <spotLight position={[-20, 20, -10]} angle={0.3} penumbra={1} castShadow={settings.graphicsQuality === 'high'} intensity={0.8} color="#4caf50" />

                <PlayerController
                    gameState={gameState}
                    isInventoryOpen={isInventoryOpen}
                    isSettingsOpen={isSettingsOpen || isBuildInventoryOpen}
                    settings={settings}
                    playerPositionRef={playerPositionRef}
                    playerRef={playerRef}
                />
                <BuilderController
                    buildMode={buildMode && !isBuildInventoryOpen}
                    selectedBuildItem={buildMode && selectedItem ? selectedItem.id : null}
                    onPlaceItem={handlePlaceItem}
                    onDemolishItem={handleDemolishItem}
                />

                <Player playerRef={playerRef} perspective={settings.perspective} selectedItem={selectedItem} />
                <FirstPersonHeldItem item={selectedItem} perspective={settings.perspective} />
                <Floor graphicsQuality={settings.graphicsQuality} />
                <ConveyorBelt placedBelts={placedBelts} />
                <Machine
                    placedMachines={placedMachines}
                    movingItems={movingItems}
                />
                <PropComponents placedProps={placedProps} />

                {items.map(item => (
                    <TrashItem
                        key={item.id}
                        item={item}
                        isHandFull={isHandFull}
                    />
                ))}

                {movingItems.map(item => (
                    <TrashItem
                        key={item.id}
                        item={item}
                        currentStageIdx={item.currentStageIdx ?? -1}
                        isHandFull={isHandFull}
                        hidden={item.status === 'PROCESSING'}
                    />
                ))}

                {settings.graphicsQuality === 'high' && (
                    <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={40} blur={2} far={4.5} />
                )}

                {canLock && !isInventoryOpen && !isSettingsOpen && !isBuildInventoryOpen && gameState === 'playing' && (
                    <PointerLockControls onUnlock={handleUnlock} />
                )}
            </Canvas>

            {gameState === 'start' ? (
                <Lobby onStart={() => {
                    setItems(INITIAL_ITEMS);
                    setNormalInventory(Array(16).fill(null));
                    const initBuildInv = Array(16).fill(null);
                    BUILD_CATALOG.forEach((item, i) => { if (i < 16) initBuildInv[i] = item; });
                    setBuildInventory(initBuildInv);
                    setMovingItems([]);
                    setPlacedBelts(DEFAULT_BELTS);
                    setPlacedMachines(DEFAULT_MACHINES);
                    setPlacedProps([]);
                    setResults(["Simulation Initialized"]);
                    setGameState('playing');
                }} />
            ) : (
                <HUD
                    gameState={gameState}
                    setGameState={setGameState}
                    isProcessing={isProcessingHUD}
                    isStationary={isStationaryHUD}
                    STAGES={STAGES}
                    currentStageIdx={currentStageIdxHUD}
                    stageProgress={stageProgressHUD}
                    inventory={currentInventory}
                    results={results}
                    selectedItem={selectedItem}
                    money={money}
                    isInventoryOpen={isInventoryOpen}
                    onInventoryClick={handleInventoryClick}
                    buildMode={buildMode}
                    activeHotbarSlot={activeHotbarSlot}
                />
            )}

            {isSettingsOpen && (
                <SettingsMenu
                    settings={settings}
                    setSettings={setSettings}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}

            <BuildInventory
                isOpen={isBuildInventoryOpen}
                onClose={() => setIsBuildInventoryOpen(false)}
                inventory={buildInventory}
                activeHotbarSlot={activeHotbarSlot}
                onSlotClick={(idx) => setActiveHotbarSlot(idx + 1)}
                onSelectItem={(itemId) => {
                    const targetItem = BUILD_CATALOG.find(item => item.id === itemId);
                    if (targetItem) {
                        const newInv = [...buildInventory];
                        newInv[activeHotbarSlot - 1] = targetItem;
                        setBuildInventory(newInv);
                    }
                    setBuildMode(true);
                }}
            />
        </div>
    );
}

export default function App() {
    return (
        <KeyboardControls
            map={[
                { name: "forward", keys: ["ArrowUp", "KeyW"] },
                { name: "backward", keys: ["ArrowDown", "KeyS"] },
                { name: "left", keys: ["ArrowLeft", "KeyA"] },
                { name: "right", keys: ["ArrowRight", "KeyD"] },
                { name: "jump", keys: ["Space"] },
            ]}>
            <GameContent />
        </KeyboardControls>
    );
}