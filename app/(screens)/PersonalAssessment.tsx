import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';

const AssessmentPage: React.FC = () => {
    const { id, title, subtitle } = useLocalSearchParams();

    const questions = [
        "What's your age?",
        "Please specify your Drug!",
        "What’s your daily intake drug?",
        "How would you describe your mood?",
        "Have you sought professional help before?"
    ];

    const [answers, setAnswers] = useState<string[]>(Array(questions.length).fill(""));

    const handleInputChange = (text: string, index: number) => {
        const newAnswers = [...answers];
        newAnswers[index] = text;
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        const concatenatedAnswers = answers.join(" ");
        try {
            await AsyncStorage.setItem('assessmentAnswers', concatenatedAnswers);
            alert('Answers saved successfully!');
        } catch (error) {
            console.error('Failed to save answers to local storage', error);
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: "Personal Assessment" }} />

            <SafeAreaView className="flex-1 bg-white">
                <ScrollView>
                    {/* Title */}
                    <View className="px-4 mt-6">
                        <Text className="text-2xl font-bold text-center text-brown-900">
                            {title}
                        </Text>
                    </View>
                    {/* Subtitle */}
                    <View className="px-4 mt-2">
                        {typeof subtitle === 'string' && subtitle.split(":").map((part, index) => (
                            <Text
                                key={index}
                                className={`text-3xl font-semibold text-center text-brown-900 ${index > 0 ? "mt-2" : ""}`}
                            >
                                {index === 0 ? `${part.trim()}:` : part.trim()}
                            </Text>
                        ))}
                    </View>

                    {/* Questions and Inputs */}
                    <View className="flex-1 justify-center items-center mt-8">
                        {questions.map((question, index) => (
                            <View key={index} className="bg-orange-100 rounded-2xl p-6 shadow-sm border-2 border-gray-200 w-11/12 flex items-center justify-center mb-4">
                                <Text className="font-semibold text-xl text-center mb-4">
                                    {question}
                                </Text>
                                <TextInput
                                    className="bg-white border border-gray-300 rounded-lg w-full p-4 text-lg"
                                    value={answers[index]}
                                    onChangeText={(text) => handleInputChange(text, index)}
                                    placeholder="Type your answer here"
                                />
                            </View>
                        ))}
                    </View>

                    {/* Submit Button */}
                    <View className="px-4 mb-6">
                        <TouchableOpacity
                            className="bg-orange-400 rounded-full py-4 px-6"
                            onPress={handleSubmit}
                        >
                            <Text className="text-white text-center text-lg font-medium">
                                Submit
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
};

export default AssessmentPage;
