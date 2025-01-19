import React from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

interface CategoryCardProps {
  title: string;
  description: string;
  bgColor: string;
  icon: any;
  actionText: string;
  onPress: () => void;
  link: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  bgColor,
  icon,
  actionText,
  onPress,
  link,
}) => {
  return (
    <Link href={link as any} asChild>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <View
          style={{
            backgroundColor:
              bgColor === "bg-orange-50"
                ? "#FFF7ED"
                : bgColor === "bg-blue-50"
                ? "#EFF6FF"
                : bgColor === "bg-purple-50"
                ? "#FAF5FF"
                : bgColor === "bg-green-50"
                ? "#F0FDF4"
                : "#FFFFFF",
            padding: 23,
            borderRadius: 12,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#000000", // Darker color
                marginBottom: 8,
                fontFamily: "Epilogue",
              }}
            >
              {title}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#000000", // Darker color
                marginBottom: 12,
                fontFamily: "Rubik",
              }}
            >
              {description}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
              <Text
                style={{
                  fontSize: 16,
                  color: "#000000", // Darker color
                  fontWeight: "bold",
                  fontFamily: "Rubik",
                }}
              >
                {actionText}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={24}
                color="#000000"
                style={{ marginLeft: 8 }}
              />
            </View>
          </View>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              justifyContent: "center",
              alignItems: "center",
              marginLeft: 16,
              marginRight: 24,
            }}
          >
            <Image
              source={icon}
              style={{ width: 72, height: 72 }}
              resizeMode="contain"
            />
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

const CommunityScreen = () => {
  const onCardPress = () => {
    // Handle card press
    console.log("Card pressed");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <CategoryCard
          title="Personal Stories"
          description="How I Overcame Addiction: Real Stories from Our Community"
          bgColor="bg-orange-50"
          actionText="Explore"
          icon={require("@/assets/icons/meetup.png")}
          onPress={onCardPress}
          link="/BlogPage"
        />
        <CategoryCard
          title="Parent Tips"
          description="Supporting Your Loved Ones: A Guide for Parents and Caregivers"
          bgColor="bg-blue-50"
          actionText="Know More"
          icon={require("@/assets/icons/parentsicon.png")}
          onPress={onCardPress}
          link="/ParentTips"
        />
        <CategoryCard
          title="Motivational Stories"
          description="Every Step Counts: Celebrating Small Wins on the Recovery Journey"
          bgColor="bg-purple-50"
          actionText="Know More"
          icon={require("@/assets/icons/flowerpurple.png")}
          onPress={onCardPress}
          link="/MotivationStories"
        />
        <CategoryCard
          title="Drug Prevention and Identification"
          description="Know the Signs: Identifying Commonly Abused Substances"
          bgColor="bg-green-50"
          actionText="Know More"
          icon={require("@/assets/icons/findpeople.png")}
          onPress={onCardPress}
          link="/DrugPrevention"
        />
      </ScrollView>
    </View>
  );
};

export default CommunityScreen;
