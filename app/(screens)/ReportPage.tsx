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
import { Stack, useRouter, Link } from "expo-router";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import { FontAwesome } from "@expo/vector-icons";
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabaseConfig';
import * as FileSystem from 'expo-file-system';

interface ReportData {
  latitude: number;
  longitude: number;
  description: string;
  created_at: string;
  image_url?: string;
  audio_url?: string;
}

const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState<Region | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        
        const locationEnabled = await Location.hasServicesEnabledAsync();
        if (!locationEnabled) {
          console.error("Location services are not enabled");
          setErrorMsg('Location services are not enabled. Please enable location services in your device settings.');
          return;
        }
        
        const cachedLocation = await AsyncStorage.getItem('cachedLocation');
        const cachedRegion = await AsyncStorage.getItem('cachedRegion');

        if (cachedLocation && cachedRegion) {
          const parsedLocation = JSON.parse(cachedLocation);
          const parsedRegion = JSON.parse(cachedRegion);
          setLocation(parsedLocation);
          setRegion(parsedRegion);
          return;
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        const newRegion = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.0005,
          longitudeDelta: 0.0005,
        };
        
        setLocation(currentLocation);
        setRegion(newRegion);

        await AsyncStorage.setItem('cachedLocation', JSON.stringify(currentLocation));
        await AsyncStorage.setItem('cachedRegion', JSON.stringify(newRegion));
      } catch (error) {
        console.error('Error fetching location:', error);
        setErrorMsg('Could not fetch location');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { location, region, errorMsg, isLoading, setRegion };
};

const MapPreview = ({ onRegionChange }: { onRegionChange: (region: Region) => void }) => {
  const { region, errorMsg, isLoading, setRegion } = useLocation();

  useEffect(() => {
    if (region) {
      onRegionChange(region);
    }
  }, [region, onRegionChange]);

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
        width: Dimensions.get('window').width - 32,
        height: '100%',
      }}
      provider={Platform.OS === 'ios' || Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      showsUserLocation={true}
      showsMyLocationButton={true}
      initialRegion={region}
      region={region}
      onRegionChangeComplete={(newRegion) => {
        setRegion(newRegion);
        onRegionChange(newRegion);
      }}
    />
  );
};

