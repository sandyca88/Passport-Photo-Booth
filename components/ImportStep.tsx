
import React, { useRef, useState } from 'react';
import { Camera, Upload, Image as ImageIcon, X, HelpCircle, CheckCircle2, User, Sun, Maximize, AlertCircle, Printer } from 'lucide-react';

interface ImportStepProps {
  onImageSelect: (dataUrl: string) => void;
  selectedImage: string | null;
  onClear: () => void;
}

const ImportStep: React.FC<ImportStepProps> = ({ onImageSelect, selectedImage, onClear }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showRequirements, setShowRequirements] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) onImageSelect(event.target.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      setIsCapturing(false);
      alert("Camera access denied.");
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        onImageSelect(canvasRef.current.toDataURL('image/png'));
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
    setIsCapturing(false);
  };

  const requirements = [
    {
      icon: User,
      title: "Neutral Expression",
      text: "Look directly at the camera with eyes open and mouth closed. A natural, neutral facial expression is required; no smiling or frowning."
    },
    {
      icon: Sun,
      title: "Lighting & Background",
      text: "Use a plain, uniform white or off-white background. Ensure even, bright lighting across the face and ears with no visible shadows."
    },
    {
      icon: Maximize,
      title: "Head Position & Framing",
      text: "The face must be centered and vertical. The head should occupy approximately 70-80% of the total photo height."
    },
    {
      icon: AlertCircle,
      title: "Accessories & Headwear",
      text: "Remove glasses to prevent eye obstruction or glare. No hats, headbands, or coverings allowed except for religious or medical reasons."
    },
    {
      icon: Printer,
      title: "Print & Quality",
      text: "Images must be sharp, clear, and high-contrast. Use professional photo paper and print at 300 DPI minimum resolution."
    }
  ];

  return (
    <div className="p-6 flex flex-col items-center animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-[#f3f4f9] rounded-[28px] overflow-hidden border border-[#e1e2ec] shadow-sm mb-8">
        <div className="aspect-[3/4] flex items-center justify-center bg-[#dde2f1] relative">
          {selectedImage ? (
            <div className="w-full h-full relative">
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={onClear}
                className="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-[#1b1b1f] hover:bg-white transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
          ) : isCapturing ? (
            <div className="w-full h-full relative">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
              <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                <button 
                  onClick={takePhoto}
                  className="w-16 h-16 bg-white rounded-full border-[6px] border-[#005ac1] shadow-lg active:scale-95 transition-transform"
                />
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <ImageIcon size={48} className="mx-auto text-[#44474e] mb-4 opacity-50" />
              <p className="text-[#44474e] font-medium">Capture or Upload Photo</p>
              <p className="text-xs text-[#74777f] mt-1">Select a source to begin processing</p>
            </div>
          )}
        </div>
      </div>

      {!selectedImage && !isCapturing && (
        <div className="flex flex-col w-full gap-3 max-w-sm">
          <button 
            onClick={startCamera}
            className="w-full flex items-center justify-center gap-3 bg-[#005ac1] text-white py-4 rounded-full font-bold hover:shadow-lg transition-all active:bg-[#004494] active:scale-[0.98]"
          >
            <Camera size={20} />
            <span>Open Camera</span>
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-3 bg-white text-[#005ac1] border-2 border-[#005ac1] py-4 rounded-full font-bold hover:bg-[#f0f3ff] transition-all active:scale-[0.98]"
          >
            <Upload size={20} />
            <span>Upload from Gallery</span>
          </button>
        </div>
      )}

      {!isCapturing && (
        <button 
          onClick={() => setShowRequirements(true)}
          className="mt-8 flex items-center gap-2 text-[#74777f] text-sm font-semibold hover:text-[#005ac1] transition-colors group px-4 py-2 bg-white rounded-full border border-[#e1e2ec] shadow-sm"
        >
          <HelpCircle size={18} className="group-hover:rotate-12 transition-transform text-[#005ac1]" />
          <span>View Photo Requirements</span>
        </button>
      )}

      {/* Requirements Modal */}
      {showRequirements && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowRequirements(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-8 pb-0 flex justify-between items-center">
              <div className="flex items-center gap-3 text-[#005ac1]">
                <CheckCircle2 size={24} strokeWidth={3} />
                <h2 className="text-xl font-black tracking-tight">Official Standards</h2>
              </div>
              <button 
                onClick={() => setShowRequirements(false)}
                className="p-2 text-[#74777f] hover:bg-[#f3f4f9] rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 pt-6 max-h-[75vh] overflow-y-auto">
              <div className="space-y-6">
                {requirements.map((req, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="w-12 h-12 flex-none bg-[#f0f3ff] rounded-2xl flex items-center justify-center text-[#005ac1] group-hover:bg-[#005ac1] group-hover:text-white transition-colors duration-300">
                      <req.icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-[#1b1b1f] uppercase tracking-widest">{req.title}</h3>
                      <p className="text-sm text-[#44474e] leading-relaxed mt-1.5 font-medium">{req.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-[#fff8f1] border border-[#ffb4ab] rounded-[32px]">
                <div className="flex gap-3">
                  <AlertCircle size={20} className="text-[#ba1a1a] flex-none mt-0.5" />
                  <div>
                    <p className="text-[10px] font-black text-[#ba1a1a] uppercase tracking-widest">Printer Guidelines</p>
                    <p className="text-[11px] text-[#44474e] mt-2 font-medium leading-relaxed">
                      Photos must be printed at 100% scale (no resizing) on high-quality matte or glossy photo paper. Digital files are optimized for 300 DPI high-resolution output.
                    </p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowRequirements(false)}
                className="w-full mt-8 bg-[#005ac1] text-white py-5 rounded-3xl font-bold hover:bg-[#004494] transition-all shadow-xl shadow-[#005ac1]/20 active:scale-[0.98]"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImportStep;
