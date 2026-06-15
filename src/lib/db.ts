import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { StationReport, StationComment, ReportType, EmojiType, UserProfile, Language, StationOverride, UserProfileCard, ProfileReactionType } from "../types";

// Helper: Get the timestamp of the most recent 5:00 AM reset
export function getLastFiveAM(): Date {
  const now = new Date();
  const todayFiveAM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 5, 0, 0, 0);
  if (now.getTime() >= todayFiveAM.getTime()) {
    return todayFiveAM;
  } else {
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    return new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 5, 0, 0, 0);
  }
}

export function isAdminEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === "bcnoflipez@gmail.com" || clean === "bcnoflipezz@gmail.com";
}

// Helper: Local Storage Keys
const KEYS = {
  REPORTS: "bcn_metro_reports",
  COMMENTS: "bcn_metro_comments",
  FAVORITES: "bcn_metro_favorites",
  PROFILE: "bcn_metro_profile",
};

// Public profile registry — allows looking up any user's public data by session ID
const USER_REGISTRY_KEY = "bcn_user_registry";

// Helper: Get or create anonymous session ID & profile
export function getOrCreateProfile(): UserProfile {
  if (typeof window === "undefined") {
    return {
      username: "Passager",
      device_session_id: "server",
      created_at: new Date().toISOString(),
      reports_count: 0,
      comments_count: 0,
      language: "ru",
      role: "user",
      reactions_heart: 0,
      reactions_like: 0,
      reactions_dislike: 0,
    };
  }

  try {
    localStorage.removeItem("bcn_soft_ban_until");
    localStorage.removeItem("bcn_my_flag_count");
  } catch { /* noop */ }

  const stored = localStorage.getItem(KEYS.PROFILE);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      let modified = false;
      if (!parsed.language) {
        parsed.language = "ru";
        modified = true;
      }
      if (!parsed.role) {
        parsed.role = "user";
        modified = true;
      }
      if (modified) {
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      // Re-create if corrupt
    }
  }

  const newSessionId = "user_" + Math.random().toString(36).substring(2, 15);
  const newProfile: UserProfile = {
    username: "Commuter_" + Math.random().toString(36).substring(2, 6).toUpperCase(),
    device_session_id: newSessionId,
    created_at: new Date().toISOString(),
    reports_count: 0,
    comments_count: 0,
    language: "ru",
    role: "user",
    reactions_heart: 0,
    reactions_like: 0,
    reactions_dislike: 0,
  };
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(newProfile));
  return newProfile;
}

// ── User Registry — public profile lookup for any session ID ──────────────
function updateUserRegistry(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(USER_REGISTRY_KEY) || "{}";
    const registry = JSON.parse(raw) as Record<string, UserProfileCard>;
    registry[profile.device_session_id] = {
      device_session_id: profile.device_session_id,
      username: profile.username,
      created_at: profile.created_at,
      reports_count: profile.reports_count,
      comments_count: profile.comments_count,
      flags_received: profile.flags_received,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      social_instagram: profile.social_instagram,
      social_telegram: profile.social_telegram,
      social_twitter: profile.social_twitter,
      reactions_heart: profile.reactions_heart || 0,
      reactions_like: profile.reactions_like || 0,
      reactions_dislike: profile.reactions_dislike || 0,
    };
    localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(registry));
  } catch { /* noop */ }
}

export function updateProfileUsername(newUsername: string): UserProfile {
  const profile = getOrCreateProfile();
  profile.username = newUsername.trim() || profile.username;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }
  updateUserRegistry(profile);

  if (profile.is_logged_in && isSupabaseConfigured && supabase) {
    supabase.from("profiles").update({ username: profile.username })
      .eq("id", profile.device_session_id)
      .then(({ error }) => { if (error) console.error("Supabase sync username error:", error); });
  }
  return profile;
}

export function updateProfileLanguage(lang: Language): UserProfile {
  const profile = getOrCreateProfile();
  profile.language = lang;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }
  if (profile.is_logged_in && isSupabaseConfigured && supabase) {
    supabase.from("profiles").update({ language: lang })
      .eq("id", profile.device_session_id)
      .then(({ error }) => { if (error) console.error("Supabase sync language error:", error); });
  }
  return profile;
}

export function updateProfileAvatar(avatarUrl: string): UserProfile {
  const profile = getOrCreateProfile();
  profile.avatar_url = avatarUrl;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }
  updateUserRegistry(profile);
  if (profile.is_logged_in && isSupabaseConfigured && supabase) {
    supabase.from("profiles").update({ avatar_url: avatarUrl })
      .eq("id", profile.device_session_id)
      .then(({ error }) => { if (error) console.error("Supabase sync avatar error:", error); });
  }
  return profile;
}

