import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PilihTiket from "../pembelian/pilihTiket";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// One consistent poster size used everywhere a poster thumbnail shows up
// (featured cards + explore list), so they all look the same size.
const POSTER_WIDTH = 92;
const POSTER_HEIGHT = 122; // ~3:4 portrait, matches typical concert posters

// Bigger, more spacious poster used specifically in the Jelajahi Acara list
// cards (kept separate from POSTER_WIDTH/HEIGHT so only that list grows).
const EVENT_LIST_POSTER_WIDTH = 118;
const EVENT_LIST_POSTER_HEIGHT = 156;

// Bigger "hero" poster size used only for the Unggulan Minggu Ini row —
// image fills the whole card and the title/date sit on top of it.
const FEATURED_CARD_WIDTH = Math.round(width * 0.62);
const FEATURED_CARD_HEIGHT = Math.round(FEATURED_CARD_WIDTH * 1.28);

const CATEGORIES = ['Semua', 'Indie', 'Pop', 'Rock'];

// Serif typeface used for the app's headings/titles (logo, section titles,
// card titles) to match the editorial look of the reference design. Falls
// back to the platform's built-in serif so no extra font asset is required.
const FONT_SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

// Each category chip keeps its own brand color at all times (not just when
// selected) — "Semua" is the neutral/outline catch-all, the rest are always
// tinted so the row reads as a set of colorful genre tags.
const CATEGORY_META: {
  [key: string]: { bg: string; border: string; text: string };
} = {
  Semua: { bg: 'transparent', border: '#2C3E6B', text: '#2C3E6B' },
  Indie: { bg: '#8FB3E0', border: '#8FB3E0', text: '#fff' },
  Pop: { bg: '#F6CFA0', border: '#F6CFA0', text: '#8A4B14' },
  Rock: { bg: '#BFE1F5', border: '#BFE1F5', text: '#1F5C7A' },
};

// Generic atmosphere photo used as the second slide in the detail
// carousel so every event has at least a 2-image gallery.
const VENUE_ATMOSPHERE_IMAGE =
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80';

const DEFAULT_HIGHLIGHTS = [
  'E-tiket langsung terkirim ke aplikasi',
  'Bisa refund penuh hingga H-3 acara',
  'Tersedia cicilan 0% untuk kartu kredit tertentu',
];

const DEFAULT_FACILITIES: { icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { icon: 'ticket-outline', label: 'E-Tiket' },
  { icon: 'car-outline', label: 'Parkir' },
  { icon: 'fast-food-outline', label: 'F&B' },
  { icon: 'shield-checkmark-outline', label: 'Aman' },
  { icon: 'people-outline', label: 'Semua Usia' },
];

// Generic avatar used for lineup artists when an event doesn't provide its
// own `lineup` array from the API — keeps the "Lineup Artis" section from
// looking empty on static/legacy events.
const DEFAULT_ARTIST_AVATAR =
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80';

// Fallback copy for sections that aren't part of the existing data model yet
// (an event can still override these via `terms` / `refundPolicy` fields).
const DEFAULT_TERMS = [
  'Tiket yang sudah dibeli tidak dapat dipindahtangankan tanpa izin penyelenggara.',
  'Pengunjung wajib menunjukkan e-tiket dan identitas asli saat masuk venue.',
  'Penyelenggara berhak menolak masuk jika data tiket tidak sesuai.',
];

const DEFAULT_REFUND_POLICY = [
  'Refund penuh tersedia hingga H-3 sebelum acara berlangsung.',
  'Refund setelah H-3 hanya berlaku jika acara dibatalkan oleh penyelenggara.',
  'Proses refund membutuhkan waktu 7-14 hari kerja ke rekening asal pembayaran.',
];

// Builds the lineup list shown as circular avatars. Falls back to the
// event's single `artist` field when the API hasn't sent a proper
// `lineup` array yet.
const buildLineup = (item: any) => {
  if (Array.isArray(item.lineup) && item.lineup.length > 0) {
    return item.lineup.map((person: any, index: number) => ({
      id: person.id || `${item.id || 'artist'}-${index}`,
      name: person.name,
      role: person.role || 'Pengisi Acara',
      photo: person.photo || DEFAULT_ARTIST_AVATAR,
    }));
  }

  const mainArtist = item.artist_name || item.artist;
  if (!mainArtist) return [];

  return [
    {
      id: `${item.id || 'artist'}-main`,
      name: mainArtist,
      role: 'Headliner',
      photo: DEFAULT_ARTIST_AVATAR,
    },
  ];
};


// Deterministic pseudo-random number in [min, max) derived from a string id,
// so rating/review counts stay stable across re-renders without needing
// real analytics data.
const stableNumber = (id: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min));
};

const parsePriceToNumber = (value: any): number | null => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const digits = value.replace(/[^0-9]/g, '');
    if (!digits) return null;
    return parseInt(digits, 10);
  }
  return null;
};

const formatRupiah = (value: number) => `Rp ${value.toLocaleString('id-ID')}`;

// Builds two ticket tiers (Reguler / VIP) out of a single base price so
// every event — API-driven or static — gets a consistent purchase picker.
const buildTicketTypes = (basePrice: number | null, id: string) => {
  const base = basePrice && basePrice > 0 ? basePrice : 100000;
  const regularPrice = base;
  const vipPrice = Math.round((base * 1.8) / 5000) * 5000;
  const vipOriginal = Math.round((vipPrice * 1.15) / 5000) * 5000;

  return [
    {
      id: `${id}-reguler`,
      label: 'Reguler',
      price: formatRupiah(regularPrice),
      originalPrice: null as string | null,
      badge: null as string | null,
      benefits: ['Akses area reguler (berdiri)', 'E-tiket instan', 'Bisa refund H-3'],
    },
    {
      id: `${id}-vip`,
      label: 'VIP',
      price: formatRupiah(vipPrice),
      originalPrice: formatRupiah(vipOriginal),
      badge: 'PALING LARIS',
      benefits: ['Akses area VIP terdepan', 'Merchandise eksklusif', 'Fast-track masuk venue'],
    },
  ];
};

