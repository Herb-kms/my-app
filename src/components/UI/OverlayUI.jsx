import React from 'react';
import { HUD, SettingsMenu, BuildInventory } from './UIComponents';
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
    normalInventory,
    buildInventory,
    activeHotbarSlot,
    setActiveHotbarSlot,
    settings,
    hudInfo,
    setGameState,
    setSettings,
    setIsSettingsOpen,
    setIsInventoryOpen,
    setIsBuildInventoryOpen,
    handleInventoryClick,
    handleStart,
    onEquipBuildItem,
    oxygen = 100,
    isCompromised = false,
    handleReboot
}) {


    if (gameState === 'intro') {
        return <IntroTutorial onComplete={() => setGameState('playing')} />;
    }

    const { isProcessing, processingItems, STAGES } = hudInfo || {};
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
                processingItems={processingItems}
                STAGES={STAGES}
                isStationary={true}
                oxygen={oxygen}
            />

            {/* 산소 20% 미만일 때 화면 주변 붉은색 경고 점멸 오버레이 */}
            {gameState === 'playing' && oxygen < 20 && !isCompromised && (
                <div className="oxygen-low-vignette" />
            )}

            {/* 슈트 독극물 유입 / 비상 다운 오버레이 */}
            {isCompromised && (
                <div className="suit-compromised-overlay">
                    <div className="suit-compromised-content">
                        <h2>⚠️ SUIT FILTER DOWN ⚠️</h2>
                        <p style={{ margin: '15px 0', fontSize: '15px', color: '#ff3366', fontWeight: 'bold' }}>
                            경고: 슈트 필터 수명 고갈! 대기 독극물 흡입 방지를 위해 비상 안전 프로토콜이 가동되었습니다.
                        </p>
                        <p style={{ fontSize: '13px', color: '#aaa', lineHeight: '1.6' }}>
                            슈트 재기동 비용: <b style={{ color: '#00ffcc' }}>$50</b><br/>
                            (자금이 부족할 경우 소지금이 전부 몰수되며 인벤토리의 폐기물 아이템들이 전부 소멸됩니다.)
                        </p>
                        <button className="suit-reboot-btn" onClick={handleReboot} style={{ marginTop: '20px' }}>
                            슈트 긴급 리부트 (Reboot System)
                        </button>
                    </div>
                </div>
            )}

            {/* 설정 메뉴 */}
            {isSettingsOpen && (
                <SettingsMenu
                    settings={settings}
                    setSettings={setSettings}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}

            {/* 일반 인벤토리 (8슬롯으로 제한) */}
            {isInventoryOpen && !isBuildInventoryOpen && (
                <div className="inventory-full-overlay">
                    <div className="storage-grid glass-panel">
                        <h2 style={{ margin: '0 0 20px 0', letterSpacing: '4px' }}>FACTORY STORAGE</h2>
                        <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(10, 1fr)' }}>
                            {[...Array(10)].map((_, i) => (
                                <div
                                    key={i}
                                    className="grid-slot"
                                    onClick={() => handleInventoryClick(i, null, 'storage')}
                                    draggable={!!(normalInventory && normalInventory[i])}
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('sourceIdx', i);
                                        e.dataTransfer.setData('type', 'storage');
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const sourceIdx = e.dataTransfer.getData('sourceIdx');
                                        const sourceType = e.dataTransfer.getData('type');
                                        if (sourceType === 'storage') handleInventoryClick(i, parseInt(sourceIdx), 'storage');
                                    }}
                                    style={{ border: '1px solid rgba(0, 255, 204, 0.4)' }}
                                >
                                    {normalInventory && normalInventory[i] ? (
                                        <div className="item-preview">
                                            <div className="icon-chip" style={{ backgroundColor: `${normalInventory[i].color}22`, borderColor: `${normalInventory[i].color}44` }}>
                                                <span style={{ fontSize: '24px' }}>{normalInventory[i].icon || (normalInventory[i].type === 'Can' ? '🥫' : '🥤')}</span>
                                            </div>
                                            <span style={{ fontSize: '9px', textAlign: 'center', marginTop: '4px', whiteSpace: 'nowrap', fontWeight: 'bold' }}>{normalInventory[i].name || normalInventory[i].type}</span>
                                        </div>
                                    ) : (
                                        <span style={{ opacity: 0.3, fontSize: '24px', fontWeight: '900' }}>{i === 9 ? 0 : i + 1}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="close-hint">DRAG TO MOVE • CLICK TO EQUIP • TAB TO CLOSE</div>
                    </div>
                </div>
            )}

            {/* 건설 카탈로그 */}
            {isBuildInventoryOpen && (
                <BuildInventory
                    isOpen={isBuildInventoryOpen}
                    inventory={buildInventory}
                    activeHotbarSlot={activeHotbarSlot}
                    onSlotClick={(idx, sourceIdx = null) => {
                        if (sourceIdx !== null) {
                            handleInventoryClick(idx, sourceIdx, 'build-storage');
                        } else {
                            setActiveHotbarSlot(idx + 1);
                        }
                    }}
                    onSelectItem={(itemId, targetIdx) => {
                        if (onEquipBuildItem) onEquipBuildItem(itemId, targetIdx);
                    }}
                    onClose={() => setIsBuildInventoryOpen(false)}
                />
            )}
        </>
    );
}
