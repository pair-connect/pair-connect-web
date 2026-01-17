/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import '@/styles/cosmic-background.css';

interface CosmicBackgroundProps {
  maxSparkles?: number;
}

const CosmicBackground = ({ maxSparkles = 100 }: CosmicBackgroundProps) => {
    const [sparkles, setSparkles] = useState<Array<{x: number; y: number; size: number}>>([]);

    useEffect(() => {
        const generateSparkle = () => {
            const sparkle = {
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 4 + 1, 
            };
            setSparkles((prevSparkles) => {
                if (prevSparkles.length >= maxSparkles) {
                    return [...prevSparkles.slice(1), sparkle];
                } else {
                    return [...prevSparkles, sparkle];
                }
            });
        };

        const intervalId = setInterval(() => {
            generateSparkle();
        }, 100);

        return () => clearInterval(intervalId);
    }, [maxSparkles]);

    return (
        <div className="cosmic-background">
            {sparkles.map((sparkle, index) => (
                <div
                    key={index}
                    className="sparkle bg-gradient3 dark:bg-primary"
                    style={{
                        top: `${sparkle.y}%`,
                        left: `${sparkle.x}%`,
                        width: `${sparkle.size}px`,
                        height: `${sparkle.size}px`,
                    }}
                />
            ))}
        </div>
    );
};

export default CosmicBackground;
