import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, ToastAndroid, Text, Image } from 'react-native';
import PropTypes from 'prop-types';
import * as Device from 'expo-device';
import loginImage from '../assets/logoApp.png';
import { LoginScreenStyles } from '../styles/LoginScreenStyles';

const LoginScreen = ({ navigation }) => {
  const [code, setCode] = useState('');
  const [deviceID, setDeviceID] = useState(null);

  useEffect(() => {
    const fetchDeviceID = async () => {
      const newDeviceID = `${Device.deviceName}-${Device.osBuildFingerprint}-${Device.totalMemory}`;
        setDeviceID(newDeviceID);
      };
      fetchDeviceID();
  }, []);

  const handleLogin = async () => {
    if (!code) {
      ToastAndroid.show('Por favor, ingresa el código.', ToastAndroid.SHORT);
      return;
    }

    if (!/^\d+$/.test(code)) {
      ToastAndroid.show('El código debe ser un número.', ToastAndroid.SHORT);
      return;
    }

    try {
      const response = await fetch(`https://pruebaproyectouex.000webhostapp.com/proyectoTFG/consulta_events_code.php?code=${code}`);
      const data = await response.json();

      if (data.length === 0) {
        ToastAndroid.show('El código no está registrado en la base de datos.', ToastAndroid.SHORT);
      } else {
        const event = data[0];
        const currentDate = new Date();
        const startDate = new Date(event.startDate);
        const endDate = new Date(event.endDate);

        if (currentDate < startDate) {
          ToastAndroid.show('El evento aún no ha comenzado.', ToastAndroid.SHORT);
        } else if (currentDate > endDate) {
          ToastAndroid.show('El evento ya ha finalizado.', ToastAndroid.SHORT);
        } else {
          const multiuser = parseInt(event.multiuser);
          if (multiuser === 1) {
            const response = await fetch(`https://pruebaproyectouex.000webhostapp.com/proyectoTFG/verificar_deviceID.php?deviceID=${deviceID}&code=${event.code}`);
            const data = await response.json();
            if (data.length > 0) {
              const jsonObject = data[0];
              const name = jsonObject.name;
              const dorsal = jsonObject.dorsal;
              const color = jsonObject.color;
              navigation.navigate('Main', { code: event.code, name, dorsal, color, deviceID });
            } else {
              ToastAndroid.show('El evento requiere que ingreses un nombre de usuario y un dorsal.', ToastAndroid.SHORT);
              navigation.navigate('RegisterUser', { code, deviceID });
            }
          } else {
            navigation.navigate('Main', { code, deviceID });
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      ToastAndroid.show('Error del servidor', ToastAndroid.SHORT);
    }
  };

  const handleScanQR = () => {
    navigation.navigate('QRScanner', { deviceID });
  };

  return (
    <View style={LoginScreenStyles.container}>
      <View style={LoginScreenStyles.content}>
        <Image source={loginImage} style={LoginScreenStyles.image} />
        <Text style={LoginScreenStyles.title}>Ingresar Código de Evento</Text>
        <TextInput
          style={LoginScreenStyles.input}
          value={code}
          onChangeText={setCode}
          keyboardType="numeric"
          maxLength={7}
          placeholder="Ingresa tu código aquí"
        />
        <View style={LoginScreenStyles.buttonsContainer}>
          <View style={LoginScreenStyles.buttonWrapper}>
            <Button title="Siguiente" onPress={handleLogin} />
          </View>
          <View style={LoginScreenStyles.buttonWrapper}>
            <Button title="Escanear Código QR" onPress={handleScanQR} color="red" />
          </View>
        </View>
      </View>
    </View>
  );
};

LoginScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export default LoginScreen;