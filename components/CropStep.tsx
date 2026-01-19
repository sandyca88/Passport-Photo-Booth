
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Info } from 'lucide-react';
import { PASSPORT_CONFIGS } from '../constants';
import { PassportConfig } from '../types';

interface CropStepProps {
  image: string;
  mask: string | null;
  selectedConfig: PassportConfig | null;
  onConfigChange: (config: PassportConfig) => void;
  exposure: number;
  contrast: number;
  backgroundColor: string;
  zoom: number;
  setZoom: (val: number) => void;
  offset: { x: number; y: number };
  setOffset: (val: { x: number; y: number }) => void;
}

const CropStep: React.FC<CropStepProps> = ({ 
  image, mask, selectedConfig, onConfigChange, exposure, contrast, backgroundColor, zoom, setZoom, offset, setOffset
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [selectedConfig]);

  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartPos({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setOffset({ x: clientX - startPos.x, y: clientY - startPos.y });
  };

  const aspectRatio = selectedConfig ? selectedConfig.widthMm / selectedConfig.heightMm : 35 / 45;

  return (
    <div className="p-6 flex flex-col items-center animate-in fade-in duration-500 h-full overflow-y-auto">
      <div className="relative w-full max-w-sm mb-6 z-50">
        <label className="block text-xs font-medium text-[#005ac1] mb-1 px-1">Country Standard</label>
        <button 
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="w-full bg-[#f3f4f9] text-[#1b1b1f] py-4 px-4 rounded-xl flex items-center justify-between border border-[#c3c6cf] hover:border-[#005ac1] transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">{selectedConfig?.flag || '🌍'}</span>
            <span className="font-medium">{selectedConfig?.description || 'Select Country'}</span>
          </div>
          <ChevronDown size={20} className={`transition-transform duration-300 text-[#44474e] ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white rounded-2xl shadow-xl overflow-hidden border border-[#e1e2ec] max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            <div className="p-2 sticky top-0 bg-white border-b border-[#f3f4f9]">
              <div className="flex items-center bg-[#f3f4f9] px-3 py-2 rounded-lg">
                <Search size={16} className="text-[#74777f] mr-2" />
                <input type="text" placeholder="Search standards..." className="bg-transparent text-sm w-full outline-none" />
              </div>
            </div>
            {PASSPORT_CONFIGS.map((config) => (
              <button
                key={config.country}
                onClick={() => { onConfigChange(config); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 p-4 hover:bg-[#f3f4f9] text-left border-b last:border-0 border-[#f3f4f9] transition-colors"
              >
                <span className="text-xl">{config.flag}</span>
                <span className="text-[#1b1b1f] font-medium">{config.country}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div 
        ref={containerRef}
        className="relative w-full max-w-[300px] bg-white rounded-2xl shadow-lg overflow-hidden cursor-move touch-none border-4 border-white ring-1 ring-[#e1e2ec]"
        style={{ aspectRatio: `${aspectRatio}` }}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={() => setIsDragging(false)}
      >
        {/* Background Color */}
        <div 
          className="absolute inset-0 pointer-events-none transition-colors duration-300"
          style={{ backgroundColor: backgroundColor === 'transparent' ? '#ffffff' : backgroundColor }}
        />
        
        {/* Person Layer */}
        {mask ? (
          <div 
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ 
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: `brightness(${100 + exposure}%) contrast(${100 + contrast}%)`,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              WebkitMaskImage: `url(${mask})`,
              maskImage: `url(${mask})`,
              WebkitMaskSize: 'cover',
              maskSize: 'cover',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat'
            }}
          />
        ) : (
          <img 
            src={image} 
            alt="Crop Target" 
            className="absolute max-w-none select-none pointer-events-none"
            style={{ 
              filter: `brightness(${100 + exposure}%) contrast(${100 + contrast}%)`,
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover',
              mixBlendMode: backgroundColor === 'transparent' ? 'normal' : 'multiply',
            }}
          />
        )}
        
        {/* Biometric Overlays */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center opacity-40">
           <div className="w-[60%] h-[50%] border-2 border-dashed border-white rounded-[50%] mb-[10%]" />
           <div className="absolute top-[20%] w-1/3 h-0.5 bg-white/60 rounded-full" />
           <div className="absolute bottom-[25%] w-1/3 h-0.5 bg-white/60 rounded-full" />
           <div className="absolute w-0.5 h-full bg-white/20" />
        </div>

        <div className="absolute inset-4 border-2 border-white/20 rounded-xl" />
      </div>

      <div className="w-full max-w-sm mt-auto py-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[#74777f] text-xs font-medium uppercase tracking-widest justify-center">
            <Info size={14} />
            <span>Align eyes to center</span>
          </div>
          <div className="flex items-center gap-4 px-2">
            <span className="text-xs font-bold text-[#005ac1]">1x</span>
            <input 
              type="range" min="1" max="3" step="0.01" value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-[#dde2f1] rounded-lg appearance-none cursor-pointer accent-[#005ac1]"
            />
            <span className="text-xs font-bold text-[#005ac1]">3x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropStep;
