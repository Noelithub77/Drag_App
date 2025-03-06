import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Link } from 'expo-router';

import "../../global.css";

const VirtualCoachScreen = () => {
  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Main Content */}
        <View className="flex-1 p-4 items-center">
          {/* Robot Icon instead of Image */}
          <View className="w-100 h-100 my-5 justify-center items-center bg-white-200 rounded-full">
            <Image 
              source={require('../../assets/icons/draigon.png')} 
              style={{ width: 150, height: 150, borderRadius: 75 }} 
            />
          </View>

          {/* Description Text */}
          <View className="bg-orange-100 rounded-lg p-4 my-5">
            <Text className="text-gray-700 text-lg leading-6 text-center">
              Take on these carefully designed challenges to strengthen your resolve and build new, positive habits. Complete them to earn rewards, boost your streak, and unlock new milestones in your recovery journey. Every challenge brings you closer to a healthier, happier you!
            </Text>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-center space-x-6 mt-2">
            {/* Challenge Button */}
            <View className="items-center mx-2 bg-orange-200 p-5 rounded-lg" style={{ width: 160 }}>
              <Link
                href={{
                  pathname: "/Challenge",
                }}
                className="bg-orange-200 p-5 rounded-lg items-center"
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/icons/ChallengeIcon.png')} 
                    style={{ width: 32, height: 32, marginBottom: 8 }} 
                  />
                  <Text className="text-gray-800 font-semibold text-lg text-center">
                    Challenge
                  </Text>
                </View>
              </Link>
            </View>
            
            {/* Progress Button */}
            <View className="items-center mx-2 bg-orange-200 p-5 rounded-lg" style={{ width: 160 }}>
              <Link
                href={{
                  pathname: "/ProgressReport",
                }}
                className="bg-orange-200 p-5 rounded-lg items-center"
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/icons/ProgressIcon.png')} 
                    style={{ width: 32, height: 32, marginBottom: 8 }} 
                  />
                  <Text className="text-gray-800 font-semibold text-lg text-center">
                    Progress
                  </Text>
                </View>
              </Link>
            </View>
          </View>

          <View className="flex-row justify-center space-x-6 mt-5">
            {/* Games Button */}
            <View className="items-center mx-2 bg-orange-200 p-5 rounded-lg" style={{ width: 160 }}>
              <Link
                href={{
                  pathname: "/Games",
                }}
                className="bg-orange-200 p-10 rounded-lg items-center"
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/icons/gamesicon.png')} 
                    style={{ width: 32, height: 32, marginBottom: 8 }} 
                  />
                  <Text className="text-gray-800 font-semibold text-lg text-center">
                    Games
                  </Text>
                </View>
              </Link>
            </View>
            
            {/* Coaching Button */}
            <View className="items-center mx-2 bg-orange-200 p-5 rounded-lg" style={{ width: 160 }}>
              <Link
                href={{
                  pathname: "/Coaching",
                }}
                className="bg-orange-200 p-5 rounded-lg items-center"
              >
                <View className="items-center">
                  <Image 
                    source={require('../../assets/icons/coachingicon.png')} 
                    style={{ width: 32, height: 32, marginBottom: 8 }} 
                  />
                  <Text className="text-gray-800 font-semibold text-lg text-center">
                    Coaching
                  </Text>
                </View>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default VirtualCoachScreen;
