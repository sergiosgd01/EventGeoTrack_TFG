import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LogBox } from 'react-native';
import LoginScreen from './components/LoginScreen';
import RegisterUserScreen from './components/RegisterUserScreen';
import MainScreen from './components/MainScreen';
import QRScannerScreen from './components/QRScannerScreen';

const Stack = createStackNavigator();

LogBox.ignoreLogs([
  "It looks like you might be using shared value's .value inside reanimated inline style. " +
    'If you want a component to update when shared value changes you should use the shared value' +
    ' directly instead of its current state represented by `.value`. See documentation here: ' +
    'https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/glossary/#animations-in-inline-styling',
]);

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }} />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ headerShown: false }} />
        <Stack.Screen
          name="RegisterUser"
          component={RegisterUserScreen}
          options={{ headerShown: false }}
          initialParams={{ code: '', deviceID: '' }} />
        <Stack.Screen
          name="Main"
          component={MainScreen}
          options={{ headerShown: false }}
          initialParams={{ code: '', deviceID: '', name: 'Anónimo', dorsal: 0 }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;