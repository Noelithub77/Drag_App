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

const DrugPrevention: React.FC = () => {
  const storyContent: StoryContent = {  
    "title": "Drug Prevention and Identification",
    "subtitle": "Understanding and Preventing Drug Abuse",
    "introduction": "This story aims to educate and inform about the dangers of drug abuse and how to prevent it.",
    "sections": [
      {
        "heading": "Educating Youth on the Dangers of Drug Abuse",
        "content": "The best way to prevent drug abuse is through education. By teaching children and teenagers about the dangers of drugs, we can help them make informed decisions. Parents, teachers, and community leaders should talk openly about the risks of drug use, provide resources for support, and encourage healthy habits. Early intervention is key to preventing substance abuse before it starts."
      },
      {
        "heading": "Creating a Supportive Environment",
        "content": "A supportive environment is crucial in preventing drug abuse. Families, schools, and communities should foster open communication, encourage positive activities, and provide emotional support. By creating a space where individuals feel valued and understood, we can reduce the likelihood of turning to drugs as a coping mechanism."
      },
      {
        "heading": "Teaching Healthy Coping Mechanisms",
        "content": "Teaching young people how to handle stress, anxiety, and other emotional challenges without resorting to drugs is essential for prevention. Activities like sports, art, mindfulness, and talking to a trusted adult can help individuals develop healthier coping strategies."
      },
      {
        "heading": "Peer Pressure Resistance",
        "content": "One of the most common reasons people try drugs is peer pressure. By teaching individuals how to say no confidently, we can help them resist negative influences. Role-playing scenarios and discussions on peer pressure can empower young people to make the right decisions."
      },
      {
        "heading": "Identifying the Signs of Drug Abuse",
        "content": "Recognizing the early signs of drug abuse can help prevent further harm. Common signs include changes in behavior, mood swings, physical appearance, and academic performance. Individuals may become withdrawn, lose interest in hobbies, or have trouble concentrating. It’s important to be observant and address these changes early to offer support and seek professional help."
      },
      {
        "heading": "Physical Symptoms of Drug Use",
        "content": "Drug use can cause a variety of physical symptoms, depending on the substance. Common signs include bloodshot eyes, frequent nosebleeds, weight loss or gain, poor hygiene, and unusual body odors. Sudden changes in sleep patterns, such as excessive drowsiness or insomnia, can also indicate drug use."
      },
      {
        "heading": "Behavioral Indicators of Drug Abuse",
        "content": "Behavioral changes are often the first noticeable signs of drug abuse. These can include increased secrecy, mood swings, neglect of responsibilities, irritability, and sudden withdrawal from family and friends. Individuals may also exhibit erratic behavior or engage in risky activities that they would not have done before."
      },
      {
        "heading": "How to Approach Someone You Suspect is Using Drugs",
        "content": "If you suspect someone is using drugs, approach them with care and compassion. Express concern without judgment, and listen to their side of the story. It’s important to be supportive and non-confrontational, as this can open the door to a conversation about seeking help and getting professional treatment."
      }
    ]
  }
  return (
    <>
      <Stack.Screen options={{ title: "Community" }} />
      <ScrollView className="flex-1 bg-white">
      <View className="w-auto h-36 rounded-lg flex-row items-center shadow p-6 pt-4 bg-green-50 m-4">
          <View className="flex-1">
            <Text
              className="text-lg font-bold text-amber-950 font-serif"
              style={{ fontSize: 26 }}
            >
              Drug Prevention and Identification
            </Text>
            <Text 
              className="text-md text-amber-950 font-sans pt-0"
              style={{ fontSize: 16 }}
            >
              Know the Signs: Identifying Commonly Abused Substances
            </Text>
          </View>
          <View className="w-16 h-16 rounded-full justify-center items-center ml-4">
            <Image
              source={require("@/assets/icons/findpeople.png")} // Replace with your custom icon
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

export default DrugPrevention;
