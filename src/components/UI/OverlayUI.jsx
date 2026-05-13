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
    setGameState,
    setSettings,
    setIsSettingsOpen,
    setIsInventoryOpen,
    setIsBuildInventoryOpen,
    handleInventoryClick,
    handleStart
}) {
    if (gameState === 'lobby') {
        return <Lobby onStart={handleStart} />;
    }

    if (gameState === 'intro') {
        return <IntroTutorial onComplete={() => setGameState('playing')} />;
    }

    return (
        <>
            <HUD
                money={money}
                results={results}
                isInventoryOpen={isInventoryOpen}
                isSettingsOpen={isSettingsOpen}
                isBuildInventoryOpen={isBuildInventoryOpen}
                buildMode={buildMode}
                inventory={currentInventory}
                activeSlot={activeHotbarSlot}
                onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
                onToggleInventory={() => setIsInventoryOpen(!isInventoryOpen)}
                onToggleBuildInventory={() => setIsBuildInventoryOpen(!isBuildInventoryOpen)}
            />

            {isSettingsOpen && (
                <SettingsMenu
                    settings={settings}
                    onUpdate={setSettings}
                    onClose={() => setIsSettingsOpen(false)}
                />
            )}

            {(isInventoryOpen || isBuildInventoryOpen) && (
                <BuildInventory
                    inventory={currentInventory}
                    activeSlot={activeHotbarSlot}
                    onSlotClick={handleInventoryClick}
                    onClose={() => {
                        setIsInventoryOpen(false);
                        setIsBuildInventoryOpen(false);
                    }}
                />
            )}
        </>
    );
}
