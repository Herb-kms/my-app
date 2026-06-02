/**
 * 공장 시뮬레이션의 초기 데이터 및 상수를 관리하는 파일입니다.
 * 기계의 배치, 벨트의 경로, 아이템의 종류 등 변하지 않는 기본값들이 선언되어 있습니다.
 */

// Math.PI를 상수 PI로 캐싱하여 사용 (각도 계산용, 180도 = PI)
const PI = Math.PI;

// ========================================================================
// 1. 초기 생성 아이템 (INITIAL_ITEMS)
// ========================================================================
/**
 * 게임을 시작했을 때 바닥에 기본으로 떨어져 있는 쓰레기 아이템들입니다.
 * 플레이어가 주워서 벨트 투입구 근처(X: 15, Z: 5)에서 사용할 수 있도록 
 * 투입구와 가까운 좌표(X: 8~12, Z: 8~10)에 배치해두었습니다.
 */
export const INITIAL_ITEMS = [
    { id: 't1', type: 'Can', name: '캔 쓰레기', position: [8, 0.5, 8], status: 'IDLE', value: 10, color: '#ff4444' },
    { id: 't2', type: 'Plastic', name: '플라스틱 쓰레기', position: [10, 0.5, 8], status: 'IDLE', value: 8, color: '#4444ff' },
    { id: 't3', type: 'Glass', name: '유리병 쓰레기', position: [12, 0.5, 8], status: 'IDLE', value: 5, color: '#44ff44' },
    { id: 't4', type: 'Can', name: '캔 쓰레기', position: [8, 0.5, 10], status: 'IDLE', value: 10, color: '#ff4444' },
    { id: 't5', type: 'Plastic', name: '플라스틱 쓰레기', position: [10, 0.5, 10], status: 'IDLE', value: 8, color: '#4444ff' },
    { id: 't6', type: 'Glass', name: '유리병 쓰레기', position: [12, 0.5, 10], status: 'IDLE', value: 5, color: '#44ff44' },
];

// ========================================================================
// 2. 공장 기본 레이아웃 설계도 (U자형 생산 라인)
// ========================================================================
/*
    공장은 효율적인 동선을 위해 거대한 U자 형태로 설계되었습니다.
    
    [도착/판매] [포장기] ← ← ← [건조기] ← ← ← [세척기]
        ↑                                       ↑
      (벨트)                                  (벨트)
        ↑                                       ↑
      [0,0,5]                               [7.5,0,-5]
        ↑
    (벨트: 아래로 이동)                          (벨트: 왼쪽으로 이동)
        ↑
    투입구 영역 → → → [15,0,0] → [분류기] → [파쇄기]
    
    * 아이템 이동 경로 (방향: x, z 좌표 기준)
    플레이어가 시작 벨트(15,0,5)에 올림 → 분류기(15,0,0) → 코너 돌아서 파쇄기(10,0,-7.5)
    → 세척기(2.5,0,-7.5) → 건조기(-5,0,-7.5) → 포장기(-7.5,0,0) → 판매존(2.5,0,5)
*/

// ========================================================================
// 3. 기계 회전(Rotation) 및 방향 시스템 설명
// ========================================================================
/*
    Three.js의 3D 공간에서 rotation[1] (Y축 회전) 값은 시각적인 기계의 방향뿐만 아니라,
    `useFactorySimulation.js`에서 아이템을 뱉어낼(출력) 방향을 결정하는 핵심 데이터입니다.
    
    출력 방향 공식 (라디안 각도에 따른 배출구 방향):
    - 0       (rotMod=0) : -Z 방향으로 아이템 배출 (위로 직진)
    - PI/2    (rotMod=1) : -X 방향으로 아이템 배출 (왼쪽으로 꺾음)
    - PI      (rotMod=2) : +Z 방향으로 아이템 배출 (아래로 직진)
    - -PI/2   (rotMod=3) : +X 방향으로 아이템 배출 (오른쪽으로 꺾음)
*/

