import { colorPalette } from '../utils/colors';
import { StyleSheet } from 'react-native';

export const RegisterUserScreenStyles = StyleSheet.create({
  buttonWrapper: {
	width: '100%',
	marginTop: 20,
  },
  colorButton: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 5,
    width: 40,
  },
  colorScrollView: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  container: {
    alignItems: 'center',
    backgroundColor: colorPalette.white,
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    width: '80%',
  },
  errorMessage: {
    color: colorPalette.red,
    fontSize: 15,
    marginBottom: 20,
    marginTop: 10,
  },
  input: {
    borderColor: colorPalette.gray,
    borderWidth: 1,
    height: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  selectedColorButton: {
    borderWidth: 2,
  },
  title: {
    color: colorPalette.gray,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 50,
  },
});