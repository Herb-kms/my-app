import React, { useState, useEffect, useRef } from 'react';
import { playTypingBeep as playBeep, playSlideTransition as playTransition } from '../../utils/audioManager';

const INTRO_SLIDES = [
    {
        id: 1,
        title: "접속 성공: 오염도 99.8%",
        description: "[AI 안내 시스템: 감정 없는 기계음]\n\n\"접속 성공. 현재 시각 2086년 7월 24일.\n지구 표면 오염도 99.8%.\"",
        image: "/assets/intro/slide1.png"
    },
    {
        id: 2,
        title: "지독한 풍경",
        description: "\"안녕, 개척자여. 이 지독한 풍경이 낯설나?\n\n2086년, 온 세상은 이미 거대한 쓰레기장으로 덮였다. 인간들이 쓰고 버린 물건들이 역습을 시작했고, 도시는 숨을 멈췄지.\"",
        image: "/assets/intro/slide2.png"
    },
    {
        id: 3,
        title: "고철 더미 속의 보물",
        description: "\"하지만 절망하기엔 이르다. 모두가 쓰레기라고 부르는 이 고철더미 속에서, 누군가는 문명을 다시 세울 '보물'을 보니까. 바로 너처럼.\n\n버려진 플라스틱은 단단한 벽이 되고, 낡은 모터는 도시의 심장이 될 것이다.\"",
        image: "/assets/intro/slide3.png"
    },
    {
        id: 4,
        title: "LEVEL 1: 가치를 증명하라",
        description: "\"연장을 쥐어라. 이 시뮬레이션의 끝에서, 네가 만든 세상이 진짜 우리의 미래가 될 테니까.\"\n\n[관리자 시스템 조작 프로토콜]\n• 작업자 이동: WASD / 방향키\n• 설비 배치 (건축 모드): B 키\n• 관리자 인벤토리: TAB 또는 I 키\n• 설비 카탈로그: V 키\n• 자원 직접 제어 (줍기/판매): G 또는 F 키",
        image: null
    }
];

