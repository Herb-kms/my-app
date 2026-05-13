import * as THREE from 'three';

// 초기 아이템: 벨트 투입구(10, 0, 5) 근처에 배치
export const INITIAL_ITEMS = [
    { id: 't1', type: 'Can',     position: [8,  0.5, 8],  status: 'IDLE', value: 10, color: '#ff4444' },
    { id: 't2', type: 'Plastic', position: [10, 0.5, 8],  status: 'IDLE', value: 8,  color: '#4444ff' },
    { id: 't3', type: 'Glass',   position: [12, 0.5, 8],  status: 'IDLE', value: 5,  color: '#44ff44' },
    { id: 't4', type: 'Can',     position: [8,  0.5, 10], status: 'IDLE', value: 10, color: '#ff4444' },
    { id: 't5', type: 'Plastic', position: [10, 0.5, 10], status: 'IDLE', value: 8,  color: '#4444ff' },
    { id: 't6', type: 'Glass',   position: [12, 0.5, 10], status: 'IDLE', value: 5,  color: '#44ff44' },
];

// ─── 공장 기본 레이아웃 (U자형 생산 라인) ──────────────────────────────────
//
//  [SELL]  [PACKAGING] ← [DRYING] ← [CLEANING]
//    ↑                                    ↑
//  (벨트)                              (벨트: 왼쪽 이동)
//    ↑                               [7.5,0,-5] ← [10,0,-5]
//  [0,0,5]                                             ↑
//           투입구 영역 →→→ [10,0,5]→[10,0,2.5]→[SORTING]→[CRUSHING]
//
//  아이템 이동 경로:
//  플레이어가 벨트에 올림 → SORTING(10,0,0) → CRUSHING(10,0,-5)
//  → 벨트로 좌측 이동 → CLEANING(5,0,-5) → DRYING(0,0,-5)
//  → 벨트로 상단 이동 → PACKAGING(0,0,0) → SELL ZONE(0,0,5)
// ────────────────────────────────────────────────────────────────────────────

const PI = Math.PI;

// ────────────────────────────────────────────────────────────────────────────
// 기계 rotation은 시각적 방향 AND 아이템 출력 방향을 동시에 결정합니다.
//
// 출력 방향 공식 (useFactorySimulation.js 기준):
//   rotation[1] → rotMod=0: offZ=-2.5 (-Z 방향 출력)
//   rotation[1] → rotMod=1: offX=-2.5 (-X 방향 출력)  ← PI/2
//   rotation[1] → rotMod=2: offZ=+2.5 (+Z 방향 출력)  ← PI
//   rotation[1] → rotMod=3: offX=+2.5 (+X 방향 출력)  ← 3*PI/2
//
// 연결 경로:
//   벨트 b1,b2 → [SORTING(10,0,0)] → b3 → [CRUSHING(10,0,-5)]
//   → 코너 b4 → b5 → [CLEANING(5,0,-5)] → [DRYING(0,0,-5)]
//   → b6 → [PACKAGING(0,0,0)] → b7 → [SELL(0,0,5)]
// ────────────────────────────────────────────────────────────────────────────
export const DEFAULT_MACHINES = [
    // SORTING: 입력=벨트 b2(+Z에서 내려옴), 출력=-Z → rotMod=0
    { id: 'm1', type: 'SORTING',      position: [10, 0,  0],  rotation: [0, 0,          0] },

    // CRUSHING: 입력=b3(-Z에서 내려옴), 출력=-X(→b4) → rotMod=1
    { id: 'm2', type: 'CRUSHING',     position: [10, 0, -5],  rotation: [0, PI / 2,     0] },

    // CLEANING: 입력=b4(-X에서 들어옴), 출력=-X(→b5) → rotMod=1
    { id: 'm3', type: 'CLEANING',     position: [ 5, 0, -5],  rotation: [0, PI / 2,     0] },

    // DRYING: 입력=b5(-X에서 들어옴), 출력=+Z(→b6) → rotMod=2
    { id: 'm4', type: 'DRYING',       position: [ 0, 0, -5],  rotation: [0, PI,         0] },

    // PACKAGING: 입력=b6(+Z에서 들어옴), 출력=+Z(→b7) → rotMod=2
    { id: 'm5', type: 'PACKAGING',    position: [ 0, 0,  0],  rotation: [0, PI,         0] },

    // 판매존: 벨트 b7에서 도착, 아이템 자동 판매
    { id: 'm6', type: 'SHIPPING_BIN', position: [ 0, 0,  5],  rotation: [0, 0,          0] },
];

