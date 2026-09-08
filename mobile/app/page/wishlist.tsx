import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  Modal,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PilihTiket from '../pembelian/pilihTiket';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FONT_SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

const SPACING = { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 };
const RADIUS = { sm: 12, md: 16, lg: 20 };
const CARD_SHADOW = {
  shadowColor: '#1F2937',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.06,
  shadowRadius: 10,
  elevation: 2,
};

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

const CATEGORY_META: { [key: string]: { bg: string; text: string } } = {
  Semua: { bg: '#EEF3FA', text: '#2C3E6B' },
  Indie: { bg: '#8FB3E0', text: '#fff' },
  Pop: { bg: '#F6CFA0', text: '#8A4B14' },
  Rock: { bg: '#BFE1F5', text: '#1F5C7A' },
};

type WishlistItem = {
  id: string;
  title: string;
  artist?: string;
  venue?: string;
  date?: string;
  price?: string;
  image?: string;
  category?: string;
  description?: string;
  shortDescription?: string;
  images?: string[];
  lineup?: any[];
  ticketTypes?: any[];
  terms?: string[];
  refundPolicy?: string[];
  distanceKm?: number;
};

// Data yang disimpan dari HomeScreen (selectedEvent) bisa punya nama field
// yang sedikit berbeda tergantung sumbernya (event API vs featured event),
// jadi kita normalisasi dulu supaya card & detail selalu tampil konsisten.
function normalizeWishlistItem(raw: any): WishlistItem {
  const images =
    raw.images && raw.images.length
      ? raw.images
      : [raw.image || raw.poster].filter(Boolean);

  return {
    id: String(raw.id),
    title: raw.title || 'Event Musik',
    artist: raw.artist || raw.artist_name || 'Event Musik',
    venue: raw.venue || raw.location || '-',
    date: raw.date || raw.eventDate || raw.event_date || 'Segera diumumkan',
    price: raw.price || 'Hubungi penyelenggara',
    image: images[0] || '',
    category: raw.category || 'Indie',
    description: raw.description || '',
    shortDescription:
      raw.shortDescription ||
      'Jangan lewatkan pengalaman musik terbaik bersama ribuan penonton lainnya.',
    images,
    lineup: raw.lineup || [],
    ticketTypes: raw.ticketTypes || [],
    terms: raw.terms || DEFAULT_TERMS,
    refundPolicy: raw.refundPolicy || raw.refund_policy || DEFAULT_REFUND_POLICY,
    distanceKm: raw.distanceKm ?? 5,
  };
}

