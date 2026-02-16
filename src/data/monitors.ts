import type { Monitor } from '../types';

export const INITIAL_MONITORS: Monitor[] = [
  {
    id: 'curved-34',
    name: '34" Curved 144Hz',
    resolution: '3440 x 1440 (UWQHD)',
    refresh: '144Hz',
    panel: 'VA Curved',
    size: '34"',
    colorGamut: 'sRGB',
    connection: 'USB-C to DisplayPort cable',
    meshName: 'Monitor_Curved',
  },
  {
    id: 'vp2756-2k',
    name: 'ViewSonic VP2756-2K',
    resolution: '2560 x 1440 (QHD)',
    refresh: '60Hz',
    panel: '27" IPS Frameless',
    size: '27"',
    colorGamut: '100% sRGB, Pantone Validated',
    connection: 'USB-C (60W PD), HDMI 1.4, DP 1.2a',
    features: 'Auto Pivot, Ergonomic Stand, Factory Calibrated',
    meshName: 'Monitor_Flat',
  },
  {
    id: 'espresso-15',
    name: 'Espresso 15" Pro',
    resolution: '1920 x 1080 (FHD) / 4K',
    refresh: '60Hz',
    panel: '15.6" IPS Portable',
    size: '15.6"',
    colorGamut: 'sRGB',
    connection: 'USB-C (touch, power, video)',
    features: 'Touchscreen, Portable, Magnetic Stand',
    meshName: 'Monitor_Portable',
  },
];
