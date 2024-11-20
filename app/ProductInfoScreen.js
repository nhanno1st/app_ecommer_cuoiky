import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useSearchParams, useParams, useLocalSearchParams } from 'expo-router';
import { db } from '../constants/firebaseConfig';
import { collection, doc, getDoc, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const ProductInfoScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    console.log("Product ID:", id); // Ghi log để kiểm tra id có nhận được không
  
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      if (!id) {
        console.error("ID is undefined or null!");
        return;
      }
  
      const fetchProduct = async () => {
        try {
          console.log("Fetching product for ID:", id); // Ghi log trước khi fetch
          const docRef = doc(db, 'products', id);
          const docSnap = await getDoc(docRef);
  
          if (docSnap.exists()) {
            console.log("Product data:", docSnap.data()); // Ghi log dữ liệu sản phẩm
            setProduct(docSnap.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchProduct();
    }, [id]);

  const increaseQuantity = () => setQuantity((prev) => Math.min(prev + 1, 5));
  const decreaseQuantity = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const handleAddToCart = async () => {
    const auth = getAuth();
    const currentUser = auth.currentUser; // Lấy người dùng hiện tại
    
    if (!currentUser) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      return;
    }
  
    const userId = currentUser.uid; // ID duy nhất của người dùng đang đăng nhập
  
    if (!product || !id) {
      console.error('Product or Product ID is missing!');
      return;
    }
  
    try {
      const cartItem = {
        userId: userId, 
        productId: id,
        quantity: quantity,
        totalPrice: product.price * quantity,
      };
  
      const docRef = await addDoc(collection(db, 'cart'), cartItem);
      console.log('Added to cart with ID:', docRef.id);
  router.push('/CartScreen');
      alert('Sản phẩm đã được thêm vào giỏ hàng!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm vào giỏ hàng!');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#28a745" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.imageUri }} style={styles.image} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.description}>{product.description}</Text>
      <Text style={styles.price}>{product.price} VNĐ</Text>

      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={decreaseQuantity} style={styles.quantityButton}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity onPress={increaseQuantity} style={styles.quantityButton}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleAddToCart} style={styles.addToCartButton}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    color: '#28a745',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  quantity: {
    fontSize: 18,
    marginHorizontal: 20,
  },
  addToCartButton: {
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ProductInfoScreen;