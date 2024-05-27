import { StyleSheet } from 'react-native';
import { colorPalette } from '../utils/colors';

export const LoginScreenStyles = StyleSheet.create({
  buttonWrapper: {
    marginTop: 15,
    marginBottom: 15,
  },
  buttonsContainer: {
    marginTop: 20,
    width: '100%',
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
  image: {
	width: 150,
	height: 150,
	marginBottom: 40,
 	marginTop: -40,
  },
  input: {
    borderColor: colorPalette.gray,
    borderWidth: 1,
    height: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: '100%',
  },
  title: {
    color: colorPalette.gray,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 50,
  },
});