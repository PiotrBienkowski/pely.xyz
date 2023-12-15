import React, { useState, useRef, useEffect } from 'react';
import ControlBar from './control_bar/control_bar';

const SVGCanvas = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [lines, setLines] = useState([]);
    const [currentColor, setCurrentColor] = useState('black');
    const [currentSize, setCurrentSize] = useState(5);
    const svgRef = useRef(null);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sizeHeight, setSizeHeight] = useState(10);
    const [sizeWidth, setSizeWidth] = useState(10);
    const [scale, setScale] = useState(1);

    const svgStyle = {
        display: 'block',
        margin: 'auto',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        backgroundColor: '#fff',
        maxWidth: '90%',
        maxHeight: '90vh',
        marginTop: '40px',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none'
    };

    const handleTouch = (event) => {
        event.preventDefault();
        const touch = event.touches[0];
        return { clientX: touch.clientX, clientY: touch.clientY };
    };

    const startDrawing = ({ clientX, clientY, touches }) => {
        if (touches) {
            clientX = touches[0].clientX;
            clientY = touches[0].clientY;
        }
        const rect = svgRef.current.getBoundingClientRect();
        setIsDrawing(true);
        setLines([...lines, { points: [{ x: (clientX - rect.left) * (1 / scale), y: (clientY - rect.top) * (1 / scale) }], color: currentColor, size: currentSize * (1 / scale) }]);
    };
    
    const draw = (event) => {
        if (!isDrawing) return;
        const { clientX, clientY } = event.touches ? handleTouch(event) : event;
        const rect = svgRef.current.getBoundingClientRect();
        const newLines = [...lines];
        const points = newLines[newLines.length - 1].points;
        points.push({ x: (clientX - rect.left) * (1 / scale), y: (clientY - rect.top) * (1 / scale) });
        newLines[newLines.length - 1].points = points;
        setLines(newLines);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };


    useEffect(() => {
        const handleResize = () => {
            setWindowHeight(window.innerHeight);
            setWindowWidth(window.innerWidth);
        };
    
        window.addEventListener('resize', handleResize);
    
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'z') {
                event.preventDefault();
                undoLastLine();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [lines]);

    function calcWidth(height) {
        return height * (297 / 210);
    }

    function calcHeight(width) {
        return width * (210 / 297);
    }

    useEffect(() => {
        if (calcHeight(windowWidth * 0.9) <= windowHeight * 0.9) {
            setSizeHeight(calcHeight(windowWidth * 0.9));
            setSizeWidth(windowWidth * 0.9);
            setScale(sizeWidth / 1500);
        } else {
            setSizeHeight(windowHeight * 0.9);
            setSizeWidth(calcWidth(windowHeight * 0.9));
            setScale(sizeWidth / 1500);
        } 
    }, [windowWidth, windowHeight]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = ''; // Ustawienie returnValue jest wymagane w niektórych przeglądarkach
            return ''; // Ten tekst nie jest zwykle wyświetlany w nowoczesnych przeglądarkach
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);


    const undoLastLine = () => {
        if (lines.length > 0) {
            setLines(lines.slice(0, -1));
        }
    };

    return (
        <div>
            <ControlBar setCurrentColor={setCurrentColor} currentColor={currentColor} currentSize={currentSize} setCurrentSize={setCurrentSize} />
            <svg
                ref={svgRef}
                width={sizeWidth}
                height={sizeHeight}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={svgStyle}
            >
                {lines.map((line, index) => (
                    <polyline
                        key={index}
                        points={line.points.map(p => `${p.x * scale},${p.y * scale}`).join(' ')}
                        stroke={line.color}
                        strokeWidth={line.size * scale}
                        fill="none"
                        strokeLinecap="round"
                    />
                ))}
            </svg>
        </div>
    );
};

export default SVGCanvas;
