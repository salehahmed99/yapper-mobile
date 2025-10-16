import { StyleSheet } from 'react-native';
const topBarStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#000',
  },
  container: {
    width: '100%',
    height: 40,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  exitButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
});
export default topBarStyles;
