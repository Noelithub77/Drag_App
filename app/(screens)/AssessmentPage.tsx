import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Stack } from "expo-router";

const StepIndicator: React.FC<{
    currentStep: number;
    totalSteps: number;
    onStepPress: (step: number) => void;
}> = ({ currentStep, totalSteps, onStepPress }) => {
    return (
        <View className="flex-row space-x-6 items-center justify-center my-4">
            {Array.from({ length: totalSteps }, (_, index) => (
                <TouchableOpacity
                    key={index + 1}
                    onPress={() => onStepPress(index + 1)}
                >
                    <View
                        className={`w-16 h-16 m-3 rounded-full items-center justify-center border-2 ${
                            index + 1 === currentStep
                                ? "bg-orange-400 border-orange-200"
                                : "border-gray-200"
                        }`}
                    >
                        <Text
                            className={`text-base font-medium ${
                                index + 1 === currentStep ? "text-white" : "text-gray-600"
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

const AssessmentPage: React.FC = () => {
    const { id, title, subtitle, questions, video } = useLocalSearchParams();

    // Safely parse the `questions` parameter
    let parsedQuestions: string[] = [];
    try {
        parsedQuestions = questions ? JSON.parse(questions as string) : [];
    } catch (error) {
        console.error("Error parsing questions:", error);
    }

    const [currentStep, setCurrentStep] = useState(1);

    const handleStepPress = (step: number) => {
        setCurrentStep(step);
    };

    const handleWatchVideoPress = () => {
        if (video) {
            Linking.openURL(video as string);
        }
    };

    return (
        <>
            <Stack.Screen options={{ title: "Assessment" }} />

            <SafeAreaView className="flex-1 bg-white">
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

                {/* Carousel */}
                <View className="flex-1 justify-center items-center mt-8">
                    <View className="bg-orange-100 rounded-2xl p-6 shadow-sm border-2 border-gray-200 w-11/12 h-48 flex items-center justify-center">
                        <Text className="font-semibold text-xl text-center">
                            {parsedQuestions[currentStep - 1]?.split(":")[0] || ""}
                        </Text>
                        <Text className="text-xl text-center">
                            {parsedQuestions[currentStep - 1]?.split(":")[1] || ""}
                        </Text>
                    </View>
                </View>

                {/* Step Indicator */}
                <View className="px-4 mt-6">
                    <StepIndicator
                        currentStep={currentStep}
                        totalSteps={parsedQuestions.length}
                        onStepPress={handleStepPress}
                    />
                </View>

                {/* Watch Video Button */}
                <View className="px-4 mb-6">
                    <Text className="text-center text-gray-600 text-lg mb-6">
                        How to Get Started with Anything
                    </Text>
                    <TouchableOpacity
                        className="bg-orange-400 rounded-full py-4 px-6"
                        onPress={handleWatchVideoPress}
                    >
                        <Text className="text-white text-center text-lg font-medium">
                            Watch Video
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </>
    );
};

export default AssessmentPage;
