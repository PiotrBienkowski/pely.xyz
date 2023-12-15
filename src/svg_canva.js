import React, { useState, useRef, useEffect } from 'react';

const SVGCanvas = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [lines, setLines] = useState([]);
    const [currentColor, setCurrentColor] = useState('black'); // Aktualny kolor
    const svgRef = useRef(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    const startDrawing = ({ clientX, clientY }) => {
        const rect = svgRef.current.getBoundingClientRect();
        setIsDrawing(true);
        setLines([...lines, { points: [{ x: clientX - rect.left, y: clientY - rect.top }], color: currentColor }]);
    };
    
    const draw = ({ clientX, clientY }) => {
        if (!isDrawing) return;
        const rect = svgRef.current.getBoundingClientRect();
        const newLines = [...lines];
        const points = newLines[newLines.length - 1].points;
        points.push({ x: clientX - rect.left, y: clientY - rect.top });
        newLines[newLines.length - 1].points = points;
        setLines(newLines);
    };

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
    
        window.addEventListener('resize', handleResize);
    
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const changeColor = (newColor) => {
        setCurrentColor(newColor);
    };

    return (
        <div>
            <svg
                ref={svgRef}
                width={windowWidth*0.9}
                height={windowWidth*0.9*210/297}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ border: '1px solid black' }}
            >
                {lines.map((line, index) => (
                    <polyline
                        key={index}
                        points={line.points.map(p => `${p.x},${p.y}`).join(' ')}
                        stroke={line.color}
                        strokeWidth="5"
                        fill="none"
                        strokeLinecap="round"
                    />
                ))}
            </svg>
            <button onClick={() => changeColor('red')}>Czerwony</button>
            {/* Można dodać więcej przycisków do zmiany kolorów */}
        </div>
    );
};

export default SVGCanvas;
