import { StyleSheet } from 'react-native';

export const QRScannerScreenStyles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    flex: 0.15,
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  buttonContainerCode: {
    width: '80%',
  },
  buttonContainerImage: {
    marginBottom: 20,
    width: '80%',
  },
  camera: {
    height: '100%',
    width: '100%',
  },
  cameraContainer: {
    alignItems: 'center',
    flex: 0.75,
    justifyContent: 'center',
    width: '100%',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  instructions: {
    alignItems: 'center',
    fontSize: 20,
    justifyContent: 'center',
    marginBottom: 10,
    marginTop: 20,
  },
});