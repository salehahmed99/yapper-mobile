export const typography = {
  sizes: {
    tiny: 11,
    xs: 13,
    sm: 15,
    md: 17,
    lg: 20,
    xl: 23,
    xml: 28,
    xxl: 31,
  },
  fonts: {
    extraLight: 'PublicSans-ExtraLight',
    light: 'PublicSans-Light',
    regular: 'PublicSans-Regular',
    medium: 'PublicSans-Medium',
    semiBold: 'PublicSans-SemiBold',
    bold: 'PublicSans-Bold',
    extraBold: 'PublicSans-ExtraBold',
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  mdg: 15,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxll: 32,
  xxxl: 40,
};

export const colors = {
  light: {
    text: {
      primary: '#0F1419',
      secondary: '#536471',
      tertiary: '#5B7083',
      link: '#1D9BF0',
      inverse: '#FFFFFF',
    },
    background: {
      primary: '#FFFFFF',
      secondary: '#F7F9F9',
      tertiary: '#EFF3F4',
      inverse: '#000000',
    },
    border: '#EFF3F4',
    boderInverse: '#2F3336',
    error: '#F4212E',
    success: '#00BA7C',
    warning: '#FFD400',
    overlay: 'rgba(91, 112, 131, 0.4)',
  },
  dark: {
    text: {
      primary: '#E7E9EA',
      secondary: '#71767B',
      tertiary: '#8B98A5',
      link: '#1D9BF0',
      inverse: '#0F1419',
    },
    background: {
      primary: '#000000',
      secondary: '#16181C',
      tertiary: '#2F3336',
      inverse: '#FFFFFF',
    },
    border: '#2F3336',
    boderInverse: '#8a8c8cff',
    error: '#F4212E',
    success: '#00BA7C',
    warning: '#FFD400',
    overlay: 'rgba(91, 112, 131, 0.4)',
  },
};

export type Theme = {
  typography: typeof typography;
  colors: typeof colors.light;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
};
