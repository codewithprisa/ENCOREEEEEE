import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// ===== Konstanta layout — sengaja disalin dari HomeScreen.tsx (bukan
// di-import) supaya file ini berdiri sendiri dan tidak bergantung pada
// struktur internal HomeScreen. =====
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

const FONT_SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' });

// Deterministic pseudo-random number in [min, max) derived from a string id,
// dipakai supaya status "terjual" tiap kursi tetap konsisten di setiap
// render tanpa perlu data kuota asli dari API.
const stableNumber = (id: string, min: number, max: number) => {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return min + (hash % (max - min));
};

export type PilihTiketTicket = {
  id?: string;
  label: string;
  price: string;
  benefits?: string[];
};

type PilihTiketProps = {
  eventTitle?: string;
  eventDate?: string | null;
  ticket?: PilihTiketTicket | null;
  onBack?: () => void;
  // onCheckout sekarang opsional. Kalau di-pass, akan tetap dipanggil
  // (misal untuk analytics / update state di parent), tapi navigasi
  // ke halaman checkout dilakukan sendiri oleh komponen ini lewat router.
  onCheckout?: (seatCode: string) => void;
};

export default function PilihTiket({ eventTitle, eventDate, ticket, onBack, onCheckout }: PilihTiketProps) {
  const router = useRouter();
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  // Tiket yang menyebut "berdiri" di salah satu benefit-nya kita anggap
  // tiket festival/standing; selain itu ditampilkan sebagai SEATED.
  const isStandingTicket = !!ticket?.benefits?.some((b) => /berdiri/i.test(b));
  const selectedSeatCode = selectedSeatId ? selectedSeatId.split('__')[1] : null;

  // Menghasilkan baris-baris kursi untuk satu zona (mis. "vip", "tribunA").
  // Status terjual dibuat deterministik dari id kursi (stableNumber) supaya
  // tidak berubah-ubah setiap render, tanpa perlu data kuota asli dari API.
  const renderSeatGrid = (zoneKey: string, rows: number, cols: number) => {
    const gridRows = [];
    for (let r = 0; r < rows; r += 1) {
      const rowLetter = String.fromCharCode(65 + r);
      const seatButtons = [];
      for (let c = 0; c < cols; c += 1) {
        const seatCode = `${rowLetter}${c + 1}`;
        const seatId = `${zoneKey}__${seatCode}`;
        const sold = stableNumber(seatId, 0, 10) < 2;
        const isSelected = selectedSeatId === seatId;
        seatButtons.push(
          <TouchableOpacity
            key={seatId}
            disabled={sold}
            activeOpacity={0.7}
            onPress={() => setSelectedSeatId(seatId)}
            style={[
              styles.seatCell,
              sold ? styles.seatCellSold : isSelected ? styles.seatCellSelected : styles.seatCellAvailable,
            ]}
          />
        );
      }
      gridRows.push(
        <View key={`${zoneKey}-row-${rowLetter}`} style={styles.seatGridRow}>
          {seatButtons}
        </View>
      );
    }
    return gridRows;
  };

  // Dipanggil saat tombol back ditekan: pakai onBack kalau di-pass dari
  // parent, kalau tidak fallback ke router.back() (default expo-router).
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (router.canGoBack()) {
      router.back();
    }
  };

  // Dipanggil saat tombol CHECKOUT ditekan: panggil callback opsional
  // (kalau ada), lalu pindah ke halaman checkout via router sambil
  // membawa data yang dibutuhkan lewat query params.
