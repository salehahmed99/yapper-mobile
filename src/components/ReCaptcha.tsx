import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Modal, StyleSheet, View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { X } from 'lucide-react-native';
import { Theme } from '@/src/constants/theme';

// CONFIGURE THIS:
const RECAPTCHA_URL =
  process.env.EXPO_PUBLIC_NODE_ENV === 'development'
    ? 'http://localhost'
    : 'https://your-backend-domain.com/recaptcha.html'; //todo: change it to actual url deployed

export interface ReCaptchaRef {
  open: () => void;
  close: () => void;
}

interface ReCaptchaProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  onClose?: () => void;
  size?: 'invisible' | 'normal' | 'compact';
  theme?: 'light' | 'dark';
  lang?: string;
  themeColors?: Theme;
}

const ReCaptcha = forwardRef<ReCaptchaRef, ReCaptchaProps>(
  (
    { siteKey, onVerify, onError, onExpire, onClose, size = 'normal', theme = 'light', lang = 'en', themeColors },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const webViewRef = useRef<WebView>(null);

    // Create styles using theme colors
    const styles = React.useMemo(() => createStyles(themeColors), [themeColors]);

    useImperativeHandle(ref, () => ({
      open: () => {
        setVisible(true);
        setLoading(true);
      },
      close: () => {
        handleClose();
      },
    }));

    const handleClose = () => {
      setVisible(false);
      setLoading(true);
      onClose?.();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        switch (data.type) {
          case 'success':
            if (data.token) {
              onVerify(data.token);
              if (size === 'invisible') {
                handleClose();
              }
            }
            break;

          case 'error':
            setLoading(false);
            onError?.(data.error || 'ReCAPTCHA error occurred');
            break;

          case 'expire':
            onExpire?.();
            break;

          case 'close':
            handleClose();
            break;

          case 'loaded':
            setLoading(false);
            break;

          default:
            break;
        }
      } catch (error) {
        console.error('Error parsing message from WebView:', error);
        setLoading(false);
        onError?.('Failed to parse reCAPTCHA response');
      }
    };

    const recaptchaUrl = `${RECAPTCHA_URL}?siteKey=${encodeURIComponent(siteKey)}&theme=${theme}&size=${size}&lang=${lang}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      width: 100%;
    }
    .title {
      color: ${theme === 'dark' ? '#ffffff' : '#000000'};
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
      text-align: center;
    }
    #recaptcha-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 20px 0;
      min-height: 78px;
    }
    .close-btn {
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #e0e0e0;
      color: #000000;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      display: ${size === 'invisible' ? 'none' : 'block'};
    }
    .error {
      color: #ff0000;
      margin-top: 10px;
      text-align: center;
      font-size: 14px;
    }
    .loading { color: ${theme === 'dark' ? '#ffffff' : '#666666'}; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="title">Please verify you're human</div>
    <div id="recaptcha-container"><div class="loading">Loading reCAPTCHA...</div></div>
    <button class="close-btn" onclick="handleClose()">Cancel</button>
    <div id="error" class="error"></div>
  </div>
  <script>
    let widgetId, scriptLoaded = false, renderAttempts = 0;
    const MAX_ATTEMPTS = 3;
    
    function sendMessage(data) {
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      } catch (e) { console.error('Failed to send message:', e); }
    }
    
    function onloadCallback() {
      if (scriptLoaded) return;
      scriptLoaded = true;
      renderRecaptcha();
    }
    
    function renderRecaptcha() {
      if (!window.grecaptcha || !window.grecaptcha.render) {
        renderAttempts++;
        if (renderAttempts < MAX_ATTEMPTS) {
          setTimeout(renderRecaptcha, 500);
          return;
        }
        const errorMsg = 'Failed to load reCAPTCHA';
        document.getElementById('error').textContent = errorMsg;
        sendMessage({ type: 'error', error: errorMsg });
        return;
      }
      
      try {
        document.getElementById('recaptcha-container').innerHTML = '';
        widgetId = grecaptcha.render('recaptcha-container', {
          'sitekey': '${siteKey}',
          'theme': '${theme}',
          'size': '${size}',
          'callback': onSuccess,
          'expired-callback': onExpire,
          'error-callback': onError
        });
        sendMessage({ type: 'loaded' });
        if ('${size}' === 'invisible') {
          setTimeout(() => {
            try { grecaptcha.execute(widgetId); }
            catch (e) { onError(e.message); }
          }, 100);
        }
      } catch (error) {
        document.getElementById('error').textContent = 'Failed to render verification';
        sendMessage({ type: 'error', error: error.message || 'Failed to load reCAPTCHA' });
      }
    }

    function onSuccess(token) { sendMessage({ type: 'success', token: token }); }
    function onExpire() {
      sendMessage({ type: 'expire' });
      document.getElementById('error').textContent = 'Verification expired. Please try again.';
    }
    function onError(error) {
      sendMessage({ type: 'error', error: error || 'An error occurred' });
      document.getElementById('error').textContent = 'Verification failed. Please try again.';
    }
    function handleClose() { sendMessage({ type: 'close' }); }

    window.onloadCallback = onloadCallback;
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit&hl=${lang}';
    script.async = true;
    script.defer = true;
    script.onerror = function() {
      const errorMsg = 'Failed to load reCAPTCHA script';
      document.getElementById('error').textContent = errorMsg;
      sendMessage({ type: 'error', error: errorMsg });
    };
    document.head.appendChild(script);
    setTimeout(() => { if (!scriptLoaded) renderRecaptcha(); }, 5000);
  </script>
</body>
</html>
    `;

    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={themeColors?.colors.text.primary || '#000000'} />
            </TouchableOpacity>

            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4285f4" />
                <Text style={styles.loadingText}>Loading verification...</Text>
              </View>
            )}

            <WebView
              ref={webViewRef}
              source={__DEV__ ? { html: htmlContent, baseUrl: 'http://localhost' } : { uri: recaptchaUrl }}
              onMessage={handleMessage}
              style={[styles.webview, loading && styles.hidden]}
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState={false}
              scalesPageToFit
              mixedContentMode="always"
              originWhitelist={['*']}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.error('WebView error:', nativeEvent);
                setLoading(false);
                onError?.('Failed to load reCAPTCHA');
              }}
            />
          </View>
        </View>
      </Modal>
    );
  },
);

ReCaptcha.displayName = 'ReCaptcha';

const createStyles = (themeColors?: Theme) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: themeColors?.colors.overlayDark,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxWidth: 400,
      height: '70%',
      maxHeight: 600,
      backgroundColor: themeColors?.colors.background.primary,
      borderRadius: themeColors?.borderRadius.lg,
      overflow: 'hidden',
      position: 'relative',
    },
    closeButton: {
      position: 'absolute',
      top: themeColors?.spacing.md,
      right: themeColors?.spacing.md,
      zIndex: 10,
      backgroundColor: themeColors?.colors.background.secondary,
      borderRadius: 20,
      padding: 8,
    },
    webview: {
      flex: 1,
    },
    hidden: {
      opacity: 0,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: themeColors?.colors.background.primary,
      zIndex: 5,
    },
    loadingText: {
      marginTop: themeColors?.spacing.md,
      fontSize: themeColors?.typography.sizes.md,
      color: themeColors?.colors.text.secondary,
    },
  });

export default ReCaptcha;
