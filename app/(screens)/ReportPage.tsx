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

// Import Buffer for base64 decoding
import { Buffer } from 'buffer';

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
    // Camera permissions are required
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], // Use string literal as per latest docs
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    console.log(result);

    if (!result.canceled) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], // Use string literal as per latest docs
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    console.log(result);

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
        staysActiveInBackground: false,
        interruptionModeIOS: 1, // Do not mix with other audio
        interruptionModeAndroid: 1, // Do not mix with other audio
      });

      // Define recording options - always use m4a format for consistency
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          maxDuration: 60 * 5 * 1000, // 5 minutes
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
          maxDuration: 60 * 5 * 1000, // 5 minutes
        },
        web: {
          mimeType: 'audio/mp4',
          bitsPerSecond: 128000,
          maxDuration: 60 * 5 * 1000, // 5 minutes
        },
      };

      console.log(`Starting audio recording with m4a format for ${Platform.OS} platform`);
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(recording);
      
      // Add recording status update listener
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          setAudioDuration(status.durationMillis || 0);
        }
      });
      
      // Start recording status updates
      recording.setProgressUpdateInterval(500); // Update every 500ms
    } catch (err) {
      console.error('Failed to start recording', err);
      alert(`Failed to start recording: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      console.warn('No active recording to stop');
      return;
    }
    
    try {
      console.log('Stopping recording...');
      
      // Stop the recording
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (!uri) {
        console.error('Failed to get URI from recording');
        alert('Failed to save recording. Please try again.');
        return;
      }
      
      setAudioUri(uri);

      try {
        const fileInfo = await FileSystem.getInfoAsync(uri);
        
        // Get audio duration using Sound
        const { sound } = await Audio.Sound.createAsync({ uri });
        const status = await sound.getStatusAsync();
        const durationMillis = status.isLoaded ? status.durationMillis || 0 : 0;
        setAudioDuration(durationMillis);
        
        // Unload the sound to free resources
        await sound.unloadAsync();
        
        // Log detailed information about the audio file
        console.log('Audio recording completed:', {
          uri,
          exists: fileInfo.exists,
          size: fileInfo.exists && 'size' in fileInfo ? `${(fileInfo.size / 1024 / 1024).toFixed(2)} MB` : 'unknown',
          duration: `${(durationMillis / 1000).toFixed(2)} seconds`,
          format: 'm4a', // We're using m4a format consistently
          contentType: 'audio/mp4',
          platform: Platform.OS,
        });
      } catch (error) {
        console.error('Error getting audio file info:', error);
        // Continue anyway since we have the URI
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      alert(`Failed to stop recording: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
          Audio recording (m4a) - {Math.round(audioDuration / 1000)}s
        </Text>
      </View>
    );
  };

  const handleRegionChange = (region: Region) => {
    setReportRegion(region);
  };

  const detectMimeType = (base64Data: string): string | null => {
    try {
      if (!base64Data || base64Data.length < 8) {
        return null;
      }

      // Check the first few bytes of the file to determine its type
      // This is a more robust implementation checking more signatures
      
      // JPEG starts with /9j/
      if (base64Data.startsWith('/9j/')) {
        return 'image/jpeg';
      }
      
      // PNG starts with iVBORw0KGgo
      if (base64Data.startsWith('iVBORw0KGgo')) {
        return 'image/png';
      }
      
      // GIF starts with R0lGODlh or R0lGODdh
      if (base64Data.startsWith('R0lGODlh') || base64Data.startsWith('R0lGODdh')) {
        return 'image/gif';
      }
      
      // WebP starts with UklGRl
      if (base64Data.startsWith('UklGRl')) {
        return 'image/webp';
      }
      
      // HEIC often starts with AAAA
      if (base64Data.startsWith('AAAA') && !base64Data.includes('ftyp')) {
        return 'image/heic';
      }
      
      // MP3 often starts with ID3 (SUQz)
      if (base64Data.startsWith('SUQz') || base64Data.startsWith('ID3')) {
        return 'audio/mpeg';
      }
      
      // AAC/M4A often starts with AAAA and contains ftyp
      if (base64Data.startsWith('AAAA') && base64Data.includes('ftyp')) {
        return 'audio/mp4';
      }
      
      // WAV starts with UklGRg or contains WAVE
      if (base64Data.startsWith('UklGRg') || base64Data.includes('WAVE')) {
        return 'audio/wav';
      }
      
      // OGG starts with T2dn
      if (base64Data.startsWith('T2dn')) {
        return 'audio/ogg';
      }
      
      // FLAC starts with ZkxhQw
      if (base64Data.startsWith('ZkxhQw')) {
        return 'audio/flac';
      }
      
      // If we can't determine the type, return null
      return null;
    } catch (error) {
      console.error('Error detecting MIME type:', error);
      return null;
    }
  };

  const processAndUploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      console.log('Processing image URI:', imageUri);

      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }

      // Read file as base64 string first to detect actual type
      const base64Data = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Detect MIME type from base64 header
      let detectedContentType = detectMimeType(base64Data); // Use the helper function

      // Determine file extension and final content type
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${Date.now()}.${fileExt}`;

      // Use detected type if available, otherwise fallback to extension-based
      const contentType = detectedContentType || (fileExt === 'png' ? 'image/png' : 'image/jpeg');

      console.log(`Uploading image: ${fileName} (Detected: ${detectedContentType || 'N/A'}, Using: ${contentType})`);

      // Decode base64 to ArrayBuffer
      const arrayBuffer = Buffer.from(base64Data, 'base64');

      // Upload ArrayBuffer
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('reports')
        .upload(fileName, arrayBuffer, {
          contentType, // Use the potentially more accurate content type
          upsert: true
        });

      if (storageError) {
        console.error('Storage error:', storageError);
        throw new Error(`Storage error: ${storageError.message}`);
      }

      console.log('Image upload successful:', storageData);

      const { data: urlData } = supabase
        .storage
        .from('reports')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error processing image:', error);
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const processAndUploadAudio = async (audioUri: string): Promise<string | null> => {
    try {
      console.log('Processing audio URI:', audioUri);

      const fileInfo = await FileSystem.getInfoAsync(audioUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file does not exist');
      }

      // Read file as base64 string first
      const base64Data = await FileSystem.readAsStringAsync(audioUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Decode base64 to ArrayBuffer
      const arrayBuffer = Buffer.from(base64Data, 'base64');

      // For audio, we stick to the known output format from expo-av
      const fileExt = 'm4a';
      const contentType = 'audio/mp4'; // Consistent type for m4a
      const fileName = `${Date.now()}.${fileExt}`;

      console.log(`Uploading audio: ${fileName} (${contentType})`);

      // Upload ArrayBuffer
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('reports')
        .upload(fileName, arrayBuffer, {
          contentType, // Use the consistent audio content type
          upsert: true
        });

      if (storageError) {
        console.error('Storage error:', storageError);
        throw new Error(`Storage error: ${storageError.message}`);
      }

      console.log('Audio upload successful:', storageData);

      const { data: urlData } = supabase
        .storage
        .from('reports')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error processing audio:', error);
      alert(`Failed to upload audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
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