import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexScreen() {
  const router = useRouter();

  useEffect(() => {
    // Wrap navigation logic in a timeout to allow the router to initialize
    const timer = setTimeout(() => {
      router.push('/LoginScreen');
    }, 0); // Small delay ensures the router is ready

    return () => clearTimeout(timer); // Cleanup in case the component unmounts
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
