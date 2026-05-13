import React, { useState } from 'react';

const INTRO_SLIDES = [
    {
        id: 1,
        title: "침식되는 금수강산",
        description: "서기 20XX년, 아름답던 대한민국은 끝없는 쓰레기산에 신음하고 있습니다.\n푸른 동해바다와 웅장한 설악산마저 오염의 파도에 잠겨가고, 인류의 미래는 칠흑 같은 어둠 속에 갇혔습니다.",
        image: "/assets/intro/slide1.png"
    },
    {
        id: 2,
        title: "마지막 희망: K-테크",
        description: "절망의 끝에서 대한민국의 천재 과학자들이 결집하여 혁신을 일궈냈습니다.\n버려진 쓰레기를 빛나는 자원으로 연성하는 '스마트 업사이클링' 기술.\n이것이 지구를 구할 마지막 열쇠입니다.",
        image: "/assets/intro/slide2.png"
    },
    {
        id: 3,
        title: "당신의 임무: 강산의 수호자",
        description: "당신은 세계 최초 스마트 팩토리의 총책임자로 임명되었습니다.\n완벽한 자동화 공정을 설계하여 오염된 자원을 정화하고 수익을 창출하십시오.\n다시 푸른 강산을 되찾는 것이 당신의 사명입니다.",
        image: "/assets/intro/slide3.png"
    },
    {
        id: 4,
        title: "공장 가동 지침 (조작 가이드)",
        description: "• 이동: WASD / 방향키\n• 건축 모드 전환: B 키\n• 개인 배낭 열기: TAB 또는 I 키\n• 건축 카탈로그: V 키\n• 아이템 줍기/판매(던지기): G 또는 F 키\n\n준비가 되셨습니까? 이제 인류의 미래가 당신의 손에 달렸습니다.",
        image: null
    }
];

export function IntroTutorial({ onComplete }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const slide = INTRO_SLIDES[currentSlide];

    const nextSlide = () => {
        if (currentSlide < INTRO_SLIDES.length - 1) {
            setCurrentSlide(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(prev => prev - 1);
        }
    };

    return (
        <div className="intro-tutorial-overlay">
            {slide.image && (
                <div 
                    className="intro-background-image" 
                    style={{ backgroundImage: `url(${slide.image})` }}
                />
            )}
            <div className="intro-content-container glass-panel">
                <div className="slide-progress">
                    {INTRO_SLIDES.map((_, i) => (
                        <div key={i} className={`progress-dot ${i === currentSlide ? 'active' : ''}`} />
                    ))}
                </div>
                
                <h1 className="intro-title">{slide.title}</h1>
                <p className="intro-description">{slide.description}</p>
                
                <div className="intro-buttons">
                    {currentSlide > 0 && (
                        <button className="lobby-btn secondary" onClick={prevSlide}>이전으로</button>
                    )}
                    <button className="lobby-btn primary" onClick={nextSlide}>
                        {currentSlide === INTRO_SLIDES.length - 1 ? "공장 진입하기" : "다음으로"}
                    </button>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
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
                    filter: brightness(0.4);
                    animation: panBackground 20s infinite alternate ease-in-out;
                }
                @keyframes panBackground {
                    from { transform: scale(1.1) translateX(-2%); }
                    to { transform: scale(1.1) translateX(2%); }
                }
                .intro-content-container {
                    position: relative;
                    width: 600px;
                    padding: 60px;
                    text-align: center;
                    animation: slideUpFade 0.8s ease-out;
                    border: 1px solid rgba(0, 255, 204, 0.3);
                    background: rgba(15, 23, 42, 0.8);
                    backdrop-filter: blur(20px);
                    border-radius: 20px;
                }
                @keyframes slideUpFade {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .intro-title {
                    font-size: 42px;
                    margin-bottom: 30px;
                    letter-spacing: 6px;
                    color: #00ffcc;
                    text-shadow: 0 0 20px rgba(0, 255, 204, 0.5);
                    font-weight: 800;
                }
                .intro-description {
                    font-size: 18px;
                    line-height: 1.8;
                    color: #fff;
                    margin-bottom: 40px;
                    white-space: pre-line;
                    opacity: 0.9;
                }
                .slide-progress {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-bottom: 40px;
                }
                .progress-dot {
                    width: 40px;
                    height: 4px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                    transition: all 0.3s;
                }
                .progress-dot.active {
                    background: #00ffcc;
                    box-shadow: 0 0 10px #00ffcc;
                }
                .intro-buttons {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                }
                .lobby-btn {
                    padding: 15px 40px;
                    font-size: 16px;
                    font-weight: 700;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                    border: none;
                }
                .lobby-btn.primary {
                    background: linear-gradient(135deg, #00ffcc, #0099ff);
                    color: #000;
                    box-shadow: 0 0 15px rgba(0, 255, 204, 0.4);
                }
                .lobby-btn.primary:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 0 25px rgba(0, 255, 204, 0.6);
                }
                .lobby-btn.secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }
                .lobby-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
            `}} />
        </div>
    );
}
