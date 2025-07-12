import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://192.168.119.239:3000/api/login?tbname=users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Login gagal");
      }

      // Simpan token dan user
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // Simpan ke context
      login(data.user);

      // Redirect ke dashboard
      router.replace("/dashboard");
    } catch (err) {
      Alert.alert("Login Gagal", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToRegister = () => {
    router.replace("/register");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Ratu Glow</Text>

      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={(text) => setEmail(text)} value={email} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={(text) => setPassword(text)} value={password} />

      <Button title={loading ? "Memproses..." : "Login"} onPress={handleLogin} disabled={loading} />

      <Text style={{ marginTop: 15 }} onPress={handleToRegister}>
        Belum punya akun? Daftar
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 80 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
});
