import React, { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Animated, ActivityIndicator } from "react-native";
import '../../global.css';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Markdown from 'react-native-markdown-display';

const LoadingDots = () => {
  const dots = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  React.useEffect(() => {
    const animateDot = (dot: Animated.Value, delay: number) => {
      Animated.sequence([
        Animated.timing(dot, {
          toValue: 1,
          duration: 500,
          delay,
          useNativeDriver: true
        }),
        Animated.timing(dot, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        })
      ]).start(() => animateDot(dot, delay));
    };

    dots.forEach((dot, index) => animateDot(dot, index * 200));
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8 }}>
      {dots.map((dot, index) => (
        <Animated.View
          key={index}
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: '#666',
            marginHorizontal: 2,
            opacity: dot,
            transform: [{
              translateY: dot.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8]
              })
            }]
          }}
        />
      ))}
    </View>
  );
};

interface ChatMessage {
  role: string;
  text: string;
  animation?: {
    fade: Animated.Value;
    slide: Animated.Value;
  };
}

const ChatInterface: React.FC = () => {
  const [inputText, setInputText] = useState("");
  const [chatResponse, setChatResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showMenu, setShowMenu] = useState(true);
  const [isMalayalamMode, setIsMalayalamMode] = useState(false);

  const genAI = new GoogleGenerativeAI("AIzaSyCEaSfr3QRu7xOkt5kMe5DlTxfSqW523Co");
  const model = genAI.getGenerativeModel({
    model: isMalayalamMode ? "gemini-1.5-pro" : "gemini-1.5-flash-8b",
    systemInstruction: isMalayalamMode
      ? "You are a compassionate drug rehabilitation counselor. Provide supportive, non-judgmental guidance to help people overcome drug addiction. Focus on harm reduction, recovery strategies, and connecting people with professional help. Never give medical advice. Always encourage seeking professional medical and psychiatric help. If someone is in immediate danger, direct them to emergency services. Reply in Malayalam."
      : "You are a compassionate drug rehabilitation counselor. Provide supportive, non-judgmental guidance to help people overcome drug addiction. Focus on harm reduction, recovery strategies, and connecting people with professional help. Never give medical advice. Always encourage seeking professional medical and psychiatric help. If someone is in immediate danger, direct them to emergency services. Make it precise, easy to read, concise and engaging. If the input is in Manglish, reply to me in Manglish too."
  });

  async function getChatResponse(message: string) {
    const chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "Hello" }],
            },
            {
                role: "model",
                parts: [{ text: "Great to meet you. What would you like to know?" }],
            },
        ],
    });

    let result = await chat.sendMessage(message);
    return result.response.text();
  }

  const menuItems = isMalayalamMode
    ? ["എനിക്ക് സമ്മർദ്ദം അല്ലെങ്കിൽ ആശങ്ക അനുഭവപ്പെടുന്നു.", "എനിക്ക് പൊതുവായ മാനസികാരോഗ്യ ഉപദേശങ്ങൾ വേണം.", "മയക്കുമരുന്ന് ഉപയോഗം അല്ലെങ്കിൽ ആഗ്രഹങ്ങൾ എങ്ങനെ പ്രതിരോധിക്കാം എന്നതിന് ഉപദേശങ്ങൾ വേണം.", "എനിക്ക് എവിടെ നിന്ന് തുടങ്ങണമെന്ന് അറിയില്ല."]
    : ["I'm feeling stressed or anxious.", "I want general mental health advice.", "I need tips to resist drug use or cravings.", "I'm not sure where to start."];

  const followUpItems = isMalayalamMode
    ? ["വ്യാപകമായ പിന്മാറ്റ ലക്ഷണങ്ങളെ എങ്ങനെ നിയന്ത്രിക്കാം?", "നിങ്ങൾ ശുപാർശ ചെയ്യുന്ന പിന്തുണാ ഗ്രൂപ്പുകൾ ഉണ്ടോ?", "പുനരധിവാസ സമയത്ത് പ്രചോദനം നിലനിർത്താൻ എങ്ങനെ?", "സമ്മർദ്ദം നിയന്ത്രിക്കാൻ ആരോഗ്യകരമായ മാർഗങ്ങൾ എന്തെല്ലാം?"]
    : ["What are some effective ways to manage withdrawal symptoms?", "Are there any support groups you recommend?", "How can I stay motivated during recovery?", "What are some healthy coping mechanisms for stress?"];

  const menuAnimation = {
    fade: useRef(new Animated.Value(1)).current,
    slide: useRef(new Animated.Value(0)).current,
  };

  const createMessageAnimation = () => ({
    fade: new Animated.Value(0),
    slide: new Animated.Value(50),
  });

  const animateMessage = (animation: { fade: Animated.Value; slide: Animated.Value }) => {
    Animated.parallel([
      Animated.timing(animation.fade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(animation.slide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSend = async (message: string) => {
    if (!message.trim()) return;
    
    // Set loading state first, before any other operations
    setIsLoading(true);
    setInputText("");
    
    // Create animations
    const userMessageAnimation = createMessageAnimation();
    const botMessageAnimation = createMessageAnimation();
    
    // Update chat history with user message
    setChatHistory(prev => [
      ...prev,
      { role: "user", text: message, animation: userMessageAnimation }
    ]);

    // Handle menu and animations after state updates
    if (showMenu) {
      setShowMenu(false);
      Animated.parallel([
        Animated.timing(menuAnimation.fade, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(menuAnimation.slide, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Animate user message
    animateMessage(userMessageAnimation);

    try {
      const response = await getChatResponse(message);
      
      setChatHistory(prev => [
        ...prev,
        { role: "model", text: response, animation: botMessageAnimation }
      ]);
      
      animateMessage(botMessageAnimation);
    } catch (error) {
      console.error('Error getting response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView
        style={{
          flex: 1,
          padding: 16,
        }}
      >
        <View style={{ alignItems: "center", marginBottom: 20 }}>
          {/* Bot Avatar */}
          <Image
            source={require("../../assets/icons/draigon.png")}
            style={{ width: 180, height: 180, resizeMode: "contain" }}
          />
        </View>

        {/* Menu Section */}
        {showMenu ? (
          <Animated.View
            style={{
              opacity: menuAnimation.fade,
              transform: [{ translateY: menuAnimation.slide }],
              backgroundColor: "#FEF3E7",
              padding: 20,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 6,
            }}
          >
            {/* Assistance Text Section */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <Image
                source={require("../../assets/icons/sparkle.png")} // Replace with actual sparkle icon
                style={{ width: 24, height: 24, marginBottom: 8 }}
              />
              <Text style={{ color: "#4A4A4A", fontSize: 16 }}>
                {isMalayalamMode ? "ഞാൻ ഇന്ന് നിങ്ങളെ എങ്ങനെ സഹായിക്കാം?" : "How can I assist you today?"}
              </Text>
            </View>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: "white",
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 8,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                }}
                onPress={() => {
                  setInputText(item);
                  handleSend(item);
                }}
              >
                <Text style={{ color: "#4A4A4A", fontSize: 14 }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        ) : (
          <View style={{ flex: 1 }}>
            {chatHistory.map((message, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: message.animation?.fade || 1,
                  transform: [{ translateY: message.animation?.slide || 0 }],
                  alignSelf: message.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: message.role === "user" ? "#FEF3E7" : "#f1d3b2",
                  borderRadius: 8,
                  padding: 10,
                  marginVertical: 5,
                  maxWidth: "80%",
                }}
              >
                {message.role === "model" ? (
                  <Markdown>{message.text}</Markdown>
                ) : (
                  <Text style={{ color: "#4A4A4A", fontSize: 16 }}>{message.text}</Text>
                )}
              </Animated.View>
            ))}
            {isLoading && (
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "#E1E1E1",
                  borderRadius: 8,
                  padding: 10,
                  marginVertical: 5,
                  maxWidth: "80%",
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: "#4A4A4A", fontSize: 16, marginRight: 8 }}>{isMalayalamMode ? "ചിന്തിക്കുന്നു" : "Thinking"}</Text>
                <LoadingDots />
              </View>
            )}
            {/* Follow-up Recommendations */}
            <View
              style={{
                backgroundColor: "#f1d3b2",
                padding: 20,
                borderRadius: 8,
                shadowColor: "#000",
                shadowOpacity: 0.1,
                shadowRadius: 6,
                marginTop: 10,
              }}
            >
              <Text style={{ color: "#4A4A4A", fontSize: 16, marginBottom: 10 }}>
                {isMalayalamMode ? "പിന്തുടരൽ ശുപാർശകൾ:" : "Follow up Recommendations:"}
              </Text>
              {followUpItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    backgroundColor: "white",
                    padding: 16,
                    borderRadius: 8,
                    marginBottom: 8,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 3,
                  }}
                  onPress={() => {
                    setInputText(item);
                    handleSend(item);
                  }}
                >
                  <Text style={{ color: "#4A4A4A", fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Input Section */}
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#F0F0F0",
            borderRadius: 50,
            borderWidth: 1,
            borderColor: "#DADADA",
            paddingHorizontal: 16,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 3,
          }}
        >
          <TextInput
            placeholder={isMalayalamMode ? "ഇന്ന് നിങ്ങളുടെ മനസ്സിൽ എന്താണ്?" : "What's on your mind today?"}
            style={{ flex: 1, color: "#4A4A4A", fontSize: 14 }}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            style={{
              backgroundColor: isMalayalamMode ? "#FF8A00" : "#F0F0F0",
              padding: 8,
              borderRadius: 50,
              marginRight: 8,
            }}
            onPress={() => setIsMalayalamMode(!isMalayalamMode)}
          >
            <Text style={{ color: isMalayalamMode ? "white" : "#4A4A4A", fontSize: 16 }}>മ</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Image
              source={require("../../assets/icons/mic.png")}
              style={{ width: 24, height: 24, tintColor: "#A0A0A0" }}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={{
            backgroundColor: "#FF8A00",
            padding: 12,
            borderRadius: 50,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 3,
          }}
          onPress={() => handleSend(inputText)}
        >
          <Image
            source={require("../../assets/icons/send.png")} // Replace with actual send icon
            style={{ width: 24, height: 24, tintColor: "white" }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatInterface;