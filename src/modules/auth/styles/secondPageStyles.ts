import { StyleSheet } from 'react-native';

const secondPageStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingTop: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E7E9EA',
    lineHeight: 36,
    letterSpacing: -0.3,
    marginBottom: 32,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#333639',
    borderRadius: 4,
    paddingHorizontal: 16,
    fontSize: 17,
    color: '#FFFFFF',
    backgroundColor: '#000000',
  },
  inputFocused: {
    borderColor: '#1D9BF0',
    borderWidth: 2,
  },
  disabledInput: {
    color: '#71767B',
    backgroundColor: '#0A0A0A',
  },
  floatingLabel: {
    position: 'absolute',
    left: 12,
    backgroundColor: '#000000',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 40,
    top: 16,
    padding: 4,
  },
  statusIcon: {
    position: 'absolute',
    right: 12,
    top: 20,
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: '#00BA7C',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
export default secondPageStyles;