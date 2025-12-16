import { Theme, borderRadius, colors, opacity, sizes, spacing, typography } from '../../../../constants/theme';
import { createHeaderStyles } from '../../styles/profile-header-styles';

describe('profile-header-styles', () => {
  // Create a mock theme object with light colors
  const mockTheme: Theme = {
    typography,
    colors: colors.light,
    spacing,
    borderRadius,
    ui: {
      appBarHeight: 48,
      drawerWidth: 280,
      tabViewHeight: 44,
      sideContainerWidth: 40,
      avatar: 32,
      avatarLarge: 56,
      navHeight: 52,
    },
    iconSizes: { xs: 12, sm: 16, md: 20, lg: 24, xl: 32, icon: 24, iconSmall: 18, iconLarge: 28, iconExtraLarge: 50 },
    iconSizesAlt: { xxs: 12, xs: 14, sm: 16, md: 18, lg: 20, xl: 22, xxl: 24, xxxl: 26 },
    borderWidth: { tiny: 0.2, thin: 1, medium: 2, thick: 3 },
    avatarSizes: { sm: 32, md: 40, lg: 48, xl: 64 },
    buttonHeights: { sm: 28, md: 32, lg: 36, xl: 44 },
    shadows: {
      sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
      },
      lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 10,
      },
    },
    opacity,
    sizes,
  };

  let styles: ReturnType<typeof createHeaderStyles>;

  beforeEach(() => {
    styles = createHeaderStyles(mockTheme);
  });

  describe('createHeaderStyles', () => {
    it('should create container styles', () => {
      expect(styles.container).toBeDefined();
      expect(styles.container.marginBottom).toBe(mockTheme.spacing.xl);
    });

    it('should create banner styles', () => {
      expect(styles.banner).toBeDefined();
      expect(styles.banner.width).toBe('100%');
      expect(styles.banner.height).toBe(mockTheme.sizes.banner.height);
      expect(styles.banner.backgroundColor).toBe(mockTheme.colors.background.tertiary);
      expect(styles.banner.position).toBe('relative');
    });

    it('should create avatar styles', () => {
      expect(styles.avatar).toBeDefined();
      expect(styles.avatar.width).toBe(mockTheme.sizes.avatar.md);
      expect(styles.avatar.height).toBe(mockTheme.sizes.avatar.md);
      expect(styles.avatar.borderRadius).toBe(mockTheme.sizes.avatar.md / 2);
      expect(styles.avatar.borderWidth).toBe(4);
      expect(styles.avatar.borderColor).toBe(mockTheme.colors.background.primary);
      expect(styles.avatar.zIndex).toBe(5);
    });

    it('should create imageContainer styles', () => {
      expect(styles.imageContainer).toBeDefined();
      expect(styles.imageContainer.flexDirection).toBe('row');
      expect(styles.imageContainer.width).toBe('100%');
      expect(styles.imageContainer.justifyContent).toBe('space-between');
      expect(styles.imageContainer.zIndex).toBe(5);
    });

    it('should create editButton styles', () => {
      expect(styles.editButton).toBeDefined();
      expect(styles.editButton.backgroundColor).toBe(mockTheme.colors.background.primary);
      expect(styles.editButton.borderWidth).toBe(1);
      expect(styles.editButton.borderColor).toBe(mockTheme.colors.text.link);
      expect(styles.editButton.borderRadius).toBe(mockTheme.spacing.xl);
    });

    it('should create messageButton styles', () => {
      expect(styles.messageButton).toBeDefined();
      expect(styles.messageButton.borderRadius).toBe(mockTheme.borderRadius.full);
      expect(styles.messageButton.minWidth).toBe(40);
    });

    it('should create buttonsContainer styles', () => {
      expect(styles.buttonsContainer).toBeDefined();
      expect(styles.buttonsContainer.flexDirection).toBe('row');
    });

    it('should create viewPostsButton styles', () => {
      expect(styles.viewPostsButton).toBeDefined();
      expect(styles.viewPostsButton.backgroundColor).toBe(mockTheme.colors.text.link);
      expect(styles.viewPostsButton.width).toBe('60%');
      expect(styles.viewPostsButton.height).toBe('22%');
    });

    it('should create viewPostsText styles', () => {
      expect(styles.viewPostsText).toBeDefined();
      expect(styles.viewPostsText.color).toBe(mockTheme.colors.text.inverse);
      expect(styles.viewPostsText.textAlign).toBe('center');
    });

    it('should create followingButton styles', () => {
      expect(styles.followingButton).toBeDefined();
      expect(styles.followingButton.backgroundColor).toBe(mockTheme.colors.text.link);
      expect(styles.followingButton.borderColor).toBe(mockTheme.colors.text.link);
    });

    it('should create backButton styles', () => {
      expect(styles.backButton).toBeDefined();
      expect(styles.backButton.position).toBe('absolute');
      expect(styles.backButton.justifyContent).toBe('center');
      expect(styles.backButton.alignItems).toBe('center');
    });

    it('should create actionsButton styles', () => {
      expect(styles.actionsButton).toBeDefined();
      expect(styles.actionsButton.position).toBe('absolute');
      expect(styles.actionsButton.width).toBe(mockTheme.sizes.button.height);
      expect(styles.actionsButton.height).toBe(mockTheme.sizes.button.height);
    });

    it('should create searchButton styles', () => {
      expect(styles.searchButton).toBeDefined();
      expect(styles.searchButton.position).toBe('absolute');
    });

    it('should create editText styles', () => {
      expect(styles.editText).toBeDefined();
      expect(styles.editText.color).toBe(mockTheme.colors.text.link);
    });

    it('should create followingText styles', () => {
      expect(styles.followingText).toBeDefined();
      expect(styles.followingText.color).toBe(mockTheme.colors.background.primary);
    });

    it('should create followsYouContainer styles', () => {
      expect(styles.followsYouContainer).toBeDefined();
      expect(styles.followsYouContainer.backgroundColor).toBe(mockTheme.colors.background.tertiary);
      expect(styles.followsYouContainer.alignSelf).toBe('flex-start');
    });

    it('should create followsYouText styles', () => {
      expect(styles.followsYouText).toBeDefined();
      expect(styles.followsYouText.color).toBe(mockTheme.colors.text.secondary);
      expect(styles.followsYouText.fontSize).toBe(mockTheme.typography.sizes.xs);
    });

    it('should create nameContainer styles', () => {
      expect(styles.nameContainer).toBeDefined();
      expect(styles.nameContainer.flexDirection).toBe('row');
      expect(styles.nameContainer.alignItems).toBe('center');
      expect(styles.nameContainer.alignSelf).toBe('flex-start');
    });

    it('should create info styles', () => {
      expect(styles.info).toBeDefined();
      expect(styles.info.paddingHorizontal).toBe(mockTheme.spacing.lg);
      expect(styles.info.alignItems).toBe('flex-start');
    });

    it('should create loadingContainer styles', () => {
      expect(styles.loadingContainer).toBeDefined();
      expect(styles.loadingContainer.marginTop).toBe(mockTheme.spacing.lg);
      expect(styles.loadingContainer.alignItems).toBe('center');
    });

    it('should create name styles', () => {
      expect(styles.name).toBeDefined();
      expect(styles.name.fontSize).toBe(mockTheme.typography.sizes.lg);
      expect(styles.name.color).toBe(mockTheme.colors.text.primary);
      expect(styles.name.textAlign).toBe('left');
      expect(styles.name.alignSelf).toBe('flex-start');
    });

    it('should create handle styles', () => {
      expect(styles.handle).toBeDefined();
      expect(styles.handle.color).toBe(mockTheme.colors.text.secondary);
      expect(styles.handle.textAlign).toBe('left');
    });

    it('should create bio styles', () => {
      expect(styles.bio).toBeDefined();
      expect(styles.bio.fontSize).toBe(mockTheme.typography.sizes.sm - 1);
      expect(styles.bio.color).toBe(mockTheme.colors.text.primary);
      expect(styles.bio.textAlign).toBe('left');
    });

    it('should create link styles', () => {
      expect(styles.link).toBeDefined();
      expect(styles.link.color).toBe(mockTheme.colors.text.link);
      expect(styles.link.textAlign).toBe('left');
    });

    it('should create stats styles', () => {
      expect(styles.stats).toBeDefined();
      expect(styles.stats.flexDirection).toBe('row');
    });

    it('should create stat styles', () => {
      expect(styles.stat).toBeDefined();
      expect(styles.stat.color).toBe(mockTheme.colors.text.primary);
    });

    it('should create statWithMargin styles', () => {
      expect(styles.statWithMargin).toBeDefined();
      expect(styles.statWithMargin.color).toBe(mockTheme.colors.text.primary);
      expect(styles.statWithMargin.marginLeft).toBe(mockTheme.spacing.md - 2);
    });

    it('should create bold styles', () => {
      expect(styles.bold).toBeDefined();
      expect(styles.bold.fontWeight).toBe(mockTheme.typography.weights.bold);
    });
  });

  it('should export default createHeaderStyles', () => {
    const defaultExport = require('../../styles/profile-header-styles').default;
    expect(defaultExport).toBe(createHeaderStyles);
  });
});
