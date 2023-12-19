import jsPDF from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import { getFormattedDateTime } from '../date/formattedDateTime'

export const convertSVGToPDF = async (pages, svgRefs, sizeWidth, sizeHeight, scale, setSizeWidth, setSizeHeight, setScale) => {
    setSizeWidth(297);
    setSizeHeight(210);
    setScale(297 / 1500);
    let tmpSizeWidth = sizeWidth;
    let tmpSizeHeight = sizeHeight;
    let tmpScale = scale;
    
    const pdf = new jsPDF({
        orientation: 'landspace',
        unit: 'px',
        format: [297, 210]
    });

    for (let i = 0; i < pages.length; i++) {
        const svg = svgRefs.current[i].current;

        await svg2pdf(svg, pdf, {
            xOffset: 0,
            yOffset: 0,
            scale: scale
        });

        if (i < pages.length - 1) {
            pdf.addPage();
        }
    }

    setSizeWidth(tmpSizeWidth);
    setSizeHeight(tmpSizeHeight);
    setScale(tmpScale);

    pdf.save('pely_' + getFormattedDateTime() + '.pdf');
};