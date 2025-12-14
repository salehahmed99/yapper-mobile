import { usePathname, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';

export function useNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const pendingNavigationRef = useRef<string | null>(null);
  const navigationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizePath = useCallback((path: string) => {
    return path.replace(/\/\([^)]+\)/g, '').replace(/^$/, '/');
  }, []);

  const navigate = useCallback(
    (path: string | { pathname: string; params?: Record<string, any> }, onBeforeNavigate?: () => void) => {
      // Execute callback before navigation (e.g., close menu)
      if (onBeforeNavigate) {
        onBeforeNavigate();
      }

      // Extract pathname for comparison
      const targetPath = typeof path === 'string' ? path : path.pathname;

      // Normalize both paths to compare without route group prefixes
      const normalizedCurrent = normalizePath(pathname);
      const normalizedTarget = normalizePath(targetPath);

      // If already on target path, don't navigate
      if (normalizedCurrent === normalizedTarget) {
        return;
      }

      // Prevent duplicate navigation if there's already a pending navigation to the same route
      if (pendingNavigationRef.current === normalizedTarget) {
        return;
      }

      // Mark this path as pending navigation
      pendingNavigationRef.current = normalizedTarget;

      // Clear any existing timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Reset pending navigation after a short delay (300ms should be enough for navigation to start)
      navigationTimeoutRef.current = setTimeout(() => {
        pendingNavigationRef.current = null;
      }, 500);

      // Navigate to the new path
      router.push(path as any);
    },
    [pathname, router, normalizePath],
  );

  const isCurrentRoute = useCallback(
    (path: string) => {
      return normalizePath(pathname) === normalizePath(path);
    },
    [pathname, normalizePath],
  );

  const replace = useCallback(
    (path: string | { pathname: string; params?: Record<string, any> }, onBeforeNavigate?: () => void) => {
      if (onBeforeNavigate) {
        onBeforeNavigate();
      }

      // Extract pathname for comparison
      const targetPath = typeof path === 'string' ? path : path.pathname;
      const normalizedTarget = normalizePath(targetPath);

      if (pathname === targetPath) {
        return;
      }

      // Prevent duplicate navigation if there's already a pending navigation to the same route
      if (pendingNavigationRef.current === normalizedTarget) {
        return;
      }

      // Mark this path as pending navigation
      pendingNavigationRef.current = normalizedTarget;

      // Clear any existing timeout
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
      }

      // Reset pending navigation after a short delay
      navigationTimeoutRef.current = setTimeout(() => {
        pendingNavigationRef.current = null;
      }, 300);

      router.replace(path as any);
    },
    [pathname, router, normalizePath],
  );

  const goBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    }
  }, [router]);

  const dismissTo = useCallback(
    (path: string | { pathname: string; params?: Record<string, any> }) => {
      // Dismiss all modals/screens from stack first
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.dismissTo(path as any);
    },
    [router],
  );

  return {
    navigate,
    replace,
    goBack,
    dismissTo,
    isCurrentRoute,
    pathname,
    router,
  };
}

export default useNavigation;
