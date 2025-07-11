// app/(tabs)/konsultasi.jsx

import { useAuth } from "@/context/AuthContext";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, FlatList, Modal, RefreshControl, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from "react-native";

const API = "http://192.168.119.239:3000/api/konsultasi"; // ganti dengan URL backend kamu

export default function Konsultasi() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [konsultasi, setKonsultasi] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [topik, setTopik] = useState("");
  const [catatan, setCatatan] = useState("");
  const [editId, setEditId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("semua");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      const res = await fetch(`${API}/${user.id}`);
      const json = await res.json();
      setKonsultasi(json.sort((a, b) => new Date(b.tanggal_konsultasi) - new Date(a.tanggal_konsultasi)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert("Konfirmasi", "Yakin ingin menghapus konsultasi ini?", [
      { text: "Batal" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          try {
            await fetch(`${API}/${id}`, { method: "DELETE" });
            fetchData();
          } catch (err) {
            Alert.alert("Gagal menghapus konsultasi");
          }
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!topik || !catatan) return Alert.alert("Lengkapi semua bidang!");

    const payload = {
      id_user: user.id,
      id_dokter: 83,
      topik,
      catatan,
      status_konsultasi: "menunggu",
    };

    try {
      const res = await fetch(editId ? `${API}/${editId}` : API, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setModalVisible(false);
      setTopik("");
      setCatatan("");
      setEditId(null);
      fetchData();
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal mengirim konsultasi");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = konsultasi.filter((item) => {
    const matchUser = item.id_user === user.id;
    const matchStatus = statusFilter === "semua" || item.status_konsultasi === statusFilter;
    const matchSearch = item.topik.toLowerCase().includes(search.toLowerCase()) || item.catatan.toLowerCase().includes(search.toLowerCase());
    return matchUser && matchStatus && matchSearch;
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0f172a" : "#fff",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 16,
    },
    searchBox: {
      paddingHorizontal: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: isDark ? "#334155" : "#cbd5e1",
      borderRadius: 8,
      padding: 10,
      color: isDark ? "#fff" : "#000",
      backgroundColor: isDark ? "#1e293b" : "#f8fafc",
      marginBottom: 8,
    },
    filterRow: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginBottom: 12,
    },
    filterButton: (active, color) => ({
      backgroundColor: active ? color : "transparent",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
    }),
    filterText: (active) => ({
      color: active ? "#fff" : isDark ? "#fff" : "#000",
      fontWeight: active ? "bold" : "normal",
    }),
    itemBox: {
      backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 10,
      borderRadius: 12,
    },
    itemTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: isDark ? "#fff" : "#000",
    },
    itemText: {
      color: isDark ? "#ccc" : "#333",
      marginTop: 4,
    },
    actionRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginTop: 10,
    },
    deleteBtn: {
      padding: 6,
      marginLeft: 8,
    },
    addButton: {
      position: "absolute",
      bottom: 30,
      right: 20,
      backgroundColor: "#2563eb",
      padding: 16,
      borderRadius: 50,
      elevation: 4,
    },
    modalContainer: {
      flex: 1,
      padding: 20,
      backgroundColor: isDark ? "#0f172a" : "#fff",
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      marginBottom: 20,
      color: isDark ? "#fff" : "#000",
    },
    submitButton: {
      backgroundColor: "#2563eb",
      padding: 12,
      borderRadius: 8,
      alignItems: "center",
      marginTop: 12,
    },
    submitButtonText: {
      color: "#fff",
      fontWeight: "bold",
    },
  });

  const statusColors = {
    menunggu: "#facc15",
    diterima: "#22c55e",
    selesai: "#3b82f6",
    dibatalkan: "#ef4444",
    semua: "#6b7280",
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>Konsultasi</Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput style={styles.input} placeholder="Cari topik / catatan..." placeholderTextColor={isDark ? "#aaa" : "#666"} value={search} onChangeText={setSearch} />
      </View>

      <View style={styles.filterRow}>
        {Object.keys(statusColors).map((status) => (
          <TouchableOpacity key={status} style={styles.filterButton(statusFilter === status, statusColors[status])} onPress={() => setStatusFilter(status)}>
            <Text style={styles.filterText(statusFilter === status)}>{status}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
        renderItem={({ item }) => (
          <View style={styles.itemBox}>
            <Text style={styles.itemTitle}>{item.topik}</Text>
            <Text style={styles.itemText}>{item.catatan}</Text>
            <Text style={[styles.itemText, { color: statusColors[item.status_konsultasi] || "#999" }]}>Status: {item.status_konsultasi}</Text>
            {item.balasan && <Text style={[styles.itemText, { color: "#16a34a" }]}>Balasan: {item.balasan}</Text>}

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash-outline" size={20} color="tomato" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => {
                  setTopik(item.topik);
                  setCatatan(item.catatan);
                  setEditId(item.id);
                  setModalVisible(true);
                }}
              >
                <Ionicons name="create-outline" size={20} color={isDark ? "#fff" : "#000"} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setTopik("");
          setCatatan("");
          setEditId(null);
          setModalVisible(true);
        }}
      >
        <AntDesign name="plus" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editId ? "Edit Konsultasi" : "Ajukan Konsultasi"}</Text>
          <TextInput placeholder="Topik" placeholderTextColor={isDark ? "#aaa" : "#999"} value={topik} onChangeText={setTopik} style={styles.input} />
          <TextInput
            placeholder="Catatan"
            placeholderTextColor={isDark ? "#aaa" : "#999"}
            value={catatan}
            onChangeText={setCatatan}
            multiline
            numberOfLines={4}
            style={[styles.input, { height: 100 }]}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>{editId ? "Update" : "Kirim Konsultasi"}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>Batal</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