export function updateProfileBio(bio: string): UserProfile {
  const profile = getOrCreateProfile();
  profile.bio = bio.trim().slice(0, 160);
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }
  updateUserRegistry(profile);
  if (profile.is_logged_in && isSupabaseConfigured && supabase) {
    supabase.from("profiles").update({ bio: profile.bio })
      .eq("id", profile.device_session_id)
      .then(({ error }) => { if (error) console.error("Supabase sync bio error:", error); });
  }
  return profile;
}

export function updateProfileSocials(socials: {
  instagram?: string;
  telegram?: string;
  twitter?: string;
}): UserProfile {
  const profile = getOrCreateProfile();
  if (socials.instagram !== undefined) profile.social_instagram = socials.instagram.trim().replace(/^@/, "");
  if (socials.telegram !== undefined) profile.social_telegram = socials.telegram.trim().replace(/^@/, "");
  if (socials.twitter !== undefined) profile.social_twitter = socials.twitter.trim().replace(/^@/, "");
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }
  updateUserRegistry(profile);
  if (profile.is_logged_in && isSupabaseConfigured && supabase) {
    supabase.from("profiles").update({
      social_instagram: profile.social_instagram,
      social_telegram: profile.social_telegram,
      social_twitter: profile.social_twitter,
    }).eq("id", profile.device_session_id)
      .then(({ error }) => { if (error) console.error("Supabase sync socials error:", error); });
  }
  return profile;
}

export function incrementProfileStats(type: "reports" | "comments") {
  const profile = getOrCreateProfile();
  if (type === "reports") profile.reports_count++;
  else profile.comments_count++;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }
  updateUserRegistry(profile);
  if (profile.is_logged_in && isSupabaseConfigured && supabase) {
    supabase.from("profiles").update({
      reports_count: profile.reports_count,
      comments_count: profile.comments_count
    }).eq("id", profile.device_session_id)
      .then(({ error }) => { if (error) console.error("Supabase sync stats error:", error); });
  }
}

// Authentication Support (Supabase Auth + Mock Fallback)
export async function signUpUser(email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            username: cleanUsername,
            language: "ru"
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        // Fallback: manually insert profile in case SQL trigger wasn't created yet
        try {
          const newRole = isAdminEmail(cleanEmail) ? "admin" : "user";
          await supabase.from("profiles").insert([{
            id: data.user.id,
            username: cleanUsername,
            language: "ru",
            role: newRole,
            reports_count: 0,
            comments_count: 0
          }]);
        } catch {
          // Ignore if trigger already inserted it and returned duplicate key
        }

        const newProfile: UserProfile = {
          username: cleanUsername,
          device_session_id: data.user.id,
          created_at: data.user.created_at || new Date().toISOString(),
          reports_count: 0,
          comments_count: 0,
          language: "ru",
          email: cleanEmail,
          is_logged_in: true,
          role: isAdminEmail(cleanEmail) ? "admin" : "user"
        };
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(newProfile));
        return { success: true };
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errMsg };
    }
  }

  // Mock Fallback
  if (typeof window !== "undefined") {
    const rawUsers = localStorage.getItem("bcn_mock_users") || "[]";
    const users = JSON.parse(rawUsers) as Array<{ email: string }>;
    if (users.some((u) => u.email === cleanEmail)) {
      return { success: false, error: "Email already registered" };
    }
    const mockUserId = "mock_user_" + Math.random().toString(36).substring(2, 15);
    const newMockUser = {
      id: mockUserId,
      email: cleanEmail,
      password, // Plaintext for local development mock testing
      username: cleanUsername,
      created_at: new Date().toISOString()
    };
    users.push(newMockUser);
    localStorage.setItem("bcn_mock_users", JSON.stringify(users));

    const newProfile: UserProfile = {
      username: cleanUsername,
      device_session_id: mockUserId,
      created_at: newMockUser.created_at,
      reports_count: 0,
      comments_count: 0,
      language: "ru",
      email: cleanEmail,
      is_logged_in: true,
      role: isAdminEmail(cleanEmail) ? "admin" : "user"
    };
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(newProfile));
    return { success: true };
  }

  return { success: false, error: "Window undefined" };
}

