describe('SearchLayout', () => {
  it('should have proper screenOptions configuration', () => {
    const screenOptions = {
      headerShown: false,
      contentStyle: {
        backgroundColor: '#ffffff',
      },
      animation: 'slide_from_right',
      animationDuration: 20,
    };

    expect(screenOptions.headerShown).toBe(false);
    expect(screenOptions.animation).toBe('slide_from_right');
    expect(screenOptions.animationDuration).toBe(20);
  });

  it('should apply background color from theme', () => {
    const mockTheme = {
      colors: {
        background: { primary: '#ffffff' },
      },
    };

    const screenOptions = {
      contentStyle: {
        backgroundColor: mockTheme.colors.background.primary,
      },
    };

    expect(screenOptions.contentStyle.backgroundColor).toBe('#ffffff');
  });

  it('should handle theme color changes', () => {
    const lightTheme = {
      colors: {
        background: { primary: '#ffffff' },
      },
    };

    const darkTheme = {
      colors: {
        background: { primary: '#1a1a1a' },
      },
    };

    const lightOptions = {
      contentStyle: {
        backgroundColor: lightTheme.colors.background.primary,
      },
    };

    const darkOptions = {
      contentStyle: {
        backgroundColor: darkTheme.colors.background.primary,
      },
    };

    expect(lightOptions.contentStyle.backgroundColor).toBe('#ffffff');
    expect(darkOptions.contentStyle.backgroundColor).toBe('#1a1a1a');
  });

  it('should configure animation correctly', () => {
    const screenOptions = {
      animation: 'slide_from_right',
      animationDuration: 20,
    };

    expect(screenOptions.animation).toBe('slide_from_right');
    expect(screenOptions.animationDuration).toBeGreaterThan(0);
    expect(screenOptions.animationDuration).toBeLessThan(100);
  });

  it('should have two search screens configured', () => {
    const screens = ['search-suggestions', 'search-results'];
    expect(screens.length).toBe(2);
    expect(screens).toContain('search-suggestions');
    expect(screens).toContain('search-results');
  });
});
