import { supabase, isSupabaseConfigured } from "./supabaseClient";
import { StationReport, StationComment, ReportType, EmojiType, UserProfile, Language, StationOverride } from "../types";

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

// Helper: Local Storage Keys
const KEYS = {
  REPORTS: "bcn_metro_reports",
  COMMENTS: "bcn_metro_comments",
  FAVORITES: "bcn_metro_favorites",
  PROFILE: "bcn_metro_profile",
};

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
    };
  }

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
  };
  localStorage.setItem(KEYS.PROFILE, JSON.stringify(newProfile));
  return newProfile;
}

export function updateProfileUsername(newUsername: string): UserProfile {
  const profile = getOrCreateProfile();
  profile.username = newUsername.trim() || profile.username;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }

  // Sync to Supabase if logged in
  if (profile.is_logged_in && isSupabaseConfigured && supabase) {
    supabase
      .from("profiles")
      .update({ username: profile.username })
      .eq("id", profile.device_session_id)
      .then(({ error }) => {
        if (error) console.error("Supabase sync username error:", error);
      });
  }

  return profile;
}

export function updateProfileLanguage(lang: Language): UserProfile {
  const profile = getOrCreateProfile();
  profile.language = lang;
  if (typeof window !== "undefined") {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  }

  // Sync to Supabase if logged in
  if (profile.is_logged_in && isSupabaseConfigured && supabase) {
    supabase
      .from("profiles")
      .update({ language: lang })
      .eq("id", profile.device_session_id)
      .then(({ error }) => {
        if (error) console.error("Supabase sync language error:", error);
      });
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

  // Sync to Supabase if logged in
  if (profile.is_logged_in && isSupabaseConfigured && supabase) {
    supabase
      .from("profiles")
      .update({
        reports_count: profile.reports_count,
        comments_count: profile.comments_count
      })
      .eq("id", profile.device_session_id)
      .then(({ error }) => {
        if (error) console.error("Supabase sync stats error:", error);
      });
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
          const newRole = cleanEmail === "bcnoflipez@gmail.com" ? "admin" : "user";
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
          role: cleanEmail === "bcnoflipez@gmail.com" ? "admin" : "user"
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
      role: cleanEmail === "bcnoflipez@gmail.com" ? "admin" : "user"
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
            const newRole = cleanEmail === "bcnoflipez@gmail.com" ? "admin" : "user";
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
        if (cleanEmail === "bcnoflipez@gmail.com") {
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
    const adminEmail = "bcnoflipez@gmail.com";
    if (!users.some((u) => u.email === adminEmail)) {
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
      return all.filter(c => c.station_id === stationId && c.flags_count < 3);
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
    localStorage.setItem(KEYS.COMMENTS, JSON.stringify(all));
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
    // Generate expires_at (2 hours from now)
    const now = new Date();
    const expires = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const report: StationReport = {
      id: "rep_" + Math.random().toString(36).substring(2, 15),
      station_id: stationId,
      type,
      description: description.trim() || `Warning: ${type} reported`,
      created_at: now.toISOString(),
      expires_at: expires.toISOString(),
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

  // Fetch comments for a station
  async getComments(stationId: string): Promise<StationComment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        // Fetch comments and reactions if set up
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("station_id", stationId)
          .lt("flags_count", 3)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Supabase getComments failed, falling back to local DB:", err);
      }
    }
    return localDb.getComments(stationId).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  // Add a comment
  async addComment(stationId: string, text: string): Promise<StationComment | null> {
    const profile = getOrCreateProfile();
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
      if (!profilesList.some(p => p.email === "bcnoflipez@gmail.com")) {
        profilesList.push({
          username: "BCN_Admin",
          device_session_id: "mock_user_admin_13",
          created_at: new Date().toISOString(),
          reports_count: 0,
          comments_count: 0,
          language: "ru",
          email: "bcnoflipez@gmail.com",
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
// SPAM PROTECTION / RATE LIMITING UTILITY
// ----------------------------------------------------
const COOLDOWNS = {
  COMMENT: 30 * 1000, // 30 seconds
  REPORT: 60 * 1000,  // 60 seconds
};

export const spamProtection = {
  checkCommentCooldown(): { allowed: boolean; remainingSec: number } {
    if (typeof window === "undefined") return { allowed: true, remainingSec: 0 };
    const lastTime = localStorage.getItem("bcn_last_comment_time");
    if (!lastTime) return { allowed: true, remainingSec: 0 };

    const diff = new Date().getTime() - parseInt(lastTime);
    if (diff < COOLDOWNS.COMMENT) {
      const remainingSec = Math.ceil((COOLDOWNS.COMMENT - diff) / 1000);
      return { allowed: false, remainingSec };
    }
    return { allowed: true, remainingSec: 0 };
  },

  recordCommentSent() {
    if (typeof window !== "undefined") {
      localStorage.setItem("bcn_last_comment_time", new Date().getTime().toString());
    }
  },

  checkReportCooldown(): { allowed: boolean; remainingSec: number } {
    if (typeof window === "undefined") return { allowed: true, remainingSec: 0 };
    const lastTime = localStorage.getItem("bcn_last_report_time");
    if (!lastTime) return { allowed: true, remainingSec: 0 };

    const diff = new Date().getTime() - parseInt(lastTime);
    if (diff < COOLDOWNS.REPORT) {
      const remainingSec = Math.ceil((COOLDOWNS.REPORT - diff) / 1000);
      return { allowed: false, remainingSec };
    }
    return { allowed: true, remainingSec: 0 };
  },

  recordReportSent() {
    if (typeof window !== "undefined") {
      localStorage.setItem("bcn_last_report_time", new Date().getTime().toString());
    }
  },

  validateContent(text: string): { valid: boolean; reason?: string } {
    const trimmed = text.trim();
    if (trimmed.length < 3) {
      return { valid: false, reason: "Текст сообщения слишком короткий (минимум 3 символа)." };
    }
    if (trimmed.length > 500) {
      return { valid: false, reason: "Текст сообщения слишком длинный (максимум 500 символов)." };
    }
    // Simple blocklist for common spam keywords (Russian/Spanish/English)
    const blocklist = [
      "casino", "казино", "crypto", "крипта", "binance", "invest", "инвестиции", 
      "заработать", "работа в интернете", "t.me/", "http://", "https://"
    ];
    const lower = trimmed.toLowerCase();
    for (const phrase of blocklist) {
      if (lower.includes(phrase)) {
        return { valid: false, reason: "Обнаружены ссылки или запрещенные спам-слова." };
      }
    }

    // Check if it's just emojis repeating
    const emojiRegex = /^[\p{Emoji}\s]+$/u;
    if (emojiRegex.test(trimmed) && trimmed.length > 15) {
      return { valid: false, reason: "Сообщение не должно содержать только повторяющиеся эмодзи." };
    }

    return { valid: true };
  }
};
