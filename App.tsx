
import React, { useState } from 'react';
import { ChevronLeft, Info } from 'lucide-react';
import StepIndicator from './components/StepIndicator';
import ImportStep from './components/ImportStep';
import AdjustStep from './components/AdjustStep';
import CropStep from './components/CropStep';
import FinishStep from './components/FinishStep';
import { AppStep, ImageState } from './types';
import { PASSPORT_CONFIGS } from './constants';

const App: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<AppStep>(AppStep.IMPORT);
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    processed: null,
    mask: null,
    exposure: 0,
    contrast: 0,
    backgroundColor: 'transparent',
    targetCountry: PASSPORT_CONFIGS[0],
    zoom: 1,
    offset: { x: 0, y: 0 }
  });

  const nextStep = () => {
    const steps = Object.values(AppStep);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) setCurrentStep(steps[currentIndex + 1]);
  };

  const prevStep = () => {
    const steps = Object.values(AppStep);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) setCurrentStep(steps[currentIndex - 1]);
  };

  const canGoNext = () => {
    if (currentStep === AppStep.IMPORT && !imageState.original) return false;
    return true;
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-[#fefbff] flex flex-col shadow-2xl relative">
      <div className="flex-none bg-[#fefbff] z-50">
        <StepIndicator currentStep={currentStep} />
      </div>

      <main className="flex-1 overflow-y-auto pb-32">
        {currentStep === AppStep.IMPORT && (
          <ImportStep 
            onImageSelect={(dataUrl) => setImageState(prev => ({ ...prev, original: dataUrl, mask: null }))} 
            selectedImage={imageState.original}
            onClear={() => setImageState(prev => ({ ...prev, original: null, mask: null }))}
          />
        )}
        {currentStep === AppStep.ADJUST && imageState.original && (
          <AdjustStep 
            image={imageState.original}
            mask={imageState.mask}
            setMask={(maskUrl) => setImageState(prev => ({ ...prev, mask: maskUrl }))}
            exposure={imageState.exposure}
            setExposure={(val) => setImageState(prev => ({ ...prev, exposure: val }))}
            contrast={imageState.contrast}
            setContrast={(val) => setImageState(prev => ({ ...prev, contrast: val }))}
            backgroundColor={imageState.backgroundColor}
            setBackgroundColor={(val) => setImageState(prev => ({ ...prev, backgroundColor: val }))}
          />
        )}
        {currentStep === AppStep.CROP && imageState.original && (
          <CropStep 
            image={imageState.original}
            mask={imageState.mask}
            selectedConfig={imageState.targetCountry}
            onConfigChange={(config) => setImageState(prev => ({ ...prev, targetCountry: config }))}
            exposure={imageState.exposure}
            contrast={imageState.contrast}
            backgroundColor={imageState.backgroundColor}
            zoom={imageState.zoom}
            setZoom={(z) => setImageState(prev => ({ ...prev, zoom: z }))}
            offset={imageState.offset}
            setOffset={(off) => setImageState(prev => ({ ...prev, offset: off }))}
          />
        )}
        {currentStep === AppStep.FINISH && imageState.original && (
          <FinishStep image={imageState.original} imageState={imageState} />
        )}
      </main>

      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-6 bg-[#fefbff]/90 backdrop-blur-lg border-t border-[#e1e2ec] flex items-center gap-4">
        {currentStep !== AppStep.IMPORT && (
          <button 
            onClick={prevStep}
            className="flex-none w-14 h-14 bg-[#f3f4f9] rounded-2xl flex items-center justify-center text-[#44474e] hover:bg-[#ebedf4] transition-all"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        <button 
          onClick={nextStep}
          disabled={!canGoNext() || currentStep === AppStep.FINISH}
          className={`flex-1 h-14 rounded-2xl font-bold text-lg transition-all active:scale-[0.98] ${
            canGoNext() && currentStep !== AppStep.FINISH
              ? 'bg-[#005ac1] text-white shadow-md' 
              : 'bg-[#e1e2ec] text-[#44474e] cursor-not-allowed'
          }`}
        >
          {currentStep === AppStep.FINISH ? 'Success' : 'Continue'}
        </button>

        {currentStep === AppStep.IMPORT && (
          <button className="flex-none w-14 h-14 bg-[#f3f4f9] rounded-2xl flex items-center justify-center text-[#44474e]">
            <Info size={24} />
          </button>
        )}
      </footer>
    </div>
  );
};

export default App;
