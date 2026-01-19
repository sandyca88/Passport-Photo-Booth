
export enum AppStep {
  IMPORT = 'Import',
  ADJUST = 'Adjust',
  CROP = 'Crop',
  FINISH = 'Finish'
}

export interface PassportConfig {
  country: string;
  flag: string;
  widthMm: number;
  heightMm: number;
  description: string;
}

export interface ImageState {
  original: string | null;
  processed: string | null;
  mask: string | null; // AI mask for background isolation
  exposure: number;
  contrast: number;
  backgroundColor: string;
  targetCountry: PassportConfig | null;
  zoom: number;
  offset: { x: number; y: number };
}
