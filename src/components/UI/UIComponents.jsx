import React from 'react';

// 1. 메인 로비 컴포넌트
export function Lobby({ onStart }) {
    return (
        <div className="start-screen">
            <div className="start-card glass-panel">
                <div className="badge">RECYCLING SIMULATOR</div>
                <h1>PREMIUM FACTORY v2.1</h1>
                <p>U-Shape Process & Modular Management</p>

                <div className="feature-grid">
                    <div className="feature-item">
                        <span className="icon">🏗️</span>
                        <span>U-Layout</span>
                    </div>
                    <div className="feature-item">
                        <span className="icon">📦</span>
                        <span>Inventory</span>
                    </div>
                    <div className="feature-item">
                        <span className="icon">⚙️</span>
                        <span>Morphism</span>
                    </div>
                </div>

                <div className="start-controls">
                    <button className="start-button" onClick={onStart}>
                        SIMULATION START
                    </button>
                    <div className="control-badges">
                        <span className="badge-item">WASD Move</span>
                        <span className="badge-item">Mouse Aim</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// 2. HUD (In-Game UI)
export function HUD({
    gameState,
    setGameState,
    isProcessing,
    isStationary,
    STAGES,
    currentStageIdx,
    stageProgress,
    inventory,
    results,
    selectedItem,
    money,
    isInventoryOpen,
    onInventoryClick,
    buildMode,
    activeHotbarSlot
}) {
    return (
        <div className={`game-gui ${isInventoryOpen ? 'inventory-view' : ''}`}>
            {/* Header: Title and Controls */}
            <header className="header glass-panel">
                <div className="header-actions">
                    <h1>RECYCLING FACTORY <span style={{ color: 'var(--accent)' }}>V3.0</span></h1>
                    <div className="balance-display glass-panel">
                        <span style={{ fontSize: '12px', opacity: 0.6 }}>BALANCE</span>
                        <span style={{ color: '#4caf50', fontWeight: '900', fontSize: '20px' }}>${money.toLocaleString()}</span>
                    </div>
                    <button className="quit-button" onClick={() => setGameState('start')}>QUIT TO LOBBY</button>
                </div>
                <div className="controls-hint">
                    <span className="kb-key">B</span> BUILD MODE
                    <span className="kb-key">ESC</span> SETTINGS
                    <span className="kb-key">V</span> VIEW
                    <span className="kb-key">TAB</span> STORAGE
                </div>
            </header>

            {/* Central Processing Status */}
            {isProcessing && (
                <div className="processing-overlay glass-panel">
                    <div className="processing-label">
                        {!isStationary ? (
                            <span style={{ color: '#aaa', fontSize: '12px' }}>MOVING TO {STAGES[currentStageIdx]}...</span>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <span className="badge">ACTIVE</span>
                                <span style={{ color: '#4caf50', fontSize: '18px', fontWeight: '900' }}>{STAGES[currentStageIdx]}</span>
                            </div>
                        )}
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-fill" style={{ width: `${stageProgress}%` }} />
                    </div>
                </div>
            )}

            {/* Bottom HUD: Stats and Inventory */}
            <div className="hud-bottom">
                <div className="stats-panel glass-panel">
                    <div className="inventory-title">SYSTEM LOGS</div>
                    <div className="results-log">
                        {results.map((res, i) => (
                            <div key={i} style={{ color: res.includes('SUCCESS') ? '#00ff88' : '#fff', opacity: 1 - i * 0.2, fontSize: '13px' }}>
                                • {res}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="inventory-panel glass-panel">
                    <div className="inventory-title">ACTIVE ITEM</div>
                    {selectedItem ? (
                        <div className="inventory-item" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                            <span style={{ color: selectedItem.color || '#fff' }}>●</span> {selectedItem.name || selectedItem.type || 'Unknown'}
                        </div>
                    ) : (
                        <div className="inventory-item" style={{ opacity: 0.3 }}>EMPTY HANDS</div>
                    )}
                </div>
            </div>

            {/* Full Inventory Overlay */}
            {isInventoryOpen && (
                <div className="inventory-full-overlay">
                    <div className="storage-grid glass-panel">
                        <h2 style={{ margin: '0 0 20px 0', letterSpacing: '4px' }}>FACTORY STORAGE</h2>
                        <div className="grid-layout">
                            {[...Array(16)].map((_, i) => (
                                <div
                                    key={i}
                                    className="grid-slot"
                                    onClick={() => onInventoryClick(i)}
                                    style={{ border: i < 8 ? '1px solid rgba(0, 255, 204, 0.4)' : undefined }}
                                >
                                    {inventory && inventory[i] ? (
                                        <div className="item-preview">
                                            {inventory[i].icon ? (
                                                <span style={{ fontSize: '24px' }}>{inventory[i].icon}</span>
                                            ) : (
                                                <div className="item-color" style={{ backgroundColor: inventory[i].color || '#fff' }} />
                                            )}
                                            <span>{inventory[i].name || inventory[i].type || 'Unknown'}</span>
                                        </div>
                                    ) : (
                                        <span style={{ opacity: i < 8 ? 0.3 : 0.1, fontSize: '24px' }}>{i < 8 ? i + 1 : '+'}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="close-hint">CLICK TO SWAP • TAB TO CLOSE</div>
                    </div>
                </div>
            )}

            {/* Build Mode HUD Overlay */}
            {gameState === 'playing' && buildMode && (
                <div className="build-mode-overlay" style={{
                    position: 'absolute', bottom: '120px', left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)', padding: '20px', borderRadius: '15px', color: '#00ffcc',
                    border: '1px solid #00ffcc', display: 'flex', gap: '20px', pointerEvents: 'none'
                }}>
                    <div style={{ fontWeight: 'bold', color: '#ffcc00' }}>[B] BUILD ON/OFF</div>
                    <div style={{ fontWeight: 'bold' }}>[V] OPEN CATALOG</div>
                    <div>[Q/E] ROTATE</div>
                    <div>[L-CLICK] BUILD</div>
                    <div style={{ color: '#ff4444' }}>[R-CLICK] DEMOLISH</div>
                </div>
            )}

            {/* Minecraft Style Hotbar */}
            {gameState === 'playing' && !isInventoryOpen && (
                <div className="hotbar-container glass-panel">
                    {inventory && inventory.slice(0, 8).map((item, index) => {
                        const slotNumber = index + 1;
                        const isActive = activeHotbarSlot === slotNumber;
                        return (
                            <div key={`hotbar-${index}`} className={`hotbar-slot ${isActive ? 'active' : ''}`}>
                                <div className="hotbar-number">{slotNumber}</div>
                                {item ? (
                                    <>
                                        <div className="hotbar-icon">
                                            {item.icon ? item.icon : <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: item.color || '#fff' }}></div>}
                                        </div>
                                        <div className="hotbar-name">{item.name || item.type}</div>
                                    </>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// 3. Settings Menu (Overlay)
export function SettingsMenu({ settings, setSettings, onClose }) {
    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="settings-overlay">
            <div className="settings-panel glass-panel">
                <div className="badge">SYSTEM SETTINGS</div>
                <h1 style={{ margin: '10px 0 30px 0' }}>FACTORY CONFIG</h1>

                <div className="settings-grid">
                    {/* Perspective */}
                    <div className="setting-item">
                        <label>VIEW PERSPECTIVE</label>
                        <div className="toggle-group">
                            <button
                                className={settings.perspective === 'first' ? 'active' : ''}
                                onClick={() => handleChange('perspective', 'first')}
                            >
                                1ST PERSON
                            </button>
                            <button
                                className={settings.perspective === 'third' ? 'active' : ''}
                                onClick={() => handleChange('perspective', 'third')}
                            >
                                3RD PERSON
                            </button>
                        </div>
                    </div>

                    {/* Mouse Sensitivity */}
                    <div className="setting-item">
                        <label>MOUSE SENSITIVITY: {settings.sensitivity.toFixed(1)}</label>
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
                        <label>CAMERA ZOOM (FOV): {settings.zoom}</label>
                        <input
                            type="range"
                            min="30"
                            max="100"
                            step="1"
                            value={settings.zoom}
                            onChange={(e) => handleChange('zoom', parseInt(e.target.value))}
                        />
                    </div>

                    {/* Graphics Quality */}
                    <div className="setting-item">
                        <label>GRAPHICS QUALITY</label>
                        <div className="toggle-group">
                            <button
                                className={settings.graphicsQuality === 'low' ? 'active' : ''}
                                onClick={() => handleChange('graphicsQuality', 'low')}
                            >
                                PERFORMANCE
                            </button>
                            <button
                                className={settings.graphicsQuality === 'high' ? 'active' : ''}
                                onClick={() => handleChange('graphicsQuality', 'high')}
                            >
                                ULTRA (RTX)
                            </button>
                        </div>
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="primary-button" onClick={onClose}>APPLY & CLOSE</button>
                    <div className="close-hint">PRESS ESC TO RETURN</div>
                </div>
            </div>
        </div>
    );
}

// 4. 건축 목록 창 (Build Inventory UI)
export const BUILD_CATALOG = [
    { id: "CONVEYOR", name: "Conveyor Belt", category: "Logistics", icon: "🛤️" },
    { id: "SORTING", name: "Sorting Machine", category: "Machines", icon: "⚙️" },
    { id: "CRUSHING", name: "Crusher", category: "Machines", icon: "🔨" },
    { id: "CLEANING", name: "Cleaner", category: "Machines", icon: "💦" },
    { id: "DRYING", name: "Dryer", category: "Machines", icon: "♨️" },
    { id: "PACKAGING", name: "Packager", category: "Machines", icon: "📦" },
    { id: "SHIPPING_BIN", name: "Sell Zone", category: "Machines", icon: "💲" },

    { id: "SHELF", name: "Steel Shelf", category: "Props", icon: "🗄️" },
    { id: "CRATE", name: "Storage Crate", category: "Props", icon: "🧰" },
    { id: "BARREL", name: "Gas Barrel", category: "Props", icon: "🛢️" },
    { id: "WALL", name: "Factory Wall", category: "Props", icon: "🧱" },

    { id: "ITEM_PLASTIC", name: "Plastic Trash", category: "Items", icon: "🥤" },
    { id: "ITEM_CAN", name: "Can Trash", category: "Items", icon: "🥫" },
    { id: "ITEM_GLASS", name: "Glass Trash", category: "Items", icon: "🍾" },
];

export function BuildInventory({ isOpen, onClose, onSelectItem }) {
    if (!isOpen) return null;
    return (
        <div className="build-inventory-overlay glass-panel" style={{
            position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%',
            background: 'rgba(0, 0, 0, 0.85)', border: '2px solid #00ffcc', zIndex: 1000,
            display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto',
            pointerEvents: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #333', paddingBottom: '10px' }}>
                <h1 style={{ color: '#00ffcc', margin: 0, letterSpacing: '2px' }}>BUILD CATALOG</h1>
                <button onClick={onClose} style={{ background: 'none', color: '#ff4444', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✖</button>
            </div>

            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '30px' }}>
                {BUILD_CATALOG.map(item => (
                    <div key={item.id} className="build-item-card" onClick={() => onSelectItem(item.id)} style={{
                        width: '130px', height: '150px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid #444', borderRadius: '10px', display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
                    }}
                        onMouseOver={(e) => { e.currentTarget.style.borderColor = '#00ffcc'; e.currentTarget.style.background = 'rgba(0,255,204,0.1)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                    >
                        <div style={{ fontSize: '40px', marginBottom: '15px' }}>{item.icon}</div>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', textAlign: 'center', color: '#fff' }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#888', marginTop: '8px' }}>{item.category}</div>
                    </div>
                ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'auto', color: '#888', fontSize: '14px', letterSpacing: '1px' }}>
                CLICK TO EQUIP • PRESS V OR ESC TO CLOSE
            </div>
        </div>
    );
}
