export const COLORS = {
  pink: '#E91E7A',
  pinkLight: '#FF6BA8',
  pinkPale: '#FFD6E8',
  pinkBg: '#FFF0F5',
  lavender: '#C9A0DC',
  lavenderLight: '#E8D5F5',
  coral: '#FF6B6B',
  coralLight: '#FF9B9B',
  gold: '#FFD700',
  goldDark: '#DAA520',
  goldLight: '#FFF8DC',
  white: '#FFFFFF',
  offWhite: '#FFF7FA',
  textPrimary: '#2D1B33',
  textSecondary: '#7A6B82',
  textLight: '#B5A3BE',
  cardBg: '#FFFFFF',
  overlay: 'rgba(45, 27, 51, 0.5)',
  success: '#4CAF50',
  error: '#FF5252',
};

export const GRADIENTS = {
  primary: ['#E91E7A', '#FF6BA8'] as const,
  romantic: ['#E91E7A', '#C9A0DC'] as const,
  sunset: ['#FF6B6B', '#E91E7A', '#C9A0DC'] as const,
  gold: ['#FFD700', '#DAA520', '#FFD700'] as const,
  soft: ['#FFD6E8', '#E8D5F5'] as const,
  card: ['#FFFFFF', '#FFF7FA'] as const,
  background: ['#FFF7FA', '#FFE8F0', '#FFF0F5'] as const,
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const SHADOWS = {
  small: {
    shadowColor: '#E91E7A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#E91E7A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#E91E7A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const FONTS = {
  script: 'DancingScript_700Bold',
  heading: 'Quicksand_700Bold',
  headingMedium: 'Quicksand_600SemiBold',
  body: 'Quicksand_500Medium',
  bodyLight: 'Quicksand_400Regular',
};
