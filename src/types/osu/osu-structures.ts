export interface Covers {
  cover: string;
  "cover@2x": string;
  card: string;
  "card@2x": string;
  list: string;
  "list@2x": string;
  slimcover: string;
  "slimcover@2x": string;
}

export interface BeatmapsetCompact {
  artist: string;
  artist_unicode: string;
  covers: Covers;
  creator: string;
  favourite_count: string;
  id: number;
  nsfw: boolean;
  play_count: number;
  preview_url: string;
  source: string;
  status: string;
  title: string;
  title_unicode: string;
  user_id: number;
  video: boolean;
}

export interface Beatmapset extends BeatmapsetCompact {
  availability: {
    download_disabled: boolean;
    more_information?: string;
  };
  bpm: number;
  can_be_hyped: boolean;
  creator: string;
  discussion_enabled: boolean;
  discussion_locked: boolean;
  hype: {
    current: number;
    required: number;
  };
  is_scoreable: boolean;
  last_updated: Date;
  legacy_thread_url: string | null;
  nominations: {
    current: number;
    required: number;
  };
  ranked: number;
  ranked_date: Date | null;
  source: string;
  storyboard: boolean;
  submitted_date: Date | null;
  tags: string;
}

export interface UserCompact {
  avatar_url: string;
  country_code: string;
  default_group: string;
  id: number;
  is_active: boolean;
  is_bot: boolean;
  is_deleted: boolean;
  is_online: boolean;
  is_supporter: boolean;
  last_visit: Date | null;
  pm_friends_only: boolean;
  profile_colour: string | null;
  username: string;
}

export interface UserStatistics {
  grade_counts: {
    a: number;
    s: number;
    sh: number;
    ss: number;
    ssh: number;
  };
  hit_accuracy: number;
  is_ranked: boolean;
  level: {
    current: number;
    progress: number;
  };
  maximum_combo: number;
  play_count: number;
  play_time: number;
  pp: number;
  global_rank: number;
  ranked_score: number;
  replays_watched_by_others: number;
  total_hits: number;
  total_score: number;
  user: UserCompact;
}

export interface Spotlight {
  end_date: Date;
  id: number;
  mode_specific: boolean;
  participant_count: number | null;
  name: string;
  start_date: Date;
  type: string;
}

export interface RankingsCursor {
  page: number;
}
