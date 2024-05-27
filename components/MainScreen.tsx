import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Button, TextInput, AppState, Modal, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import { useRoute } from '@react-navigation/native';
import * as TaskManager from "expo-task-manager";
import { MainScreenStyles } from '../styles/MainScreenStyles';

const TASK_NAME = "location-tracking";

const MainScreen = ({ navigation }) => {
  const [location, setLocation] = useState<Location.LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSharingLocation, setIsSharingLocation] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>('Compartir ubicación');
  const [buttonColor, setButtonColor] = useState<string>('green');
  const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const route = useRoute();
  const { code, name, dorsal, color, deviceID } = route.params;
  const lastLocationRef = useRef<{ latitude: number | null, longitude: number | null } | null>(null);
  const [LOCATION_INTERVAL, setLocationInterval] = useState<number>(0);
  const [LOCATION_DISTANCE, setLocationDistance] = useState<number>(0);
  const [watchSubscription, setWatchSubscription] = useState<Location.LocationCallback | null>(null);
  const [distanceSubscription, setDistanceSubscription] = useState<null | Record<string, never>>(null);
  const [event, setEvent] = useState({});
  const [lastSentLocation, setLastSentLocation] = useState<{ latitude: number | null, longitude: number | null, timestamp: number | null }>({ latitude: null, longitude: null, timestamp: null });
  const [appState, setAppState] = useState(AppState.currentState);
  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(false);
  const [sendingLocation, setSendingLocation] = useState<boolean>(false);
  const [isEventCancelled, setIsEventCancelled] = useState<boolean>(false);
  const [isEventFinished, setIsEventFinished] = useState<boolean>(false);
  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [showEnterCodeModal, setShowEnterCodeModal] = useState<boolean>(false);
  const [enteredCode, setEnteredCode] = useState<string>('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (isSharingLocation) {
        setShowConfirmationModal(true);
        e.preventDefault();
      }
    });
    return unsubscribe;
  }, [navigation, isSharingLocation]);

  useEffect(() => {
    obtenerDatosEvento(code);
    if (isEventFinished || isEventCancelled) {
      if (isSharingLocation) {
        handleConfirmation(true);
      }
      setIsLocationEnabled(false);
    }
  }, [location]);

  useEffect(() => {
    const checkLocationEnabled = async () => {
      const enabled = await Location.hasServicesEnabledAsync();
      setIsLocationEnabled(enabled);
    };

    checkLocationEnabled();
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso para acceder a la localización fue denegado');
        console.error('Permiso para acceder a la ubicación denegado');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
    obtenerDatosEvento(code);

  }, [code]);

  const obtenerDatosEvento = async (code: string) => {
    try {
      const response = await fetch(`https://pruebaproyectouex.000webhostapp.com/proyectoTFG/consulta_events_code.php?code=${code}`);
      const data = await response.json();

      if (data.length > 0) {
        const jsonObject = data[0];
        setEvent(jsonObject);
        setIsEventCancelled(jsonObject.status == 1);
        setIsEventFinished(jsonObject.status == 2);
        setIsLocationEnabled(jsonObject.status == 0);
        const TIME_DISTANCE = jsonObject.time_distance;
        const [LOCATION_INTERVAL, LOCATION_DISTANCE] = TIME_DISTANCE.split('-').map(Number);
        setLocationInterval(LOCATION_INTERVAL*1000);
        setLocationDistance(LOCATION_DISTANCE/1000);

      } else {
        console.error('No se encontraron eventos para el código proporcionado.');
      }
    } catch (error) {
      console.error('Error al obtener datos de evento:', error);
    }
  };

  const handleAppStateChange = (nextAppState) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('La aplicación está en primer plano');
    } else {
      console.log('La aplicación está en segundo plano');
    }
    setAppState(nextAppState);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const formattedTime = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    return formattedTime;
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const earthRadiusKm = 6371;

    const dLat = Math.PI / 180 * (lat2 - lat1);
    const dLon = Math.PI / 180 * (lon2 - lon1);

    const a =
      0.5 - Math.cos(dLat) / 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      (1 - Math.cos(dLon)) / 2;

    return earthRadiusKm * 2 * Math.asin(Math.sqrt(a));
  };

  const startBackgroundLocationTracking = async () => {
    try {
      await Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy: Location.Accuracy.BestForNavigation,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'Seguimiento de ubicación activo',
          notificationBody: 'La aplicación está rastreando tu ubicación en segundo plano para mejorar la precisión de los datos.',
        },
      });
      console.log('El seguimiento de ubicación en segundo plano se ha iniciado correctamente');
    } catch (error) {
      console.error('Error al iniciar el seguimiento de ubicación en segundo plano:', error);
    }
  };

  const stopBackgroundLocationTracking = async () => {
    try {
      await Location.stopLocationUpdatesAsync(TASK_NAME);
      console.log('El seguimiento de ubicación en segundo plano se ha detenido correctamente');
    } catch (error) {
      console.error('Error al detener el seguimiento de ubicación en segundo plano:', error);
    }
  };

  const startSharingLocation = async () => {
    setIsSharingLocation(true);
    setButtonText('Dejar de compartir ubicación');
    setButtonColor('red');
    startBackgroundLocationTracking();

    if (LOCATION_DISTANCE > 0 && LOCATION_INTERVAL === 0) {
      console.log('Actualización por distancia, intervalo:', LOCATION_DISTANCE * 1000, 'metros');

      const subscription = await Location.watchPositionAsync(
        {
          distanceInterval: LOCATION_DISTANCE,
        },
        handleNewLocation
      );
      setWatchSubscription(subscription);
    } else if (LOCATION_DISTANCE > 0 && LOCATION_INTERVAL > 0) {
      console.log('Actualización por distancia y tiempo, intervalo:', LOCATION_DISTANCE * 1000, 'metros y', LOCATION_INTERVAL / 1000, 'segundos');

      const subscription = await Location.watchPositionAsync(
      {
        distanceInterval: LOCATION_DISTANCE,
      },
      handleNewLocation
    );
    setDistanceSubscription(subscription);

    const timeIntervalPromise = new Promise((resolve) => {
      const id = setInterval(async () => {
        try {
          const newLocation = await Location.getCurrentPositionAsync({});
          const formattedTimestamp = formatTimestamp(newLocation.timestamp);
          sendLocationDataToServer(newLocation.coords.latitude, newLocation.coords.longitude, newLocation.coords.altitude, newLocation.coords.accuracy, formattedTimestamp);
          setLocation(newLocation);
          lastLocationRef.current = { latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude };
          resolve();
        } catch (error) {
          console.error('Error al obtener la ubicación:', error);
        }
      }, LOCATION_INTERVAL);
      setIntervalId(id);
    });

    Promise.race([timeIntervalPromise])
      .then(() => {
        console.log('Se actualizó la ubicación por tiempo.');
        clearInterval(intervalId);
      })
      .catch((error) => {
        console.error('Error al actualizar la ubicación:', error);
      });
    } else if (LOCATION_DISTANCE === 0 && LOCATION_INTERVAL > 0){
      console.log('Actualización por tiempo, intervalo:', LOCATION_INTERVAL / 1000, 'segundos');

        const timeIntervalPromise = new Promise((resolve) => {
          const id = setInterval(async () => {
            try {
              const newLocation = await Location.getCurrentPositionAsync({});
              const formattedTimestamp = formatTimestamp(newLocation.timestamp);
              sendLocationDataToServer(newLocation.coords.latitude, newLocation.coords.longitude, newLocation.coords.altitude, newLocation.coords.accuracy, formattedTimestamp);
              setLocation(newLocation);
              lastLocationRef.current = { latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude };
              resolve();
            } catch (error) {
              console.error('Error al obtener la ubicación:', error);
              resolve();
            }
          }, LOCATION_INTERVAL);
          setIntervalId(id);
        });

        timeIntervalPromise
          .then(() => {
            console.log('Se actualizó la ubicación por tiempo.');
            clearInterval(intervalId);
          })
          .catch((error) => {
            console.error('Error al actualizar la ubicación:', error);
          });
    } else {
      throw new Error('La configuración de ubicación no está definida correctamente.');
    }
  };

  const handleNewLocation = async (newLocation) => {
    try {
      if (lastLocationRef.current) {
        const distance = calculateDistance(
          lastLocationRef.current.latitude,
          lastLocationRef.current.longitude,
          newLocation.coords.latitude,
          newLocation.coords.longitude
        );
        if (distance >= LOCATION_DISTANCE) {
          const formattedTimestamp = formatTimestamp(newLocation.timestamp);
          sendLocationDataToServer(newLocation.coords.latitude, newLocation.coords.longitude, newLocation.coords.altitude, newLocation.coords.accuracy, formattedTimestamp);
          setLocation(newLocation);
          lastLocationRef.current = { latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude };
        }
      } else {
        const formattedTimestamp = formatTimestamp(newLocation.timestamp);
        sendLocationDataToServer(newLocation.coords.latitude, newLocation.coords.longitude, newLocation.coords.altitude, newLocation.coords.accuracy, formattedTimestamp);
        setLocation(newLocation);
        lastLocationRef.current = { latitude: newLocation.coords.latitude, longitude: newLocation.coords.longitude };
      }
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (watchSubscription) {
        watchSubscription.remove();
      }
    };
  }, [intervalId, watchSubscription]);

  const sendLocationDataToServer = async (latitude: number, longitude: number, altitude: number, accuracy: number, timestamp: number) => {
    try {
      if (lastLocationRef.current && lastLocationRef.current.latitude === latitude && lastLocationRef.current.longitude === longitude) {
        console.log('Ubicación igual a la anterior, no se enviará al servidor.');
        return;
      } else {
        console.log('Ubicación diferente a la anterior, se enviará al servidor.');
      }

      const formData = new FormData();
      formData.append('code', code);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());
      formData.append('altitude', altitude.toString());
      formData.append('accuracy', accuracy.toString());
      formData.append('timestamp', timestamp.toString());
      formData.append('deviceID', deviceID);
      formData.append('name', name);
      formData.append('dorsal', dorsal);
      formData.append('color', color);

      const response = await fetch('https://pruebaproyectouex.000webhostapp.com/proyectoTFG/insertar_location.php', {
        method: 'POST',
        body: formData
      });

      const data = await response.text();
      console.log('Datos de ubicación enviados exitosamente:', data);
      setLastSentLocation({ latitude, longitude, timestamp });
    } catch (error) {
      console.error('Error al enviar datos de ubicación:', error);
    }
  };

  const getUpdateFrequencyMessage = () => {
    if (LOCATION_INTERVAL === 0) {
      return `Se mandará la ubicación cada ${LOCATION_DISTANCE * 1000} metros.`;
    } else if (LOCATION_DISTANCE === 0) {
      return `Se mandará la ubicación cada ${LOCATION_INTERVAL / 1000} segundos.`;
    } else {
      return `Se mandará la ubicación cada ${LOCATION_INTERVAL / 1000} segundos o cada ${LOCATION_DISTANCE * 1000} metros.`;
    }
  };

  const handleConfirmation = (confirmed: boolean) => {
    setShowConfirmationModal(false);
    if (confirmed) {
      setIsSharingLocation(false);
      if (intervalId) {
        clearInterval(intervalId);
      }
      if (watchSubscription) {
        watchSubscription.remove();
      }
      if (distanceSubscription) {
        distanceSubscription.remove();
      }
      stopBackgroundLocationTracking();
      setButtonText('Compartir ubicación');
      setButtonColor('green');
    }
  };

  const cancelEvent = async (action: number) => {
    try {
      const formData = new FormData();
      formData.append('code', code);
      formData.append('action', action);
      if(action == 1) {
        formData.append('cancelReason', cancelReason.toString());
      }
      const response = await fetch(`https://pruebaproyectouex.000webhostapp.com/proyectoTFG/cancel_event.php`, {
        method: 'POST',
        body: formData
      });
      const data = await response.text();
      if (action === 1) {
        hideCancelModalHandler();
        setIsEventCancelled(true);
        if (isSharingLocation) {
          handleConfirmation(true);
        }
        setIsLocationEnabled(false);
      } else {
        setIsEventCancelled(false);
        setIsLocationEnabled(true);
      }
    } catch (error) {
      console.error('Error al cancelar el evento:', error);
    }
  };

  const hideCancelModalHandler = () => {
    setShowCancelReasonModal(false);
    setCancelReason('');
  };

  const handleCancelReasonConfirm = () => {
    hideCancelModalHandler();
    setIsEventCancelled(true);
  };

  const showEnterCodeModalHandler = () => {
    setShowEnterCodeModal(true);
  };

  const hideEnterCodeModalHandler = () => {
    setShowEnterCodeModal(false);
    setEnteredCode('');
  };

  const handleEnterCodeConfirmation = () => {
    if (enteredCode === code) {
      hideEnterCodeModalHandler();
      setShowCancelReasonModal(true);
    } else {
      alert("El código introducido no coincide con el código del evento actual. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <View style={MainScreenStyles.container}>
      {isEventFinished && (
        <View style={MainScreenStyles.cancelledMessage}>
          <Text style={MainScreenStyles.cancelledText}>Evento finalizado</Text>
        </View>
      )}
      {isEventCancelled && !isEventFinished && (
        <View style={MainScreenStyles.cancelledMessage}>
          <Text style={MainScreenStyles.cancelledText}>Evento cancelado</Text>
        </View>
      )}
      <View style={MainScreenStyles.buttonContainer}>
        <Button
          title={buttonText}
          onPress={isSharingLocation ? () => setShowConfirmationModal(true) : startSharingLocation}
          color={buttonColor}
          disabled={!isLocationEnabled}
        />
      </View>
      <View style={MainScreenStyles.dataContainer}>
        <Text style={MainScreenStyles.sectionTitle}>Detalles del Evento</Text>
        <View style={MainScreenStyles.eventDetails}>
          <Text style={MainScreenStyles.eventData}>Nombre del evento: {event.name}</Text>
          <Text style={MainScreenStyles.eventData}>Frecuencia de actualización: {getUpdateFrequencyMessage()}</Text>
          <Text style={MainScreenStyles.eventData}>Provincia: {event.province}</Text>
        </View>
        {(() => {
          if (event.multiuser == 1) {
            return (
              <View style={MainScreenStyles.participantInfo}>
                <Text style={MainScreenStyles.sectionTitle}>Información del participante:</Text>
                <Text style={MainScreenStyles.eventData}>Nombre: {name}</Text>
                <Text style={MainScreenStyles.eventData}>Dorsal: {dorsal}</Text>
                <Text style={[MainScreenStyles.registerLink, { opacity: isEventFinished ? 0.5 : 1 }]} onPress={() => navigation.navigate('RegisterUser', { code: code, deviceID })} disabled={isEventFinished}>¿El dorsal no es correcto? Registrar de nuevo</Text>
              </View>
            );
          }
        })()}
        {(() => {
          if (lastSentLocation.latitude !== null || lastSentLocation.longitude !== null) {
            return (
              <View style={MainScreenStyles.locationInfo}>
                <Text style={MainScreenStyles.sectionTitle}>Última ubicación enviada:</Text>
                <Text style={MainScreenStyles.eventData}>Latitude: {lastSentLocation.latitude}</Text>
                <Text style={MainScreenStyles.eventData}>Longitude: {lastSentLocation.longitude}</Text>
                <Text style={MainScreenStyles.eventData}>Timestamp: {formatTimestamp(lastSentLocation.timestamp)}</Text>
              </View>
            );
          }
        })()}
        {(() => {
          if (name === "Anónimo" || dorsal === 0) {
            return (
              <TouchableOpacity
                style={MainScreenStyles.eventButton}
                onPress={() => isEventCancelled ? cancelEvent(0) : setShowEnterCodeModal(true)}
                disabled={isEventFinished}
                >
                <Text style={MainScreenStyles.cancelEvent}>{isEventCancelled ? 'Reanudar evento' : 'Suspender evento'}</Text>
              </TouchableOpacity>
            );
          }
        })()}
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEnterCodeModal}
        onRequestClose={hideEnterCodeModalHandler}
      >
        <View style={[MainScreenStyles.modalContainer, { paddingHorizontal: 20 }]}>
          <View style={MainScreenStyles.modalContent}>
            <Text style={MainScreenStyles.textModal}>Por seguridad, se debe introducir el código del evento para poder suspenderlo.</Text>
            <TextInput
              style={MainScreenStyles.input}
              onChangeText={setEnteredCode}
              value={enteredCode}
              keyboardType="numeric"
              placeholder="Código del evento"
            />
            <View style={MainScreenStyles.modalButtons}>
              <Button title="Aceptar" onPress={handleEnterCodeConfirmation} />
              <Button title="Cancelar" onPress={hideEnterCodeModalHandler} />
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide-up"
        transparent={true}
        visible={showCancelReasonModal}
        onRequestClose={() => hideCancelModalHandler()}
      >
        <View style={[MainScreenStyles.modalContainer, { paddingHorizontal: 20 }]}>
          <View style={MainScreenStyles.modalContent}>
            <Text style={MainScreenStyles.textModal}>Por favor, ingrese el motivo de cancelación (máximo 200 caracteres):</Text>
            <TextInput
              style={MainScreenStyles.input}
              onChangeText={setCancelReason}
              value={cancelReason}
              placeholder="Motivo de cancelación"
              maxLength={200}
            />
            <View style={MainScreenStyles.modalButtons}>
              <Button title="CANCELAR" onPress={() => cancelEvent(1)} color="red"/>
              <Button title="Volver" onPress={() => hideCancelModalHandler()} />
            </View>
          </View>
        </View>
      </Modal>
      <ConfirmationModal visible={showConfirmationModal} onConfirm={handleConfirmation} />
    </View>
  );
};

const ConfirmationModal = ({ visible, onConfirm }: { visible: boolean, onConfirm: (confirmed: boolean) => void }) => {
  const [cancelText, setCancelText] = useState<string>('');

  useEffect(() => {
    if (!visible) {
      setCancelText('');
    }
  }, [visible]);

  if (!visible) return null;

  const handleConfirm = () => {
    if (cancelText.trim().toUpperCase() === 'CANCELAR') {
      onConfirm(true);
    }
  };

  const handleCancel = () => {
    onConfirm(false);
  };

  return (
    <View style={MainScreenStyles.modalContainer}>
      <View style={MainScreenStyles.modalContent}>
        <Text style={MainScreenStyles.textModal}>Para dejar de compartir la ubicación, ingrese &quot;CANCELAR&quot; en el siguiente campo:</Text>
        <TextInput
          style={MainScreenStyles.input}
          onChangeText={setCancelText}
          value={cancelText}
          placeholder="Ingrese CANCELAR aquí"
        />
        <View style={MainScreenStyles.modalButtons}>
          <Button title="CANCELAR" onPress={handleConfirm} disabled={cancelText.trim() !== 'CANCELAR'} color="red" />
          <Button title="VOLVER" onPress={handleCancel} />
        </View>
      </View>
    </View>
  );
};

export default MainScreen;