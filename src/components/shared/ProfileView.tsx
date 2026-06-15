"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  User, 
  Edit2, 
  Check, 
  ShieldAlert, 
  MessageSquare, 
  Info, 
  Smartphone, 
  Globe, 
  Mail, 
  Lock, 
  LogOut,
  Search,
  Shield,
  Palette,
  Megaphone,
  Camera,
  AtSign,
  Send
} from "lucide-react";
import { 
  getOrCreateProfile, 
  updateProfileUsername, 
  updateProfileLanguage,
  updateProfileAvatar,
  updateProfileBio,
  updateProfileSocials,
  signUpUser,
  signInUser,
  signOutUser,
  dbService
} from "../../lib/db";
import { TRANSLATIONS } from "../../lib/translations";
import { UserProfile, Language } from "../../types";

const ADMIN_TRANSLATIONS = {
  ru: {
    panelTitle: "Панель администратора",
    panelSub: "Управление ролями пользователей",
    searchPlaceholder: "Имя или email...",
    roleAdmin: "Админ",
    roleUser: "Пользователь",
    makeAdmin: "Назначить админом",
    revokeAdmin: "Снять админа",
    noUsers: "Пользователи не найдены",
  },
  en: {
    panelTitle: "Admin Panel",
    panelSub: "Manage user roles",
    searchPlaceholder: "Username or email...",
    roleAdmin: "Admin",
    roleUser: "User",
    makeAdmin: "Make Admin",
    revokeAdmin: "Revoke Admin",
    noUsers: "No users found",
  },
  es: {
    panelTitle: "Panel de Admin",
    panelSub: "Gestionar roles de usuario",
    searchPlaceholder: "Usuario o email...",
    roleAdmin: "Admin",
    roleUser: "Usuario",
    makeAdmin: "Hacer Admin",
    revokeAdmin: "Quitar Admin",
    noUsers: "No se encontraron usuarios",
  },
  fr: {
    panelTitle: "Panneau d'Admin",
    panelSub: "Gérer les rôles des utilisateurs",
    searchPlaceholder: "Nom d'utilisateur ou e-mail...",
    roleAdmin: "Admin",
    roleUser: "Utilisateur",
    makeAdmin: "Rendre Admin",
    revokeAdmin: "Retirer Admin",
    noUsers: "Aucun utilisateur trouvé",
  }
};


interface ProfileViewProps {
  onLanguageChange: (lang: Language) => void;
  onProfileChange?: (profile: UserProfile) => void;
}

const AUTH_TRANSLATIONS = {
  ru: {
    signIn: "Войти в аккаунт",
    signUp: "Создать аккаунт",
    email: "Электронная почта",
    password: "Пароль",
    username: "Имя пользователя",
    noAccount: "Нет аккаунта? Зарегистрироваться",
    hasAccount: "Уже есть аккаунт? Войти",
    logout: "Выйти из системы",
    loggingIn: "Вход в систему...",
    registering: "Регистрация...",
    fillAll: "Пожалуйста, заполните все поля.",
    passLength: "Пароль должен быть не менее 6 символов."
  },
  en: {
    signIn: "Sign In",
    signUp: "Create Account",
    email: "Email Address",
    password: "Password",
    username: "Username",
    noAccount: "Don't have an account? Sign Up",
    hasAccount: "Already have an account? Sign In",
    logout: "Log Out",
    loggingIn: "Signing in...",
    registering: "Creating account...",
    fillAll: "Please fill in all fields.",
    passLength: "Password must be at least 6 characters."
  },
  es: {
    signIn: "Iniciar sesión",
    signUp: "Crear cuenta",
    email: "Correo electrónico",
    password: "Contraseña",
    username: "Nombre de usuario",
    noAccount: "¿No tienes una cuenta? Regístrate",
    hasAccount: "¿Ya tienes una cuenta? Inicia sesión",
    logout: "Cerrar sesión",
    loggingIn: "Iniciando sesión...",
    registering: "Creando cuenta...",
    fillAll: "Por favor complete todos los campos.",
    passLength: "La contraseña debe tener al menos 6 caracteres."
  },
  fr: {
    signIn: "Se connecter",
    signUp: "Créer un compte",
    email: "Adresse e-mail",
    password: "Mot de passe",
    username: "Nom d'utilisateur",
    noAccount: "Pas de compte ? S'inscrire",
    hasAccount: "Déjà un compte ? Se connecter",
    logout: "Se déconnecter",
    loggingIn: "Connexion en cours...",
    registering: "Création du compte...",
    fillAll: "Veuillez remplir tous les champs.",
    passLength: "Le mot de passe doit contenir au moins 6 caractères."
  }
};

