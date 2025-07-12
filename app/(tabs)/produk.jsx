import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useEffect, useState } from "react";
import { ActivityIndicator, Button, FlatList, Image, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const Produk = () => {
  const [produk, setProduk] = useState([]);
  const [filteredProduk, setFilteredProduk] = useState([]);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [hideOutOfStock, setHideOutOfStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const fetchProduk = async () => {
    try {
      const res = await axios.get("http://192.168.119.239:3000/api/produk");
      setProduk(res.data);
      setFilteredProduk(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduk();
  }, []);

  useEffect(() => {
    const filtered = produk.filter((item) => {
      const matchSearch = item.nama.toLowerCase().includes(search.toLowerCase());
      const matchKategori = !kategori || item.kategori.toLowerCase() === kategori.toLowerCase();
      const matchStock = !hideOutOfStock || item.stok > 0;
      return matchSearch && matchKategori && matchStock;
    });
    setFilteredProduk(filtered);
  }, [search, kategori, hideOutOfStock, produk]);

  const handleCardPress = (item) => {
    setSelectedProduk(item);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <TouchableOpacity onPress={() => handleCardPress(item)} activeOpacity={1} style={{ flex: 1 }}>
        <Image source={{ uri: `http://192.168.119.239:3000${item.gambar}` }} style={styles.image} />
        <Text style={styles.name}>{item.nama}</Text>
        <Text style={styles.category}>{item.kategori}</Text>
        <Text style={styles.price}>Rp{item.harga.toLocaleString()}</Text>
        <Text style={[styles.stock, item.stok === 0 && { color: "red" }]}>Stok: {item.stok}</Text>
      </TouchableOpacity>

      {item.stok > 0 && (
        <TouchableOpacity style={styles.buyButton} onPress={() => navigation.navigate("pesanan", { produk: item })}>
          <Text style={styles.buyText}>➕ Pesanan</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* FILTER */}
      <View style={styles.filterRow}>
        <TextInput placeholder="🔍 Cari produk..." value={search} onChangeText={setSearch} style={styles.input} />
        {/* <TextInput placeholder="Kategori (opsional)" value={kategori} onChangeText={setKategori} style={styles.input} /> */}
        <TouchableOpacity onPress={() => setHideOutOfStock(!hideOutOfStock)} style={styles.outStockToggle}>
          <Ionicons name={hideOutOfStock ? "eye-off" : "eye"} size={20} color="#333" />
          <Text style={{ marginLeft: 4 }}>Stok habis</Text>
        </TouchableOpacity>
      </View>

      {/* PRODUK LIST */}
      {loading ? (
        <ActivityIndicator size="large" color="#888" />
      ) : (
        <FlatList data={filteredProduk} renderItem={renderItem} keyExtractor={(item) => item.id.toString()} numColumns={2} contentContainerStyle={{ paddingBottom: 80 }} />
      )}

      {/* MODAL DETAIL PRODUK */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProduk && (
              <>
                <Image source={{ uri: `http://192.168.119.239:3000${selectedProduk.gambar}` }} style={styles.modalImage} />
                <Text style={styles.modalName}>{selectedProduk.nama}</Text>
                <Text style={styles.modalKategori}>Kategori: {selectedProduk.kategori}</Text>
                <Text style={styles.modalHarga}>Harga: Rp{selectedProduk.harga.toLocaleString()}</Text>
                <Text>Stok: {selectedProduk.stok}</Text>
                <Text style={styles.modalDeskripsi}>Deskripsi: {selectedProduk.deskripsi}</Text>

                {/* {selectedProduk.stok > 0 && <Button title="💳 Beli Sekarang" onPress={() => alert("Navigasi ke pesanan")} />} */}

                <View style={{ marginTop: 10 }}>
                  <Button title="❌ Tutup" onPress={() => setModalVisible(false)} color="#999" />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Produk;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f9fafb",
    paddingTop: 20,
  },
  filterRow: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: "white",
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  outStockToggle: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    margin: 5,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  category: {
    color: "#666",
    fontSize: 12,
  },
  price: {
    color: "#10b981",
    fontWeight: "bold",
    marginTop: 4,
  },
  stock: {
    fontSize: 12,
    marginBottom: 6,
  },
  buyButton: {
    backgroundColor: "#2563eb",
    padding: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buyText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
  },
  modalImage: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalKategori: {
    fontSize: 14,
    marginVertical: 4,
  },
  modalHarga: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#16a34a",
  },
  modalDeskripsi: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
  },
});
