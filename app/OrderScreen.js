import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, Alert } from 'react-native';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';

const OrderScreen = () => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const userId = currentUser?.uid;
    const [orderItems, setOrderItems] = useState([]);

    const fetchOrderItems = async () => {
        if (!userId) {
            Alert.alert('Thông báo', 'Bạn chưa đăng nhập!');
            return;
        }

        try {
            const q = query(collection(db, 'order_detail'), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const orders = [];

            for (const docSnap of querySnapshot.docs) {
                const orderItem = { id: docSnap.id, ...docSnap.data() };
                
                // Lấy thông tin sản phẩm từ bảng `products` dựa trên `productId`
                const productRef = doc(db, 'products', orderItem.productId);
                const productSnap = await getDoc(productRef);

                if (productSnap.exists()) {
                    const productData = productSnap.data();
                    orders.push({
                        ...orderItem,
                        name: productData.name,
                        imageUri: productData.imageUri,
                    });
                } else {
                    console.warn(`Product with ID ${orderItem.productId} not found!`);
                }
            }

            setOrderItems(orders);
        } catch (error) {
            console.error('Error fetching order items:', error);
            Alert.alert('Có lỗi xảy ra khi lấy danh sách đơn hàng!');
        }
    };

    useEffect(() => {
        fetchOrderItems();
    }, []);

    const renderOrderItem = ({ item }) => (
        <View style={styles.orderItem}>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.quantity}>Số lượng: {item.quantity}</Text>
                <Text style={styles.price}>Giá: {item.totalPrice} VNĐ</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={orderItems}
                keyExtractor={(item) => item.id}
                renderItem={renderOrderItem}
                ListEmptyComponent={<Text style={styles.emptyText}>Bạn chưa có đơn hàng nào!</Text>}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    orderItem: {
        flexDirection: 'row',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 10,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    info: {
        flex: 1,
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    quantity: {
        fontSize: 16,
        color: '#666',
    },
    price: {
        fontSize: 16,
        color: '#28a745',
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#aaa',
        marginTop: 20,
    },
});

export default OrderScreen;