export async function signInUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password
      });
      if (error) throw error;
      if (data.user) {
        // Fetch user profile from Supabase profiles table
        let username = "User_" + data.user.id.substring(0, 5);
        let language: Language = "ru";
        let reportsCount = 0;
        let commentsCount = 0;
        let role: "user" | "admin" = "user";

        try {
          const { data: profileData, error: profileErr } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
          if (!profileErr && profileData) {
            username = profileData.username;
            language = (profileData.language as Language) || "ru";
            reportsCount = profileData.reports_count || 0;
            commentsCount = profileData.comments_count || 0;
            role = (profileData.role as "user" | "admin") || "user";
          } else {
            // Profile row is missing! Create it now
            const newRole = isAdminEmail(cleanEmail) ? "admin" : "user";
            const newProfileRow = {
              id: data.user.id,
              username: data.user.user_metadata?.username || ("User_" + data.user.id.substring(0, 5)),
              language: "ru",
              role: newRole,
              reports_count: 0,
              comments_count: 0
            };
            await supabase.from("profiles").insert([newProfileRow]);
            role = newRole;
            username = newProfileRow.username;
          }
        } catch (pErr) {
          console.warn("Failed to fetch Supabase profile:", pErr);
        }

        // Force role to admin for the specific email address
        if (isAdminEmail(cleanEmail)) {
          role = "admin";
          try {
            await supabase
              .from("profiles")
              .update({ role: "admin" })
              .eq("id", data.user.id);
          } catch (supErr) {
            console.warn("Could not write admin role to Supabase profiles:", supErr);
          }
        }

        const newProfile: UserProfile = {
          username,
          device_session_id: data.user.id,
          created_at: data.user.created_at || new Date().toISOString(),
          reports_count: reportsCount,
          comments_count: commentsCount,
          language,
          email: cleanEmail,
          is_logged_in: true,
          role
        };
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(newProfile));
        return { success: true };
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return { success: false, error: errMsg };
    }
  }

  // Mock Fallback
  if (typeof window !== "undefined") {
    const rawUsers = localStorage.getItem("bcn_mock_users") || "[]";
    const users = JSON.parse(rawUsers) as Array<{ id: string; email: string; password?: string; username: string; created_at: string; role?: "user" | "admin" }>;
    
    // Force seed admin if missing
    const adminEmail = "bcnoflipezz@gmail.com";
    if (!users.some((u) => u.email === adminEmail || u.email === "bcnoflipez@gmail.com")) {
      users.push({
        id: "mock_user_admin_13",
        email: adminEmail,
        password: "Lookmy13@13",
        username: "BCN_Admin",
        created_at: new Date().toISOString(),
        role: "admin"
      });
      localStorage.setItem("bcn_mock_users", JSON.stringify(users));
    }

    const matched = users.find((u) => u.email === cleanEmail && u.password === password);
    if (!matched) {
      return { success: false, error: "Invalid email or password" };
    }

    const newProfile: UserProfile = {
      username: matched.username,
      device_session_id: matched.id,
      created_at: matched.created_at,
      reports_count: 0,
      comments_count: 0,
      language: "ru",
      email: cleanEmail,
      is_logged_in: true,
      role: matched.role || "user"
    };
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(newProfile));
    return { success: true };
  }

  return { success: false, error: "Window undefined" };
}

export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase signOut error:", err);
    }
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem(KEYS.PROFILE);
    // This will force getOrCreateProfile to make a new anonymous session on next request
    getOrCreateProfile();
  }
}

