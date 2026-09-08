import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ==================== KONFIGURASI API ====================
// Emulator Android: "http://10.0.2.2:3001/api"
// Device fisik: "http://<IP-LAN-komputer>:3001/api"
const API_BASE_URL = "http://localhost:3001/api";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500";

// ==================== TYPES ====================

// Bentuk data mentah dari API (sesuai kolom di eventController.js -> getEvents)
interface EventApiResponse {
  id: number;
  title: string;
  description?: string | null;
  event_date?: string | null;
  ticket_open?: string | null;
  ticket_close?: string | null;
  status?: string;
  poster?: string | null;
  admin_name?: string;
  venue_name?: string | null;
  city?: string | null;
  artist_name?: string | null;
  artist_photo?: string | null;
  genre_id?: number | null;
  artist_genre?: string | null; // alias dari g.genre_name di query
  total_sold?: number;
  total_quota?: number;
  min_price?: number | null;
  max_price?: number | null;
}

interface GenreApiResponse {
  id?: number;
  genre_name?: string;
  name?: string;
}

// Bentuk data yang sudah dipetakan untuk dipakai UI
interface EventItem {
  id: string;
  title: string;
  artist: string;
  category: string;
  venue: string;
  city: string;
  date: string;
  price: string;
  image: string;
  status?: string;
}

interface ApiListResponse<T> {
  data?: T[];
}

// ==================== HELPER ====================

