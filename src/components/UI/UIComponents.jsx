import React from 'react';
import { BUILD_CATALOG } from '../../data/constants';

const ItemImage = ({ item, size = '70%' }) => {
    if (!item) return null;
    const type = item.type || item.id;
    let imgUrl = "https://img.icons8.com/3d-fluency/94/gears.png";
    if (type.includes('Can') || type.includes('CAN')) imgUrl = "https://img.icons8.com/3d-fluency/94/tin-can.png";
    else if (type.includes('Plastic') || type.includes('PLASTIC')) imgUrl = "https://img.icons8.com/3d-fluency/94/water-bottle.png";
    else if (type.includes('Glass') || type.includes('GLASS')) imgUrl = "https://img.icons8.com/3d-fluency/94/wine-bottle.png";
    else if (type === 'CRATE') imgUrl = "https://img.icons8.com/3d-fluency/94/box.png";
    else if (type === 'BARREL') imgUrl = "https://img.icons8.com/3d-fluency/94/barrel.png";
    else if (type === 'WALL') imgUrl = "https://img.icons8.com/3d-fluency/94/brick-wall.png";
    else if (type === 'SHIPPING_BIN') imgUrl = "https://img.icons8.com/3d-fluency/94/safe.png";
    else if (type === 'Upcycled' || type.includes('재생') || type.includes('주괴')) imgUrl = "https://img.icons8.com/3d-fluency/94/sparkling-diamond.png";
    else if (type === 'CONVEYOR') imgUrl = "https://img.icons8.com/3d-fluency/94/conveyor-belt.png";

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img 
                src={imgUrl} 
                alt={item.name} 
                style={{ width: size, height: size, objectFit: 'contain', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.5))' }} 
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }} 
            />
            <span style={{ display: 'none', fontSize: size === '80%' ? '24px' : '20px' }}>{item.icon || '📦'}</span>
        </div>
    );
};




// 동적 레시피 결과 계산 함수
const getExpectedResult = (itemName, itemType, machineName) => {
    if (machineName === "최종 포장기") {
        if (itemType.includes("Can")) return { name: "알루미늄 주괴", type: "알루미늄 주괴" };
        if (itemType.includes("Plastic")) return { name: "재생 플라스틱 칩", type: "재생 플라스틱 칩" };
        if (itemType.includes("Glass")) return { name: "재생 유리 파쇄물", type: "재생 유리 파쇄물" };
    }
    
    const prefixMap = {
        "자동 분류기": "분류된 ",
        "압착 파쇄기": "파쇄된 ",
        "고압 세척기": "세척된 ",
        "열풍 건조기": "건조된 "
    };
    const prefix = prefixMap[machineName] || "";
    
    let base = itemName || itemType;
    if (base.includes("폐알루미늄") || base.includes("Can")) base = "알루미늄 캔";
    else if (base.includes("폐플라스틱") || base.includes("Plastic")) base = "플라스틱";
    else if (base.includes("폐유리") || base.includes("Glass")) base = "유리";
    
    return { name: prefix + base, type: itemType };
};

