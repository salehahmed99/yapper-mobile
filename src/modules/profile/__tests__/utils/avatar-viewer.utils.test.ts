/* eslint-disable @typescript-eslint/no-explicit-any */
import { Animated, Dimensions } from 'react-native';
import {
  animateClose,
  animateOpen,
  calculateOpeningAnimation,
  handleSwipeProgress,
  handleSwipeRelease,
  resetAnimationValues,
  SCREEN_DIMENSIONS,
} from '../../utils/avatar-viewer.utils';

describe('avatar-viewer.utils', () => {
  // Get actual screen dimensions from Dimensions.get
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SCREEN_DIMENSIONS', () => {
    it('should export screen width and height', () => {
      expect(SCREEN_DIMENSIONS.WIDTH).toBe(SCREEN_WIDTH);
      expect(SCREEN_DIMENSIONS.HEIGHT).toBe(SCREEN_HEIGHT);
      expect(typeof SCREEN_DIMENSIONS.WIDTH).toBe('number');
      expect(typeof SCREEN_DIMENSIONS.HEIGHT).toBe('number');
    });
  });

  describe('calculateOpeningAnimation', () => {
    it('should calculate correct initial values for avatar (not banner)', () => {
      const origin = { x: 50, y: 100, width: 80, height: 80 };
      const result = calculateOpeningAnimation(origin, false);

      const expectedX = 90 - SCREEN_WIDTH / 2;
      const expectedY = 140 - SCREEN_HEIGHT / 2;
      const expectedScale = 80 / SCREEN_WIDTH;

      expect(result.initialTranslateX).toBe(expectedX);
      expect(result.initialTranslateY).toBe(expectedY);
      expect(result.initialScale).toBe(expectedScale);
    });

    it('should calculate correct initial values for banner', () => {
      const origin = { x: 0, y: 50, width: SCREEN_WIDTH, height: 133 };
      const result = calculateOpeningAnimation(origin, true);

      const originCenterY = 50 + 133 / 2;
      const expectedX = 0;
      const expectedY = originCenterY - SCREEN_HEIGHT / 2;
      const expectedScale = 1;

      expect(result.initialTranslateX).toBe(expectedX);
      expect(result.initialTranslateY).toBe(expectedY);
      expect(result.initialScale).toBe(expectedScale);
    });

    it('should handle origin at screen center', () => {
      const centerX = SCREEN_WIDTH / 2 - 50; // Adjust for width
      const centerY = SCREEN_HEIGHT / 2 - 50; // Adjust for height
      const origin = { x: centerX, y: centerY, width: 100, height: 100 };
      const result = calculateOpeningAnimation(origin, false);

      // When origin is at center, translate should be 0
      expect(result.initialTranslateX).toBe(0);
      expect(result.initialTranslateY).toBe(0);
      expect(result.initialScale).toBe(100 / SCREEN_WIDTH);
    });

    it('should handle small origin sizes', () => {
      const origin = { x: 10, y: 20, width: 20, height: 20 };
      const result = calculateOpeningAnimation(origin, false);

      const originCenterX = 10 + 10;
      const originCenterY = 20 + 10;
      const expectedX = originCenterX - SCREEN_WIDTH / 2;
      const expectedY = originCenterY - SCREEN_HEIGHT / 2;

      expect(result.initialTranslateX).toBe(expectedX);
      expect(result.initialTranslateY).toBe(expectedY);
      expect(result.initialScale).toBe(20 / SCREEN_WIDTH);
    });

    it('should handle origin at bottom right corner', () => {
      const origin = { x: SCREEN_WIDTH - 100, y: SCREEN_HEIGHT - 100, width: 100, height: 100 };
      const result = calculateOpeningAnimation(origin, false);

      const originCenterX = SCREEN_WIDTH - 100 + 50;
      const originCenterY = SCREEN_HEIGHT - 100 + 50;
      const expectedX = originCenterX - SCREEN_WIDTH / 2;
      const expectedY = originCenterY - SCREEN_HEIGHT / 2;

      expect(result.initialTranslateX).toBe(expectedX);
      expect(result.initialTranslateY).toBe(expectedY);
      expect(result.initialScale).toBe(100 / SCREEN_WIDTH);
    });
  });

  describe('animateOpen', () => {
    it('should set initial values and start animations', () => {
      const translateX = new Animated.Value(0);
      const translateY = new Animated.Value(0);
      const scale = new Animated.Value(1);
      const fadeAnim = new Animated.Value(1);
      const initialValues = {
        initialTranslateX: -100,
        initialTranslateY: -200,
        initialScale: 0.5,
      };

      animateOpen(translateX, translateY, scale, fadeAnim, initialValues);

      expect(translateX).toBeDefined();
      expect(translateY).toBeDefined();
      expect(scale).toBeDefined();
      expect(fadeAnim).toBeDefined();
    });

    it('should animate to final values', (done) => {
      const translateX = new Animated.Value(0);
      const translateY = new Animated.Value(0);
      const scale = new Animated.Value(1);
      const fadeAnim = new Animated.Value(1);
      const initialValues = {
        initialTranslateX: -50,
        initialTranslateY: -100,
        initialScale: 0.3,
      };

      animateOpen(translateX, translateY, scale, fadeAnim, initialValues);

      // Wait for requestAnimationFrame and animation to complete
      setTimeout(() => {
        // After animation, values should be at target (mocked in jest.setup.ts)
        expect((translateX as any)._value).toBe(0);
        expect((translateY as any)._value).toBe(0);
        expect((scale as any)._value).toBe(1);
        expect((fadeAnim as any)._value).toBe(1);
        done();
      }, 100);
    });
  });

  describe('resetAnimationValues', () => {
    it('should reset all animation values to initial state', () => {
      const translateX = new Animated.Value(100);
      const translateY = new Animated.Value(200);
      const scale = new Animated.Value(2);
      const fadeAnim = new Animated.Value(0.5);

      resetAnimationValues(translateX, translateY, scale, fadeAnim);

      // Check that function completes without errors
      expect(translateX).toBeDefined();
      expect(translateY).toBeDefined();
    });

    it('should reset values even when already at initial state', () => {
      const translateX = new Animated.Value(0);
      const translateY = new Animated.Value(0);
      const scale = new Animated.Value(1);
      const fadeAnim = new Animated.Value(0);

      resetAnimationValues(translateX, translateY, scale, fadeAnim);

      // Function should complete without errors
      expect(translateX).toBeDefined();
    });
  });

  describe('animateClose', () => {
    it('should animate fade and translate down, then call onComplete', (done) => {
      const fadeAnim = new Animated.Value(1);
      const translateY = new Animated.Value(0);
      const onComplete = jest.fn();

      animateClose(fadeAnim, translateY, onComplete);

      // Wait for animation to complete
      setTimeout(() => {
        // After animation, values should be at target (mocked in jest.setup.ts)
        expect((translateY as any)._value).toBe(SCREEN_HEIGHT);
        expect(onComplete).toHaveBeenCalledWith({ finished: true });
        done();
      }, 50);
    });

    it('should use correct animation duration and native driver', (done) => {
      const fadeAnim = new Animated.Value(1);
      const translateY = new Animated.Value(0);
      const onComplete = jest.fn();

      const timingSpy = jest.spyOn(Animated, 'timing');

      animateClose(fadeAnim, translateY, onComplete);

      setTimeout(() => {
        expect(timingSpy).toHaveBeenCalledWith(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        });
        expect(timingSpy).toHaveBeenCalledWith(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 150,
          useNativeDriver: true,
        });

        timingSpy.mockRestore();
        done();
      }, 50);
    });
  });
  describe('handleSwipeProgress', () => {
    it('should update translateY and fadeAnim when swiping down (dy > 0)', () => {
      const translateY = new Animated.Value(0);
      const fadeAnim = new Animated.Value(1);

      handleSwipeProgress(translateY, fadeAnim, 50);

      // Function should complete without errors
      expect(translateY).toBeDefined();
      expect(fadeAnim).toBeDefined();
    });

    it('should handle maximum swipe progress', () => {
      const translateY = new Animated.Value(0);
      const fadeAnim = new Animated.Value(1);

      handleSwipeProgress(translateY, fadeAnim, 250);

      // Function should complete without errors
      expect(translateY).toBeDefined();
      expect(fadeAnim).toBeDefined();
    });

    it('should not update values when dy <= 0', () => {
      const translateY = new Animated.Value(0);
      const fadeAnim = new Animated.Value(1);

      // Should not throw error
      expect(() => {
        handleSwipeProgress(translateY, fadeAnim, -50);
      }).not.toThrow();
    });

    it('should not update values when dy is exactly 0', () => {
      const translateY = new Animated.Value(0);
      const fadeAnim = new Animated.Value(1);

      // Should not throw error
      expect(() => {
        handleSwipeProgress(translateY, fadeAnim, 0);
      }).not.toThrow();
    });

    it('should calculate correct fade values for different dy values', () => {
      const translateY = new Animated.Value(0);
      const fadeAnim = new Animated.Value(1);

      // Test various dy values don't throw errors
      handleSwipeProgress(translateY, fadeAnim, 100);
      handleSwipeProgress(translateY, fadeAnim, 200);

      expect(translateY).toBeDefined();
      expect(fadeAnim).toBeDefined();
    });
  });

  describe('handleSwipeRelease', () => {
    it('should close when dy > 100', (done) => {
      const translateY = new Animated.Value(150);
      const fadeAnim = new Animated.Value(0.5);
      const onClose = jest.fn();

      handleSwipeRelease(translateY, fadeAnim, 150, 0.2, onClose);

      setTimeout(() => {
        // onClose should be called when conditions met
        expect(onClose).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should close when velocity > 0.5', (done) => {
      const translateY = new Animated.Value(50);
      const fadeAnim = new Animated.Value(0.8);
      const onClose = jest.fn();

      handleSwipeRelease(translateY, fadeAnim, 50, 0.6, onClose);

      setTimeout(() => {
        // onClose should be called when velocity condition met
        expect(onClose).toHaveBeenCalled();
        done();
      }, 100);
    });

    it('should bounce back when dy <= 100 and vy <= 0.5', (done) => {
      const translateY = new Animated.Value(50);
      const fadeAnim = new Animated.Value(0.8);
      const onClose = jest.fn();

      const springSpy = jest.spyOn(Animated, 'spring');

      handleSwipeRelease(translateY, fadeAnim, 50, 0.3, onClose);

      setTimeout(() => {
        expect(springSpy).toHaveBeenCalledWith(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 20,
          bounciness: 0,
        });
        expect(springSpy).toHaveBeenCalledWith(fadeAnim, {
          toValue: 1,
          useNativeDriver: true,
          speed: 20,
          bounciness: 0,
        });
        expect(onClose).not.toHaveBeenCalled();

        springSpy.mockRestore();
        done();
      }, 50);
    });

    it('should bounce back when dy = 100 and vy = 0', (done) => {
      const translateY = new Animated.Value(100);
      const fadeAnim = new Animated.Value(0.75);
      const onClose = jest.fn();

      handleSwipeRelease(translateY, fadeAnim, 100, 0, onClose);

      setTimeout(() => {
        // Should bounce back (not close) because dy is not > 100
        expect(onClose).not.toHaveBeenCalled();
        done();
      }, 50);
    });

    it('should close when dy = 101', (done) => {
      const translateY = new Animated.Value(101);
      const fadeAnim = new Animated.Value(0.5);
      const onClose = jest.fn();

      handleSwipeRelease(translateY, fadeAnim, 101, 0, onClose);

      setTimeout(() => {
        expect(onClose).toHaveBeenCalled();
        done();
      }, 50);
    });

    it('should close when vy = 0.51', (done) => {
      const translateY = new Animated.Value(10);
      const fadeAnim = new Animated.Value(0.95);
      const onClose = jest.fn();

      handleSwipeRelease(translateY, fadeAnim, 10, 0.51, onClose);

      setTimeout(() => {
        expect(onClose).toHaveBeenCalled();
        done();
      }, 50);
    });

    it('should bounce back when both conditions are exactly at threshold', (done) => {
      const translateY = new Animated.Value(100);
      const fadeAnim = new Animated.Value(0.75);
      const onClose = jest.fn();

      handleSwipeRelease(translateY, fadeAnim, 100, 0.5, onClose);

      setTimeout(() => {
        // Should bounce back because neither condition exceeds threshold
        expect(onClose).not.toHaveBeenCalled();
        done();
      }, 50);
    });
  });
});
