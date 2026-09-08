import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, type Href } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * profile.tsx — SATU halaman panjang yang di-scroll ke bawah.
 * Urutan konten (sesuai desain):
 *   1. Header (Encoré + notifikasi)
 *   2. Foto + nama + email + no HP + tombol EDIT PROFIL / SIMPAN & BATAL
 *   3. Menu card (Riwayat Pesanan, Wishlist, Transfer Tiket, Refund, Notifikasi)
 *   4. Informasi Akun (nama bisa diedit HANYA saat mode edit, email & HP read-only)
 *   5. Keamanan (kata sandi saat ini + kata sandi baru, HANYA saat mode edit)
 *   6. Tombol Keluar dari Akun
 *   7. Versi Aplikasi
 *
 * Tidak ada navigation/toggle screen untuk edit profil — semuanya 1 ScrollView
 * yang sama. Hanya NAMA, KATA SANDI, dan FOTO PROFIL yang bisa diubah, dan
 * HANYA saat tombol "EDIT PROFIL" sudah ditekan (isEditing === true).
 *
 * Tombol "Keluar dari Akun" akan mengarahkan kembali ke halaman /login
 * (app/login.tsx) menggunakan expo-router.
 *
 * Install dependency (kalau belum ada):
 *   npx expo install @expo/vector-icons expo-image-picker
 */

const PAGE_BG = '#FEFCE8';
const CARD_BG = '#FFFFFF';
const ACCENT = '#2E6E6E';
const TEXT_DARK = '#1F2933';
const BACK_ICON_COLOR = '#C77B8A';
const DANGER = '#D24A4A';
const APP_VERSION = '1.4.2';

// Ganti dengan base URL API kamu (idealnya taruh di .env / expo-constants)
const API_BASE_URL = 'http://localhost:3001/api';

type UserData = {
  name: string;
  email: string;
  phone: string;
  photo: string;
};

const DUMMY_USER: UserData = {
  name: 'nayla',
  email: 'naylamutiara@gmail.com',
  phone: '+62 812 3456 78910',
  photo: 'https://i.pravatar.cc/300?img=47',
};

type MenuItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const MENU_ITEMS: MenuItem[] = [
  { key: 'riwayat', label: 'Riwayat Pesanan', icon: 'time-outline' },
  { key: 'wishlist', label: 'Wishlist', icon: 'heart-outline' },
  { key: 'transfer', label: 'Transfer Tiket', icon: 'swap-horizontal-outline' },
  { key: 'refund', label: 'Refund', icon: 'sync-outline' },
  { key: 'notifikasi', label: 'Notifikasi', icon: 'notifications-outline' },
];

export default function Profile() {
  const router = useRouter();

  const [user, setUser] = useState<UserData>(DUMMY_USER);
  const [loading, setLoading] = useState<boolean>(true);

  // Mode edit — dikontrol oleh tombol EDIT PROFIL
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Field yang bisa diedit (hanya aktif saat isEditing === true)
  const [name, setName] = useState<string>(user.name);
  const [photo, setPhoto] = useState<string>(user.photo);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
       console.log("TOKEN PROFILE:", token);

      if (!token) {
        router.replace('/login' as Href);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

       console.log("STATUS PROFILE:", response.status);


      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        // Token sudah tidak valid
        await AsyncStorage.removeItem('token');
        console.log(
  "TOKEN TERSIMPAN:",
  await AsyncStorage.getItem('token')
);
        router.replace('/login' as Href);
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.message || result.msg || 'Gagal mengambil data profile'
        );
      }

      const profileData: UserData = result.data ?? result.user;

      setUser(profileData);
      setName(profileData.name);
      setPhoto(profileData.photo);
    } catch (error) {
      console.error('PROFILE ERROR:', error);
      Alert.alert(
        'Gagal memuat profil',
        error instanceof Error ? error.message : 'Terjadi kesalahan.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEnterEditMode = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Kembalikan semua field ke nilai tersimpan terakhir
    setName(user.name);
    setPhoto(user.photo);
    setCurrentPassword('');
    setNewPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setIsEditing(false);
  };

  const handlePickPhoto = async () => {
    if (!isEditing) return; // jaga-jaga: hanya bisa ganti foto saat mode edit

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin diperlukan', 'Aktifkan akses galeri untuk mengganti foto profil.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  const validate = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Nama tidak boleh kosong');
      return false;
    }
    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      Alert.alert(
        'Lengkapi kata sandi',
        'Isi kata sandi saat ini dan kata sandi baru untuk mengganti password.'
      );
      return false;
    }
    if (newPassword && newPassword.length < 6) {
      Alert.alert('Kata sandi baru minimal 6 karakter');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);

    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        router.replace('/login' as Href);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          photo: photo,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);
