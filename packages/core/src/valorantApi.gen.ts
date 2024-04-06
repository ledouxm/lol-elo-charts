export namespace Schemas {
  // <Schemas>
  export type regions = "eu" | "na" | "ap" | "kr";
  export type affinities = "eu" | "na" | "latam" | "br" | "ap" | "kr";
  export type premier_conferences =
    | "EU_CENTRAL_EAST"
    | "EU_WEST"
    | "EU_MIDDLE_EAST"
    | "EU_TURKEY"
    | "NA_US_EAST"
    | "NA_US_WEST"
    | "LATAM_NORTH"
    | "LATAM_SOUTH"
    | "BR_BRAZIL"
    | "KR_KOREA"
    | "AP_ASIA"
    | "AP_JAPAN"
    | "AP_OCEANIA"
    | "AP_SOUTH_ASIA";
  export type premier_seasons_event_types = "LEAGUE" | "TOURNAMENT";
  export type premier_seasons_event_map_selection_types = "RANDOM" | "PICKBAN";
  export type maps =
    | "Ascent"
    | "Split"
    | "Fracture"
    | "Bind"
    | "Breeze"
    | "District"
    | "Kasbah"
    | "Piazza"
    | "Lotus"
    | "Pearl"
    | "Icebox"
    | "Haven";
  export type modes =
    | "Competitive"
    | "Custom Game"
    | "Deathmatch"
    | "Escalation"
    | "Team Deathmatch"
    | "New Map"
    | "Replication"
    | "Snowball Fight"
    | "Spike Rush"
    | "Swiftplay"
    | "Unrated";
  export type modes_api =
    | "competitive"
    | "custom"
    | "deathmatch"
    | "escalation"
    | "teamdeathmatch"
    | "newmap"
    | "replication"
    | "snowballfight"
    | "spikerush"
    | "swiftplay"
    | "unrated";
  export type mode_ids =
    | "competitive"
    | "custom"
    | "deathmatch"
    | "ggteam"
    | "hurm"
    | "newmap"
    | "onefa"
    | "snowball"
    | "spikerush"
    | "swiftplay"
    | "unrated";
  export type tiers =
    | "Unrated"
    | "Unknown 1"
    | "Unknown 2"
    | "Iron 1"
    | "Iron 2"
    | "Iron 3"
    | "Bronze 1"
    | "Bronze 2"
    | "Bronze 3"
    | "Silver 1"
    | "Silver 2"
    | "Silver 3"
    | "Gold 1"
    | "Gold 2"
    | "Gold 3"
    | "Platinum 1"
    | "Platinum 2"
    | "Platinum 3"
    | "Diamond 1"
    | "Diamond 2"
    | "Diamond 3"
    | "Ascendant 1"
    | "Ascendant 2"
    | "Ascendant 3"
    | "Immortal 1"
    | "Immortal 2"
    | "Immortal 3"
    | "Radiant";
  export type tiers_old =
    | "Unrated"
    | "Unknown 1"
    | "Unknown 2"
    | "Iron 1"
    | "Iron 2"
    | "Iron 3"
    | "Bronze 1"
    | "Bronze 2"
    | "Bronze 3"
    | "Silver 1"
    | "Silver 2"
    | "Silver 3"
    | "Gold 1"
    | "Gold 2"
    | "Gold 3"
    | "Platinum 1"
    | "Platinum 2"
    | "Platinum 3"
    | "Diamond 1"
    | "Diamond 2"
    | "Diamond 3"
    | "Immortal 1"
    | "Immortal 2"
    | "Immortal 3"
    | "Radiant";
  export type platforms = "PC" | "Console";
  export type seasons =
    | "e1a1"
    | "e1a2"
    | "e1a3"
    | "e2a1"
    | "e2a2"
    | "e2a3"
    | "e3a1"
    | "e3a2"
    | "e3a3"
    | "e4a1"
    | "e4a2"
    | "e4a3"
    | "e5a1"
    | "e5a2"
    | "e5a3"
    | "e6a1"
    | "e6a2"
    | "e6a3"
    | "e7a1"
    | "e7a2"
    | "e7a3";
  export type by_season = Partial<{
    error: boolean | null;
    wins: number;
    number_of_games: number;
    final_rank: number;
    final_rank_patched: string;
    act_rank_wins: Array<Partial<{ patched_tier: string; tier: number }>>;
    old: boolean;
  }>;
  export type player = Partial<{
    puuid: string;
    name: string;
    tag: string;
    team: string;
    level: number;
    character: string;
    currenttier: number;
    currenttier_patched: string;
    player_card: string;
    player_title: string;
    party_id: string;
    session_playtime: Partial<{ minutes: number; seconds: number; milliseconds: number }>;
    assets: Partial<{
      card: Partial<{ small: string; large: string; wide: string }>;
      agent: Partial<{ small: string; full: string; bust: string; killfeed: string }>;
    }>;
    behaviour: Partial<{
      afk_rounds: number;
      friendly_fire: Partial<{ incoming: number; outgoing: number }>;
      rounds_in_spawn: number;
    }>;
    platform: Partial<{ type: string; os: Partial<{ name: string; version: string }> }>;
    ability_casts: Partial<{
      c_cast: number | null;
      q_cast: number | null;
      e_cast: number | null;
      x_cast: number | null;
    }>;
    stats: Partial<{
      score: number;
      kills: number;
      deaths: number;
      assists: number;
      bodyshots: number;
      headshots: number;
      legshots: number;
    }>;
    economy: Partial<{
      spent: Partial<{ overall: number; average: number }>;
      loadout_value: Partial<{ overall: number; average: number }>;
    }>;
    damage_made: number;
    damage_received: number;
  }>;
  export type observer = Partial<{
    puuid: string;
    name: string;
    tag: string;
    platform: Partial<{ type: string; os: Partial<{ name: string; version: string }> }>;
    session_playtime: Partial<{ minutes: number; seconds: number; milliseconds: number }>;
    team: string;
    level: number;
    player_card: string;
    player_title: string;
    party_id: string;
  }>;
  export type coach = Partial<{ puuid: string; team: string }>;
  export type team = Partial<{
    has_won: boolean | null;
    rounds_won: number | null;
    rounds_lost: number | null;
    roaster: Partial<{
      members: Array<string>;
      name: string;
      tag: string;
      customization: Partial<{ icon: string; image: string; primary: string; secondary: string; tertiary: string }>;
    }> | null;
  }>;
  export type match = Partial<{
    metadata: Partial<{
      map: maps;
      game_version: string;
      game_length: number;
      game_start: number;
      game_start_patched: string;
      rounds_played: number;
      mode: modes;
      mode_id: mode_ids;
      queue: string;
      season_id: string;
      platform: string;
      matchid: string;
      premier_info: Partial<{ tournament_id: string | null; matchup_id: string | null }>;
      region: regions;
      cluster: string;
    }>;
    players: Partial<{ all_players: Array<player>; red: Array<player>; blue: Array<player> }>;
    observers: Array<observer>;
    coaches: Array<coach>;
    teams: Partial<{ red: team; blue: team }>;
    rounds: Array<
      Partial<{
        winning_team: string;
        end_type: string;
        bomb_planted: boolean | null;
        bomb_defused: boolean | null;
        plant_events: Partial<{
          plant_location: Partial<{ x: number; y: number }> | null;
          planted_by: Partial<{ puuid: string; display_name: string; team: string }> | null;
          plant_site: string | null;
          plant_time_in_round: number | null;
          player_locations_on_plant: Array<
            Partial<{
              player_puuid: string;
              player_display_name: string;
              player_team: string;
              location: Partial<{ x: number; y: number }>;
              view_radians: number;
            }>
          > | null;
        }> | null;
        defuse_events: Partial<{
          defuse_location: Partial<{ x: number; y: number }> | null;
          defused_by: Partial<{ puuid: string; display_name: string; team: string }> | null;
          defuse_time_in_round: number | null;
          player_locations_on_defuse: Array<
            Partial<{
              player_puuid: string;
              player_display_name: string;
              player_team: string;
              location: Partial<{ x: number; y: number }>;
              view_radians: number;
            }>
          > | null;
        }> | null;
        player_stats: Array<
          Partial<{
            ability_casts: Partial<{
              c_casts: number | null;
              q_casts: number | null;
              e_casts: number | null;
              x_casts: number | null;
            }>;
            player_puuid: string;
            player_display_name: string;
            player_team: string;
            damage_events: Array<
              Partial<{
                receiver_puuid: string;
                receiver_display_name: string;
                receiver_team: string;
                bodyshots: number;
                damage: number;
                headshots: number;
                legshots: number;
              }>
            >;
            damage: number;
            bodyshots: number;
            headshots: number;
            legshots: number;
            kill_events: Array<
              Partial<{
                kill_time_in_round: number;
                kill_time_in_match: number;
                killer_puuid: string;
                killer_display_name: string;
                killer_team: string;
                victim_puuid: string;
                victim_display_name: string;
                victim_team: string;
                victim_death_location: Partial<{ x: number; y: number }>;
                damage_weapon_id: string;
                damage_weapon_name: string;
                damage_weapon_assets: Partial<{ display_icon: string; killfeed_icon: string }>;
                secondary_fire_mode: boolean;
                player_locations_on_kill: Array<
                  Partial<{
                    player_puuid: string;
                    player_display_name: string;
                    player_team: string;
                    location: Partial<{ x: number; y: number }>;
                    view_radians: number;
                  }>
                >;
                assistants: Array<
                  Partial<{ assistant_puuid: string; assistant_display_name: string; assistant_team: string }>
                >;
              }>
            >;
            kills: number;
            score: number;
            economy: Partial<{
              loadout_value: number;
              weapon: Partial<{
                id: string;
                name: string;
                assets: Partial<{ display_icon: string; killfeed_icon: string }>;
              }>;
              armor: Partial<{ id: string; name: string; assets: Partial<{ display_icon: string }> }>;
              remaining: number;
              spent: number;
            }>;
            was_afk: boolean;
            was_penalized: boolean;
            stayed_in_spawn: boolean;
          }>
        >;
      }>
    >;
  }>;
  export type content = Array<
    Partial<{
      name: string;
      localizedNames: Array<
        Partial<{
          "ar-AE": string;
          "de-DE": string;
          "en-GB": string;
          "en-US": string;
          "es-ES": string;
          "es-MX": string;
          "fr-FR": string;
          "id-ID": string;
          "it-IT": string;
          "ja-JP": string;
          "ko-KR": string;
          "pl-PL": string;
          "pt-BR": string;
          "ru-RU": string;
          "th-TH": string;
          "tr-TR": string;
          "vi-VN": string;
          "zn-CN": string;
          "zn-TW": string;
        }>
      >;
      id: string;
      assetName: string;
      assetPath: string;
    }>
  >;
  export type leaderboard = Array<
    Partial<{
      PlayerCardID: string;
      TitleID: string;
      IsBanned: boolean;
      IsAnonymized: boolean;
      puuid: string;
      gameName: string;
      tagLine: string;
      leaderboardRank: number;
      rankedRating: number;
      numberOfWins: number;
      competitiveTier: number;
    }>
  >;
  export type status = Array<
    Partial<{
      created_at: string;
      archive_at: string | null;
      updates: Array<
        Partial<{
          created_at: string;
          updated_at: string | null;
          publish: boolean;
          id: number;
          translations: Array<Partial<{ content: string; locale: string }>>;
          publish_locations: Array<string>;
          author: string;
        }>
      >;
      platforms: Array<string>;
      updated_at: string | null;
      id: number;
      titles: Array<Partial<{ content: string; locale: string }>>;
      maintenance_status: string;
      incident_severity: string | null;
    }>
  >;
  export type v1mmr = Partial<{
    status: number;
    data: Partial<{
      currenttier: number | null;
      currenttier_patched: string | null;
      images: Partial<{
        small: string | null;
        large: string | null;
        triangle_down: string | null;
        triangle_up: string | null;
      }>;
      ranking_in_tier: number | null;
      mmr_change_to_last_game: number | null;
      elo: number | null;
      name: string | null;
      tag: string | null;
      old: boolean;
    }>;
  }>;
  export type v2mmr = Partial<{
    status: number;
    data: Partial<{
      name: string | null;
      tag: string | null;
      current_data: Partial<{
        currenttier: number | null;
        currenttier_patched: string | null;
        images: Partial<{
          small: string | null;
          large: string | null;
          triangle_down: string | null;
          triangle_up: string | null;
        }>;
        ranking_in_tier: number | null;
        mmr_change_to_last_game: number | null;
        elo: number | null;
        old: boolean;
      }>;
      highest_rank: Partial<{ old: boolean; tier: number | null; patched_tier: string | null; season: string | null }>;
      by_season: Partial<{
        e6a3: by_season;
        e6a2: by_season;
        e6a1: by_season;
        e5a3: by_season;
        e5a2: by_season;
        e5a1: by_season;
        e4a3: by_season;
        e4a2: by_season;
        e4a1: by_season;
        e3a3: by_season;
        e3a2: by_season;
        e3a1: by_season;
        e2a3: by_season;
        e2a2: by_season;
        e2a1: by_season;
        e1a3: by_season;
        e1a2: by_season;
        e1a1: by_season;
      }>;
    }>;
  }>;
  export type v1mmrh = Partial<{
    status: number;
    name: string;
    tag: string;
    data: Array<
      Partial<{
        currenttier: number;
        currenttier_patched: string;
        images: Partial<{ small: string; large: string; triangle_down: string; triangle_up: string }>;
        match_id: string;
        map: Partial<{ name: string; id: string }>;
        season_id: string;
        ranking_in_tier: number;
        mmr_change_to_last_game: number;
        elo: number;
        date: string;
        date_raw: number;
      }>
    >;
  }>;
  export type v3matches = Partial<{ status: string; data: Array<match> }>;
  export type v1leaderboard = leaderboard;
  export type v2leaderboard = Partial<{
    last_update: number;
    next_update: number;
    total_players: number;
    radiant_threshold: number;
    immortal_3_threshold: number;
    immortal_2_threshold: number;
    immortal_1_threshold: number;
    players: leaderboard;
  }>;
  export type bundle_raw = Partial<{
    ID: string;
    DataAssetID: string;
    CurrencyID: string;
    Items: Array<
      Partial<{
        Item: Partial<{ ItemTypeID: string; ItemID: string; Amount: string }>;
        BasePrice: number;
        CurrencyID: string;
        DiscountPercent: number;
        DiscountedPrice: number;
        IsPromoItem: boolean;
      }>
    >;
    DurationRemainingInSeconds: number;
    Wholesaleonly: boolean;
  }>;
  export type bundle_parsed = Partial<{
    bundle_uuid: string;
    seconds_remaining: number;
    bundle_price: number;
    whole_sale_only: boolean;
    expires_at: string;
    items: Array<
      Partial<{
        uuid: string;
        name: string;
        image: string;
        type: string;
        amount: number;
        discount_percent: number;
        base_price: number;
        discounted_price: number;
        promo_item: boolean;
      }>
    >;
  }>;
  export type v1storefeatured = Partial<{
    status: number;
    data: Partial<{
      FeaturedBundle: Partial<{
        Bundle: bundle_raw;
        Bundles: Array<bundle_raw>;
        BundleRemainingDurationInSeconds: number;
      }>;
    }>;
  }>;
  export type v2storefeatured = Partial<{ status: number; data: Array<bundle_parsed> }>;
  export type v2storeoffer = Partial<{
    offer_id: string;
    cost: number;
    name: string;
    icon: string | null;
    type: "skin_level" | "skin_chroma" | "buddy" | "spray" | "player_card" | "player_title";
    skin_id: string;
    content_tier: Partial<{ name: string; dev_name: string; icon: string }>;
  }>;
  export type v2storeoffers = Partial<{ status: number; data: Partial<{ offers: Array<v2storeoffer> }> }>;
  export type v1esportscheduleitem = Partial<{
    date: string;
    state: string;
    type: string;
    vod: string | null;
    league: Partial<{ name: string; identifier: string; icon: string; region: string }>;
    tournament: Partial<{ name: string; season: string }>;
    match: Partial<{
      id: string | null;
      game_type: Partial<{ type: "playAll" | "bestOf" | null; count: number | null }>;
      teams: Array<
        Partial<{
          name: string;
          code: string;
          icon: string;
          has_won: boolean;
          game_wins: number;
          record: Partial<{ wins: number; losses: number }>;
        }>
      >;
    }>;
  }>;
  export type v1esportschedule = Partial<{ status: number; data: Array<v1esportscheduleitem> }>;
  export type v1_lifetime_matches_item = Partial<{
    meta: Partial<{
      id: string;
      map: Partial<{ id: string; name: string | null }>;
      version: string;
      mode: string;
      started_at: string;
      season: Partial<{ id: string; short: string | null }>;
      region: string | null;
      cluster: string | null;
    }>;
    stats: Partial<{
      puuid: string;
      team: string;
      level: number;
      character: Partial<{ id: string; name: string | null }>;
      tier: number;
      score: number;
      kills: number;
      deaths: number;
      assists: number;
      shots: Partial<{ head: number; body: number; leg: number }>;
      damage: Partial<{ made: number; received: number }>;
    }>;
    teams: Partial<{ red: number | null; blue: number | null }>;
  }>;
  export type v1_lifetime_matches = Partial<{
    status: number;
    name: string;
    tag: string;
    results: Partial<{ total: number; returned: number; before: number; after: number }>;
    data: Array<v1_lifetime_matches_item>;
  }>;
  export type v1_premier_team = Partial<{
    status: number;
    data: Partial<{
      id: string;
      name: string;
      tag: string;
      enrolled: boolean;
      stats: Partial<{ wins: number; matches: number; losses: number }>;
      placement: Partial<{ points: number; conference: string; division: number; place: number }>;
      customization: Partial<{ icon: string; image: string; primary: string; secondary: string; tertiary: string }>;
      member: Array<Partial<{ puuid: string; name: string | null; tag: string | null }>>;
    }>;
  }>;
  export type v1_premier_team_history = Partial<{
    status: number;
    data: Partial<{
      league_matches: Array<Partial<{ id: string; points_before: number; points_after: number; started_at: string }>>;
    }>;
  }>;
  export type v1_partial_premier_team = Partial<{
    id: string;
    name: string;
    tag: string;
    conference: premier_conferences;
    division: number;
    affinity: affinities;
    region: regions;
    losses: number;
    wins: number;
    score: number;
    ranking: number;
    customization: Partial<{ icon: string; image: string; primary: string; secondary: string; tertiary: string }>;
  }>;
  export type v1_premier_search = Partial<{ status: number; data: Array<v1_partial_premier_team> }>;
  export type v1_premier_leaderboard = Partial<{ status: number; data: Array<v1_partial_premier_team> }>;
  export type v1_premier_conference = Partial<{
    status: number;
    data: Array<
      Partial<{
        id: string;
        affinity: affinities;
        pods: Array<Partial<{ pod: string; name: string }>>;
        region: regions;
        timezone: string;
        name: premier_conferences;
        icon: string;
      }>
    >;
  }>;
  export type v1_premier_season = Partial<{
    status: number;
    data: Array<
      Partial<{
        id: string;
        championship_event_id: string;
        championship_points_required: number;
        starts_at: string;
        ends_at: string;
        enrollment_starts_at: string;
        enrollment_ends_at: string;
        events: Array<
          Partial<{
            id: string;
            type: premier_seasons_event_types;
            starts_at: string;
            ends_at: string;
            conference_schedules: Array<
              Partial<{ conference: premier_conferences; starts_at: string; ends_at: string }>
            >;
            map_selection: Partial<{
              type: premier_seasons_event_map_selection_types;
              maps: Array<Partial<{ name: maps; id: string }>>;
            }>;
            points_required_to_participate: number;
          }>
        >;
      }>
    >;
  }>;
  export type v1_queue_status = Partial<{
    status: number;
    data: Array<
      Partial<{
        mode: modes;
        mode_id: mode_ids;
        enabled: boolean;
        team_size: number;
        number_of_teams: number;
        party_size: Partial<{ max: number; min: number; invalid: Array<number>; full_party_bypass: boolean }>;
        high_skill: Partial<{ max_party_size: number; min_tier: number; max_tier: number }>;
        ranked: boolean;
        tournament: boolean;
        skill_disparity: Array<Partial<{ tier: number; name: tiers; max_tier: Partial<{ id: number; name: tiers }> }>>;
        required_account_level: number;
        game_rules: Partial<{
          overtime_win_by_two: boolean;
          allow_lenient_surrender: boolean;
          allow_drop_out: boolean;
          assign_random_agents: boolean;
          skip_pregame: boolean;
          allow_overtime_draw_vote: boolean;
          overtime_win_by_two_capped: boolean;
          premier_mode: boolean;
        }>;
        platforms: Array<platforms>;
        maps: Array<Partial<{ map: Partial<{ id: string; name: maps }>; enabled: boolean }>>;
      }>
    >;
  }>;
  export type v1_lifetime_mmr_history_item = Partial<{
    match_id: string;
    tier: Partial<{ id: number; name: tiers }>;
    map: Partial<{ id: string; name: maps }>;
    season: Partial<{ id: string; short: seasons }>;
    ranking_in_tier: number;
    last_mmr_change: number;
    elo: number;
    date: string;
  }>;
  export type v1_lifetime_mmr_history = Partial<{
    status: number;
    name: string;
    tag: string;
    results: Partial<{ total: number; returned: number; before: number; after: number }>;
    data: Array<v1_lifetime_mmr_history_item>;
  }>;
  export type v1_account = Partial<{
    status: number;
    data: Partial<{
      puuid: string;
      region: string;
      account_level: number;
      name: string | null;
      tag: string | null;
      card: Partial<{ small: string; large: string; wide: string; id: string }>;
      last_update: string;
      last_update_raw: number;
    }>;
  }>;

  // </Schemas>
}

