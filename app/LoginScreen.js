import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Pressable } from 'react-native';
import { auth, db } from '../constants/firebaseConfig'; // Đảm bảo import đúng từ firebaseConfig
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Đăng nhập bằng email và password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Lấy thông tin role từ Firestore
      const userDoc = doc(collection(db, "users"), user.uid); // Truy cập tài liệu người dùng bằng user.uid
      const userSnapshot = await getDoc(userDoc);
  
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const role = userData.role; // Lấy role từ Firestore
  
        if (role === "admin") {
          alert("Đăng nhập thành công với vai trò admin!");
          router.push("/ManageScreen");
        } else if (role === "customer") {
          alert("Đăng nhập thành công với vai trò khách hàng!");
          console.log("role: ", role);
          await AsyncStorage.removeItem('userRole');
          await AsyncStorage.setItem("userRole", role);
          router.push("/HomeScreen");
  
          // Lưu role vào AsyncStorage
          
        } else {
          alert("Vai trò không hợp lệ!");
        }
      } else {
        alert("Không tìm thấy thông tin người dùng trong Firestore!");
      }
    } catch (error) {
      console.error("Đăng nhập thất bại", error);
      alert("Đăng nhập thất bại: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Nhập email"
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Mật khẩu:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Nhập mật khẩu"
        placeholderTextColor="#888"
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button title="Đăng nhập" onPress={handleLogin} color="#4CAF50" />
      </View>

      {/* Nút Đăng ký */}
      <Pressable onPress={() => router.push('/RegisterScreen')} style={styles.registerButton}>
        <Text style={styles.registerText}>Chưa có tài khoản? Đăng ký ngay</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 25,
    marginBottom: 5,
    fontSize: 16,
    color: '#333',
  },
  input: {
    width: '90%',
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 10,
  },
  registerButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  registerText: {
    color: '#007BFF',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default LoginScreen;