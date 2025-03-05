import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Platform, Image } from "react-native";
import { MapPin, Settings, RefreshCw } from "lucide-react-native";
import { Stack } from "expo-router";
import MapView, { Heatmap, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../../supabaseConfig';

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
          setRegion(parsedRegion);
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
        
        setRegion(newRegion);

        await AsyncStorage.setItem('cachedLocation', JSON.stringify(location));
        await AsyncStorage.setItem('cachedRegion', JSON.stringify(newRegion));
      } catch (error) {
        console.error('Error fetching location:', error);
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
      provider={Platform.OS === 'ios' || Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      showsUserLocation={true}
      showsMyLocationButton={true}
      initialRegion={region}
      region={region}
      onRegionChangeComplete={(region) => setRegion(region)} // Changed to onRegionChangeComplete for better performance
    >
      {recentReports && recentReports.length > 0 && (
        <Heatmap
          points={recentReports.map((report: ReportLocation) => ({
            latitude: report.coordinates.latitude,
            longitude: report.coordinates.longitude,
            weight: 1,
          }))}
          radius={50}
          opacity={0.7}
        />
      )}
    </MapView>
  );
};

const PoliceReport: React.FC = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentReports, setRecentReports] = useState<ReportLocation[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    drugs: 0,
    cases: 0,
    reports: 0,
  });

  const fetchReports = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*');
      
      if (error) {
        console.error('Error fetching reports:', error);
        throw new Error('Could not fetch reports');
      }

      if (data && Array.isArray(data)) {
        const reports: ReportLocation[] = data.map((report: any) => ({
          id: report.id || `report-${Date.now()}-${Math.random()}`,
          title: report.description || 'No title',
          location: `Lat: ${report.latitude}, Lon: ${report.longitude}`,
          icon: "📍",
          coordinates: {
            latitude: parseFloat(report.latitude) || 0,
            longitude: parseFloat(report.longitude) || 0,
          },
          imageUrl: report.image_url || '', // Image URL from Supabase Storage
        }));
        
        setRecentReports(reports);
        
        // Update statistics based on actual reports
        setStatistics({
          drugs: Math.floor(reports.length * 0.4), // Example: 40% of reports are drug-related
          cases: Math.floor(reports.length * 0.3), // Example: 30% of reports are cases
          reports: reports.length, // Total number of reports
        });
      } else {
        console.warn('No reports data returned from Supabase or data is not an array');
        setRecentReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }, []);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await fetchReports();
      alert('Reports refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing reports:', error);
      alert('Failed to refresh reports. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

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
        
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0005,
          longitudeDelta: 0.0005,
        };
        
        setRegion(newRegion);

        // Fetch recent reports from Supabase
        try {
          await fetchReports();
        } catch (supabaseError) {
          console.error('Error querying Supabase:', supabaseError);
          setErrorMsg('Failed to fetch reports from the database');
        }
      } catch (error) {
        console.error('Error in PoliceReport useEffect:', error);
        setErrorMsg('Could not fetch location or reports');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [fetchReports]);

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
          <View className="flex-row">
            <TouchableOpacity 
              onPress={handleRefresh} 
              disabled={isRefreshing}
              className="mr-4"
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#FB923C" />
              ) : (
                <RefreshCw size={24} color="#4B5563" />
              )}
            </TouchableOpacity>
            <TouchableOpacity>
              <Settings size={24} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Heatmap Card */}
        <View className="mx-4 mb-4 bg-white rounded-xl shadow-sm overflow-hidden">
          <Text className="p-3 text-lg font-semibold">Heatmap</Text>
          <Text className="px-3 pb-3 text-sm text-gray-600">
            {recentReports.length > 0 
              ? `Showing heat map of ${recentReports.length} reports in your area.` 
              : "No reports available in your area yet."}
          </Text>
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
                <MapPin size={20} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

export default PoliceReport;
