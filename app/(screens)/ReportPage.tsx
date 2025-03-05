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

const MapPreview = ({ onRegionChange }: { onRegionChange: (region: Region) => void }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        
        // Check if location services are enabled
        const locationEnabled = await Location.hasServicesEnabledAsync();
        if (!locationEnabled) {
          console.error("Location services are not enabled");
          setErrorMsg('Location services are not enabled. Please enable location services in your device settings.');
          setIsLoading(false);
          return;
        }
        
        const cachedLocation = await AsyncStorage.getItem('cachedLocation');
        const cachedRegion = await AsyncStorage.getItem('cachedRegion');

        if (cachedLocation && cachedRegion) {
          const parsedRegion = JSON.parse(cachedRegion);
          setLocation(JSON.parse(cachedLocation));
          setRegion(parsedRegion);
          // Notify parent component of the region
          onRegionChange(parsedRegion);
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
        
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0005,
          longitudeDelta: 0.0005,
        };
        
        setLocation(location);
        setRegion(newRegion);
        // Notify parent component of the region
        onRegionChange(newRegion);

        await AsyncStorage.setItem('cachedLocation', JSON.stringify(location));
        await AsyncStorage.setItem('cachedRegion', JSON.stringify(newRegion));
      } catch (error) {
        console.error('Error fetching location:', error);
        setErrorMsg('Could not fetch location');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [onRegionChange]);

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
      onRegionChangeComplete={(region) => {
        setRegion(region);
        onRegionChange(region);
      }} 
    />
  );
};

const useUserRegion = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        console.log("useUserRegion: Fetching user location...");
        
        // Check if location services are enabled
        const locationEnabled = await Location.hasServicesEnabledAsync();
        if (!locationEnabled) {
          console.error("useUserRegion: Location services are not enabled");
          setErrorMsg('Location services are not enabled. Please enable location services in your device settings.');
          return;
        }
        
        const cachedRegion = await AsyncStorage.getItem('cachedRegion');
        if (cachedRegion) {
          const parsedRegion = JSON.parse(cachedRegion);
          console.log("useUserRegion: Using cached region:", parsedRegion);
          setRegion(parsedRegion);
          return;
        }

        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error("useUserRegion: Location permission denied");
          setErrorMsg('Permission to access location was denied');
          return;
        }

        console.log("useUserRegion: Getting current position...");
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0005,
          longitudeDelta: 0.0005,
        };
        console.log("useUserRegion: Got location:", newRegion);
        setRegion(newRegion);
        await AsyncStorage.setItem('cachedRegion', JSON.stringify(newRegion));
      } catch (error) {
        console.error("useUserRegion: Error fetching location:", error);
        setErrorMsg('Could not fetch location');
      }
    })();
  }, []);

  return { region, errorMsg };
};