export const DEFAULT_BELTS = [
    // ── 오른쪽 라인: 투입구에서 내려오는 벨트 (rotMod=0 → -Z 이동) ──
    { id: 'b1', position: [10, 0,  5],    rotation: [0, 0,           0] }, // 투입 입구 벨트
    { id: 'b2', position: [10, 0,  2.5],  rotation: [0, 0,           0] }, // SORTING 진입 전

    // SORTING(10,0) → CRUSHING(10,-5) 사이 연결 벨트
    { id: 'b3', position: [10, 0, -2.5],  rotation: [0, 0,           0] }, // 두 기계 사이

    // ── 코너: CRUSHING → CLEANING (오른쪽→왼쪽, rotMod=1 → -X 이동) ──
    { id: 'b4', position: [ 7.5, 0, -5],  rotation: [0, PI / 2,      0] }, // 코너 벨트 1
    { id: 'b5', position: [ 2.5, 0, -5],  rotation: [0, PI / 2,      0] }, // 코너 벨트 2

    // ── 왼쪽 라인: CLEANING → DRYING → PACKAGING (위↑, rotMod=2 → +Z 이동) ──
    { id: 'b6', position: [ 0, 0, -2.5],  rotation: [0, PI,          0] }, // DRYING→PACKAGING 연결
    { id: 'b7', position: [ 0, 0,  2.5],  rotation: [0, PI,          0] }, // PACKAGING→SELL 연결
];

export const BUILD_CATALOG = [
    { id: 'CONVEYOR', name: 'Conveyor Belt', category: 'Logic' },
    { id: 'SORTING', name: 'Sorting Machine', category: 'Machine' },
    { id: 'CRUSHING', name: 'Crushing Machine', category: 'Machine' },
    { id: 'CLEANING', name: 'Cleaning Machine', category: 'Machine' },
    { id: 'DRYING', name: 'Drying Machine', category: 'Machine' },
    { id: 'PACKAGING', name: 'Packaging Machine', category: 'Machine' },
    { id: 'SHIPPING_BIN', name: 'Sell Zone', category: 'Machine' },
    { id: 'WALL', name: 'Factory Wall', category: 'Structure' },
    { id: 'SHELF', name: 'Industrial Shelf', category: 'Prop' },
    { id: 'CRATE', name: 'Wooden Crate', category: 'Prop' },
    { id: 'BARREL', name: 'Oil Barrel', category: 'Prop' },
    { id: 'ITEM_PLASTIC', name: 'Plastic Waste', category: 'Resource' },
    { id: 'ITEM_CAN', name: 'Alu Can Waste', category: 'Resource' },
    { id: 'ITEM_GLASS', name: 'Glass Waste', category: 'Resource' },
];

export const MACHINE_CONFIGS = {
    SORTING:      { color: '#1f57a3', label: '1. SORTER' },
    CRUSHING:     { color: '#d9a521', label: '2. CRUSHER' },
    CLEANING:     { color: '#2e7d32', label: '3. CLEANER' },
    DRYING:       { color: '#d84315', label: '4. DRYER' },
    PACKAGING:    { color: '#7b1fa2', label: '5. PACKAGER' },
    SHIPPING_BIN: { color: '#4caf50', label: 'SELL ZONE' },
};
