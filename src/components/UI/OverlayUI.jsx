import React from 'react';
import { Lobby, HUD, SettingsMenu, BuildInventory } from './UIComponents';
import { IntroTutorial } from './IntroTutorial';

export function OverlayUI({
    gameState,
    money,
    results,
    isInventoryOpen,
    isSettingsOpen,
    isBuildInventoryOpen,
    buildMode,
    currentInventory,
    activeHotbarSlot,
    settings,
    hudInfo,
    setGameState,
    setSettings,
    setIsSettingsOpen,
    setIsInventoryOpen,
    setIsBuildInventoryOpen,
    handleInventoryClick,
    handleStart,
    onEquipBuildItem
}) {
    if (gameState === 'lobby') {
        return <Lobby onStart={handleStart} />;
    }

    if (gameState === 'intro') {
        return <IntroTutorial onComplete={() => setGameState('playing')} />;
    }

    const { isProcessing, stageProgress, currentStageIdx, STAGES } = hudInfo || {};
    const selectedItem = currentInventory ? currentInventory[activeHotbarSlot - 1] : null;

    return (
        <>
            {/* 메인 HUD */}
            <HUD
                gameState={gameState}
                setGameState={setGameState}
                money={money}
                results={results}
                isInventoryOpen={isInventoryOpen}
                isBuildInventoryOpen={isBuildInventoryOpen}
                buildMode={buildMode}
                inventory={currentInventory}
                activeHotbarSlot={activeHotbarSlot}
                selectedItem={selectedItem}
                isProcessing={isProcessing}
                stageProgress={stageProgress}
                currentStageIdx={currentStageIdx}
                STAGES={STAGES}
                isStationary={true}
            />

            {/* 설정 메뉴 */}
            {isSettingsOpen && (
                <SettingsMenu
                    settings={settings}
                    setSettings={setSettings}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}

            {/* 일반 인벤토리 */}
            {isInventoryOpen && !isBuildInventoryOpen && (
                <div className="inventory-full-overlay">
                    <div className="storage-grid glass-panel">
                        <h2 style={{ margin: '0 0 20px 0', letterSpacing: '4px' }}>FACTORY STORAGE</h2>
                        <div className="grid-layout">
                            {[...Array(16)].map((_, i) => (
                                <div
                                    key={i}
                                    className="grid-slot"
                                    onClick={() => handleInventoryClick(i)}
                                    style={{ border: i < 8 ? '1px solid rgba(0, 255, 204, 0.4)' : undefined }}
                                >
                                    {currentInventory && currentInventory[i] ? (
                                        <div className="item-preview">
                                            {currentInventory[i].icon ? (
                                                <span style={{ fontSize: '24px' }}>{currentInventory[i].icon}</span>
                                            ) : (
                                                <div className="item-color" style={{ backgroundColor: currentInventory[i].color || '#fff' }} />
                                            )}
                                            <span>{currentInventory[i].name || currentInventory[i].type || 'Unknown'}</span>
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

            {/* 건설 카탈로그 */}
            {isBuildInventoryOpen && (
                <BuildInventory
                    isOpen={isBuildInventoryOpen}
                    inventory={currentInventory}
                    activeHotbarSlot={activeHotbarSlot}
                    onSlotClick={(idx) => handleInventoryClick(idx)}
                    onSelectItem={(itemId) => {
                        if (onEquipBuildItem) onEquipBuildItem(itemId);
                    }}
                    onClose={() => setIsBuildInventoryOpen(false)}
                />
            )}
        </>
    );
}
