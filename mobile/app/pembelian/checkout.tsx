import { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

// NOTE: this uses @expo/vector-icons for icons (Ionicons).
// If your project isn't Expo-based, swap these for
// react-native-vector-icons or your icon set of choice.
//
// NOTE: navigation ke home menggunakan expo-router (router.replace).
// Sesuaikan path "/page/home" di bawah kalau struktur route kamu berbeda.

type PaymentMethod = "qris" | "va" | "ewallet" | "card";
type Screen = "checkout" | "payment";

export default function Checkout() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("qris");
  const [screen, setScreen] = useState<Screen>("checkout");
  const [uploaded, setUploaded] = useState(false);

  if (screen === "payment") {
    return (
      <PaymentScreen
        onBack={() => setScreen("checkout")}
        uploaded={uploaded}
        onUpload={() => setUploaded(true)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF3E3" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#16324F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Encoré</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.pageTitle}>Penyelesaian Pesanan</Text>
        <Text style={styles.pageSubtitle}>
          Selesaikan pembayaran dalam{" "}
          <Text style={styles.countdownInline}>14:58</Text>
        </Text>

        {/* Informasi Pemesan */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>Informasi Pemesan</Text>
          <TouchableOpacity>
            <Text style={styles.changeLink}>Ubah</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="person" size={16} color="#16324F" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Nama Lengkap</Text>
              <Text style={styles.infoValue}>prisa</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail" size={16} color="#16324F" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>prisa@gmail.com</Text>
            </View>
          </View>
        </View>

        {/* Detail Tiket */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
          Detail Tiket
        </Text>

        <View style={styles.card}>
          <View style={styles.ticketRow}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200",
              }}
              style={styles.ticketImage}
            />
            <View style={styles.ticketInfo}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Kode</Text>
              </View>
              <Text style={styles.ticketTitle}>Hindia Live Concert</Text>
              <Text style={styles.ticketMeta}>Istora Senayan • 24 Okt 2026</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>VIP – Row A-12 (x1)</Text>
            <Text style={styles.lineValue}>Rp 850.000</Text>
          </View>
          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Biaya Layanan</Text>
            <Text style={styles.lineValue}>Rp 25.000</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.lineRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>Rp 875.000</Text>
          </View>
        </View>

        {/* Metode Pembayaran */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
          Metode Pembayaran
        </Text>

        <PaymentOption
          icon="qr-code"
          title="QRIS"
          subtitle="Gopay, OVO, Dana, LinkAja"
          selected={selectedMethod === "qris"}
          onPress={() => setSelectedMethod("qris")}
        />
        <PaymentOption
          icon="business"
          title="Virtual Account"
          expandable
          onPress={() => setSelectedMethod("va")}
        />
        <PaymentOption
          icon="wallet"
          title="E-Wallet"
          expandable
          onPress={() => setSelectedMethod("ewallet")}
        />
        <PaymentOption
          icon="card"
          title="Kartu Kredit / Debit"
          selected={selectedMethod === "card"}
          onPress={() => setSelectedMethod("card")}
        />

        <Text style={styles.terms}>
          Dengan melanjutkan, Anda menyetujui{" "}
          <Text style={styles.termsLink}>Syarat & Ketentuan</Text> serta{" "}
          <Text style={styles.termsLink}>Kebijakan Privasi</Text> yang berlaku
          di Encoré.
        </Text>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarTop}>
          <View>
            <Text style={styles.bottomTotalLabel}>Total Pembayaran</Text>
            <Text style={styles.bottomTotalValue}>Rp 875.000</Text>
          </View>
          <Text style={styles.bottomCountdown}>Berakhir dalam 14:58</Text>
        </View>
        <TouchableOpacity
          style={styles.payButton}
          activeOpacity={0.85}
          onPress={() => setScreen("payment")}
        >
          <Text style={styles.payButtonText}>Bayar Sekarang</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function PaymentOption({
  icon,
  title,
  subtitle,
  selected,
  expandable,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  selected?: boolean;
  expandable?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.paymentOption, selected && styles.paymentOptionSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.paymentLeft}>
        <Ionicons name={icon} size={20} color="#16324F" />
        <View>
          <Text style={styles.paymentTitle}>{title}</Text>
          {subtitle ? (
            <Text style={styles.paymentSubtitle}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      {expandable ? (
        <Ionicons name="chevron-down" size={18} color="#8A8578" />
      ) : (
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected && <View style={styles.radioDot} />}
        </View>
      )}
    </TouchableOpacity>
  );
}

/* -------------------------------------------------------------------- */
/*  PAYMENT SCREEN                                                       */
/* -------------------------------------------------------------------- */

function PaymentScreen({
  onBack,
  uploaded,
  onUpload,
}: {
  onBack: () => void;
  uploaded: boolean;
  onUpload: () => void;
}) {
  const qrData = encodeURIComponent(
    "00020101021126570011ID.DANA.WWW01189360091412345678900215ID10200012345678"
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FBF3E3" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={22} color="#16324F" />
        </TouchableOpacity>
        <Text style={styles.headerTitleSmall}>Payment</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* QRIS card */}
        <View style={styles.qrisCard}>
          <View style={styles.expiresBadge}>
            <Ionicons name="time-outline" size={12} color="#8A6A1F" />
            <Text style={styles.expiresBadgeText}>EXPIRES IN 14:58</Text>
          </View>

          <View style={styles.qrBox}>
            <Image
              source={{
                uri: `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${qrData}`,
              }}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.totalDueLabel}>Total Yang Harus Di Bayar</Text>
          <Text style={styles.totalDueValue}>RP 875.000</Text>
        </View>

        {/* Instructions */}
        <Text style={styles.howToTitle}>Cara Membayar Pakai QRIS</Text>

        <InstructionStep
          number={1}
          text="Buka aplikasi m-banking atau dompet digital Anda"
        />
        <InstructionStep number={2} text="Scan kode QR di atas." />
        <InstructionStep
          number={3}
          text="Periksa kembali detail transaksi, lalu selesaikan pembayaran."
        />

        <TouchableOpacity style={styles.ivePaidButton} activeOpacity={0.85}>
          <Text style={styles.ivePaidButtonText}>I've Paid</Text>
        </TouchableOpacity>

        {/* Virtual Account */}
        <View style={styles.vaCard}>
          <View style={styles.vaHeaderRow}>
            <View style={styles.vaIconCircle}>
              <Ionicons name="business-outline" size={16} color="#16324F" />
            </View>
            <Text style={styles.vaHeaderText}>Virtual Account</Text>
          </View>

          <View style={styles.vaNumberBox}>
            <View>
              <Text style={styles.vaNumberLabel}>Account Number</Text>
              <Text style={styles.vaNumberValue}>8802 0123 4567 89</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={18} color="#57534A" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Upload bukti pembayaran */}
        <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
          Upload Bukti Pembayaran
        </Text>

        <View style={styles.uploadBox}>
          <View style={styles.uploadCloudCircle}>
            <Ionicons
              name={uploaded ? "checkmark" : "cloud-upload-outline"}
              size={22}
              color="#8A8578"
            />
          </View>
          <Text style={styles.uploadTitle}>
            {uploaded ? "Bukti berhasil diupload" : "Upload Bukti Disini!"}
          </Text>
          {!uploaded && (
            <Text style={styles.uploadHint}>JPG, PNG, or PDF (Max 5MB)</Text>
          )}

          <TouchableOpacity
            style={styles.uploadButton}
            activeOpacity={0.85}
            onPress={onUpload}
          >
            <Text style={styles.uploadButtonText}>
              {uploaded ? "Ganti File" : "Upload"}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          activeOpacity={0.85}
          onPress={() => router.replace("/page/home")}
        >
          <Text style={styles.doneButtonText}>Pembayaran Selesai</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function InstructionStep({ number, text }: { number: number; text: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.stepNumberCircle}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const CREAM = "#FBF3E3";
const CARD = "#FFFFFF";
const NAVY = "#16324F";
const TEAL = "#2F6E8C";
const MUTED = "#8A8578";
const GREEN_BG = "#E4F0DE";
const GREEN_BORDER = "#8FBF7B";
const ORANGE = "#C9622A";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: CREAM,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: NAVY,
    fontStyle: "italic",
  },
  headerTitleSmall: {
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#2B2A26",
    marginTop: 4,
  },
  pageSubtitle: {
    fontSize: 13,
    color: MUTED,
    marginTop: 4,
    marginBottom: 20,
  },
  countdownInline: {
    color: ORANGE,
    fontWeight: "600",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#57534A",
  },
  sectionLabelSpaced: {
    marginTop: 20,
    marginBottom: 8,
  },
  changeLink: {
    fontSize: 13,
    color: TEAL,
    fontWeight: "600",
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EAF1F6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: MUTED,
  },
  infoValue: {
    fontSize: 14,
    color: "#2B2A26",
    fontWeight: "600",
    marginTop: 2,
  },
  infoDivider: {
    height: 1,
    backgroundColor: "#F0EBDD",
    marginVertical: 12,
  },
  ticketRow: {
    flexDirection: "row",
    gap: 12,
  },
  ticketImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#E5E5E5",
  },
  ticketInfo: {
    flex: 1,
    justifyContent: "center",
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#F3E7C9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    color: "#8A6A1F",
    fontWeight: "600",
  },
  ticketTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2B2A26",
  },
  ticketMeta: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0EBDD",
    marginVertical: 12,
  },
  lineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  lineLabel: {
    fontSize: 13,
    color: "#57534A",
  },
  lineValue: {
    fontSize: 13,
    color: "#2B2A26",
    fontWeight: "600",
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2B2A26",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "700",
    color: TEAL,
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: CARD,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "transparent",
  },
  paymentOptionSelected: {
    backgroundColor: GREEN_BG,
    borderColor: GREEN_BORDER,
  },
  paymentLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2B2A26",
    marginLeft: 12,
  },
  paymentSubtitle: {
    fontSize: 11,
    color: MUTED,
    marginLeft: 12,
    marginTop: 2,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#C9C4B4",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: "#4A8F3C",
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#4A8F3C",
  },
  terms: {
    fontSize: 11,
    color: MUTED,
    lineHeight: 16,
    marginTop: 8,
  },
  termsLink: {
    color: TEAL,
    fontWeight: "600",
  },
  bottomBar: {
    backgroundColor: NAVY,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  bottomBarTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  bottomTotalLabel: {
    fontSize: 11,
    color: "#B9C6D3",
  },
  bottomTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2,
  },
  bottomCountdown: {
    fontSize: 11,
    color: "#E7936B",
    fontWeight: "600",
  },
  payButton: {
    backgroundColor: "#3E6FA0",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  payButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  /* ---- Payment screen ---- */
  qrisCard: {
    backgroundColor: "#F6E9C8",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 8,
  },
  expiresBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 16,
  },
  expiresBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8A6A1F",
    marginLeft: 4,
  },
  qrBox: {
    width: 200,
    height: 200,
    backgroundColor: CARD,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
  },
  qrImage: {
    width: "100%",
    height: "100%",
  },
  totalDueLabel: {
    fontSize: 12,
    color: "#7A6A44",
    marginTop: 16,
  },
  totalDueValue: {
    fontSize: 26,
    fontWeight: "800",
    color: ORANGE,
    marginTop: 2,
  },
  howToTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2B2A26",
    marginTop: 22,
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
  },
  stepNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#DCEAF3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 1,
  },
  stepNumberText: {
    fontSize: 11,
    fontWeight: "700",
    color: TEAL,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: "#57534A",
    lineHeight: 18,
  },
  ivePaidButton: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 22,
  },
  ivePaidButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  vaCard: {
    backgroundColor: "#F6E9C8",
    borderRadius: 18,
    padding: 16,
  },
  vaHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  vaIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  vaHeaderText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2B2A26",
  },
  vaNumberBox: {
    backgroundColor: CARD,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  vaNumberLabel: {
    fontSize: 11,
    color: MUTED,
    marginBottom: 2,
  },
  vaNumberValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2B2A26",
    letterSpacing: 0.5,
  },
  copyButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F0EBDD",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadBox: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E3DCC8",
    borderStyle: "dashed",
    paddingVertical: 26,
    alignItems: "center",
    marginBottom: 8,
  },
  uploadCloudCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F1E4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2B2A26",
  },
  uploadHint: {
    fontSize: 11,
    color: MUTED,
    marginTop: 4,
    marginBottom: 16,
  },
  uploadButton: {
    borderWidth: 1.5,
    borderColor: "#D8D2C0",
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 10,
    marginTop: 14,
  },
  uploadButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2B2A26",
  },
  doneButton: {
    backgroundColor: "#4A8F3C",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});