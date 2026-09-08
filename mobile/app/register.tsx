import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, { toValue: 0.96, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(buttonScale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const toggleAgreed = () => {
    setAgreed(!agreed);
    Animated.sequence([
      Animated.timing(checkScale, { toValue: 0.8, duration: 80, useNativeDriver: true }),
      Animated.spring(checkScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

const handleRegister = async () => {
  if (!fullName || !email || !phone || !password || !confirmPassword) {
    alert('Semua data harus diisi');
    return;
  }

  if (password !== confirmPassword) {
    alert('Konfirmasi kata sandi tidak cocok');
    return;
  }

  if (!agreed) {
    alert('Silakan setujui Syarat & Ketentuan');
    return;
  }

  try {
    console.log('Mengirim register...');

    const response = await fetch(
      'http://localhost:3001/api/auth/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fullName,
          email,
          phone,
          password,
        }),
      }
    );

    const data = await response.json();

    console.log('STATUS:', response.status);
    console.log('DATA:', data);

    if (!response.ok) {
      alert(data.message || data.msg || 'Registrasi gagal');
      return;
    }

    alert('Registrasi berhasil!');

    router.replace('/login');

  } catch (error) {
    console.error('REGISTER ERROR:', error);
    alert('Tidak dapat terhubung ke server');
  }
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFF6DD" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#4A6FA5" />
        </TouchableOpacity>
        <Text style={styles.logo}>Encoré</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <Text style={styles.title}>Pendaftaran</Text>

          {/* Nama Lengkap */}
          <Text style={styles.label}>NAMA LENGKAP</Text>
          <TextInput
            style={styles.input}
            placeholder="Nama lengkap"
            placeholderTextColor="#B0B0B0"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Email */}
          <Text style={styles.label}>EMAIL</Text>
          <TextInput
            style={styles.input}
            placeholder="nama@email.com"
            placeholderTextColor="#B0B0B0"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {/* Nomor HP */}
          <Text style={styles.label}>NOMOR HP</Text>
          <TextInput
            style={styles.input}
            placeholder="+62 8xx xxxx xxxx"
            placeholderTextColor="#B0B0B0"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          {/* Kata Sandi */}
          <Text style={styles.label}>KATA SANDI</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#B0B0B0"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Konfirmasi Kata Sandi */}
          <Text style={styles.label}>KONFIRMASI KATA SANDI</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="••••••••"
              placeholderTextColor="#B0B0B0"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Checkbox syarat & ketentuan */}
          <TouchableOpacity
            style={styles.checkboxRow}
            activeOpacity={0.8}
            onPress={toggleAgreed}
          >
            <Animated.View
              style={[
                styles.checkbox,
                agreed && styles.checkboxChecked,
                { transform: [{ scale: checkScale }] },
              ]}
            >
              {agreed && <Ionicons name="checkmark" size={14} color="#fff" />}
            </Animated.View>
            <Text style={styles.checkboxText}>
              Saya menyetujui <Text style={styles.linkText}>Syarat & Ketentuan</Text> serta{' '}
              <Text style={styles.linkText}>Kebijakan Privasi</Text> yang berlaku.
            </Text>
          </TouchableOpacity>

          {/* Tombol Buat Akun */}
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleRegister}
              disabled={!agreed}
              style={[styles.button, !agreed && styles.buttonDisabled]}
            >
              <Text style={styles.buttonText}>Buat Akun</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Sudah punya akun */}
         <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginTextMuted}>
              Sudah punya akun? <Text style={styles.loginBold}>Masuk</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6DD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 54 : 34,
    paddingBottom: 16,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E6B',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5D9B0',
    paddingVertical: 8,
    fontSize: 15,
    color: '#1F2937',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E5D9B0',
    paddingVertical: 8,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 22,
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#C7BE99',
    marginRight: 10,
    marginTop: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#8FB3E0',
    borderColor: '#8FB3E0',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
  },
  linkText: {
    color: '#4A6FA5',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#8FB3E0',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#8FB3E0',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  loginTextMuted: {
    fontSize: 13,
    color: '#6B7280',
  },
  loginBold: {
    color: '#4A6FA5',
    fontWeight: '700',
  },
});