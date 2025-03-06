import { Tabs } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Platform,
  StatusBar,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Text,
  StyleSheet,
} from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { Ionicons } from "@expo/vector-icons";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { supabase } from "../../supabaseConfig";
import { useRouter } from "expo-router";

export default function TabLayout() {
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  useEffect(() => {
    // Get the current user and their avatar
    getUserAvatar();
  }, []);

  const getUserAvatar = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.user_metadata?.avatar_url) {
        setUserAvatar(user.user_metadata.avatar_url);
      } else if (user?.identities?.[0]?.identity_data?.avatar_url) {
        setUserAvatar(user.identities[0].identity_data.avatar_url);
      }
    } catch (error) {
      console.error("Error fetching user avatar:", error);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Navigate to login page
      router.replace("/(screens)/LoginPage");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setShowLogoutModal(false);
    }
  };

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
                onPress={() => setShowLogoutModal(true)}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  /* Handle profile picture press */
                }}
              >
                {userAvatar ? (
                  <Image
                    source={{ uri: userAvatar }}
                    style={{
                      width: 35,
                      height: 35,
                      borderRadius: 17.5,
                      marginRight: 10,
                      borderWidth: 2,
                      borderColor: "orange",
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 35,
                      height: 35,
                      borderRadius: 17.5,
                      marginRight: 10,
                      borderWidth: 2,
                      borderColor: "orange",
                      backgroundColor: "#f0f0f0",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="person" size={20} color="#888" />
                  </View>
                )}
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

      {/* Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Settings</Text>
            
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowLogoutModal(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#ff6347',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: 10,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelText: {
    color: '#333',
    fontSize: 16,
  },
});
