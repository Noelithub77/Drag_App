import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Stack } from "expo-router";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { FontAwesome } from "@expo/vector-icons";
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
// import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebaseConfig';
import { collection, addDoc, GeoPoint } from 'firebase/firestore';
import { Link } from "expo-router";

const MapPreview = ({ onRegionChange }: { onRegionChange: (region: Region) => void }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const cachedLocation = await AsyncStorage.getItem('cachedLocation');
        const cachedRegion = await AsyncStorage.getItem('cachedRegion');

        if (cachedLocation && cachedRegion) {
          setLocation(JSON.parse(cachedLocation));
          setRegion(JSON.parse(cachedRegion));
          setIsLoading(false);
          return;
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        var location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setLocation(location);
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0005,
          longitudeDelta: 0.0005,
        });

        await AsyncStorage.setItem('cachedLocation', JSON.stringify(location));
        await AsyncStorage.setItem('cachedRegion', JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0005,
          longitudeDelta: 0.0005,
        }));
      } catch (error) {
        setErrorMsg('Could not fetch location');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (Platform.OS === "web") {
    return (
      <View className="w-full h-full bg-gray-100 items-center justify-center">
        <Text className="text-gray-500">Map preview not available on web</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="w-full h-full items-center justify-center">
        <ActivityIndicator size="large" color="#FB923C" />
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View className="w-full h-full items-center justify-center">
        <Text className="text-red-500">{errorMsg}</Text>
      </View>
    );
  }

  if (!region) {
    return null;
  }

  return (
    <MapView
      style={{
        width: Dimensions.get('window').width - 32, // Accounting for padding
        height: '100%',
      }}
      provider={PROVIDER_GOOGLE}
      showsUserLocation={true}
      showsMyLocationButton={true}
      initialRegion={region}
      region={region}
      onRegionChangeComplete={(region) => {
        setRegion(region);
        onRegionChange(region);
      }} // Changed to onRegionChangeComplete for better performance
    />
  );
};

const useUserRegion = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const cachedRegion = await AsyncStorage.getItem('cachedRegion');
        if (cachedRegion) {
          setRegion(JSON.parse(cachedRegion));
          return;
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        const region = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0005,
          longitudeDelta: 0.0005,
        };
        setRegion(region);
        await AsyncStorage.setItem('cachedRegion', JSON.stringify(region));
      } catch (error) {
        setErrorMsg('Could not fetch location');
      }
    })();
  }, []);

  return { region, errorMsg };
};

const ReportPage: React.FC = () => {
  const { region, errorMsg } = useUserRegion();
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [reportRegion, setReportRegion] = useState<Region | null>(null);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need gallery permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need audio recording permissions to make this work!');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY,
      );
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    setRecording(null);
    await recording?.stopAndUnloadAsync();
    const uri = recording?.getURI();
    setAudioUri(uri || null);

    const { status } = await Audio.Sound.createAsync(
      { uri: uri as string },
      { shouldPlay: false }
    );
    if (status.isLoaded) {
      setAudioDuration(status.durationMillis || 0);
    }
  };

  const handleAudioPress = async () => {
    if (recording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const renderWaveform = () => {
    // Custom waveform rendering logic
    return (
      <View style={{ width: '100%', height: 50, backgroundColor: '#E1E1E1', borderRadius: 8 }}>
        <Text style={{ textAlign: 'center', lineHeight: 50, color: '#4A4A4A' }}>
          recorded audio (Duration: {Math.round(audioDuration / 1000)}s)
        </Text>
      </View>
    );
  };

  const handleRegionChange = (region: Region) => {
    setReportRegion(region);
  };

  const handleSubmit = async () => {
    try {
      console.log("clicked")
      const reportData: any = {};

      if (reportRegion) {
        console.log(reportRegion)
        reportData.location = {
          latitude: reportRegion.latitude,
          longitude: reportRegion.longitude
        };
      } else {
        alert('Location is not available');
        return;
      }

      if (audioUri) {
        reportData.audioUri = audioUri;
      }

      if (description) {
        reportData.description = description;
      }

      if (images.length > 0) {
        reportData.images = images;
      }

      const docRef = await addDoc(collection(db, 'reports'), reportData);
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Report Page" }} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            ref={scrollViewRef}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          >
            <View className="flex-1 bg-white p-4">
              {/* Header */}
              <Text className="text-lg font-semibold mb-4">
              Location and Attachments
              </Text>

              {/* Map Preview */}
              <View style={{ height: 200, marginBottom: 24 }}>
              <MapPreview onRegionChange={handleRegionChange} />
              {/* Map Markers */}
              <View className="absolute top-1/2 left-1/2 -translate-x-2 -translate-y-2">
                <View className="w-4 h-4 bg-orange-400 rounded-full border-2 border-white" />
              </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row justify-around mb-6">
              {/* Camera Button */}
              <TouchableOpacity className="items-center" onPress={takePhoto}>
                <View className="w-16 h-16 rounded-full bg-orange-400 items-center justify-center mb-2">
                <FontAwesome name="camera" size={24} color="white" />
                </View>
                <Text className="text-sm text-gray-600">Photo</Text>
              </TouchableOpacity>

              {/* Audio Button */}
              <TouchableOpacity className="items-center" onPress={handleAudioPress}>
                <View className="w-16 h-16 rounded-full bg-orange-400 items-center justify-center mb-2">
                <FontAwesome name={recording ? "stop" : "microphone"} size={24} color="white" />
                </View>
                <Text className="text-sm text-gray-600">{recording ? "Stop" : "Audio"}</Text>
              </TouchableOpacity>

              {/* Gallery Button */}
              <TouchableOpacity className="items-center" onPress={pickImage}>
                <View className="w-16 h-16 rounded-full bg-orange-400 items-center justify-center mb-2">
                <FontAwesome name="image" size={24} color="white" />
                </View>
                <Text className="text-sm text-gray-600">Gallery</Text>
              </TouchableOpacity>
              </View>

              {/* Show selected images if any */}
              {images.length > 0 && (
              <View className="flex-row flex-wrap mb-4">
                {images.map((uri, index) => (
                <View key={index} className="m-1">
                  <Image
                  source={{ uri }}
                  className="w-20 h-20 rounded-lg"
                  resizeMode="cover"
                  />
                </View>
                ))}
              </View>
              )}

              {/* Show recorded audio waveform if any */}
              {audioUri && (
              <View className="mb-4">
                <Text className="text-sm text-gray-600">Recorded Audio:</Text>
                {renderWaveform()}
              </View>
              )}

              {/* Description Input */}
              <View className="mb-2 flex-1">
              <Text className="text-sm text-gray-700 mb-2">
                Describe the events
              </Text>
              <View className="bg-orange-50 rounded-xl p-4 flex-1">
                <View className="bg-white rounded-lg p-2 flex-1">
                <TextInput
                  placeholder="Type here"
                  multiline
                  className="text-gray-700 flex-1"
                  placeholderTextColor="#9CA3AF"
                  style={{ minHeight: 100 }} // Ensure the input box is large enough
                  value={description}
                  onChangeText={setDescription}
                />
                </View>
              </View>
              </View>

              {/* Submit Button */}
              <Link href='/PoliceReport' asChild>
              <TouchableOpacity
                className="bg-orange-400 rounded-xl py-4 items-center"
                onPress={handleSubmit}
              >
                <Text className="text-white font-semibold text-lg">Submit</Text>
              </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
};

export default ReportPage;