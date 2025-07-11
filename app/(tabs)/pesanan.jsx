import { useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Alert, FlatList, Image, LayoutAnimation, Modal, Platform, StyleSheet, Text, TouchableOpacity, UIManager, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
// Untuk enable animasi expand di Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Pesanan = () => {
  const [pesanan, setPesanan] = useState([]);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [buktiBayar, setBuktiBayar] = useState(null);
  const { user } = useAuth();

  const route = useRoute();
  useEffect(() => {
    if (route.params?.produk.id !== undefined) {
      route.params.produk.jumlah = 1;
      route.params.produk.expanded = false;
      setPesanan((prev) => {
        const sudahada = prev.find((item) => item.id === route.params.produk.id);
        if (sudahada) {
          return prev.map((item) => (item.id === route.params.produk.id ? { ...item, jumlah: item.jumlah + 1 } : item));
        } else {
          return [...prev, { ...route.params.produk }];
        }
      });
    }
  }, [route.params]);

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPesanan((prev) => prev.map((item) => (item.id === id ? { ...item, expanded: !item.expanded } : item)));
  };

  const updateJumlah = (id, action) => {
    setPesanan((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          let newJumlah = action === "inc" ? item.jumlah + 1 : item.jumlah - 1;
          if (newJumlah < 1) newJumlah = 1;
          if (newJumlah > item.stok) newJumlah = item.stok;
          return { ...item, jumlah: newJumlah };
        }
        return item;
      })
    );
  };

  const totalBayar = pesanan.reduce((sum, item) => sum + item.jumlah * item.harga, 0);

  const handleClear = () => {
    console.log("Kerangjang dibersihkan");
    setPesanan([]);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setBuktiBayar(result.assets[0].uri);
    }
  };

  const handleKonfirmasi = () => {
    setQrModalVisible(true); // buka modal QR
  };

  const submitPesanan = async () => {
    if (!buktiBayar) {
      Alert.alert("❗ Bukti belum diunggah", "Silakan unggah foto bukti pembayaran terlebih dahulu.");
      return;
    }

    const formData = new FormData();

    // 1. Tambah info user dan data pesanan dalam bentuk JSON string
    formData.append("id_user", user.id.toString());
    formData.append("detail", JSON.stringify(pesanan)); // array produk

    // 2. Tambah file bukti bayar
    formData.append("bukti_bayar", {
      uri: buktiBayar,
      name: "bukti_bayar.jpg",
      type: "image/jpeg",
    });

    try {
      const response = await fetch("http://192.168.119.239:3000/api/pesanan", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
          // Jika pakai Express + multer, biarkan Content-Type seperti ini agar boundary otomatis
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Terjadi kesalahan saat mengirim pesanan.");
      }

      const ringkasan = pesanan.map((p) => `- ${p.nama} x ${p.jumlah} = Rp ${p.harga * p.jumlah}`).join("\n");
      Alert.alert("✅ Pesanan Dikirim", `${ringkasan}\nTotal: Rp ${totalBayar.toLocaleString()}`);
      setQrModalVisible(false);
      setBuktiBayar(null);

      return data;
    } catch (error) {
      console.error("Gagal kirim pesanan:", error);
      setQrModalVisible(false);
      setBuktiBayar(null);
      Alert.alert("👺 gagal mengirm pesanan");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => toggleExpand(item.id)}>
        <View style={styles.cardHeader}>
          <Image source={{ uri: `http://192.168.119.239:3000${item.gambar}` }} style={styles.cardImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.nama}>{item.nama}</Text>
            <Text style={styles.kategori}>{item.kategori}</Text>
            <Text style={styles.harga}>Rp {item.harga.toLocaleString()}</Text>
            <Text style={styles.stok}>Stok: {item.stok}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {item.expanded && (
        <View style={styles.detail}>
          {/* <Text style={styles.deskripsi}>{item.deskripsi}</Text> */}
          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={() => updateJumlah(item.id, "dec")} style={styles.qtyBtn}>
              <Text style={styles.qtyText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyAngka}>{item.jumlah}</Text>
            <TouchableOpacity onPress={() => updateJumlah(item.id, "inc")} style={styles.qtyBtn}>
              <Text style={styles.qtyText}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.totalItem}>Total: Rp {(item.harga * item.jumlah).toLocaleString()}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {pesanan.length > 0 ? (
        <View>
          <Text style={styles.title}>📦 Daftar Pesanan</Text>

          <FlatList data={pesanan} keyExtractor={(item) => item.id.toString()} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 80 }} />

          {/* clear kerangjang */}
          <View style={styles.btnContainer}>
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Text style={styles.clearText}>Berishkan Kerangjang</Text>
            </TouchableOpacity>
          </View>

          {/* Konfirmasij pembelian */}
          <View style={styles.footer}>
            <Text style={styles.totalSemua}>Total Bayar: Rp {totalBayar.toLocaleString()}</Text>
            <TouchableOpacity onPress={handleKonfirmasi} style={styles.konfirmasiBtn}>
              <Text style={styles.konfirmasiText}>✅ Konfirmasi Semua</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View>
          <Text>Belum ada Prduk yang Dipilih</Text>
        </View>
      )}
      {/* qr code scna */}
      <Modal visible={qrModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>📸 Pembayaran</Text>

            <Text>Scan QR untuk bayar:</Text>
            <Image source={require("../../assets/images/icon.png")} style={styles.qrImage} />

            <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
              <Text style={styles.uploadText}>📤 Unggah Bukti Bayar</Text>
            </TouchableOpacity>

            {buktiBayar && <Image source={{ uri: buktiBayar }} style={styles.buktiImage} />}

            <TouchableOpacity style={styles.confirmBtn} onPress={submitPesanan}>
              <Text style={styles.confirmText}>✅ Kirim Pesanan</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setQrModalVisible(false)}>
              <Text style={{ color: "red", marginTop: 10 }}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Pesanan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 10,
  },
  nama: {
    fontWeight: "bold",
    fontSize: 16,
  },
  kategori: {
    fontSize: 12,
    color: "#666",
  },
  harga: {
    fontSize: 14,
    color: "#10b981",
  },
  stok: {
    fontSize: 12,
    color: "#999",
  },
  detail: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  deskripsi: {
    fontSize: 13,
    marginBottom: 10,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  qtyBtn: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  qtyText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  qtyAngka: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: "bold",
  },
  totalItem: {
    fontWeight: "bold",
    color: "#333",
  },
  footer: {
    backgroundColor: "#fff",
    padding: 14,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  totalSemua: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  konfirmasiBtn: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  konfirmasiText: {
    color: "white",
    fontWeight: "bold",
  },
  clearBtn: {
    backgroundColor: "#b51f1f",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  clearText: {
    color: "white",
    fontWeight: "bold",
  },
  btnContainer: {
    padding: 14,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginVertical: 10,
  },
  uploadBtn: {
    backgroundColor: "#fbbf24",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  uploadText: {
    color: "#000",
    fontWeight: "bold",
  },
  buktiImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginTop: 10,
  },
  confirmBtn: {
    backgroundColor: "#10b981",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  confirmText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
