"use client";
import { useState, useRef, useEffect } from "react";

export default function ImageCompareSlider({ before, after }: { before: string; after: string }) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const position = ((x - rect.left) / rect.width) * 100;
        setSliderPosition(Math.max(0, Math.min(100, position)));
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full select-none cursor-ew-resize overflow-hidden"
            onMouseMove={handleMove}
            onTouchMove={handleMove}
        >
            <img src={after} className="absolute inset-0 w-full h-full object-cover" alt="Processed" />

            <div
                className="absolute inset-0 w-full h-full overflow-hidden"
                style={{ width: `${sliderPosition}%`, borderRight: '2px solid white' }}
            >
                <img src={before} className="absolute inset-0 h-full w-[1000px] max-w-none object-cover" alt="Original" />
            </div>

            {/* The "Handle" */}
            <div
                className="absolute top-0 bottom-0 z-10 w-1 bg-white"
                style={{ left: `${sliderPosition}%` }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-2xl flex items-center justify-center">
                    <div className="flex gap-1">
                        <div className="w-0.5 h-4 bg-gray-300 rounded-full" />
                        <div className="w-0.5 h-4 bg-gray-300 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}