const handleCheckout = () => {
  router.replace({
    pathname: "/pembelian/checkout",
    params: {
      seatCode: selectedSeatCode,
      ticketLabel: ticket?.label ?? "",
      ticketPrice: ticket?.price ?? "",
      eventTitle: eventTitle ?? "",
    },
  });
};

  return (
    <>
      {/* Header: back ke halaman detail + judul event */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {eventTitle || 'Pilih Tiket'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={styles.scrollContent}>
        {/* Ringkasan tiket yang dipilih */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryLabel}>{ticket?.label || '-'}</Text>
            <View style={styles.summaryTypeBadge}>
              <Text style={styles.summaryTypeBadgeText}>{isStandingTicket ? 'STANDING' : 'SEATED'}</Text>
            </View>
          </View>
          <Text style={styles.summaryPrice}>{ticket?.price || '-'}</Text>
          <Text style={styles.summarySale}>Sale ends {eventDate || 'segera diumumkan'}</Text>
        </View>

        {/* Benefit tiket */}
        {ticket?.benefits?.length ? (
          <View style={styles.benefitSection}>
            <Text style={styles.sectionTitle}>Yang Kamu Dapatkan</Text>
            {ticket.benefits.map((benefit) => (
              <View style={styles.benefitRow} key={benefit}>
                <Ionicons name="checkmark-circle-outline" size={17} color="#4A6FA5" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {/* Denah kursi */}
        <View style={styles.mapCard}>
          <View style={styles.stagePill}>
            <Text style={styles.stagePillText}>PANGGUNG UTAMA</Text>
          </View>

          <Text style={styles.zoneLabel}>ZONA VIP</Text>
          <View style={styles.zoneBlock}>{renderSeatGrid('vip', 5, 8)}</View>

          <View style={styles.sideZoneRow}>
            <View style={styles.sideZoneBox}>
              <Text style={styles.zoneLabel}>TRIBUN A</Text>
              {renderSeatGrid('tribunA', 3, 3)}
            </View>
            <View style={styles.sideZoneBox}>
              <Text style={styles.zoneLabel}>TRIBUN B</Text>
              {renderSeatGrid('tribunB', 3, 3)}
            </View>
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.seatCell, styles.seatCellAvailable, styles.legendCell]} />
              <Text style={styles.legendText}>Tersedia</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.seatCell, styles.seatCellSelected, styles.legendCell]} />
              <Text style={styles.legendText}>Terpilih</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.seatCell, styles.seatCellSold, styles.legendCell]} />
              <Text style={styles.legendText}>Terjual</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar: keranjang + checkout */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.cartButton} activeOpacity={0.8}>
          <Ionicons name="cart-outline" size={20} color="#2C3E6B" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.checkoutButton, !selectedSeatId && styles.checkoutButtonDisabled]}
          activeOpacity={0.85}
          disabled={!selectedSeatId}
          onPress={handleCheckout}
        >
          <Text style={styles.checkoutLabel}>CHECKOUT</Text>
          <Text style={styles.checkoutMeta} numberOfLines={1}>
            {selectedSeatId
              ? `${ticket?.label} - ${selectedSeatCode} | ${ticket?.price}`
              : 'Pilih kursi terlebih dahulu'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: Platform.OS === 'ios' ? 54 : 34,
    paddingBottom: SPACING.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E6B',
  },
  headerSpacer: {
    width: 36,
  },

  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xl,
  },

  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: '#EADFB2',
    padding: SPACING.lg - 2,
    marginBottom: SPACING.lg,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
    color: '#2C3E6B',
  },
  summaryTypeBadge: {
    backgroundColor: '#EEF3FA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  summaryTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4A6FA5',
    letterSpacing: 0.4,
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: SPACING.sm,
  },
  summarySale: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },

  benefitSection: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONT_SERIF,
    color: '#2C3E6B',
    marginBottom: SPACING.sm + 2,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    color: '#374151',
  },

  mapCard: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg - 2,
    alignItems: 'center',
    ...CARD_SHADOW,
  },
  stagePill: {
    alignSelf: 'stretch',
    backgroundColor: '#F3DFBE',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  stagePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8A6A3A',
    letterSpacing: 1,
  },
  zoneLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.6,
    marginBottom: SPACING.sm,
  },
  zoneBlock: {
    backgroundColor: '#F5F1E4',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  seatGridRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  seatCell: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  seatCellAvailable: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#9DBEDD',
  },
  seatCellSelected: {
    backgroundColor: '#2C3E6B',
  },
  seatCellSold: {
    backgroundColor: '#E1E1E1',
  },
  sideZoneRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignSelf: 'stretch',
    marginBottom: SPACING.md,
  },
  sideZoneBox: {
    flex: 1,
    backgroundColor: '#EAF1FA',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: '#6B7280',
  },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 26 : SPACING.md,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#F0E6C8',
  },
  cartButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#EADFB2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: '#2C3E6B',
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
  },
  checkoutButtonDisabled: {
    backgroundColor: '#A9AFC0',
  },
  checkoutLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  checkoutMeta: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.9,
  },
});