// ========================================================================
// 4. 초기 배치 기계 (DEFAULT_MACHINES)
// ========================================================================
export const DEFAULT_MACHINES = [
    // 1단계. 분류기 (SORTING)
    // - 입력: +Z 방향에서 들어오는 컨베이어 벨트 (b2)
    // - 회전: 0 (위쪽, -Z 방향으로 배출)
    { id: 'm1', type: 'SORTING', position: [15, 0, 0], rotation: [0, 0, 0] },

    // 2단계. 파쇄기 (CRUSHING)
    // - 입력: 우측(-X)에서 들어옴
    // - 회전: PI/2 (왼쪽, -X 방향으로 배출하여 세척기로 보냄)
    { id: 'm2', type: 'CRUSHING', position: [10, 0, -7.5], rotation: [0, PI / 2, 0] },

    // 3단계. 세척기 (CLEANING)
    // - 회전: PI/2 (계속해서 왼쪽, -X 방향으로 배출)
    { id: 'm3', type: 'CLEANING', position: [2.5, 0, -7.5], rotation: [0, PI / 2, 0] },

    // 4단계. 건조기 (DRYING)
    // - 회전: PI/2 (계속해서 왼쪽, -X 방향으로 배출하여 포장기로 보냄)
    { id: 'm4', type: 'DRYING', position: [-5, 0, -7.5], rotation: [0, PI / 2, 0] },

    // 5단계. 포장기 (PACKAGING)
    // - 여기서 U자형 커브의 끝에 도달했으므로 아래쪽으로 방향을 틉니다.
    // - 회전: PI (아래쪽, +Z 방향으로 배출)
    { id: 'm5', type: 'PACKAGING', position: [-7.5, 0, 0], rotation: [0, PI, 0] },

    // 6단계. 판매 구역 (SHIPPING_BIN)
    // - 도착한 아이템을 즉시 돈으로 환산해주는 종착점입니다.
    { id: 'm6', type: 'SHIPPING_BIN', position: [2.5, 0, 5], rotation: [0, 0, 0] },
];

// ========================================================================
// 5. 초기 배치 컨베이어 벨트 (DEFAULT_BELTS)
// ========================================================================
export const DEFAULT_BELTS = [
    // ── 플레이어가 최초로 아이템을 올리는 투입구 벨트 ──
    { id: 'b1', position: [15, 0, 5], rotation: [0, 0, 0] },
    { id: 'b1-1', position: [15, 0, 2.5], rotation: [0, 0, 0] },

    // 분류기(SORTING)에서 파쇄기(CRUSHING)로 가는 경로
    { id: 'b2', position: [15, 0, -2.5], rotation: [0, 0, 0] },
    { id: 'b2-2', position: [15, 0, -5], rotation: [0, 0, 0] },
    { id: 'b2-3', position: [15, 0, -7.5], rotation: [0, PI / 2, 0] }, // 여기서 왼쪽으로 꺾임
    { id: 'b2-4', position: [12.5, 0, -7.5], rotation: [0, PI / 2, 0] },
    
    // 파쇄기(CRUSHING)에서 세척기(CLEANING)로 가는 직선 경로
    { id: 'b3', position: [7.5, 0, -7.5], rotation: [0, PI / 2, 0] },
    { id: 'b3-1', position: [5, 0, -7.5], rotation: [0, PI / 2, 0] },

    // 세척기(CLEANING)에서 건조기(DRYING)로 가는 직선 경로
    { id: 'b4', position: [0, 0, -7.5], rotation: [0, PI / 2, 0] },
    { id: 'b4-1', position: [-2.5, 0, -7.5], rotation: [0, PI / 2, 0] },
    
    // 건조기(DRYING)에서 포장기(PACKAGING)로 내려가는 경로
    { id: 'b5', position: [-7.5, 0, -7.5], rotation: [0, PI, 0] }, // 아래로 꺾임
    { id: 'b5-1', position: [-7.5, 0, -5], rotation: [0, PI, 0] },
    { id: 'b5-2', position: [-7.5, 0, -2.5], rotation: [0, PI, 0] },
    
    // 포장기(PACKAGING)에서 판매 구역(SELL ZONE)으로 가는 최종 경로
    { id: 'b6-1', position: [-7.5, 0, 2.5], rotation: [0, PI, 0] },
    { id: 'b6-2', position: [-7.5, 0, 5], rotation: [0, -(PI / 2), 0] }, // 우측으로 꺾임
    { id: 'b6-3', position: [-5, 0, 5], rotation: [0, -(PI / 2), 0] },
    { id: 'b6-4', position: [-2.5, 0, 5], rotation: [0, -(PI / 2), 0] },
    { id: 'b6-5', position: [0, 0, 5], rotation: [0, -(PI / 2), 0] },
];

