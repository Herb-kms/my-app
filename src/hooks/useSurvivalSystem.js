import { useState, useEffect, useRef } from 'react';

const OXYGEN_STATION_POS = [-3.5, 0, 8.0];

export const getTaxAmount = (day) => {
    switch (day) {
        case 0: return 0;
        case 1: return 100;
        case 2: return 250;
        case 3: return 450;
        case 4: return 700;
        case 5: return 1000;
        default: return 0;
    }
};

/**
 * 0일차(튜토리얼) + 5일 차 진행 및 산소 필터 서바이벌 시스템 비즈니스 로직을 총괄하는 커스텀 훅입니다.
 */
export function useSurvivalSystem({
    gameState,
    setGameState,
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

    // 일차 및 시간 시스템 상태
    const [currentDay, setCurrentDay] = useState(0); // 0일차(튜토리얼)로 시작
    const [gameHour, setGameHour] = useState(8);      // 오전 8시 시작
    const [gameMinute, setGameMinute] = useState(0);
    const [shippedPurifierCore, setShippedPurifierCore] = useState(false); // 5일차 전용 목표

    // 인게임 튜토리얼 단계 (0일차에 활성화)
    const [tutorialStep, setTutorialStep] = useState('pick_up'); // 'pick_up' -> 'equip' -> 'place_belt' -> 'completed'

    // 공장 내부 범위 체크 (x: -12.5 ~ 19.5, z: -12.5 ~ 9.5)
    const checkIsInsideFactory = (x, z) => {
        return x >= -12.5 && x <= 19.5 && z >= -12.5 && z <= 9.5;
    };

    // 실시간 산소 소모/충전 루프
    useEffect(() => {
        if (gameState !== 'playing' || isCompromised) return;

        // 0일차(튜토리얼)에는 산소 무제한
        if (currentDay === 0) {
            setOxygen(100);
            return;
        }

        const interval = setInterval(() => {
            const [px, , pz] = playerPositionRef.current;
            const isInside = checkIsInsideFactory(px, pz);

            setOxygen(prev => {
                let drain = 0;
                if (isInside) {
                    // 일차가 지날수록 공장 내부의 공기도 탁해집니다.
                    if (currentDay === 2) drain = 0.3;
                    else if (currentDay === 3) drain = 0.4;
                    else if (currentDay >= 4) drain = 0.6;
                } else {
                    // 외부 미로에서는 고독성으로 인해 산소 급감
                    if (currentDay === 1) drain = 1.5;
                    else if (currentDay === 2 || currentDay === 3) drain = 1.8;
                    else if (currentDay >= 4) drain = 2.25;
                }

                const nextOxy = Math.max(0, prev - drain);
                if (nextOxy === 0) {
                    setIsCompromised(true);
                }
                return nextOxy;
            });

            // 플레이어가 충전기에서 멀어지면 확인 상태를 해제
            const dist = Math.sqrt(Math.pow(px - OXYGEN_STATION_POS[0], 2) + Math.pow(pz - OXYGEN_STATION_POS[2], 2));
            if (dist > 3.0) {
                setChargeConfirm(false);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [gameState, isCompromised, currentDay, playerPositionRef]);

    // 게임 내 하루 시간 흐름 루프 (Day 1~5일 때 작동, 1.5초마다 10분 증가)
    useEffect(() => {
        if (gameState !== 'playing' || isCompromised || currentDay === 0) return;

        const timeInterval = setInterval(() => {
            setGameMinute(prevMin => {
                let nextMin = prevMin + 10;
                if (nextMin >= 60) {
                    nextMin = 0;
                    setGameHour(prevHour => {
                        let nextHour = prevHour + 1;
                        if (nextHour >= 24) {
                            return 24; // useEffect에서 24 감지 후 처리하도록 유지
                        }
                        return nextHour;
                    });
                }
                return nextMin;
            });
        }, 1500);

        return () => clearInterval(timeInterval);
    }, [gameState, isCompromised, currentDay]);

    // 자정(24:00) 평가 루프
    useEffect(() => {
        if (gameState !== 'playing' || currentDay === 0) return;

        if (gameHour === 24) {
            // 시간 초기화 및 일차 평가 진행
            setGameHour(8);
            setGameMinute(0);

            const tax = getTaxAmount(currentDay);

            setMoney(prevMoney => {
                if (prevMoney >= tax) {
                    if (currentDay === 5) {
                        // 5일차 최종 클리어 검증
                        if (shippedPurifierCore) {
                            setGameState('outro'); // 엔딩 아웃트로 시작!
                            return prevMoney - tax;
                        } else {
                            setResults(prev => ["[체납 실패] Day 5 최종 목표 미달: '대기 정화 코어'를 제작하여 배송함에 투입해야 합니다. 5일차가 재설정됩니다.", ...prev].slice(0, 5));
                            setOxygen(100);
                            return prevMoney;
                        }
                    } else {
                        // 다음 날로 전진
                        setResults(prev => [`[납부 성공] Day ${currentDay} 산소 구독세 $${tax}을 납부했습니다! 다음 일차(Day ${currentDay + 1})로 이동합니다.`, ...prev].slice(0, 5));
                        setCurrentDay(d => d + 1);
                        setOxygen(100);
                        setShippedPurifierCore(false);
                        return prevMoney - tax;
                    }
                } else {
                    // 세금 체납 시 하루 초기화 및 20% 벌금
                    const penalty = Math.floor(tax * 0.2);
                    setResults(prev => [`[체납 실패] Day ${currentDay} 세금 $${tax}을 내지 못했습니다! 슈트 압수 벌금 -$${penalty}이 부과되며 하루가 재설정됩니다.`, ...prev].slice(0, 5));
                    setOxygen(100);
                    setShippedPurifierCore(false);
                    return Math.max(0, prevMoney - penalty);
                }
            });
        }
    }, [gameHour, currentDay, gameState, shippedPurifierCore, setGameState, setMoney, setResults]);

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

    // 산소 충전기 상호작용
    const handleChargeInteraction = () => {
        const [px, , pz] = playerPositionRef.current;
        const dist = Math.sqrt(Math.pow(px - OXYGEN_STATION_POS[0], 2) + Math.pow(pz - OXYGEN_STATION_POS[2], 2));
        
        if (dist >= 3.0) return false;

        if (!chargeConfirm) {
            setChargeConfirm(true);
            setResults(prev => ["[충전 대기] 충전하시겠습니까? (비용: $10) [E/F]를 한 번 더 누르면 충전됩니다.", ...prev].slice(0, 5));
            
            const alertId = Date.now();
            setWorldAlerts(prev => [...prev, { 
                id: alertId, 
                text: "충전하시겠습니까? (비용: $10) [E] 한번 더 입력", 
                position: [OXYGEN_STATION_POS[0], 2.4, OXYGEN_STATION_POS[2]] 
            }]);

            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
            confirmTimeoutRef.current = setTimeout(() => {
                setChargeConfirm(false);
                setWorldAlerts(prev => prev.filter(a => a.id !== alertId));
            }, 4000);
        } else {
            setChargeConfirm(false);
            if (confirmTimeoutRef.current) clearTimeout(confirmTimeoutRef.current);
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
        setCurrentDay(0);
        setGameHour(8);
        setGameMinute(0);
        setShippedPurifierCore(false);
        setTutorialStep('pick_up');
    };

    return {
        oxygen,
        isCompromised,
        chargeConfirm,
        currentDay,
        setCurrentDay,
        gameHour,
        setGameHour,
        gameMinute,
        setGameMinute,
        shippedPurifierCore,
        setShippedPurifierCore,
        tutorialStep,
        setTutorialStep,
        handleReboot,
        handleChargeInteraction,
        resetSystem
    };
}
