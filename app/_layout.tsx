import { Stack, useRouter, useRootNavigationState } from 'expo-router';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export default function Layout() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  // Lấy vai trò người dùng khi layout được mount hoặc thay đổi điều hướng
  const navState = useRootNavigationState();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('userRole');
        console.log('Stored role:', storedRole);
        setRole(storedRole); // Cập nhật role
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    fetchUserRole();
  }, [navState]); // Theo dõi thay đổi điều hướng

  return (
    <View style={{ flex: 1 }}>
      {/* Nội dung màn hình */}
      <Stack />
      {/* Hiển thị thanh điều hướng nếu vai trò là customer */}
      {role === 'customer' && (
        <View style={styles.navigationBar}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('./HomeScreen')}
          >
            <Ionicons name="home" size={24} color="#333" />
            <Text style={styles.navText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('./ProfileScreen')}
          >
            <Ionicons name="person" size={24} color="#333" />
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push('./CartScreen')}
          >
            <Ionicons name="cart" size={24} color="#333" />
            <Text style={styles.navText}>Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
});
