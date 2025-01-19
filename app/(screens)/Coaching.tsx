import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Stack, Link } from "expo-router";

// Coaching Page
interface Chapter {
  id: number;
  title: string;
  subtitle: string;
  questions: string[];
  video: string;
}

const Coaching: React.FC = () => {
  const chapters: Chapter[] = [
    {
      id: 1,
      title: "Chapter 1:",
      subtitle: "Conquering the First Step: Your Fresh Start",
      questions: [
        "Acknowledge the challenge ahead: Understand that starting something new can be difficult, but it’s necessary for growth. Recognizing challenges helps you prepare mentally.",
        "Set clear, small goals to start: Break your goal into smaller tasks to make progress manageable. Achieving these keeps you motivated.",
        "Create a simple routine to follow: A consistent routine builds momentum and keeps you on track. Keep it simple to avoid feeling overwhelmed.",
        "Stay patient and don’t rush progress: Growth takes time, so focus on steady improvement. Trust the process and adapt as needed.",
        "Celebrate every small achievement: Recognize and reward yourself for completing each step. Small wins boost confidence and encourage progress."
      ],
      video: "https://www.youtube.com/watch?v=GxfNq0gIMso"
    },
    {
      id: 2,
      title: "Chapter 2:",
      subtitle: "Building Habits: The Power of Consistency",
      questions: [
        "Start with one habit at a time: Focus on a single habit to avoid overwhelm. Build a strong foundation before adding more.",
        "Make your habit easy and achievable: Start small and practical to ensure success. Simplicity increases consistency.",
        "Track your progress regularly: Monitoring your efforts keeps you accountable. Seeing progress motivates you to continue.",
        "Stay committed, even on tough days: Consistency is key, even when it’s challenging. Push through setbacks to build resilience.",
        "Reward yourself for sticking to it: Celebrate milestones to stay motivated. Rewards reinforce positive behavior."
      ],
      video: "https://www.youtube.com/watch?v=TIwBwyMgS50"
    },
    {
      id: 3,
      title: "Chapter 3:",
      subtitle: "Navigating Friendships: Staying True to Yourself",
      questions: [
        "Be honest and communicate openly: Transparency builds trust and understanding. Honesty strengthens meaningful connections.",
        "Set boundaries to protect your well-being: Healthy boundaries ensure mutual respect. They help you maintain emotional balance.",
        "Surround yourself with supportive people: Positive relationships encourage growth and stability. Avoid negativity that hinders progress.",
        "Stay focused on your goals, avoid distractions: Keep your priorities clear to stay on track. Friends who respect your goals will understand.",
        "Let go of toxic friendships: Toxic relationships drain energy and hinder growth. Prioritize connections that uplift you."
      ],
      video: "https://www.youtube.com/watch?v=-94Ql0UphdA"
    },
    {
      id: 4,
      title: "Chapter 4:",
      subtitle: "Unleashing Confidence: Believe in Your Strength",
      questions: [
        "Recognize and embrace your strengths: Identify what you’re good at and own it. Confidence grows when you focus on your abilities.",
        "Practice positive self-talk every day: Replace negative thoughts with affirmations. Positive words shape a confident mindset.",
        "Take small risks to build courage: Stepping out of your comfort zone boosts confidence. Start small and gradually take bigger steps.",
        "Learn from mistakes, don’t fear them: Mistakes are opportunities to grow and improve. Embrace them as part of the journey.",
        "Celebrate your progress and achievements: Acknowledge how far you’ve come. Celebrating successes reinforces self-belief."
      ],
      video: "https://www.youtube.com/watch?v=w-HYZv6HzAs"
    },
    {
      id: 5,
      title: "Chapter 5:",
      subtitle: "Reclaiming Health: A Journey to Wellness",
      questions: [
        "Start with small, manageable changes: Begin with simple steps like drinking more water. Small changes lead to lasting habits.",
        "Eat a balanced, nutritious diet: Focus on whole foods and moderation. Nutrition fuels both body and mind.",
        "Exercise regularly, even in small amounts: Physical activity boosts energy and mood. Start with activities you enjoy.",
        "Prioritize sleep and relaxation: Rest is essential for recovery and focus. Make relaxation a daily habit.",
        "Make health a daily priority: Treat your well-being as non-negotiable. Consistency is key to sustained health."
      ],
      video: "https://www.youtube.com/watch?v=aXJZgIX1fsg"
    },
    {
      id: 6,
      title: "Chapter 6:",
      subtitle: "Mastering Sleep: The Path to Restful Nights",
      questions: [
        "Set a consistent sleep schedule: Go to bed and wake up at the same time daily. Consistency regulates your body clock.",
        "Create a relaxing bedtime routine: Wind down with calming activities like reading. A routine signals your brain it’s time to sleep.",
        "Limit screen time before bed: Blue light disrupts your sleep cycle. Turn off screens at least an hour before sleeping.",
        "Avoid heavy meals and caffeine late in the day: These can interfere with restful sleep. Opt for lighter, soothing options instead.",
        "Make your sleep environment comfortable: Ensure your bedroom is quiet, dark, and cool. A comfortable space promotes better sleep."
      ],
      video: "https://www.youtube.com/watch?v=nm1TxQj9IsQ"
    }
  ];

  const ChapterCard: React.FC<{ chapter: Chapter }> = ({ chapter }) => (
    <TouchableOpacity className="bg-white rounded-3xl p-4 mb-4 shadow-lg border-2 border-gray-500">
      <Link
        href={{
          pathname: "/AssessmentPage",
          params: {
            id: chapter.id,
            title: chapter.title,
            subtitle: chapter.subtitle,
            questions: JSON.stringify(chapter.questions), // Serialize questions to a string
            video: chapter.video, // Add video link as a parameter
          },
        }}
      >
        <View>
          <Text className="text-gray-900 font-bold text-lg">
            {chapter.title}
          </Text>
          <Text className="text-gray-700 text-lg">{chapter.subtitle}</Text>
        </View>
      </Link>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Assessment" }} />

      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1 px-4 w-full">
          {/* Robot Avatar and Chapters Title */}
          <View className="items-center my-4">
            <Image
              source={require("../../assets/icons/draigon.png")}
              className="w-24 h-24"
              resizeMode="contain"
            />
            <Text className="text-2xl font-bold text-gray-900 mt-2">
              Chapters
            </Text>
          </View>

          {/* Chapters List */}
          <View className="mt-4">
            {chapters.map((chapter) => (
              <ChapterCard key={chapter.id} chapter={chapter} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const StepIndicator: React.FC<{
  currentStep: number;
  totalSteps: number;
  onStepPress: (step: number) => void;
}> = ({ currentStep, totalSteps, onStepPress }) => {
  return (
    <View className="flex-row space-x-4 items-center justify-center my-6">
      {Array.from({ length: totalSteps }, (_, index) => (
        <TouchableOpacity
          key={index + 1}
          onPress={() => onStepPress(index + 1)}
        >
          <View
            className={`w-8 h-8 rounded-full items-center justify-center border-2
              ${
                index + 1 === currentStep
                  ? "border-orange-400"
                  : "border-gray-200"
              }`}
          >
            <Text
              className={`text-base font-medium
                ${
                  index + 1 === currentStep
                    ? "text-orange-400"
                    : "text-gray-600"
                }`}
            >
              {index + 1}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default Coaching;
