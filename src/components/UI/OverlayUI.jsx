import React from 'react';
import { HUD, SettingsMenu, BuildInventory } from './UIComponents';
import { IntroTutorial } from './IntroTutorial';
import { getTaxAmount } from '../../hooks/useSurvivalSystem';

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
    handleReboot,
    currentDay = 0,
    gameHour = 8,
    gameMinute = 0,
    shippedPurifierCore = false,
    tutorialStep = 'pick_up',
    setTutorialStep
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

            {/* 상단 중앙 일차 및 시간 정보 바 */}
            {gameState === 'playing' && (
                <div className="day-time-widget glass-panel">
                    <div className="day-badge">
                        {currentDay === 0 ? 'TUTORIAL (0일차)' : `DAY ${currentDay}`}
                    </div>
                    <div className="time-badge">
                        ⏰ {String(gameHour).padStart(2, '0')}:{String(gameMinute).padStart(2, '0')}
                    </div>
                    <div className="tax-badge" style={{ color: money >= getTaxAmount(currentDay) ? '#00ffcc' : '#ff4444' }}>
                        {currentDay === 0 ? (
                            <span>목표: 기초 튜토리얼 완수</span>
                        ) : currentDay === 5 ? (
                            <span>목표: 세금 $1000 + 코어 적재 ({shippedPurifierCore ? '✅ 완료' : '❌ 미완료'})</span>
                        ) : (
                            <span>세금 목표: ${getTaxAmount(currentDay)}</span>
                        )}
                    </div>
                </div>
            )}

            {/* 0일차 인게임 튜토리얼 가이드 바 */}
            {gameState === 'playing' && currentDay === 0 && (
                <div className="tutorial-guide-bar glass-panel">
                    <div className="tutorial-title">★ 0일차: 오리엔테이션 미션 ★</div>
                    <div className="tutorial-step-content">
                        {tutorialStep === 'pick_up' && (
                            <>
                                <span className="emoji">🧹</span>
                                <span>미션 1: 바닥에 굴러다니는 쓰레기 근처로 다가가 <b>[E]</b> 또는 <b>[F]</b> 키로 주우세요!</span>
                            </>
                        )}
                        {tutorialStep === 'equip' && (
                            <>
                                <span className="emoji">🎒</span>
                                <span>미션 2: 핫바 단축키 <b>(1~10)</b> 또는 <b>마우스 휠</b>을 굴려 인벤토리에 들어간 쓰레기를 <b>장착(손에 들기)</b>하세요!</span>
                            </>
                        )}
                        {tutorialStep === 'place_belt' && (
                            <>
                                <span className="emoji">⚙️</span>
                                <span>미션 3: 황색 등이 반짝이는 <b>시작 컨베이어 벨트(오른쪽 하단)</b> 근처로 이동 후 <b>[E]</b> 키로 아이템을 올려놓으세요!</span>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* 최종 클리어 엔딩 아웃트로 오버레이 */}
            {gameState === 'outro' && (
                <div className="ending-outro-overlay">
                    <div className="ending-outro-content glass-panel">
                        <h1 className="ending-title">🎉 MISSION SUCCESSFUL 🎉</h1>
                        <div className="ending-body-text">
                            <p className="typed-line"><b>[AI 안내 시스템: 지구 오염도 0.00% 달성]</b></p>
                            <p className="typed-line">로그인 성공... 지구 표면 대기 정화 프로토콜 완수.</p>
                            <p className="typed-line">더 이상 슈트 필터 경고 및 유독성 물질이 감지되지 않습니다.</p>
                            <p className="typed-line">당신은 공장에 버려진 고철 속에서 인류 문명의 청록색 불씨를 피워냈고,</p>
                            <p className="typed-line">산소를 독점하던 거대 기업 K-ECOTECH의 지배 체제를 종식시켰습니다.</p>
                            <br/>
                            <p className="typed-line font-highlight"><b>개척자여, 마침내 헬멧을 벗고 이 땅의 첫 맑은 공기를 마음껏 들이쉬십시오.</b></p>
                        </div>
                        <button className="ending-exit-btn" onClick={handleStart}>
                            메인 로비로 돌아가기 (Lobby)
                        </button>
                    </div>
                </div>
            )}

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

            {/* 일반 인벤토리 */}
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
