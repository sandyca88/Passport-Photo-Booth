
import { PassportConfig } from './types';

export const PASSPORT_CONFIGS: PassportConfig[] = [
  { country: 'Taiwan', flag: '🇹🇼', widthMm: 35, heightMm: 45, description: 'Passport 35x45 mm' },
  { country: 'USA', flag: '🇺🇸', widthMm: 51, heightMm: 51, description: 'Passport 2x2 inch' },
  { country: 'United Kingdom', flag: '🇬🇧', widthMm: 35, heightMm: 45, description: 'Passport 35x45 mm' },
  { country: 'China', flag: '🇨🇳', widthMm: 33, heightMm: 48, description: 'Passport 33x48 mm' },
  { country: 'Japan', flag: '🇯🇵', widthMm: 35, heightMm: 45, description: 'Passport 35x45 mm' },
  { country: 'Australia', flag: '🇦🇺', widthMm: 35, heightMm: 45, description: 'Passport 35x45 mm' },
  { country: 'Schengen Area', flag: '🇪🇺', widthMm: 35, heightMm: 45, description: 'Visa/Passport 35x45 mm' },
  { country: 'India', flag: '🇮🇳', widthMm: 51, heightMm: 51, description: 'Passport 2x2 inch' },
];

export const STEP_ORDER = ['Import', 'Adjust', 'Crop', 'Finish'];
