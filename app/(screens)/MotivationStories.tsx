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

const MotivationStories: React.FC = () => {
  const storyContent: StoryContent = {
    "title": "Motivational Stories",
    "subtitle": "Inspiring Journeys of Recovery",
    "introduction": "These stories highlight the incredible journeys of individuals who have overcome addiction and found new purpose in life.",
    "sections": [
      {
        "heading": "From Despair to Hope: John’s Triumph Over Addiction",
        "content": "John’s life seemed to be falling apart as he battled with substance abuse. For years, he felt trapped in a cycle of addiction, losing friends, jobs, and his sense of self-worth. But one day, John hit rock bottom and realized that he had to make a change. With the support of his family and a strong determination to rebuild his life, John entered rehab and began the long road to recovery. Today, John is living proof that it’s never too late to turn your life around. He’s now an advocate for addiction recovery, sharing his story to inspire others to never give up."
      },
      {
        "heading": "Breaking Free: Emily’s Story of Overcoming Heroin Addiction",
        "content": "Emily’s addiction to heroin started when she was just 18. What began as a way to cope with emotional pain quickly spiraled into a life-threatening dependency. For years, she felt trapped, constantly battling cravings and the fear of losing everything. But Emily refused to give up. After several failed attempts at recovery, she finally found a support group that helped her understand the root of her addiction. Through therapy, hard work, and the unwavering support of her loved ones, Emily broke free from the chains of addiction. Today, she is sober and uses her experience to help others struggling with similar battles."
      },
      {
        "heading": "A New Beginning: Mark’s Fight Against Alcoholism",
        "content": "Mark’s story is one of courage and redemption. For years, he struggled with alcoholism, losing his job, his family, and his self-respect. But Mark knew that if he didn’t change, he would lose everything. With the help of a local recovery center and a supportive network of friends and family, Mark took the first step toward sobriety. Through hard work, self-reflection, and the support of others, Mark was able to turn his life around. He now works as a counselor, helping others who are battling addiction, and has found a sense of purpose he never thought possible."
      },
      {
        "heading": "From Addiction to Advocacy: Sarah’s Road to Recovery",
        "content": "Sarah’s journey through addiction was a painful one. After years of struggling with prescription drug abuse, she lost her job and nearly lost her family. But through therapy, support groups, and a deep desire to change, Sarah found the strength to reclaim her life. Today, Sarah is a passionate advocate for drug addiction recovery, working with local organizations to help others who are in the grips of addiction. She shares her story openly, hoping to inspire others to seek help and make the changes they need to live a better life."
      }
    ]
  }

  return (
    <>
      <Stack.Screen options={{ title: "Community" }} />
      <ScrollView className="flex-1 bg-white">
      <View className="w-auto h-36 rounded-lg flex-row items-center shadow p-6 pt-4 bg-purple-50 m-4">
          <View className="flex-1">
        <Text
          className="text-lg font-bold text-amber-950 font-serif"
          style={{ fontSize: 26 }}
        >
          Motivational Stories
        </Text>
        <Text
          className="text-md text-amber-950 font-sans pt-2"
          style={{ fontSize: 16 }}
        >
          Every Step Counts:
        </Text>
        <Text
          className="text-md text-amber-950 font-sans pt-0"
          style={{ fontSize: 16 }}
        >
          Celebrating Small Wins on the Recovery Journey
        </Text>
          </View>
          <View className="w-16 h-16 rounded-full justify-center items-center ml-4">
        <Image
          source={require("@/assets/icons/flowerpurple.png")} // Replace with your custom icon
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

export default MotivationStories;
