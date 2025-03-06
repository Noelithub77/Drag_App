import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseConfig';
import * as WebBrowser from 'expo-web-browser';


WebBrowser.maybeCompleteAuthSession();

const StackLayout = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        
        checkUser();

        
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setIsAuthenticated(!!session);
            }
        );

        return () => {
            
            if (authListener && authListener.subscription) {
                authListener.subscription.unsubscribe();
            }
        };
    }, []);

    const checkUser = async () => {
        try {
            const { data } = await supabase.auth.getSession();
            setIsAuthenticated(!!data.session);
        } catch (error) {
            console.error('Error checking auth state:', error);
            setIsAuthenticated(false);
        }
    };

    
    if (isAuthenticated === null) {
        return null;
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {isAuthenticated ? (
                
                <Stack.Screen name="(tabs)" />
            ) : (
                
                <Stack.Screen name="(screens)" />
            )}
            <Stack.Screen name="(screens)/SignUp" options={{ headerShown: false }} />
            <Stack.Screen name="(screens)/ForgotPassword" options={{ headerShown: false }} />
            <Stack.Screen name="(screens)/ResetPassword" options={{ headerShown: false }} />
            <Stack.Screen name="(screens)/ReportPage" options={{ headerShown: false }} />
            <Stack.Screen name="(screens)/PoliceReport" options={{ headerShown: false }} />
        </Stack>
    );
};

export default StackLayout;