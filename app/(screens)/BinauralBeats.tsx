import React, { useState, useEffect, useRef } from "react";
import { Image, Dimensions, FlatList, PanResponder, GestureResponderEvent, PanResponderGestureState } from "react-native";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Audio } from 'expo-av';

const BinauralBeats: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const windowWidth = Dimensions.get('window').width;
    const progressBarWidth = useRef(0);
    const flatListRef = useRef<FlatList>(null);

    const tracks = [
        {
            id: 1,
            title: "Brown Noise",
            image: require("../../assets/images/brownbeats.jpg"),
            audio: require("../../assets/music/brown-noise.mp3"),
        },
        {
            id: 2,
            title: "White Noise",
            image: require("../../assets/images/whitebeats.jpg"),
            audio: require("../../assets/music/white-noise.mp3"),
        },
    ];

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
            shouldDuckAndroid: true,
        });

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.stopAsync();
            }
        };
    }, [sound]);

    const loadAndPlaySound = async (track: any) => {
        try {
            if (sound) {
                await sound.unloadAsync();
            }
            const { sound: newSound } = await Audio.Sound.createAsync(track.audio);
            setSound(newSound);
            
            // Get and set initial duration
            const status = await newSound.getStatusAsync();
            if (status.isLoaded) {
                setDuration(status.durationMillis || 0);
            }

            await newSound.playAsync();
            setIsPlaying(true);

            // Set up progress updates
            newSound.setOnPlaybackStatusUpdate((status: any) => {
                if (status.isLoaded) {
                    const progressPercent = (status.positionMillis / status.durationMillis) * 100;
                    setProgress(progressPercent);
                    setCurrentTime(status.positionMillis);
                    
                    // Auto-play next track when current one ends
                    if (status.didJustFinish) {
                        handleNext();
                    }
                }
            });
        } catch (error) {
            console.error("Error loading sound:", error);
        }
    };

    const handlePlayPause = async () => {
        if (!sound) {
            await loadAndPlaySound(tracks[activeIndex]);
        } else {
            if (isPlaying) {
                await sound.pauseAsync();
            } else {
                await sound.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handlePrevious = () => {
        const newIndex = activeIndex === 0 ? tracks.length - 1 : activeIndex - 1;
        setActiveIndex(newIndex);
        flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
        loadAndPlaySound(tracks[newIndex]);
    };

    const handleNext = () => {
        const newIndex = activeIndex === tracks.length - 1 ? 0 : activeIndex + 1;
        setActiveIndex(newIndex);
        flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
        loadAndPlaySound(tracks[newIndex]);
    };

    const handleProgressBarClick = async (event: GestureResponderEvent) => {
        if (!progressBarWidth.current) return;
        
        const locationX = event.nativeEvent.locationX;
        const percentage = (locationX / progressBarWidth.current) * 100;
        await handleSeek(percentage);
    };

    const handleSeek = async (position: number) => {
        if (sound) {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
                const seekPosition = (position / 100) * status.durationMillis;
                await sound.setPositionAsync(seekPosition);
                setProgress(position);
                setCurrentTime(seekPosition);
            }
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                if (sound) {
                    sound.pauseAsync();
                }
            },
            onPanResponderMove: (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                const newProgress = (gestureState.dx / progressBarWidth.current) * 100;
                setProgress(Math.max(0, Math.min(100, newProgress)));
            },
            onPanResponderRelease: async (event: GestureResponderEvent, gestureState: PanResponderGestureState) => {
                const newProgress = (gestureState.dx / progressBarWidth.current) * 100;
                await handleSeek(Math.max(0, Math.min(100, newProgress)));
                if (sound) {
                    sound.playAsync();
                }
            },
        })
    ).current;

    const renderCarouselItem = ({ item }: { item: any }) => (
        <View className="bg-white rounded-xl shadow-lg" style={{ aspectRatio: 1, width: windowWidth - 32 }}>
            <Image
                source={item.image}
                style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: 10,
                }}
                resizeMode="cover"
            />
            <View className="absolute bottom-4 left-4">
                <Text className="text-white text-xl font-semibold">{item.title}</Text>
            </View>
        </View>
    );

    return (
        <>
            <Stack.Screen options={{ title: "Binaural Beats" }} />
            <View className="flex-1 bg-white p-4">
                {/* Header Card */}
                <View className="bg-orange-400 rounded-xl p-6 mb-6">
                    <Text className="text-white text-xl font-semibold">
                        {tracks[activeIndex].title === "White Noise" || tracks[activeIndex].title === "Brown Noise" ? tracks[activeIndex].title : "Binaural Beats"}
                    </Text>
                </View>

                {/* Carousel */}
                <View className="mb-6">
                    <FlatList
                        ref={flatListRef}
                        data={tracks}
                        renderItem={renderCarouselItem}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.id.toString()}
                        snapToAlignment="center"
                        snapToInterval={windowWidth - 32}
                        decelerationRate="fast"
                        onMomentumScrollEnd={(event) => {
                            const index = Math.round(event.nativeEvent.contentOffset.x / (windowWidth - 32));
                            if (index !== activeIndex) {
                                setActiveIndex(index);
                                loadAndPlaySound(tracks[index]);
                            }
                        }}
                    />
                </View>

                {/* Progress Bar and Controls */}
                <View className="bg-white rounded-xl p-6 shadow-lg" style={{ flex: 1 }}>
                    {/* Time Display */}
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600">{formatTime(currentTime)}</Text>
                        <Text className="text-gray-600">{formatTime(duration)}</Text>
                    </View>

                    {/* Progress Bar */}
                    <View
                        className="w-full h-1 bg-gray-700 rounded-full mb-8"
                        {...panResponder.panHandlers}
                        onLayout={(event) => {
                            progressBarWidth.current = event.nativeEvent.layout.width;
                        }}
                        onTouchEnd={handleProgressBarClick}
                    >
                        <View
                            className="h-full bg-orange-400 rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </View>

                    <View className="flex-row items-center justify-between w-full px-8">
                        <TouchableOpacity
                            onPress={handlePrevious}
                            className="p-2"
                        >
                            <Ionicons name="play-skip-back" size={32} color="orange" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handlePlayPause}
                            className="bg-white rounded-full p-4 shadow-md"
                            style={{ elevation: 3 }}
                        >
                            {isPlaying ? (
                                <Ionicons name="pause" size={32} color="orange" />
                            ) : (
                                <Ionicons name="play" size={32} color="orange" />
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleNext}
                            className="p-2"
                        >
                            <Ionicons name="play-skip-forward" size={32} color="orange" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </>
    );
};

export default BinauralBeats;