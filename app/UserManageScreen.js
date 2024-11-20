import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { db, auth } from '../constants/firebaseConfig';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';

const UserManagerScreen = () => {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('');
  const [editingUserId, setEditingUserId] = useState(null); // ID của người dùng đang chỉnh sửa
  const [isEditing, setIsEditing] = useState(false); // Hiển thị/ẩn form

  // Lấy danh sách người dùng từ Firestore
  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersArray = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setUsers(usersArray);
  };

  // Sửa người dùng
  const updateUser = async () => {
    if (!email || !phoneNumber || !address || !role) {
      alert('Vui lòng nhập đầy đủ thông tin!');
      return;
    }

    const userDoc = doc(db, 'users', editingUserId);
    await updateDoc(userDoc, { email, phoneNumber, address, role });

    resetForm();
    fetchUsers();
    alert('Cập nhật thông tin thành công!');
  };

  // Xóa người dùng
  const deleteUserAccount = async (id, uid) => {
    try {
      // Xóa trong Firestore
      const userDoc = doc(db, 'users', id);
      await deleteDoc(userDoc);

      // Xóa trong Firebase Authentication
      const userToDelete = auth.currentUser; // Thay thế logic tìm người dùng
      if (userToDelete && userToDelete.uid === uid) {
        await deleteUser(userToDelete);
      }

      alert('Xóa người dùng thành công!');
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      alert('Không thể xóa người dùng!');
    }
  };

  // Hiển thị form để chỉnh sửa thông tin người dùng
  const editUser = (user) => {
    setEmail(user.email);
    setPhoneNumber(user.phoneNumber);
    setAddress(user.address);
    setRole(user.role);
    setEditingUserId(user.id);
    setIsEditing(true); // Hiện form khi nhấn nút "Sửa"
  };

  // Reset form sau khi chỉnh sửa
  const resetForm = () => {
    setEmail('');
    setPhoneNumber('');
    setAddress('');
    setRole('');
    setEditingUserId(null);
    setIsEditing(false); // Ẩn form
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý người dùng</Text>

      {/* Form chỉnh sửa (ẩn theo mặc định) */}
      {isEditing && (
        <View style={styles.formContainer}>
          <Text style={styles.formHeader}>Chỉnh sửa người dùng</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#999"
            editable={false} // Email không thể chỉnh sửa
          />
          <TextInput
            style={styles.input}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Số điện thoại"
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Địa chỉ"
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            value={role}
            onChangeText={setRole}
            placeholder="Vai trò"
            placeholderTextColor="#999"
          />
          <View style={styles.buttonContainer}>
            <Button title="Cập nhật" onPress={updateUser} color="#4CAF50" />
            <Button title="Hủy" onPress={resetForm} color="#F44336" />
          </View>
        </View>
      )}

      {/* Danh sách người dùng */}
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userContainer}>
            <View style={styles.userDetails}>
              <Text style={styles.userEmail}>Email: {item.email}</Text>
              <Text>Số điện thoại: {item.phoneNumber}</Text>
              <Text>Địa chỉ: {item.address}</Text>
              <Text>Vai trò: {item.role}</Text>
            </View>
            <View style={styles.userActions}>
              <Button title="Sửa" onPress={() => editUser(item)} color="#FFC107" />
              <Button
                title="Xóa"
                onPress={() =>
                  Alert.alert(
                    'Xác nhận',
                    'Bạn có chắc chắn muốn xóa người dùng này?',
                    [
                      { text: 'Hủy', style: 'cancel' },
                      { text: 'Xóa', onPress: () => deleteUserAccount(item.id, item.uid) },
                    ]
                  )
                }
                color="#F44336"
              />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  formHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  userContainer: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  userDetails: {
    marginBottom: 10,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
});

export default UserManagerScreen;
