import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '../../supabaseConfig';

const SignUp: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      
      alert('Registration successful! Please check your email to confirm your account.');
      router.push('/(screens)/LoginPage');
    } catch (error: any) {
      setError(error.message || 'Failed to sign up');
      console.error('Sign up error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/(screens)/LoginPage' as any);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Stack.Screen options={{ headerShown: false }} />
          
          {/* Orange Circle Background */}
          <View style={styles.circleContainer}>
            <View style={styles.circle} />
          </View>
          
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Sign Up Form */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            
            <View style={styles.inputsContainer}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContent}>
                    <FontAwesome name="envelope-o" size={20} color="#736b66" />
                    <TextInput
                      style={styles.input}
                      placeholder="Email"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>
              </View>
              
              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContent}>
                    <FontAwesome name="lock" size={20} color="#736b66" />
                    <TextInput
                      style={styles.input}
                      placeholder="Password"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      <FontAwesome
                        name={showPassword ? "eye" : "eye-slash"}
                        size={20}
                        color="#c9c7c5"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              {/* Confirm Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <View style={styles.inputContent}>
                    <FontAwesome name="lock" size={20} color="#736b66" />
                    <TextInput
                      style={styles.input}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <FontAwesome
                        name={showConfirmPassword ? "eye" : "eye-slash"}
                        size={20}
                        color="#c9c7c5"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              
              {/* Error Message */}
              {error && <Text style={styles.errorText}>{error}</Text>}
              
              {/* Sign Up Button */}
              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleSignUp}
                disabled={loading}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Sign Up</Text>
                  {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <FontAwesome name="arrow-right" size={20} color="#fff" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
            
            {/* Footer Links */}
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={handleBackToLogin}>
                <Text style={styles.loginText}>
                  Already have an account? <Text style={styles.highlightText}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfbfb',
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: 'center',
    position: 'relative',
  },
  circleContainer: {
    position: 'absolute',
    top: -480,
    left: -480,
    width: 960,
    height: 960,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 960,
    height: 960,
    borderRadius: 480,
    backgroundColor: '#ff995a',
  },
  logoContainer: {
    marginTop: 120,
    alignItems: 'center',
    zIndex: 1,
  },
  logo: {
    width: 111,
    height: 120,
  },
  formContainer: {
    width: 343,
    marginTop: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#4f3422',
    marginBottom: 30,
    fontFamily: 'Urbanist',
    lineHeight: 38,
    width: '100%',
  },
  inputsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4f3422',
    marginBottom: 8,
    fontFamily: 'Urbanist',
  },
  inputWrapper: {
    width: '100%',
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inputContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 56,
    fontSize: 16,
    fontWeight: '700',
    color: '#736b66',
    marginLeft: 10,
    fontFamily: 'Urbanist',
  },
  signUpButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#ff995a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    marginRight: 10,
    fontFamily: 'Urbanist',
  },
  footerLinks: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4f3422',
    marginBottom: 8,
    fontFamily: 'Urbanist',
  },
  highlightText: {
    color: '#4f3422',
    fontWeight: '800',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    marginBottom: 5,
    textAlign: 'center',
  },
});

export default SignUp; 