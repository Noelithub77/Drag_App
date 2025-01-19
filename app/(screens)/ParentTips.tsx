import React from "react";
import { View, Text, ScrollView, Image } from "react-native";
import { Stack } from "expo-router";

interface StoryContent {
  title: string;
  subtitle: string;
  introduction: string;
  sections: {
    heading: string;
    content: string;
  }[];  
}

const ParentTips: React.FC = () => {
  const storyContent: StoryContent = {
    "title": "Parent Tips",
    "subtitle": "How to Support Your Child Through Addiction",
    "introduction": "This guide provides essential tips for parents to support their children through addiction recovery.",
    "sections": [
      {
        "heading": "Open Communication is Key",
        "content": "As a parent, it's important to create an environment where your child feels safe to open up. Encourage honest and non-judgmental conversations about their feelings, struggles, and experiences. Let them know you are there to listen and support them without criticism."
      },
      {
        "heading": "Be Aware of the Warning Signs",
        "content": "Look for signs of drug use such as sudden mood swings, withdrawal from family activities, and a decline in academic or social performance. Other indicators include changes in appearance, such as neglecting personal hygiene, or physical symptoms like red eyes or slurred speech."
      },
      {
        "heading": "Set Boundaries and Expectations",
        "content": "Establish clear rules and expectations at home regarding drug use. Make it known that drug use is unacceptable and set consistent consequences for breaking the rules. Boundaries provide structure and show your child that you care about their well-being."
      },
      {
        "heading": "Seek Professional Help When Needed",
        "content": "If you suspect your child is struggling with addiction, it's essential to seek professional help. Therapists, counselors, and addiction specialists can provide the necessary support for both your child and your family. Don't hesitate to reach out for guidance."
      },
      {
        "heading": "Be Supportive During Recovery",
        "content": "Recovery is a long and challenging journey. As a parent, your support can make all the difference. Encourage your child to stay committed to their recovery plan, celebrate their progress, and be patient with setbacks. Show them that they are not alone in this journey."
      }
    ]
  }

  return (
    <>
      <Stack.Screen options={{ title: "Community" }} />
      <ScrollView className="flex-1 bg-white">
      <View className="w-auto h-36 rounded-lg flex-row items-center shadow p-6 pt-4 bg-blue-50 m-4">
          <View className="flex-1">
        <Text
          className="text-lg font-bold text-amber-950 font-serif"
          style={{ fontSize: 26 }}
        >
          Parent Tips
        </Text>
        <Text
          className="text-md text-amber-950 font-sans pt-2"
          style={{ fontSize: 16 }}
        >
          Supporting Your Loved Ones:
        </Text>
        <Text
          className="text-md text-amber-950 font-sans pt-0"
          style={{ fontSize: 16 }}
        >
          A Guide for Parents and Caregivers
        </Text>
          </View>
          <View className="w-16 h-16 rounded-full justify-center items-center ml-4">
        <Image
          source={require("@/assets/icons/parentsicon.png")}
          className="w-18 h-18"
          resizeMode="contain"
        />
          </View>
        </View>

        {/* Sections */}
        {storyContent.sections.map((section, index) => (
          <View key={index} className="p-4 border-b border-gray-300">
            <Text className="text-xl font-semibold mb-2">{section.heading}</Text>
            <Text className="text-lg">{section.content}</Text>
          </View>
        ))}
      </ScrollView>
    </>
  );
};

export default ParentTips;
