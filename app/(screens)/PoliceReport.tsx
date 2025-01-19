import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Platform, Image } from "react-native";
import { MapPin, Settings } from "lucide-react-native";
import { Stack } from "expo-router";
import MapView, { Heatmap, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

interface ReportLocation {
  id: string;
  title: string;
  location: string;
  icon: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  imageUrl: string;
}

interface Statistics {
  drugs: number;
  cases: number;
  reports: number;
}

const MapPreview = ({ recentReports }: { recentReports: ReportLocation[] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const cachedLocation = await AsyncStorage.getItem('cachedLocation');
        const cachedRegion = await AsyncStorage.getItem('cachedRegion');

        if (cachedLocation && cachedRegion) {
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
        width: Dimensions.get('window').width, // Accounting for padding
        height: '100%',
      }}
      provider={PROVIDER_GOOGLE}
      showsUserLocation={true}
      showsMyLocationButton={true}
      initialRegion={region}
      region={region}
      onRegionChangeComplete={(region) => setRegion(region)} // Changed to onRegionChangeComplete for better performance
    >
      <Heatmap
        points={recentReports.map((report: ReportLocation) => ({
          latitude: report.coordinates.latitude,
          longitude: report.coordinates.longitude,
          weight: 1,
        }))}
        radius={50}
        opacity={0.7}
      />
    </MapView>
  );
};

const PoliceReport: React.FC = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<ReportLocation[]>([]);

  const statistics: Statistics = {
    drugs: 17,
    cases: 12,
    reports: 43,
  };

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0005,
          longitudeDelta: 0.0005,
        });

        // Fetch recent reports from Firestore
        const querySnapshot = await getDocs(collection(db, 'reports'));
        const reports: ReportLocation[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.location) {
            reports.push({
              id: doc.id,
              title: data.description || 'No title',
              location: `Lat: ${data.location.latitude}, Lon: ${data.location.longitude}`,
              icon: "📍",
              coordinates: {
                latitude: data.location.latitude,
                longitude: data.location.longitude,
              },
              imageUrl: data.imageUrl || '', // Assuming imageUrl is stored in Firestore
            });
          }
        });
        setRecentReports(reports);
      } catch (error) {
        setErrorMsg('Could not fetch location');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

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
    <>
      <Stack.Screen options={{ title: "Police Report" }} />
      <View className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="flex-row justify-between items-center p-4">
          <Text className="text-2xl font-bold text-gray-800">Reports</Text>
          <TouchableOpacity>
            <Settings className="w-6 h-6 text-gray-600" />
          </TouchableOpacity>
        </View>

        {/* Heatmap Card */}
        <View className="mx-4 mb-4 bg-white rounded-xl shadow-sm overflow-hidden">
          <Text className="p-3 text-lg font-semibold">Heatmap</Text>
        </View>

        {/* Map Preview */}
        <View style={{ height: 200, marginBottom: 24 }}>
          <MapPreview recentReports={recentReports} />
          {/* Map Markers */}
          <View className="absolute top-1/2 left-1/2 -translate-x-2 -translate-y-2">
            <View className="w-4 h-4 bg-orange-400 rounded-full border-2 border-white" />
          </View>
        </View>

        {/* Statistics */}
        <View className="flex-row justify-around mx-4 mb-4">
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-orange-400 items-center justify-center shadow-lg">
              <Text className="text-white text-xl font-bold">
                {statistics.drugs}
              </Text>
            </View>
            <Text className="mt-1 text-gray-600">drugs</Text>
          </View>
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-orange-400 items-center justify-center shadow-lg">
              <Text className="text-white text-xl font-bold">
                {statistics.cases}
              </Text>
            </View>
            <Text className="mt-1 text-gray-600">cases</Text>
          </View>
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-orange-400 items-center justify-center shadow-lg">
              <Text className="text-white text-xl font-bold">
                {statistics.reports}
              </Text>
            </View>
            <Text className="mt-1 text-gray-600">reports</Text>
          </View>
        </View>

        {/* Recent Reports */}
        <View className="flex-1 mx-4">
          <Text className="text-lg font-semibold mb-3">Recent Reports</Text>
          <ScrollView className="flex-1">
            {recentReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                className="flex-row items-center bg-white p-3 rounded-xl mb-3 shadow-sm"
              >
                {report.imageUrl ? (
                  <Image
                    source={{ uri: report.imageUrl }}
                    style={{ width: 50, height: 50, borderRadius: 8, marginRight: 10 }}
                  />
                ) : (
                  <View style={{ width: 50, height: 50, borderRadius: 8, marginRight: 10, backgroundColor: '#ccc' }} />
                )}
                <Text className="text-2xl mr-3">{report.icon}</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-800">
                    {report.title}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {report.location}
                  </Text>
                </View>
                <MapPin className="w-5 h-5 text-gray-400" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

export default PoliceReport;
