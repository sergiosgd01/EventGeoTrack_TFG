import { colorPalette } from '../utils/colors';
import { StyleSheet } from 'react-native';

export const MainScreenStyles = StyleSheet.create({
  buttonContainer: {
    marginBottom: 20,
    width: '80%',
  },
  container: {
    alignItems: 'center',
    backgroundColor: colorPalette.white,
    flex: 1,
    justifyContent: 'center',
  },
  dataContainer: {
    backgroundColor: colorPalette.lightGray,
    borderRadius: 10,
    padding: 20,
  },
  eventData: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderColor: colorPalette.lightGray,
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 10,
    padding: 5,
  },
  locationInfo: {
    marginTop: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: colorPalette.overlay,
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colorPalette.white,
    borderRadius: 10,
    elevation: 5,
    padding: 20,
  },
  participantInfo: {
    marginTop: 20,
  },
  registerLink: {
    color: colorPalette.black,
    textDecorationLine: 'underline',
  },
  cancelEvent: {
    color: colorPalette.black,
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  textModal: {
    fontSize: 16,
    marginBottom: 10,
  },
  cancelledMessage: {
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    padding: 10,
    alignItems: 'center',
  },
  cancelledText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});