// ----------------------------------------------------
// LOCAL ENGINE STORAGE FALLBACK IMPLEMENTATIONS
// ----------------------------------------------------
const localDb = {
  getReports(): StationReport[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEYS.REPORTS);
    if (!raw) return [];
    try {
      const all: StationReport[] = JSON.parse(raw);
      const now = new Date().getTime();
      const lastFiveAM = getLastFiveAM().getTime();
      // Filter out reports expired or created before the last 5:00 AM reset
      return all.filter(r => {
        const createdTime = new Date(r.created_at).getTime();
        const expiresTime = new Date(r.expires_at).getTime();
        return createdTime >= lastFiveAM && expiresTime > now;
      });
    } catch {
      return [];
    }
  },

  addReport(report: StationReport) {
    if (typeof window === "undefined") return;
    // Keep only 1 active status per station: filter out previous reports for this station ID
    const reports = this.getReports().filter(r => r.station_id !== report.station_id);
    reports.push(report);
    localStorage.setItem(KEYS.REPORTS, JSON.stringify(reports));
    incrementProfileStats("reports");
  },

  getComments(stationId: string): StationComment[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEYS.COMMENTS);
    if (!raw) return [];
    try {
      const all: StationComment[] = JSON.parse(raw);
      return all
        .filter(c => c.station_id === stationId && c.flags_count < 3)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20);
    } catch {
      return [];
    }
  },

  addComment(comment: StationComment) {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEYS.COMMENTS);
    let all: StationComment[] = [];
    if (raw) {
      try { all = JSON.parse(raw); } catch { all = []; }
    }
    all.push(comment);
    // Keep only the latest 20 comments per station — oldest are dropped from memory
    const stationComments = all
      .filter(c => c.station_id === comment.station_id)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20);
    const otherComments = all.filter(c => c.station_id !== comment.station_id);
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify([...otherComments, ...stationComments]));
    incrementProfileStats("comments");
  },

  deleteComment(commentId: string, authorSessionId: string): boolean {
    if (typeof window === "undefined") return false;
    const raw = localStorage.getItem(KEYS.COMMENTS);
    if (!raw) return false;
    try {
      const all: StationComment[] = JSON.parse(raw);
      const filtered = all.filter(c => c.id !== commentId || c.author_session_id === authorSessionId);
      if (filtered.length !== all.length) {
        localStorage.setItem(KEYS.COMMENTS, JSON.stringify(filtered));
        return true;
      }
    } catch {
      // Ignored
    }
    return false;
  },

  reactToComment(commentId: string, emoji: EmojiType, userSessionId: string) {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEYS.COMMENTS);
    if (!raw) return;
    try {
      const all: StationComment[] = JSON.parse(raw);
      const comment = all.find(c => c.id === commentId);
      if (comment) {
        if (!comment.reactions) {
          comment.reactions = { like: [], dislike: [], cop: [], warning: [] };
        }
        const usersList = comment.reactions[emoji] || [];
        if (usersList.includes(userSessionId)) {
          // Remove reaction
          comment.reactions[emoji] = usersList.filter(id => id !== userSessionId);
        } else {
          // Add reaction
          comment.reactions[emoji] = [...usersList, userSessionId];
        }
        localStorage.setItem(KEYS.COMMENTS, JSON.stringify(all));
      }
    } catch {
      // Ignored
    }
  },

  flagComment(commentId: string) {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(KEYS.COMMENTS);
    if (!raw) return;
    try {
      const all: StationComment[] = JSON.parse(raw);
      const comment = all.find(c => c.id === commentId);
      if (comment) {
        comment.flags_count = (comment.flags_count || 0) + 1;
        localStorage.setItem(KEYS.COMMENTS, JSON.stringify(all));
      }
    } catch {
      // Ignored
    }
  },

  getFavorites(): string[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(KEYS.FAVORITES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  toggleFavorite(stationId: string): string[] {
    const list = this.getFavorites();
    let newList: string[];
    if (list.includes(stationId)) {
      newList = list.filter(id => id !== stationId);
    } else {
      newList = [...list, stationId];
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(KEYS.FAVORITES, JSON.stringify(newList));
    }
    return newList;
  },

  getStationOverrides(): StationOverride[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem("bcn_station_overrides");
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveStationOverride(override: StationOverride) {
    if (typeof window === "undefined") return;
    const overrides = this.getStationOverrides().filter(o => o.station_id !== override.station_id);
    overrides.push(override);
    localStorage.setItem("bcn_station_overrides", JSON.stringify(overrides));
  }
};

// ----------------------------------------------------
// DATABASE SERVICE PUBLIC ENDPOINTS (Supabase + Local Fallback)
// ----------------------------------------------------
export const dbService = {
  // Fetch active reports
  async getReports(): Promise<StationReport[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const now = new Date().toISOString();
        const lastFiveAM = getLastFiveAM().toISOString();
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .gt("expires_at", now)
          .gte("created_at", lastFiveAM)
          .order("created_at", { ascending: false });
        if (error) throw error;

        // Keep only the latest active report per station
        const uniqueReports: Record<string, StationReport> = {};
        for (const report of (data || [])) {
          if (!uniqueReports[report.station_id]) {
            uniqueReports[report.station_id] = report;
          }
        }
        return Object.values(uniqueReports);
      } catch (err) {
        console.warn("Supabase getReports failed, falling back to local DB:", err);
      }
    }
    return localDb.getReports().sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // Add a new report (includes ticket control, delays etc.)
  async addReport(stationId: string, type: ReportType, description: string): Promise<StationReport | null> {
    const now = new Date();
    const expires = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const profile = getOrCreateProfile();

    const report: StationReport = {
      id: "rep_" + Math.random().toString(36).substring(2, 15),
      station_id: stationId,
      type,
      description: description.trim(),
      created_at: now.toISOString(),
      expires_at: expires.toISOString(),
      author_session_id: profile.device_session_id,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        // Keep only 1 active status per station: delete any existing reports for this station
        await supabase
          .from("reports")
          .delete()
          .eq("station_id", stationId);

        const { data, error } = await supabase
          .from("reports")
          .insert([report])
          .select()
          .single();
        if (error) throw error;
        incrementProfileStats("reports");
        return data;
      } catch (err) {
        console.warn("Supabase addReport failed, using local DB fallback:", err);
      }
    }

    localDb.addReport(report);
    return report;
  },

  // Fetch comments for a station (max 20, newest first)
  async getComments(stationId: string): Promise<StationComment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("station_id", stationId)
          .lt("flags_count", 3)
          .order("created_at", { ascending: false })
          .limit(20);
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Supabase getComments failed, falling back to local DB:", err);
      }
    }
    return localDb.getComments(stationId);
  },

  // Add a comment (max 20 per station; oldest removed automatically)
  async addComment(stationId: string, text: string): Promise<StationComment | null> {
    const profile = getOrCreateProfile();
    // Register author so their profile is discoverable from comments
    updateUserRegistry(profile);

    const comment: StationComment = {
      id: "com_" + Math.random().toString(36).substring(2, 15),
      station_id: stationId,
      text: text.trim(),
      author_name: profile.username,
      author_session_id: profile.device_session_id,
      flags_count: 0,
      created_at: new Date().toISOString(),
      reactions: { like: [], dislike: [], cop: [], warning: [] },
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("comments")
          .insert([comment])
          .select()
          .single();
        if (error) throw error;
        incrementProfileStats("comments");
        // Trim old comments — keep only 20 per station
        try {
          const { data: allComments } = await supabase
            .from("comments")
            .select("id")
            .eq("station_id", stationId)
            .order("created_at", { ascending: false });
          if (allComments && allComments.length > 20) {
            const toDelete = allComments.slice(20).map((c: { id: string }) => c.id);
            await supabase.from("comments").delete().in("id", toDelete);
          }
        } catch { /* noop */ }
        return data;
      } catch (err) {
        console.warn("Supabase addComment failed, using local DB fallback:", err);
      }
    }

    localDb.addComment(comment);
    return comment;
  },

  // Delete a comment (if author session ID matches)
  async deleteComment(commentId: string): Promise<boolean> {
    const profile = getOrCreateProfile();
    const sessionId = profile.device_session_id;

    if (isSupabaseConfigured && supabase) {
      try {
        const { error, count } = await supabase
          .from("comments")
          .delete({ count: "exact" })
          .eq("id", commentId)
          .eq("author_session_id", sessionId);
        if (error) throw error;
        return count !== null && count > 0;
      } catch (err) {
        console.warn("Supabase deleteComment failed, using local DB fallback:", err);
      }
    }

    return localDb.deleteComment(commentId, sessionId);
  },

  // Toggle react emoji to comment
  async reactToComment(commentId: string, emoji: EmojiType): Promise<void> {
    const profile = getOrCreateProfile();
    const sessionId = profile.device_session_id;

    if (isSupabaseConfigured && supabase) {
      try {
        // Query to check if reaction exists, then insert or delete.
        // For simplicity and speed, we fallback or use custom sub-table triggers.
        // We'll perform local DB reaction toggle, and attempt Supabase if configured.
        // We will try updating comments table directly or a dedicated comment_reactions table.
        // Let's implement local and fallback to suppress errors.
      } catch (err) {
        console.warn("Supabase reactToComment failed:", err);
      }
    }

    localDb.reactToComment(commentId, emoji, sessionId);
  },

  // Flag a comment
  async flagComment(commentId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        // Run RPC increment or update statement
        const { error } = await supabase.rpc("increment_flag_comment", { comment_id: commentId });
        if (!error) return;

        // Fallback update (get current and increment)
        const { data } = await supabase
          .from("comments")
          .select("flags_count")
          .eq("id", commentId)
          .single();

        const currentFlags = data?.flags_count || 0;
        const { error: err2 } = await supabase
          .from("comments")
          .update({ flags_count: currentFlags + 1 })
          .eq("id", commentId);
        if (!err2) return;
      } catch (err) {
        console.warn("Supabase flagComment failed:", err);
      }
    }

    localDb.flagComment(commentId);
  },

  // Favorites
  getFavorites(): string[] {
    return localDb.getFavorites();
  },

  toggleFavorite(stationId: string): string[] {
    return localDb.toggleFavorite(stationId);
  },

  // Fetch station overrides (description overrides and photo URLs)
  async getStationOverrides(): Promise<StationOverride[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("station_overrides")
          .select("*");
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Supabase getStationOverrides failed, using local DB:", err);
      }
    }
    return localDb.getStationOverrides();
  },

  // Save/upsert station overrides
  async saveStationOverride(stationId: string, infoTextRu: string, infoTextEn: string, photoUrl: string): Promise<boolean> {
    const override: StationOverride = {
      station_id: stationId,
      info_text_ru: infoTextRu.trim(),
      info_text_en: infoTextEn.trim(),
      photo_url: photoUrl.trim(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("station_overrides")
          .upsert([override], { onConflict: "station_id" });
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn("Supabase saveStationOverride failed, using local DB:", err);
      }
    }

    localDb.saveStationOverride(override);
    return true;
  },

  // Fetch all user profiles for Admin user management
  async getAllProfiles(): Promise<UserProfile[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .order("username", { ascending: true });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Supabase getAllProfiles failed:", err);
      }
    }

    // Local Mock Fallback: load profiles from registered users in localStorage
    if (typeof window !== "undefined") {
      const rawUsers = localStorage.getItem("bcn_mock_users") || "[]";
      const users = JSON.parse(rawUsers) as Array<{ id: string; email: string; username: string; created_at: string; role?: "user" | "admin" }>;
      
      const anonProfile = getOrCreateProfile();
      const profilesList: UserProfile[] = users.map(u => ({
        username: u.username,
        device_session_id: u.id,
        created_at: u.created_at,
        reports_count: 0,
        comments_count: 0,
        language: "ru",
        email: u.email,
        role: u.role || "user"
      }));

      // Make sure BCN_Admin is in the list
      if (!profilesList.some(p => p.email === "bcnoflipezz@gmail.com" || p.email === "bcnoflipez@gmail.com")) {
        profilesList.push({
          username: "BCN_Admin",
          device_session_id: "mock_user_admin_13",
          created_at: new Date().toISOString(),
          reports_count: 0,
          comments_count: 0,
          language: "ru",
          email: "bcnoflipezz@gmail.com",
          role: "admin"
        });
      }

      if (!profilesList.some(p => p.device_session_id === anonProfile.device_session_id)) {
        profilesList.push(anonProfile);
      }

      return profilesList;
    }
    return [];
  },

  // Update a user's role (Admin promoting/demoting)
  async updateUserProfileRole(userId: string, role: "user" | "admin"): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from("profiles")
          .update({ role })
          .eq("id", userId);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn("Supabase updateUserProfileRole failed:", err);
      }
    }

    // Local Mock Fallback
    if (typeof window !== "undefined") {
      const rawUsers = localStorage.getItem("bcn_mock_users") || "[]";
      const users = JSON.parse(rawUsers) as Array<{ id: string; email: string; password?: string; username: string; created_at: string; role?: "user" | "admin" }>;
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].role = role;
        localStorage.setItem("bcn_mock_users", JSON.stringify(users));
      }

      const profile = getOrCreateProfile();
      if (profile.device_session_id === userId) {
        profile.role = role;
        localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
      }
      return true;
    }
    return false;
  }
};

