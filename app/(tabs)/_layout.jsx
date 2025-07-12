import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
export default function TabLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading]);

  if (isLoading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#2c7be5",
          tabBarLabelStyle: { fontSize: 12 },
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="produk"
          options={{
            title: "Produk",
            tabBarIcon: ({ color, size }) => <Ionicons name="pricetags-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="pesanan"
          options={{
            title: "Pesanan",
            tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="konsultasi"
          options={{
            title: "Konsultasi",
            tabBarIcon: ({ color, size }) => <Ionicons name="chatbox-outline" color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="profil"
          options={{
            title: "Profil",
            tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", // Sesuaikan dengan warna global aplikasi
    paddingBottom: 10,
    paddingTop: 10,
  },
});
