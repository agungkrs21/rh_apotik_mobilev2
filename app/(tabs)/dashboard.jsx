import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, Modal, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { useAuth } from "../../context/AuthContext";

const screenWidth = Dimensions.get("window").width;

const Dashboard = () => {
  const { user } = useAuth();
  const navigation = useNavigation();

  const [pesanan, setPesanan] = useState([]);
  const [konsultasi, setKonsultasi] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedPesanan, setSelectedPesanan] = useState(null);
  const [selectedDetail, setSelectedDetail] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resKonsultasi = await fetch(`http://192.168.119.239:3000/api/konsultasi/${user.id}`);
      const dataKonsultasi = await resKonsultasi.json();
      setKonsultasi(dataKonsultasi);

      const resPesanan = await fetch(`http://192.168.119.239:3000/api/pesanan/${user.id}`);
      const dataPesanan = await resPesanan.json();
      setPesanan(dataPesanan);
    } catch (err) {
      console.error("Gagal fetch data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const resDetailPesanan = await fetch(`http://192.168.119.239:3000/api/pesanan/detail_pesanan/${selectedPesanan.id_pesanan}`);
      const dataDetailPesanan = await resDetailPesanan.json();
      setSelectedDetail(dataDetailPesanan);
      console.log(dataDetailPesanan);
    } catch (error) {
      onsole.error("Gagal fetch detail:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchDetail();
  }, [selectedPesanan]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  const filteredPesanan = statusFilter ? pesanan.filter((p) => p.status_pembelian === statusFilter) : pesanan;

  const konsultasiBelumDijawab = konsultasi.filter((k) => k.status_konsultasi === "menunggu");

  const statusCounts = {
    menunggu: 0,
    diterima: 0,
    selesai: 0,
    dibatalkan: 0,
  };
  pesanan.forEach((p) => {
    statusCounts[p.status_pembelian]++;
  });

  const chartData = [
    {
      name: "Menunggu",
      count: statusCounts.menunggu,
      color: "#facc15",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Diterima",
      count: statusCounts.diterima,
      color: "#60a5fa",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Selesai",
      count: statusCounts.selesai,
      color: "#22c55e",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
    {
      name: "Dibatalkan",
      count: statusCounts.dibatalkan,
      color: "#ef4444",
      legendFontColor: "#333",
      legendFontSize: 12,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Dashboard</Text>

        <TouchableOpacity onPress={() => navigation.navigate("konsultasi")}>
          <Ionicons name="chatbubbles-outline" size={28} color="#333" />
          {konsultasiBelumDijawab.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{konsultasiBelumDijawab.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.subheading}>Ringkasan Pesanan</Text>
      <View style={{ backgroundColor: "#fff", padding: 10 }}>
        <PieChart
          data={chartData}
          width={screenWidth - 40}
          height={180}
          chartConfig={{
            ackgroundColor: "white",
            backgroundGradientFrom: "white",
            backgroundGradientTo: "white",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726",
            },
          }}
          accessor="count"
          paddingLeft="15"
          absolute
          backgroundColor="transparent"
        />
      </View>

      {/* FILTER STATUS */}
      <View style={styles.filterRow}>
        {["", "menunggu", "diterima", "selesai", "dibatalkan"].map((status) => (
          <TouchableOpacity key={status} style={[styles.filterBtn, statusFilter === status && styles.filterBtnActive]} onPress={() => setStatusFilter(status)}>
            <Text style={styles.filterText}>{status === "" ? "Semua" : status.charAt(0).toUpperCase() + status.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST PESANAN */}
      {loading ? (
        <ActivityIndicator size="large" color="#888" />
      ) : (
        <FlatList
          data={filteredPesanan}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                setSelectedPesanan(item);
                setModalVisible(true);
              }}
            >
              <Text style={styles.cardTitle}>ID: {item.id_pesanan}</Text>
              <Text>Status: {item.status_pembelian}</Text>
              <Text>Tanggal: {new Date(item.tanggal_pembelian).toLocaleString()}</Text>
            </TouchableOpacity>
          )}
        />
      )}
      {/* modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Detail Pesanan</Text>
            {selectedPesanan && (
              <>
                <Text>ID Pesanan: {selectedPesanan.id_pesanan}</Text>
                <Text>Status: {selectedPesanan.status_pembelian}</Text>
                <Text>Tanggal: {new Date(selectedPesanan.tanggal_pembelian).toLocaleString()}</Text>
                {/* Tambahkan detail lainnya di sini */}

                {selectedDetail.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Daftar Produk:</Text>
                    {selectedDetail.map((detail, index) => (
                      <View key={index} style={{ marginBottom: 8 }}>
                        <Text>Produk: {detail.nama_produk}</Text>
                        <Text>Jumlah: {detail.jumlah}</Text>
                        <Text>Harga: Rp {parseInt(detail.harga).toLocaleString("id-ID")}</Text>
                        <Text>Total: Rp {parseInt(detail.total).toLocaleString("id-ID")}</Text>
                      </View>
                    ))}

                    <Text style={{ fontWeight: "bold", marginTop: 10 }}>Total Pesanan: Rp {selectedDetail.reduce((acc, curr) => acc + parseInt(curr.total), 0).toLocaleString("id-ID")}</Text>
                  </View>
                )}
              </>
            )}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={{ color: "white", textAlign: "center" }}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -6,
    backgroundColor: "red",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  subheading: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    marginRight: 6,
    marginBottom: 6,
  },
  filterBtnActive: {
    backgroundColor: "#2563eb",
  },
  filterText: {
    color: "#000",
  },
  card: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 1,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  closeBtn: {
    marginTop: 20,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
  },
});
