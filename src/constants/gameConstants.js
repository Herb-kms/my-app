// 1. 상수 및 초기값 설정
export const INITIAL_ITEMS = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    position: [(Math.random() - 0.5) * 18, 0.3, (Math.random() - 0.5) * 18],
    type: i % 3 === 0 ? "Plastic" : i % 3 === 1 ? "Can" : "Glass",
    color: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FF4500" : "#FF69B4" // Glass: Pink
}));

// 기계 위치 및 설정
export const MACHINE_CONFIGS = [
    { name: "1. SORTING", pos: [0, 1.25, -5], rot: [0, 0, 0] },
    { name: "2. CRUSHING", pos: [0, 1.25, -15], rot: [0, 0, 0] },
    { name: "3. CLEANING", pos: [-8, 1.25, -25], rot: [0, Math.PI / 2, 0] },
    { name: "4. DRYING", pos: [-16, 1.25, -15], rot: [0, Math.PI, 0] },
    { name: "5. PACKAGING", pos: [-16, 1.25, -5], rot: [0, Math.PI, 0] }
];

// 벨트 포인트 (협소화 및 효율화된 경로)
export const BELT_POINTS = [
    [0, 0.5, 10],   // 시작 (투입구)
    [0, 0.5, -5],   // M1 (Sorting)
    [0, 0.5, -15],  // M2 (Crushing)
    [0, 0.5, -25],  // 코너 1
    [-8, 0.5, -25], // M3 (Cleaning)
    [-16, 0.5, -25], // 코너 2
    [-16, 0.5, -15], // M4 (Drying)
    [-16, 0.5, -5],  // M5 (Packaging)
    [-16, 0.5, 5]    // 종료 (생산품 배출)
];

export const STAGES = ["Moving", "Sorting", "Crushing", "Cleaning", "Drying", "Packaging"];

// 처리 속도 계수 (더 긴 경로에 맞춰 상향 조정 가능)
// 낮은 수치일수록 해당 단계가 천천히 진행됩니다.
// 모든 단계가 명확히 보이도록 전체적으로 속도를 대폭 하향 조정 (0.3 ~ 0.5 수준)
export const STAGE_SPEED_FACTORS = [0.35, 0.4, 0.45, 0.5, 0.45];
