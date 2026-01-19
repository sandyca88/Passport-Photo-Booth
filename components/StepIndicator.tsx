
import React from 'react';
import { Image as ImageIcon, Wand2, Crop, CheckCircle } from 'lucide-react';
import { AppStep } from '../types';

interface StepIndicatorProps {
  currentStep: AppStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.IMPORT, label: 'Import', icon: ImageIcon },
    { id: AppStep.ADJUST, label: 'Adjust', icon: Wand2 },
    { id: AppStep.CROP, label: 'Crop', icon: Crop },
    { id: AppStep.FINISH, label: 'Finish', icon: CheckCircle },
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="w-full px-6 pt-8 pb-4 bg-transparent">
      <div className="flex justify-between items-center relative mb-8">
        {/* Background Connector Line */}
        <div className="absolute top-5 left-0 right-0 h-[2px] bg-[#e1e2ec] -z-10" />
        
        {/* Active Connector Line */}
        <div 
          className="absolute top-5 left-0 h-[2px] bg-[#005ac1] transition-all duration-500 ease-in-out -z-10"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isPast = index < currentIndex;

          return (
            <div key={step.id} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  isActive 
                    ? 'bg-[#005ac1] text-white border-[#005ac1] shadow-md scale-110' 
                    : isPast 
                      ? 'bg-white text-[#005ac1] border-[#005ac1]' 
                      : 'bg-[#fefbff] text-[#44474e] border-[#c3c6cf]'
                }`}
              >
                <Icon size={18} />
              </div>
              <span 
                className={`mt-2 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                  isActive ? 'text-[#005ac1]' : 'text-[#74777f]'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Subtle Step Label for focus */}
      <div className="flex flex-col">
        <h1 className="text-xl font-medium text-[#1b1b1f] animate-in slide-in-from-left-2 duration-300">
          {currentStep}
        </h1>
        <div className="h-0.5 w-8 bg-[#005ac1] mt-1 rounded-full" />
      </div>
    </div>
  );
};

export default StepIndicator;
