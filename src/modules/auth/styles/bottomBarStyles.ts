import { StyleSheet } from "react-native";
const bottomBarStyles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000000',
  },
  topBorder: {
    width: '100%',
    height: 1,
    backgroundColor: '#363636ff', // Off-white thin line
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  forgotPasswordButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    backgroundColor: '#000000',
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
  },
  nextButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  nextButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.5,
  },
  nextButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600',
  },
  nextButtonTextDisabled: {
    color: '#666666',
  },
});
export default bottomBarStyles;