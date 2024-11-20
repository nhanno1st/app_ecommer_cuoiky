import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions  } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { db } from '../constants/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import ProductCard from '../components/ProductCard';

const ProductScreen = () => {
  const { type, query: searchQuery } = useLocalSearchParams();
  const [products, setProducts] = useState([]);

  const fetchProductsByType = async () => {
    try {
      const q = query(collection(db, 'products'), where('type', '==', type));
      const querySnapshot = await getDocs(q);
      const productsArray = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));
      setProducts(productsArray);
    } catch (error) {
      console.error('Error fetching products by type:', error);
    }
  };

  const fetchProductsBySearchQuery = async () => {
    try {
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      const productsArray = querySnapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter(product => 
          // Kiểm tra xem product.name có tồn tại trước khi gọi toLowerCase()
          product.name && 
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      setProducts(productsArray);
    } catch (error) {
      console.error('Error fetching products by search query:', error);
    }
  };

  useEffect(() => {
    if (type) {
      fetchProductsByType();
    } else if (searchQuery) {
      fetchProductsBySearchQuery();
    }
  }, [type, searchQuery]);

  return (
    <View style={styles.container}>
  <Text style={styles.title}>
    {type
      ? `Products - ${type}`
      : searchQuery
      ? `Search Results for "${searchQuery}"`
      : 'All Products'}
  </Text>
  <FlatList
    data={products}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => (
      <View style={styles.productWrapper}>
        <ProductCard product={item} />
      </View>
    )}
    contentContainerStyle={styles.listContent}
    ListEmptyComponent={<Text style={styles.emptyText}>No products found.</Text>}
    numColumns={Math.floor(Dimensions.get('window').width / 150)} // Tính số cột linh hoạt dựa trên kích thước màn hình
  />
</View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    listContent: {
      flexGrow: 1,
      justifyContent: 'flex-start', // Bắt đầu từ trên
      flexWrap: 'wrap', // Cho phép sản phẩm rớt xuống dòng
      paddingBottom: 16,
    },
    productWrapper: {
      flex: 1, // Chia đều khoảng trống
      margin: 8,
      minWidth: 150, // Đảm bảo một sản phẩm có kích thước tối thiểu
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 20,
      fontSize: 16,
      color: '#999',
    },
  });

export default ProductScreen;