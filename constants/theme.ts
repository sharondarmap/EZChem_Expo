/**
 * Theme tokens (migrated from the web app).
 * Exports: Colors (light/dark), AppColors (web palette), Fonts, Spacing, Radii, Gradients, and a default Theme object.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// Existing light/dark palette used by template (kept for compatibility)
export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// Web app color tokens (from your index.css & profile.css)
export const AppColors = {
  brand: '#64b5f6',
  brandStrong: '#42a5f5',
  backgroundStart: '#1a1a2e',
  backgroundMid: '#16213e',
  backgroundEnd: '#0f3460',
  text: '#ffffff',
  muted: '#b0bec5',
  success: '#66bb6a',
  warning: '#ffa726',
  danger: '#ef5350',
  glass: 'rgba(255,255,255,0.05)',
  glassStrong: 'rgba(255,255,255,0.08)',
  borderGlass: 'rgba(255,255,255,0.12)',
  borderGlassStrong: 'rgba(255,255,255,0.18)',
  shadowBrand: 'rgba(100, 181, 246, 0.22)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const Radii = {
  sm: 8,
  md: 12,
  lg: 16,
  round: 9999,
};

export const Gradients = {
  hero: [AppColors.brand, AppColors.brandStrong],
  background: [AppColors.backgroundStart, AppColors.backgroundMid, AppColors.backgroundEnd],
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// A convenience Theme object for easy imports
const Theme = {
  colors: AppColors,
  spacing: Spacing,
  radii: Radii,
  gradients: Gradients,
  fonts: Fonts,
};

export default Theme;
