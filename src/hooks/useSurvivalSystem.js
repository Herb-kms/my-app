import { useState, useEffect, useRef } from 'react';

const OXYGEN_STATION_POS = [-3.5, 0, 8.0];

/**
 * 1안: 슈트 산소 필터 서바이벌 시스템 및 충전 스테이션 상호작용 관련 비즈니스 로직을 분리한 커스텀 훅입니다.
 */
export function useSurvivalSystem({
    gameState,
    money,
    setMoney,
    setNormalInventory,
    setResults,
    setWorldAlerts,
    playerPositionRef,
    playerRef
}) {
    const [oxygen, setOxygen] = useState(100);
    const [isCompromised, setIsCompromised] = useState(false);
    const [chargeConfirm, setChargeConfirm] = useState(false);
    const confirmTimeoutRef = useRef(null);

    // 공장 내부 범위 체크 (x: -12.5 ~ 19.5, z: -12.5 ~ 9.5)
    const checkIsInsideFactory = (x, z) => {
        return x >= -12.5 && x <= 19.5 && z >= -12.5 && z <= 9.5;
    };

    // 실시간 산소 소모/충전 루프
    useEffect(() => {
        if (gameState !== 'playing' || isCompromised) return;

        const interval = setInterval(() => {
            const [px, , pz] = playerPositionRef.current;
            const isInside = checkIsInsideFactory(px, pz);

            setOxygen(prev => {
                if (isInside) {
                    // 공장 내부에서는 산소가 자동으로 차지 않고 유지됨
                    return prev;
                } else {
                    // 미로 골목에서는 서서히 방전 (-1.5%씩)
                    const nextOxy = Math.max(0, prev - 1.5);
                    if (nextOxy === 0) {
                        setIsCompromised(true);
                    }
                    return nextOxy;
                }
            });

            // 플레이어가 충전기에서 멀어지면 확인 상태를 해제
            const dist = Math.sqrt(Math.pow(px - OXYGEN_STATION_POS[0], 2) + Math.pow(pz - OXYGEN_STATION_POS[2], 2));
            if (dist > 3.0) {
                setChargeConfirm(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState, isCompromised, playerPositionRef]);

    // 슈트 긴급 리부트 함수
    const handleReboot = () => {
        setMoney(prevMoney => {
            const rebootCost = 50;
            if (prevMoney >= rebootCost) {
                setResults(prev => ["슈트 필터 긴급 리부트 완료 (-$50)", ...prev].slice(0, 5));
                return prevMoney - rebootCost;
            } else {
                setNormalInventory(Array(10).fill(null));
                setResults(prev => ["자금 부족으로 파산 프로토콜 가동: 인벤토리 몰수", ...prev].slice(0, 5));
                return 0;
            }
        });

        if (playerRef.current) {
            playerRef.current.position.set(10, 0, 8);
        }
        playerPositionRef.current = [10, 0, 8];
        setOxygen(100);
        setIsCompromised(false);
        setChargeConfirm(false);
    };

    // 산소 충전기 상호작용 (확인 절차 포함)
    const handleChargeInteraction = () => {
        const [px, , pz] = playerPositionRef.current;
        const dist = Math.sqrt(Math.pow(px - OXYGEN_STATION_POS[0], 2) + Math.pow(pz - OXYGEN_STATION_POS[2], 2));
        
        if (dist >= 3.0) return false; // 상호작용 거리가 아님

        if (!chargeConfirm) {
            // 1단계: 충전 질문 메시지 출력
            setChargeConfirm(true);
            setResults(prev => ["[충전 대기] 충전하시겠습니까? (비용: $10) [E/F]를 한 번 더 누르면 충전됩니다.", ...prev].slice(0, 5));
            
            const alertId = Date.now();
            setWorldAlerts(prev => [...prev, { 
                id: alertId, 
                text: "충전하시겠습니까? (비용: $10) [E] 한번 더 입력", 
                position: [OXYGEN_STATION_POS[0], 2.4, OXYGEN_STATION_POS[2]] 
            }]);

            // 4초 후 자동 취소
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            confirmTimeoutRef.current = setTimeout(() => {
                setChargeConfirm(false);
                setWorldAlerts(prev => prev.filter(a => a.id !== alertId));
            }, 4000);
        } else {
            // 2단계: 실제 충전 및 확인 메시지 출력
            setChargeConfirm(false);
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            
            // 월드 얼럿 클리어
            setWorldAlerts(prev => prev.filter(a => !a.text.includes("충전하시겠습니까")));

            setMoney(prevMoney => {
                if (prevMoney >= 10) {
                    setOxygen(100);
                    setResults(prev => ["산소 충전 완료! (+100%) (-$10)", ...prev].slice(0, 5));
                    
                    const successAlertId = Date.now();
                    setWorldAlerts(prev => [...prev, { 
                        id: successAlertId, 
                        text: "산소 충전 완료!", 
                        position: [OXYGEN_STATION_POS[0], 2.4, OXYGEN_STATION_POS[2]] 
                    }]);
                    setTimeout(() => {
                        setWorldAlerts(prev => prev.filter(a => a.id !== successAlertId));
                    }, 2000);

                    return prevMoney - 10;
                } else {
                    const failAlertId = Date.now();
                    setResults(prev => ["충전 실패: 크레딧 부족", ...prev].slice(0, 5));
                    setWorldAlerts(prev => [...prev, { 
                        id: failAlertId, 
                        text: "충전 비용($10)이 부족합니다", 
                        position: [OXYGEN_STATION_POS[0], 2.4, OXYGEN_STATION_POS[2]] 
                    }]);
                    setTimeout(() => {
                        setWorldAlerts(prev => prev.filter(a => a.id !== failAlertId));
                    }, 2000);
                    
                    return prevMoney;
                }
            });
        }
        return true;
    };

    const resetSystem = () => {
        setOxygen(100);
        setIsCompromised(false);
        setChargeConfirm(false);
    };

    return {
        oxygen,
        isCompromised,
        chargeConfirm,
        handleReboot,
        handleChargeInteraction,
        resetSystem
    };
}
