// app/profile.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { getToken, getUser, logout } from "../src/services/auth";
import { API } from "../src/services/api";

const { width: SCREEN_W } = Dimensions.get("window");
const PAD = 16;

type ProfilePayload = {
  user?: {
    email?: string;
    full_name?: string | null;
    created_at?: string;
  };
  learning?: Array<{ module: string; action: string; at: string }>;
  flashcards?: Array<{ module: string; current: number; total: number; at: string }>;
  quizzes?: Array<{ module: string; score: number; total: number; at?: string }>;
  games?: Array<{ game: string; metric: string; value: number; at?: string }>;
};

type TabKey = "learning" | "flashcards" | "quizzes" | "games";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "learning", label: "Pembelajaran", icon: "📚" },
  { key: "flashcards", label: "Flashcard", icon: "🃏" },
  { key: "quizzes", label: "Kuis", icon: "📝" },
  { key: "games", label: "Games", icon: "🎮" },
];

// ===== Helpers =====
function formatDateID(iso?: string) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function getInitials(nameOrEmail?: string) {
  const s = (nameOrEmail || "").trim();
  if (!s) return "VL";
  if (s.includes("@")) return s.slice(0, 2).toUpperCase();
  const parts = s.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function clampPct(p: number) {
  return Math.max(0, Math.min(100, Math.round(p)));
}

function latestFlashcardsPerModule(items: ProfilePayload["flashcards"] = []) {
  const map = new Map<string, { module: string; current: number; total: number; at: string }>();
  items.forEach((it) => {
    const mod = it.module || "Modul";
    const prev = map.get(mod);
    const t = new Date(it.at).getTime();
    const pt = prev ? new Date(prev.at).getTime() : -1;
    if (!prev || t > pt) map.set(mod, it as any);
  });
  return Array.from(map.values());
}

function sumLearning(items: ProfilePayload["learning"] = []) {
  const total = items.length;
  const modules = new Set(items.map((x) => x.module));
  return { totalActions: total, uniqueModules: modules.size };
}

function quizSummary(items: ProfilePayload["quizzes"] = []) {
  if (!items.length) return { attempts: 0, bestPct: 0, avgPct: 0 };
  const pcts = items.map((q) =>
    clampPct((Number(q.score || 0) / Math.max(1, Number(q.total || 0))) * 100)
  );
  const best = Math.max(...pcts);
  const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
  return { attempts: items.length, bestPct: best, avgPct: avg };
}

function gamesSummary(items: ProfilePayload["games"] = []) {
  const completed = items.filter((g) => (g.metric || "").toLowerCase() === "completed");
  const totalCompletions = completed.reduce((acc, g) => acc + (Number(g.value || 0) || 0), 0);

  const byGame = new Map<string, number>();
  completed.forEach((g) => {
    const k = (g.game || "game").toLowerCase();
    byGame.set(k, (byGame.get(k) || 0) + (Number(g.value || 0) || 0));
  });

  const top = Array.from(byGame.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => ({ game: k, count: v }));

  return { totalCompletions, top };
}

function prettyGameName(key: string) {
  if (key === "acid-base-mixer") return "Acid-Base Mixer";
  if (key === "periodic-table") return "Periodic Table";
  return key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ===== Fetch Backend via API.ts =====
async function fetchProfileFromBackend(): Promise<ProfilePayload> {
  const token = await getToken();
  if (!token) throw new Error("Token tidak ditemukan. Silakan login.");

  // 1) coba ambil /profile dulu
  const prof = (await API.fetchJSON("/profile", { method: "GET", auth: true })) as ProfilePayload;

  // 2) kalau backend belum ngirim progress di /profile, fallback ke endpoint progress
  const needLearning = !Array.isArray(prof.learning);
  const needFlashcards = !Array.isArray(prof.flashcards);
  const needQuizzes = !Array.isArray(prof.quizzes);
  const needGames = !Array.isArray(prof.games);

  const out: ProfilePayload = { ...prof };

  // Format fallback: endpoint kamu yg lama return { ok, count, data: [...] }
  if (needLearning) {
    const r = await API.fetchJSON("/progress/learning?limit=100", { method: "GET", auth: true });
    out.learning = r?.data ?? [];
  }
  if (needFlashcards) {
    const r = await API.fetchJSON("/progress/flashcard?limit=100", { method: "GET", auth: true });
    out.flashcards = r?.data ?? [];
  }
  if (needQuizzes) {
    const r = await API.fetchJSON("/progress/quiz?limit=100", { method: "GET", auth: true });
    out.quizzes = r?.data ?? [];
  }
  if (needGames) {
    const r = await API.fetchJSON("/progress/game?limit=100", { method: "GET", auth: true });
    out.games = r?.data ?? [];
  }

  return out;
}

/** ===== Skeleton shimmer (tanpa library) ===== */
function useShimmer() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-80, 220],
  });

  return { translateX };
}

