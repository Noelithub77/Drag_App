import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Stack } from "expo-router";

interface CategoryCardProps {
  title: string;
  description: string;
  bgColor: string;
  icon: any;
  actionText: string;
  onPress: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  bgColor,
  icon,
  actionText,
  onPress,
}) => {
  return (
    <>
      <Stack.Screen options={{ title: "Events" }} />

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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
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
              {title === "Lions Club De-addict" && (
                <Ionicons
                  name="arrow-forward"
                  size={24}
                  color="#000000"
                  style={{ marginLeft: 8 }}
                />
              )}
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
    </>
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
          title="Hack-A-Addict"
          description="Join Us for 'Hack-A-Addict': 
        A Step Towards a Drug-Free Life"
          bgColor="bg-orange-50"
          actionText="Register Now"
          icon={require("@/assets/icons/lionsclub.png")}
          onPress={() => {
            onCardPress();
            Linking.openURL("https://antidrughackathon.com/");
          }}
        />
        <CategoryCard
          title="Talk:Rishiraj Singh IPS"
          description="Breaking Chains: A Journey Towards Freedom from Addiction"
          bgColor="bg-blue-50"
          actionText="Registrations starts on 20-01-2025"
          icon={require("@/assets/icons/parentsicon.png")}
          onPress={onCardPress}
        />
        <CategoryCard
          title="Bright Futures"
          description="Say No to Drugs, Say Yes to Dreams"
          bgColor="bg-purple-50"
          actionText="Registrations starts on 20-01-2025"
          icon={require("@/assets/icons/flowerpurple.png")}
          onPress={onCardPress}
        />
        <CategoryCard
          title="Guiding Hands"
          description="Helping Parents Build a Drug-Free Future for Their Children"
          bgColor="bg-green-50"
          actionText="Registrations starts on 20-01-2025 "
          icon={require("@/assets/icons/findpeople.png")}
          onPress={onCardPress}
        />
      </ScrollView>
    </View>
  );
};

export default CommunityScreen;
