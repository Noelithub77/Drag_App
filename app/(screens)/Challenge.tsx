import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import '../../global.css';

const Challenge = () => {
  const challengeData = [
    {
      "id": 1,
      "dayNumber": 1,
      "tasks": [
        "Walk for 15 minutes outdoors.",
        "Drink 2 liters of water.",
        "Write down 3 reasons why you want to recover."
      ]
    },
    {
      "id": 2,
      "dayNumber": 2,
      "tasks": [
        "Meditate for 10 minutes using a guided meditation.",
        "Eat a healthy, home-cooked meal.",
        "Avoid social media for 2 hours before bedtime."
      ]
    },
    {
      "id": 3,
      "dayNumber": 3,
      "tasks": [
        "Do 20 squats or light exercise.",
        "Call or message a loved one and talk for 10 minutes.",
        "Save ₹50 or $1 for a future goal."
      ]
    },
    {
      "id": 4,
      "dayNumber": 4,
      "tasks": [
        "Spend 15 minutes journaling your thoughts and feelings.",
        "Listen to calming music or binaural beats for 10 minutes.",
        "Take a 5-minute break every hour while working or studying."
      ]
    },
    {
      "id": 5,
      "dayNumber": 5,
      "tasks": [
        "Practice deep breathing for 5 minutes (inhale 4 seconds, hold 7 seconds, exhale 8 seconds).",
        "Plan a healthy meal for tomorrow.",
        "Spend 20 minutes organizing a small area of your home."
      ]
    },
    {
      "id": 6,
      "dayNumber": 6,
      "tasks": [
        "Read 5 pages of a self-help or motivational book.",
        "Avoid processed sugar for the day.",
        "Watch a short motivational video or TED talk."
      ]
    },
    {
      "id": 7,
      "dayNumber": 7,
      "tasks": [
        "Write down 3 things you’re grateful for today.",
        "Spend 10 minutes in nature (e.g., park, garden).",
        "Practice saying 'no' to a small, unhealthy temptation."
      ]
    },
    {
      "id": 8,
      "dayNumber": 8,
      "tasks": [
        "Do 10 minutes of yoga or stretching.",
        "Write a letter to your future self about your recovery goals.",
        "Volunteer for a small act of kindness (e.g., help someone or donate)."
      ]
    },
    {
      "id": 9,
      "dayNumber": 9,
      "tasks": [
        "Visualize your life 1 year from now if you stay drug-free.",
        "Avoid caffeine or energy drinks for the day.",
        "Try a creative activity (e.g., drawing, cooking, or writing)."
      ]
    },
    {
      "id": 10,
      "dayNumber": 10,
      "tasks": [
        "Reflect on your progress and write down 5 positive changes you’ve noticed.",
        "Share your journey with someone you trust.",
        "Celebrate your 10-day streak with a non-material reward (e.g., a relaxing bath or a favorite activity)."
      ]
    }
  ]
  

  const [selectedDay, setSelectedDay] = useState(1);
  const [taskCount, setTaskCount] = useState(0);
  const [buttonText, setButtonText] = useState("Complete one task");
  const [isLocked, setIsLocked] = useState(false);

  const getCurrentDay = () => {
    const startDate = new Date("2025-19-01");
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    const checkTaskCount = async () => {
      const count = await AsyncStorage.getItem(`challenge_day_${selectedDay}_taskCount`);
      const parsedCount = count ? parseInt(count, 10) : 0;
      setTaskCount(parsedCount);
      setButtonText(parsedCount >= 3 ? "Completed" : `${parsedCount}/3 Complete one task`);
      setIsLocked(selectedDay !== 1);
    };
    checkTaskCount();
  }, [selectedDay]);

  const getCurrentChallenge = () => {
    return (
      challengeData.find((challenge) => challenge.dayNumber === selectedDay) || challengeData[0]
    );
  };

  const handleCompleteTask = async () => {
    if (isLocked) return;
    
    const newTaskCount = taskCount + 1;
    await AsyncStorage.setItem(`challenge_day_${selectedDay}_taskCount`, newTaskCount.toString());
    setTaskCount(newTaskCount);
    setButtonText(newTaskCount >= 3 ? "Completed" : `${newTaskCount}/3 Complete one task`);
  };

  const handleClearData = async () => {
    for (let day = 1; day <= 30; day++) {
      await AsyncStorage.removeItem(`challenge_day_${day}_taskCount`);
    }
    setSelectedDay(1);
    setTaskCount(0);
    setButtonText("Complete one task");
    setIsLocked(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Challenge" }} />

      <View className="flex-1 p-4 bg-gray-50">
        {/* Challenge Header */}
        <View className="bg-orange-100 p-4 rounded-lg mb-6">
          <Text className="text-xl font-bold text-gray-800">
            Challenge Day {getCurrentChallenge().dayNumber}
          </Text>
          <View className="mt-2">
            {getCurrentChallenge().tasks.map((task, index) => (
              <View key={index} className="flex-row items-center mb-1">
                <View className="w-2 h-2 bg-gray-300 rounded-full mr-2" />
                <Text className="text-lg text-gray-600">{task}</Text>
              </View>
            ))}
          </View>
          {/* Action Button */}
          <TouchableOpacity
            className={`py-2 px-6 rounded-lg mt-4 ${isLocked || taskCount >= 3 ? "bg-gray-400" : "bg-orange-500"}`}
            onPress={handleCompleteTask}
            disabled={isLocked || taskCount >= 3}
          >
            <Text className="text-white text-lg">{isLocked ? "Locked" : buttonText}</Text>
          </TouchableOpacity>
          {/* Clear Data Button */}
          <TouchableOpacity
            className="py-2 px-6 rounded-lg mt-4 bg-red-500"
            onPress={handleClearData}
          >
            <Text className="text-white text-lg">Clear Data</Text>
          </TouchableOpacity>
        </View>

        {/* Timeline */}
        <ScrollView
          className="ml-4"
          contentContainerStyle={{ flexDirection: "column-reverse" }}
        >
          {Array.from({ length: 30 }, (_, i) => {
            const day = 30 - i;
            const isSelected = day === selectedDay;
            const color = isSelected ? "bg-orange-400" : "bg-gray-300";

            return (
              <TouchableOpacity
                key={i}
                onPress={async () => {
                  setSelectedDay(day);
                  const count = await AsyncStorage.getItem(`challenge_day_${day}_taskCount`);
                  const parsedCount = count ? parseInt(count, 10) : 0;
                  setTaskCount(parsedCount);
                  setIsLocked(day !== 1);
                  setButtonText(parsedCount >= 3 ? "Completed" : `${parsedCount}/3 Complete one task`);
                }}
                className="flex-row items-center mb-8"
              >
                <View className="flex-col-reverse items-center my-3 ml-6">
                  <View className="w-2.5 h-2.5 bg-gray-300 rounded-full mb-2 ml-4 mt-10" />
                  <View
                    className={`justify-center items-center shadow-md z-10 ${color} 
                    ${isSelected ? "w-14 h-14" : "w-12 h-12"} rounded-full ml-4
                    ${isSelected ? "border-4 border-orange-200" : ""}`}
                  >
                    <Text
                      className={`text-white ${isSelected ? "text-4xl" : "text-2xl"}`}
                    >
                      ★
                    </Text>
                  </View>
                </View>
                <View className="ml-6 flex-row items-center">
                  <Text
                    className={`font-medium text-lg ${
                      isSelected ? "text-orange-500" : "text-gray-600"
                    }`}
                  >
                    DAY {day}
                  </Text>
                  {isSelected && (
                    <View className="ml-4 relative">
                      <Image
                        source={require("../../assets/icons/draigon.png")}
                        className="w-16 h-16"
                      />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </>
  );
};

export default Challenge;