// ----------------------------------------------------
// PROFILE SERVICE — public profile lookup & reactions
// ----------------------------------------------------
export const profileService = {
  async getPublicProfile(sessionId: string): Promise<UserProfileCard | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sessionId)
          .single();
        if (!error && data) {
          return {
            device_session_id: data.id,
            username: data.username,
            created_at: data.created_at || new Date().toISOString(),
            reports_count: data.reports_count || 0,
            comments_count: data.comments_count || 0,
            flags_received: data.flags_received || 0,
            avatar_url: data.avatar_url,
            bio: data.bio,
            social_instagram: data.social_instagram,
            social_telegram: data.social_telegram,
            social_twitter: data.social_twitter,
            reactions_heart: data.reactions_heart || 0,
            reactions_like: data.reactions_like || 0,
            reactions_dislike: data.reactions_dislike || 0,
          };
        }
      } catch (err) {
        console.warn("Supabase getPublicProfile failed:", err);
      }
    }
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(USER_REGISTRY_KEY) || "{}";
        const registry = JSON.parse(raw) as Record<string, UserProfileCard>;
        return registry[sessionId] || null;
      } catch { /* noop */ }
    }
    return null;
  },

  async getProfileReactions(authorSessionId: string): Promise<{ heart: number; like: number; dislike: number; myReaction: ProfileReactionType | null }> {
    const mySessionId = getOrCreateProfile().device_session_id;
    let myReaction: ProfileReactionType | null = null;
    let heart = 0, like = 0, dislike = 0;

    if (isSupabaseConfigured && supabase) {
      try {
        // Fetch counters from profiles table
        const { data: profileData } = await supabase
          .from("profiles")
          .select("reactions_heart, reactions_like, reactions_dislike")
          .eq("id", authorSessionId)
          .single();
        if (profileData) {
          heart = profileData.reactions_heart || 0;
          like = profileData.reactions_like || 0;
          dislike = profileData.reactions_dislike || 0;
        }

        // Fetch my reaction from profile_reactions table
        const { data: reactionData } = await supabase
          .from("profile_reactions")
          .select("reaction_type")
          .eq("target_user_id", authorSessionId)
          .eq("reactor_user_id", mySessionId)
          .single();
        if (reactionData) {
          myReaction = reactionData.reaction_type as ProfileReactionType;
        }
        return { heart, like, dislike, myReaction };
      } catch (err) {
        console.warn("Supabase getProfileReactions failed, falling back to local DB", err);
      }
    }

    if (typeof window === "undefined") return { heart: 0, like: 0, dislike: 0, myReaction: null };
    try {
      const raw = localStorage.getItem("bcn_profile_reactions") || "{}";
      const all = JSON.parse(raw) as Record<string, { heart: string[]; like: string[]; dislike: string[] }>;
      const reactions = all[authorSessionId] || { heart: [], like: [], dislike: [] };
      if (reactions.heart.includes(mySessionId)) myReaction = "heart";
      else if (reactions.like.includes(mySessionId)) myReaction = "like";
      else if (reactions.dislike.includes(mySessionId)) myReaction = "dislike";
      return { heart: reactions.heart.length, like: reactions.like.length, dislike: reactions.dislike.length, myReaction };
    } catch {
      return { heart: 0, like: 0, dislike: 0, myReaction: null };
    }
  },

  async reactToProfile(authorSessionId: string, type: ProfileReactionType): Promise<{ heart: number; like: number; dislike: number; myReaction: ProfileReactionType | null }> {
    const mySessionId = getOrCreateProfile().device_session_id;
    if (authorSessionId === mySessionId || typeof window === "undefined") {
      return this.getProfileReactions(authorSessionId);
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.rpc("toggle_profile_reaction", {
          target_user: authorSessionId,
          reactor: mySessionId,
          reaction: type,
        });
        if (!error) {
          return this.getProfileReactions(authorSessionId);
        } else {
          console.warn("Supabase reactToProfile RPC failed", error);
        }
      } catch (err) {
        console.warn("Supabase reactToProfile exception", err);
      }
    }

    // Local DB fallback
    try {
      const raw = localStorage.getItem("bcn_profile_reactions") || "{}";
      const all = JSON.parse(raw) as Record<string, { heart: string[]; like: string[]; dislike: string[] }>;
      if (!all[authorSessionId]) all[authorSessionId] = { heart: [], like: [], dislike: [] };
      const reactions = all[authorSessionId];
      const hadThisReaction = reactions[type].includes(mySessionId);
      reactions.heart = reactions.heart.filter(id => id !== mySessionId);
      reactions.like = reactions.like.filter(id => id !== mySessionId);
      reactions.dislike = reactions.dislike.filter(id => id !== mySessionId);
      if (!hadThisReaction) reactions[type].push(mySessionId);
      localStorage.setItem("bcn_profile_reactions", JSON.stringify(all));
    } catch { /* noop */ }
    return this.getProfileReactions(authorSessionId);
  },
};