console.log("USER:", data.user);
console.log("TOKEN:", data.token);

      if (response.status === 401 || response.status === 403) {
        await AsyncStorage.removeItem('token');
        router.replace('/login' as Href);
        return;
      }

if (!response.ok) {
  console.log("STATUS:", response.status);
  console.log("RESPONSE BACKEND:", data);

  throw new Error(
    data.message ||
    data.msg ||
    data.error ||
    `Server error ${response.status}`
  );
}

      // Data berhasil disimpan
      const updatedUser: UserData = data.user ?? data.data;
      setUser(updatedUser);
      setName(updatedUser.name);
      setPhoto(updatedUser.photo);

      setCurrentPassword('');
      setNewPassword('');
      setIsEditing(false);

      Alert.alert('Berhasil', 'Profil berhasil diperbarui.');
    } catch (error) {
      console.error('UPDATE PROFILE ERROR:', error);

      Alert.alert('Gagal', error instanceof Error ? error.message : 'Gagal memperbarui profile');
    } finally {
      setSaving(false);
    }
  };

  // Menutup sesi user lalu mengarahkan kembali ke halaman /login
  // (app/login.tsx) memakai expo-router. `replace` dipakai supaya
  // halaman profil tidak bisa dicapai lagi lewat tombol back.
  const performLogout = async () => {
    try {
      setLoggingOut(true);

      // Hapus token/login session
      await AsyncStorage.removeItem('token');

      // Pindah ke halaman login
      router.replace('/login' as Href);
    } catch (error) {
      console.error('LOGOUT ERROR:', error);
      Alert.alert(
        'Gagal',
        'Tidak bisa keluar dari akun saat ini. Coba lagi.'
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Apakah kamu yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={BACK_ICON_COLOR} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Encoré</Text>

        <TouchableOpacity style={styles.headerIconBtn}>
          <Ionicons name="notifications-outline" size={22} color={TEXT_DARK} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Satu ScrollView panjang untuk semua konten */}
        <ScrollView
          style={styles.body}
          contentContainerStyle={{ paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
        >
          {/* ============ BAGIAN 1: Foto + info dasar ============ */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: photo }} style={styles.avatar} />
              {isEditing && (
                <TouchableOpacity style={styles.avatarEditBtn} onPress={handlePickPhoto}>
                  <Ionicons name="pencil" size={14} color="#fff" />
                </TouchableOpacity>
              )}
            </View>

            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.subText}>{user.email}</Text>
            <Text style={styles.subText}>{user.phone}</Text>

            {!isEditing ? (
              <TouchableOpacity style={styles.editProfileBtn} onPress={handleEnterEditMode}>
                <Text style={styles.editProfileText}>EDIT PROFIL</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.editActionsRow}>
                <TouchableOpacity
                  style={[styles.editActionBtn, styles.cancelBtn]}
                  onPress={handleCancelEdit}
                  disabled={saving}
                >
                  <Text style={styles.cancelBtnText}>BATAL</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editActionBtn, styles.saveBtnSmall]}
                  onPress={handleSave}
                  disabled={saving}
                >
                  <Text style={styles.saveBtnSmallText}>
                    {saving ? 'MENYIMPAN...' : 'SIMPAN'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* ============ BAGIAN 2: Menu card ============ */}
          <View style={styles.menuCard}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.menuItem,
                  index === MENU_ITEMS.length - 1 && { borderBottomWidth: 0 },
                ]}
                activeOpacity={0.6}
              >
                <View style={styles.menuIconWrap}>
                  <Ionicons name={item.icon} size={18} color={ACCENT} />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={18} color="#B9B9B9" />
              </TouchableOpacity>
            ))}
          </View>

          {/* ============ BAGIAN 3: Informasi Akun ============ */}
          <Text style={styles.sectionTitle}>Informasi Akun</Text>
          <View style={styles.card}>
            {/* Nama - hanya bisa diedit saat isEditing === true */}
            <Text style={styles.label}>NAMA LENGKAP</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#B9B9B9"
              />
            ) : (
              <View style={[styles.input, styles.inputDisabled]}>
                <Text style={styles.inputDisabledText}>{user.name}</Text>
              </View>
            )}

            {/* Email - selalu read-only */}
            <Text style={styles.label}>EMAIL</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{user.email}</Text>
            </View>

            {/* Nomor HP - selalu read-only */}
            <Text style={styles.label}>NOMOR HP</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={styles.inputDisabledText}>{user.phone}</Text>
            </View>
          </View>

          {/* ============ BAGIAN 4: Keamanan (hanya muncul saat edit) ============ */}
          {isEditing && (
            <>
              <Text style={styles.sectionTitle}>Keamanan</Text>
              <View style={styles.card}>
                <Text style={styles.label}>KATA SANDI SAAT INI</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="********"
                    placeholderTextColor="#B9B9B9"
                    secureTextEntry={!showCurrentPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowCurrentPassword((v) => !v)}
                  >
                    <Ionicons
                      name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#5B6B6B"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>KATA SANDI BARU</Text>
                <View style={styles.passwordRow}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Masukkan kata sandi baru"
                    placeholderTextColor="#B9B9B9"
                    secureTextEntry={!showNewPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowNewPassword((v) => !v)}
                  >
                    <Ionicons
                      name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={18}
                      color="#5B6B6B"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}

          {/* ============ BAGIAN 5: Keluar dari akun ============ */}
          <TouchableOpacity
            style={[styles.logoutBtn, loggingOut && { opacity: 0.6 }]}
            onPress={handleLogout}
            disabled={loggingOut}
          >
            <Ionicons name="log-out-outline" size={16} color={DANGER} />
            <Text style={styles.logoutText}>
              {loggingOut ? 'MEMPROSES...' : 'KELUAR DARI AKUN'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>Versi Aplikasi {APP_VERSION}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------------------------------------------------------------ */
/* STYLES                                                               */
/* ------------------------------------------------------------------ */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: PAGE_BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2B3A67',
    fontStyle: 'italic',
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 20,
  },
  avatarWrapper: {
    width: 88,
    height: 88,
    marginBottom: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: '#9FD8D8',
  },
  avatarEditBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: PAGE_BG,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: '#5B6B6B',
    marginBottom: 2,
  },
  editProfileBtn: {
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: ACCENT,
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 26,
  },
  editProfileText: {
    color: ACCENT,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  editActionsRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
  },
  editActionBtn: {
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 22,
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: '#B9B9B9',
  },
  cancelBtnText: {
    color: '#5B6B6B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  saveBtnSmall: {
    backgroundColor: ACCENT,
  },
  saveBtnSmallText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  menuCard: {
    backgroundColor: CARD_BG,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4EDE4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 13,
    color: TEXT_DARK,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 10,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A8A8A',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: TEXT_DARK,
    backgroundColor: '#FCFCFC',
  },
  inputDisabled: {
    backgroundColor: '#F4F4F4',
    borderColor: '#EAEAEA',
    justifyContent: 'center',
  },
  inputDisabledText: {
    fontSize: 14,
    color: '#9B9B9B',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: DANGER,
    borderRadius: 26,
    paddingVertical: 14,
    marginTop: 20,
    gap: 8,
  },
  logoutText: {
    color: DANGER,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  versionText: {
    textAlign: 'center',
    color: '#B3B3B3',
    fontSize: 12,
    marginTop: 14,
  },
});