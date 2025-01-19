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

const BlogPage: React.FC = () => {
  const storyContent: StoryContent = {
    "title": "Personal Stories",
    "subtitle": "From Darkness to Light: John's Journey to Recovery",
    "introduction": "John was once a promising young man with big dreams, but his life took a dark turn when he fell into the trap of drug addiction. His story is a powerful testament to the strength of the human spirit and the possibility of redemption. What started as casual experimentation with drugs soon spiraled into an all-consuming addiction that nearly cost him everything. But through perseverance, the support of loved ones, and a moment of clarity, John found his way back to a life of hope and purpose.",
    "sections": [
      {
        "heading": "The Descent: A Life in Chaos",
        "content": "It all started when John was in his early twenties. The pressures of life, coupled with a desire to fit in with the wrong crowd, led him to experiment with substances. What began with occasional use of marijuana and alcohol quickly escalated to harder drugs. He was introduced to cocaine by a friend who seemed to have all the answers, and soon after, heroin found its way into his life.\n\nJohn recalls, 'At first, it was just to have fun, to escape from the stress of life. But then, I started needing it. It wasn’t about having fun anymore—it was about surviving the next day.' The addiction took hold of his mind, body, and soul, pulling him deeper into a spiral of self-destruction."
      },
      {
        "heading": "The Influence of Friendship: A Toxic Bond",
        "content": "John’s friends played a significant role in his descent into addiction. They were the ones who introduced him to drugs, and in many ways, they became his family. But as his addiction deepened, so did the toxicity of his friendships. They no longer cared about his well-being, only about getting their next high.\n\n'We were all just lost,' John says. 'We’d meet, get high, and forget about the world. But the moment the high wore off, I felt emptier than before.' His once-strong friendships were now built on the foundation of mutual addiction, and soon, John found himself alone in a crowd of people who didn’t care about him."
      },
      {
        "heading": "The Breaking Point: A Night of Reckoning",
        "content": "John’s lowest point came one fateful night when he found himself in a dark alley, strung out on heroin, feeling completely numb. He had lost his job, his family had stopped speaking to him, and his so-called friends had abandoned him. That night, as he lay on the cold ground, John felt like he had hit rock bottom.\n\n'I had nothing left. I was completely alone, and I didn’t know if I could go on anymore,' he says. 'But in that moment, something inside me clicked. I realized that I had a choice. I could keep going down this path, or I could fight for my life.'"
      },
      {
        "heading": "The Turning Point: Asking for Help",
        "content": "The next morning, John made a decision that would change his life forever. He called his mother, who had been waiting for him to reach out for years. She immediately came to his side, taking him to a rehabilitation center where he began his journey to recovery.\n\n'I didn’t know what to expect,' John recalls. 'I was scared. I didn’t think I could do it. But when I walked through those doors, I knew I had to try.' The first few weeks were the hardest, filled with withdrawal symptoms, cravings, and emotional turmoil. But John stayed committed, determined to turn his life around."
      },
      {
        "heading": "The Power of Support: Finding Strength in Others",
        "content": "During his time in rehab, John met others who were on the same journey. They shared their stories, their struggles, and their victories. For the first time in a long time, John felt understood. He wasn’t alone in his fight.\n\n'I met people who had been through what I was going through, and that made all the difference,' John says. 'We became a family. We supported each other, and that’s what kept me going.' The counselors and staff at the rehab center also played a crucial role in his recovery, helping him confront the root causes of his addiction and teaching him how to rebuild his life from the ground up."
      },
      {
        "heading": "The Road to Recovery: Rebuilding a New Life",
        "content": "The journey to recovery wasn’t easy, but John was determined. He spent months in rehab, working on his physical and mental health, and learning how to live without the crutch of drugs. Slowly but surely, he regained his strength and started to rebuild his life.\n\nJohn found new passions and hobbies, reconnecting with his family and friends who had stuck by him through his darkest days. He enrolled in college, something he had abandoned years ago, and began pursuing a career in counseling, wanting to help others who were struggling with addiction.\n\n'I knew I had to give back,' he says. 'I had been given a second chance at life, and I wasn’t going to waste it.'"
      },
      {
        "heading": "The Victory: A Life Transformed",
        "content": "Today, John is living a life he never thought was possible. He’s clean, happy, and fulfilled. He’s surrounded by a supportive network of friends and family who are proud of the man he has become. He’s now a counselor, helping others who are struggling with addiction, and he’s passionate about making a difference in the lives of those who need it most.\n\nJohn’s story is one of redemption, showing that no matter how far you fall, there’s always a way back. With determination, support, and a belief in oneself, anyone can overcome addiction and build a life they’re proud of."
      }
    ]
  }

  return (
    <>
      <Stack.Screen options={{ title: "Community" }} />
      <ScrollView className="flex-1 bg-white">
      <View className="w-auto h-36 rounded-lg flex-row items-center shadow p-6 pt-4 bg-orange-100 m-4">
          <View className="flex-1">
            <Text
              className="text-lg font-bold text-amber-950 font-serif"
              style={{ fontSize: 26 }}
            >
              Personal Stories
            </Text>
            <Text
              className="text-md text-amber-950 font-sans pt-2"
              style={{ fontSize: 16 }}
            >
              From Darkness to Light:
            </Text>
            <Text
              className="text-md text-amber-950 font-sans pt-0"
              style={{ fontSize: 16 }}
            >
              John's Journey to Recovery
            </Text>
          </View>
          <View className="w-16 h-16 rounded-full justify-center items-center ml-4">
            <Image
              source={require("@/assets/icons/meetup.png")} // Replace with your custom icon
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

export default BlogPage;
