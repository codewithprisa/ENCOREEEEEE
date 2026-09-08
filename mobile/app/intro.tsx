import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function IntroScreen() {
  const navigation = useNavigation<any>();
  const router = useRouter();

  // Animated values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const imageScale = useRef(new Animated.Value(1.12)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const badgeBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(imageScale, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // sedikit bounce untuk badge lokasi setelah entrance selesai
      Animated.sequence([
        Animated.timing(badgeBounce, {
          toValue: -6,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(badgeBounce, {
          toValue: 0,
          friction: 3,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const goToLogin = () => {
    router.replace('/login'); // ganti halaman, tidak bisa di-back ke intro
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF6DD" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.logo}>Encoré</Text>
        <TouchableOpacity onPress={goToLogin} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skip}>Lewati</Text>
        </TouchableOpacity>
      </View>

      {/* Gambar hero */}
      <Animated.View
        style={[
          styles.imageWrapper,
          {
            opacity: fadeAnim,
            transform: [{ scale: imageScale }],
          },
        ]}
      >
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
          }}
          style={styles.image}
          resizeMode="cover"
        />

        <Animated.View
          style={[
            styles.locationBadge,
            { transform: [{ translateY: badgeBounce }] },
          ]}
        >
          <Ionicons name="location-sharp" size={20} color="#4A6FA5" />
        </Animated.View>
      </Animated.View>

      {/* Teks */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text style={styles.title}>Temukan konser{'\n'}di sekitarmu</Text>
        <Text style={styles.subtitle}>
          Akses eksklusif ke berbagai pertunjukan musik dan seni pertunjukan
          pilihan terbaik di kotamu.
        </Text>
      </Animated.View>

      {/* Tombol Mulai */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: buttonScale }],
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={goToLogin}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Mulai</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6DD',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E6B',
  },
  skip: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  imageWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    height: width * 1.05,
    marginBottom: 26,
    position: 'relative',
    backgroundColor: '#e5e5e5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  locationBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 28,
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
  buttonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '600',
  },
});