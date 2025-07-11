import { useRouter } from "expo-router";
import { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    alamat: "",
    jk: "",
    tglLahir: "",
    peran: "pengguna",
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://<API_URL_KAMU>/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.replace("/login");
      } else {
        alert("Gagal mendaftar");
      }
    } catch (err) {
      console.error(err);
      alert("Error saat register");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Akun</Text>
      <TextInput placeholder="Nama" style={styles.input} onChangeText={(v) => handleChange("nama", v)} />
      <TextInput placeholder="Email" style={styles.input} onChangeText={(v) => handleChange("email", v)} />
      <TextInput placeholder="Password" secureTextEntry style={styles.input} onChangeText={(v) => handleChange("password", v)} />
      <TextInput placeholder="Alamat" style={styles.input} onChangeText={(v) => handleChange("alamat", v)} />
      <TextInput placeholder="Jenis Kelamin (Laki-laki/Perempuan)" style={styles.input} onChangeText={(v) => handleChange("jk", v)} />
      <TextInput placeholder="Tanggal Lahir (YYYY-MM-DD)" style={styles.input} onChangeText={(v) => handleChange("tglLahir", v)} />
      <Button title="Daftar" onPress={handleSubmit} />
      <Text style={{ marginTop: 10 }} onPress={() => router.replace("/login")}>
        Sudah punya akun? Login di sini
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, marginTop: 60 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 10 },
});