// 2. HUD (In-Game UI)
export function HUD({
    gameState,
    setGameState,
    isProcessing,
    isStationary,
    STAGES,
    processingItems,
    inventory,
    results,
    selectedItem,
    money,
    isInventoryOpen,
    onInventoryClick,
    buildMode,
    activeHotbarSlot,
    oxygen = 100
}) {
    return (
        <div className={`game-gui ${isInventoryOpen ? 'inventory-view' : ''}`}>
            {/* Header: Minimal UI */}
            <header className="header-minimal">
                <div className="title-section" style={{ display: 'flex', alignItems: 'center', gap: '30px', flexWrap: 'wrap' }}>
                    <h1 style={{ margin: 0, fontSize: '32px' }}>RECYCLING<br/><span style={{ color: 'var(--accent)' }}>FACTORY</span></h1>
                    <div className="balance-badge" style={{ padding: '12px 24px', borderRadius: '35px', border: '2px solid rgba(0, 255, 204, 0.4)', boxShadow: '0 0 15px rgba(0, 255, 204, 0.2)' }}>
                        <span className="money-icon" style={{ fontSize: '28px' }}>$</span>
                        <span className="money-value" style={{ fontSize: '30px', fontWeight: '900' }}>{money.toLocaleString()}</span>
                    </div>
                </div>
                <button className="quit-minimal" onClick={() => setGameState('lobby')}>EXIT</button>
            </header>

            {/* Top Right Processing Status List */}
            {isProcessing && processingItems && processingItems.length > 0 && (
                <div className="processing-container-right" style={{ right: buildMode ? '320px' : '40px' }}>
                    <div className="processing-container-title">
                        SYSTEM OPERATIONS
                    </div>
                    {processingItems.slice(0, 5).map((item) => {
                        const STAGE_COLORS = ['#55aaff', '#ffcc00', '#00ffcc', '#ff5500', '#d477ff'];
                        const stageColor = STAGE_COLORS[item.stageIdx] || 'var(--accent)';
                        const expected = getExpectedResult(item.name, item.type, item.machineName);
                        
                        return (
                            <div key={item.id} className="processing-indicator-item" style={{ borderLeft: `4px solid ${stageColor}` }}>
                                {/* 타이틀 (기계 이름) */}
                                <div className="processing-text" style={{ marginBottom: '8px' }}>
                                    <span style={{ color: stageColor }}>{item.machineName} 진행 중</span>
                                    <span style={{ fontSize: '9px', opacity: 0.5 }}>{Math.floor(item.progress)}%</span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    {/* 현재 아이템 (입력) */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                                        <div style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                            <ItemImage item={{ type: item.type }} size="100%" />
                                        </div>
                                        <span style={{ fontSize: '10px', opacity: 0.8, wordBreak: 'keep-all', lineHeight: '1.2' }}>
                                            {item.name}
                                        </span>
                                    </div>

                                    {/* 진행 상태 (중앙) */}
                                    <div style={{ display: 'flex', alignItems: 'center', margin: '0 10px', flexShrink: 0 }}>
                                        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>➔</span>
                                    </div>

                                    {/* 결과 아이템 (출력) */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end', textAlign: 'right' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#fff', wordBreak: 'keep-all', lineHeight: '1.2' }}>
                                            {expected.name}
                                        </span>
                                        <div style={{ width: '24px', height: '24px', flexShrink: 0 }}>
                                            <ItemImage item={{ type: expected.type }} size="100%" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="processing-bar-bg">
                                    <div className="processing-bar-fill" style={{ width: `${item.progress}%`, background: stageColor, boxShadow: `0 0 10px ${stageColor}` }} />
                                </div>
                            </div>
                        );
                    })}
                    {processingItems.length > 5 && (
                        <div className="processing-more-text">
                            + 그 외 {processingItems.length - 5}개 작업 진행 중...
                        </div>
                    )}
                </div>
            )}

            {/* Bottom HUD: Stats and Inventory */}
            <div className="hud-bottom-minimal">
                <div className="log-panel">
                    <div className="panel-title">SYSTEM LOG</div>
                    <div className="results-log-minimal">
                        {results.slice(-4).map((res, i) => (
                            <div key={i} className="log-entry" style={{ color: res.includes('성공') || res.includes('판매') ? '#00ffcc' : '#ffffff88' }}>
                                {res}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="equipped-panel">
                    <div className="panel-title">EQUIPPED</div>
                    {selectedItem ? (
                        <div className="equipped-item">
                            <span className="equipped-dot" style={{ backgroundColor: selectedItem.color || '#fff' }}></span>
                            {selectedItem.name || selectedItem.type || 'UNKNOWN'}
                        </div>
                    ) : (
                        <div className="equipped-item empty">EMPTY HANDS</div>
                    )}
                </div>
            </div>

            {/* Full Inventory Overlay */}
            {isInventoryOpen && (
                <div className="inventory-full-overlay">
                    <div className="storage-grid glass-panel">
                        <h2 style={{ margin: '0 0 20px 0', letterSpacing: '4px' }}>공장 보관함</h2>
                        <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
                            {[...Array(10)].map((_, i) => (
                                <div
                                    key={i}
                                    className="grid-slot"
                                    onClick={() => onInventoryClick(i)}
                                    draggable={!!(inventory && inventory[i])}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('sourceIdx', i);
                                        e.dataTransfer.setData('type', 'storage');
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const sourceIdx = e.dataTransfer.getData('sourceIdx');
                                        const sourceType = e.dataTransfer.getData('type');
                                        if (sourceType === 'storage') onInventoryClick(i, parseInt(sourceIdx));
                                    }}
                                    style={{ border: '1px solid rgba(0, 255, 204, 0.4)' }}
                                >
                                    {inventory && inventory[i] ? (
                                        <div className="item-preview">
                                            <div className="icon-chip" style={{ backgroundColor: `${inventory[i].color}22`, borderColor: `${inventory[i].color}44` }}>
                                                <ItemImage item={inventory[i]} size="70%" />
                                            </div>
                                            <span style={{ fontSize: '9px', textAlign: 'center', marginTop: '4px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{inventory[i].name || inventory[i].type}</span>
                                        </div>
                                    ) : (
                                        <span style={{ opacity: 0.3, fontSize: '24px' }}>{i === 9 ? 0 : i + 1}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="close-hint">드래그해서 위치 변경 • 클릭해서 장착 • TAB을 눌러 닫기</div>
                    </div>
                </div>
            )}

            {/* Build Mode HUD Overlay */}
            {gameState === 'playing' && buildMode && (
                <div className="build-hud-minimal">
                    <div className="build-header">
                        <span className="build-icon">🏗️</span>
                        <div>
                            <div className="build-title">BUILD MODE</div>
                            <div className="build-subtitle">Clearance granted</div>
                        </div>
                    </div>
                    <div className="build-controls">
                        <div><span>Open Catalog</span> <strong>V</strong></div>
                        <div><span>Rotate Item</span> <strong>Q / E</strong></div>
                        <div><span>Place Item</span> <strong style={{color: 'var(--accent)'}}>L-Click</strong></div>
                        <div><span>Remove Item</span> <strong style={{color: 'var(--danger)'}}>R-Click</strong></div>
                    </div>
                    {selectedItem && (
                        <div className="build-selected">
                            <div className="build-selected-label">SELECTED UNIT</div>
                            <div className="build-selected-name">{selectedItem.icon} {selectedItem.name}</div>
                        </div>
                    )}
                </div>
            )}

            {/* 산소 필터 게이지 - 핫바 위에 표시 */}
            {gameState === 'playing' && !isInventoryOpen && (
                <div className="oxygen-above-hotbar">
                    <span className="oxygen-label" style={{ fontSize: '10px', letterSpacing: '1.5px', opacity: 0.7 }}>SUIT FILTER</span>
                    <div className="oxygen-bar-outer" style={{ width: '220px', margin: '0 10px' }}>
                        <div
                            className="oxygen-bar-inner"
                            style={{
                                width: `${oxygen}%`,
                                backgroundColor: oxygen < 20 ? '#ff0055' : oxygen < 30 ? '#ff6600' : '#00aaff',
                                boxShadow: oxygen < 20 ? '0 0 12px #ff0055' : oxygen < 30 ? '0 0 10px #ff6600' : '0 0 10px #00aaff',
                                transition: 'width 0.8s ease, background-color 0.5s'
                            }}
                        />
                    </div>
                    <span className="oxygen-value" style={{ color: oxygen < 20 ? '#ff0055' : oxygen < 30 ? '#ff6600' : '#00aaff', fontSize: '13px', fontWeight: '800' }}>
                        {Math.floor(oxygen)}%
                    </span>
                </div>
            )}

            {/* Minecraft Style Hotbar */}
            {gameState === 'playing' && !isInventoryOpen && (
                <div className="hotbar-minimal">
                    {inventory && inventory.slice(0, 10).map((item, index) => {
                        const slotNumber = index === 9 ? 0 : index + 1;
                        const isActive = activeHotbarSlot === (index === 9 ? 10 : index + 1);
                        return (
                            <div key={`hotbar-${index}`} className={`hotbar-slot-minimal ${isActive ? 'active' : ''}`}>
                                <div className="hotbar-num">{slotNumber}</div>
                                {item && (
                                    <div className="hotbar-item-icon" style={{ backgroundColor: `${item.color}22`, border: `1px solid ${item.color}44`, padding: 0 }}>
                                        <ItemImage item={item} size="80%" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// 3. Settings Menu (Overlay)
export function SettingsMenu({ settings, setSettings, onUpdate, onClose }) {
    const handleChange = (key, value) => {
        if (setSettings) setSettings(prev => ({ ...prev, [key]: value }));
        if (onUpdate) onUpdate(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="settings-overlay">
            <div className="settings-panel glass-panel">
                <div className="badge">시스템 설정</div>
                <h1 style={{ margin: '10px 0 30px 0' }}>공장 구성 설정</h1>

                <div className="settings-grid">
                    {/* Perspective */}
                    <div className="setting-item">
                        <label>시점 설정</label>
                        <div className="toggle-group">
                            <button
                                className={settings.perspective === 'first' ? 'active' : ''}
                                onClick={() => handleChange('perspective', 'first')}
                            >
                                1인칭 시점
                            </button>
                            <button
                                className={settings.perspective === 'third' ? 'active' : ''}
                                onClick={() => handleChange('perspective', 'third')}
                            >
                                3인칭 시점
                            </button>
                        </div>
                    </div>

                    {/* Mouse Sensitivity */}
                    <div className="setting-item">
                        <label>마우스 감도: {settings.sensitivity.toFixed(1)}</label>
                        <input
                            type="range"
                            min="0.1"
                            max="3.0"
                            step="0.1"
                            value={settings.sensitivity}
                            onChange={(e) => handleChange('sensitivity', parseFloat(e.target.value))}
                        />
                    </div>

                    {/* FOV / Zoom */}
                    <div className="setting-item">
                        <label>카메라 줌 (FOV): {settings.zoom}</label>
                        <input
                            type="range"
                            min="30"
                            max="100"
                            step="1"
                            value={settings.zoom}
                            onChange={(e) => handleChange('zoom', parseInt(e.target.value))}
                        />
                    </div>

                    {/* Master Volume */}
                    <div className="setting-item">
                        <label>마스터 볼륨: {settings.volume}%</label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={settings.volume}
                            onChange={(e) => handleChange('volume', parseInt(e.target.value))}
                        />
                    </div>

                    {/* Graphics Quality */}
                    <div className="setting-item">
                        <label>그래픽 품질</label>
                        <div className="toggle-group">
                            <button
                                className={settings.graphicsQuality === 'low' ? 'active' : ''}
                                onClick={() => handleChange('graphicsQuality', 'low')}
                            >
                                성능 우선
                            </button>
                            <button
                                className={settings.graphicsQuality === 'high' ? 'active' : ''}
                                onClick={() => handleChange('graphicsQuality', 'high')}
                            >
                                최고 품질
                            </button>
                        </div>
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="primary-button" onClick={onClose}>설정 적용 및 닫기</button>
                    <div className="close-hint">ESC를 누르면 게임으로 돌아갑니다</div>
                </div>
            </div>
        </div>
    );
}

// 4. 건축 목록 창 (Build Inventory UI)

export function BuildInventory({ isOpen, onClose, onSelectItem, inventory, activeHotbarSlot, onSlotClick }) {
    if (!isOpen) return null;
    return (
        <div className="inventory-full-overlay">
            <div className="storage-grid glass-panel" style={{ width: '800px', height: 'auto', maxHeight: '90vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, letterSpacing: '4px' }}>설비 카탈로그</h2>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.5 }}>슬롯 {activeHotbarSlot}에 장착할 아이템을 선택하세요</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', color: '#ff4444', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
                </div>

                {/* Catalog Section */}
                <div style={{ marginBottom: '30px' }}>
                    <div className="inventory-title">엔지니어링 카탈로그</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {['물류', '공정 기계', '조형물', '원재료'].map(cat => (
                            <div key={cat}>
                                <div style={{ fontSize: '10px', color: 'var(--accent)', marginBottom: '8px', opacity: 0.8, letterSpacing: '1px', fontWeight: 'bold' }}>{cat.toUpperCase()}</div>
                                <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', marginTop: 0 }}>
                                    {BUILD_CATALOG.filter(i => i.category === cat).map(item => (
                                        <div
                                            key={item.id}
                                            className="grid-slot"
                                            onClick={() => onSelectItem(item.id)}
                                            draggable={true}
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('itemId', item.id);
                                                e.dataTransfer.setData('type', 'catalog');
                                            }}
                                            style={{ height: '75px', cursor: 'grab', position: 'relative' }}
                                        >
                                            <div className="item-preview">
                                                <div className="icon-chip" style={{ backgroundColor: `${item.color}22`, borderColor: `${item.color}44` }}>
                                                    <ItemImage item={item} size="70%" />
                                                </div>
                                                <span style={{ fontSize: '9px', textAlign: 'center', marginTop: '4px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{item.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Inventory Section */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <div className="inventory-title">활성화 건축 바 (슬롯 1-10)</div>
                    <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(10, 1fr)', gap: '10px' }}>
                        {[...Array(10)].map((_, i) => (
                            <div
                                key={`build-inv-${i}`}
                                className={`grid-slot ${activeHotbarSlot === (i === 9 ? 10 : i + 1) ? 'active' : ''}`}
                                onClick={() => onSlotClick && onSlotClick(i)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const type = e.dataTransfer.getData('type');
                                    if (type === 'catalog') {
                                        const itemId = e.dataTransfer.getData('itemId');
                                        onSelectItem(itemId, i);
                                    } else if (type === 'build-storage') {
                                        const sourceIdx = e.dataTransfer.getData('sourceIdx');
                                        onSlotClick(i, parseInt(sourceIdx));
                                    }
                                }}
                                draggable={!!(inventory && inventory[i])}
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('sourceIdx', i);
                                    e.dataTransfer.setData('type', 'build-storage');
                                }}
                                style={{
                                    height: '70px',
                                    cursor: 'pointer',
                                    border: `2px solid ${activeHotbarSlot === (i === 9 ? 10 : i + 1) ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                                    background: activeHotbarSlot === (i === 9 ? 10 : i + 1) ? 'var(--accent-glow)' : undefined
                                }}
                            >
                                {inventory && inventory[i] ? (
                                    <div className="item-preview" style={{ width: '100%', height: '100%' }}>
                                        <div style={{ height: '35px', marginTop: '5px' }}>
                                            <ItemImage item={inventory[i]} size="100%" />
                                        </div>
                                        <span style={{ fontSize: '8px', opacity: 0.7, marginTop: '2px' }}>{inventory[i].name}</span>
                                    </div>
                                ) : (
                                    <span style={{ opacity: 0.15, fontSize: '18px', fontWeight: '900' }}>{i === 9 ? 0 : i + 1}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="close-hint" style={{ marginTop: '25px', color: 'var(--accent)', opacity: 0.8 }}>
                    하단의 슬롯을 먼저 선택한 후 상단 카탈로그에서 유닛을 골라주세요 • [V]키를 눌러 닫기
                </div>
            </div>
        </div>
    );
}
