import { useState, useCallback } from 'react';

export const useEraser = (pages, setPages, scale, currentSize, svgRefs, setLastColor, currentColor, setCurrentColor, lastColor, setIsDrawing) => {
    const [isErasing, setIsErasing] = useState(false);
    const [isErasingActive, setIsErasingActive] = useState(false);

    const handleEraserAction = (pageIndex, event) => {
        handleEraser(pageIndex)(event);
    };

    const distanceToLineSegment = useCallback((lineStart, lineEnd, point) => {
        const A = point.x - lineStart.x;
            const B = point.y - lineStart.y;
            const C = lineEnd.x - lineStart.x;
            const D = lineEnd.y - lineStart.y;
    
            const dot = A * C + B * D;
            const lenSq = C * C + D * D;
            const param = lenSq !== 0 ? dot / lenSq : -1;
    
            let xx, yy;
    
            if (param < 0) {
                xx = lineStart.x;
                yy = lineStart.y;
            } else if (param > 1) {
                xx = lineEnd.x;
                yy = lineEnd.y;
            } else {
                xx = lineStart.x + param * C;
                yy = lineStart.y + param * D;
            }
    
            const dx = point.x - xx;
            const dy = point.y - yy;
            return Math.sqrt(dx * dx + dy * dy);
    }, []);

    const toggleEraser = () => {
        if (!isErasing) {
            setLastColor(currentColor);
            setCurrentColor("transparent");
        } else {
            setCurrentColor(lastColor);
        }
        setIsErasing(!isErasing);
        setIsDrawing(false);
    };

    const handleEraser = useCallback((pageIndex) => (event) => {
        if (!isErasing) return;
    
        let { clientX, clientY, touches } = event;
        if (touches) {
            clientX = touches[0].clientX;
            clientY = touches[0].clientY;
        }
        const rect = svgRefs.current[pageIndex].current.getBoundingClientRect();
        const clickX = (clientX - rect.left) * (1 / scale);
        const clickY = (clientY - rect.top) * (1 / scale);
    
        setPages(prevPages => {
            const updatedPages = [...prevPages];
            updatedPages[pageIndex] = updatedPages[pageIndex].filter(line => {
                for (let i = 0; i < line.points.length - 1; i++) {
                    if (distanceToLineSegment(line.points[i], line.points[i + 1], { x: clickX, y: clickY }) < (10 * currentSize * 0.7) * scale) {
                        return false;
                    }
                }
                return true;
            });
    
            return updatedPages;
        });
    }, [isErasing, scale, currentSize]);

    const startErasing = useCallback((pageIndex) => (event) => {
        if (!isErasing) return;
        setIsErasingActive(true);
        handleEraserAction(pageIndex, event);
    }, [isErasing, handleEraserAction]);

    const continueErasing = useCallback((pageIndex) => (event) => {
        if (!isErasingActive) return;
        handleEraserAction(pageIndex, event);
    }, [isErasingActive, handleEraserAction]);

    const stopErasing = useCallback(() => {
        setIsErasingActive(false);
    }, []);

    return {
        isErasing,
        setIsErasing,
        startErasing,
        continueErasing,
        stopErasing,
        toggleEraser
    };
};
