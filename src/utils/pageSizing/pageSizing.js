import React, { useState, useEffect, useCallback, useMemo } from 'react';

export const usePageSizing = () => {
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [sizeHeight, setSizeHeight] = useState(10);
    const [sizeWidth, setSizeWidth] = useState(10);
    const [scale, setScale] = useState(0.5);

    const handleResize = useCallback(() => {
        clearTimeout(handleResize.debounce);
        handleResize.debounce = setTimeout(() => {
            setWindowWidth(window.innerWidth);
            setWindowHeight(window.innerHeight);
        }, 200);
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(handleResize.debounce);
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize]);

    const calculatedHeight = useMemo(() => calcHeight(windowWidth * 0.9), [windowWidth]);
    const calculatedWidth = useMemo(() => calcWidth(windowHeight * 0.9), [windowHeight]);

    useEffect(() => {
        let newHeight, newWidth;
        if (calculatedHeight <= windowHeight * 0.9) {
            newHeight = calculatedHeight;
            newWidth = windowWidth * 0.9;
        } else {
            newHeight = windowHeight * 0.9;
            newWidth = calculatedWidth;
        }
        setSizeHeight(newHeight);
        setSizeWidth(newWidth);
    }, [windowWidth, windowHeight, calculatedHeight, calculatedWidth]);

    useEffect(() => {
        setScale(sizeWidth / 1500);
    }, [sizeWidth]);

    function calcWidth(height) {
        return height * (297 / 210);
    }

    function calcHeight(width) {
        return width * (210 / 297);
    }

    return { sizeWidth, sizeHeight, scale, setSizeWidth, setSizeHeight, setScale };
};