function WishlistCard({
  item,
  onPress,
  onRemove,
}: {
  item: WishlistItem;
  onPress: () => void;
  onRemove: (id: string) => void;
}) {
  const heartScale = useRef(new Animated.Value(1)).current;

  const handleHeartPress = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start(() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onRemove(item.id);
    });
  };

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}
        <TouchableOpacity style={styles.heartButton} onPress={handleHeartPress} activeOpacity={0.85}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Ionicons name="heart" size={18} color="#4A6FA5" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {item.artist ? <Text style={styles.cardArtist}>{item.artist}</Text> : null}

        {/* Cuplikan deskripsi singkat langsung di kartu, sama seperti
            highlight di HomeScreen, supaya user bisa lihat sekilas
            tanpa harus buka detail. */}
        {item.shortDescription ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.shortDescription}
          </Text>
        ) : null}

        {item.venue ? (
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={13} color="#9CA3AF" />
            <Text style={styles.metaText}>{item.venue}</Text>
          </View>
        ) : null}
        {item.date ? (
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
            <Text style={styles.metaText}>{item.date}</Text>
          </View>
        ) : null}

        <View style={styles.bottomRow}>
          <View>
            <Text style={styles.priceLabel}>MULAI DARI</Text>
            <Text style={styles.price}>{item.price}</Text>
          </View>
          <TouchableOpacity style={styles.buyButton} activeOpacity={0.9} onPress={onPress}>
            <Text style={styles.buyButtonText}>LIHAT DETAIL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function WishlistScreen() {
  const navigation = useNavigation<any>();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<WishlistItem | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [posterAspectRatio, setPosterAspectRatio] = useState(0.72);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [showSeatPicker, setShowSeatPicker] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    deskripsi: true,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('wishlist');
      const parsed = stored ? JSON.parse(stored) : [];
      const normalized = Array.isArray(parsed) ? parsed.map(normalizeWishlistItem) : [];
      setWishlist(normalized);
    } catch (error) {
      console.error('LOAD WISHLIST ERROR:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Muat ulang setiap kali halaman ini difokuskan (misalnya setelah user
  // menambah/menghapus item wishlist dari halaman detail event di Home),
  // supaya datanya selalu sinkron dengan AsyncStorage.
  useFocusEffect(
    useCallback(() => {
      loadWishlist();
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }, [loadWishlist])
  );

  const handleRemove = async (id: string) => {
    setWishlist((prev) => prev.filter((item) => item.id !== id));

    try {
      const stored = await AsyncStorage.getItem('wishlist');
      const parsed = stored ? JSON.parse(stored) : [];
      const updated = Array.isArray(parsed)
        ? parsed.filter((item: any) => String(item.id) !== String(id))
        : [];
      await AsyncStorage.setItem('wishlist', JSON.stringify(updated));
    } catch (error) {
      console.error('REMOVE WISHLIST ERROR:', error);
    }

    // Kalau item yang sedang dibuka di detail modal ini yang dihapus,
    // tutup modalnya juga.
    if (selectedEvent?.id === id) {
      setSelectedEvent(null);
    }
  };

  // Setiap kali sebuah event dibuka di detail sheet, reset carousel ke
  // gambar pertama dan pilih tier tiket pertama secara default.
  const openDetail = (item: WishlistItem) => {
    setSelectedEvent(item);
    setCarouselIndex(0);
    setSelectedTicketId(item.ticketTypes?.[0]?.id ?? null);
    setOpenSections({ deskripsi: true });
    setShowSeatPicker(false);

    const posterUri = item.images?.[0];
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
  };

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openInGoogleMaps = (venueName?: string) => {
    const query = encodeURIComponent(venueName || '');
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
  };

  const selectedTicket = selectedEvent?.ticketTypes?.find((t: any) => t.id === selectedTicketId);
  const carouselImages: string[] = selectedEvent?.images?.length ? selectedEvent.images : [];
  const detailCategoryMeta =
    (selectedEvent?.category && CATEGORY_META[selectedEvent.category]) || CATEGORY_META.Indie;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF6DD" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#4A6FA5" />
        </TouchableOpacity>
        <Text style={styles.logo}>Encoré</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={22} color="#1F2937" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Wishlist</Text>
            <Text style={styles.count}>{wishlist.length} Event Tersimpan</Text>
          </View>

          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator color="#4A6FA5" />
            </View>
          ) : wishlist.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>Belum ada event di wishlist kamu</Text>
            </View>
          ) : (
            wishlist.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onPress={() => openDetail(item)}
                onRemove={handleRemove}
              />
            ))
          )}
        </Animated.View>
      </ScrollView>

      {/* Detail event — sama seperti modal detail di HomeScreen */}
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
                        <View style={[styles.posterCardImage, styles.imagePlaceholder]} />
                      )}
                    </View>

                    {/* Item ini sudah pasti ada di wishlist, jadi tombol
                        love-nya aktif dan berfungsi sebagai hapus cepat. */}
                    <TouchableOpacity
                      style={[styles.posterBookmarkButton, styles.posterBookmarkButtonActive]}
                      activeOpacity={0.8}
                      onPress={() => selectedEvent && handleRemove(selectedEvent.id)}
                    >
                      <Ionicons name="heart" size={19} color="#E85D75" />
                    </TouchableOpacity>
                  </View>

                  {/* Title row */}
                  <View style={styles.titleRowV2}>
                    <View style={styles.titleRowTextBox}>
                      <Text style={styles.detailTitleV2}>{selectedEvent?.title}</Text>
                      {selectedEvent?.artist ? (
                        <Text style={styles.detailSubtitleV2}>{selectedEvent.artist}</Text>
                      ) : null}
                    </View>
                    {selectedEvent?.category ? (
                      <View
                        style={[styles.detailCategoryBadge, { backgroundColor: detailCategoryMeta.bg }]}
                      >
                        <Text style={[styles.detailCategoryBadgeText, { color: detailCategoryMeta.text }]}>
                          {selectedEvent.category}
                        </Text>
                      </View>
                    ) : null}
                  </View>

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
                  {selectedEvent?.ticketTypes?.length ? (
                    <View style={[styles.sectionV2, { marginBottom: SPACING.xl + 8 }]}>
                      <Text style={styles.sectionTitleV2}>Available Tiers</Text>

                      {selectedEvent.ticketTypes.map((ticket: any) => {
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
                  ) : null}
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
    fontSize: 18,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
    color: '#2C3E6B',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
    color: '#1F2937',
  },
  count: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imageWrapper: {
    height: 160,
    position: 'relative',
    backgroundColor: '#e5e5e5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#e5e5e5',
  },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBody: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
    color: '#1F2937',
    marginBottom: 2,
  },
  cardArtist: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 17,
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 5,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  priceLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  buyButton: {
    backgroundColor: '#8FB3E0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  // ===== Detail modal (disamakan dengan HomeScreen) =====
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
  posterCardWrap: {
    position: 'relative',
    paddingHorizontal: SPACING.lg,
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
  detailBuyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});