export function IntroTutorial({ onComplete }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const intervalRef = useRef(null);
    const slide = INTRO_SLIDES[currentSlide];

    useEffect(() => {
        let currentText = '';
        let currentIndex = 0;
        setDisplayedText('');

        if (intervalRef.current) clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            if (currentIndex < slide.description.length) {
                const char = slide.description[currentIndex];
                currentText += char;
                setDisplayedText(currentText);

                // 공백이 아닌 문자가 출력될 때마다, 짝수 인덱스에서만 소리 재생 (과도한 소음 방지)
                if (char.trim() !== '' && currentIndex % 2 === 0) {
                    playBeep();
                }

                currentIndex++;
            } else {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }, 40);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [currentSlide, slide.description]);

    const nextSlide = () => {
        playTransition();
        if (currentSlide < INTRO_SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const prevSlide = () => {
        playTransition();
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space' || e.code === 'Enter') {
                e.preventDefault();
                setDisplayedText(prevText => {
                    if (prevText.length < slide.description.length) {
                        // 스킵: 진행 중인 타이핑 멈추고 전체 텍스트 표시
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        intervalRef.current = null;
                        return slide.description;
                    }
                    // 이미 타이핑이 끝난 상태라면 아무것도 하지 않음 (다음 버튼을 눌러야 넘어감)
                    return prevText;
                });
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentSlide, slide.description]);

    return (
        <div className="intro-tutorial-overlay">
            {slide.image && (
                <div
                    className="intro-background-image"
                    style={{ backgroundImage: `url(${slide.image})` }}
                />
            )}
            <div className="intro-content-container glass-panel">
                <div className="terminal-header">
                    <span className="terminal-dot red"></span>
                    <span className="terminal-dot yellow"></span>
                    <span className="terminal-dot green"></span>
                    <span className="terminal-title">K-ECOTECH // SECURE_TERMINAL_V1.4</span>
                </div>

                <div className="slide-progress">
                    {INTRO_SLIDES.map((_, i) => (
                        <div key={i} className={`progress-dot ${i === currentSlide ? 'active' : ''}`} />
                    ))}
                </div>

                <h1 className="intro-title">{slide.title}</h1>
                <div className="intro-description">
                    {displayedText}
                    <span className="typewriter-cursor"></span>
                </div>

                <div className="intro-buttons">
                    {currentSlide > 0 && (
                        <button className="lobby-btn secondary" onClick={prevSlide}>이전으로</button>
                    )}
                    <button className="lobby-btn primary" onClick={nextSlide}>
                        {currentSlide === INTRO_SLIDES.length - 1 ? "시스템 가동" : "데이터 수신"}
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .intro-tutorial-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: #000;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .intro-background-image {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    filter: brightness(0.3) contrast(1.2) sepia(0.2) hue-rotate(180deg);
                    animation: panBackground 20s infinite alternate ease-in-out;
                }
                @keyframes panBackground {
                    from { transform: scale(1.05) translateX(-1%); }
                    to { transform: scale(1.05) translateX(1%); }
                }
                .intro-content-container {
                    position: relative;
                    width: 700px;
                    padding: 40px;
                    text-align: center;
                    animation: slideUpFade 0.8s ease-out;
                    border: 1px solid rgba(0, 255, 204, 0.4);
                    background: rgba(10, 15, 25, 0.85);
                    backdrop-filter: blur(15px);
                    border-radius: 12px;
                    box-shadow: 0 0 30px rgba(0, 255, 204, 0.15), inset 0 0 20px rgba(0, 255, 204, 0.05);
                }
                .terminal-header {
                    display: flex;
                    align-items: center;
                    padding-bottom: 15px;
                    border-bottom: 1px solid rgba(0, 255, 204, 0.2);
                    margin-bottom: 30px;
                }
                .terminal-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    margin-right: 8px;
                }
                .terminal-dot.red { background: #ff5f56; }
                .terminal-dot.yellow { background: #ffbd2e; }
                .terminal-dot.green { background: #27c93f; }
                .terminal-title {
                    margin-left: 10px;
                    font-family: 'Courier New', Courier, monospace;
                    color: rgba(0, 255, 204, 0.6);
                    font-size: 13px;
                    letter-spacing: 2px;
                }
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .intro-title {
                    font-size: 32px;
                    margin-bottom: 25px;
                    letter-spacing: 2px;
                    color: #00ffcc;
                    text-shadow: 0 0 10px rgba(0, 255, 204, 0.3);
                    font-weight: 800;
                    text-align: left;
                    border-left: 4px solid #00ffcc;
                    padding-left: 15px;
                }
                .intro-description {
                    font-size: 16px;
                    line-height: 1.8;
                    color: #a0aec0;
                    margin-bottom: 40px;
                    white-space: pre-wrap;
                    text-align: left;
                    font-family: 'Consolas', 'Courier New', Courier, monospace;
                    min-height: 160px;
                    background: rgba(0, 0, 0, 0.5);
                    padding: 25px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .typewriter-cursor {
                    display: inline-block;
                    width: 8px;
                    height: 18px;
                    background-color: #00ffcc;
                    margin-left: 4px;
                    vertical-align: middle;
                    animation: blink 1s step-end infinite;
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .slide-progress {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-bottom: -20px;
                    position: relative;
                    top: -10px;
                }
                .progress-dot {
                    width: 30px;
                    height: 3px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                    transition: all 0.3s;
                }
                .progress-dot.active {
                    background: #00ffcc;
                    box-shadow: 0 0 8px #00ffcc;
                }
                .intro-buttons {
                    display: flex;
                    gap: 15px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
                .lobby-btn {
                    padding: 12px 30px;
                    font-size: 15px;
                    font-weight: 700;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: none;
                    font-family: inherit;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .lobby-btn.primary {
                    background: #00ffcc;
                    color: #000;
                    box-shadow: 0 0 15px rgba(0, 255, 204, 0.2);
                }
                .lobby-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 0 20px rgba(0, 255, 204, 0.5);
                    background: #33ffdb;
                }
                .lobby-btn.secondary {
                    background: transparent;
                    color: #a0aec0;
                    border: 1px solid rgba(160, 174, 192, 0.3);
                }
                .lobby-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    border-color: rgba(255, 255, 255, 0.5);
                }
            `}} />
        </div>
    );
}
