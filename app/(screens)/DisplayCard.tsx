import React from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import '../../global.css';

const DisplayCard = () => {
  const { image: imageUri, title, description, category, form, contraindications, sideEffects, law, punishments } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: "Encyclopedia" }} />
      <ScrollView className="flex-1 bg-white px-6 py-6">

        {/* Drug Name */}
        <Text className="text-3xl font-bold text-black mb-4">{title}</Text>
        <Text className="text-lg text-gray-600 mb-4">{description}</Text>

        {/* Image */}
        <View className="bg-green-50 rounded-lg p-6 items-center mb-4">
          <Image source={{ uri: Array.isArray(imageUri) ? imageUri[0] : imageUri }} className="w-40 h-40 object-contain" />
        </View>

        {/* Details */}
        <View className="flex-row justify-between mb-4">
          <View className="flex-1 bg-blue-100 rounded-lg p-6 mx-2">
        <Image source={require('../../assets/icons/categoryicon.png')} className="w-6 h-6 mb-2" />
        <Text className="text-base text-gray-600">Category</Text>
        <Text className="text-lg font-bold text-black">{category}</Text>
          </View>
          <View className="flex-1 bg-purple-100 rounded-lg p-6 mx-2">
        <Image source={require('../../assets/icons/drugicon.png')} className="w-6 h-6 mb-2" />
        <Text className="text-base text-gray-600">Form</Text>
        <Text className="text-lg font-bold text-black">{form}</Text>
          </View>
        </View>

        {/* Contraindications */}
        <View className="bg-yellow-100 rounded-lg p-6 mb-4">
          <Image source={require('../../assets/icons/blockicon.png')} className="w-6 h-6 mb-2" />
          <Text className="text-xl font-bold text-black mb-4">Reasons to Quit</Text>
          {typeof contraindications === 'string' && contraindications.split(",").map((item, index) => (
        <Text key={index} className="text-lg text-red-600">• {item.trim()}</Text>
          ))}
        </View>

        {/* Common Side Effects */}
        <View className="bg-red-100 rounded-lg p-6 mb-4">
          <Text className="text-xl font-bold text-black mb-4">Common Side Effects</Text>
          <View className="flex-row flex-wrap">
        {typeof sideEffects === 'string' && sideEffects.split(",").map((item, index) => (
          <Text key={index} className="w-1/2 text-lg text-black">• {item.trim()}</Text>
        ))}
          </View>
        </View>

        {/* Laws and Punishments under NDPS Act */}
        <View className="bg-green-200 rounded-lg p-6 mb-4">
          <Text className="text-xl font-bold text-black mb-4">Laws and Punishments under NDPS Act</Text>
          <Text className="text-xl font-medium text-black mb-4">Relavent Sections</Text>
          <View className="flex-row flex-wrap">
            <Text className="w-full text-lg text-black mb-2">{law}</Text>
            <Text className="text-xl font-medium text-black my-4">Punishments</Text>
            {typeof punishments === 'string' && punishments.split("#").map((item, index) => (
              <Text key={index} className="w-full text-lg text-black mb-2">{item.trim()}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
};

export default DisplayCard;
