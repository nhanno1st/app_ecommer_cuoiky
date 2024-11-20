import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../constants/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ManageScreen = () => {
  const router = useRouter(); // Sử dụng router để điều hướng

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    signOut(auth)
      .then(async () => {
        alert('Đăng xuất thành công!');
        await AsyncStorage.removeItem('userRole');
        router.push('/LoginScreen');
      })
      .catch((error) => {
        alert('Lỗi khi đăng xuất: ' + error.message);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Admin Management</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('./ProductManageScreen')}
      >
        <Text style={styles.buttonText}>Quản lý sản phẩm</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('./UserManageScreen')}
      >
        <Text style={styles.buttonText}>Quản lý User</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('./OrderManageScreen')}
      >
        <Text style={styles.buttonText}>Quản lý Order</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('./RevenueScreen')}
      >
        <Text style={styles.buttonText}>Quản lý doanh thu</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F44336',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 16,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default ManageScreen;
