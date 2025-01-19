import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, Dimensions, Image } from "react-native";
import { Stack } from "expo-router";

interface GameState {
    isPlaying: boolean;
    score: number;
    dinoBottom: number;
    isJumping: boolean;
    obstacleLeft: number;
    gameSpeed: number;
    stars: Array<{
        id: number;
        left: number;
        bottom: number;
    }>;
}

const Games: React.FC = () => {
    const GRAVITY = 0.6;
    const JUMP_FORCE = 15;
    const INITIAL_GAME_SPEED = 5;
    const SCREEN_WIDTH = Dimensions.get("window").width;
    const STAR_BONUS = 10;
    const BLACK_BAR_HEIGHT = 60;
    
    // Character dimensions
    const DINO_WIDTH = 46;
    const DINO_HEIGHT = 80;
    const DINO_LEFT = 16;
    const STAR_SIZE = 40;
    const PILL_WIDTH = 50;
    const PILL_HEIGHT = 100;

    const [gameState, setGameState] = useState<GameState>({
        isPlaying: false,
        score: 0,
        dinoBottom: 0,
        isJumping: false,
        obstacleLeft: SCREEN_WIDTH,
        gameSpeed: INITIAL_GAME_SPEED,
        stars: [],
    });

    const jumpVelocity = useRef(0);
    const gameLoop = useRef<number>();
    const starIdCounter = useRef(0);

    const checkCollision = (
        rect1: { x: number; y: number; width: number; height: number },
        rect2: { x: number; y: number; width: number; height: number }
    ) => {
        return (
            rect1.x < rect2.x + rect2.width &&
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        );
    };

    const generateStar = () => {
        const newStar = {
            id: starIdCounter.current++,
            left: SCREEN_WIDTH,
            bottom: Math.random() * 120 + 40,
        };
        setGameState(prev => ({
            ...prev,
            stars: [...prev.stars, newStar],
        }));
    };

    const startGame = () => {
        if (!gameState.isPlaying) {
            setGameState(prev => ({
                ...prev,
                isPlaying: true,
                score: 0,
                obstacleLeft: SCREEN_WIDTH,
                gameSpeed: INITIAL_GAME_SPEED,
                stars: [],
            }));
            generateStar();
        }
    };

    const jump = () => {
        if (!gameState.isJumping) {
            jumpVelocity.current = JUMP_FORCE;
            setGameState(prev => ({ ...prev, isJumping: true }));
        }
    };

    const updateGame = () => {
        if (!gameState.isPlaying) return;

        setGameState(prev => {
            let newBottom = prev.dinoBottom + jumpVelocity.current;
            jumpVelocity.current -= GRAVITY;

            if (newBottom < 0) {
                newBottom = 0;
                jumpVelocity.current = 0;
                prev.isJumping = false;
            }

            let newObstacleLeft = prev.obstacleLeft - prev.gameSpeed;
            let newStars = prev.stars.map(star => ({
                ...star,
                left: star.left - prev.gameSpeed,
            }));

            // Collision detection for stars
            const dinoRect = {
                x: DINO_LEFT,
                y: newBottom + BLACK_BAR_HEIGHT,
                width: DINO_WIDTH,
                height: DINO_HEIGHT,
            };

            // Check star collisions and filter collected stars
            let collectedStars = 0;
            newStars = newStars.filter(star => {
                const starRect = {
                    x: star.left,
                    y: star.bottom + BLACK_BAR_HEIGHT,
                    width: STAR_SIZE,
                    height: STAR_SIZE,
                };

                const hasCollided = checkCollision(dinoRect, starRect);
                if (hasCollided) {
                    collectedStars++;
                    return false;
                }
                return star.left > -20;
            });

            // Check pill collision
            const pillRect = {
                x: prev.obstacleLeft,
                y: BLACK_BAR_HEIGHT,
                width: PILL_WIDTH,
                height: PILL_HEIGHT,
            };

            if (checkCollision(dinoRect, pillRect)) {
                return {
                    ...prev,
                    isPlaying: false,
                    dinoBottom: 0,
                    stars: [],
                };
            }

            // Generate new star
            if (Math.random() < 0.02 && newStars.length < 3) {
                generateStar();
            }

            // Reset obstacle position
            if (newObstacleLeft < -PILL_WIDTH) {
                newObstacleLeft = SCREEN_WIDTH;
            }

            return {
                ...prev,
                dinoBottom: newBottom,
                obstacleLeft: newObstacleLeft,
                stars: newStars,
                score: prev.score + (collectedStars * STAR_BONUS),
                gameSpeed: prev.gameSpeed + (collectedStars * 0.1), // Increase speed with each star collected
            };
        });
    };

    useEffect(() => {
        if (gameState.isPlaying) {
            gameLoop.current = setInterval(updateGame, 16) as unknown as number;
        }
        return () => {
            if (gameLoop.current) clearInterval(gameLoop.current);
        };
    }, [gameState.isPlaying]);

    return (
        <>
            <Stack.Screen options={{ title: "Games" }} />
            <Pressable
                onPress={gameState.isPlaying ? jump : startGame}
                className="flex-1 bg-gray-100"
            >
                <View className="flex-1 relative">
                     {/* Permanent Background Text */}
                     <View className="absolute inset-0 items-center justify-center">
                        <Text className="text-6xl font-bold text-gray-400">
                            DRAG-HIM
                        </Text>
                        <Text className="text-3xl font-bold text-gray-400 mt-4">
                            JUMP & COLLECT
                        </Text>
                    </View>

                    {/* Score */}
                    <Text className="absolute top-8 right-8 text-2xl font-bold text-gray-800">
                        {gameState.score}
                    </Text>

                    {/* Game Over Message */}
                    {!gameState.isPlaying && gameState.score > 0 && (
                        <View className="absolute top-1/4 w-full items-center">
                            <Text className="text-3xl font-bold text-gray-800">
                                Game Over
                            </Text>
                            <Text className="text-xl text-gray-600 mt-2">
                                Final Score: {gameState.score}
                            </Text>
                            <Text className="text-lg text-gray-600 mt-2">
                                Tap to play again
                            </Text>
                        </View>
                    )}

                    {/* Start Message */}
                    {!gameState.isPlaying && gameState.score === 0 && (
                        <View className="absolute top-1/4 w-full items-center">
                            <Text className="text-3xl font-bold text-gray-800">
                                Tap to Start
                            </Text>
                        </View>
                    )}

                    {/* Stars */}
                    {gameState.stars.map(star => (
                        <Image
                            key={star.id}
                            source={require("../../assets/icons/star.png")}
                            style={{
                                position: "absolute",
                                left: star.left,
                                bottom: star.bottom + BLACK_BAR_HEIGHT,
                                width: STAR_SIZE,
                                height: STAR_SIZE,
                            }}
                        />
                    ))}

                    {/* Dino */}
                    <Image
                        source={require("../../assets/icons/draigon.png")}
                        style={{
                            position: "absolute",
                            bottom: gameState.dinoBottom + BLACK_BAR_HEIGHT,
                            left: DINO_LEFT,
                            width: DINO_WIDTH,
                            height: DINO_HEIGHT,
                        }}
                    />

                    {/* Obstacle */}
                    <Image
                        source={require("../../assets/icons/pill.png")}
                        style={{
                            position: "absolute",
                            bottom: BLACK_BAR_HEIGHT,
                            left: gameState.obstacleLeft,
                            width: PILL_WIDTH,
                            height: PILL_HEIGHT,
                        }}
                    />

                    {/* Black Bar at Bottom */}
                    <View
                        style={{
                            position: "absolute",
                            bottom: 0,
                            width: "100%",
                            height: BLACK_BAR_HEIGHT,
                            backgroundColor: "black",
                        }}
                    />
                </View>
            </Pressable>
        </>
    );
};

export default Games;