// ----------------------------------------------------
// SPAM PROTECTION — Multi-layer Rate Limiter
// ----------------------------------------------------

const SPAM_KEYS = {
  REPORT_TIMES:         "bcn_report_times",
  COMMENT_TIMES:        "bcn_comment_times",
  STATION_REPORT_TIMES: "bcn_station_report_times",  // {[stationId]: timestamp}
  SOFT_BAN_UNTIL:       "bcn_soft_ban_until",
  FLAG_COUNT:           "bcn_my_flag_count",
};

const LIMITS = {
  REPORTS_MAX:          3,
  REPORTS_WINDOW:       10 * 60 * 1000,
  COMMENTS_MAX:         5,
  COMMENTS_WINDOW:      5 * 60 * 1000,
  REPORT_GAP:           3 * 60 * 1000,   // 3 min per-user between status updates
  STATION_REPORT_GAP:   60 * 1000,       // 1 min global per-station (any user)
  COMMENT_GAP:          30 * 1000,       // 30s per-user between comments
  FLAG_THRESHOLD:       3,
  BAN_DURATION:         24 * 60 * 60 * 1000,
};

function getTimes(key: string): number[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function saveTimes(key: string, times: number[]) {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(times));
}

export const spamProtection = {

  isSoftBanned(): boolean {
    if (typeof window === "undefined") return false;
    const until = localStorage.getItem(SPAM_KEYS.SOFT_BAN_UNTIL);
    if (!until) return false;
    return new Date().getTime() < parseInt(until);
  },

  softBanRemainingHrs(): number {
    if (typeof window === "undefined") return 0;
    const until = localStorage.getItem(SPAM_KEYS.SOFT_BAN_UNTIL);
    if (!until) return 0;
    const diff = parseInt(until) - new Date().getTime();
    return diff > 0 ? Math.ceil(diff / (60 * 60 * 1000)) : 0;
  },

  recordFlagReceived(): void {
    if (typeof window === "undefined") return;
    const current = parseInt(localStorage.getItem(SPAM_KEYS.FLAG_COUNT) || "0") + 1;
    localStorage.setItem(SPAM_KEYS.FLAG_COUNT, current.toString());
    if (current >= LIMITS.FLAG_THRESHOLD) {
      localStorage.setItem(SPAM_KEYS.SOFT_BAN_UNTIL, (new Date().getTime() + LIMITS.BAN_DURATION).toString());
      localStorage.setItem(SPAM_KEYS.FLAG_COUNT, "0");
    }
  },

  // Per-user report cooldown: 3 minutes
  checkReportCooldown(isAdmin = false): { allowed: boolean; remainingSec: number; reason?: string } {
    if (isAdmin) return { allowed: true, remainingSec: 0 };
    if (typeof window === "undefined") return { allowed: true, remainingSec: 0 };
    const now = new Date().getTime();
    const times = getTimes(SPAM_KEYS.REPORT_TIMES).filter(t => now - t < LIMITS.REPORTS_WINDOW);
    if (times.length > 0) {
      const gapLeft = LIMITS.REPORT_GAP - (now - times[times.length - 1]);
      if (gapLeft > 0) return { allowed: false, remainingSec: Math.ceil(gapLeft / 1000) };
    }
    if (times.length >= LIMITS.REPORTS_MAX) {
      const remainingSec = Math.ceil((times[0] + LIMITS.REPORTS_WINDOW - now) / 1000);
      return { allowed: false, remainingSec, reason: `Слишком много репортов — подождите ${Math.ceil(remainingSec / 60)} мин.` };
    }
    return { allowed: true, remainingSec: 0 };
  },

  recordReportSent(): void {
    if (typeof window === "undefined") return;
    const now = new Date().getTime();
    const times = getTimes(SPAM_KEYS.REPORT_TIMES).filter(t => now - t < LIMITS.REPORTS_WINDOW);
    times.push(now);
    saveTimes(SPAM_KEYS.REPORT_TIMES, times);
  },

  // Per-station global cooldown: 1 minute (any user updating same station)
  checkStationCooldown(stationId: string): { allowed: boolean; remainingSec: number } {
    if (!stationId || typeof window === "undefined") return { allowed: true, remainingSec: 0 };
    try {
      const raw = localStorage.getItem(SPAM_KEYS.STATION_REPORT_TIMES) || "{}";
      const times = JSON.parse(raw) as Record<string, number>;
      const lastTime = times[stationId];
      if (!lastTime) return { allowed: true, remainingSec: 0 };
      const gapLeft = LIMITS.STATION_REPORT_GAP - (Date.now() - lastTime);
      if (gapLeft > 0) return { allowed: false, remainingSec: Math.ceil(gapLeft / 1000) };
    } catch { /* noop */ }
    return { allowed: true, remainingSec: 0 };
  },

  recordStationReportSent(stationId: string): void {
    if (!stationId || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(SPAM_KEYS.STATION_REPORT_TIMES) || "{}";
      const times = JSON.parse(raw) as Record<string, number>;
      times[stationId] = Date.now();
      localStorage.setItem(SPAM_KEYS.STATION_REPORT_TIMES, JSON.stringify(times));
    } catch { /* noop */ }
  },

  // Per-user comment cooldown: 30 seconds
  checkCommentCooldown(isAdmin = false): { allowed: boolean; remainingSec: number; reason?: string } {
    if (isAdmin) return { allowed: true, remainingSec: 0 };
    if (typeof window === "undefined") return { allowed: true, remainingSec: 0 };
    const now = new Date().getTime();
    const times = getTimes(SPAM_KEYS.COMMENT_TIMES).filter(t => now - t < LIMITS.COMMENTS_WINDOW);
    if (times.length > 0) {
      const gapLeft = LIMITS.COMMENT_GAP - (now - times[times.length - 1]);
      if (gapLeft > 0) return { allowed: false, remainingSec: Math.ceil(gapLeft / 1000) };
    }
    if (times.length >= LIMITS.COMMENTS_MAX) {
      const remainingSec = Math.ceil((times[0] + LIMITS.COMMENTS_WINDOW - now) / 1000);
      return { allowed: false, remainingSec, reason: `Слишком много комментариев — подождите ${Math.ceil(remainingSec / 60)} мин.` };
    }
    return { allowed: true, remainingSec: 0 };
  },

  recordCommentSent(): void {
    if (typeof window === "undefined") return;
    const now = new Date().getTime();
    const times = getTimes(SPAM_KEYS.COMMENT_TIMES).filter(t => now - t < LIMITS.COMMENTS_WINDOW);
    times.push(now);
    saveTimes(SPAM_KEYS.COMMENT_TIMES, times);
  },

  validateContent(text: string): { valid: boolean; reason?: string } {
    const trimmed = text.trim();
    if (trimmed.length < 3) return { valid: false, reason: "Текст сообщения слишком короткий (минимум 3 символа)." };
    if (trimmed.length > 500) return { valid: false, reason: "Текст сообщения слишком длинный (максимум 500 символов)." };
    const blocklist = ["casino", "казино", "crypto", "крипта", "binance", "invest", "инвестиции",
      "заработать", "работа в интернете", "t.me/", "http://", "https://"];
    const lower = trimmed.toLowerCase();
    for (const phrase of blocklist) {
      if (lower.includes(phrase)) return { valid: false, reason: "Обнаружены ссылки или запрещенные спам-слова." };
    }
    const emojiRegex = /^[\p{Emoji}\s]+$/u;
    if (emojiRegex.test(trimmed) && trimmed.length > 15) {
      return { valid: false, reason: "Сообщение не должно содержать только повторяющиеся эмодзи." };
    }
    return { valid: true };
  },
};