export namespace Endpoints {
  // <Endpoints>

  export type get_Valorantv1accountNameTag = {
    method: "GET";
    path: "/valorant/v1/account/{name}/{tag}";
    parameters: {
      query: Partial<{ force: boolean }>;
      path: { name: string; tag: string };
    };
    response: Schemas.v1_account;
  };
  export type get_Valorantv1byPuuidaccountPuuid = {
    method: "GET";
    path: "/valorant/v1/by-puuid/account/{puuid}";
    parameters: {
      query: Partial<{ force: boolean }>;
      path: { puuid: string };
    };
    response: Schemas.v1_account;
  };
  export type get_Valorantv1byPuuidlifetimematchesAffinityPuuid = {
    method: "GET";
    path: "/valorant/v1/by-puuid/lifetime/matches/{affinity}/{puuid}";
    parameters: {
      query: Partial<{
        mode:
          | "competitive"
          | "custom"
          | "deathmatch"
          | "escalation"
          | "teamdeathmatch"
          | "newmap"
          | "replication"
          | "snowballfight"
          | "spikerush"
          | "swiftplay"
          | "unrated";
        map:
          | "Ascent"
          | "Split"
          | "Fracture"
          | "Bind"
          | "Breeze"
          | "District"
          | "Kasbah"
          | "Piazza"
          | "Lotus"
          | "Pearl"
          | "Icebox"
          | "Haven";
        page: number;
        size: number;
      }>;
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr"; puuid: string };
    };
    response: Schemas.v1_lifetime_matches;
  };
  export type get_Valorantv1byPuuidlifetimemmrHistoryRegionPuuid = {
    method: "GET";
    path: "/valorant/v1/by-puuid/lifetime/mmr-history/{region}/{puuid}";
    parameters: {
      query: Partial<{ page: number; size: number }>;
      path: { region: "eu" | "na" | "latam" | "br" | "ap" | "kr"; puuid: string };
    };
    response: Schemas.v1_lifetime_mmr_history;
  };
  export type get_Valorantv3byPuuidmatchesAffinityPuuid = {
    method: "GET";
    path: "/valorant/v3/by-puuid/matches/{affinity}/{puuid}";
    parameters: {
      query: Partial<{
        mode:
          | "competitive"
          | "custom"
          | "deathmatch"
          | "escalation"
          | "teamdeathmatch"
          | "newmap"
          | "replication"
          | "snowballfight"
          | "spikerush"
          | "swiftplay"
          | "unrated";
        map:
          | "Ascent"
          | "Split"
          | "Fracture"
          | "Bind"
          | "Breeze"
          | "District"
          | "Kasbah"
          | "Piazza"
          | "Lotus"
          | "Pearl"
          | "Icebox"
          | "Haven";
        size: number;
      }>;
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr"; puuid: string };
    };
    response: Schemas.v3matches;
  };
  export type get_Valorantv1byPuuidmmrAffinityPuuid = {
    method: "GET";
    path: "/valorant/v1/by-puuid/mmr/{affinity}/{puuid}";
    parameters: {
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr"; puuid: string };
    };
    response: Schemas.v1mmr;
  };
  export type get_Valorantv2byPuuidmmrAffinityPuuid = {
    method: "GET";
    path: "/valorant/v2/by-puuid/mmr/{affinity}/{puuid}";
    parameters: {
      query: Partial<{
        season:
          | "e1a1"
          | "e1a2"
          | "e1a3"
          | "e2a1"
          | "e2a2"
          | "e2a3"
          | "e3a1"
          | "e3a2"
          | "e3a3"
          | "e4a1"
          | "e4a2"
          | "e4a3"
          | "e5a1"
          | "e5a2"
          | "e5a3"
          | "e6a1"
          | "e6a2"
          | "e6a3"
          | "e7a1"
          | "e7a2"
          | "e7a3";
      }>;
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr"; puuid: string };
    };
    response: Schemas.v2mmr;
  };
  export type get_Valorantv1byPuuidmmrHistoryAffinityPuuid = {
    method: "GET";
    path: "/valorant/v1/by-puuid/mmr-history/{affinity}/{puuid}";
    parameters: {
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr"; puuid: string };
    };
    response: Schemas.v1mmrh;
  };
  export type get_Valorantv1content = {
    method: "GET";
    path: "/valorant/v1/content";
    parameters: {
      query: Partial<{
        locale:
          | "ar-AE"
          | "de-DE"
          | "en-GB"
          | "en-US"
          | "es-ES"
          | "es-MX"
          | "fr-FR"
          | "id-ID"
          | "it-IT"
          | "ja-JP"
          | "ko-KR"
          | "pl-PL"
          | "pt-BR"
          | "ru-RU"
          | "th-TH"
          | "tr-TR"
          | "vi-VN"
          | "zn-CN"
          | "zn-TW";
      }>;
    };
    response: Partial<{
      version: string;
      characters: Schemas.content;
      maps: Schemas.content;
      chromas: Schemas.content;
      skins: Schemas.content;
      skinLevels: Schemas.content;
      equips: Schemas.content;
      gameModes: Schemas.content;
      sprays: Schemas.content;
      sprayLevels: Schemas.content;
      charms: Schemas.content;
      charmLevels: Schemas.content;
      playerCards: Schemas.content;
      playerTitles: Schemas.content;
      acts: Array<
        Partial<{
          name: string;
          localizedNames: Array<
            Partial<{
              "ar-AE": string;
              "de-DE": string;
              "en-GB": string;
              "en-US": string;
              "es-ES": string;
              "es-MX": string;
              "fr-FR": string;
              "id-ID": string;
              "it-IT": string;
              "ja-JP": string;
              "ko-KR": string;
              "pl-PL": string;
              "pt-BR": string;
              "ru-RU": string;
              "th-TH": string;
              "tr-TR": string;
              "vi-VN": string;
              "zn-CN": string;
              "zn-TW": string;
            }>
          >;
          id: string;
          isActive: boolean;
        }>
      >;
    }>;
  };
  export type get_Valorantv1crosshairgenerate = {
    method: "GET";
    path: "/valorant/v1/crosshair/generate";
    parameters: {
      query: Partial<{ id: string }>;
    };
    response: unknown;
  };
  export type get_Valorantv1esportsschedule = {
    method: "GET";
    path: "/valorant/v1/esports/schedule";
    parameters: {
      query: Partial<{
        region:
          | "international"
          | "north america"
          | "emea"
          | "brazil"
          | "japan"
          | "korea"
          | "latin_america"
          | "latin_america_south"
          | "latin_america_north"
          | "southeast_asia"
          | "vietnam"
          | "oceania";
        league:
          | "vct_americas"
          | "challengers_na"
          | "game_changers_na"
          | "vct_emea"
          | "vct_pacific"
          | "challengers_br"
          | "challengers_jpn"
          | "challengers_kr"
          | "challengers_latam"
          | "challengers_latam_n"
          | "challengers_latam_s"
          | "challengers_apac"
          | "challengers_sea_id"
          | "challengers_sea_ph"
          | "challengers_sea_sg_and_my"
          | "challengers_sea_th"
          | "challengers_sea_hk_and_tw"
          | "challengers_sea_vn"
          | "valorant_oceania_tour"
          | "challengers_south_asia"
          | "game_changers_sea"
          | "game_changers_series_brazil"
          | "game_changers_east_asia"
          | "game_changers_emea"
          | "game_changers_jpn"
          | "game_changers_kr"
          | "game_changers_latam"
          | "game_changers_championship"
          | "masters"
          | "last_chance_qualifier_apac"
          | "last_chance_qualifier_east_asia"
          | "last_chance_qualifier_emea"
          | "last_chance_qualifier_na"
          | "last_chance_qualifier_br_and_latam"
          | "vct_lock_in"
          | "champions"
          | "vrl_spain"
          | "vrl_northern_europe"
          | "vrl_dach"
          | "vrl_france"
          | "vrl_east"
          | "vrl_turkey"
          | "vrl_cis"
          | "mena_resilence"
          | "challengers_italy"
          | "challengers_portugal";
      }>;
    };
    response: Schemas.v1esportschedule;
  };
  export type get_Valorantv1leaderboardAffinity = {
    method: "GET";
    path: "/valorant/v1/leaderboard/{affinity}";
    parameters: {
      query: Partial<{
        puuid: string;
        name: string;
        tag: string;
        season:
          | "e1a1"
          | "e1a2"
          | "e1a3"
          | "e2a1"
          | "e2a2"
          | "e2a3"
          | "e3a1"
          | "e3a2"
          | "e3a3"
          | "e4a1"
          | "e4a2"
          | "e4a3"
          | "e5a1"
          | "e5a2"
          | "e5a3"
          | "e6a1"
          | "e6a2"
          | "e6a3"
          | "e7a1"
          | "e7a2"
          | "e7a3";
      }>;
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr" };
    };
    response: Schemas.leaderboard;
  };
  export type get_Valorantv2leaderboardAffinity = {
    method: "GET";
    path: "/valorant/v2/leaderboard/{affinity}";
    parameters: {
      query: Partial<{
        puuid: string;
        name: string;
        tag: string;
        season:
          | "e1a1"
          | "e1a2"
          | "e1a3"
          | "e2a1"
          | "e2a2"
          | "e2a3"
          | "e3a1"
          | "e3a2"
          | "e3a3"
          | "e4a1"
          | "e4a2"
          | "e4a3"
          | "e5a1"
          | "e5a2"
          | "e5a3"
          | "e6a1"
          | "e6a2"
          | "e6a3"
          | "e7a1"
          | "e7a2"
          | "e7a3";
      }>;
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr" };
    };
    response: Schemas.v2leaderboard;
  };
  export type get_Valorantv1lifetimematchesAffinityNameTag = {
    method: "GET";
    path: "/valorant/v1/lifetime/matches/{affinity}/{name}/{tag}";
    parameters: {
      query: Partial<{
        mode:
          | "competitive"
          | "custom"
          | "deathmatch"
          | "escalation"
          | "teamdeathmatch"
          | "newmap"
          | "replication"
          | "snowballfight"
          | "spikerush"
          | "swiftplay"
          | "unrated";
        map:
          | "Ascent"
          | "Split"
          | "Fracture"
          | "Bind"
          | "Breeze"
          | "District"
          | "Kasbah"
          | "Piazza"
          | "Lotus"
          | "Pearl"
          | "Icebox"
          | "Haven";
        page: number;
        size: number;
      }>;
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr"; name: string; tag: string };
    };
    response: Schemas.v1_lifetime_matches;
  };
  export type get_Valorantv1lifetimemmrHistoryAffinityNameTag = {
    method: "GET";
    path: "/valorant/v1/lifetime/mmr-history/{affinity}/{name}/{tag}";
    parameters: {
      query: Partial<{ page: number; size: number }>;
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr"; name: string; tag: string };
    };
    response: Schemas.v1_lifetime_mmr_history;
  };
  export type get_Valorantv3matchesAffinityNameTag = {
    method: "GET";
    path: "/valorant/v3/matches/{affinity}/{name}/{tag}";
    parameters: {
      path: { name: string; tag: string; affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr" };
    };
    response: Partial<{ status: number; data: Array<Schemas.match> }>;
  };
  export type get_Valorantv2matchMatchId = {
    method: "GET";
    path: "/valorant/v2/match/{matchId}";
    parameters: {
      path: { matchId: string };
    };
    response: Partial<{ status: number; data: Schemas.match }>;
  };
  export type get_Valorantv1mmrHistoryAffinityNameTag = {
    method: "GET";
    path: "/valorant/v1/mmr-history/{affinity}/{name}/{tag}";
    parameters: {
      path: { name: string; tag: string; affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr" };
    };
    response: Schemas.v1mmrh;
  };
  export type get_Valorantv1mmrAffinityNameTag = {
    method: "GET";
    path: "/valorant/v1/mmr/{affinity}/{name}/{tag}";
    parameters: {
      path: { name: string; tag: string; affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr" };
    };
    response: Schemas.v1mmr;
  };
  export type get_Valorantv2mmrAffinityNameTag = {
    method: "GET";
    path: "/valorant/v2/mmr/{affinity}/{name}/{tag}";
    parameters: {
      query: Partial<{
        season:
          | "e1a1"
          | "e1a2"
          | "e1a3"
          | "e2a1"
          | "e2a2"
          | "e2a3"
          | "e3a1"
          | "e3a2"
          | "e3a3"
          | "e4a1"
          | "e4a2"
          | "e4a3"
          | "e5a1"
          | "e5a2"
          | "e5a3"
          | "e6a1"
          | "e6a2"
          | "e6a3"
          | "e7a1"
          | "e7a2"
          | "e7a3";
      }>;
      path: { name: string; tag: string; affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr" };
    };
    response: Schemas.v2mmr;
  };
  export type get_Valorantv1premierTeam_nameTeam_tag = {
    method: "GET";
    path: "/valorant/v1/premier/{team_name}/{team_tag}";
    parameters: {
      path: { team_name: string; team_tag: string };
    };
    response: Schemas.v1_premier_team;
  };
  export type get_Valorantv1premierTeam_nameTeam_taghistory = {
    method: "GET";
    path: "/valorant/v1/premier/{team_name}/{team_tag}/history";
    parameters: {
      path: { team_name: string; team_tag: string };
    };
    response: Schemas.v1_premier_team_history;
  };
  export type get_Valorantv1premierTeam_id = {
    method: "GET";
    path: "/valorant/v1/premier/{team_id}";
    parameters: {
      path: { team_id: string };
    };
    response: Schemas.v1_premier_team;
  };
  export type get_Valorantv1premierTeam_idhistory = {
    method: "GET";
    path: "/valorant/v1/premier/{team_id}/history";
    parameters: {
      path: { team_id: string };
    };
    response: Schemas.v1_premier_team_history;
  };
  export type get_Valorantv1premiersearch = {
    method: "GET";
    path: "/valorant/v1/premier/search";
    parameters: {
      query: Partial<{
        name: string;
        tag: string;
        division: number;
        conference:
          | "EU_CENTRAL_EAST"
          | "EU_WEST"
          | "EU_MIDDLE_EAST"
          | "EU_TURKEY"
          | "NA_US_EAST"
          | "NA_US_WEST"
          | "LATAM_NORTH"
          | "LATAM_SOUTH"
          | "BR_BRAZIL"
          | "KR_KOREA"
          | "AP_ASIA"
          | "AP_JAPAN"
          | "AP_OCEANIA"
          | "AP_SOUTH_ASIA";
      }>;
    };
    response: Schemas.v1_premier_search;
  };
  export type get_Valorantv1premierconferences = {
    method: "GET";
    path: "/valorant/v1/premier/conferences";
    parameters: never;
    response: Schemas.v1_premier_conference;
  };
  export type get_Valorantv1premierseasonsAffinity = {
    method: "GET";
    path: "/valorant/v1/premier/seasons/{affinity}";
    parameters: {
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr" };
    };
    response: Schemas.v1_premier_season;
  };
  export type get_Valorantv1premierleaderboardAffinity = {
    method: "GET";
    path: "/valorant/v1/premier/leaderboard/{affinity}";
    parameters: {
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr" };
    };
    response: Schemas.v1_premier_leaderboard;
  };
  export type get_Valorantv1premierleaderboardAffinityConference = {
    method: "GET";
    path: "/valorant/v1/premier/leaderboard/{affinity}/{conference}";
    parameters: {
      path: {
        affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr";
        conference:
          | "EU_CENTRAL_EAST"
          | "EU_WEST"
          | "EU_MIDDLE_EAST"
          | "EU_TURKEY"
          | "NA_US_EAST"
          | "NA_US_WEST"
          | "LATAM_NORTH"
          | "LATAM_SOUTH"
          | "BR_BRAZIL"
          | "KR_KOREA"
          | "AP_ASIA"
          | "AP_JAPAN"
          | "AP_OCEANIA"
          | "AP_SOUTH_ASIA";
      };
    };
    response: Schemas.v1_premier_leaderboard;
  };
  export type get_Valorantv1premierleaderboardAffinityConferenceDivision = {
    method: "GET";
    path: "/valorant/v1/premier/leaderboard/{affinity}/{conference}/{division}";
    parameters: {
      path: {
        affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr";
        conference:
          | "EU_CENTRAL_EAST"
          | "EU_WEST"
          | "EU_MIDDLE_EAST"
          | "EU_TURKEY"
          | "NA_US_EAST"
          | "NA_US_WEST"
          | "LATAM_NORTH"
          | "LATAM_SOUTH"
          | "BR_BRAZIL"
          | "KR_KOREA"
          | "AP_ASIA"
          | "AP_JAPAN"
          | "AP_OCEANIA"
          | "AP_SOUTH_ASIA";
        division: number;
      };
    };
    response: Schemas.v1_premier_leaderboard;
  };
  export type get_Valorantv1queueStatusAffinity = {
    method: "GET";
    path: "/valorant/v1/queue-status/{affinity}";
    parameters: {
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr" };
    };
    response: Schemas.v1_queue_status;
  };
  export type post_Valorantv1raw = {
    method: "POST";
    path: "/valorant/v1/raw";
    parameters: {
      body: Partial<{ type: string; value: string; region: string; queries: string | null }>;
    };
    response: unknown;
  };
  export type get_Valorantv1statusAffinity = {
    method: "GET";
    path: "/valorant/v1/status/{affinity}";
    parameters: {
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr" };
    };
    response: Partial<{
      status: number;
      region: string;
      data: Partial<{ maintenances: Schemas.status; incidents: Schemas.status }>;
    }>;
  };
  export type get_Valorantv1storeFeatured = {
    method: "GET";
    path: "/valorant/v1/store-featured";
    parameters: never;
    response: Schemas.v1storefeatured;
  };
  export type get_Valorantv2storeFeatured = {
    method: "GET";
    path: "/valorant/v2/store-featured";
    parameters: never;
    response: Schemas.v2storefeatured;
  };
  export type get_Valorantv1storeOffers = {
    method: "GET";
    path: "/valorant/v1/store-offers";
    parameters: never;
    response: unknown;
  };
  export type get_Valorantv2storeOffers = {
    method: "GET";
    path: "/valorant/v2/store-offers";
    parameters: never;
    response: Schemas.v2storeoffers;
  };
  export type get_Valorantv1versionAffinity = {
    method: "GET";
    path: "/valorant/v1/version/{affinity}";
    parameters: {
      path: { affinity: "eu" | "na" | "latam" | "br" | "ap" | "kr" };
    };
    response: Partial<{
      status: number;
      data: Partial<{ version: string; clientVersion: string; branch: string; region: string }>;
    }>;
  };
  export type get_Valorantv1websiteCountryCode = {
    method: "GET";
    path: "/valorant/v1/website/{countryCode}";
    parameters: {
      path: {
        countryCode:
          | "en-us"
          | "en-gb"
          | "de-de"
          | "es-es"
          | "es-mx"
          | "fr-fr"
          | "it-it"
          | "ja-jp"
          | "ko-kr"
          | "pt-br"
          | "ru-ru"
          | "tr-tr"
          | "vi-vn";
      };
    };
    response: Partial<{
      status: number;
      data: Array<
        Partial<{
          banner_url: string;
          category: string;
          date: string;
          external_link: string | null;
          title: string;
          url: string;
        }>
      >;
    }>;
  };

  // </Endpoints>
}

// <EndpointByMethod>
export type EndpointByMethod = {
  get: {
    "/valorant/v1/account/{name}/{tag}": Endpoints.get_Valorantv1accountNameTag;
    "/valorant/v1/by-puuid/account/{puuid}": Endpoints.get_Valorantv1byPuuidaccountPuuid;
    "/valorant/v1/by-puuid/lifetime/matches/{affinity}/{puuid}": Endpoints.get_Valorantv1byPuuidlifetimematchesAffinityPuuid;
    "/valorant/v1/by-puuid/lifetime/mmr-history/{region}/{puuid}": Endpoints.get_Valorantv1byPuuidlifetimemmrHistoryRegionPuuid;
    "/valorant/v3/by-puuid/matches/{affinity}/{puuid}": Endpoints.get_Valorantv3byPuuidmatchesAffinityPuuid;
    "/valorant/v1/by-puuid/mmr/{affinity}/{puuid}": Endpoints.get_Valorantv1byPuuidmmrAffinityPuuid;
    "/valorant/v2/by-puuid/mmr/{affinity}/{puuid}": Endpoints.get_Valorantv2byPuuidmmrAffinityPuuid;
    "/valorant/v1/by-puuid/mmr-history/{affinity}/{puuid}": Endpoints.get_Valorantv1byPuuidmmrHistoryAffinityPuuid;
    "/valorant/v1/content": Endpoints.get_Valorantv1content;
    "/valorant/v1/crosshair/generate": Endpoints.get_Valorantv1crosshairgenerate;
    "/valorant/v1/esports/schedule": Endpoints.get_Valorantv1esportsschedule;
    "/valorant/v1/leaderboard/{affinity}": Endpoints.get_Valorantv1leaderboardAffinity;
    "/valorant/v2/leaderboard/{affinity}": Endpoints.get_Valorantv2leaderboardAffinity;
    "/valorant/v1/lifetime/matches/{affinity}/{name}/{tag}": Endpoints.get_Valorantv1lifetimematchesAffinityNameTag;
    "/valorant/v1/lifetime/mmr-history/{affinity}/{name}/{tag}": Endpoints.get_Valorantv1lifetimemmrHistoryAffinityNameTag;
    "/valorant/v3/matches/{affinity}/{name}/{tag}": Endpoints.get_Valorantv3matchesAffinityNameTag;
    "/valorant/v2/match/{matchId}": Endpoints.get_Valorantv2matchMatchId;
    "/valorant/v1/mmr-history/{affinity}/{name}/{tag}": Endpoints.get_Valorantv1mmrHistoryAffinityNameTag;
    "/valorant/v1/mmr/{affinity}/{name}/{tag}": Endpoints.get_Valorantv1mmrAffinityNameTag;
    "/valorant/v2/mmr/{affinity}/{name}/{tag}": Endpoints.get_Valorantv2mmrAffinityNameTag;
    "/valorant/v1/premier/{team_name}/{team_tag}": Endpoints.get_Valorantv1premierTeam_nameTeam_tag;
    "/valorant/v1/premier/{team_name}/{team_tag}/history": Endpoints.get_Valorantv1premierTeam_nameTeam_taghistory;
    "/valorant/v1/premier/{team_id}": Endpoints.get_Valorantv1premierTeam_id;
    "/valorant/v1/premier/{team_id}/history": Endpoints.get_Valorantv1premierTeam_idhistory;
    "/valorant/v1/premier/search": Endpoints.get_Valorantv1premiersearch;
    "/valorant/v1/premier/conferences": Endpoints.get_Valorantv1premierconferences;
    "/valorant/v1/premier/seasons/{affinity}": Endpoints.get_Valorantv1premierseasonsAffinity;
    "/valorant/v1/premier/leaderboard/{affinity}": Endpoints.get_Valorantv1premierleaderboardAffinity;
    "/valorant/v1/premier/leaderboard/{affinity}/{conference}": Endpoints.get_Valorantv1premierleaderboardAffinityConference;
    "/valorant/v1/premier/leaderboard/{affinity}/{conference}/{division}": Endpoints.get_Valorantv1premierleaderboardAffinityConferenceDivision;
    "/valorant/v1/queue-status/{affinity}": Endpoints.get_Valorantv1queueStatusAffinity;
    "/valorant/v1/status/{affinity}": Endpoints.get_Valorantv1statusAffinity;
    "/valorant/v1/store-featured": Endpoints.get_Valorantv1storeFeatured;
    "/valorant/v2/store-featured": Endpoints.get_Valorantv2storeFeatured;
    "/valorant/v1/store-offers": Endpoints.get_Valorantv1storeOffers;
    "/valorant/v2/store-offers": Endpoints.get_Valorantv2storeOffers;
    "/valorant/v1/version/{affinity}": Endpoints.get_Valorantv1versionAffinity;
    "/valorant/v1/website/{countryCode}": Endpoints.get_Valorantv1websiteCountryCode;
  };
  post: {
    "/valorant/v1/raw": Endpoints.post_Valorantv1raw;
  };
};

// </EndpointByMethod>

// <EndpointByMethod.Shorthands>
type ReplaceBrackets<T, Current = ""> = T extends `${infer Before}{${string}}${infer After}` ? ReplaceBrackets<`${Before}${string}${After}`, Current> : T
type ReplaceBracketsInKey<T> = { [K in keyof T as ReplaceBrackets<K>]: T[K] }

export type GetEndpoints = EndpointByMethod["get"];
export type PostEndpoints = EndpointByMethod["post"];
export type AllEndpoints = EndpointByMethod[keyof EndpointByMethod];
// </EndpointByMethod.Shorthands>

// <ApiClientTypes>
export type EndpointParameters = {
  body?: unknown;
  query?: Record<string, unknown>;
  header?: Record<string, unknown>;
  path?: Record<string, unknown>;
};

export type MutationMethod = "post" | "put" | "patch" | "delete";
export type Method = "get" | "head" | MutationMethod;

export type DefaultEndpoint = {
  parameters?: EndpointParameters | undefined;
  response: unknown;
};

export type Endpoint<TConfig extends DefaultEndpoint = DefaultEndpoint> = {
  operationId: string;
  method: Method;
  path: string;
  parameters?: TConfig["parameters"];
  meta: {
    alias: string;
    hasParameters: boolean;
    areParametersRequired: boolean;
  };
  response: TConfig["response"];
};

type Fetcher = (
  method: Method,
  url: string,
  parameters?: EndpointParameters | undefined,
) => Promise<Endpoint["response"]>;

type RequiredKeys<T> = {
  [P in keyof T]-?: undefined extends T[P] ? never : P;
}[keyof T];

type MaybeOptionalArg<T> = RequiredKeys<T> extends never ? [config?: T] : [config: T];

// </ApiClientTypes>

// <ApiClient>
export class ApiClient {
  baseUrl: string = "";

  constructor(public fetcher: Fetcher) {}

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl;
    return this;
  }

  // <ApiClient.get>
  get<Path extends keyof GetEndpoints, TEndpoint extends GetEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<TEndpoint["parameters"]>
  ): Promise<TEndpoint["response"]> {
    return this.fetcher("get", this.baseUrl + path, params[0]);
  }
  // </ApiClient.get>

  // <ApiClient.post>
  post<Path extends keyof PostEndpoints, TEndpoint extends PostEndpoints[Path]>(
    path: Path,
    ...params: MaybeOptionalArg<TEndpoint["parameters"]>
  ): Promise<TEndpoint["response"]> {
    return this.fetcher("post", this.baseUrl + path, params[0]);
  }
  // </ApiClient.post>
}

export function createApiClient(fetcher: Fetcher, baseUrl?: string) {
  return new ApiClient(fetcher).setBaseUrl(baseUrl ?? "");
}

/**
 Example usage:
 const api = createApiClient((method, url, params) =>
   fetch(url, { method, body: JSON.stringify(params) }).then((res) => res.json()),
 );
 api.get("/users").then((users) => console.log(users));
 api.post("/users", { body: { name: "John" } }).then((user) => console.log(user));
 api.put("/users/:id", { path: { id: 1 }, body: { name: "John" } }).then((user) => console.log(user));
*/

// </ApiClient
