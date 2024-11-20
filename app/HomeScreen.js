import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ScrollView, TouchableOpacity, Image, Button } from 'react-native';
import { db } from '../constants/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';
import Swiper from 'react-native-swiper';
import ProductCard from '../components/ProductCard'; // Import ProductCard
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const categories = [
    { name: "phone", image: require("../assets/images/phone.jpg") },
    { name: "laptop", image: require("../assets/images/laptop.jpg") },
    { name: "tablet", image: require("../assets/images/tablet.jpg") },
    { name: "accessory", image: require("../assets/images/accessory.png") },
  ];

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productsArray = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    setProducts(productsArray);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filterProductsByType = (type) => products.filter(product => product.type === type).slice(0, 6);

  return (
    <ScrollView style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
      <TouchableOpacity onPress={() => router.push(`/ProductScreen/?query=${searchQuery}`)}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for products..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity onPress={() => setSearchQuery('')}>
          <Ionicons name="close-circle" size={20} color="#999" style={styles.clearIcon} />
        </TouchableOpacity>
        
      </View>

      {/* Product Categories */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <View style={styles.categories}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={styles.categoryItem}
            onPress={() => router.push(`/ProductScreen/?type=${category.name.toLowerCase()}`)}
          >
            <Image source={category.image} style={styles.categoryImage} />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Slideshow */}
      <View style={styles.slideshow}>
        <Swiper autoplay autoplayTimeout={3} showsPagination={true}>
          <Image source={require("../assets/images/image1.jpg")} style={styles.slideshowImage} />
          <Image source={require("../assets/images/image2.png")} style={styles.slideshowImage} />
          <Image source={require("../assets/images/image3.jpg")} style={styles.slideshowImage} />
          <Image source={require("../assets/images/image4.png")} style={styles.slideshowImage} />
        </Swiper>
      </View>

      {/* Trending Deals */}
      <View style={styles.trendingDeals}>
        <Text style={styles.sectionTitle}>Trending Deals of the Week</Text>
        <FlatList
          data={products.slice(0, 6)}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />} // Sử dụng ProductCard
        />
      </View>

      {/* Top Phones */}
      <View style={styles.trendingDeals}>
        <Text style={styles.sectionTitle}>Top Phones of the Week</Text>
        <FlatList
          data={filterProductsByType('phone')}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />} // Sử dụng ProductCard
        />
      </View>

      {/* Top Laptops */}
      <View style={styles.trendingDeals}>
        <Text style={styles.sectionTitle}>Top Laptops of the Week</Text>
        <FlatList
          data={filterProductsByType('laptop')}
          horizontal
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductCard product={item} />} // Sử dụng ProductCard
        />
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearIcon: {
    marginLeft: 8,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10,
  },
  categoryItem: {
    alignItems: 'center',
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
  slideshow: {
    height: 200,
    margin: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  slideshowImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  trendingDeals: {
    margin: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginLeft: 10,

  },
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

export default HomeScreen;