import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { Link } from 'expo-router';

interface Department {
  id: string;
  name: string;
  subtitle: string;
  location: string;
  phone: string;
  avatar?: string;
}

const BinauralBeats: React.FC = () => {
  const departments: Department[] = [
    {
      id: '1',
      name: 'Kottayam Police',
      subtitle: 'Sub Inspector',
      location: 'Kottayam, Kerala',
      phone: '+91 12345 91223',
      avatar: '👮‍♂️'
    },
    {
      id: '2',
      name: 'Narcotics Department',
      subtitle: 'Narcotics Control Bureau',
      location: 'New Delhi',
      phone: '+91-11-26190030',
      avatar: '🏛️'
    },
    {
      id: '3',
      name: 'Psychology',
      subtitle: 'Department of Psychology',
      location: 'Mumbai',
      phone: '+91 98765 43210',
      avatar: '🧠'
    },
    {
      id: '4',
      name: 'Fire Department',
      subtitle: 'Fire and Rescue Services',
      location: 'Chennai, Tamil Nadu',
      phone: '+91 112',
      avatar: '🚒'
    },
    {
      id: '5',
      name: 'Ambulance Service',
      subtitle: 'Emergency Medical Services',
      location: 'Bangalore, Karnataka',
      phone: '108',
      avatar: '🚑'
    }
  ];

  const DepartmentCard: React.FC<{ department: Department }> = ({ department }) => (
    <View className="flex-col items-start p-6 h-auto bg-white rounded-lg mb-3">
      {/* First Section: Avatar, Name, Subtitle */}
      <View className="flex-row items-center mb-2">
        <Text className="text-4xl mr-2">{department.avatar}</Text>
        <View>
          <Text className="font-semibold text-gray-800 text-xl">{department.name}</Text>
          <Text className="text-base text-gray-600">{department.subtitle}</Text>
        </View>
      </View>
      
      {/* Divider */}
      <View className="w-full h-px bg-gray-200 mb-2" />

      {/* Second Section: Location, Phone */}
      <View className="flex-row justify-between w-full mb-2">
        <Text className="text-base text-gray-500 mr-2">{department.location}</Text>
        <Text className="text-base text-gray-500">{department.phone}</Text>
      </View>

      {/* Third Section: Call Button */}
      <View className="items-start">
        <TouchableOpacity
          className="bg-orange-400 rounded-lg px-6 py-2"
          onPress={() => console.log('Call clicked')}
        >
          <View className="flex-row items-center">
            <MaterialIcons name="phone" size={16} color="white" style={{ marginRight: 4 }} />
            <Text className="text-white font-medium">Call</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Emergency" }} />
      
      <ScrollView className="flex-1 bg-orange-50 p-4">
        {/* Header Section */}
        <View className="bg-orange-100 rounded-2xl p-4 mt-4" style={{ height: 170 }}>
          <Text className="font-bold text-brown-800 text-3xl">Upcoming Session</Text>
          <Text className="text-lg text-gray-600 mt-1">
            Sahana's MSc in Clinical Psychology
          </Text>
          <Text className="text-lg text-gray-600">7:30 PM - 8:30 PM</Text>
          
          <TouchableOpacity
            className="flex-row items-center mt-2"
            onPress={() => console.log('Report clicked')}
          >
            <Link href='/ReportPage'>
            <Text className="text-red-500 font-medium text-2xl mt-4">Report Now</Text>
            </Link>
            <Text className="ml-1 bg-red-500 text-white rounded-full w-6 h-6 text-center text-lg">
              !
            </Text>
          </TouchableOpacity>
        </View>

        {/* Category Dropdown */}
        <TouchableOpacity 
          className="flex-row items-center justify-between bg-white rounded-lg p-4 mb-6 mt-4"
          onPress={() => console.log('Category clicked')}
        >
          <Text className="font-medium text-gray-800 text-lg">Category</Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="gray" />
        </TouchableOpacity>

        {/* Department List */}
        <View>
          {departments.map(department => (
            <DepartmentCard key={department.id} department={department} />
          ))}
        </View>
      </ScrollView>
    </>
  );
};

export default BinauralBeats;