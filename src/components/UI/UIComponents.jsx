import React, { useState } from 'react';

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
    { id: "CONVEYOR", name: "Conveyor Belt", category: "Logistics", icon: "🛤️", color: "#00ffcc" },
    { id: "SORTING", name: "Sorting Machine", category: "Machines", icon: "⚙️", color: "#55aaff" },
    { id: "CRUSHING", name: "Crusher", category: "Machines", icon: "🔨", color: "#55aaff" },
    { id: "CLEANING", name: "Cleaner", category: "Machines", icon: "💦", color: "#55aaff" },
    { id: "DRYING", name: "Dryer", category: "Machines", icon: "♨️", color: "#55aaff" },
    { id: "PACKAGING", name: "Packager", category: "Machines", icon: "📦", color: "#55aaff" },
    { id: "SHIPPING_BIN", name: "Sell Zone", category: "Machines", icon: "💲", color: "#4caf50" },

    { id: "SHELF", name: "Steel Shelf", category: "Props", icon: "🗄️", color: "#ffaa00" },
    { id: "CRATE", name: "Storage Crate", category: "Props", icon: "🧰", color: "#ffaa00" },
    { id: "BARREL", name: "Gas Barrel", category: "Props", icon: "🛢️", color: "#ffaa00" },
    { id: "WALL", name: "Factory Wall", category: "Props", icon: "🧱", color: "#ffaa00" },

    { id: "ITEM_PLASTIC", name: "Plastic Trash", category: "Items", icon: "🥤", color: "#88ff44" },
    { id: "ITEM_CAN", name: "Can Trash", category: "Items", icon: "🥫", color: "#88ff44" },
    { id: "ITEM_GLASS", name: "Glass Trash", category: "Items", icon: "🍾", color: "#88ff44" },
];

