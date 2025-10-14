import { StyleSheet } from 'react-native';
const firstPageLoginStyle = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingTop: 32,
  },
  title: {
    color: '#E7E9EA',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
    marginBottom: 32,
    letterSpacing: -0.3,
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    height: 56,
    backgroundColor: '#000000',
    borderColor: '#333639',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#E7E9EA',
    fontSize: 17,
    width: '100%',
  },
  inputFocused: {
    borderColor: '#1D9BF0',
    borderWidth: 2,
  },
});
export default firstPageLoginStyle;