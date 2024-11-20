import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { useLocalSearchParams } from 'expo-router';

const OrderDetailScreen = () => {
  const { orderCode } = useLocalSearchParams();
  const [orderDetails, setOrderDetails] = useState([]);

  // Truy vấn chi tiết sản phẩm từ bảng products
  const fetchProductDetails = async (productId) => {
    try {
      const productDoc = await getDoc(doc(db, 'products', productId));
      if (productDoc.exists()) {
        return productDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết sản phẩm:', error.message);
      return null;
    }
  };

  // Lấy chi tiết đơn hàng theo order_code và bổ sung thông tin sản phẩm
  const fetchOrderDetails = async () => {
    try {
      const q = query(
        collection(db, 'order_detail'),
        where('order_code', '==', orderCode)
      );
      const querySnapshot = await getDocs(q);

      const detailsArray = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const detail = docSnapshot.data();
          const productData = await fetchProductDetails(detail.productId);
          return {
            ...detail,
            product: productData,
          };
        })
      );

      setOrderDetails(detailsArray);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết đơn hàng:', error.message);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderCode]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Chi tiết đơn hàng: {orderCode}</Text>
      <FlatList
        data={orderDetails}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.detailContainer}>
            {item.product && (
              <>
                <Image
                  source={{ uri: item.product.imageUri }}
                  style={styles.productImage}
                />
                <Text style={styles.detailText}>Tên sản phẩm: {item.product.name}</Text>
              </>
            )}
            <Text style={styles.detailText}>Số lượng: {item.quantity}</Text>
            <Text style={styles.detailText}>Tổng giá: {item.totalPrice} VNĐ</Text>
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
      detailContainer: {
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
      detailText: {
        fontSize: 16,
        color: '#555',
      },
      productImage: {
        width: '80%', // Chiều rộng giảm xuống 80% màn hình
        height: undefined,
        aspectRatio: 1, // Giữ tỷ lệ khung hình (chiều cao tự động)
        borderRadius: 10, // Bo tròn góc
        marginBottom: 10,
        resizeMode: 'cover',
        alignSelf: 'center', // Căn giữa hình ảnh
        borderWidth: 1,
        borderColor: '#ddd', // Viền mờ
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
      },
});

export default OrderDetailScreen;
