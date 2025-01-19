import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../../global.css";
import { Scroll } from "lucide-react";

export default function Home() {
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const currentDate = new Date();

  useEffect(() => {
    const fetchProgress = async () => {
      let totalCompleted = 0;
      for (let day = 1; day <= currentDate.getDate(); day++) {
        const taskCount = await AsyncStorage.getItem(`challenge_day_${day}_taskCount`);
        if (taskCount) {
          totalCompleted += parseInt(taskCount, 10);
        }
      }
      setCompletedChallenges(totalCompleted);

      const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const percentage = (totalCompleted / (daysInMonth * 3)) * 100; // Assuming 3 tasks per day
      setProgressPercentage(percentage);
    };

    fetchProgress();
    const intervalId = setInterval(fetchProgress, 10000); // Fetch progress every 10 seconds

    return () => clearInterval(intervalId); // Clear interval on component unmount
  }, [currentDate]);

  return (
    <View className="flex-1 bg-white">
      {/* Content Section */}
      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{ flexGrow: 1 }}
      >
        <View className="flex-1 p-4 space-y-4 mt-5">
          {/* New First Card Container */}
          <View className="flex-row space-x-4 h-32 mb-4">
            <View
              className="w-full h-32 rounded-2xl flex-row items-center shadow p-4 bg-slate-200 mb-5"
              style={{ flex: 6 }}
            >
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text
                    className="text-lg text-gray-800 font-serif"
                    style={{ fontSize: 16, flex: 1 }}
                  >
                    "The only way to do great work is to love what you do." -
                    Steve Jobs
                  </Text>
                  <Image
                    source={require("@/assets/icons/quote.png")} // Replace with your quote icon
                    className="w-8 h-8 ml-2"
                    resizeMode="contain"
                  />
                </View>
              </View>
            </View>
            <View
              className="flex-1 justify-center items-center ml-4 h-32 rounded-2xl"
              style={{ flex: 0.5 }}
            >
              <View className="w-full h-full bg-red-400 rounded-full justify-center items-center relative">
                <View
                  className="w-full bg-green-300 rounded-b-full absolute bottom-0"
                  style={{ height: `${progressPercentage}%` }}
                />
                <Text className="text-white text-lg font-bold absolute">
                  {Math.round(progressPercentage)}%
                </Text>
              </View>
            </View>
          </View>

          {/* Parent Tips */}
          <View className="w-full h-50 rounded-lg flex-row items-center shadow p-6 bg-orange-100 mb-5">
            <View className="flex-1">
              <Text
                className="text-lg font-bold text-amber-950 font-serif"
                style={{ fontSize: 24 }}
              >
                Emergency
              </Text>
              <Text
                className="text-md text-amber-950 font-sans"
                style={{ fontSize: 16 }}
              >
                Report any drug-related activities or groups using drugs
                anonymously to the authorities
              </Text>
              <View className="flex-row items-center mt-2 mr-4">
                <Link
                  href={{
                    pathname: "/Helpline",
                  }}
                >
                  <Text
                    className="text-lg text-orange-500 font-sans font-bold"
                    style={{ fontSize: 16 }}
                  >
                    Contact
                  </Text>
                </Link>
                <Image
                  source={require("@/assets/icons/phone.png")} // Replace with your custom icon
                  className="w-10 h-10 ml-2 mt-1"
                  resizeMode="contain"
                />
              </View>
            </View>
            <View className="w-24 h-24 rounded-full justify-center items-center ml-4">
              <Link
                href={{
                  pathname: "/ReportPage",
                }}
              >
                <Image
                  source={require("@/assets/icons/reporticon.png")} // Replace with your custom icon
                  className="w-24 h-24"
                  resizeMode="contain"
                />
              </Link>
            </View>
          </View>

          {/* Motivational Stories */}
          <View className="w-full h-50 rounded-lg flex-row items-center shadow p-6 bg-red-400 mb-5">
            <View className="flex-1">
              <Text
                className="text-lg font-bold text-white font-serif"
                style={{ fontSize: 24 }}
              >
                Events
              </Text>
              <Text
                className="text-md text-white font-sans"
                style={{ fontSize: 16 }}
              >
                Stay informed about all the exciting upcoming events and register easily to participate
              </Text>
              <View className="flex-row items-center mt-2">
                <Link
                  href={{
                    pathname: "/Event",
                  }}
                >
                  <Text
                    className="text-lg text-white font-sans font-bold"
                    style={{ fontSize: 16 }}
                  >
                    Register Now
                  </Text>
                </Link>
                <Image
                  source={require("@/assets/icons/arrow.png")} // Replace with your custom icon
                  className="w-6 h-6 ml-2 mt-2"
                  resizeMode="contain"
                />
              </View>
            </View>
            <View className="w-16 h-16 rounded-full justify-center items-center ml-4 mr-6">
              <Image
                source={require("@/assets/icons/calendericon.png")} // Replace with your custom icon
                className="w-18 h-18 ml-4"
                style={{ tintColor: "white" }}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Motivational Stories */}
          <View className="w-full h-50 rounded-lg flex-row items-center shadow p-6 bg-indigo-300 mb-5">
            <View className="flex-1">
              <Text
                className="text-lg font-bold text-white font-serif"
                style={{ fontSize: 24 }}
              >
                Mood Tracker
              </Text>
              <Text
                className="text-md text-white font-sans"
                style={{ fontSize: 16 }}
              >
                Track your mood to practice mindfullness to improve your
                well-being.
              </Text>
              <View className="flex-row items-center mt-2">
              <Link
                  href={{
                    pathname: "/PersonalAssessment",
                  }}
                >
                <Text
                  className="text-lg text-white font-sans font-bold"
                  style={{ fontSize: 16 }}
                >
                  Track Mood
                </Text>
                </Link>
                <Image
                  source={require("@/assets/icons/arrow.png")} // Replace with your custom icon
                  className="w-6 h-6 ml-2 mt-2"
                  resizeMode="contain"
                />
              </View>
            </View>
            <View className="w-16 h-16 rounded-full justify-center items-center ml-4 mr-6">
              <Image
                source={require("@/assets/icons/smileicon.png")} // Replace with your custom icon
                className="w-18 h-18"
                style={{ tintColor: "white" }}
                resizeMode="contain"
              />
            </View>
          </View>

          <View className="w-full h-50 rounded-lg flex-row items-center shadow p-6 bg-green-300 mb-5">
            <View className="flex-1">
              <Text
                className="text-lg font-bold text-white font-serif"
                style={{ fontSize: 24 }}
              >
                Mindfullness
              </Text>
              <Text
                className="text-md text-white font-sans"
                style={{ fontSize: 16 }}
              >
                Take control of your mental health. Track your mood and practice
                mindfulness
              </Text>
              <View className="flex-row items-center mt-2">
                <Link
                  href={{
                    pathname: "/BinauralBeats",
                  }}
                >
                  <Text
                    className="text-lg text-white font-sans font-bold"
                    style={{ fontSize: 16 }}
                  >
                    Feel the magic
                  </Text>
                  <Image
                    source={require("@/assets/icons/arrow.png")} // Replace with your custom icon
                    className="w-6 h-6 ml-2 mt-2"
                    resizeMode="contain"
                  />
                </Link>
              </View>
            </View>
            <View className="w-16 h-16 justify-center items-center ml-4 mr-8">
              <Image
                source={require("@/assets/icons/flowericon.png")} // Replace with your custom icon
                className="w-18 h-18"
                style={{ tintColor: "white" }}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
