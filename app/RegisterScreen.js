import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { auth, db } from '../constants/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';

const RegisterScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      // Tạo tài khoản trên Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Lưu thông tin người dùng vào Firestore (sử dụng UID làm document ID)
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid, // Lưu UID để dễ truy vấn sau này
        email: email,
        address: address,
        phoneNumber: phoneNumber,
        role: 'customer', // Mặc định là "customer"
      });

      alert('Đăng ký thành công và dữ liệu đã lưu trong Firestore');
      router.push('/LoginScreen'); // Điều hướng đến màn hình đăng nhập
    } catch (error) {
      console.error('Đăng ký thất bại:', error);
      alert('Đăng ký thất bại: ' + error.message);
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
      <Text style={styles.label}>Địa chỉ:</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Nhập địa chỉ"
        placeholderTextColor="#888"
      />
      <Text style={styles.label}>Số điện thoại:</Text>
      <TextInput
        style={styles.input}
        value={phoneNumber}
        onChangeText={setPhoneNumber}
        placeholder="Nhập số điện thoại"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
      />
      <View style={styles.buttonContainer}>
        <Button title="Đăng ký" onPress={handleRegister} color="#4CAF50" />
      </View>
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
    justifyContent: 'center',
    width: '90%',
    marginTop: 10,
  },
});

export default RegisterScreen;
