import React, { useEffect, useState } from "react";
import { View, Text, Image } from "react-native";
import { Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProgressReport = () => {
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const daysInWeek = ["SAT", "MON", "TUE", "WED", "THU", "FRI", "SUN"];
  const totalWeeks = 4; // Example: 4 weeks for a calendar view
  const currentDate = new Date(); // Current date
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const progressPercentage = (completedChallenges / (daysInMonth * 3)) * 100; // Calculate progress percentage

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
    };

    fetchProgress();
  }, []);

  return (
    <>
      <Stack.Screen options={{ title: "Progress Report" }} />
      <View className="flex-1 bg-white p-4">
        {/* Upper Half: Badge Section */}
        <View className="flex items-center mb-4">
          <Image
            source={require("../../assets/icons/shieldgold.png")}
            className="w-40 h-40 mb-2"
          />
        </View>

        {/* Additional Shield Icons */}
        <View className="flex-row justify-center mt-1 mb-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <Image
              key={index}
              source={require("../../assets/icons/shield.png")}
              className="w-16 h-16 mx-0.5"
            />
          ))}
        </View>

        {/* Track Progress Section */}
        <View className="bg-orange-100 rounded-xl p-4 mb-4">
          <Text className="text-xl font-bold mb-2">Track Your Progress</Text>
          <Text className="text-lg text-gray-600 mb-4">
            Every achievement, no matter how small, is a step forward. Keep
            going; we believe in you!
          </Text>

          {/* Progress Bar */}
          <View className="h-10 w-full bg-gray-300 rounded-full overflow-hidden mb-2 relative">
            <View
              className="h-full bg-orange-500 flex items-center justify-center rounded-2xl"
              style={{ width: `${progressPercentage}%` }}
            >
              <Image
                source={require("../../assets/icons/manrunning.png")}
                className="h-6 w-6 absolute right-0 mr-1"
              />
            </View>
            <View className="absolute inset-0 flex items-center justify-center">
              <Text className="text-white font-bold">
                {progressPercentage.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Streak Calendar Section */}
        <View className="mt-4 flex-1 justify-end">
          <View className="flex-row items-center mb-4 border p-6 rounded-2xl bg-white">
            {/* Current Date */}
            <View className="items-center mr-4">
              <Text className="text-6xl font-bold text-black">
                {currentDate.getDate()}
              </Text>
              <Text className="text-sm font-bold text-gray-800">
                {daysInWeek[currentDate.getDay()]}
              </Text>
            </View>

            {/* Calendar */}
            <View className="flex-1 bg-gray-100 rounded-xl p-4">
              {/* Render day labels */}
              <View className="flex-row justify-between mb-2">
                {daysInWeek.map((day, index) => (
                  <Text
                    key={index}
                    className="text-sm font-bold text-gray-600 text-center"
                  >
                    {day}
                  </Text>
                ))}
              </View>

              {/* Render calendar grid */}
              {Array.from({ length: totalWeeks }).map((_, weekIndex) => (
                <View key={weekIndex} className="flex-row justify-between">
                  {Array.from({ length: 7 }).map((_, dayIndex) => {
                    const dayNumber =
                      weekIndex * 7 + dayIndex - firstDayOfMonth + 1;
                    const isCompleted =
                      dayNumber <= currentDate.getDate() && dayNumber > 0;
                    return (
                      <View
                        key={dayIndex}
                        className={`h-4 w-4 rounded-full m-1.5 ${
                          isCompleted ? "bg-yellow-400" : "bg-gray-300"
                        }`}
                      />
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>
    </>
  );
};

export default ProgressReport;