// ========================================================================
// 6. 건설 모드 카탈로그 (BUILD_CATALOG)
// ========================================================================
/**
 * 인벤토리 단축키 'V'를 누르면 나오는 [건설 카탈로그] 메뉴에 표시될 모든 아이템/기계의 목록입니다.
 * 플레이어가 이 목록에서 항목을 클릭해 핫바에 장착하고 맵에 건설할 수 있습니다.
 */
export const BUILD_CATALOG = [
    { id: "CONVEYOR", name: "컨베이어 벨트", category: "물류", icon: "⏩", color: "#00ffcc" },
    { id: "SORTING", name: "자동 분류기", category: "공정 기계", icon: "🧿", color: "#55aaff" },
    { id: "CRUSHING", name: "압착 파쇄기", category: "공정 기계", icon: "💠", color: "#ffcc00" },
    { id: "CLEANING", name: "고압 세척기", category: "공정 기계", icon: "🌊", color: "#4488ff" },
    { id: "DRYING", name: "열풍 건조기", category: "공정 기계", icon: "🔥", color: "#ff5500" },
    { id: "PACKAGING", name: "최종 포장기", category: "공정 기계", icon: "🍱", color: "#ffffff" },
    { id: "SHIPPING_BIN", name: "판매 구역", category: "공정 기계", icon: "💎", color: "#4caf50" },

    { id: "WALL", name: "공장 벽면", category: "조형물", icon: "🧱", color: "#444444" },
    { id: "SHELF", name: "철제 선반", category: "조형물", icon: "🪜", color: "#aaaaaa" },
    { id: "CRATE", name: "보관용 박스", category: "조형물", icon: "📦", color: "#7B4F2E" },
    { id: "BARREL", name: "연료 드럼통", category: "조형물", icon: "🛢️", color: "#ff6600" },

    { id: "ITEM_PLASTIC", name: "플라스틱 쓰레기", category: "원재료", icon: "🥤", color: "#88ff44" },
    { id: "ITEM_CAN", name: "알루미늄 캔", category: "원재료", icon: "🥫", color: "#ff4444" },
    { id: "ITEM_GLASS", name: "유리병 쓰레기", category: "원재료", icon: "🍾", color: "#44ccff" },
];

// ========================================================================
// 7. 기계 시각 정보 설정 (MACHINE_CONFIGS)
// ========================================================================
/**
 * 3D 환경에서 기계의 텍스트 홀로그램, UI 패널 게이지, 머티리얼 등에 사용되는
 * 각 기계의 한글 이름(label)과 테마 색상(color)을 정의합니다.
 */
export const MACHINE_CONFIGS = {
    SORTING: { color: '#1f57a3', label: '1. 자동 분류기' },
    CRUSHING: { color: '#d9a521', label: '2. 압착 파쇄기' },
    CLEANING: { color: '#2e7d32', label: '3. 고압 세척기' },
    DRYING: { color: '#d84315', label: '4. 열풍 건조기' },
    PACKAGING: { color: '#7b1fa2', label: '5. 최종 포장기' },
    SHIPPING_BIN: { color: '#4caf50', label: '판매 구역' },
};