const ReportPage: React.FC = () => {
  const router = useRouter();
  const { region, errorMsg } = useLocation();
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [reportRegion, setReportRegion] = useState<Region | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  
  useEffect(() => {
    if (region && !reportRegion) {
      console.log("Setting initial reportRegion from useUserRegion:", region);
      setReportRegion(region);
    }
  }, [region, reportRegion]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      exif: false,
    });

    if (!result.canceled) {
      try {
        const asset = result.assets[0];
        setImages(prev => [...prev, asset.uri]);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Failed to process image. Please try again with a smaller image.');
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need gallery permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      quality: 1,
      exif: false,
    });

    if (!result.canceled) {
      try {
        const asset = result.assets[0];
        setImages(prev => [...prev, asset.uri]);
      } catch (error) {
        console.error('Error processing image:', error);
        alert('Failed to process image. Please try again with a smaller image.');
      }
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

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
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

  const processAndUploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
      
      
      const quality = fileSize > 5 * 1024 * 1024 ? 0.5 : 1;
      
      const fileExt = imageUri.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      
      const chunkSize = 512 * 1024; 
      let base64Data = '';
      let offset = 0;
      
      while (offset < fileSize) {
        const chunk = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
          length: chunkSize,
          position: offset,
        });
        base64Data += chunk;
        offset += chunkSize;
      }

      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('reports')
        .upload(filePath, decode(base64Data), {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error('Error uploading image:', storageError);
        return null;
      }

      const { data: urlData } = supabase
        .storage
        .from('reports')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error processing image:', error);
      return null;
    }
  };

  const processAndUploadAudio = async (audioUri: string): Promise<string | null> => {
    try {
      const fileExt = 'mp4';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `reports/audio/${fileName}`;

      const base64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('reports')
        .upload(filePath, decode(base64), {
          contentType: 'audio/mp4',
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error('Error uploading audio:', storageError);
        return null;
      }

      const { data: urlData } = supabase
        .storage
        .from('reports')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error processing audio:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    try {
      console.log("Submitting report...");
      
      const locationRegion = reportRegion || region;
      
      if (!locationRegion) {
        console.error("No location available. reportRegion:", reportRegion, "region:", region);
        alert('Location is not available. Please ensure location services are enabled and try again.');
        return false;
      }

      if (!description.trim()) {
        alert('Please provide a description of the report.');
        return false;
      }

      const reportData: ReportData = {
        latitude: locationRegion.latitude,
        longitude: locationRegion.longitude,
        description: description.trim(),
        created_at: new Date().toISOString(),
      };

      
      const [imageUrl, audioUrl] = await Promise.all([
        images.length > 0 ? processAndUploadImage(images[0]) : Promise.resolve(null),
        audioUri ? processAndUploadAudio(audioUri) : Promise.resolve(null)
      ]);

      if (imageUrl) reportData.image_url = imageUrl;
      if (audioUrl) reportData.audio_url = audioUrl;

      const { data, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select();

      if (error) {
        console.error('Error inserting report:', error);
        alert('Failed to submit report: ' + error.message);
        return false;
      }

      console.log('Report submitted successfully:', data);
      return true;
    } catch (e) {
      console.error("Error submitting report: ", e);
      alert('An error occurred while submitting the report');
      return false;
    }
  };

  
  const handleSubmitAndNavigate = async () => {
    if (isSubmitting) return; 
    
    setIsSubmitting(true);
    try {
      const success = await handleSubmit();
      if (success) {
        
        setDescription("");
        setImages([]);
        setAudioUri(null);
        
        
        alert('Report submitted successfully! You can now view all reports in the Police Report tab.');
      }
    } catch (error) {
      console.error("Error in handleSubmitAndNavigate:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const decode = (base64: string): string | Uint8Array => {
    try {
      if (Platform.OS === 'web' && typeof atob === 'function') {
        const chunkSize = 1024 * 1024;
        if (base64.length > chunkSize * 2) {
          console.log('Processing large base64 data in chunks');
          const binaryString = atob(base64);
          const len = binaryString.length;
          let bytes = new Uint8Array(len);
          for (let i = 0; i < len; i += chunkSize) {
            const chunk = Math.min(chunkSize, len - i);
            for (let j = 0; j < chunk; j++) {
              bytes[i + j] = binaryString.charCodeAt(i + j);
            }
          }
          return bytes;
        } else {
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          return bytes;
        }
      } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
        return base64;
      } else {
        console.log('Using fallback decode method');
        try {
          const rawData = Buffer.from(base64, 'base64');
          return new Uint8Array(rawData);
        } catch (bufferError) {
          console.error('Buffer fallback failed:', bufferError);
          return base64;
        }
      }
    } catch (error) {
      console.error('Error decoding base64:', error);
      return base64;
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

              {/* Navigation Link to Police Report */}
              <Link
                href={{
                  pathname: "/PoliceReport",
                }}
              >                <TouchableOpacity className="mb-6 bg-orange-400 p-3 rounded-xl shadow-sm flex-row justify-center items-center">
                  <FontAwesome name="map-marker" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text className="text-white text-center font-semibold">View Police Reports</Text>
                </TouchableOpacity>
              </Link>

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
                  style={{ minHeight: 100 }} 
                  value={description}
                  onChangeText={setDescription}
                />
                </View>
              </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                className={`${isSubmitting ? 'bg-orange-300' : 'bg-orange-400'} rounded-xl py-4 items-center`}
                onPress={handleSubmitAndNavigate}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white font-semibold text-lg ml-2">Submitting...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-semibold text-lg">Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
};

export default ReportPage;