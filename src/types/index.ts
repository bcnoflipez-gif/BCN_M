export type ReportType = "gossos" | "mosquits" | "pregunta" | "gorilles" | "lliure" | "delay" | "crowd" | "security" | "other";

export interface StationReport {
  id: string;
  station_id: string;
  type: ReportType;
  description: string;
  created_at: string;
  expires_at: string;
}

export type EmojiType = "like" | "dislike" | "cop" | "warning";

export interface CommentReaction {
  comment_id: string;
  user_session_id: string;
  emoji_type: EmojiType;
}

export interface StationComment {
  id: string;
  station_id: string;
  text: string;
  author_name: string;
  author_session_id: string;
  flags_count: number;
  created_at: string;
  reactions: Record<EmojiType, string[]>; // Array of user_session_ids who reacted
}

export interface UserFavorite {
  station_id: string;
  user_session_id: string;
}

export type Language = "ru" | "en" | "es" | "fr";

export interface UserProfile {
  username: string;
  device_session_id: string;
  created_at: string;
  reports_count: number;
  comments_count: number;
  language: Language;
  email?: string;
  is_logged_in?: boolean;
}
