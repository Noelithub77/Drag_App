import { Tabs } from "expo-router";
import React from "react";
import {
  Platform,
  StatusBar,
  View,
  Image,
  TouchableOpacity,
} from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { Ionicons } from "@expo/vector-icons";
import TabBarBackground from "@/components/ui/TabBarBackground";

export default function TabLayout() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "orange",
          headerShown: true,
          headerStyle: {
            height: 50,
            backgroundColor: "white",
          },
          headerTitleStyle: {
            fontSize: 24,
            fontWeight: "bold",
          },
          headerShadowVisible: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            height: 85,
            backgroundColor: "white",
            paddingVertical: Platform.select({
              ios: 10,
              android: 5,
            }),
            borderTopWidth: 0,
          },
          tabBarLabel: () => null,
          tabBarIconStyle: {
            alignSelf: "center",
            justifyContent: "center",
            marginTop: 20,
            backgroundColor: "transparent"
          },
          tabBarItemStyle: {
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "transparent",
          },
          headerRight: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginRight: 10,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  /* Handle settings press */
                }}
              >
                <Ionicons name="settings-outline" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  /* Handle profile picture press */
                }}
              >
                <Image
                  source={{
                    uri: "https://cdn.discordapp.com/avatars/546690021571297280/52433392d835f179384068db90cb8122.png?size=512",
                  }}
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 17.5,
                    marginRight: 10,
                    marginLeft: 10,
                    borderWidth: 2,
                    borderColor: "orange",
                  }}
                />
              </TouchableOpacity>
            </View>
          ),
        }}
      >
        <Tabs.Screen
          name="Encyclopedia"
          options={{
            title: "Encyclopedia",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={28}
                name={focused ? "book" : "book-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Chat"
          options={{
            title: "Chat",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={28}
                name={focused ? "chatbubble" : "chatbubble-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Home"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={28}
                name={focused ? "home" : "home-outline"}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="Community"
          options={{
            title: "Community",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={28}
                name={focused ? "people" : "people-outline"}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="VirtualCoach"
          options={{
            title: "Personal Coach",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={28}
                name={focused ? "fitness" : "fitness-outline"}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
