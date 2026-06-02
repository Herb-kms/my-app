let globalAudioCtx = null;
let lastMachineSoundTime = 0;
let masterVolume = 10;

export const setMasterVolume = (vol) => {
    masterVolume = vol / 100;
};

export const getAudioContext = () => {
    if (typeof window !== 'undefined') {
        if (!globalAudioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) globalAudioCtx = new AudioContext();
        }
        if (globalAudioCtx && globalAudioCtx.state === 'suspended') {
            globalAudioCtx.resume().catch(() => { });
        }
    }
    return globalAudioCtx;
};

// 1. 인트로 타자기 소리
export const playTypingBeep = () => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + Math.random() * 400, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1 * masterVolume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.03);
    } catch (e) { }
};

// 2. 인트로 슬라이드 전환 소리
export const playSlideTransition = () => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.25 * masterVolume, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch (e) { }
};

export const getVolumeByDistance = (sourcePos, playerPosRef) => {
    if (!sourcePos || !playerPosRef || !playerPosRef.current) return masterVolume;
    const [px, py, pz] = playerPosRef.current;
    const dx = sourcePos[0] - px;
    const dz = sourcePos[2] - pz;
    const distance = Math.sqrt(dx * dx + dz * dz);

    // Max volume at 0 distance, drops to 0 around distance 25
    const maxDistance = 25;
    if (distance > maxDistance) return 0;

    // Exponential falloff for realistic sound fading, scaled by master volume
    return Math.pow(1 - (distance / maxDistance), 2) * masterVolume;
};

// 3. 기계 투입 소리
export const playEnterMachineSound = (machine, playerPosRef) => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const volumeFactor = getVolumeByDistance(machine?.position, playerPosRef);
        if (volumeFactor <= 0) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // 기계 종류마다 다른 소리
        if (machine?.type === 'SHREDDER') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(300, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.2);
        } else if (machine?.type === 'WASHER') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(500, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
        } else {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(400, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.15);
        }

        const baseGain = 0.16;
        gainNode.gain.setValueAtTime(baseGain * volumeFactor, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    } catch (e) { }
};

// 4. 기계 가동 소리
export const playProcessingSound = (machine, playerPosRef) => {
    const now = Date.now();
    // 쓰로틀링 주기를 약간 짧게 하여 여러 기계 소리가 섞이게 함
    if (now - lastMachineSoundTime < 150) return;
    lastMachineSoundTime = now;

    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const volumeFactor = getVolumeByDistance(machine?.position, playerPosRef);
        if (volumeFactor <= 0) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        let baseFreq = 80;
        let rampFreq = 100;

        if (machine?.type === 'SHREDDER') {
            osc.type = 'sawtooth';
            baseFreq = 60;
            rampFreq = 90;
        } else if (machine?.type === 'WASHER') {
            osc.type = 'sine';
            baseFreq = 140;
            rampFreq = 160;
        } else if (machine?.type === 'DRYER') {
            osc.type = 'square';
            baseFreq = 120;
            rampFreq = 140;
        } else {
            osc.type = 'sawtooth';
            baseFreq = 80;
            rampFreq = 100;
        }

        osc.frequency.setValueAtTime(baseFreq + Math.random() * 20, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(rampFreq, ctx.currentTime + 0.1);
        osc.frequency.linearRampToValueAtTime(baseFreq, ctx.currentTime + 0.3);

        const baseGain = 0.08;
        gainNode.gain.setValueAtTime(baseGain * volumeFactor, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) { }
};

let lastConveyorSoundTime = 0;

// 5. 컨베이어 벨트 이동 소리
export const playConveyorSound = (position, playerPosRef) => {
    const now = Date.now();
    // 250ms 마다 발생시켜 연속적인 구동음/마찰음 느낌을 줍니다.
    if (now - lastConveyorSoundTime < 250) return;
    lastConveyorSoundTime = now;

    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const volumeFactor = getVolumeByDistance(position, playerPosRef);
        if (volumeFactor <= 0) return;

        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        // 부드러운 "지이잉" 모터 소리 (Triangle 파형으로 변경 및 주파수 조정)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140 + Math.random() * 10, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + 0.2);

        // 부드러운 페이드인/아웃 적용
        const baseGain = 0.12;
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(baseGain * volumeFactor, ctx.currentTime + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
    } catch (e) { }
};
