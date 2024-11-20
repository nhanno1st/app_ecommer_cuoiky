import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig'; // Đảm bảo đúng đường dẫn file config

const RevenueScreen = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [loading, setLoading] = useState(false);

  // Hàm tính doanh thu
  const fetchRevenue = async () => {
    try {
        // Truy vấn tất cả các đơn hàng có trạng thái hoàn thành
        const ordersRef = collection(db, 'order');
        const q = query(ordersRef, where('status', '==', 2)); // Lọc các đơn hàng có status = 2
        const querySnapshot = await getDocs(q);

        // Lọc theo ngày trên client
        let total = 0;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const orderDate = data.date; // Giả sử "date" là Timestamp trong Firestore

            // Kiểm tra sự tồn tại và tính hợp lệ của trường "date"
            if (orderDate instanceof Timestamp) {
                const orderDateJs = orderDate.toDate(); // Chuyển đổi Timestamp thành Date
                // Kiểm tra xem ngày đơn hàng có nằm trong khoảng thời gian đã chọn không
                if (orderDateJs >= startDate && orderDateJs <= endDate) {
                    total += data.totalsPrice || 0; // Cộng doanh thu của đơn hàng vào tổng doanh thu
                }
            }
        });

        setTotalRevenue(total); // Lưu tổng doanh thu vào state
        Alert.alert(
            'Thông báo',
            `Doanh thu từ ${startDate.toLocaleDateString()} đến ${endDate.toLocaleDateString()} là: ${total.toLocaleString()} VND`
        );
    } catch (error) {
        console.error('Error fetching revenue:', error);
        Alert.alert('Có lỗi xảy ra khi tính doanh thu!');
    }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tính Doanh Thu</Text>

      {/* Chọn ngày bắt đầu */}
      <View style={styles.dateContainer}>
        <Text style={styles.label}>Ngày bắt đầu:</Text>
        <TouchableOpacity
          onPress={() => setShowStartPicker(true)}
          style={styles.dateButton}
        >
          <Text style={styles.dateText}>{startDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowStartPicker(false);
              if (date) setStartDate(date);
            }}
          />
        )}
      </View>

      {/* Chọn ngày kết thúc */}
      <View style={styles.dateContainer}>
        <Text style={styles.label}>Ngày kết thúc:</Text>
        <TouchableOpacity
          onPress={() => setShowEndPicker(true)}
          style={styles.dateButton}
        >
          <Text style={styles.dateText}>{endDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setShowEndPicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}
      </View>

      {/* Nút tính doanh thu */}
      <TouchableOpacity
        onPress={fetchRevenue}
        style={styles.calculateButton}
        disabled={loading} // Vô hiệu hóa khi đang loading
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.calculateText}>Tính Doanh Thu</Text>
        )}
      </TouchableOpacity>

      {/* Hiển thị tổng doanh thu */}
      {totalRevenue !== null && (
        <Text style={styles.revenueText}>
          Tổng Doanh Thu: {totalRevenue.toLocaleString()} VND
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dateContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  dateButton: {
    backgroundColor: '#ddd',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
  },
  calculateButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  calculateText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  revenueText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginTop: 30,
    textAlign: 'center',
  },
});

export default RevenueScreen;