function formatTanggalID(dateString?: string | null): string {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function formatHarga(
  min?: number | null,
  max?: number | null
): string {
  if (min == null && max == null) return "-";

  const format = (n: number) => `Rp ${Number(n).toLocaleString("id-ID")}`;

  if (min == null || max == null || Number(min) === Number(max)) {
    return format((min ?? max) as number);
  }

  return `${format(min)} - ${format(max)}`;
}

function mapEventFromApi(item: EventApiResponse): EventItem {
  return {
    id: String(item.id),
    title: item.title ?? "-",
    artist: item.artist_name ?? "-",
    category: item.artist_genre ?? "Semua", // alias dari g.genre_name (genre event)
    venue: item.venue_name ?? "-",
    city: item.city ?? "",
    date: formatTanggalID(item.event_date),
    price: formatHarga(item.min_price, item.max_price),
    image: item.poster || FALLBACK_IMAGE,
    status: item.status,
  };
}

function mapGenreFromApi(item: GenreApiResponse): string {
  return item.genre_name ?? item.name ?? "";
}

// ==================== KOMPONEN ====================

export default function PencarianScreen() {
  const [search, setSearch] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("Semua");

  const [events, setEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua"]);

  const [loadingEvents, setLoadingEvents] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---------- Ambil daftar genre sekali di awal ----------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/genres`);
        if (!res.ok) throw new Error("Gagal mengambil genre");

        const json:
          | GenreApiResponse[]
          | ApiListResponse<GenreApiResponse> = await res.json();

        const list = Array.isArray(json) ? json : json.data ?? [];

        const namaGenre = list.map(mapGenreFromApi).filter(Boolean);

        setCategories(["Semua", ...namaGenre]);
      } catch (err) {
        console.log(
          "Gagal fetch genre:",
          err instanceof Error ? err.message : err
        );
      }
    };

    fetchCategories();
  }, []);

  // ---------- Ambil event sesuai search & kategori ----------
  const fetchEvents = useCallback(
    async (keyword: string, category: string) => {
      setLoadingEvents(true);
      setError(null);

      try {
        const params = new URLSearchParams();

        if (keyword) params.append("search", keyword);
        if (category && category !== "Semua") {
          params.append("genre", category);
        }

        const res = await fetch(
          `${API_BASE_URL}/events?${params.toString()}`
        );

        if (!res.ok) {
          throw new Error(
            `Gagal mengambil data event (status ${res.status})`
          );
        }

        const json:
          | EventApiResponse[]
          | ApiListResponse<EventApiResponse> = await res.json();

        const list = Array.isArray(json) ? json : json.data ?? [];

        setEvents(list.map(mapEventFromApi));
      } catch (err) {
        console.log(
          "Gagal fetch event:",
          err instanceof Error ? err.message : err
        );
        setError("Gagal memuat event. Periksa koneksi ke server.");
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    },
    []
  );

  // Debounce supaya tidak fetch di setiap ketikan huruf
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      fetchEvents(search, activeCategory);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, activeCategory, fetchEvents]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF9F6" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>Encoré</Text>

        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={23} color="#1F2937" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      {/* SEARCH BOX */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={21} color="#7A8793" />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Cari nama event, artis, atau venue..."
          placeholderTextColor="#9CA3AF"
          style={styles.searchInput}
        />

        {loadingEvents && <ActivityIndicator size="small" color="#28618A" />}

        {!loadingEvents && search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* CATEGORY */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionTitle}>Kategori</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((category) => {
            const active = activeCategory === category;

            return (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  active && styles.categoryButtonActive,
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    active && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* HASIL */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>
          {search ? `Hasil untuk "${search}"` : "Jelajahi Event"}
        </Text>

        <Text style={styles.resultCount}>{events.length} event</Text>
      </View>

      {/* ERROR */}
      {error && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* EVENT LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.eventList}
      >
        {loadingEvents && events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color="#28618A" />
            <Text style={styles.emptyText}>Memuat event...</Text>
          </View>
        ) : events.length > 0 ? (
          events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              activeOpacity={0.85}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />

              <View style={styles.eventInfo}>
                <View>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {event.category}
                    </Text>
                  </View>

                  <Text style={styles.eventTitle} numberOfLines={2}>
                    {event.title}
                  </Text>

                  <Text style={styles.artist} numberOfLines={1}>
                    {event.artist}
                  </Text>

                  <View style={styles.detailRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.detailText}>{event.date}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.detailText} numberOfLines={1}>
                      {event.venue}
                      {event.city ? `, ${event.city}` : ""}
                    </Text>
                  </View>
                </View>

                <Text style={styles.price}>{event.price}</Text>
              </View>

              <TouchableOpacity style={styles.arrowButton}>
                <Ionicons name="chevron-forward" size={18} color="#28618A" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={55} color="#B6C1C9" />
            <Text style={styles.emptyTitle}>Event tidak ditemukan</Text>
            <Text style={styles.emptyText}>
              Coba gunakan kata kunci atau kategori lain.
            </Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF9F6",
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  logo: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E6B",
    fontFamily: "serif",
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  notificationDot: {
    position: "absolute",
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    top: 9,
    right: 10,
  },
  searchContainer: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1F2937",
  },
  categorySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 14,
  },
  categoryList: {
    gap: 10,
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8E1DB",
  },
  categoryButtonActive: {
    backgroundColor: "#28618A",
    borderColor: "#28618A",
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#486274",
  },
  categoryTextActive: {
    color: "#FFFFFF",
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  resultTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1F2937",
  },
  resultCount: {
    fontSize: 13,
    color: "#7A8793",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 12,
    flex: 1,
  },
  eventList: {
    paddingBottom: 20,
    gap: 14,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  eventImage: {
    width: 95,
    height: 130,
    borderRadius: 14,
    backgroundColor: "#E5E7EB",
  },
  eventInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#E6F0F7",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 7,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#28618A",
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    lineHeight: 21,
  },
  artist: {
    fontSize: 13,
    color: "#28618A",
    fontWeight: "600",
    marginTop: 3,
    marginBottom: 7,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
  },
  detailText: {
    flex: 1,
    fontSize: 11,
    color: "#6B7280",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: "#28618A",
    marginTop: 8,
  },
  arrowButton: {
    justifyContent: "center",
    paddingLeft: 5,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 70,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },
  emptyText: {
    marginTop: 7,
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
  },
});