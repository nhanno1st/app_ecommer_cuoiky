import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';
import { collection, addDoc, getDoc, getDocs, query, updateDoc, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../constants/firebaseConfig'; // Đảm bảo đúng đường dẫn file config

const CartScreen = () => {
    const router = useRouter();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const userId = currentUser?.uid; // Lấy userId của người dùng đang đăng nhập
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [editingQuantities, setEditingQuantities] = useState({});
    // Lấy danh sách sản phẩm từ Firestore
    const fetchCartItems = async () => {
        if (!userId) {
            Alert.alert('Thông báo', 'Bạn chưa đăng nhập!');
            return;
        }
    
        try {
            const q = query(collection(db, 'cart'), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const cartItems = [];
    
            for (const docSnap of querySnapshot.docs) {
                const cartItem = { id: docSnap.id, ...docSnap.data() };
                const productRef = doc(db, 'products', cartItem.productId);
                const productSnap = await getDoc(productRef);
    
                if (productSnap.exists()) {
                    const productData = productSnap.data();
                    cartItems.push({
                        ...cartItem,
                        name: productData.name,
                        imageUri: productData.imageUri,
                        price: productData.price, // Lấy giá sản phẩm
                    });
                } else {
                    console.warn(`Product with ID ${cartItem.productId} not found!`);
                }
            }
    
            setCartItems(cartItems);
            calculateTotalPrice(cartItems);
        } catch (error) {
            console.error('Error fetching cart items:', error);
            Alert.alert('Có lỗi xảy ra khi lấy danh sách giỏ hàng!');
        }
    };
  
    // Tính tổng giá
    const calculateTotalPrice = (items) => {
      const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
      setTotalPrice(total);
    };
    // sửa
    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            Alert.alert('Thông báo', 'Số lượng không được nhỏ hơn 1!');
            return;
        }
    
        try {
            const itemRef = doc(db, 'cart', itemId);
            const item = cartItems.find((cartItem) => cartItem.id === itemId); // Lấy item từ cartItems
            await updateDoc(itemRef, { quantity: newQuantity, totalPrice: newQuantity * item.price });
            Alert.alert('Thông báo', 'Cập nhật số lượng thành công!');
            fetchCartItems(); // Cập nhật danh sách giỏ hàng sau khi sửa
        } catch (error) {
            console.error('Error updating quantity:', error);
            Alert.alert('Có lỗi xảy ra khi cập nhật số lượng!');
        }
    };
    // Xoá sản phẩm khỏi giỏ hàng
    const handleDelete = async (itemId) => {
      try {
        await deleteDoc(doc(db, 'cart', itemId));
        Alert.alert('Thông báo', 'Sản phẩm đã được xoá!');
        fetchCartItems(); // Cập nhật lại danh sách
      } catch (error) {
        console.error('Error deleting item:', error);
        Alert.alert('Có lỗi xảy ra khi xoá sản phẩm!');
      }
    };
  
    // Xử lý khi nhấn nút "Buy"
    const handleBuy = async () => {
      if (cartItems.length === 0) {
          Alert.alert('Thông báo', 'Giỏ hàng trống!');
          return;
      }
  
      const orderCode = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const orderDate = new Date(); // Lấy ngày hiện tại
  
      try {
          const userId = currentUser?.uid;
          if (!userId) {
              Alert.alert('Thông báo', 'Bạn chưa đăng nhập!');
              return;
          }
  
          // Tính tổng giá của đơn hàng
          const totalsPrice = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  
          // Thêm thông tin đơn hàng vào bảng `order`
          const orderData = {
              order_code: orderCode,
              userId: userId,
              status: 1, // Đặt mặc định là 1
              totalsPrice: totalsPrice,
              date: orderDate, // Thêm trường ngày
          };
  
          await addDoc(collection(db, 'order'), orderData);
  
          // Lặp qua cartItems và thêm vào bảng order_detail
          for (const item of cartItems) {
              const orderDetail = {
                  order_code: orderCode,
                  productId: item.productId,
                  userId: userId,
                  totalPrice: item.totalPrice,
                  quantity: item.quantity,
              };
              await addDoc(collection(db, 'order_detail'), orderDetail);
          }
  
          // Xóa sản phẩm khỏi giỏ hàng
          for (const item of cartItems) {
              await deleteDoc(doc(db, 'cart', item.id));
          }
  
          setCartItems([]);
          setTotalPrice(0);
          Alert.alert('Thông báo', 'Bạn đã mua hàng thành công với mã đơn hàng: ' + orderCode);
          router.push('/OrderScreen');
      } catch (error) {
          console.error('Error during purchase:', error);
          Alert.alert('Có lỗi xảy ra khi mua hàng!');
      }
  };
  
    useEffect(() => {
      fetchCartItems(); // Lấy dữ liệu giỏ hàng khi vào màn hình
    }, []);
  
    // Render từng sản phẩm trong giỏ hàng
    const renderCartItem = ({ item }) => (
        <View style={styles.cartItem}>
            <Image source={{ uri: item.imageUri }} style={styles.image} />
            <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.price}>{item.totalPrice} VNĐ</Text>
                <View style={styles.quantityContainer}>
                    <TouchableOpacity
                        onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        style={styles.quantityButton}
                    >
                        <Text style={styles.quantityButtonText}>-</Text>
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                        onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        style={styles.quantityButton}
                    >
                        <Text style={styles.quantityButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={() => handleDelete(item.id)}
                    style={styles.deleteButton}
                >
                    <Text style={styles.deleteText}>Xoá</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
  
    return (
      <View style={styles.container}>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          renderItem={renderCartItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>Giỏ hàng trống!</Text>}
        />
        <View style={styles.footer}>
          <Text style={styles.totalPrice}>Tổng giá: {totalPrice} VNĐ</Text>
          <TouchableOpacity onPress={handleBuy} style={styles.buyButton}>
            <Text style={styles.buyText}>Buy</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const styles = StyleSheet.create({
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
      },
      quantityButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ddd',
        borderRadius: 5,
      },
      quantityButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
      },
      quantityText: {
        marginHorizontal: 10,
        fontSize: 16,
      },
      updateButton: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
      },
      updateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
      },
    
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 10,
    },
    listContainer: {
      paddingBottom: 20,
    },
    cartItem: {
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
    price: {
      fontSize: 16,
      color: '#28a745',
      fontWeight: 'bold',
    },
    quantity: {
      fontSize: 14,
      color: '#666',
    },
    deleteButton: {
      backgroundColor: '#e74c3c',
      padding: 5,
      borderRadius: 5,
      alignItems: 'center',
      marginTop: 5,
    },
    deleteText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    footer: {
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: '#ddd',
      marginBottom: 40,
    },
    totalPrice: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    buyButton: {
      backgroundColor: '#28a745',
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
    },
    buyText: {
      fontSize: 18,
      color: '#fff',
      fontWeight: 'bold',
    },
    emptyText: {
      textAlign: 'center',
      fontSize: 16,
      color: '#aaa',
      marginTop: 20,
    },
  });
  export default CartScreen;