import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Timestamp } from 'firebase/firestore'; // Đảm bảo import Timestamp

const OrderManageScreen = () => {
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  // Lấy thông tin người dùng từ userId
  const fetchUserDetails = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error.message);
      return null;
    }
  };

  // Lấy danh sách đơn hàng từ Firestore và thêm thông tin người dùng
  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'order'));
      const ordersArray = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const orderData = docSnapshot.data();
          const userDetails = await fetchUserDetails(orderData.userId);
          return {
            ...orderData,
            id: docSnapshot.id,
            user: userDetails,
            date: orderData.date instanceof Timestamp ? orderData.date.toDate() : null, // Kiểm tra Timestamp và chuyển thành Date
          };
        })
      );
      setOrders(ordersArray);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đơn hàng:', error.message);
    }
  };

  // Xóa đơn hàng
  const deleteOrder = async (id) => {
    try {
      await deleteDoc(doc(db, 'order', id));
      alert('Đã xóa đơn hàng');
      fetchOrders(); // Cập nhật danh sách sau khi xóa
    } catch (error) {
      console.error('Lỗi khi xóa đơn hàng:', error.message);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const updateOrderStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'order', id), { status });
      alert('Đã cập nhật trạng thái đơn hàng');
      fetchOrders(); // Cập nhật danh sách sau khi thay đổi trạng thái
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error.message);
    }
  };

  // Hiển thị chi tiết đơn hàng
  const viewOrderDetails = (orderCode) => {
    router.push(`/OrderDetailScreen/?orderCode=${orderCode}`);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Quản lý đơn hàng</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderContainer}>
            <View style={styles.orderDetails}>
              <Text style={styles.orderText}>Mã đơn hàng: {item.order_code}</Text>
              <Text style={styles.orderText}>Tổng tiền: {item.totalsPrice} VNĐ</Text>
              {item.user ? (
                <>
                  <Text style={styles.orderText}>Email: {item.user.email}</Text>
                  <Text style={styles.orderText}>Số điện thoại: {item.user.phoneNumber}</Text>
                  <Text style={styles.orderText}>Địa chỉ: {item.user.address}</Text>
                </>
              ) : (
                <Text style={styles.orderText}>Người dùng: Không tìm thấy</Text>
              )}
              {/* Kiểm tra nếu có trường date và hiển thị */}
              {item.date ? (
                <Text style={styles.orderText}>
                  Ngày đặt hàng: {item.date.toLocaleDateString()}
                </Text>
              ) : (
                <Text style={styles.orderText}>Ngày đặt hàng: Không có</Text>
              )}
              <Text style={styles.orderText}>Trạng thái:</Text>
              <Picker
                selectedValue={item.status}
                onValueChange={(value) => updateOrderStatus(item.id, value)}
                style={styles.picker}
              >
                <Picker.Item label="Chưa xử lý" value={1} />
                <Picker.Item label="Đã xử lý" value={2} />
                <Picker.Item label="Đơn hàng fail" value={3} />
              </Picker>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="Chi tiết"
                onPress={() => viewOrderDetails(item.order_code)}
                color="#4CAF50"
              />
              <Button
                title="Xóa"
                onPress={() => deleteOrder(item.id)}
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
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  orderContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  orderDetails: {
    marginBottom: 10,
  },
  orderText: {
    fontSize: 16,
    color: '#555',
  },
  picker: {
    height: 40,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default OrderManageScreen;
