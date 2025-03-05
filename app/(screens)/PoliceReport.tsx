import React, { useState, useEffect, useCallback, useMemo } from "react";
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

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

const MapPreview = React.memo(({ recentReports }: { recentReports: ReportLocation[] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [region, setRegion] = useState<Region | null>(null);

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
        const cacheTimestamp = await AsyncStorage.getItem('locationCacheTimestamp');
        
        const isCacheValid = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < CACHE_EXPIRY;

        if (cachedLocation && cachedRegion && isCacheValid) {
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

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced // Use balanced accuracy for better performance
        });
        
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0005,
          longitudeDelta: 0.0005,
        };
        
        setRegion(newRegion);

        await Promise.all([
          AsyncStorage.setItem('cachedLocation', JSON.stringify(location)),
          AsyncStorage.setItem('cachedRegion', JSON.stringify(newRegion)),
          AsyncStorage.setItem('locationCacheTimestamp', Date.now().toString())
        ]);
      } catch (error) {
        console.error('Error fetching location:', error);
        setErrorMsg('Could not fetch location');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const heatmapPoints = useMemo(() => {
    return recentReports.map((report: ReportLocation) => ({
      latitude: report.coordinates.latitude,
      longitude: report.coordinates.longitude,
      weight: 1,
    }));
  }, [recentReports]);

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
        width: Dimensions.get('window').width,
        height: '100%',
      }}
      provider={Platform.OS === 'ios' || Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      showsUserLocation={true}
      showsMyLocationButton={true}
      initialRegion={region}
      region={region}
      onRegionChangeComplete={setRegion}
    >
      {recentReports.length > 0 && (
        <Heatmap
          points={heatmapPoints}
          radius={50}
          opacity={0.7}
          gradient={{
            colors: ["#00ff00", "#ff0000"],
            startPoints: [0.2, 0.8],
            colorMapSize: 2000
          }}
        />
      )}
    </MapView>
  );
});

const ReportCard = React.memo(({ report }: { report: ReportLocation }) => (
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
));

const StatisticCard = React.memo(({ value, label }: { value: number; label: string }) => (
  <View className="items-center">
    <View className="w-16 h-16 rounded-full bg-orange-400 items-center justify-center shadow-lg">
      <Text className="text-white text-xl font-bold">
        {value}
      </Text>
    </View>
    <Text className="mt-1 text-gray-600">{label}</Text>
  </View>
));

const PoliceReport: React.FC = () => {
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
      const cachedReports = await AsyncStorage.getItem('cachedReports');
      const cacheTimestamp = await AsyncStorage.getItem('reportsCacheTimestamp');
      
      const isCacheValid = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < CACHE_EXPIRY;

      if (cachedReports && isCacheValid && !isRefreshing) {
        const parsedReports = JSON.parse(cachedReports);
        setRecentReports(parsedReports);
        setStatistics({
          drugs: Math.floor(parsedReports.length * 0.4),
          cases: Math.floor(parsedReports.length * 0.3),
          reports: parsedReports.length,
        });
        return;
      }

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      if (data) {
        const reports: ReportLocation[] = data.map((report: any) => ({
          id: report.id || `report-${Date.now()}-${Math.random()}`,
          title: report.description || 'No title',
          location: `Lat: ${report.latitude}, Lon: ${report.longitude}`,
          icon: "📍",
          coordinates: {
            latitude: parseFloat(report.latitude) || 0,
            longitude: parseFloat(report.longitude) || 0,
          },
          imageUrl: report.image_url || '',
        }));
        
        setRecentReports(reports);
        setStatistics({
          drugs: Math.floor(reports.length * 0.4),
          cases: Math.floor(reports.length * 0.3),
          reports: reports.length,
        });

        await Promise.all([
          AsyncStorage.setItem('cachedReports', JSON.stringify(reports)),
          AsyncStorage.setItem('reportsCacheTimestamp', Date.now().toString())
        ]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  }, [isRefreshing]);

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
        await fetchReports();
      } catch (error) {
        console.error('Error in PoliceReport useEffect:', error);
        setErrorMsg('Could not fetch reports');
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

  return (
    <>
      <Stack.Screen options={{ title: "Police Report" }} />
      <View className="flex-1 bg-gray-50">
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

        <View className="mx-4 mb-4 bg-white rounded-xl shadow-sm overflow-hidden">
          <Text className="p-3 text-lg font-semibold">Heatmap</Text>
          <Text className="px-3 pb-3 text-sm text-gray-600">
            {recentReports.length > 0 
              ? `Showing heat map of ${recentReports.length} reports in your area.` 
              : "No reports available in your area yet."}
          </Text>
        </View>

        <View style={{ height: 300, marginBottom: 24 }}>
          <MapPreview recentReports={recentReports} />
        </View>

        <View className="flex-row justify-around mx-4 mb-4">
          <StatisticCard value={statistics.drugs} label="drugs" />
          <StatisticCard value={statistics.cases} label="cases" />
          <StatisticCard value={statistics.reports} label="reports" />
        </View>

        <View className="flex-1 p-4">
          <Text className="text-lg font-semibold mb-3">Recent Reports</Text>
          <ScrollView className="flex-1">
            {recentReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </ScrollView>
        </View>
      </View>
    </>
  );
};

export default PoliceReport;