function SkeletonLine({ w = "100%", h = 12, r = 10 }: { w?: any; h?: number; r?: number }) {
  const { translateX } = useShimmer();
  return (
    <View style={[styles.skelBase, { width: w, height: h, borderRadius: r }]}>
      <Animated.View style={[styles.skelShine, { transform: [{ translateX }] }]} />
    </View>
  );
}

function SkeletonCard() {
  return (
    <View style={styles.glassCard}>
      <SkeletonLine w="60%" h={14} />
      <View style={{ height: 10 }} />
      <SkeletonLine w="90%" />
      <View style={{ height: 8 }} />
      <SkeletonLine w="82%" />
      <View style={{ height: 8 }} />
      <SkeletonLine w="70%" />
    </View>
  );
}

export default function Profile() {
  const router = useRouter();

  const [userLocal, setUserLocal] = useState<any>(null);
  const [payload, setPayload] = useState<ProfilePayload | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backendWarning, setBackendWarning] = useState<string | null>(null);

  const [tabIndex, setTabIndex] = useState(0);

  // Pager scroll progress (ikut swipe)
  const scrollX = useRef(new Animated.Value(0)).current;
  const pagerRef = useRef<Animated.ScrollView | null>(null);

  // ===== Tabs scroll + fade hint =====
  const tabsRef = useRef<ScrollView | null>(null);
  const tabsWrapRef = useRef<View | null>(null);
  const tabItemRefs = useRef<Array<View | null>>([]);
  const [tabsCanScroll, setTabsCanScroll] = useState(false);
  const [tabsFadeLeft, setTabsFadeLeft] = useState(false);
  const [tabsFadeRight, setTabsFadeRight] = useState(false);

  const enforceAuth = async () => {
    const token = await getToken();
    if (!token) {
      router.replace("/login");
      return false;
    }
    return true;
  };

  const loadAll = async () => {
    setBackendWarning(null);
    setLoading(true);

    const ok = await enforceAuth();
    if (!ok) {
      setLoading(false);
      return;
    }

    try {
      const u = await getUser();
      setUserLocal(u);

      try {
        const p = await fetchProfileFromBackend();
        setPayload(p);
      } catch (e: any) {
        const msg = String(e?.message || "");
        const status = (e as any)?.status;

        // token invalid/expired
        if (status === 401 || /401|unauthorized|token/i.test(msg)) {
          await logout();
          router.replace("/login");
          return;
        }

        setPayload(null);
        setBackendWarning(`Progress dari backend belum bisa dimuat. (${msg || "Unknown error"})`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadAll();
      if (!mounted) return;
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadAll();
    } finally {
      setRefreshing(false);
    }
  };

  const email = payload?.user?.email || userLocal?.email || "-";
  const fullName =
    payload?.user?.full_name || userLocal?.name || userLocal?.full_name || userLocal?.fullName || "";
  const createdAt = payload?.user?.created_at || userLocal?.created_at || userLocal?.createdAt;

  const initials = useMemo(() => getInitials(fullName || email), [fullName, email]);

  const learning = payload?.learning ?? [];
  const flashcards = latestFlashcardsPerModule(payload?.flashcards ?? []);
  const quizzes = payload?.quizzes ?? [];
  const games = payload?.games ?? [];

  const learningSum = useMemo(() => sumLearning(learning), [learning]);
  const quizSum = useMemo(() => quizSummary(quizzes), [quizzes]);
  const gameSum = useMemo(() => gamesSummary(games), [games]);

  const flashcardsAvgPct = useMemo(() => {
    if (!flashcards.length) return 0;
    const pcts = flashcards.map((f) =>
      clampPct((Number(f.current || 0) / Math.max(1, Number(f.total || 0))) * 100)
    );
    return Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);
  }, [flashcards]);

  const snapToIndex = (i: number) => {
    const clamped = Math.max(0, Math.min(TABS.length - 1, i));
    setTabIndex(clamped);
    pagerRef.current?.scrollTo({ x: clamped * SCREEN_W, animated: true });

    // Auto-scroll tabs bar: center tab terpilih (presisi)
    requestAnimationFrame(() => {
      const tabEl = tabItemRefs.current[clamped];
      const wrapEl = tabsWrapRef.current;
      if (!tabEl || !wrapEl || !tabsRef.current) return;

      try {
        tabEl.measureLayout(
          // @ts-ignore
          wrapEl,
          (x: number, _y: number, w: number) => {
            const targetX = Math.max(0, x + w / 2 - SCREEN_W / 2);
            tabsRef.current?.scrollTo({ x: targetX, animated: true });
          },
          () => {}
        );
      } catch {}
    });
  };

  const onMomentumEnd = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const i = Math.round(x / SCREEN_W);
    setTabIndex(i);
    requestAnimationFrame(() => snapToIndex(i));
  };

  const onTabsContentSizeChange = (w: number) => {
    const can = w > SCREEN_W - PAD * 2;
    setTabsCanScroll(can);
    setTabsFadeLeft(false);
    setTabsFadeRight(can);
  };

  const onTabsScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
    const x = contentOffset.x;
    const maxX = Math.max(0, contentSize.width - layoutMeasurement.width);

    setTabsFadeLeft(x > 6);
    setTabsFadeRight(maxX - x > 6);
  };

  // ===== pages =====
  const pages = useMemo(
    () => [
      {
        key: "learning",
        node: (
          <>
            <SectionTitle title="Progres Pembelajaran" subtitle="Riwayat aksi pada modul pembelajaran" />
            <GlassCard>
              {learning.length === 0 ? (
                <EmptyState text="Belum ada aktivitas pembelajaran." />
              ) : (
                learning.slice(0, 12).map((it, idx) => (
                  <RowItem key={idx} title={it.module} right={it.action} sub={formatDateID(it.at)} />
                ))
              )}
            </GlassCard>
          </>
        ),
      },
      {
        key: "flashcards",
        node: (
          <>
            <SectionTitle title="Flashcard" subtitle="Progres terbaru per modul" />
            <GlassCard>
              {flashcards.length === 0 ? (
                <EmptyState text="Belum ada progres flashcard." />
              ) : (
                flashcards.map((it, idx) => {
                  const total = Math.max(1, Number(it.total || 0));
                  const cur = Math.max(0, Number(it.current || 0));
                  const pct = clampPct((cur / total) * 100);

                  return (
                    <View key={idx} style={{ marginBottom: 14 }}>
                      <View style={styles.progressTop}>
                        <Text style={styles.rowTitle} numberOfLines={2}>
                          {it.module || "Modul"}
                        </Text>
                        <Text style={styles.progressPct}>{pct}%</Text>
                      </View>

                      <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%` }]} />
                      </View>

                      <Text style={styles.progressSub}>
                        {cur}/{total} kartu • update {formatDateID(it.at)}
                      </Text>
                    </View>
                  );
                })
              )}
            </GlassCard>
          </>
        ),
      },
      {
        key: "quizzes",
        node: (
          <>
            <SectionTitle title="Kuis" subtitle="Skor & ringkasan performa" />
            <GlassCard>
              <View style={styles.summaryRow}>
                <SummaryChip label="Percobaan" value={String(quizSum.attempts)} />
                <SummaryChip label="Best" value={`${quizSum.bestPct}%`} />
                <SummaryChip label="Rata-rata" value={`${quizSum.avgPct}%`} />
              </View>

              <View style={{ height: 12 }} />

              {quizzes.length === 0 ? (
                <EmptyState text="Belum ada hasil kuis." />
              ) : (
                quizzes.slice(0, 12).map((q, idx) => {
                  const total = Math.max(1, Number(q.total || 0));
                  const score = Math.max(0, Number(q.score || 0));
                  const pct = clampPct((score / total) * 100);
                  return (
                    <RowItem
                      key={idx}
                      title={q.module || "Kuis"}
                      right={`${score}/${total} (${pct}%)`}
                      sub={q.at ? formatDateID(q.at) : undefined}
                    />
                  );
                })
              )}
            </GlassCard>
          </>
        ),
      },
      {
        key: "games",
        node: (
          <>
            <SectionTitle title="Games" subtitle="Total completion & game teratas" />
            <GlassCard>
              <View style={styles.summaryRow}>
                <SummaryChip label="Total selesai" value={String(gameSum.totalCompletions)} />
              </View>

              <View style={{ height: 12 }} />

              {gameSum.totalCompletions === 0 ? (
                <EmptyState text="Belum ada progress games." />
              ) : (
                gameSum.top.map((g, idx) => (
                  <RowItem key={idx} title={prettyGameName(g.game)} right={`${g.count}x`} sub="completed" />
                ))
              )}
            </GlassCard>
          </>
        ),
      },
    ],
    [learning, flashcards, quizzes, quizSum, gameSum]
  );

  return (
    <LinearGradient colors={["#0b1224", "#0f172a", "#0b1020"]} style={styles.bg}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 28 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#93c5fd" />}
      >
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.profileTitle}>Profil</Text>
            <Text style={styles.profileName} numberOfLines={1}>
              {fullName || "Pengguna"}
            </Text>
            <Text style={styles.profileMeta} numberOfLines={1}>
              {email}
            </Text>
            <Text style={styles.profileMeta}>Terdaftar • {formatDateID(createdAt)}</Text>
          </View>

          <Pressable
            onPress={async () => {
              await logout();
              router.replace("/login");
            }}
            style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.logoutText}>Keluar</Text>
          </Pressable>
        </View>

        {backendWarning ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Info</Text>
            <Text style={styles.warningText}>{backendWarning}</Text>
          </View>
        ) : null}

        {/* Skeleton loading */}
        {loading ? (
          <View style={{ gap: 12 }}>
            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <SkeletonLine w="55%" h={12} />
                <View style={{ height: 10 }} />
                <SkeletonLine w="35%" h={20} />
                <View style={{ height: 10 }} />
                <SkeletonLine w="45%" h={12} />
              </View>
              <View style={styles.statCard}>
                <SkeletonLine w="55%" h={12} />
                <View style={{ height: 10 }} />
                <SkeletonLine w="35%" h={20} />
                <View style={{ height: 10 }} />
                <SkeletonLine w="45%" h={12} />
              </View>
            </View>

            <SkeletonCard />
            <SkeletonCard />
          </View>
        ) : (
          <>
            {/* Quick stats */}
            <View style={styles.statsRow}>
              <StatCard
                label="Aktivitas belajar"
                value={String(learningSum.totalActions)}
                chip={`${learningSum.uniqueModules} modul`}
              />
              <StatCard label="Rata-rata flashcard" value={`${flashcardsAvgPct}%`} chip={`${flashcards.length} modul`} />
              <StatCard label="Kuis (best)" value={`${quizSum.bestPct}%`} chip={`avg ${quizSum.avgPct}%`} />
              <StatCard label="Games selesai" value={String(gameSum.totalCompletions)} chip="total completion" />
            </View>

            {/* ===== Segmented Tabs: scrollable + fade hint ===== */}
            <View style={{ marginTop: 4 }}>
              <View style={styles.segmentWrapFixed} ref={(r) => (tabsWrapRef.current = r)}>
                <ScrollView
                  ref={(r) => (tabsRef.current = r)}
                  horizontal
                  bounces={false}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.segmentRowScroll}
                  onContentSizeChange={(w) => onTabsContentSizeChange(w)}
                  onScroll={onTabsScroll}
                  scrollEventThrottle={16}
                >
                  {TABS.map((t, i) => {
                    const active = i === tabIndex;
                    return (
                      <Pressable
                        key={t.key}
                        ref={(r) => (tabItemRefs.current[i] = r)}
                        onPress={() => snapToIndex(i)}
                        style={({ pressed }) => [
                          styles.segmentItemScroll,
                          active && styles.segmentItemScrollActive,
                          pressed && { opacity: 0.9 },
                        ]}
                      >
                        <Text style={[styles.segmentIcon, active && styles.segmentIconActive]}>{t.icon}</Text>
                        <Text
                          style={[styles.segmentTextScroll, active && styles.segmentTextScrollActive]}
                          numberOfLines={1}
                        >
                          {t.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Fade hints */}
                {tabsCanScroll && tabsFadeLeft && (
                  <LinearGradient
                    pointerEvents="none"
                    colors={["rgba(11,18,36,0.95)", "rgba(11,18,36,0.0)"]}
                    style={[styles.fade, styles.fadeLeft]}
                  />
                )}
                {tabsCanScroll && tabsFadeRight && (
                  <LinearGradient
                    pointerEvents="none"
                    colors={["rgba(11,18,36,0.0)", "rgba(11,18,36,0.95)"]}
                    style={[styles.fade, styles.fadeRight]}
                  />
                )}
              </View>

              <Text style={styles.swipeHint}>Geser kanan/kiri untuk melihat progres.</Text>
            </View>

            {/* ===== Pager (FULL width, no cut) ===== */}
            <Animated.ScrollView
              ref={(r) => (pagerRef.current = r)}
              horizontal
              pagingEnabled
              snapToInterval={SCREEN_W}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumEnd}
              scrollEventThrottle={16}
              style={{ marginHorizontal: -PAD }}
              onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                useNativeDriver: true,
              })}
            >
              {pages.map((p) => (
                <View key={p.key} style={styles.page}>
                  {p.node}
                </View>
              ))}
            </Animated.ScrollView>

            {/* dots */}
            <View style={styles.dots}>
              {TABS.map((_, i) => (
                <View key={i} style={[styles.dot, i === tabIndex && styles.dotActive]} />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// ===== UI Components =====
function GlassCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.glassCard}>{children}</View>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {!!subtitle && <Text style={styles.sectionSub}>{subtitle}</Text>}
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return <Text style={styles.empty}>{text}</Text>;
}

function RowItem({ title, right, sub }: { title: string; right: string; sub?: string }) {
  return (
    <View style={styles.rowItem}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {title}
        </Text>
        {!!sub && (
          <Text style={styles.rowSub} numberOfLines={1}>
            {sub}
          </Text>
        )}
      </View>
      <Text style={styles.rowRight} numberOfLines={1}>
        {right}
      </Text>
    </View>
  );
}

function StatCard({ label, value, chip }: { label: string; value: string; chip?: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {!!chip && (
        <View style={styles.statChip}>
          <Text style={styles.statChipText}>{chip}</Text>
        </View>
      )}
    </View>
  );
}

function SummaryChip({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryChip}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

// ===== Styles =====
const styles = StyleSheet.create({
  bg: { flex: 1 },
  scroll: { flex: 1, paddingHorizontal: PAD, paddingTop: PAD },

  headerCard: {
    flexDirection: "row",
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    shadowColor: "#93c5fd",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    marginBottom: 14,
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "rgba(96,165,250,0.18)",
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#93c5fd", fontWeight: "900", fontSize: 16 },

  profileTitle: { color: "#b0bec5", fontWeight: "800" },
  profileName: { color: "#ffffff", fontSize: 18, fontWeight: "900", marginTop: 2 },
  profileMeta: { color: "#b0bec5", marginTop: 2 },

  logoutBtn: {
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
  },
  logoutText: { color: "#e5e7eb", fontWeight: "900" },

  warningCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  warningTitle: { color: "#93c5fd", fontWeight: "900", marginBottom: 6 },
  warningText: { color: "#b0bec5" },

  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    width: (SCREEN_W - PAD * 2 - 12) / 2,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  statLabel: { color: "#b0bec5", fontWeight: "700" },
  statValue: { color: "#93c5fd", fontWeight: "900", fontSize: 22, marginTop: 6 },
  statChip: {
    marginTop: 8,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statChipText: { color: "#e5e7eb", fontWeight: "800", fontSize: 12 },

  swipeHint: { color: "#b0bec5", marginTop: 10, marginBottom: 12 },

  // Segmented tabs (scrollable) + fade
  segmentWrapFixed: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    overflow: "hidden",
    position: "relative",
  },
  segmentRowScroll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 4,
  },
  segmentItemScroll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 122,
  },
  segmentItemScrollActive: {
    backgroundColor: "rgba(96,165,250,0.16)",
    borderWidth: 1,
    borderColor: "rgba(147,197,253,0.35)",
  },
  segmentIcon: { fontSize: 14, opacity: 0.85 },
  segmentIconActive: { opacity: 1 },
  segmentTextScroll: { color: "#e5e7eb", fontWeight: "900", fontSize: 14 },
  segmentTextScrollActive: { color: "#93c5fd" },

  fade: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 26,
    zIndex: 10,
  },
  fadeLeft: { left: 0 },
  fadeRight: { right: 0 },

  // Pager page
  page: {
    width: SCREEN_W,
    paddingHorizontal: PAD,
    paddingBottom: 8,
  },

  glassCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },

  sectionTitle: { color: "#93c5fd", fontWeight: "900", fontSize: 18 },
  sectionSub: { color: "#b0bec5", marginTop: 6 },

  empty: { color: "#b0bec5", fontStyle: "italic" },

  rowItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  rowTitle: { color: "#ffffff", fontWeight: "900" },
  rowSub: { color: "#b0bec5", marginTop: 4, fontSize: 12 },
  rowRight: { color: "#93c5fd", fontWeight: "900" },

  progressTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  progressPct: { color: "#93c5fd", fontWeight: "900" },
  progressTrack: {
    marginTop: 10,
    height: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#60a5fa" },
  progressSub: { color: "#b0bec5", marginTop: 8, fontSize: 12 },

  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  summaryChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    minWidth: 110,
  },
  summaryLabel: { color: "#b0bec5", fontWeight: "800", fontSize: 12 },
  summaryValue: { color: "#93c5fd", fontWeight: "900", marginTop: 6 },

  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 12 },
  dot: { width: 8, height: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.18)" },
  dotActive: { backgroundColor: "#60a5fa" },

  // Skeleton
  skelBase: { backgroundColor: "rgba(255,255,255,0.08)", overflow: "hidden" },
  skelShine: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
