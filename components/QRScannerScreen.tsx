import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Alert, ToastAndroid } from 'react-native';
import { Camera } from 'expo-camera';
import PropTypes from 'prop-types';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { QRScannerScreenStyles } from '../styles/QRScannerScreenStyles';

export default function QRScannerScreen({ route }) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const cameraRef = useRef(null);
  const { deviceID } = route.params;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (isFocused) {
      setScanned(false);
    }
  }, [isFocused]);

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    try {
      const response = await fetch(`https://pruebaproyectouex.000webhostapp.com/proyectoTFG/consulta_events_qrcode.php?qrCode=${data}`);
      const responseData = await response.json();
      if (responseData.length > 0) {
        const currentDate = new Date();
        const startDate = new Date(responseData[0].startDate);
        const endDate = new Date(responseData[0].endDate);

        if (currentDate < startDate) {
          setScanned(true);
          Alert.alert(
            'Error',
            'El evento del código QR escaneado aún no ha comenzado.',
            [{ text: 'OK', onPress: () => setScanned(false) }]
          );
        } else if (currentDate > endDate) {
          setScanned(true);
          Alert.alert(
            'Error',
            'El evento del código QR escaneado ya ha finalizado.',
            [{ text: 'OK', onPress: () => setScanned(false) }]
          );
        } else {
          if (responseData[0].multiuser == 1) {
            const response = await fetch(`https://pruebaproyectouex.000webhostapp.com/proyectoTFG/verificar_deviceID.php?deviceID=${deviceID}&code=${responseData[0].code}`);
            const data = await response.json();
            if (data.length > 0) {
             const jsonObject = data[0];
              const name = jsonObject.name;
              const dorsal = jsonObject.dorsal;
              const color = jsonObject.color;
              navigation.navigate('Main', { code: responseData[0].code, name, dorsal, color, deviceID });
            } else {
              ToastAndroid.show('El evento requiere que ingreses un nombre de usuario y un dorsal.', ToastAndroid.SHORT);
              navigation.navigate('RegisterUser', { code: responseData[0].code, deviceID });
            }
          } else {
            navigation.navigate('Main', { code: responseData[0].code, deviceID });
          }
        }
      } else {
        setScanned(false);
        Alert.alert(
          'Error',
          'No se encontró ningún evento correspondiente al código QR escaneado. Por favor, pulse sobre escanear de nuevo.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error al realizar la solicitud al servidor:', error);
      Alert.alert('Error', 'Error al realizar la solicitud al servidor. Por favor, intenta de nuevo.', [{ text: 'OK' }]);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      aspect: [4, 3],
      quality: 1,
    });

    if (result && result.assets[0].uri) {
      try {
        const scannedResults = await BarCodeScanner.scanFromURLAsync(result.assets[0].uri);
        if (scannedResults && scannedResults.length > 0) {
          const dataNeeded = scannedResults[0].data;
          handleBarCodeScanned({ data: dataNeeded });
        } else {
          Alert.alert('No se encontraron códigos QR en la imagen seleccionada.');
        }
      } catch (error) {
        console.error('Error scanning QR code:', error);
      }
    }
  };

  const handleLoginInput = () => {
    navigation.navigate('Login');
  };

  if (hasPermission === null) {
    return null;
  }

  if (hasPermission === false) {
    return <Text>No hay acceso a la cámara</Text>;
  }

  return (
    <View style={QRScannerScreenStyles.container}>
      <Text style={QRScannerScreenStyles.instructions}>Por favor, escanea tu código QR</Text>
      <View style={QRScannerScreenStyles.cameraContainer}>
        <Camera
          ref={cameraRef}
          style={QRScannerScreenStyles.camera}
          type={Camera.Constants.Type.back}
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      </View>
      <View style={QRScannerScreenStyles.buttonContainer}>
        <View style={QRScannerScreenStyles.buttonContainerImage}>
          <Button title="Seleccionar imagen de la galería" onPress={pickImage} />
        </View>
        <View style={QRScannerScreenStyles.buttonContainerCode}>
          <Button title="Introducir código manualmente" onPress={handleLoginInput} color="red" />
        </View>
      </View>
    </View>
  );
}

QRScannerScreen.propTypes = {
  route: PropTypes.object.isRequired,
};

export default QRScannerScreen;