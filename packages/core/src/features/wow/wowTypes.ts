export interface WoWMythicPlusResponse {
    name: string;
    race: string;
    class: string;
    active_spec_name: string;
    active_spec_role: string;
    gender: string;
    faction: string;
    achievement_points: number;
    thumbnail_url: string;
    region: string;
    realm: string;
    last_crawled_at: string;
    profile_url: string;
    profile_banner: string;
    mythic_plus_recent_runs: WoWMythicPlusRun[];
  }
  
  export interface WoWMythicPlusRun {
    dungeon: string;
    short_name: string;
    mythic_level: number;
    completed_at: string;
    clear_time_ms: number;
    par_time_ms: number;
    num_keystone_upgrades: number;
    map_challenge_mode_id: number;
    zone_id: number;
    zone_expansion_id: number;
    icon_url: string;
    background_image_url: string;
    score: number;
    affixes: WoWAffix[];
    url: string;
  }
  
  export interface WoWAffix {
    id: number;
    name: string;
    description: string;
    icon: string;
    icon_url: string;
    wowhead_url: string;
  }