// The "featured" list comes from the API (field names like `poster`,
// `artist_name`, `event_date`) while the static "explore" list uses
// slightly different field names. Normalize both into one shape so
// the detail modal only has to deal with a single format.
const normalizeFeaturedEvent = (item: any) => {
  const priceNumber = parsePriceToNumber(item.price);
  const priceLabel =
    typeof item.price === 'number'
      ? formatRupiah(item.price)
      : item.price || 'Hubungi penyelenggara';

  return {
    id: item.id,
    title: item.title,
    artist: item.artist_name || 'Event Musik',
    images: [item.poster, VENUE_ATMOSPHERE_IMAGE].filter(Boolean),
    date: item.event_date
      ? new Date(item.event_date).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : null,
    venue: item.venue || item.location || '-',
    price: priceLabel,
    shortDescription:
      item.short_description || 'Jangan lewatkan pengalaman musik terbaik bersama ribuan penonton lainnya.',
    description: item.description,
    category: item.category || 'Indie',
    rating: item.rating || 4.8,
    reviewCount: item.review_count || stableNumber(String(item.id), 40, 260),
    soldCount: item.sold_count || `${stableNumber(String(item.id), 100, 900)}+`,
    highlights: item.highlights || DEFAULT_HIGHLIGHTS,
    facilities: item.facilities || DEFAULT_FACILITIES,
    ticketTypes: buildTicketTypes(priceNumber, String(item.id)),
    lineup: buildLineup(item),
    terms: item.terms || DEFAULT_TERMS,
    refundPolicy: item.refund_policy || item.refundPolicy || DEFAULT_REFUND_POLICY,
    distanceKm: item.distance_km ?? stableNumber(String(item.id), 1, 15) / 10 + 5,
    tag: 'BARU',
  };
};

const normalizeExploreEvent = (event: any) => {
  const priceNumber = parsePriceToNumber(event.price);

  return {
    id: event.id,
    title: event.title,
    artist: event.artist,
    images: [event.image, VENUE_ATMOSPHERE_IMAGE].filter(Boolean),
    date: null,
    venue: event.venue,
    price: event.price,

    shortDescription:
      event.shortDescription ||
      'Jangan lewatkan pengalaman musik terbaik bersama ribuan penonton lainnya.',

    description: event.description,
    category: event.category,

    rating: event.rating || 4.7,

    reviewCount:
      event.reviewCount ||
      stableNumber(String(event.id), 40, 260),

    soldCount:
      event.soldCount ||
      `${stableNumber(String(event.id), 100, 900)}+`,

    highlights:
      event.highlights || DEFAULT_HIGHLIGHTS,

    facilities:
      event.facilities || DEFAULT_FACILITIES,

    ticketTypes: buildTicketTypes(
      priceNumber,
      String(event.id)
    ),

    lineup: buildLineup({ ...event, artist_name: event.artist }),
    terms: event.terms || DEFAULT_TERMS,
    refundPolicy: event.refund_policy || event.refundPolicy || DEFAULT_REFUND_POLICY,
    distanceKm: event.distance_km ?? stableNumber(String(event.id), 1, 15) / 10 + 5,

    tag: null,
  };
};

// A "featured" item only stays in the Event Terbaru row for this long
// after it first appears; after that it's treated as a regular event
// and shows up in Jelajahi Acara instead.
const FEATURED_WINDOW_MS = 5 * 60 * 1000;

