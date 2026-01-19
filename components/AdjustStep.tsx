
import React, { useState, useRef } from 'react';
import { Sun, Palette, Sliders, Check, Pipette, Sparkles, Loader2, RotateCcw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AdjustStepProps {
  image: string;
  mask: string | null;
  setMask: (mask: string | null) => void;
  exposure: number;
  setExposure: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  backgroundColor: string;
  setBackgroundColor: (val: string) => void;
}

const AdjustStep: React.FC<AdjustStepProps> = ({ 
  image, 
  mask,
  setMask,
  exposure, 
  setExposure, 
  contrast, 
  setContrast, 
  backgroundColor, 
  setBackgroundColor 
}) => {
  const [activeTab, setActiveTab] = useState<'background' | 'lighting'>('background');
  const [isProcessing, setIsProcessing] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const bgOptions = [
    { id: 'white', color: '#ffffff', label: 'WHITE' },
    { id: 'blue', color: '#b9d1ff', label: 'BLUE' },
    { id: 'transparent', color: 'transparent', label: 'ORIGINAL' }
  ];

  const handleCustomColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackgroundColor(e.target.value);
  };

  const isCustomColor = !bgOptions.some(opt => opt.color === backgroundColor) && backgroundColor !== 'transparent';

  // Converts a black-and-white mask image into a PNG with transparency
  // (Black becomes transparent, White becomes opaque)
  const processMaskToAlpha = (maskDataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(maskDataUrl);

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          // Use the brightness of the pixel to set its alpha value
          const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i + 3] = brightness; // Set alpha based on brightness
          // Keep it white so it acts as a clean mask
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = maskDataUrl;
    });
  };

  const runMagicCutout = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const base64Data = image.split(',')[1];
      const mimeType = image.split(',')[0].split(':')[1].split(';')[0];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType: mimeType } },
            { text: 'Create a high-contrast black and white segmentation mask for the person in this image. The person should be pure white (#FFFFFF) and the background must be solid pure black (#000000). Ensure the edges are sharp and clean. Return only the mask image.' },
          ],
        },
      });

      let rawMaskUrl = null;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          rawMaskUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (rawMaskUrl) {
        // Convert B&W image to Alpha mask for CSS
        const alphaMaskUrl = await processMaskToAlpha(rawMaskUrl);
        setMask(alphaMaskUrl);
      } else {
        alert("Failed to generate mask. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("AI processing error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center animate-in fade-in duration-500 h-full overflow-y-auto">
      {/* Photo Preview Container */}
      <div className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden border border-[#e1e2ec] shadow-md mb-8">
        <div className="aspect-[3/4] relative overflow-hidden bg-white">
          {/* Background Color Layer */}
          <div 
            className="absolute inset-0 transition-colors duration-500"
            style={{ 
              backgroundColor: backgroundColor === 'transparent' ? '#ffffff' : backgroundColor 
            }}
          />
          
          {/* Person Layer */}
          {mask ? (
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: `brightness(${100 + exposure}%) contrast(${100 + contrast}%)`,
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
              alt="Adjust" 
              className="relative w-full h-full object-cover transition-all duration-300"
              style={{ 
                filter: `brightness(${100 + exposure}%) contrast(${100 + contrast}%)`,
                mixBlendMode: backgroundColor === 'transparent' ? 'normal' : 'multiply',
              }} 
            />
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-10">
              <Loader2 className="animate-spin text-[#005ac1] mb-2" size={32} />
              <p className="text-xs font-bold text-[#005ac1] tracking-widest uppercase">Isolating Person...</p>
            </div>
          )}
        </div>
      </div>

      {/* Tab Switcher - Matches Screenshot */}
      <div className="flex w-full max-w-sm border border-[#c3c6cf] rounded-full overflow-hidden mb-10">
        <button 
          onClick={() => setActiveTab('background')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
            activeTab === 'background' ? 'bg-[#dce2f9] text-[#001a41]' : 'bg-white text-[#44474e]'
          }`}
        >
          <Palette size={20} />
          Background
        </button>
        <div className="w-[1px] bg-[#c3c6cf]" />
        <button 
          onClick={() => setActiveTab('lighting')}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-all ${
            activeTab === 'lighting' ? 'bg-[#dce2f9] text-[#001a41]' : 'bg-white text-[#44474e]'
          }`}
        >
          <Sun size={20} />
          Lighting
        </button>
      </div>

      {/* Control Panel */}
      <div className="w-full max-w-sm px-2">
        {activeTab === 'background' ? (
          <div className="space-y-8">
            {/* Color Grid Container - Matches Screenshot Layout */}
            <div className="bg-[#f7f9ff] rounded-[40px] p-8 shadow-sm border border-[#e1e2ec]">
              <div className="flex justify-between items-start">
                {bgOptions.map((opt) => {
                  const isSelected = backgroundColor === opt.color;
                  return (
                    <div key={opt.id} className="flex flex-col items-center gap-3">
                      <button
                        onClick={() => setBackgroundColor(opt.color)}
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'ring-4 ring-[#005ac1] ring-offset-2 scale-110 shadow-lg' 
                            : 'ring-1 ring-[#c3c6cf] hover:scale-105 bg-white'
                        }`}
                        style={{ 
                          background: opt.color === 'transparent' ? 'none' : opt.color,
                          backgroundImage: opt.id === 'transparent' ? `url(${image})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {isSelected && (
                          <div className="bg-[#005ac1] text-white rounded-full p-1 shadow-md">
                            <Check size={14} strokeWidth={4} />
                          </div>
                        )}
                      </button>
                      <span className={`text-[10px] font-bold tracking-widest ${isSelected ? 'text-[#005ac1]' : 'text-[#74777f]'}`}>
                        {opt.label}
                      </span>
                    </div>
                  );
                })}

                {/* Custom Gradient Picker */}
                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => colorInputRef.current?.click()}
                    className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all overflow-hidden ${
                      isCustomColor 
                        ? 'ring-4 ring-[#005ac1] ring-offset-2 scale-110 shadow-lg' 
                        : 'ring-1 ring-[#c3c6cf] hover:scale-105 bg-gradient-to-tr from-red-400 via-green-400 to-blue-400'
                    }`}
                    style={{ background: isCustomColor ? backgroundColor : undefined }}
                  >
                    <Pipette size={24} className="text-white drop-shadow-md" />
                    {isCustomColor && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-full">
                        <Check size={20} className="text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                  <span className={`text-[10px] font-bold tracking-widest ${isCustomColor ? 'text-[#005ac1]' : 'text-[#74777f]'}`}>
                    CUSTOM
                  </span>
                  <input 
                    type="color" 
                    ref={colorInputRef} 
                    className="hidden" 
                    value={isCustomColor ? backgroundColor : '#ffffff'}
                    onChange={handleCustomColor} 
                  />
                </div>
              </div>
            </div>

            {/* AI Magic Button - Matches Screenshot Styling */}
            <div className="bg-[#f0f3ff] border-2 border-dashed border-[#ccd5f0] rounded-[32px] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#dce2f9] rounded-2xl flex items-center justify-center text-[#001a41]">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#1b1b1f]">Magic AI Cutout</h3>
                    <p className="text-[11px] text-[#44474e] font-medium leading-tight">
                      Perfectly isolate you from the background
                    </p>
                  </div>
                </div>
                {mask ? (
                  <button 
                    onClick={() => setMask(null)}
                    className="p-2 text-[#44474e] hover:text-[#005ac1] transition-colors"
                  >
                    <RotateCcw size={22} />
                  </button>
                ) : (
                  <button 
                    onClick={runMagicCutout}
                    disabled={isProcessing}
                    className="bg-[#005ac1] text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-sm active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? 'Working...' : 'Apply'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-10 py-4 px-2">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1b1b1f] uppercase tracking-wider">
                  <Sun size={18} className="text-[#005ac1]" />
                  <span>Exposure</span>
                </div>
                <div className="bg-[#005ac1] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {exposure > 0 ? `+${exposure}` : exposure}
                </div>
              </div>
              <input 
                type="range" min="-40" max="40" value={exposure} 
                onChange={(e) => setExposure(parseInt(e.target.value))}
                className="w-full h-2 bg-[#dde2f1] rounded-lg appearance-none cursor-pointer accent-[#005ac1]"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-bold text-[#1b1b1f] uppercase tracking-wider">
                  <Sliders size={18} className="text-[#005ac1]" />
                  <span>Contrast</span>
                </div>
                <div className="bg-[#005ac1] text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {contrast > 0 ? `+${contrast}` : contrast}
                </div>
              </div>
              <input 
                type="range" min="-40" max="40" value={contrast} 
                onChange={(e) => setContrast(parseInt(e.target.value))}
                className="w-full h-2 bg-[#dde2f1] rounded-lg appearance-none cursor-pointer accent-[#005ac1]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdjustStep;