const ReportPage: React.FC = () => {
  const router = useRouter();
  const { region, errorMsg } = useUserRegion();
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [reportRegion, setReportRegion] = useState<Region | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize reportRegion with the region from useUserRegion
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

  const handleSubmit = async () => {
    try {
      console.log("Submitting report...");
      
      // Use reportRegion if available, otherwise fall back to region from useUserRegion
      const locationRegion = reportRegion || region;
      
      if (!locationRegion) {
        console.error("No location available. reportRegion:", reportRegion, "region:", region);
        alert('Location is not available. Please ensure location services are enabled and try again.');
        return false; // Return false to indicate submission failed
      }

      // Check if description is empty
      if (!description.trim()) {
        alert('Please provide a description of the report.');
        return false;
      }

      // Create a report object with TypeScript interface
      interface ReportData {
        latitude: number;
        longitude: number;
        description: string;
        created_at: string;
        image_url?: string;
        audio_url?: string;
      }
      
      const reportData: ReportData = {
        latitude: locationRegion.latitude,
        longitude: locationRegion.longitude,
        description: description || '',
        created_at: new Date().toISOString(),
      };

      // Upload image to Supabase Storage if available
      if (images.length > 0) {
        try {
          const imageUri = images[0];
          const fileExt = imageUri.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `reports/${fileName}`;

          console.log("Uploading image...");
          
          // Convert image to base64
          const base64 = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Upload to Supabase Storage
          const { data: storageData, error: storageError } = await supabase
            .storage
            .from('reports')
            .upload(filePath, decode(base64), {
              contentType: `image/${fileExt}`,
            });

          if (storageError) {
            console.error('Error uploading image:', storageError);
          } else {
            console.log("Image uploaded successfully");
            // Get public URL
            const { data: urlData } = supabase
              .storage
              .from('reports')
              .getPublicUrl(filePath);
            
            reportData.image_url = urlData.publicUrl;
          }
        } catch (imageError) {
          console.error("Error processing image:", imageError);
          // Continue with submission even if image upload fails
        }
      }

      // Upload audio to Supabase Storage if available
      if (audioUri) {
        try {
          const fileExt = 'mp4'; // Default extension for expo-av recordings
          const fileName = `${Date.now()}.${fileExt}`;
          const filePath = `reports/audio/${fileName}`;

          console.log("Uploading audio...");
          
          // Convert audio to base64
          const base64 = await FileSystem.readAsStringAsync(audioUri, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Upload to Supabase Storage
          const { data: storageData, error: storageError } = await supabase
            .storage
            .from('reports')
            .upload(filePath, decode(base64), {
              contentType: 'audio/mp4',
            });

          if (storageError) {
            console.error('Error uploading audio:', storageError);
          } else {
            console.log("Audio uploaded successfully");
            // Get public URL
            const { data: urlData } = supabase
              .storage
              .from('reports')
              .getPublicUrl(filePath);
            
            reportData.audio_url = urlData.publicUrl;
          }
        } catch (audioError) {
          console.error("Error processing audio:", audioError);
          // Continue with submission even if audio upload fails
        }
      }

      console.log("Inserting report data:", reportData);
      
      // Insert report data into Supabase
      const { data, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select();

      if (error) {
        console.error('Error inserting report:', error);
        alert('Failed to submit report: ' + error.message);
        return false; // Return false to indicate submission failed
      } else {
        console.log('Report submitted successfully:', data);
        alert('Report submitted successfully!');
        return true; // Return true to indicate submission succeeded
      }
    } catch (e) {
      console.error("Error submitting report: ", e);
      alert('An error occurred while submitting the report');
      return false; // Return false to indicate submission failed
    }
  };

  // Function to handle submission and navigation
  const handleSubmitAndNavigate = async () => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    try {
      const success = await handleSubmit();
      if (success) {
        // Clear form data after successful submission
        setDescription("");
        setImages([]);
        setAudioUri(null);
        
        // Show success message and let user navigate manually
        alert('Report submitted successfully! You can now view all reports in the Police Report tab.');
      }
    } catch (error) {
      console.error("Error in handleSubmitAndNavigate:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Improved decode function for binary data conversion
  const decode = (base64: string) => {
    try {
      // For React Native environment
      if (Platform.OS === 'web' && typeof atob === 'function') {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      } 
      // For React Native on mobile
      else if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // Use FileSystem's base64 decoding
        return base64;
      }
      // Fallback for other environments
      else {
        console.log('Using fallback decode method');
        try {
          const rawData = Buffer.from(base64, 'base64');
          return new Uint8Array(rawData);
        } catch (bufferError) {
          console.error('Buffer fallback failed:', bufferError);
          return base64; // Return the original base64 string as a last resort
        }
      }
    } catch (error) {
      console.error('Error decoding base64:', error);
      // Return the original base64 string as a fallback
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
              <Link href="/PoliceReport" asChild>
                <TouchableOpacity className="mb-6 bg-orange-400 p-3 rounded-xl shadow-sm flex-row justify-center items-center">
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