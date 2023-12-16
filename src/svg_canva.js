import React, { useState, useRef, useEffect } from 'react';
import ControlBar from './control_bar/control_bar';
import AddPage from './control_bar/add_page';

const SVGCanvas = () => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [pages, setPages] = useState([[]]);
    const [activePage, setActivePage] = useState(0);
    const [currentColor, setCurrentColor] = useState('black');
    const [currentSize, setCurrentSize] = useState(3);
    const svgRefs = useRef(pages.map(() => React.createRef()));
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sizeHeight, setSizeHeight] = useState(10);
    const [sizeWidth, setSizeWidth] = useState(10);
    const [drawingStartPage, setDrawingStartPage] = useState(null);

    const svgStyle = {
        display: 'block',
        margin: 'auto',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        backgroundColor: '#fff',
        maxWidth: '90%',
        maxHeight: '90vh',
        marginTop: '20px',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none'
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
        if (calcHeight(windowWidth * 0.9) <= windowHeight * 0.9) {
            setSizeHeight(calcHeight(windowWidth * 0.9));
            setSizeWidth(windowWidth * 0.9);
        } else {
            setSizeHeight(windowHeight * 0.9);
            setSizeWidth(calcWidth(windowHeight * 0.9));
        }
    }, [windowWidth, windowHeight]);

    const handleStartDrawing = (pageIndex) => (event) => {
        let { clientX, clientY, touches } = event;
        if (touches) {
            clientX = touches[0].clientX;
            clientY = touches[0].clientY;
        }
        const rect = svgRefs.current[pageIndex].current.getBoundingClientRect();
        
        setIsDrawing(true);
        const newLines = [...pages[pageIndex], { points: [{ x: clientX - rect.left, y: clientY - rect.top }], color: currentColor, size: currentSize }];
        const newPages = [...pages];
        newPages[pageIndex] = newLines;
        setPages(newPages);
        setDrawingStartPage(pageIndex);
    };

    const handleDrawing = (pageIndex) => (event) => {
        if (pageIndex !== drawingStartPage) {
            return;
        }
        if (!pages[pageIndex] || pages[pageIndex].length === 0) {
            return;
        }
        if (!isDrawing) return;
        let { clientX, clientY, touches } = event;
        if (touches) {
            clientX = touches[0].clientX;
            clientY = touches[0].clientY;
        }
        const rect = svgRefs.current[pageIndex].current.getBoundingClientRect();
        const newPages = [...pages];
        const points = newPages[pageIndex][newPages[pageIndex].length - 1].points;
        points.push({ x: clientX - rect.left, y: clientY - rect.top });
        newPages[pageIndex][newPages[pageIndex].length - 1].points = points;
        setPages(newPages);
    };

    const handleStopDrawing = () => {
        setIsDrawing(false);
        setDrawingStartPage(null);
    };

    const addPage = () => {
        setPages([...pages, []]);
        svgRefs.current = [...svgRefs.current, React.createRef()];
    };

    const undoLastLine = () => {
        const newPages = [...pages];
        if (newPages[activePage] && newPages[activePage].length > 0) {
            newPages[activePage].pop();
            setPages(newPages);
        }
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
                event.preventDefault();
                undoLastLine();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [pages, activePage]);

    function calcWidth(height) {
        return height * (297 / 210);
    }

    function calcHeight(width) {
        return width * (210 / 297);
    }

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = '';
            return '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    return (
        <div>
            <ControlBar setCurrentColor={setCurrentColor} currentColor={currentColor} currentSize={currentSize} setCurrentSize={setCurrentSize} />
            {pages.map((page, pageIndex) => (
                <div key={pageIndex} onClick={() => setActivePage(pageIndex)} style={{ cursor: 'pointer' }}>
                    <svg
                        ref={svgRefs.current[pageIndex]}
                        width={sizeWidth}
                        height={sizeHeight}
                        onMouseDown={handleStartDrawing(pageIndex)}
                        onMouseMove={handleDrawing(pageIndex)}
                        onMouseUp={handleStopDrawing}
                        onMouseLeave={handleStopDrawing}
                        onTouchStart={handleStartDrawing(pageIndex)}
                        onTouchMove={handleDrawing(pageIndex)}
                        onTouchEnd={handleStopDrawing}
                        style={svgStyle}
                    >
                        {page.map((line, lineIndex) => (
                            <polyline
                                key={lineIndex}
                                points={line.points.map(p => `${p.x},${p.y}`).join(' ')}
                                stroke={line.color}
                                strokeWidth={line.size}
                                fill="none"
                                strokeLinecap="round"
                            />
                        ))}
                    </svg>
                </div>
            ))}
            <AddPage addPage={addPage} />
        </div>
    );
};

export default SVGCanvas;
