import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const ProductCard = ({ product }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/ProductInfoScreen/?id=${product.id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.productCard}>
      <Image
        source={
          product.imageUri
            ? { uri: product.imageUri }
            : require('../assets/images/accessory.png')
        }
        style={styles.productImage}
      />
      <Text style={styles.productName}>{product.name}</Text>
      <Text style={styles.productPrice}>{product.price} VNĐ</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: 150,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
});

export default ProductCard;