export function BuildInventory({ isOpen, onClose, onSelectItem, inventory, activeHotbarSlot, onSlotClick }) {
    if (!isOpen) return null;
    return (
        <div className="inventory-full-overlay">
            <div className="storage-grid glass-panel" style={{ width: '800px', height: 'auto', maxHeight: '90vh' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, letterSpacing: '4px' }}>BUILD CATALOG</h2>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.5 }}>Select an item to equip to slot {activeHotbarSlot}</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', color: '#ff4444', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✖</button>
                </div>
                
                {/* Catalog Section */}
                <div style={{ marginBottom: '30px' }}>
                    <div className="inventory-title">AVAILABLE ITEMS</div>
                    <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
                        {BUILD_CATALOG.map(item => (
                            <div
                                key={item.id}
                                className="grid-slot"
                                onClick={() => onSelectItem(item.id)}
                                style={{ height: '70px', cursor: 'pointer' }}
                            >
                                <div className="item-preview">
                                    <span style={{ fontSize: '20px' }}>{item.icon}</span>
                                    <span style={{ fontSize: '9px', textAlign: 'center' }}>{item.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Current Inventory Section */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <div className="inventory-title">YOUR SLOTS (ACTIVE: {activeHotbarSlot})</div>
                    <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(8, 1fr)', gap: '10px' }}>
                        {[...Array(16)].map((_, i) => (
                            <div
                                key={`build-inv-${i}`}
                                className={`grid-slot ${activeHotbarSlot === i + 1 ? 'active' : ''}`}
                                onClick={() => onSlotClick && onSlotClick(i)}
                                style={{ 
                                    height: '70px',
                                    cursor: 'pointer',
                                    border: i < 8 ? '2px solid rgba(0, 255, 204, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                                    background: activeHotbarSlot === i + 1 ? 'rgba(0, 255, 204, 0.1)' : undefined
                                }}
                            >
                                {inventory && inventory[i] ? (
                                    <div className="item-preview">
                                        <span style={{ fontSize: '20px' }}>{inventory[i].icon}</span>
                                        <span style={{ fontSize: '8px' }}>{inventory[i].name}</span>
                                    </div>
                                ) : (
                                    <span style={{ opacity: 0.2 }}>{i < 8 ? i + 1 : ''}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="close-hint" style={{ marginTop: '20px' }}>
                    CLICK A SLOT BELOW TO CHOOSE, THEN CLICK ITEM ABOVE TO EQUIP • V TO CLOSE
                </div>
            </div>
        </div>
    );
}

const INTRO_SLIDES = [
    {
        id: 1,
        title: "THE EARTH IS CHOKING",
        description: "The year is 20XX. The planet has been overwhelmed by mountains of plastic, metal, and glass waste. Nature is dying, and hope is fading.",
        image: "/assets/intro/slide1.png"
    },
    {
        id: 2,
        title: "THE RECYCLING REVOLUTION",
        description: "Scientists have developed a breakthrough: The Smart Upcycling Machine. It can transform raw garbage into high-value industrial materials.",
        image: "/assets/intro/slide2.png"
    },
    {
        id: 3,
        title: "YOUR MISSION",
        description: "As the manager of the First Smart Factory, you must build efficient production lines to purify the earth. Every product sold brings us closer to a green future.",
        image: "/assets/intro/slide3.png"
    },
    {
        id: 4,
        title: "HOW TO OPERATE",
        description: "• WASD / Arrow Keys: Move Player\n• B: Toggle Build Mode\n• TAB / I: Open Inventory\n• V: Open Build Catalog\n• G / F: Pick up or Drop/Sell Item",
        image: null // 조작법은 배경 없이 깔끔하게
    }
];

export function IntroTutorial({ onComplete }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slide = INTRO_SLIDES[currentSlide];

    const nextSlide = () => {
        if (currentSlide < INTRO_SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    return (
        <div className="intro-tutorial-overlay">
            {slide.image && (
                <div 
                    className="intro-background-image" 
                    style={{ backgroundImage: `url(${slide.image})` }}
                />
            )}
            <div className="intro-content-container glass-panel">
                <div className="slide-progress">
                    {INTRO_SLIDES.map((_, i) => (
                        <div key={i} className={`progress-dot ${i === currentSlide ? 'active' : ''}`} />
                    ))}
                </div>
                
                <h1 className="intro-title">{slide.title}</h1>
                <p className="intro-description">{slide.description}</p>
                
                <div className="intro-buttons">
                    {currentSlide > 0 && (
                        <button className="lobby-btn secondary" onClick={prevSlide}>BACK</button>
                    )}
                    <button className="lobby-btn primary" onClick={nextSlide}>
                        {currentSlide === INTRO_SLIDES.length - 1 ? "ENTER FACTORY" : "NEXT"}
                    </button>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .intro-tutorial-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: #000;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .intro-background-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    filter: brightness(0.4);
                    animation: panBackground 20s infinite alternate ease-in-out;
                }
                @keyframes panBackground {
                    from { transform: scale(1.1) translateX(-2%); }
                    to { transform: scale(1.1) translateX(2%); }
                }
                .intro-content-container {
                    position: relative;
                    width: 600px;
                    padding: 60px;
                    text-align: center;
                    animation: slideUpFade 0.8s ease-out;
                    border: 1px solid rgba(0, 255, 204, 0.3);
                }
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .intro-title {
                    font-size: 42px;
                    margin-bottom: 30px;
                    letter-spacing: 6px;
                    color: #00ffcc;
                    text-shadow: 0 0 20px rgba(0, 255, 204, 0.5);
                }
                .intro-description {
                    font-size: 18px;
                    line-height: 1.8;
                    color: #fff;
                    margin-bottom: 40px;
                    white-space: pre-line;
                    opacity: 0.9;
                }
                .slide-progress {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 40px;
                }
                .progress-dot {
                    width: 40px;
                    height: 4px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                    transition: all 0.3s;
                }
                .progress-dot.active {
                    background: #00ffcc;
                    box-shadow: 0 0 10px #00ffcc;
                }
                .intro-buttons {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                }
            `}} />
        </div>
    );
}
