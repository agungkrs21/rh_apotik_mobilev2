import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Image, StyleSheet, Switch, Text, useColorScheme, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function Profil() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const systemTheme = useColorScheme();
  const [darkMode, setDarkMode] = useState(systemTheme === "dark");

  const handleLogout = async () => {
    Alert.alert("Keluar", "Yakin ingin logout?", [
      {
        text: "Batal",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const getAvatarUrl = () => {
    if (!user?.jenis_kelamin) {
      return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    }
    return user.jenis_kelamin === "Laki-laki" ? "https://cdn-icons-png.flaticon.com/512/236/236831.png" : "https://cdn-icons-png.flaticon.com/512/236/236832.png";
  };

  if (!user) return <Text style={{ padding: 20 }}>Memuat profil...</Text>;

  const theme = darkMode ? darkStyles : lightStyles;

  return (
    <View style={theme.container}>
      <Text style={theme.title}>👤 Profil Pengguna</Text>

      <View style={theme.card}>
        <View style={theme.avatarWrapper}>
          <Image source={{ uri: getAvatarUrl() }} style={theme.avatar} />
          <Text style={theme.name}>{user.nama}</Text>
          <Text style={theme.email}>{user.email}</Text>
        </View>

        <View style={theme.infoRow}>
          <Text style={theme.label}>Alamat:</Text>
          <Text style={theme.value}>{user.alamat || "-"}</Text>
        </View>
        <View style={theme.divider} />

        <View style={theme.infoRow}>
          <Text style={theme.label}>Jenis Kelamin:</Text>
          <Text style={theme.value}>{user.jenis_kelamin || "-"}</Text>
        </View>
        <View style={theme.divider} />

        <View style={theme.infoRow}>
          <Text style={theme.label}>Tanggal Lahir:</Text>
          <Text style={theme.value}>{user.tanggal_lahir ? new Date(user.tanggal_lahir).toLocaleDateString() : "-"}</Text>
        </View>
        <View style={theme.divider} />

        <View style={theme.infoRow}>
          <Text style={theme.label}>Peran:</Text>
          <Text style={theme.value}>{user.peran}</Text>
        </View>

        <View style={theme.divider} />

        <View style={[theme.infoRow, { justifyContent: "space-between" }]}>
          <Text style={theme.label}>Mode Gelap:</Text>
          <Switch value={darkMode} onValueChange={toggleTheme} />
        </View>
      </View>

      <View style={{ marginTop: 30 }}>
        <Button title="Logout" color="#dc2626" onPress={handleLogout} />
      </View>
    </View>
  );
}

const sharedStyles = {
  container: { padding: 20, flex: 1 },
  card: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrapper: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 999,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
  },
  email: {
    fontSize: 14,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    marginVertical: 6,
  },
  label: {
    fontWeight: "600",
    width: 130,
  },
  value: {
    flex: 1,
    textAlign: "right",
  },
};

const lightStyles = StyleSheet.create({
  ...sharedStyles,
  container: {
    ...sharedStyles.container,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#1e40af",
  },
  card: {
    ...sharedStyles.card,
    backgroundColor: "#f9fafb",
  },
  divider: {
    ...sharedStyles.divider,
    backgroundColor: "#e5e7eb",
  },
  label: {
    ...sharedStyles.label,
    color: "#374151",
  },
  value: {
    ...sharedStyles.value,
    color: "#4b5563",
  },
  name: {
    ...sharedStyles.name,
    color: "#111827",
  },
  email: {
    ...sharedStyles.email,
    color: "#6b7280",
  },
});

const darkStyles = StyleSheet.create({
  ...sharedStyles,
  container: {
    ...sharedStyles.container,
    backgroundColor: "#1f2937",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#93c5fd",
  },
  card: {
    ...sharedStyles.card,
    backgroundColor: "#374151",
  },
  divider: {
    ...sharedStyles.divider,
    backgroundColor: "#4b5563",
  },
  label: {
    ...sharedStyles.label,
    color: "#d1d5db",
  },
  value: {
    ...sharedStyles.value,
    color: "#e5e7eb",
  },
  name: {
    ...sharedStyles.name,
    color: "#f9fafb",
  },
  email: {
    ...sharedStyles.email,
    color: "#d1d5db",
  },
});
