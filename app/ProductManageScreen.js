import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, Image, StyleSheet } from 'react-native';
import { db, auth } from '../constants/firebaseConfig';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { TouchableOpacity } from 'react-native';
import { signOut } from 'firebase/auth';
import { useRouter } from 'expo-router';

const ProductManageScreen = () => {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState(''); // Thêm mô tả
  const [imageUri, setImageUri] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null); // Trạng thái để biết sản phẩm nào đang được sửa
  const router = useRouter();

  // Lấy danh sách sản phẩm từ Firestore
  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, 'products'));
    const productsArray = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })); // Lấy cả ID
    setProducts(productsArray);
  };

  // Thêm sản phẩm mới
  const addProduct = async () => {
    if (!name || !type || !price || !description || !imageUri) {
      alert('Vui lòng nhập đầy đủ thông tin sản phẩm!');
      return;
    }

    const newProduct = {
      name,
      type,
      price,
      description, // Lưu mô tả
      imageUri,
    };

    const productRef = await addDoc(collection(db, 'products'), newProduct);
    await updateDoc(doc(db, 'products', productRef.id), { id: productRef.id }); // Thêm ID sản phẩm
    resetForm();
    fetchProducts();
  };

  // Sửa sản phẩm
  const updateProduct = async () => {
    const productDoc = doc(db, 'products', editingProductId);
    await updateDoc(productDoc, { name, type, price, description, imageUri });
    resetForm();
    fetchProducts();
  };

  // Xóa sản phẩm
  const deleteProduct = async (id) => {
    const productDoc = doc(db, 'products', id);
    await deleteDoc(productDoc);
    fetchProducts();
  };

  // Hiển thị dữ liệu sản phẩm lên form khi nhấn nút "Sửa"
  const editProduct = (product) => {
    setName(product.name);
    setType(product.type);
    setPrice(product.price);
    setDescription(product.description); // Hiển thị mô tả
    setImageUri(product.imageUri);
    setEditingProductId(product.id);
  };

  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert('Bạn cần cấp quyền truy cập thư viện ảnh!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Reset form sau khi thêm hoặc sửa
  const resetForm = () => {
    setName('');
    setType('');
    setPrice('');
    setDescription(''); // Reset mô tả
    setImageUri(null);
    setEditingProductId(null);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        alert('Đăng xuất thành công!');
        router.push('/LoginScreen');
      })
      .catch((error) => {
        alert('Lỗi khi đăng xuất: ' + error.message);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Quản lý sản phẩm</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Tên sản phẩm"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={type}
        onChangeText={setType}
        placeholder="Loại sản phẩm"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={price}
        onChangeText={setPrice}
        placeholder="Giá sản phẩm"
        keyboardType="numeric"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Mô tả sản phẩm"
        placeholderTextColor="#999"
      />
      <View style={styles.buttonContainer}>
        <Button title="Chọn ảnh" onPress={pickImage} color="#4CAF50" />
        {imageUri && <Image source={{ uri: imageUri }} style={styles.imagePreview} />}
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={editingProductId ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
          onPress={editingProductId ? updateProduct : addProduct}
          color="#2196F3"
        />
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productContainer}>
            <Image source={{ uri: item.imageUri }} style={styles.productImage} />
            <View style={styles.productDetails}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.productType}>{item.type}</Text>
              <Text style={styles.productDescription}>{item.description}</Text>
              <Text style={styles.productPrice}>{item.price} VNĐ</Text>
            </View>
            <View style={styles.productActions}>
              <View style={styles.buttonContainer}>
                <Button title="Sửa" onPress={() => editProduct(item)} color="#FFC107" />
              </View>
              <View style={styles.buttonContainer}>
                <Button title="Xóa" onPress={() => deleteProduct(item.id)} color="#F44336" />
              </View>
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F44336',
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginVertical: 15,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  productDetails: {
    flex: 1,
    marginLeft: 15,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  productType: {
    fontSize: 14,
    color: '#777',
    marginVertical: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  productPrice: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    marginHorizontal: 5,
    marginVertical: 10,
  },
});


export default ProductManageScreen;
