import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

const ScrambledText = ({
    radius = 100,
    duration = 1.2,
    speed = 3,
    scrambleChars = '.:',
    className = '',
    style = {},
    children
}) => {
    const rootRef = useRef(null);
    const charsRef = useRef([]);

    useEffect(() => {
        const el = rootRef.current;
        if (!el) return;

        const handleMove = (e) => {
            charsRef.current.forEach((charSpan) => {
                if (!charSpan) return;

                const rect = charSpan.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;

                const dx = e.clientX - centerX;
                const dy = e.clientY - centerY;
                const dist = Math.hypot(dx, dy);

                if (dist < radius) {
                    const d = duration * (1 - dist / radius);

                    // Only animate if not already animating or if we want to overwrite?
                    // The original code uses overwrite: true, which kills active tweens.
                    // We'll use a simple flag or check if tween is active? 
                    // Actually, gsap.to(obj) with overwrite: 'auto' might not work on a plain object the same way as DOM.
                    // But we can kill tweens on the span itself if we attach the tween to it?
                    // Let's attach a custom property to the span to tween.

                    gsap.to(charSpan, {
                        overwrite: true,
                        duration: d,
                        ease: 'none',
                        onUpdate: function () {
                            // Randomly scramble
                            // We can use the progress to decide probability of showing original char?
                            // Or just random chars until the end.
                            // The original plugin reveals text over time. 
                            // But here we just want to scramble while near?
                            // The original code: scrambleText: { text: c.dataset.content ... }
                            // This means it animates TOWARDS the content.

                            const progress = this.progress();
                            const charsArray = scrambleChars.split('');
                            const randomChar = charsArray[Math.floor(Math.random() * charsArray.length)];

                            // As we get closer to completion (1), we show the original char more often?
                            // Or just show random until the very end?
                            // ScrambleTextPlugin usually reveals from left to right or randomly.
                            // Let's just show random char until progress is 1.

                            if (progress < 1) {
                                charSpan.textContent = randomChar;
                            } else {
                                charSpan.textContent = charSpan.dataset.char;
                            }
                        },
                        onComplete: () => {
                            charSpan.textContent = charSpan.dataset.char;
                        }
                    });
                }
            });
        };

        el.addEventListener('pointermove', handleMove);
        return () => {
            el.removeEventListener('pointermove', handleMove);
            // Kill all tweens
            charsRef.current.forEach(c => gsap.killTweensOf(c));
        };
    }, [radius, duration, speed, scrambleChars]);

    const text = typeof children === 'string' ? children : '';

    return (
        <div
            ref={rootRef}
            className={`font-mono text-[clamp(14px,4vw,32px)] cursor-default ${className}`}
            style={style}
        >
            <p className="inline-block">
                {text.split('').map((char, i) => (
                    <span
                        key={i}
                        ref={el => charsRef.current[i] = el}
                        data-char={char}
                        className="inline-block will-change-transform"
                    >
                        {char}
                    </span>
                ))}
            </p>
        </div>
    );
};

export default ScrambledText;