export default function ProfileView({ onLanguageChange, onProfileChange }: ProfileViewProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Public profile state
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bioInput, setBioInput] = useState("");
  const [instagramInput, setInstagramInput] = useState("");
  const [telegramInput, setTelegramInput] = useState("");
  const [twitterInput, setTwitterInput] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Theme state
  const [currentTheme, setCurrentTheme] = useState("default");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("bcn-theme");
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentTheme(saved);
      }
    } catch { /* noop */ }
  }, []);

  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("bcn-theme", theme);
    } catch { /* noop */ }
  };

  // Authentication states
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);

  // Admin Panel states
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // Ticker editor state (admin only)
  const [tickerText, setTickerText] = useState("");
  const [tickerSaved, setTickerSaved] = useState(false);

  const handleSaveTicker = () => {
    const val = tickerText.trim();
    if (!val) return;
    try {
      localStorage.setItem("bcn_ticker", val);
      // Trigger StorageEvent for same-tab listeners
      window.dispatchEvent(new StorageEvent("storage", { key: "bcn_ticker", newValue: val }));
      setTickerSaved(true);
      setTimeout(() => setTickerSaved(false), 2000);
    } catch { /* noop */ }
  };

  const refreshProfile = () => {
    const data = getOrCreateProfile();
    setProfile(data);
    setUsernameInput(data.username);
    setAvatarPreview(data.avatar_url || null);
    setBioInput(data.bio || "");
    setInstagramInput(data.social_instagram || "");
    setTelegramInput(data.social_telegram || "");
    setTwitterInput(data.social_twitter || "");
    if (onProfileChange) {
      onProfileChange(data);
    }
  };

  // Resize image to max 200px and convert to base64
  const resizeImage = (file: File, maxSize = 200): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas unavailable")); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.onerror = reject;
      img.src = url;
    });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return; // 2MB limit
    try {
      const base64 = await resizeImage(file);
      setAvatarPreview(base64);
      const updated = updateProfileAvatar(base64);
      setProfile(updated);
    } catch (err) {
      console.error("Avatar upload error:", err);
    }
  };

  const handleSaveBio = () => {
    const updated = updateProfileBio(bioInput);
    setProfile(updated);
  };

  const handleSaveSocials = () => {
    const updated = updateProfileSocials({
      instagram: instagramInput,
      telegram: telegramInput,
      twitter: twitterInput,
    });
    setProfile(updated);
  };

  const fetchProfiles = async () => {
    try {
      const users = await dbService.getAllProfiles();
      setAllProfiles(users);
    } catch (err) {
      console.error("Failed to load profiles:", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (profile?.role === "admin") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProfiles();
      // Load current ticker text
      try {
        const saved = localStorage.getItem("bcn_ticker");
        if (saved) setTickerText(saved);
      } catch { /* noop */ }
    }
  }, [profile?.role]);

  const handleToggleRole = async (targetUser: UserProfile) => {
    if (targetUser.device_session_id === profile?.device_session_id) {
      const isRu = (profile?.language || "ru") === "ru";
      alert(isRu ? "Вы не можете изменить свою собственную роль." : "You cannot change your own role.");
      return;
    }
    const newRole = targetUser.role === "admin" ? "user" : "admin";
    setAdminLoading(true);
    try {
      const success = await dbService.updateUserProfileRole(targetUser.device_session_id, newRole);
      if (success) {
        await fetchProfiles();
      }
    } catch (err) {
      console.error("Failed to update role:", err);
    } finally {
      setAdminLoading(false);
    }
  };

  if (!profile) return null;

  const currentLang = profile.language || "ru";
  const t = TRANSLATIONS[currentLang];
  const authT = AUTH_TRANSLATIONS[currentLang] || AUTH_TRANSLATIONS.en;

  const handleSaveUsername = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setSaveSuccess(false);

    const trimmed = usernameInput.trim();
    if (trimmed.length < 3) {
      setEditError(currentLang === "ru" ? "Имя должно быть не менее 3 символов." : "Name must be at least 3 characters.");
      return;
    }
    if (trimmed.length > 20) {
      setEditError(currentLang === "ru" ? "Имя должно быть не более 20 символов." : "Name must be under 20 characters.");
      return;
    }
    if (!/^[a-zA-Z0-9_а-яА-Я\s-]+$/.test(trimmed)) {
      setEditError(currentLang === "ru" ? "Имя содержит недопустимые символы." : "Name contains invalid characters.");
      return;
    }

    const updated = updateProfileUsername(trimmed);
    setProfile(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleLangSelect = (lang: Language) => {
    const updated = updateProfileLanguage(lang);
    setProfile(updated);
    onLanguageChange(lang);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setEmailError(false);
    setPasswordError(false);
    setUsernameError(false);

    const cleanEmail = email.trim();
    const cleanPassword = password;
    const cleanUsername = usernameInput.trim();

    if (authMode === "signup" && !cleanUsername) {
      setUsernameError(true);
      setAuthError(authT.fillAll);
      return;
    }

    if (!cleanEmail) {
      setEmailError(true);
      setAuthError(currentLang === "ru" ? "Пожалуйста, введите адрес электронной почты." : "Please enter your email address.");
      return;
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setEmailError(true);
      setAuthError(currentLang === "ru" ? "Неверный формат электронной почты." : "Invalid email format.");
      return;
    }

    if (!cleanPassword) {
      setPasswordError(true);
      setAuthError(currentLang === "ru" ? "Пожалуйста, введите пароль." : "Please enter a password.");
      return;
    }

    if (cleanPassword.length < 6) {
      setPasswordError(true);
      setAuthError(authT.passLength);
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === "signup") {
        const res = await signUpUser(cleanEmail, cleanPassword, cleanUsername);
        if (res.success) {
          setEmail("");
          setPassword("");
          setUsernameInput("");
          refreshProfile();
        } else {
          setAuthError(res.error || "Signup failed");
          if (res.error?.toLowerCase().includes("email")) {
            setEmailError(true);
          }
        }
      } else {
        const res = await signInUser(cleanEmail, cleanPassword);
        if (res.success) {
          setEmail("");
          setPassword("");
          refreshProfile();
        } else {
          setAuthError(res.error || "Login failed");
          setEmailError(true);
          setPasswordError(true);
        }
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setAuthError(errMsg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOutUser();
    refreshProfile();
  };

  return (
    <div className="flex-1 flex flex-col p-4 pb-20 no-scrollbar overflow-y-auto space-y-4">
      {/* Title */}
      <div className="flex-shrink-0">
        <h2 className="text-xl font-extrabold text-white tracking-tight">{t.profile.title}</h2>
        <p className="text-xs text-[#71717a] mt-0.5">{t.profile.sub}</p>
      </div>

      {profile.is_logged_in ? (
        /* LOGGED IN USER INTERFACE */
        <>
          {/* User Card */}
          <div className="glass-card rounded-2xl p-4 border border-[#27272a]/60 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="h-14 w-14 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 relative">
                <User size={28} />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-[#09090b]"></span>
              </div>
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <form onSubmit={handleSaveUsername} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="bg-[#18181b] border border-[#27272a] rounded-lg px-2.5 py-1 text-xs text-[#fafafa] focus:outline-none focus:border-blue-500 w-full font-semibold h-9"
                      maxLength={20}
                      autoFocus
                    />
                    <button 
                      type="submit" 
                      className="h-9 w-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white active:scale-95 transition-all"
                    >
                      <Check size={14} />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-white truncate max-w-[180px]">{profile.username}</span>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-1 rounded text-zinc-500 hover:text-zinc-400 hover:bg-zinc-900 active:scale-95 transition"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                )}
                
                {editError && <p className="text-[10px] text-red-400 font-semibold mt-1">{editError}</p>}
                {saveSuccess && <p className="text-[10px] text-emerald-400 font-semibold mt-1">{currentLang === "ru" ? "Имя сохранено!" : "Name saved!"}</p>}
                
                {profile.email && <p className="text-[10px] text-[#a1a1aa] font-medium truncate mt-0.5">{profile.email}</p>}
                <p className="text-[10px] text-[#71717a] mt-0.5">{t.profile.created} {new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Device ID / Session ID */}
            <div className="border-t border-[#27272a]/40 pt-3.5 flex items-start gap-2 text-[10px] text-[#71717a] leading-relaxed">
              <Smartphone size={14} className="flex-shrink-0 text-zinc-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <span className="font-bold text-zinc-500 block">UUID / User ID:</span>
                <span className="font-mono text-zinc-600 select-all block break-all">{profile.device_session_id}</span>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full h-10 bg-zinc-900 border border-[#27272a] hover:bg-zinc-800 text-red-400 hover:text-red-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <LogOut size={14} />
              <span>{authT.logout}</span>
            </button>
          </div>

          {/* Public Profile Card */}
          <div className="glass-card rounded-2xl p-4 border border-[#27272a]/60 space-y-4">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <User size={14} className="text-blue-500" />
              <span>{currentLang === "ru" ? "Публичный профиль" : "Public Profile"}</span>
            </h3>

            {/* Avatar upload */}
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 text-xl font-extrabold text-zinc-400 cursor-pointer active:scale-95 transition"
                style={{ background: avatarPreview ? "transparent" : "linear-gradient(135deg,#27272a,#3f3f46)", border: "2px solid rgba(255,255,255,0.08)" }}
                onClick={() => avatarInputRef.current?.click()}
                title={currentLang === "ru" ? "Нажмите для смены фото" : "Click to change photo"}
              >
                {avatarPreview
                  ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                  : <span>{profile?.username?.slice(0, 2).toUpperCase() || "?"}</span>
                }
              </div>
              <div className="flex-1 space-y-1">
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  className="h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-300 flex items-center gap-1.5 active:scale-95 transition w-fit"
                >
                  <Camera size={13} />
                  {currentLang === "ru" ? "Загрузить фото" : "Upload photo"}
                </button>
                <p className="text-[9px] text-zinc-600">{currentLang === "ru" ? "JPG, PNG, WebP. Макс. 2МБ." : "JPG, PNG, WebP. Max 2MB."}</p>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>

            {/* BIO */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest pl-1">BIO</label>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value.slice(0, 160))}
                onBlur={handleSaveBio}
                rows={2}
                maxLength={160}
                placeholder={currentLang === "ru" ? "Расскажите о себе..." : "Tell something about yourself..."}
                className="w-full bg-[#09090b]/60 border border-[#27272a] focus:border-blue-500/80 rounded-xl p-3 text-xs font-medium text-white placeholder-zinc-600 focus:outline-none transition-all resize-none"
              />
              <p className="text-[9px] text-zinc-600 text-right pr-1">{bioInput.length}/160</p>
            </div>

            {/* Social links */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest pl-1">
                {currentLang === "ru" ? "Соцсети" : "Social Media"}
              </label>
              {/* Instagram */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-black" style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", color: "#f472b6" }}>
                  IG
                </div>
                <input
                  type="text"
                  value={instagramInput}
                  onChange={(e) => setInstagramInput(e.target.value.replace(/^@/, "").slice(0, 30))}
                  onBlur={handleSaveSocials}
                  placeholder={currentLang === "ru" ? "username (без @)" : "username (no @)"}
                  className="flex-1 h-9 bg-[#09090b]/60 border border-[#27272a] focus:border-blue-500/80 rounded-xl px-3 text-xs font-medium text-white placeholder-zinc-600 focus:outline-none transition-all"
                />
              </div>
              {/* Telegram */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#60a5fa" }}>
                  <Send size={13} />
                </div>
                <input
                  type="text"
                  value={telegramInput}
                  onChange={(e) => setTelegramInput(e.target.value.replace(/^@/, "").slice(0, 30))}
                  onBlur={handleSaveSocials}
                  placeholder={currentLang === "ru" ? "username (без @)" : "username (no @)"}
                  className="flex-1 h-9 bg-[#09090b]/60 border border-[#27272a] focus:border-blue-500/80 rounded-xl px-3 text-xs font-medium text-white placeholder-zinc-600 focus:outline-none transition-all"
                />
              </div>
              {/* Twitter / X */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", color: "#38bdf8" }}>
                  <AtSign size={13} />
                </div>
                <input
                  type="text"
                  value={twitterInput}
                  onChange={(e) => setTwitterInput(e.target.value.replace(/^@/, "").slice(0, 30))}
                  onBlur={handleSaveSocials}
                  placeholder="handle"
                  className="flex-1 h-9 bg-[#09090b]/60 border border-[#27272a] focus:border-blue-500/80 rounded-xl px-3 text-xs font-medium text-white placeholder-zinc-600 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Reactions Stats */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest pl-1">
                {currentLang === "ru" ? "Реакции от других" : "Reactions from others"}
              </label>
              <div className="flex gap-2">
                {[
                  { emoji: "❤️", value: profile.reactions_heart || 0 },
                  { emoji: "👍", value: profile.reactions_like || 0 },
                  { emoji: "👎", value: profile.reactions_dislike || 0 }
                ].map((stat, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-center p-2 rounded-xl bg-[#18181b]/50 border border-[#27272a]">
                    <span className="text-sm mb-0.5">{stat.emoji}</span>
                    <span className="text-sm font-extrabold text-white">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Admin Control Panel */}
          {profile.role === "admin" && (
            <div className="glass-card rounded-2xl p-4 border border-[#27272a]/60 space-y-3.5">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Shield size={14} className="text-amber-500" />
                <span>{ADMIN_TRANSLATIONS[currentLang]?.panelTitle || ADMIN_TRANSLATIONS.en.panelTitle}</span>
              </h3>
              <p className="text-[10px] text-[#71717a] leading-none">
                {ADMIN_TRANSLATIONS[currentLang]?.panelSub || ADMIN_TRANSLATIONS.en.panelSub}
              </p>
              
              {/* Search user */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={ADMIN_TRANSLATIONS[currentLang]?.searchPlaceholder || ADMIN_TRANSLATIONS.en.searchPlaceholder}
                  className="w-full h-10 bg-[#09090b]/60 border border-[#27272a] focus:border-amber-500/80 rounded-xl pl-9 pr-4 text-xs font-semibold text-white placeholder-zinc-600 focus:outline-none transition-all"
                />
              </div>

              {/* User List */}
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                {allProfiles.filter(p => {
                  const query = searchQuery.toLowerCase();
                  return (
                    p.username.toLowerCase().includes(query) ||
                    (p.email && p.email.toLowerCase().includes(query)) ||
                    p.device_session_id.toLowerCase().includes(query)
                  );
                }).length === 0 ? (
                  <p className="text-[10px] text-zinc-500 text-center py-4">
                    {ADMIN_TRANSLATIONS[currentLang]?.noUsers || ADMIN_TRANSLATIONS.en.noUsers}
                  </p>
                ) : (
                  allProfiles.filter(p => {
                    const query = searchQuery.toLowerCase();
                    return (
                      p.username.toLowerCase().includes(query) ||
                      (p.email && p.email.toLowerCase().includes(query)) ||
                      p.device_session_id.toLowerCase().includes(query)
                    );
                  }).map((p, index) => {
                    const adminTLocal = ADMIN_TRANSLATIONS[currentLang] || ADMIN_TRANSLATIONS.en;
                    return (
                      <div key={p.device_session_id || `profile-${index}`} className="flex items-center justify-between p-3 rounded-xl bg-[#18181b]/50 border border-[#27272a] gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white truncate">{p.username}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                              p.role === "admin" 
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" 
                                : "bg-zinc-800 text-zinc-400 border border-zinc-700/50"
                            }`}>
                              {p.role === "admin" ? adminTLocal.roleAdmin : adminTLocal.roleUser}
                            </span>
                          </div>
                          {p.email && <span className="text-[9px] text-[#a1a1aa] block truncate mt-0.5">{p.email}</span>}
                        </div>
                        {p.device_session_id !== profile.device_session_id && (
                          <button
                            onClick={() => handleToggleRole(p)}
                            disabled={adminLoading}
                            className={`h-9 px-3 text-[10px] font-bold rounded-lg border transition-all active:scale-95 flex items-center justify-center gap-1 ${
                              p.role === "admin"
                                ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                : "bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20"
                            }`}
                          >
                            {p.role === "admin" ? adminTLocal.revokeAdmin : adminTLocal.makeAdmin}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Ticker / Ad Banner Editor — Admin Only */}
          {profile.role === "admin" && (
            <div className="glass-card rounded-2xl p-4 border border-amber-500/20 space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Megaphone size={14} className="text-amber-500" />
                <span>{currentLang === "ru" ? "Рекламная строка" : "Ad Ticker"}</span>
              </h3>
              <p className="text-[10px] text-zinc-500">
                {currentLang === "ru"
                  ? "Текст бегущей строки в верхней части экрана. Сохраняется локально."
                  : "Marquee text shown at the top of the screen."}
              </p>
              <textarea
                value={tickerText}
                onChange={(e) => setTickerText(e.target.value)}
                rows={3}
                placeholder={currentLang === "ru" ? "Введите текст рекламы..." : "Enter ad text..."}
                className="w-full bg-[#09090b]/60 border border-[#27272a] focus:border-amber-500/60 rounded-xl p-3 text-xs font-medium text-white placeholder-zinc-600 focus:outline-none transition-all resize-none"
                maxLength={400}
              />
              <button
                onClick={handleSaveTicker}
                className="w-full h-10 bg-amber-600/90 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {tickerSaved ? (
                  <><Check size={14} /><span>{currentLang === "ru" ? "Сохранено!" : "Saved!"}</span></>
                ) : (
                  <span>{currentLang === "ru" ? "Обновить строку" : "Update Ticker"}</span>
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        /* LOGGED OUT - LOGIN & SIGNUP UI */
        <div className="glass-card rounded-3xl p-5 border border-[#27272a]/60 space-y-4 shadow-2xl bg-[#09090b]/40 backdrop-blur-xl">
          {/* Auth Toggles */}
          <div className="flex p-1 bg-[#18181b]/80 border border-[#27272a] rounded-xl">
            <button
              onClick={() => {
                setAuthMode("login");
                setAuthError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all ${
                authMode === "login"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-400"
              }`}
            >
              {authT.signIn}
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setAuthError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold text-center transition-all ${
                authMode === "signup"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-400"
              }`}
            >
              {authT.signUp}
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3.5" noValidate>
            {/* Username field (Signup Only) */}
            {authMode === "signup" && (
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest pl-1">{authT.username}</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      setUsernameError(false);
                      setAuthError(null);
                    }}
                    placeholder="Enter username"
                    className={`w-full h-11 bg-[#09090b]/60 border rounded-xl pl-10 pr-4 text-xs font-semibold text-white placeholder-zinc-600 focus:outline-none transition-all ${
                      usernameError 
                        ? "border-red-500/50 focus:border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.1)]" 
                        : "border-[#27272a] focus:border-blue-500/80"
                    }`}
                    maxLength={20}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest pl-1">{authT.email}</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError(false);
                    setAuthError(null);
                  }}
                  placeholder="name@example.com"
                  className={`w-full h-11 bg-[#09090b]/60 border rounded-xl pl-10 pr-4 text-xs font-semibold text-white placeholder-zinc-600 focus:outline-none transition-all ${
                    emailError 
                      ? "border-red-500/50 focus:border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.1)]" 
                      : "border-[#27272a] focus:border-blue-500/80"
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest pl-1">{authT.password}</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(false);
                    setAuthError(null);
                  }}
                  placeholder="Min 6 characters"
                  className={`w-full h-11 bg-[#09090b]/60 border rounded-xl pl-10 pr-4 text-xs font-semibold text-white placeholder-zinc-600 focus:outline-none transition-all ${
                    passwordError 
                      ? "border-red-500/50 focus:border-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.1)]" 
                      : "border-[#27272a] focus:border-blue-500/80"
                  }`}
                />
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/20 border border-red-500/20 text-red-400 text-[10px] font-bold rounded-xl flex gap-2">
                <ShieldAlert size={14} className="flex-shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-xs active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(59,130,246,0.25)] border border-blue-500/20"
            >
              {authLoading ? (
                <div className="h-4 w-4 rounded-full border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              ) : null}
              <span>{authLoading ? (authMode === "signup" ? authT.registering : authT.loggingIn) : (authMode === "signup" ? authT.signUp : authT.signIn)}</span>
            </button>
          </form>

          {/* Toggle Helper Link */}
          <div className="text-center">
            <button
              onClick={() => {
                setAuthMode(authMode === "login" ? "signup" : "login");
                setAuthError(null);
              }}
              className="text-[10px] font-bold text-zinc-500 hover:text-blue-400 transition-colors"
            >
              {authMode === "login" ? authT.noAccount : authT.hasAccount}
            </button>
          </div>
        </div>
      )}



      {/* Language Selector */}
      <div className="glass-card rounded-2xl p-4 border border-[#27272a]/60 space-y-3">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
          <Globe size={14} className="text-blue-500" />
          <span>{t.profile.langTitle}</span>
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {([
            { code: "ru", label: "Русский" },
            { code: "en", label: "English" },
            { code: "es", label: "Español" },
            { code: "fr", label: "Français" }
          ] as const).map(lang => (
            <button
              key={lang.code}
              type="button"
              onClick={() => handleLangSelect(lang.code)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center transition-all active:scale-95 ${
                currentLang === lang.code
                  ? "border-blue-500 text-blue-400 font-extrabold bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.1)]"
                  : "border-[#27272a] text-zinc-400 bg-[#18181b]/45 hover:border-zinc-800"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Selector */}
      <div className="glass-card rounded-2xl p-4 border border-[var(--border)]/60 space-y-3 animate-fade-up">
        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
          <Palette size={14} className="text-[var(--primary)]" />
          <span>{currentLang === "ru" ? "Тема оформления" : currentLang === "es" ? "Tema visual" : currentLang === "fr" ? "Thème visuel" : "Color Theme"}</span>
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {([
            { id: "default", label: "Zinc", bg: "#09090b", accent: "#3b82f6", ring: "#27272a" },
            { id: "ocean", label: "Ocean", bg: "#0a1628", accent: "#38bdf8", ring: "#1e3a5f" },
            { id: "emerald", label: "Forest", bg: "#0a1a14", accent: "#34d399", ring: "#1a3a2a" },
            { id: "amoled", label: "AMOLED", bg: "#000000", accent: "#a78bfa", ring: "#1a1a1a" },
          ]).map(theme => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-[10px] font-bold transition-all active:scale-95 ${
                currentTheme === theme.id
                  ? "border-[var(--primary)] shadow-[0_0_12px_var(--primary)/20]"
                  : "border-[var(--border)] opacity-60 hover:opacity-100"
              }`}
            >
              <div
                className="w-8 h-8 rounded-lg border-2 flex items-center justify-center"
                style={{ backgroundColor: theme.bg, borderColor: theme.ring }}
              >
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.accent }} />
              </div>
              <span className={currentTheme === theme.id ? "text-[var(--primary)]" : "text-[var(--muted)]"}>{theme.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="space-y-1.5">
        <h3 className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest pl-1">{t.profile.stats}</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-3 border border-[var(--border)]/60 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <p className="text-[10px] text-[var(--muted)] leading-none">{t.profile.statsReports}</p>
              <p className="text-base font-extrabold text-white mt-1">{profile.reports_count}</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-3 border border-[var(--border)]/60 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[var(--primary)]/10 border border-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
              <MessageSquare size={18} />
            </div>
            <div>
              <p className="text-[10px] text-[var(--muted)] leading-none">{t.profile.statsComments}</p>
              <p className="text-base font-extrabold text-white mt-1">{profile.comments_count}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram info card — Admin Only */}
      {profile?.role === "admin" && (
        <div className="glass-card rounded-2xl p-4 border border-[var(--border)]/60 space-y-2.5 animate-fade-up">
          <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Info size={14} className="text-[var(--primary)]" />
            <span>{t.profile.tgTitle}</span>
          </h3>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            {t.profile.tgText}
          </p>
          <div className="bg-[var(--card)]/50 border border-[var(--border)] rounded-xl p-3 text-[11px] leading-relaxed space-y-1.5 text-[var(--muted-foreground)] font-medium">
            <span className="font-bold text-zinc-300 block mb-0.5">{t.profile.tgHow}</span>
            <code className="block bg-black p-1.5 rounded font-mono text-[9px] text-zinc-300 select-all border border-[var(--border)] mt-1 break-all">
              https://your-domain.com/api/telegram/webhook
            </code>
          </div>
        </div>
      )}


    </div>
  );
}
