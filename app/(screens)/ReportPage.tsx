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

  const processAndUploadImage = async (imageUri: string): Promise<string | null> => {
    try {
      console.log('Processing image URI:', imageUri);
      
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
      
      if (!fileInfo.exists) {
        throw new Error('Image file does not exist');
      }

      if (fileSize === 0) {
        throw new Error('Image file is empty');
      }

      console.log('Image file info:', {
        uri: imageUri,
        size: fileSize,
        modificationTime: 'modificationTime' in fileInfo ? fileInfo.modificationTime : undefined
      });
      
      // Get proper file extension and MIME type
      let fileExt = imageUri.split('.').pop()?.toLowerCase();
      
      // Check if we have a valid extension from the URI
      const validImageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];
      
      // Default to jpg if no valid extension found
      if (!fileExt || !validImageExts.includes(fileExt)) {
        fileExt = 'jpg';
      }
      
      // Determine correct MIME type based on extension
      let contentType = 'image/jpeg';
      if (fileExt === 'png') {
        contentType = 'image/png';
      } else if (fileExt === 'gif') {
        contentType = 'image/gif';
      } else if (fileExt === 'webp') {
        contentType = 'image/webp';
      } else if (fileExt === 'heic' || fileExt === 'heif') {
        contentType = 'image/heic';
      }
      
      // Read a small chunk to detect MIME type from file header
      const headerChunk = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
        length: 1024, // Just need a small sample for header detection
        position: 0,
      });
      
      // Try to detect MIME type from file header
      const detectedMimeType = detectMimeType(headerChunk);
      if (detectedMimeType) {
        contentType = detectedMimeType;
        // Update extension based on detected MIME type
        if (detectedMimeType === 'image/jpeg') {
          fileExt = 'jpg';
        } else if (detectedMimeType === 'image/png') {
          fileExt = 'png';
        } else if (detectedMimeType === 'image/gif') {
          fileExt = 'gif';
        } else if (detectedMimeType === 'image/webp') {
          fileExt = 'webp';
        } else if (detectedMimeType === 'image/heic') {
          fileExt = 'heic';
        }
      }
      
      const fileName = `${Date.now()}.${fileExt}`;
      
      console.log('Image details:', {
        originalUri: imageUri,
        determinedExtension: fileExt,
        contentType: contentType,
        detectedMimeType: detectedMimeType || 'none',
        fileSize: fileSize / 1024 / 1024 + 'MB'
      });
      
      // Read file in chunks to handle large files
      let base64Data: string;
      
      if (fileSize > 5 * 1024 * 1024) { // If larger than 5MB, read in chunks
        console.log('Large image file detected, reading in chunks');
        const chunkSize = 1024 * 1024; // 1MB chunks
        let base64Chunks = '';
        let offset = 0;
        
        while (offset < fileSize) {
          const chunk = await FileSystem.readAsStringAsync(imageUri, {
            encoding: FileSystem.EncodingType.Base64,
            length: Math.min(chunkSize, fileSize - offset),
            position: offset,
          });
          base64Chunks += chunk;
          offset += chunkSize;
          
          // Log progress for large files
          if (offset % (5 * chunkSize) === 0) {
            console.log(`Image upload progress: ${Math.round((offset / fileSize) * 100)}%`);
          }
        }
        base64Data = base64Chunks;
      } else {
        base64Data = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      console.log('Attempting to upload image:', {
        fileName,
        fileSize: fileSize / 1024 / 1024 + 'MB',
        fileType: contentType
      });

      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('reports')
        .upload(fileName, decode(base64Data), {
          contentType: contentType,
          upsert: true
        });

      if (storageError) {
        console.error('Storage error:', storageError);
        console.error('Supabase storage error:', {
          message: storageError.message,
          name: storageError.name,
          stack: storageError.stack
        });
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
      const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

      if (!fileInfo.exists) {
        throw new Error('Audio file does not exist');
      }

      if (fileSize === 0) {
        throw new Error('Audio file is empty');
      }

      console.log('Audio file info:', {
        uri: audioUri,
        size: fileSize,
        modificationTime: 'modificationTime' in fileInfo ? fileInfo.modificationTime : undefined
      });

      // Always use m4a format for consistency
      const fileExt = 'm4a';
      const contentType = 'audio/mp4';
      const fileName = `${Date.now()}.${fileExt}`;

      console.log('Using standardized audio format:', {
        extension: fileExt,
        contentType: contentType
      });

      // For audio, we don't need to read in chunks as they're typically smaller
      // But we'll add a size check just in case
      let base64Data: string;
      
      if (fileSize > 10 * 1024 * 1024) { // If larger than 10MB, read in chunks
        console.log('Large audio file detected, reading in chunks');
        const chunkSize = 1024 * 1024; // 1MB chunks
        let base64Chunks = '';
        let offset = 0;
        
        while (offset < fileSize) {
          const chunk = await FileSystem.readAsStringAsync(audioUri, {
            encoding: FileSystem.EncodingType.Base64,
            length: Math.min(chunkSize, fileSize - offset),
            position: offset,
          });
          base64Chunks += chunk;
          offset += chunkSize;
          
          // Log progress for large files
          if (offset % (5 * chunkSize) === 0) {
            console.log(`Audio upload progress: ${Math.round((offset / fileSize) * 100)}%`);
          }
        }
        base64Data = base64Chunks;
      } else {
        base64Data = await FileSystem.readAsStringAsync(audioUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      console.log('Attempting to upload audio:', {
        fileName,
        fileSize: fileSize / 1024 / 1024 + 'MB',
        fileType: contentType
      });

      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('reports')
        .upload(fileName, decode(base64Data), {
          contentType: contentType,
          upsert: true
        });

      if (storageError) {
        console.error('Supabase storage error:', {
          message: storageError.message,
          name: storageError.name,
          stack: storageError.stack
        });
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

  
  const decode = (base64: string): string | Uint8Array => {
    try {
      if (!base64 || base64.length === 0) {
        console.warn('Empty base64 string provided to decode');
        return new Uint8Array(0);
      }

      if (Platform.OS === 'web' && typeof atob === 'function') {
        try {
          // For web, convert base64 to Uint8Array
          const chunkSize = 1024 * 1024; // Process 1MB at a time to avoid memory issues
          if (base64.length > chunkSize * 2) {
            console.log(`Processing large base64 data in chunks (${(base64.length / (1024 * 1024)).toFixed(2)}MB)`);
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
        } catch (webError) {
          console.error('Error in web decode path:', webError);
          // Fall back to returning the base64 string
          return base64;
        }
      } else if (Platform.OS === 'ios' || Platform.OS === 'android') {
        // For mobile platforms, Supabase can handle the base64 string directly
        return base64;
      } else {
        console.log('Using fallback decode method for platform:', Platform.OS);
        try {
          // Try to use Buffer if available (Node.js environments)
          if (typeof Buffer !== 'undefined') {
            const rawData = Buffer.from(base64, 'base64');
            return new Uint8Array(rawData);
          } else {
            // Last resort fallback
            return base64;
          }
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

  // Helper function to detect MIME type from file header
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