const formatCountdown = (msLeft: number) => {
  const totalSeconds = Math.max(0, Math.floor(msLeft / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Same shape as an EVENTS entry, so an expired featured item can drop
// straight into the Jelajahi Acara list.
const featuredToExploreEvent = (item: any) => ({
  id: item.id,
  title: item.title,
  artist: item.artist_name || 'Event Musik',
  category: item.category || 'Indie',
  venue: item.venue || item.location || '-',
  price:
    typeof item.price === 'number'
      ? `Rp ${item.price.toLocaleString('id-ID')}`
      : item.price || 'Hubungi penyelenggara',
  image: item.poster,
});

export default function HomeScreen() {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [posterAspectRatio, setPosterAspectRatio] = useState(0.72);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showSeatPicker, setShowSeatPicker] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    deskripsi: true,
  });
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [events, setEvents] = useState<any[]>([]);
const [loadingEvents, setLoadingEvents] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  // Remembers the first time we ever saw each featured item, so the
  // 5-minute window survives re-renders and re-fetches. Falls back to
  // the item's own `created_at` from the API when it has one.
  const firstSeenRef = useRef<Map<string, number>>(new Map());

const fetchFeaturedEvents = async () => {
  try {
    setLoadingFeatured(true);

    const response = await fetch(
      'http://192.168.18.9:3001/api/events/featured'
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Gagal mengambil event terbaru');
    }

    data.forEach((item: any) => {
      if (!firstSeenRef.current.has(item.id)) {
        const createdAt = item.created_at
          ? new Date(item.created_at).getTime()
          : NaN;

        firstSeenRef.current.set(
          item.id,
          Number.isNaN(createdAt) ? Date.now() : createdAt
        );
      }
    });

    setFeaturedEvents(data);
  } catch (error) {
    console.error('FEATURED EVENTS ERROR:', error);
  } finally {
    setLoadingFeatured(false);
  }
};

const toggleWishlist = async () => {
  if (!selectedEvent?.id) return;

  try {
    const stored = await AsyncStorage.getItem('wishlist');
    const wishlist = stored ? JSON.parse(stored) : [];

    const exists = wishlist.some(
      (item: any) =>
        String(item.id) === String(selectedEvent.id)
    );

    if (exists) {
      const updatedWishlist = wishlist.filter(
        (item: any) =>
          String(item.id) !== String(selectedEvent.id)
      );

      await AsyncStorage.setItem(
        'wishlist',
        JSON.stringify(updatedWishlist)
      );

      setIsWishlisted(false);
    } else {
      const updatedWishlist = [
        ...wishlist,
        selectedEvent,
      ];

      await AsyncStorage.setItem(
        'wishlist',
        JSON.stringify(updatedWishlist)
      );

      setIsWishlisted(true);
    }
  } catch (error) {
    console.error('WISHLIST ERROR:', error);
  }
};

useEffect(() => {
  const checkWishlist = async () => {
    if (!selectedEvent?.id) {
      setIsWishlisted(false);
      return;
    }

    try {
      const stored = await AsyncStorage.getItem('wishlist');
      const wishlist = stored ? JSON.parse(stored) : [];

      const exists = wishlist.some(
        (item: any) =>
          String(item.id) === String(selectedEvent.id)
      );

      setIsWishlisted(exists);
    } catch (error) {
      console.error('CHECK WISHLIST ERROR:', error);
      setIsWishlisted(false);
    }
  };

  checkWishlist();
}, [selectedEvent?.id]);

  const fetchEvents = async () => {
    try {
      setLoadingEvents(true);

      const response = await fetch(
        'http://192.168.1.7:3001/api/events'
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mengambil event');
      }

      const normalizedEvents = Array.isArray(data)
        ? data.map(normalizeApiEvent)
        : [];

      setEvents(normalizedEvents);
    } catch (error) {
      console.error('EVENTS ERROR:', error);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  };

useEffect(() => {
  Animated.parallel([
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }),
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }),
  ]).start();

  fetchFeaturedEvents();
  fetchEvents();
}, []);

  // Ticks every second so items automatically drop out of "Event
  // Terbaru" and into "Jelajahi Acara" once they pass the 5-minute mark
  // — no re-fetch or user action needed.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Whenever a new event is opened in the detail sheet, reset the
  // carousel back to the first image and pre-select the first ticket tier.
  useEffect(() => {
    if (selectedEvent) {
      setCarouselIndex(0);
      setSelectedTicketId(selectedEvent.ticketTypes?.[0]?.id ?? null);
      setOpenSections({ deskripsi: true });
      setShowSeatPicker(false);
    }
  }, [selectedEvent?.id]);

  // Ambil rasio asli poster begitu event dibuka, supaya kotak poster
  // dibuat pas dengan bentuk gambarnya sendiri — tidak ada gambar yang
  // terpotong, dan tidak ada sisa ruang kosong di kiri/kanan/atas/bawah.
  useEffect(() => {
    const posterUri = selectedEvent?.images?.[0];
    if (!posterUri) {
      setPosterAspectRatio(0.72);
      return;
    }
    Image.getSize(
      posterUri,
      (w, h) => {
        if (w > 0 && h > 0) setPosterAspectRatio(w / h);
      },
      () => setPosterAspectRatio(0.72)
    );
  }, [selectedEvent?.id]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openInGoogleMaps = (venueName: string) => {
    const query = encodeURIComponent(venueName || '');
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
  };

  const activeFeatured = featuredEvents.filter((item) => {
    const seenAt = firstSeenRef.current.get(item.id) ?? now;
    return now - seenAt < FEATURED_WINDOW_MS;
  });

  const expiredFeatured = featuredEvents.filter((item) => {
    const seenAt = firstSeenRef.current.get(item.id) ?? now;
    return now - seenAt >= FEATURED_WINDOW_MS;
  });

  const exploreEvents = [
  ...events,
  ...expiredFeatured.map(featuredToExploreEvent),
];

const normalizeApiEvent = (item: any) => {
  const priceNumber = parsePriceToNumber(item.price);

  return {
    id: String(item.id),
    title: item.title || 'Event Musik',
    artist: item.artist_name || item.artist || 'Event Musik',
    category: item.category || item.genre || 'Indie',
    venue: item.venue || item.location || '-',

    price:
      typeof item.price === 'number'
        ? `Rp ${item.price.toLocaleString('id-ID')}`
        : item.price || 'Hubungi penyelenggara',

    image: item.poster || item.image || '',

    shortDescription:
      item.short_description ||
      'Jangan lewatkan pengalaman musik terbaik bersama ribuan penonton lainnya.',

    description: item.description || '',

    rating: item.rating || 4.7,

    reviewCount:
      item.review_count ||
      stableNumber(String(item.id), 40, 260),

    soldCount:
      item.sold_count ||
      `${stableNumber(String(item.id), 100, 900)}+`,

    highlights: item.highlights || DEFAULT_HIGHLIGHTS,

    facilities: item.facilities || DEFAULT_FACILITIES,

    eventDate: item.event_date || null,

    // Small promo tag shown on the card ("Hampir Habis", "Promo Terbatas"),
    // read straight from the API when present. Falls back to a stable
    // pseudo-random pick so a few cards still show a tag in demo data.
    promoBadge:
      item.promo_badge ||
      item.promoBadge ||
      (stableNumber(String(item.id), 0, 5) === 1 ? 'Hampir Habis' : null),

    ticketTypes: buildTicketTypes(
      priceNumber,
      String(item.id)
    ),
  };
};

  const filteredEvents =
    activeCategory === 'Semua'
      ? exploreEvents
      : exploreEvents.filter((event) => event.category === activeCategory);

  // Small pool of "other events" shown at the bottom of the detail sheet,
  // excluding whichever event is currently open.
  const recommendationPool = [
    ...exploreEvents.map(normalizeExploreEvent),
    ...activeFeatured.map(normalizeFeaturedEvent),
  ].filter((event) => event.id !== selectedEvent?.id);

  const selectedTicket = selectedEvent?.ticketTypes?.find((t: any) => t.id === selectedTicketId);
  const carouselImages: string[] = selectedEvent?.images?.length ? selectedEvent.images : [];
  const detailCategoryMeta =
    (selectedEvent?.category && CATEGORY_META[selectedEvent.category]) || CATEGORY_META.Indie;

  const goToPrevImage = () => {
    if (!carouselImages.length) return;
    setCarouselIndex((i) => (i - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToNextImage = () => {
    if (!carouselImages.length) return;
    setCarouselIndex((i) => (i + 1) % carouselImages.length);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF6DD" />

      {/* Bagian atas tetap (tidak ikut discroll): header, search bar, kategori */}
      <View style={styles.fixedTop}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>Encoré</Text>
          <TouchableOpacity
            style={styles.bellButton}
            activeOpacity={0.8}
            onPress={() => setShowNotifications(true)}
          >
            <Ionicons name="notifications-outline" size={22} color="#1F2937" />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari artis atau event..."
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
            <Ionicons name="options-outline" size={20} color="#4A6FA5" />
          </TouchableOpacity>
        </View>

        {/* Kategori */}
        <View style={styles.categoryWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            {CATEGORIES.map((cat) => {
              const active = cat === activeCategory;
              const meta = CATEGORY_META[cat] || CATEGORY_META.Semua;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={[
                    styles.categoryChip,
                    { backgroundColor: meta.bg, borderColor: meta.border },
                    active && styles.categoryChipActive,
                  ]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.categoryText, { color: meta.text }, active && styles.categoryTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Konten yang bisa discroll: Unggulan Minggu Ini + Jelajahi Acara.
          Kartu-kartu di sini TIDAK diperkecil supaya muat di layar — kalau
          acaranya banyak, tinggal discroll ke bawah. */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Event Terbaru */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Unggulan Minggu Ini</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {loadingFeatured ? (
            <View style={styles.featuredLoading}>
              <ActivityIndicator color="#4A6FA5" />
            </View>
          ) : activeFeatured.length === 0 ? (
            <View style={styles.featuredEmpty}>
              <Text style={styles.featuredEmptyText}>Belum ada event terbaru</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredRow}
            >
              {activeFeatured.map((item, index) => {
                // Rotate through a small set of eyebrow labels so the row
                // doesn't just repeat "TERBARU" on every card, matching the
                // reference design's mix of TRENDING / POPULER tags.
                const eyebrowLabels = ['TRENDING', 'POPULER', 'BARU'];
                const eyebrow = eyebrowLabels[index % eyebrowLabels.length];

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.featuredCardV2}
                    activeOpacity={0.9}
                    onPress={() => setSelectedEvent(normalizeFeaturedEvent(item))}
                  >
                    {item.poster ? (
                      <Image
                        source={{ uri: item.poster }}
                        style={styles.featuredImageV2}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.featuredImageV2, styles.featuredImagePlaceholder]} />
                    )}

                    {/* Dark gradient-like scrim so white text stays readable
                        over any poster image. */}
                    <View style={styles.featuredScrim} />

                    <TouchableOpacity style={styles.featuredBookmark} activeOpacity={0.8}>
                      <Ionicons name="bookmark-outline" size={15} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.featuredOverlayContent}>
                      <View style={styles.featuredTagV2}>
                        <Text style={styles.featuredTagTextV2}>{eyebrow}</Text>
                      </View>

                      <Text style={styles.featuredTitleV2} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.featuredSubtitleV2} numberOfLines={1}>
                        {item.artist_name || 'Event Musik'}
                      </Text>
                      <View style={styles.featuredDateRow}>
                        <Ionicons name="calendar-outline" size={12} color="#fff" />
                        <Text style={styles.featuredDateV2}>
                          {new Date(item.event_date).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </Animated.View>

        {/* Jelajahi Acara */}
        <Animated.View
          style={[
            styles.section,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.sectionTitle}>Jelajahi Acara</Text>

          <View style={styles.exploreList}>
            {filteredEvents.length === 0 ? (
              <View style={styles.featuredEmpty}>
                <Text style={styles.featuredEmptyText}>Tidak ada acara di kategori ini</Text>
              </View>
            ) : (
              filteredEvents.map((event) => {
                const hasVenue =
                  typeof event.venue === 'string' && event.venue.trim() !== '' && event.venue.trim() !== '-';
                const hasArtist =
                  typeof event.artist === 'string' &&
                  event.artist.trim() !== '' &&
                  event.artist.trim() !== 'Event Musik';

                return (
                  <TouchableOpacity
                    key={event.id}
                    style={styles.eventCard}
                    activeOpacity={0.9}
                    onPress={() => setSelectedEvent(normalizeExploreEvent(event))}
                  >
                    {event.promoBadge ? (
                      <View style={styles.eventPromoBadge}>
                        <Text style={styles.eventPromoBadgeText}>{event.promoBadge}</Text>
                      </View>
                    ) : null}

                    <Image
                      source={{ uri: event.image }}
                      style={styles.eventImage}
                      resizeMode="cover"
                    />
                    <View style={styles.eventInfo}>
                      <View style={styles.eventInfoTop}>
                        <Text style={styles.eventTitle} numberOfLines={2}>
                          {event.title}
                        </Text>
                        {hasArtist ? (
                          <Text style={styles.eventArtist} numberOfLines={1}>
                            {event.artist}
                          </Text>
                        ) : null}
                        {hasVenue ? (
                          <Text style={styles.eventVenue} numberOfLines={2}>
                            {event.venue}
                          </Text>
                        ) : null}
                      </View>

                      <View style={styles.eventBottomRow}>
                        <View style={styles.eventPriceBlock}>
                          <Text style={styles.eventPriceLabel} numberOfLines={1}>
                            Mulai dari
                          </Text>
                          <Text
                            style={styles.eventPrice}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.8}
                          >
                            {event.price}
                          </Text>
                        </View>
                        <TouchableOpacity
                          style={styles.buyButton}
                          activeOpacity={0.8}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                          onPress={() => setSelectedEvent(normalizeExploreEvent(event))}
                        >
                          <Text style={styles.buyButtonText}>Beli</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Halaman Notifikasi — modal full screen tetap di file home.tsx */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.notificationScreen}>
          <StatusBar barStyle="dark-content" backgroundColor="#F7F2E7" />

          {/* Header */}
          <View style={styles.notificationHeader}>
            <TouchableOpacity
              style={styles.notificationBackButton}
              activeOpacity={0.75}
              onPress={() => setShowNotifications(false)}
            >
              <Ionicons name="chevron-back" size={24} color="#45627E" />
            </TouchableOpacity>

            <Text style={styles.notificationLogo}>Encoré</Text>

            <View style={styles.notificationHeaderRight}>
              <Ionicons name="notifications" size={20} color="#111827" />
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.notificationContent}
          >
            {/* Hari ini */}
            <Text style={styles.notificationSectionLabel}>HARI INI</Text>

            <View style={styles.notificationCard}>
              <View style={[styles.notificationIconCircle, styles.notificationIconTicket]}>
                <Ionicons name="ticket-outline" size={19} color="#6D8EA6" />
              </View>

              <View style={styles.notificationTextBox}>
                <View style={styles.notificationTitleRow}>
                  <Text style={styles.notificationTitle}>E-Tiket Siap!</Text>
                  <Text style={styles.notificationTime}>10.24</Text>
                </View>
                <Text style={styles.notificationMessage}>
                  Pembayaran untuk "Symphony Under the Moon" telah berhasil.
                </Text>
              </View>
            </View>

            <View style={styles.notificationCard}>
              <View style={[styles.notificationIconCircle, styles.notificationIconEvent]}>
                <Ionicons name="megaphone-outline" size={18} color="#7B6A50" />
              </View>

              <View style={styles.notificationTextBox}>
                <View style={styles.notificationTitleRow}>
                  <Text style={styles.notificationTitle}>Pengingat Event</Text>
                  <Text style={styles.notificationTime}>08.00</Text>
                </View>
                <Text style={styles.notificationMessage}>
                  Gedung Kesenian Jakarta akan segera dipenuhi alunan piano.
                </Text>
              </View>
            </View>

            {/* Kemarin */}
            <Text style={[styles.notificationSectionLabel, styles.notificationYesterdayLabel]}>
              KEMARIN
            </Text>

            <View style={styles.notificationCard}>
              <View style={[styles.notificationIconCircle, styles.notificationIconFavorite]}>
                <Ionicons name="heart-outline" size={19} color="#A89A81" />
              </View>

              <View style={styles.notificationTextBox}>
                <View style={styles.notificationTitleRow}>
                  <Text style={styles.notificationTitle}>Artis Favorit</Text>
                  <Text style={styles.notificationTime}>15.45</Text>
                </View>
                <Text style={styles.notificationMessage}>
                  Nadin Amizah baru saja menambahkan jadwal konser baru.
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Detail event — modal di dalam halaman yang sama */}
      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        transparent
        onRequestClose={() => (showSeatPicker ? setShowSeatPicker(false) : setSelectedEvent(null))}
      >
        <View style={styles.modalBackdropV2}>
          <View style={styles.modalSheetV2}>
            {showSeatPicker ? (
              <PilihTiket
                eventTitle={selectedEvent?.title}
                eventDate={selectedEvent?.date}
                ticket={selectedTicket}
                onBack={() => setShowSeatPicker(false)}
              />
            ) : (
              <>
                {/* Header ala referensi: back button + judul app di tengah */}
                <View style={styles.detailHeaderV2}>
                  <TouchableOpacity
                    style={styles.detailBackButton}
                    activeOpacity={0.8}
                    onPress={() => setSelectedEvent(null)}
                  >
                    <Ionicons name="arrow-back" size={20} color="#1F2937" />
                  </TouchableOpacity>
                  <Text style={styles.detailHeaderTitle} numberOfLines={1}>
                    Encoré
                  </Text>
                  <View style={styles.detailHeaderSpacer} />
                </View>

                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                  {/* Poster card */}
                  <View style={styles.posterCardWrap}>
                    <View style={[styles.posterCard, { aspectRatio: posterAspectRatio }]}>
                      {carouselImages.length > 0 ? (
                        <Image
                          source={{ uri: carouselImages[0] }}
                          style={styles.posterCardImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={[styles.posterCardImage, styles.featuredImagePlaceholder]} />
                      )}
                    </View>

                    {/* Tombol favorit melayang di pojok kanan-bawah poster,
                        persis seperti referensi desain. */}
                  <TouchableOpacity
  style={[
    styles.posterBookmarkButton,
    isWishlisted && styles.posterBookmarkButtonActive,
  ]}
  activeOpacity={0.8}
  onPress={toggleWishlist}
>
  <Ionicons
    name={isWishlisted ? 'heart' : 'heart-outline'}
    size={19}
    color={isWishlisted ? '#E85D75' : '#fff'}
  />
</TouchableOpacity>
                  </View>

                  {/* Title row: judul + subjudul di kiri, badge kategori di kanan */}
                  <View style={styles.titleRowV2}>
                    <View style={styles.titleRowTextBox}>
                      <Text style={styles.detailTitleV2}>{selectedEvent?.title}</Text>
                      {selectedEvent?.artist ? (
                        <Text style={styles.detailSubtitleV2}>{selectedEvent.artist}</Text>
                      ) : null}
                    </View>
                    {selectedEvent?.category ? (
                      <View
                        style={[
                          styles.detailCategoryBadge,
                          {
                            backgroundColor:
                              detailCategoryMeta.bg === 'transparent' ? '#EEF3FA' : detailCategoryMeta.bg,
                          },
                        ]}
                      >
                        <Text style={[styles.detailCategoryBadgeText, { color: detailCategoryMeta.text }]}>
                          {selectedEvent.category}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Baris tanggal, full-width di bawah title row */}
                  <View style={styles.titleDateRowV2}>
                    <Ionicons name="calendar-outline" size={13} color="#4A6FA5" />
                    <Text style={styles.titleDateText}>{selectedEvent?.date || 'Segera diumumkan'}</Text>
                  </View>

                  {/* Lineup Artis */}
                  {selectedEvent?.lineup?.length ? (
                    <View style={styles.sectionV2}>
                      <Text style={styles.sectionTitleV2}>Lineup Artis</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.lineupRow}
                      >
                        {selectedEvent.lineup.map((person: any) => (
                          <View key={person.id} style={styles.lineupItem}>
                            <Image source={{ uri: person.photo }} style={styles.lineupAvatar} />
                            <Text style={styles.lineupName} numberOfLines={1}>
                              {person.name}
                            </Text>
                            <Text style={styles.lineupRole} numberOfLines={1}>
                              {person.role}
                            </Text>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  ) : null}

                  {/* Lokasi */}
                  <View style={styles.sectionV2}>
                    <TouchableOpacity
                      style={styles.locationCard}
                      activeOpacity={0.85}
                      onPress={() => openInGoogleMaps(selectedEvent?.venue)}
                    >
                      <View style={styles.locationTextBox}>
                        <Text style={styles.locationVenue} numberOfLines={1}>
                          {selectedEvent?.venue || '-'}
                        </Text>
                        <Text style={styles.locationAddress} numberOfLines={2}>
                          {selectedEvent?.venue
                            ? `Kompleks ${selectedEvent.venue}, Jakarta, Indonesia`
                            : 'Lokasi belum diumumkan'}
                        </Text>
                        <View style={styles.locationLinkRow}>
                          <Ionicons name="navigate-outline" size={12} color="#4A6FA5" />
                          <Text style={styles.locationLinkText}>Buka di Google Maps</Text>
                        </View>
                      </View>
                      <View style={styles.locationMapThumb}>
                        <Ionicons name="location" size={22} color="#4A6FA5" />
                        <View style={styles.locationDistanceBadge}>
                          <Text style={styles.locationDistanceText}>
                            {(selectedEvent?.distanceKm || 5).toFixed(1)} km
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Accordion: Deskripsi */}
                  <View style={styles.accordionRow}>
                    <TouchableOpacity
                      style={styles.accordionHeader}
                      activeOpacity={0.7}
                      onPress={() => toggleSection('deskripsi')}
                    >
                      <Text style={styles.accordionTitle}>Description</Text>
                      <Ionicons
                        name={openSections.deskripsi ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#1F2937"
                      />
                    </TouchableOpacity>
                    {openSections.deskripsi ? (
                      <View style={styles.accordionBody}>
                        <Text style={styles.accordionText}>
                          {selectedEvent?.description || selectedEvent?.shortDescription}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Accordion: Terms & Conditions */}
                  <View style={styles.accordionRow}>
                    <TouchableOpacity
                      style={styles.accordionHeader}
                      activeOpacity={0.7}
                      onPress={() => toggleSection('terms')}
                    >
                      <Text style={styles.accordionTitle}>Terms & Conditions</Text>
                      <Ionicons
                        name={openSections.terms ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#1F2937"
                      />
                    </TouchableOpacity>
                    {openSections.terms ? (
                      <View style={styles.accordionBody}>
                        {(selectedEvent?.terms || DEFAULT_TERMS).map((t: string) => (
                          <View style={styles.accordionBullet} key={t}>
                            <View style={styles.accordionDot} />
                            <Text style={styles.accordionText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>

                  {/* Accordion: Refund Policy */}
                  <View style={styles.accordionRow}>
                    <TouchableOpacity
                      style={styles.accordionHeader}
                      activeOpacity={0.7}
                      onPress={() => toggleSection('refund')}
                    >
                      <Text style={styles.accordionTitle}>Refund Policy</Text>
                      <Ionicons
                        name={openSections.refund ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color="#1F2937"
                      />
                    </TouchableOpacity>
                    {openSections.refund ? (
                      <View style={styles.accordionBody}>
                        {(selectedEvent?.refundPolicy || DEFAULT_REFUND_POLICY).map((t: string) => (
                          <View style={styles.accordionBullet} key={t}>
                            <View style={styles.accordionDot} />
                            <Text style={styles.accordionText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                  </View>

                  {/* Available Tiers */}
                  <View style={[styles.sectionV2, { marginBottom: SPACING.xl + 8 }]}>
                    <Text style={styles.sectionTitleV2}>Available Tiers</Text>

                    {selectedEvent?.ticketTypes?.map((ticket: any) => {
                      const active = selectedTicketId === ticket.id;
                      return (
                        <TouchableOpacity
                          key={ticket.id}
                          style={[styles.tierCard, active && styles.tierCardActive]}
                          activeOpacity={0.85}
                          onPress={() => setSelectedTicketId(ticket.id)}
                        >
                          <View style={styles.tierTopRow}>
                            <Text style={styles.tierLabel}>{ticket.label}</Text>
                            <Text style={styles.tierPrice}>{ticket.price}</Text>
                          </View>

                          <View style={styles.tierMetaRow}>
                            <Text style={styles.tierSaleText} numberOfLines={1}>
                              Sale: {selectedEvent?.date || 'Segera diumumkan'}
                            </Text>
                            {ticket.badge ? (
                              <Text style={styles.tierBadgeInline}>{ticket.badge}</Text>
                            ) : null}
                          </View>

                          {ticket.benefits?.length ? (
                            <>
                              <View style={styles.tierDivider} />
                              {ticket.benefits.map((benefit: string) => (
                                <View style={styles.tierBenefitRow} key={benefit}>
                                  <View style={styles.tierBenefitIcon}>
                                    <Ionicons name="checkmark" size={12} color="#fff" />
                                  </View>
                                  <Text style={styles.tierBenefitText}>{benefit}</Text>
                                </View>
                              ))}
                            </>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>

                {/* Bottom bar */}
                <View style={styles.detailBottomBarV2}>
                  <TouchableOpacity
                    style={styles.detailBuyButtonV2}
                    activeOpacity={0.85}
                    onPress={() => setShowSeatPicker(true)}
                  >
                    <Text style={styles.detailBuyButtonText}>Pilih Tiket</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const SPACING = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
};

const RADIUS = {
  sm: 12,
  md: 16,
  lg: 20,
};

const CARD_SHADOW = {
  shadowColor: '#1F2937',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 2,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF6DD',
  },
  // Header + search + kategori: selalu terlihat, tidak ikut discroll.
  fixedTop: {
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 54 : 34,
    backgroundColor: '#FFF6DD',
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xl + 12,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
    color: '#2C3E6B',
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#fff',
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    backgroundColor: '#fff',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
    ...CARD_SHADOW,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.sm,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },

  // Categories
  categoryWrapper: {
    marginBottom: SPACING.lg + 4,
  },
  categoryRow: {
    gap: SPACING.sm,
  },
  categoryChip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F0E6C8',
  },
  categoryChipActive: {
    borderColor: '#2C3E6B',
    borderWidth: 1.5,
    ...CARD_SHADOW,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONT_SERIF,
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#fff',
  },

  // Shared section spacing
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
    color: '#1F2937',
    marginBottom: SPACING.md,
  },
  seeAll: {
    fontSize: 13,
    color: '#4A6FA5',
    fontWeight: '600',
  },

  // Featured
  featuredRow: {
    gap: SPACING.md,
    paddingRight: 4,
  },
  featuredCard: {
    width: POSTER_WIDTH,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...CARD_SHADOW,
  },
  // Fixed portrait box so the poster is always shown fully and clearly,
  // at the same size as every other poster thumbnail in the app.
  featuredImageBox: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    backgroundColor: '#e5e5e5',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredImagePlaceholder: {
    backgroundColor: '#D8E3F2',
  },
  featuredTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  featuredTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredFooter: {
    padding: SPACING.sm + 2,
  },
  featuredTitle: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '700',
  },
  featuredSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 2,
    marginBottom: SPACING.xs + 2,
  },
  featuredDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  featuredDate: {
    color: '#4A6FA5',
    fontSize: 11,
    fontWeight: '600',
  },
  featuredLoading: {
    height: FEATURED_CARD_HEIGHT,
    borderRadius: RADIUS.lg,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredEmpty: {
    height: 100,
    borderRadius: RADIUS.md,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  featuredEmptyText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Featured card v2 — big hero poster with text overlaid directly on
  // the image, matching the reference design.
  featuredCardV2: {
    width: FEATURED_CARD_WIDTH,
    height: FEATURED_CARD_HEIGHT,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#1C2536',
    ...CARD_SHADOW,
  },
  featuredImageV2: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  featuredScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '55%',
    backgroundColor: 'rgba(10,14,30,0.55)',
  },
  featuredBookmark: {
    position: 'absolute',
    bottom: SPACING.sm + 2,
    right: SPACING.sm + 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredOverlayContent: {
    position: 'absolute',
    left: SPACING.md,
    right: SPACING.md,
    bottom: SPACING.md,
  },
  featuredTagV2: {
    alignSelf: 'flex-start',
    backgroundColor: '#8FB3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: SPACING.sm,
  },
  featuredTagTextV2: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  featuredTitleV2: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
  },
  featuredSubtitleV2: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    marginTop: 2,
    marginBottom: SPACING.xs + 2,
  },
  featuredDateV2: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },

  // Explore list
  exploreList: {
    gap: SPACING.md,
  },
  eventCard: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: SPACING.lg - 2,
    gap: SPACING.md,
    // Menjaga tinggi kartu tetap konsisten dengan poster meskipun judul,
    // artis, atau venue panjangnya berbeda-beda antar kartu.
    minHeight: EVENT_LIST_POSTER_HEIGHT + (SPACING.lg - 2) * 2,
    ...CARD_SHADOW,
  },
  eventImage: {
    width: EVENT_LIST_POSTER_WIDTH,
    height: EVENT_LIST_POSTER_HEIGHT,
    borderRadius: RADIUS.md,
    backgroundColor: '#e5e5e5',
  },
  // Kolom info: dibiarkan setinggi poster lalu dibagi rata (top group vs
  // bottom row) supaya harga + tombol Beli selalu sejajar dengan bagian
  // bawah poster, apa pun panjang judul/venue-nya — hasilnya rapi dan
  // konsisten dari kartu ke kartu.
  eventInfo: {
    flex: 1,
    minWidth: 0,
    minHeight: EVENT_LIST_POSTER_HEIGHT,
    justifyContent: 'space-between',
  },
  eventInfoTop: {
    minWidth: 0,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
    color: '#1F2937',
    lineHeight: 22,
  },
  eventArtist: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#4A6FA5',
    marginTop: 3,
  },
  eventVenue: {
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 17,
    marginTop: SPACING.sm,
  },
  eventBottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    rowGap: SPACING.sm,
    columnGap: SPACING.sm,
  },
  eventPriceBlock: {
    flexGrow: 1,
    flexShrink: 1,
    // Lebar minimum ini yang memaksa tombol "Beli" pindah ke baris baru
    // (bukan memepetkan teks harga) begitu ruang tidak cukup — jadi label
    // & harga selalu terbaca penuh, tidak pernah terpotong "...".
    minWidth: 112,
  },
  eventPriceLabel: {
    fontSize: 11.5,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  eventPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2C6BA0',
  },
  buyButton: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 68,
    backgroundColor: '#2C5F82',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 22,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  eventPromoBadge: {
    position: 'absolute',
    top: -10,
    left: SPACING.lg + 6,
    zIndex: 2,
    maxWidth: '70%',
    backgroundColor: '#F6CFA0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    ...CARD_SHADOW,
  },
  eventPromoBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#8A4B14',
  },

  // Detail modal shell
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    height: height * 0.92,
    backgroundColor: '#FFF6DD',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },

  // Carousel
  // NOTE: poster diperbesar sedikit tingginya (dari 0.9 jadi 1.05 * width)
  // supaya poster portrait (3:4) muat penuh tanpa terpotong saat "contain".
  carouselBox: {
    width: '100%',
    height: width * 1.05,
    backgroundColor: '#1C2536',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  detailBadge: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  detailBadgeAccent: {
    backgroundColor: '#4A6FA5',
  },
  detailBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.4,
  },
  detailCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  carouselArrow: {
    position: 'absolute',
    top: '46%',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 16,
  },

  // Detail info
  detailInfo: {
    marginTop: -20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg + 4,
    paddingBottom: SPACING.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
    marginBottom: SPACING.sm,
  },
  starsRow: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1F2937',
  },
  detailArtist: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  detailDescShort: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginTop: SPACING.sm,
  },

  // Highlights checklist
  highlightList: {
    marginTop: SPACING.md,
    gap: SPACING.sm - 2,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs + 2,
  },
  highlightText: {
    fontSize: 12.5,
    color: '#374151',
    flexShrink: 1,
  },

  detailDivider: {
    height: 1,
    backgroundColor: '#F0E6C8',
    marginVertical: SPACING.lg - 2,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md + 2,
    gap: SPACING.sm + 4,
  },
  detailMetaIconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: '#EEF3FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailMetaTextBox: {
    flex: 1,
  },
  detailMetaLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  detailMetaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  detailSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: SPACING.sm + 2,
  },
  detailDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4B5563',
  },

  // Ticket type picker
  ticketOption: {
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#F0E6C8',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm + 4,
  },
  ticketOptionActive: {
    borderColor: '#4A6FA5',
    backgroundColor: '#F5F9FF',
  },
  ticketBadge: {
    position: 'absolute',
    top: -10,
    right: 14,
    backgroundColor: '#F5B301',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ticketBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  ticketOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: {
    borderColor: '#4A6FA5',
  },
  radioInner: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#4A6FA5',
  },
  ticketLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  ticketPriceBox: {
    alignItems: 'flex-end',
  },
  ticketOriginalPrice: {
    fontSize: 11,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  ticketPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  ticketBenefits: {
    marginTop: SPACING.sm + 2,
    gap: 5,
    paddingLeft: 26,
  },
  ticketBenefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ticketBenefitText: {
    fontSize: 11.5,
    color: '#6B7280',
  },

  guaranteeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  guaranteeText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#4A6FA5',
  },

  // Facilities
  facilitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  facilityItem: {
    alignItems: 'center',
    width: 60,
  },
  facilityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF3FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  facilityLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Recommendations
  recRow: {
    gap: SPACING.md,
    paddingRight: 4,
    paddingBottom: SPACING.sm,
  },
  recCard: {
    width: 110,
  },
  recImage: {
    width: 110,
    height: 130,
    borderRadius: RADIUS.md,
    backgroundColor: '#e5e5e5',
    marginBottom: 6,
  },
  recTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
  recPrice: {
    fontSize: 11,
    color: '#4A6FA5',
    fontWeight: '600',
    marginTop: 1,
  },

  // Bottom bar
  detailBottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 26 : SPACING.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0E6C8',
  },
  detailBottomLabel: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  detailBottomPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 2,
  },
  detailBuyButton: {
    backgroundColor: '#8FB3E0',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: RADIUS.sm,
  },
  detailBuyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // ===== Detail screen v2 (referensi layout baru) =====
  modalBackdropV2: {
    flex: 1,
    backgroundColor: '#FFF6DD',
  },
  modalSheetV2: {
    flex: 1,
    backgroundColor: '#FFF6DD',
  },
  detailHeaderV2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 54 : 34,
    paddingBottom: SPACING.md,
  },
  detailBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  detailHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E6B',
  },
  detailHeaderSpacer: {
    width: 36,
  },

  // Poster card
  posterCardWrap: {
    position: 'relative',
    paddingHorizontal: SPACING.lg,
    // Ruang ekstra di bawah supaya tombol favorit yang melayang di pojok
    // poster tidak menabrak title row di bawahnya.
    marginBottom: SPACING.lg + 14,
  },
  posterCard: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: '#1C2536',
    ...CARD_SHADOW,
  },
  posterCardImage: {
    width: '100%',
    height: '100%',
  },
posterBookmarkButton: {
  position: 'absolute',
  right: SPACING.lg + 14,
  bottom: 0,
  width: 42,
  height: 42,
  borderRadius: 21,
  backgroundColor: '#8FB3E0',
  justifyContent: 'center',
  alignItems: 'center',
},

posterBookmarkButtonActive: {
  backgroundColor: '#fff',
},

  // Title row
  titleRowV2: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  titleRowTextBox: {
    flex: 1,
    minWidth: 0,
  },
  detailTitleV2: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
    color: '#2C3E6B',
  },
  detailSubtitleV2: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 3,
  },
  detailCategoryBadge: {
    flexShrink: 0,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },
  detailCategoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  titleDateRowV2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  titleDateText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#4A6FA5',
  },
  bookmarkButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },

  // Shared section wrapper for the v2 layout
  sectionV2: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitleV2: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: SPACING.sm + 2,
  },

  // Lineup artis
  lineupRow: {
    gap: SPACING.md,
    paddingRight: 4,
  },
  lineupItem: {
    alignItems: 'center',
    width: 68,
  },
  lineupAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e5e5',
    marginBottom: 6,
  },
  lineupName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },
  lineupRole: {
    fontSize: 10,
    color: '#9CA3AF',
    textAlign: 'center',
  },

  // Location card
  locationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.md,
    ...CARD_SHADOW,
  },
  locationTextBox: {
    flex: 1,
  },
  locationVenue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  locationAddress: {
    fontSize: 11.5,
    color: '#9CA3AF',
    marginTop: 3,
    lineHeight: 16,
  },
  locationLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  locationLinkText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4A6FA5',
  },
  locationMapThumb: {
    width: 76,
    height: 76,
    borderRadius: RADIUS.sm,
    backgroundColor: '#EEF3FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationDistanceBadge: {
    position: 'absolute',
    bottom: 6,
    backgroundColor: '#4A6FA5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  locationDistanceText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
  },

  // Accordion sections — daftar flat tanpa kotak putih/bayangan, dipisah
  // garis tipis, sesuai referensi desain.
  accordionRow: {
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#EADFB2',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md + 4,
  },
  accordionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: FONT_SERIF,
    color: '#524C63',
  },
  accordionBody: {
    paddingBottom: SPACING.lg,
    paddingTop: 0,
  },
  accordionText: {
    fontSize: 12.5,
    lineHeight: 19,
    color: '#4B5563',
    flexShrink: 1,
  },
  accordionBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm - 2,
    marginTop: SPACING.xs + 2,
  },
  accordionDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4A6FA5',
    marginTop: 6,
  },

  // Available tiers — kartu tan hangat sesuai referensi, dengan
  // label + harga di atas, baris info penjualan, garis pemisah, lalu
  // daftar benefit masing-masing dengan ikon bulat kecil.
  tierCard: {
    backgroundColor: '#F3DFBE',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: SPACING.lg - 2,
    marginBottom: SPACING.md,
  },
  tierCardActive: {
    borderColor: '#2C3E6B',
  },
  tierTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tierLabel: {
    fontSize: 19,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
    color: '#585268',
  },
  tierPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: '#585268',
  },
  tierMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    gap: SPACING.sm,
  },
  tierSaleText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#3A3450',
  },
  tierBadgeInline: {
    flexShrink: 0,
    fontSize: 12,
    fontWeight: '700',
    color: '#B3261E',
  },
  tierDivider: {
    height: 1,
    backgroundColor: 'rgba(58,52,80,0.15)',
    marginVertical: SPACING.sm + 2,
  },
  tierBenefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    marginBottom: SPACING.xs + 2,
  },
  tierBenefitIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2A2530',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  tierBenefitText: {
    flex: 1,
    fontSize: 12.5,
    lineHeight: 18,
    color: '#3A3450',
  },

  // Bottom bar v2
  detailBottomBarV2: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 26 : SPACING.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0E6C8',
  },
  detailBuyButtonV2: {
    backgroundColor: '#8FB3E0',
    paddingVertical: 15,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },

  // =========================
  // HALAMAN NOTIFIKASI
  // =========================
  notificationScreen: {
    flex: 1,
    backgroundColor: '#F7F2E7',
  },
  notificationHeader: {
    height: Platform.OS === 'ios' ? 104 : 78,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingHorizontal: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.34)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(69,98,126,0.10)',
  },
  notificationBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationLogo: {
    position: 'absolute',
    left: 70,
    right: 70,
    top: Platform.OS === 'ios' ? 51 : 31,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
    color: '#45627E',
  },
  notificationHeaderRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 24,
    paddingBottom: 42,
  },
  notificationSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.15,
    color: '#68737F',
    marginBottom: 12,
  },
  notificationYesterdayLabel: {
    marginTop: 24,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(247,248,250,0.78)',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    minHeight: 80,
    shadowColor: '#B6A36E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  notificationIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  notificationIconTicket: {
    backgroundColor: '#E0EBF2',
  },
  notificationIconEvent: {
    backgroundColor: '#ECE5D8',
  },
  notificationIconFavorite: {
    backgroundColor: '#F1EDE4',
  },
  notificationTextBox: {
    flex: 1,
    minWidth: 0,
  },
  notificationTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#3F4650',
  },
  notificationTime: {
    fontSize: 9,
    color: '#8B929B',
    marginTop: 2,
  },
  notificationMessage: {
    fontSize: 13,
    lineHeight: 20,
    color: '#69717C',
    paddingRight: 4,
  },
});