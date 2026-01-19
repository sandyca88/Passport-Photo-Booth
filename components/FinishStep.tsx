
import React, { useState } from 'react';
import { CheckCircle2, Download, Printer, Loader2, Share2, LayoutGrid, Star, Mail, Zap, ShieldCheck, ShoppingCart, X, Smartphone, Infinity } from 'lucide-react';
import { ImageState } from '../types';

interface FinishStepProps {
  image: string;
  imageState: ImageState;
}

const FinishStep: React.FC<FinishStepProps> = ({ image, imageState }) => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const generateCanvas = async (isSheet: boolean) => {
    if (!imageState.targetCountry) return null;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const DPI = 300;
    const sheetWidthIn = 6;
    const sheetHeightIn = 4;
    
    const pxWidth = isSheet 
      ? sheetWidthIn * DPI 
      : Math.round((imageState.targetCountry.widthMm / 25.4) * DPI);
    const pxHeight = isSheet 
      ? sheetHeightIn * DPI 
      : Math.round((imageState.targetCountry.heightMm / 25.4) * DPI);

    canvas.width = pxWidth;
    canvas.height = pxHeight;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pxWidth, pxHeight);

    const imgObj = new Image();
    imgObj.src = image;
    await new Promise((r) => { imgObj.onload = r; });

    let maskObj: HTMLImageElement | null = null;
    if (imageState.mask) {
      maskObj = new Image();
      maskObj.src = imageState.mask;
      await new Promise((r) => { maskObj!.onload = r; });
    }

    const photoPxW = Math.round((imageState.targetCountry.widthMm / 25.4) * DPI);
    const photoPxH = Math.round((imageState.targetCountry.heightMm / 25.4) * DPI);

    const drawPhoto = (targetX: number, targetY: number) => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = photoPxW;
      tempCanvas.height = photoPxH;
      const tctx = tempCanvas.getContext('2d')!;

      tctx.fillStyle = imageState.backgroundColor !== 'transparent' ? imageState.backgroundColor : '#ffffff';
      tctx.fillRect(0, 0, photoPxW, photoPxH);

      const imgAspect = imgObj.width / imgObj.height;
      const previewWidth = 300; 
      const scaleFactor = photoPxW / previewWidth;

      let drawW = photoPxW, drawH = photoPxH;
      if (imgAspect > (photoPxW / photoPxH)) drawW = photoPxH * imgAspect;
      else drawH = photoPxW / imgAspect;

      let startX = (photoPxW - drawW * imageState.zoom) / 2 + (imageState.offset.x * scaleFactor);
      let startY = (photoPxH - drawH * imageState.zoom) / 2 + (imageState.offset.y * scaleFactor);

      if (maskObj) {
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = photoPxW;
        maskCanvas.height = photoPxH;
        const mctx = maskCanvas.getContext('2d')!;
        
        mctx.filter = `brightness(${100 + imageState.exposure}%) contrast(${100 + imageState.contrast}%)`;
        mctx.drawImage(imgObj, startX, startY, drawW * imageState.zoom, drawH * imageState.zoom);
        
        mctx.globalCompositeOperation = 'destination-in';
        mctx.drawImage(maskObj, 0, 0, photoPxW, photoPxH);
        
        tctx.drawImage(maskCanvas, 0, 0);
      } else {
        tctx.filter = `brightness(${100 + imageState.exposure}%) contrast(${100 + imageState.contrast}%)`;
        if (imageState.backgroundColor !== 'transparent') {
          tctx.globalCompositeOperation = 'multiply';
        }
        tctx.drawImage(imgObj, startX, startY, drawW * imageState.zoom, drawH * imageState.zoom);
      }

      ctx.drawImage(tempCanvas, targetX, targetY);
      ctx.strokeStyle = '#eeeeee';
      ctx.lineWidth = 1;
      ctx.strokeRect(targetX, targetY, photoPxW, photoPxH);
    };

    if (isSheet) {
      const margin = 60;
      const gap = 40;
      let currentX = margin;
      let currentY = margin;

      for (let i = 0; i < 8; i++) {
        if (currentX + photoPxW > pxWidth - margin) {
          currentX = margin;
          currentY += photoPxH + gap;
        }
        if (currentY + photoPxH > pxHeight - margin) break;
        drawPhoto(currentX, currentY);
        currentX += photoPxW + gap;
      }
    } else {
      drawPhoto(0, 0);
    }

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  const handleAction = async (mode: 'single' | 'sheet' | 'print') => {
    if (!hasPaid) {
      setShowPurchaseModal(true);
      return;
    }
    
    if (mode === 'print') {
        window.print();
        return;
    }

    setIsGenerating(mode);
    const dataUrl = await generateCanvas(mode === 'sheet');
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = mode === 'sheet' 
        ? `Passport_Sheet_${imageState.targetCountry?.country}.jpg`
        : `Passport_Single_${imageState.targetCountry?.country}.jpg`;
      link.href = dataUrl;
      link.click();
    }
    setIsGenerating(null);
  };

  const simulatePurchase = () => {
    setIsGenerating('purchase');
    setTimeout(() => {
      setHasPaid(true);
      setShowPurchaseModal(false);
      setIsGenerating(null);
    }, 1500);
  };

  return (
    <div className="p-6 flex flex-col items-center animate-in fade-in duration-500 h-full overflow-y-auto pb-10">
      <div className="flex items-center gap-2 bg-[#dcf5e7] text-[#006e41] px-5 py-2.5 rounded-full font-bold text-sm mb-8 shadow-sm">
        <CheckCircle2 size={18} />
        <span>Official 300 DPI High-Res Ready</span>
      </div>

      <div className="relative w-full max-w-[180px] aspect-[3/4] bg-white rounded-[24px] shadow-2xl mb-10 overflow-hidden border-2 border-white ring-1 ring-[#e1e2ec]">
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: imageState.backgroundColor === 'transparent' ? '#ffffff' : imageState.backgroundColor }}
        />
        {imageState.mask ? (
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ 
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: `brightness(${100 + imageState.exposure}%) contrast(${100 + imageState.contrast}%)`,
              transform: `translate(${imageState.offset.x}px, ${imageState.offset.y}px) scale(${imageState.zoom})`,
              WebkitMaskImage: `url(${imageState.mask})`,
              maskImage: `url(${imageState.mask})`,
              WebkitMaskSize: 'cover',
              maskSize: 'cover',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat'
            }} 
          />
        ) : (
          <img 
            src={image} 
            alt="Result Preview" 
            className="relative w-full h-full object-cover"
            style={{ 
              filter: `brightness(${100 + imageState.exposure}%) contrast(${100 + imageState.contrast}%)`,
              transform: `translate(${imageState.offset.x}px, ${imageState.offset.y}px) scale(${imageState.zoom})`,
              mixBlendMode: imageState.backgroundColor === 'transparent' ? 'normal' : 'multiply',
            }} 
          />
        )}
      </div>

      {!hasPaid && (
        <div className="w-full max-w-sm bg-gradient-to-br from-[#1b1b1f] to-[#36363c] p-6 rounded-[32px] text-white shadow-xl mb-8 border border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-white/5 group-hover:rotate-12 transition-transform duration-700">
            <Star size={120} fill="currentColor" />
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Digital Master Access</h3>
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest mt-0.5">Professional Pack</p>
              </div>
              <div className="bg-[#005ac1] text-white px-3 py-1.5 rounded-xl font-black text-lg shadow-inner">
                $4.99
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex gap-4 items-center p-3 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-10 h-10 flex-none bg-[#005ac1] rounded-xl flex items-center justify-center">
                  <Infinity size={22} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-black text-white leading-tight">Unlimited Photos</p>
                  <p className="text-[11px] text-white/60 mt-1 leading-snug">
                    Once purchased, you can take as many photos as you want for any other country or passport type you need!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, text: "No Retail Trips", desc: "Save 30+ mins" },
                  { icon: Mail, text: "Instant Email", desc: "Digital Inbox Copy" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2 p-3 bg-white/5 rounded-2xl border border-white/10">
                    <item.icon size={16} className="text-[#005ac1]" />
                    <div>
                      <p className="text-[11px] font-bold text-white">{item.text}</p>
                      <p className="text-[9px] text-white/40">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => setShowPurchaseModal(true)}
              className="w-full bg-[#005ac1] hover:bg-[#004494] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-black/20 active:scale-[0.98] transition-all"
            >
              <ShoppingCart size={18} />
              BUY IT NOW
            </button>
          </div>
        </div>
      )}

      {hasPaid && (
        <div className="w-full max-w-sm bg-[#e8f1ff] border border-[#005ac1]/20 p-4 rounded-2xl mb-6 flex items-center gap-3 animate-in zoom-in-95">
          <div className="w-10 h-10 bg-[#005ac1] rounded-xl flex items-center justify-center text-white">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-bold text-[#001a41]">Premium Membership Active</p>
            <p className="text-[10px] text-[#44474e]">Unlimited high-res exports are now unlocked for all passport types.</p>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full gap-3 max-w-sm mt-auto">
        <button 
          onClick={() => handleAction('sheet')}
          disabled={!!isGenerating}
          className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] ${
            hasPaid 
              ? 'bg-[#005ac1] text-white shadow-lg' 
              : 'bg-[#f3f4f9] text-[#74777f] border border-[#c3c6cf]'
          }`}
        >
          {isGenerating === 'sheet' ? <Loader2 className="animate-spin" /> : <LayoutGrid size={18} />}
          Download Print Sheet (4x6")
        </button>
        
        <button 
          onClick={() => handleAction('single')}
          disabled={!!isGenerating}
          className={`flex items-center justify-center gap-3 py-4 rounded-2xl font-bold transition-all active:scale-[0.98] ${
            hasPaid 
              ? 'bg-white text-[#005ac1] border-2 border-[#005ac1]' 
              : 'bg-[#f3f4f9] text-[#74777f] border border-[#c3c6cf]'
          }`}
        >
          {isGenerating === 'single' ? <Loader2 className="animate-spin" /> : <Download size={18} />}
          Download Single Photo
        </button>
        
        <div className="grid grid-cols-2 gap-3 mt-1">
          <button 
            onClick={() => handleAction('print')}
            className="flex items-center justify-center gap-2 bg-[#f3f4f9] text-[#44474e] py-3 rounded-xl font-semibold border border-[#c3c6cf] hover:bg-[#ebedf4] transition-colors"
          >
            <Printer size={18} />
            Print
          </button>
          <button className="flex items-center justify-center gap-2 bg-[#f3f4f9] text-[#44474e] py-3 rounded-xl font-semibold border border-[#c3c6cf] hover:bg-[#ebedf4] transition-colors">
            <Share2 size={18} />
            Share
          </button>
        </div>
      </div>

      {showPurchaseModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowPurchaseModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-6 right-6 p-2 text-[#74777f] hover:bg-[#f3f4f9] rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="p-8 pt-12 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#f0f3ff] rounded-[30px] flex items-center justify-center text-[#005ac1] mb-6">
                <ShieldCheck size={40} />
              </div>
              <h2 className="text-2xl font-black text-[#1b1b1f] mb-3">Professional License</h2>
              <p className="text-sm text-[#44474e] mb-2 px-4">
                Unlock high-resolution photos for just <span className="font-bold text-[#1b1b1f]">$4.99</span>.
              </p>
              <p className="text-[11px] text-[#005ac1] font-bold uppercase tracking-wider mb-8">
                Includes unlimited photos for all other passports!
              </p>
              
              <div className="w-full space-y-3">
                <button 
                  onClick={simulatePurchase}
                  disabled={isGenerating === 'purchase'}
                  className="w-full bg-[#005ac1] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-[#005ac1]/20"
                >
                  {isGenerating === 'purchase' ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <Smartphone size={20} />
                      Pay Securely
                    </>
                  )}
                </button>
                <button 
                   onClick={() => setShowPurchaseModal(false)}
                   className="w-full text-[#74777f] py-3 text-sm font-bold hover:text-[#1b1b1f] transition-colors"
                >
                  Back to Preview
                </button>
              </div>
              
              <div className="mt-8 flex items-center gap-2 text-[10px] text-[#74777f] font-bold uppercase tracking-widest">
                <ShieldCheck size={12} />
                Guaranteed to Pass Standard Checks
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinishStep;
