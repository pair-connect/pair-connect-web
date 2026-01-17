import { useState, useEffect, useRef } from 'react';

export const useMousePosition = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const elementRef = useRef<HTMLDivElement | null>(null); 

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (elementRef.current) {
                const rect = elementRef.current.getBoundingClientRect();
                const x = event.clientX - rect.left; 
                const y = event.clientY - rect.top; 
                setMousePosition({ x, y });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    useEffect(() => {
        let animationFrameId: number;

        const updateMousePositionInCSS = () => {
            document.documentElement.style.setProperty('--mouse-x', `${mousePosition.x}px`);
            document.documentElement.style.setProperty('--mouse-y', `${mousePosition.y}px`);
            animationFrameId = requestAnimationFrame(updateMousePositionInCSS);
        };

        animationFrameId = requestAnimationFrame(updateMousePositionInCSS);

        return () => cancelAnimationFrame(animationFrameId);
    }, [mousePosition]);

    return { mousePosition, elementRef };
};
