import React, { useState } from 'react';
import { View, TextInput, Button, TouchableOpacity, Text, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { RegisterUserScreenStyles } from '../styles/RegisterUserScreenStyles';

const colors = [
  { id: 1, name: 'Rojo', value: '#FF0000' },
  { id: 2, name: 'Verde', value: '#00FF00' },
  { id: 3, name: 'Azul', value: '#0000FF' },
  { id: 4, name: 'Amarillo', value: '#FFFF00' },
  { id: 5, name: 'Naranja', value: '#FFA500' },
  { id: 6, name: 'Rosa', value: '#FFC0CB' },
  { id: 7, name: 'Morado', value: '#800080' },
  { id: 8, name: 'Turquesa', value: '#40E0D0' },
  { id: 9, name: 'Gris', value: '#808080' },
  { id: 10, name: 'Violeta', value: '#8A2BE2' },
  { id: 11, name: 'Marrón', value: '#A52A2A' },
  { id: 12, name: 'Fucsia', value: '#FF00FF' },
  { id: 13, name: 'Oro', value: '#FFD700' },
  { id: 14, name: 'Plata', value: '#C0C0C0' },
];

const RegisterUserScreen = ({ navigation, route }) => {
  const { code, deviceID } = route.params;
  const [name, setName] = useState('');
  const [dorsal, setDorsal] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleContinue = async () => {
    if (name.trim() === '' || dorsal.trim() === '') {
      setErrorMessage('Por favor, introduce los datos.');
    } else if (!/^\d+$/.test(dorsal)) {
      setErrorMessage('El dorsal debe ser un número.');
    } else if (selectedColor === null) {
      setErrorMessage('Por favor, selecciona un color.');
    } else {
      try {
        const response = await fetch(`https://pruebaproyectouex.000webhostapp.com/proyectoTFG/consulta_code_dorsal_location.php?code=${code}&dorsal=${dorsal}`);
        const data = await response.json();
        if (data.length > 0) {
          if (data[0].name === name && data[0].color === selectedColor) {
            navigation.navigate('Main', { code, name, dorsal, color: selectedColor, deviceID });
          } else {
            setErrorMessage(`Ya existe un usuario registrado con el dorsal ${dorsal} para este evento. Introduce el mismo nombre y color que el usuario existente.`);
          }
        } else {
          navigation.navigate('Main', { code, name, dorsal, color: selectedColor, deviceID });
        }
      } catch (error) {
        console.error('Error al verificar el dorsal:', error);
      }
    }
  };

  const selectColor = (color) => {
    setSelectedColor(color);
  };

  return (
    <View style={RegisterUserScreenStyles.container}>
      <View style={RegisterUserScreenStyles.content}>
        <Text style={RegisterUserScreenStyles.title}>Registro de Participantes</Text>
        <TextInput
          style={RegisterUserScreenStyles.input}
          onChangeText={setName}
          value={name}
          maxLength={40}
          placeholder="Por favor, ingresa tu nombre y apellido."
        />
        <TextInput
          style={RegisterUserScreenStyles.input}
          onChangeText={setDorsal}
          value={dorsal}
          keyboardType="numeric"
          maxLength={10}
          placeholder="Por favor, ingresa tu dorsal."
        />
        <ScrollView horizontal contentContainerStyle={RegisterUserScreenStyles.colorScrollView}>
          {colors.map(color => (
            <TouchableOpacity
              key={color.id}
              style={[
                RegisterUserScreenStyles.colorButton,
                { backgroundColor: color.value },
                selectedColor === color.value && RegisterUserScreenStyles.selectedColorButton,
              ]}
              onPress={() => selectColor(color.value)}
            />
          ))}
        </ScrollView>
        {errorMessage ? <Text style={RegisterUserScreenStyles.errorMessage}>{errorMessage}</Text> : null}
        <View style={RegisterUserScreenStyles.buttonWrapper}>
          <Button title="Continuar" onPress={handleContinue} />
        </View>
      </View>
    </View>
  );
};

RegisterUserScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
};

export default RegisterUserScreen;