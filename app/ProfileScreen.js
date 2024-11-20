import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
    const [userData, setUserData] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [updatedData, setUpdatedData] = useState({});
    const router = useRouter();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const userId = currentUser?.uid;

    // Lấy dữ liệu người dùng từ Firestore
    const fetchUserData = async () => {
        try {
            if (!userId) return;
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setUserData(userSnap.data());
            } else {
                console.log("No such user!");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            Alert.alert('Có lỗi xảy ra khi lấy dữ liệu người dùng!');
        }
    };

    // Cập nhật dữ liệu người dùng trong Firestore
    const handleUpdate = async () => {
        try {
            const userRef = doc(db, 'users', userId);
            await updateDoc(userRef, updatedData);
            setUserData((prevData) => ({ ...prevData, ...updatedData }));
            setIsEditing(false);
            Alert.alert('Thông báo', 'Cập nhật thông tin thành công!');
        } catch (error) {
            console.error("Error updating user data:", error);
            Alert.alert('Có lỗi xảy ra khi cập nhật thông tin!');
        }
    };

    // Đăng xuất
    const handleLogout = async () => {
        signOut(auth)
            .then(async () => {
                Alert.alert('Thông báo', 'Đăng xuất thành công!');
                await AsyncStorage.removeItem('userRole');
                router.push('/LoginScreen');
            })
            .catch((error) => {
                console.error("Error during logout:", error);
                Alert.alert('Có lỗi xảy ra khi đăng xuất!');
            });
    };

    useEffect(() => {
        fetchUserData();
    }, []);

    return (
        <View style={styles.container}>
            {isEditing ? (
                // Hiển thị các ô input để sửa thông tin
                <View>
                    <Text>Email: {userData.email}</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Phone Number"
                        value={updatedData.phoneNumber || userData.phoneNumber || ''}
                        onChangeText={(text) => setUpdatedData({ ...updatedData, phoneNumber: text })}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Address"
                        value={updatedData.address || userData.address || ''}
                        onChangeText={(text) => setUpdatedData({ ...updatedData, address: text })}
                    />
                    <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                        <Text style={styles.updateButtonText}>Cập nhật</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
                        <Text style={styles.cancelButtonText}>Hủy</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                // Hiển thị thông tin người dùng
                <View>
                    <Text>Email: {userData.email}</Text>
                    <Text>Phone Number: {userData.phoneNumber || 'Chưa cập nhật'}</Text>
                    <Text>Address: {userData.address || 'Chưa cập nhật'}</Text>
                    <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                        <Text style={styles.editButtonText}>Sửa thông tin</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutButtonText}>Đăng xuất</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
    },
    editButton: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    editButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    updateButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    updateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    logoutButton: {
        backgroundColor: '#e74c3c',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default ProfileScreen;