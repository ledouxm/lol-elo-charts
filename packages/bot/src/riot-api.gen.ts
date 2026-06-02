export namespace Schemas {
    // <Schemas>
    export type Error = Partial<{ status: Partial<{ status_code: number; message: string }> }>;
    export type account_v1_AccountDto = { puuid: string; gameName?: string | undefined; tagLine?: string | undefined };
    export type account_v1_AccountRegionDTO = { puuid: string; game: string; region: string };
    export type account_v1_ActiveShardDto = { puuid: string; game: string; activeShard: string };
    export type champion_mastery_v4_RewardConfigDto = {
        rewardValue: string;
        rewardType: string;
        maximumReward: number;
    };
    export type champion_mastery_v4_NextSeasonMilestonesDto = {
        requireGradeCounts: unknown;
        rewardMarks: number;
        bonus: boolean;
        rewardConfig?: champion_mastery_v4_RewardConfigDto | undefined;
        totalGamesRequires: number;
    };
    export type champion_mastery_v4_ChampionMasteryDto = {
        puuid: string;
        championPointsUntilNextLevel: number;
        chestGranted?: boolean | undefined;
        championId: number;
        lastPlayTime: number;
        championLevel: number;
        championPoints: number;
        championPointsSinceLastLevel: number;
        markRequiredForNextLevel: number;
        championSeasonMilestone: number;
        nextSeasonMilestone: champion_mastery_v4_NextSeasonMilestonesDto;
        tokensEarned: number;
        milestoneGrades?: Array<string> | undefined;
    };
    export type champion_v3_ChampionInfo = {
        maxNewPlayerLevel: number;
        freeChampionIdsForNewPlayers: Array<number>;
        freeChampionIds: Array<number>;
    };
    export type clash_v1_PlayerDto = {
        puuid: string;
        teamId?: string | undefined;
        position: "UNSELECTED" | "FILL" | "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";
        role: "CAPTAIN" | "MEMBER";
    };
    export type clash_v1_TeamDto = {
        id: string;
        tournamentId: number;
        name: string;
        iconId: number;
        tier: number;
        captain: string;
        abbreviation: string;
        players: Array<clash_v1_PlayerDto>;
    };
    export type clash_v1_TournamentPhaseDto = {
        id: number;
        registrationTime: number;
        startTime: number;
        cancelled: boolean;
    };
    export type clash_v1_TournamentDto = {
        id: number;
        themeId: number;
        nameKey: string;
        nameKeySecondary: string;
        schedule: Array<clash_v1_TournamentPhaseDto>;
    };
    export type league_exp_v4_MiniSeriesDTO = { losses: number; progress: string; target: number; wins: number };
    export type league_exp_v4_LeagueEntryDTO = {
        leagueId: string;
        summonerId?: string | undefined;
        puuid: string;
        queueType: string;
        tier: string;
        rank: string;
        leaguePoints: number;
        wins: number;
        losses: number;
        hotStreak: boolean;
        veteran: boolean;
        freshBlood: boolean;
        inactive: boolean;
        miniSeries?: league_exp_v4_MiniSeriesDTO | undefined;
    };
    export type league_v4_MiniSeriesDTO = { losses: number; progress: string; target: number; wins: number };
    export type league_v4_LeagueItemDTO = {
        freshBlood: boolean;
        wins: number;
        miniSeries?: league_v4_MiniSeriesDTO | undefined;
        inactive: boolean;
        veteran: boolean;
        hotStreak: boolean;
        rank: string;
        leaguePoints: number;
        losses: number;
        puuid: string;
        summonerId?: string | undefined;
    };
    export type league_v4_LeagueListDTO = {
        leagueId?: string | undefined;
        entries: Array<league_v4_LeagueItemDTO>;
        tier: string;
        name?: string | undefined;
        queue?: string | undefined;
    };
    export type league_v4_LeagueEntryDTO = {
        leagueId?: string | undefined;
        puuid: string;
        queueType: string;
        tier?: string | undefined;
        rank?: string | undefined;
        leaguePoints: number;
        wins: number;
        losses: number;
        hotStreak: boolean;
        veteran: boolean;
        freshBlood: boolean;
        inactive: boolean;
        miniSeries?: league_v4_MiniSeriesDTO | undefined;
        summonerId?: string | undefined;
    };
    export type lol_challenges_v1_ChallengeConfigInfoDto = {
        id: number;
        localizedNames: unknown;
        state: "DISABLED" | "HIDDEN" | "ENABLED" | "ARCHIVED";
        tracking?: "LIFETIME" | "SEASON" | undefined;
        startTimestamp?: number | undefined;
        endTimestamp?: number | undefined;
        leaderboard: boolean;
        thresholds: unknown;
    };
    export type lol_challenges_v1_State = Partial<{}>;
    export type lol_challenges_v1_Tracking = Partial<{}>;
    export type lol_challenges_v1_ApexPlayerInfoDto = { puuid: string; value: number; position: number };
    export type lol_challenges_v1_Level = Partial<{}>;
    export type lol_challenges_v1_ChallengeInfoDto = {
        percentile: number;
        playersInLevel?: number | undefined;
        achievedTime?: number | undefined;
        value: number;
        challengeId: number;
        level:
            | "NONE"
            | "IRON"
            | "BRONZE"
            | "SILVER"
            | "GOLD"
            | "PLATINUM"
            | "DIAMOND"
            | "MASTER"
            | "GRANDMASTER"
            | "CHALLENGER"
            | "HIGHEST_NOT_LEADERBOARD_ONLY"
            | "HIGHEST"
            | "LOWEST";
        position?: number | undefined;
    };
    export type lol_challenges_v1_PlayerClientPreferencesDto = Partial<{
        bannerAccent: string;
        title: string;
        challengeIds: Array<number>;
        crestBorder: string;
        prestigeCrestBorderLevel: number;
    }>;
    export type lol_challenges_v1_ChallengePointDto = {
        level: string;
        current: number;
        max: number;
        percentile?: number | undefined;
        position?: number | undefined;
    };
    export type lol_challenges_v1_PlayerInfoDto = {
        challenges: Array<lol_challenges_v1_ChallengeInfoDto>;
        preferences: lol_challenges_v1_PlayerClientPreferencesDto;
        totalPoints: lol_challenges_v1_ChallengePointDto;
        categoryPoints: unknown;
    };
    export type lol_rso_match_v1_MatchDto = Partial<{}>;
    export type lol_rso_match_v1_TimelineDto = Partial<{}>;
    export type lol_status_v4_ContentDto = { locale: string; content: string };
    export type lol_status_v4_UpdateDto = {
        id: number;
        author: string;
        publish: boolean;
        publish_locations: Array<"riotclient" | "riotstatus" | "game">;
        translations: Array<lol_status_v4_ContentDto>;
        created_at: string;
        updated_at: string;
    };
    export type lol_status_v4_StatusDto = {
        id: number;
        maintenance_status?: "scheduled" | "in_progress" | "complete" | undefined;
        incident_severity?: "info" | "warning" | "critical" | undefined;
        titles: Array<lol_status_v4_ContentDto>;
        updates: Array<lol_status_v4_UpdateDto>;
        created_at: string;
        archive_at?: string | undefined;
        updated_at?: string | undefined;
        platforms: Array<"windows" | "macos" | "android" | "ios" | "ps4" | "xbone" | "switch">;
    };
    export type lol_status_v4_PlatformDataDto = {
        id: string;
        name: string;
        locales: Array<string>;
        maintenances: Array<lol_status_v4_StatusDto>;
        incidents: Array<lol_status_v4_StatusDto>;
    };
    export type lor_deck_v1_DeckDto = { id: string; name: string; code: string };
    export type lor_deck_v1_NewDeckDto = { name: string; code: string };
    export type lor_inventory_v1_CardDto = { code: string; count: string };
    export type lor_match_v1_MetadataDto = { data_version: string; match_id: string; participants: Array<string> };
    export type lor_match_v1_PlayerDto = {
        puuid: string;
        deck_id: string;
        deck_code: string;
        factions: Array<string>;
        game_outcome: string;
        order_of_play: number;
    };
    export type lor_match_v1_InfoDto = {
        game_mode: "Constructed" | "Expeditions" | "Tutorial";
        game_type: "Ranked" | "Normal" | "AI" | "Tutorial" | "VanillaTrial" | "Singleton" | "StandardGauntlet";
        game_start_time_utc: string;
        game_version: string;
        game_format: "standard" | "eternal";
        players: Array<lor_match_v1_PlayerDto>;
        total_turn_count: number;
    };
    export type lor_match_v1_MatchDto = { metadata: lor_match_v1_MetadataDto; info: lor_match_v1_InfoDto };
    export type lor_ranked_v1_PlayerDto = { name: string; rank: number; lp: number };
    export type lor_ranked_v1_LeaderboardDto = { players: Array<lor_ranked_v1_PlayerDto> };
    export type lor_status_v1_ContentDto = { locale: string; content: string };
    export type lor_status_v1_UpdateDto = {
        id: number;
        author: string;
        publish: boolean;
        publish_locations: Array<"riotclient" | "riotstatus" | "game">;
        translations: Array<lor_status_v1_ContentDto>;
        created_at: string;
        updated_at: string;
    };
    export type lor_status_v1_StatusDto = {
        id: number;
        maintenance_status: "scheduled" | "in_progress" | "complete";
        incident_severity: "info" | "warning" | "critical";
        titles: Array<lor_status_v1_ContentDto>;
        updates: Array<lor_status_v1_UpdateDto>;
        created_at: string;
        archive_at: string;
        updated_at: string;
        platforms: Array<"windows" | "macos" | "android" | "ios" | "ps4" | "xbone" | "switch">;
    };
    export type lor_status_v1_PlatformDataDto = {
        id: string;
        name: string;
        locales: Array<string>;
        maintenances: Array<lor_status_v1_StatusDto>;
        incidents: Array<lor_status_v1_StatusDto>;
    };
    export type match_v5_ReplayDTO = { total: number; matchFileURLs: Array<string> };
    export type match_v5_MetadataDto = { dataVersion: string; matchId: string; participants: Array<string> };
    export type match_v5_ChallengesDto = Partial<{
        "12AssistStreakCount": number;
        baronBuffGoldAdvantageOverThreshold: number;
        controlWardTimeCoverageInRiverOrEnemyHalf: number;
        earliestBaron: number;
        earliestDragonTakedown: number;
        earliestElderDragon: number;
        earlyLaningPhaseGoldExpAdvantage: number;
        fasterSupportQuestCompletion: 0 | 1;
        fastestLegendary: number;
        hadAfkTeammate: 0 | 1;
        highestChampionDamage: number;
        highestCrowdControlScore: 0 | 1;
        highestWardKills: 0 | 1;
        junglerKillsEarlyJungle: number;
        killsOnLanersEarlyJungleAsJungler: number;
        laningPhaseGoldExpAdvantage: 0 | 1;
        legendaryCount: number;
        maxCsAdvantageOnLaneOpponent: number;
        maxLevelLeadLaneOpponent: number;
        mostWardsDestroyedOneSweeper: number;
        mythicItemUsed: number;
        playedChampSelectPosition: 0 | 1;
        soloTurretsLategame: number;
        takedownsFirst25Minutes: number;
        teleportTakedowns: number;
        thirdInhibitorDestroyedTime: number;
        threeWardsOneSweeperCount: number;
        visionScoreAdvantageLaneOpponent: number;
        InfernalScalePickup: number;
        fistBumpParticipation: number;
        voidMonsterKill: number;
        abilityUses: number;
        acesBefore15Minutes: number;
        alliedJungleMonsterKills: number;
        baronTakedowns: number;
        blastConeOppositeOpponentCount: number;
        bountyGold: number;
        buffsStolen: number;
        completeSupportQuestInTime: number;
        controlWardsPlaced: number;
        damagePerMinute: number;
        damageTakenOnTeamPercentage: number;
        dancedWithRiftHerald: number;
        deathsByEnemyChamps: number;
        dodgeSkillShotsSmallWindow: number;
        doubleAces: number;
        dragonTakedowns: number;
        legendaryItemUsed: Array<number>;
        effectiveHealAndShielding: number;
        elderDragonKillsWithOpposingSoul: number;
        elderDragonMultikills: number;
        enemyChampionImmobilizations: number;
        enemyJungleMonsterKills: number;
        epicMonsterKillsNearEnemyJungler: number;
        epicMonsterKillsWithin30SecondsOfSpawn: number;
        epicMonsterSteals: number;
        epicMonsterStolenWithoutSmite: number;
        firstTurretKilled: number;
        firstTurretKilledTime: number;
        flawlessAces: number;
        fullTeamTakedown: number;
        gameLength: number;
        getTakedownsInAllLanesEarlyJungleAsLaner: number;
        goldPerMinute: number;
        hadOpenNexus: number;
        immobilizeAndKillWithAlly: number;
        initialBuffCount: number;
        initialCrabCount: number;
        jungleCsBefore10Minutes: number;
        junglerTakedownsNearDamagedEpicMonster: number;
        kda: number;
        killAfterHiddenWithAlly: number;
        killedChampTookFullTeamDamageSurvived: number;
        killingSprees: number;
        killParticipation: number;
        killsNearEnemyTurret: number;
        killsOnOtherLanesEarlyJungleAsLaner: number;
        killsOnRecentlyHealedByAramPack: number;
        killsUnderOwnTurret: number;
        killsWithHelpFromEpicMonster: number;
        knockEnemyIntoTeamAndKill: number;
        kTurretsDestroyedBeforePlatesFall: number;
        landSkillShotsEarlyGame: number;
        laneMinionsFirst10Minutes: number;
        lostAnInhibitor: number;
        maxKillDeficit: number;
        mejaisFullStackInTime: number;
        moreEnemyJungleThanOpponent: number;
        multiKillOneSpell: number;
        multikills: number;
        multikillsAfterAggressiveFlash: number;
        multiTurretRiftHeraldCount: number;
        outerTurretExecutesBefore10Minutes: number;
        outnumberedKills: number;
        outnumberedNexusKill: number;
        perfectDragonSoulsTaken: number;
        perfectGame: number;
        pickKillWithAlly: number;
        poroExplosions: number;
        quickCleanse: number;
        quickFirstTurret: number;
        quickSoloKills: number;
        riftHeraldTakedowns: number;
        saveAllyFromDeath: number;
        scuttleCrabKills: number;
        shortestTimeToAceFromFirstTakedown: number;
        skillshotsDodged: number;
        skillshotsHit: number;
        snowballsHit: number;
        soloBaronKills: number;
        SWARM_DefeatAatrox: number;
        SWARM_DefeatBriar: number;
        SWARM_DefeatMiniBosses: number;
        SWARM_EvolveWeapon: number;
        SWARM_Have3Passives: number;
        SWARM_KillEnemy: number;
        SWARM_PickupGold: number;
        SWARM_ReachLevel50: number;
        SWARM_Survive15Min: number;
        SWARM_WinWith5EvolvedWeapons: number;
        soloKills: number;
        stealthWardsPlaced: number;
        survivedSingleDigitHpCount: number;
        survivedThreeImmobilizesInFight: number;
        takedownOnFirstTurret: number;
        takedowns: number;
        takedownsAfterGainingLevelAdvantage: number;
        takedownsBeforeJungleMinionSpawn: number;
        takedownsFirstXMinutes: number;
        takedownsInAlcove: number;
        takedownsInEnemyFountain: number;
        teamBaronKills: number;
        teamDamagePercentage: number;
        teamElderDragonKills: number;
        teamRiftHeraldKills: number;
        tookLargeDamageSurvived: number;
        turretPlatesTaken: number;
        turretsTakenWithRiftHerald: number;
        turretTakedowns: number;
        twentyMinionsIn3SecondsCount: number;
        twoWardsOneSweeperCount: number;
        unseenRecalls: number;
        visionScorePerMinute: number;
        wardsGuarded: number;
        wardTakedowns: number;
        wardTakedownsBefore20M: number;
        HealFromMapSources: number;
    }>;
    export type match_v5_MissionsDto = Partial<{
        playerScore0: number;
        playerScore1: number;
        playerScore2: number;
        playerScore3: number;
        playerScore4: number;
        playerScore5: number;
        playerScore6: number;
        playerScore7: number;
        playerScore8: number;
        playerScore9: number;
        playerScore10: number;
        playerScore11: number;
    }>;
    export type match_v5_PerkStatsDto = { defense: number; flex: number; offense: number };
    export type match_v5_PerkStyleSelectionDto = { perk: number; var1: number; var2: number; var3: number };
    export type match_v5_PerkStyleDto = {
        description: string;
        selections: Array<match_v5_PerkStyleSelectionDto>;
        style: number;
    };
    export type match_v5_PerksDto = { statPerks: match_v5_PerkStatsDto; styles: Array<match_v5_PerkStyleDto> };
    export type match_v5_ParticipantPlayerBehaviorDto = Partial<{ PlayerBehavior_IsHeroInCombat: number }>;
    export type match_v5_ParticipantDto = {
        allInPings?: number | undefined;
        assistMePings?: number | undefined;
        assists: number;
        baronKills: number;
        bountyLevel?: number | undefined;
        champExperience: number;
        champLevel: number;
        championId: number;
        championName: string;
        commandPings?: number | undefined;
        championTransform: number;
        consumablesPurchased: number;
        challenges?: match_v5_ChallengesDto | undefined;
        damageDealtToBuildings?: number | undefined;
        damageDealtToObjectives: number;
        damageDealtToTurrets: number;
        damageSelfMitigated: number;
        deaths: number;
        detectorWardsPlaced: number;
        doubleKills: number;
        dragonKills: number;
        eligibleForProgression?: boolean | undefined;
        enemyMissingPings?: number | undefined;
        enemyVisionPings?: number | undefined;
        firstBloodAssist: boolean;
        firstBloodKill: boolean;
        firstTowerAssist: boolean;
        firstTowerKill: boolean;
        gameEndedInEarlySurrender: boolean;
        gameEndedInSurrender: boolean;
        holdPings?: number | undefined;
        getBackPings?: number | undefined;
        goldEarned: number;
        goldSpent: number;
        individualPosition: string;
        inhibitorKills: number;
        inhibitorTakedowns?: number | undefined;
        inhibitorsLost?: number | undefined;
        item0: number;
        item1: number;
        item2: number;
        item3: number;
        item4: number;
        item5: number;
        item6: number;
        itemsPurchased: number;
        killingSprees: number;
        kills: number;
        lane: string;
        largestCriticalStrike: number;
        largestKillingSpree: number;
        largestMultiKill: number;
        longestTimeSpentLiving: number;
        magicDamageDealt: number;
        magicDamageDealtToChampions: number;
        magicDamageTaken: number;
        missions?: match_v5_MissionsDto | undefined;
        neutralMinionsKilled: number;
        needVisionPings?: number | undefined;
        nexusKills: number;
        nexusTakedowns?: number | undefined;
        nexusLost?: number | undefined;
        objectivesStolen: number;
        objectivesStolenAssists: number;
        onMyWayPings?: number | undefined;
        participantId: number;
        playerScore0?: number | undefined;
        playerScore1?: number | undefined;
        playerScore2?: number | undefined;
        playerScore3?: number | undefined;
        playerScore4?: number | undefined;
        playerScore5?: number | undefined;
        playerScore6?: number | undefined;
        playerScore7?: number | undefined;
        playerScore8?: number | undefined;
        playerScore9?: number | undefined;
        playerScore10?: number | undefined;
        playerScore11?: number | undefined;
        pentaKills: number;
        perks: match_v5_PerksDto;
        physicalDamageDealt: number;
        physicalDamageDealtToChampions: number;
        physicalDamageTaken: number;
        placement?: number | undefined;
        playerAugment1?: number | undefined;
        playerAugment2?: number | undefined;
        playerAugment3?: number | undefined;
        playerAugment4?: number | undefined;
        playerSubteamId?: number | undefined;
        pushPings?: number | undefined;
        profileIcon: number;
        puuid: string;
        quadraKills: number;
        riotIdGameName?: string | undefined;
        riotIdTagline?: string | undefined;
        role: string;
        sightWardsBoughtInGame: number;
        spell1Casts: number;
        spell2Casts: number;
        spell3Casts: number;
        spell4Casts: number;
        subteamPlacement?: number | undefined;
        summoner1Casts: number;
        summoner1Id: number;
        summoner2Casts: number;
        summoner2Id: number;
        summonerId: string;
        summonerLevel: number;
        summonerName: string;
        teamEarlySurrendered: boolean;
        teamId: number;
        teamPosition: string;
        timeCCingOthers: number;
        timePlayed: number;
        totalAllyJungleMinionsKilled?: number | undefined;
        totalDamageDealt: number;
        totalDamageDealtToChampions: number;
        totalDamageShieldedOnTeammates: number;
        totalDamageTaken: number;
        totalEnemyJungleMinionsKilled?: number | undefined;
        totalHeal: number;
        totalHealsOnTeammates: number;
        totalMinionsKilled: number;
        totalTimeCCDealt: number;
        totalTimeSpentDead: number;
        totalUnitsHealed: number;
        tripleKills: number;
        trueDamageDealt: number;
        trueDamageDealtToChampions: number;
        trueDamageTaken: number;
        turretKills: number;
        turretTakedowns?: number | undefined;
        turretsLost?: number | undefined;
        unrealKills: number;
        visionScore: number;
        visionClearedPings?: number | undefined;
        visionWardsBoughtInGame: number;
        wardsKilled: number;
        wardsPlaced: number;
        win: boolean;
        baitPings?: number | undefined;
        dangerPings?: number | undefined;
        basicPings?: number | undefined;
        playerAugment5?: number | undefined;
        playerAugment6?: number | undefined;
        riotIdName?: string | undefined;
        retreatPings?: number | undefined;
        championSkinId?: number | undefined;
        damageDealtToEpicMonsters?: number | undefined;
        roleBoundItem?: number | undefined;
        PlayerBehavior?: match_v5_ParticipantPlayerBehaviorDto | undefined;
    };
    export type match_v5_BanDto = { championId: number; pickTurn: number };
    export type match_v5_ObjectiveDto = { first: boolean; kills: number };
    export type match_v5_ObjectivesDto = {
        baron: match_v5_ObjectiveDto;
        champion: match_v5_ObjectiveDto;
        dragon: match_v5_ObjectiveDto;
        horde?: match_v5_ObjectiveDto | undefined;
        inhibitor: match_v5_ObjectiveDto;
        riftHerald: match_v5_ObjectiveDto;
        tower: match_v5_ObjectiveDto;
        atakhan?: match_v5_ObjectiveDto | undefined;
    };
    export type match_v5_FeatDto = Partial<{ featState: number }>;
    export type match_v5_FeatsDto = Partial<{
        EPIC_MONSTER_KILL: match_v5_FeatDto;
        FIRST_BLOOD: match_v5_FeatDto;
        FIRST_TURRET: match_v5_FeatDto;
    }>;
    export type match_v5_TeamDto = {
        bans: Array<match_v5_BanDto>;
        objectives: match_v5_ObjectivesDto;
        teamId: number;
        win: boolean;
        feats?: match_v5_FeatsDto | undefined;
    };
    export type match_v5_InfoDto = {
        endOfGameResult?: string | undefined;
        gameCreation: number;
        gameDuration: number;
        gameEndTimestamp?: number | undefined;
        gameId: number;
        gameMode: string;
        gameName: string;
        gameStartTimestamp: number;
        gameType: string;
        gameVersion: string;
        mapId: number;
        participants: Array<match_v5_ParticipantDto>;
        platformId: string;
        queueId: number;
        teams: Array<match_v5_TeamDto>;
        tournamentCode?: string | undefined;
        gameModeMutators?: Array<string> | undefined;
    };
    export type match_v5_MatchDto = { metadata: match_v5_MetadataDto; info: match_v5_InfoDto };
    export type match_v5_MetadataTimeLineDto = { dataVersion: string; matchId: string; participants: Array<string> };
    export type match_v5_ParticipantTimeLineDto = { participantId: number; puuid: string };
    export type match_v5_PositionDto = { x: number; y: number };
    export type match_v5_MatchTimelineVictimDamage = {
        basic: boolean;
        magicDamage: number;
        name: string;
        participantId: number;
        physicalDamage: number;
        spellName: string;
        spellSlot: number;
        trueDamage: number;
        type: string;
    };
    export type match_v5_EventsTimeLineDto = {
        timestamp: number;
        realTimestamp?: number | undefined;
        type: string;
        itemId?: number | undefined;
        participantId?: number | undefined;
        levelUpType?: string | undefined;
        skillSlot?: number | undefined;
        creatorId?: number | undefined;
        wardType?: string | undefined;
        level?: number | undefined;
        assistingParticipantIds?: Array<number> | undefined;
        bounty?: number | undefined;
        killStreakLength?: number | undefined;
        killerId?: number | undefined;
        position?: match_v5_PositionDto | undefined;
        victimDamageDealt?: Array<match_v5_MatchTimelineVictimDamage> | undefined;
        victimDamageReceived?: Array<match_v5_MatchTimelineVictimDamage> | undefined;
        victimId?: number | undefined;
        killType?: string | undefined;
        laneType?: string | undefined;
        teamId?: number | undefined;
        multiKillLength?: number | undefined;
        killerTeamId?: number | undefined;
        monsterType?: string | undefined;
        monsterSubType?: string | undefined;
        buildingType?: string | undefined;
        towerType?: string | undefined;
        afterId?: number | undefined;
        beforeId?: number | undefined;
        goldGain?: number | undefined;
        gameId?: number | undefined;
        winningTeam?: number | undefined;
        transformType?: string | undefined;
        name?: string | undefined;
        shutdownBounty?: number | undefined;
        actualStartTime?: number | undefined;
        featType?: number | undefined;
        featValue?: number | undefined;
        victimTeamfightDamageDealt?: Array<match_v5_MatchTimelineVictimDamage> | undefined;
        victimTeamfightDamageReceived?: Array<match_v5_MatchTimelineVictimDamage> | undefined;
    };
    export type match_v5_ChampionStatsDto = {
        abilityHaste?: number | undefined;
        abilityPower: number;
        armor: number;
        armorPen: number;
        armorPenPercent: number;
        attackDamage: number;
        attackSpeed: number;
        bonusArmorPenPercent: number;
        bonusMagicPenPercent: number;
        ccReduction: number;
        cooldownReduction: number;
        health: number;
        healthMax: number;
        healthRegen: number;
        lifesteal: number;
        magicPen: number;
        magicPenPercent: number;
        magicResist: number;
        movementSpeed: number;
        omnivamp?: number | undefined;
        physicalVamp?: number | undefined;
        power: number;
        powerMax: number;
        powerRegen: number;
        spellVamp: number;
    };
    export type match_v5_DamageStatsDto = {
        magicDamageDone: number;
        magicDamageDoneToChampions: number;
        magicDamageTaken: number;
        physicalDamageDone: number;
        physicalDamageDoneToChampions: number;
        physicalDamageTaken: number;
        totalDamageDone: number;
        totalDamageDoneToChampions: number;
        totalDamageTaken: number;
        trueDamageDone: number;
        trueDamageDoneToChampions: number;
        trueDamageTaken: number;
    };
    export type match_v5_ParticipantFrameDto = {
        championStats: match_v5_ChampionStatsDto;
        currentGold: number;
        damageStats: match_v5_DamageStatsDto;
        goldPerSecond: number;
        jungleMinionsKilled: number;
        level: number;
        minionsKilled: number;
        participantId: number;
        position: match_v5_PositionDto;
        timeEnemySpentControlled: number;
        totalGold: number;
        xp: number;
    };
    export type match_v5_FramesTimeLineDto = {
        events: Array<match_v5_EventsTimeLineDto>;
        participantFrames?: unknown | undefined;
        timestamp: number;
    };
    export type match_v5_InfoTimeLineDto = {
        endOfGameResult?: string | undefined;
        frameInterval: number;
        gameId?: number | undefined;
        participants?: Array<match_v5_ParticipantTimeLineDto> | undefined;
        frames: Array<match_v5_FramesTimeLineDto>;
    };
    export type match_v5_TimelineDto = { metadata: match_v5_MetadataTimeLineDto; info: match_v5_InfoTimeLineDto };
    export type match_v5_ParticipantFramesDto = { "1-9": match_v5_ParticipantFrameDto };
    export type riftbound_content_v1_CardStatsDTO = { energy: number; might: number; cost: number; power: number };
    export type riftbound_content_v1_CardArtDTO = { thumbnailURL: string; fullURL: string; artist: string };
    export type riftbound_content_v1_CardDTO = {
        id: string;
        collectorNumber: number;
        set: string;
        name: string;
        description: string;
        type: string;
        rarity: string;
        faction: string;
        stats: riftbound_content_v1_CardStatsDTO;
        keywords: Array<string>;
        art: riftbound_content_v1_CardArtDTO;
        flavorText: string;
        tags: Array<string>;
    };
    export type riftbound_content_v1_SetDTO = { id: string; name: string; cards: Array<riftbound_content_v1_CardDTO> };
    export type riftbound_content_v1_RiftboundContentDTO = {
        game: string;
        version: string;
        lastUpdated: string;
        sets: Array<riftbound_content_v1_SetDTO>;
    };
    export type spectator_tft_v5_BannedChampion = { pickTurn: number; championId: number; teamId: number };
    export type spectator_tft_v5_Observer = { encryptionKey: string };
    export type spectator_tft_v5_Perks = { perkIds: Array<number>; perkStyle: number; perkSubStyle: number };
    export type spectator_tft_v5_GameCustomizationObject = { category: string; content: string };
    export type spectator_tft_v5_CurrentGameParticipant = {
        championId: number;
        perks?: spectator_tft_v5_Perks | undefined;
        profileIconId: number;
        teamId: number;
        puuid?: string | undefined;
        spell1Id: number;
        spell2Id: number;
        gameCustomizationObjects: Array<spectator_tft_v5_GameCustomizationObject>;
        riotId?: string | undefined;
    };
    export type spectator_tft_v5_CurrentGameInfo = {
        gameId: number;
        gameType: string;
        gameStartTime: number;
        mapId: number;
        gameLength: number;
        platformId: string;
        gameMode: string;
        bannedChampions: Array<spectator_tft_v5_BannedChampion>;
        gameQueueConfigId?: number | undefined;
        observers: spectator_tft_v5_Observer;
        participants: Array<spectator_tft_v5_CurrentGameParticipant>;
    };
    export type spectator_v5_BannedChampion = { pickTurn: number; championId: number; teamId: number };
    export type spectator_v5_Observer = { encryptionKey: string };
    export type spectator_v5_Perks = { perkIds: Array<number>; perkStyle: number; perkSubStyle: number };
    export type spectator_v5_GameCustomizationObject = { category: string; content: string };
    export type spectator_v5_CurrentGameParticipant = {
        championId: number;
        perks?: spectator_v5_Perks | undefined;
        profileIconId: number;
        bot: boolean;
        teamId: number;
        puuid?: string | undefined;
        spell1Id: number;
        spell2Id: number;
        gameCustomizationObjects: Array<spectator_v5_GameCustomizationObject>;
        riotId?: string | undefined;
    };
    export type spectator_v5_CurrentGameInfo = {
        gameId: number;
        gameType: string;
        gameStartTime: number;
        mapId: number;
        gameLength: number;
        platformId: string;
        gameMode: string;
        bannedChampions: Array<spectator_v5_BannedChampion>;
        gameQueueConfigId?: number | undefined;
        observers: spectator_v5_Observer;
        participants: Array<spectator_v5_CurrentGameParticipant>;
    };
    export type summoner_v4_SummonerDTO = {
        profileIconId: number;
        revisionDate: number;
        puuid: string;
        summonerLevel: number;
        id?: string | undefined;
    };
    export type tft_league_v1_MiniSeriesDTO = { losses: number; progress: string; target: number; wins: number };
    export type tft_league_v1_LeagueEntryDTO = {
        puuid?: string | undefined;
        leagueId?: string | undefined;
        queueType: string;
        ratedTier?: "ORANGE" | "PURPLE" | "BLUE" | "GREEN" | "GRAY" | undefined;
        ratedRating?: number | undefined;
        tier?: string | undefined;
        rank?: string | undefined;
        leaguePoints?: number | undefined;
        wins: number;
        losses: number;
        hotStreak?: boolean | undefined;
        veteran?: boolean | undefined;
        freshBlood?: boolean | undefined;
        inactive?: boolean | undefined;
        miniSeries?: tft_league_v1_MiniSeriesDTO | undefined;
    };
    export type tft_league_v1_LeagueItemDTO = {
        freshBlood: boolean;
        wins: number;
        miniSeries?: tft_league_v1_MiniSeriesDTO | undefined;
        inactive: boolean;
        veteran: boolean;
        hotStreak: boolean;
        rank: string;
        leaguePoints: number;
        losses: number;
        puuid: string;
    };
    export type tft_league_v1_LeagueListDTO = {
        leagueId?: string | undefined;
        entries: Array<tft_league_v1_LeagueItemDTO>;
        tier: string;
        name?: string | undefined;
        queue?: string | undefined;
    };
    export type tft_league_v1_TopRatedLadderEntryDto = {
        puuid: string;
        ratedTier: "ORANGE" | "PURPLE" | "BLUE" | "GREEN" | "GRAY";
        ratedRating: number;
        wins: number;
        previousUpdateLadderPosition: number;
    };
    export type tft_match_v1_MetadataDto = { data_version: string; match_id: string; participants: Array<string> };
    export type tft_match_v1_CompanionDto = { content_ID: string; item_ID: number; skin_ID: number; species: string };
    export type tft_match_v1_TraitDto = {
        name: string;
        num_units: number;
        style?: number | undefined;
        tier_current: number;
        tier_total?: number | undefined;
    };
    export type tft_match_v1_UnitDto = {
        items?: Array<number> | undefined;
        character_id: string;
        itemNames?: Array<string> | undefined;
        chosen?: string | undefined;
        name: string;
        rarity: number;
        tier: number;
    };
    export type tft_match_v1_ParticipantMissionsDto = Partial<{
        Assists: number;
        DamageDealt: number;
        DamageDealtToObjectives: number;
        DamageDealtToTurrets: number;
        DamageTaken: number;
        DoubleKills: number;
        GoldEarned: number;
        GoldSpent: number;
        InhibitorsDestroyed: number;
        Kills: number;
        LargestKillingSpree: number;
        LargestMultiKill: number;
        MagicDamageDealt: number;
        MagicDamageDealtToChampions: number;
        NeutralMinionsKilledTeamJungle: number;
        PhysicalDamageDealt: number;
        PhysicalDamageTaken: number;
        PlayerScore0: number;
        PlayerScore1: number;
        PlayerScore2: number;
        PlayerScore3: number;
        PlayerScore4: number;
        PlayerScore5: number;
        PlayerScore6: number;
        PlayerScore9: number;
        PlayerScore10: number;
        PlayerScore11: number;
        QuadraKills: number;
        Spell1Casts: number;
        Spell2Casts: number;
        Spell3Casts: number;
        Spell4Casts: number;
        SummonerSpell1Casts: number;
        TimeCCOthers: number;
        TotalMinionsKilled: number;
        TrueDamageDealtToChampions: number;
        UnrealKills: number;
        VisionScore: number;
        WardsKilled: number;
        Deaths: number;
        KillingSprees: number;
        MagicDamageTaken: number;
        PentaKills: number;
        PhysicalDamageDealtToChampions: number;
        TotalDamageDealtToChampions: number;
        TripleKills: number;
        TrueDamageDealt: number;
        TrueDamageTaken: number;
    }>;
    export type tft_match_v1_ParticipantDto = {
        companion: tft_match_v1_CompanionDto;
        gold_left: number;
        last_round: number;
        level: number;
        placement: number;
        players_eliminated: number;
        puuid: string;
        riotIdGameName?: string | undefined;
        riotIdTagline?: string | undefined;
        time_eliminated: number;
        total_damage_to_players: number;
        traits: Array<tft_match_v1_TraitDto>;
        units: Array<tft_match_v1_UnitDto>;
        win?: boolean | undefined;
        augments?: Array<string> | undefined;
        partner_group_id?: number | undefined;
        missions?: tft_match_v1_ParticipantMissionsDto | undefined;
        skill_tree?: unknown | undefined;
        pve_score?: number | undefined;
        pve_wonrun?: boolean | undefined;
    };
    export type tft_match_v1_InfoDto = {
        endOfGameResult?: string | undefined;
        gameCreation?: number | undefined;
        gameId?: number | undefined;
        game_datetime: number;
        game_length: number;
        game_version: string;
        game_variation?: string | undefined;
        mapId?: number | undefined;
        participants: Array<tft_match_v1_ParticipantDto>;
        queue_id: number;
        queueId?: number | undefined;
        tft_game_type?: string | undefined;
        tft_set_core_name?: string | undefined;
        tft_set_number: number;
    };
    export type tft_match_v1_MatchDto = { metadata: tft_match_v1_MetadataDto; info: tft_match_v1_InfoDto };
    export type tft_status_v1_ContentDto = { locale: string; content: string };
    export type tft_status_v1_UpdateDto = {
        id: number;
        author: string;
        publish: boolean;
        publish_locations: Array<"riotclient" | "riotstatus" | "game">;
        translations: Array<tft_status_v1_ContentDto>;
        created_at: string;
        updated_at: string;
    };
    export type tft_status_v1_StatusDto = {
        id: number;
        maintenance_status: "scheduled" | "in_progress" | "complete";
        incident_severity: "info" | "warning" | "critical";
        titles: Array<tft_status_v1_ContentDto>;
        updates: Array<tft_status_v1_UpdateDto>;
        created_at: string;
        archive_at: string;
        updated_at: string;
        platforms: Array<"windows" | "macos" | "android" | "ios" | "ps4" | "xbone" | "switch">;
    };
    export type tft_status_v1_PlatformDataDto = {
        id: string;
        name: string;
        locales: Array<string>;
        maintenances: Array<tft_status_v1_StatusDto>;
        incidents: Array<tft_status_v1_StatusDto>;
    };
    export type tft_summoner_v1_SummonerDTO = {
        puuid: string;
        profileIconId: number;
        revisionDate: number;
        summonerLevel: number;
        id?: string | undefined;
    };
    export type tournament_stub_v5_TournamentCodeParametersV5 = {
        allowedParticipants?: Array<string> | undefined;
        metadata?: string | undefined;
        teamSize: number;
        pickType: "BLIND_PICK" | "DRAFT_MODE" | "ALL_RANDOM" | "TOURNAMENT_DRAFT";
        mapType: "SUMMONERS_RIFT" | "HOWLING_ABYSS";
        spectatorType: "NONE" | "LOBBYONLY" | "ALL";
        enoughPlayers: boolean;
    };
    export type tournament_stub_v5_TournamentCodeV5DTO = {
        code: string;
        lobbyName: string;
        metaData: string;
        password: string;
        teamSize: number;
        providerId: number;
        pickType: string;
        tournamentId: number;
        id: number;
        region: "BR" | "EUNE" | "EUW" | "JP" | "LAN" | "LAS" | "NA" | "OCE" | "PBE" | "RU" | "TR" | "KR";
        map: string;
        participants: Array<string>;
    };
    export type tournament_stub_v5_LobbyEventV5DTO = { timestamp: string; eventType: string; puuid: string };
    export type tournament_stub_v5_LobbyEventV5DTOWrapper = { eventList: Array<tournament_stub_v5_LobbyEventV5DTO> };
    export type tournament_stub_v5_ProviderRegistrationParametersV5 = {
        region: "BR" | "EUNE" | "EUW" | "JP" | "LAN" | "LAS" | "NA" | "OCE" | "PBE" | "RU" | "TR" | "KR";
        url: string;
    };
    export type tournament_stub_v5_TournamentRegistrationParametersV5 = {
        providerId: number;
        name?: string | undefined;
    };
    export type tournament_v5_TournamentCodeParametersV5 = {
        allowedParticipants?: Array<string> | undefined;
        metadata?: string | undefined;
        teamSize: number;
        pickType: "BLIND_PICK" | "DRAFT_MODE" | "ALL_RANDOM" | "TOURNAMENT_DRAFT";
        mapType: "SUMMONERS_RIFT" | "HOWLING_ABYSS";
        spectatorType: "NONE" | "LOBBYONLY" | "ALL";
        enoughPlayers: boolean;
    };
    export type tournament_v5_TournamentCodeV5DTO = {
        id: number;
        providerId: number;
        tournamentId: number;
        code: string;
        region:
            | "BR"
            | "EUNE"
            | "EUW"
            | "JP"
            | "LAN"
            | "LAS"
            | "NA"
            | "OCE"
            | "PBE"
            | "RU"
            | "TR"
            | "KR"
            | "PH"
            | "SG"
            | "TH"
            | "TW"
            | "VN";
        map: string;
        teamSize: number;
        spectators: string;
        pickType: string;
        lobbyName: string;
        password: string;
        metaData: string;
        participants: Array<string>;
    };
    export type tournament_v5_TournamentCodeUpdateParametersV5 = {
        allowedParticipants?: Array<string> | undefined;
        pickType: "BLIND_PICK" | "DRAFT_MODE" | "ALL_RANDOM" | "TOURNAMENT_DRAFT";
        mapType: "SUMMONERS_RIFT" | "HOWLING_ABYSS";
        spectatorType: "NONE" | "LOBBYONLY" | "ALL";
    };
    export type tournament_v5_TournamentTeamV5 = { puuid: string };
    export type tournament_v5_TournamentGamesV5 = {
        startTime: number;
        winningTeam: Array<tournament_v5_TournamentTeamV5>;
        losingTeam: Array<tournament_v5_TournamentTeamV5>;
        shortCode: string;
        metaData?: string | undefined;
        gameId: number;
        gameName: string;
        gameType: string;
        gameMap: number;
        gameMode: string;
        region: string;
    };
    export type tournament_v5_LobbyEventV5DTO = { timestamp: string; eventType: string; puuid: string };
    export type tournament_v5_LobbyEventV5DTOWrapper = { eventList: Array<tournament_v5_LobbyEventV5DTO> };
    export type tournament_v5_ProviderRegistrationParametersV5 = {
        region:
            | "BR"
            | "EUNE"
            | "EUW"
            | "JP"
            | "LAN"
            | "LAS"
            | "NA"
            | "OCE"
            | "PBE"
            | "RU"
            | "TR"
            | "KR"
            | "PH"
            | "SG"
            | "TH"
            | "TW"
            | "VN";
        url: string;
    };
    export type tournament_v5_TournamentRegistrationParametersV5 = { providerId: number; name?: string | undefined };
    export type val_console_match_v1_MatchInfoDto = {
        matchId: string;
        mapId: string;
        gameLengthMillis?: number | undefined;
        gameStartMillis: number;
        provisioningFlowId: string;
        isCompleted: boolean;
        customGameName: string;
        queueId: string;
        gameMode: string;
        isRanked: boolean;
        seasonId: string;
    };
    export type val_console_match_v1_AbilityCastsDto = {
        grenadeCasts: number;
        ability1Casts: number;
        ability2Casts: number;
        ultimateCasts: number;
    };
    export type val_console_match_v1_PlayerStatsDto = {
        score: number;
        roundsPlayed: number;
        kills: number;
        deaths: number;
        assists: number;
        playtimeMillis: number;
        abilityCasts?: val_console_match_v1_AbilityCastsDto | undefined;
    };
    export type val_console_match_v1_PlayerDto = {
        puuid: string;
        gameName: string;
        tagLine: string;
        teamId: string;
        partyId: string;
        characterId?: string | undefined;
        stats?: val_console_match_v1_PlayerStatsDto | undefined;
        competitiveTier: number;
        playerCard: string;
        playerTitle: string;
    };
    export type val_console_match_v1_CoachDto = { puuid: string; teamId: string };
    export type val_console_match_v1_TeamDto = {
        teamId: string;
        won: boolean;
        roundsPlayed: number;
        roundsWon: number;
        numPoints: number;
    };
    export type val_console_match_v1_LocationDto = { x: number; y: number };
    export type val_console_match_v1_PlayerLocationsDto = {
        puuid: string;
        viewRadians: number;
        location: val_console_match_v1_LocationDto;
    };
    export type val_console_match_v1_FinishingDamageDto = {
        damageType: string;
        damageItem: string;
        isSecondaryFireMode: boolean;
    };
    export type val_console_match_v1_KillDto = {
        timeSinceGameStartMillis: number;
        timeSinceRoundStartMillis: number;
        killer: string;
        victim: string;
        victimLocation: val_console_match_v1_LocationDto;
        assistants: Array<string>;
        playerLocations: Array<val_console_match_v1_PlayerLocationsDto>;
        finishingDamage: val_console_match_v1_FinishingDamageDto;
    };
    export type val_console_match_v1_DamageDto = {
        receiver: string;
        damage: number;
        legshots: number;
        bodyshots: number;
        headshots: number;
    };
    export type val_console_match_v1_EconomyDto = {
        loadoutValue: number;
        weapon: string;
        armor: string;
        remaining: number;
        spent: number;
    };
    export type val_console_match_v1_AbilityDto = Partial<{
        grenadeEffects: string;
        ability1Effects: string;
        ability2Effects: string;
        ultimateEffects: string;
    }>;
    export type val_console_match_v1_PlayerRoundStatsDto = {
        puuid: string;
        kills: Array<val_console_match_v1_KillDto>;
        damage: Array<val_console_match_v1_DamageDto>;
        score: number;
        economy: val_console_match_v1_EconomyDto;
        ability: val_console_match_v1_AbilityDto;
    };
    export type val_console_match_v1_RoundResultDto = {
        roundNum: number;
        roundResult: string;
        roundCeremony: string;
        winningTeam: string;
        bombPlanter?: string | undefined;
        bombDefuser?: string | undefined;
        plantRoundTime: number;
        plantPlayerLocations?: Array<val_console_match_v1_PlayerLocationsDto> | undefined;
        plantLocation: val_console_match_v1_LocationDto;
        plantSite: string;
        defuseRoundTime: number;
        defusePlayerLocations?: Array<val_console_match_v1_PlayerLocationsDto> | undefined;
        defuseLocation: val_console_match_v1_LocationDto;
        playerStats: Array<val_console_match_v1_PlayerRoundStatsDto>;
        roundResultCode: string;
    };
    export type val_console_match_v1_MatchDto = {
        matchInfo: val_console_match_v1_MatchInfoDto;
        players: Array<val_console_match_v1_PlayerDto>;
        coaches: Array<val_console_match_v1_CoachDto>;
        teams?: Array<val_console_match_v1_TeamDto> | undefined;
        roundResults?: Array<val_console_match_v1_RoundResultDto> | undefined;
    };
    export type val_console_match_v1_MatchlistEntryDto = {
        matchId: string;
        gameStartTimeMillis: number;
        queueId: string;
    };
    export type val_console_match_v1_MatchlistDto = {
        puuid: string;
        history: Array<val_console_match_v1_MatchlistEntryDto>;
    };
    export type val_console_match_v1_RecentMatchesDto = { currentTime: number; matchIds: Array<string> };
    export type val_console_ranked_v1_PlayerDto = {
        puuid?: string | undefined;
        gameName?: string | undefined;
        tagLine?: string | undefined;
        leaderboardRank: number;
        rankedRating: number;
        numberOfWins: number;
    };
    export type val_console_ranked_v1_TierDto = Partial<{}>;
    export type val_console_ranked_v1_LeaderboardDto = {
        actId: string;
        totalPlayers: number;
        query?: string | undefined;
        shard: string;
        players: Array<val_console_ranked_v1_PlayerDto>;
        tierDetails?: Array<val_console_ranked_v1_TierDto> | undefined;
    };
    export type val_content_v1_LocalizedNamesDto = {
        "ar-AE": string;
        "de-DE": string;
        "en-GB"?: string | undefined;
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
        "zh-CN": string;
        "zh-TW": string;
    };
    export type val_content_v1_ContentItemDto = {
        name: string;
        localizedNames?: val_content_v1_LocalizedNamesDto | undefined;
        id: string;
        assetName: string;
        assetPath?: string | undefined;
    };
    export type val_content_v1_ActDto = {
        name: string;
        localizedNames?: val_content_v1_LocalizedNamesDto | undefined;
        id: string;
        isActive: boolean;
        parentId?: string | undefined;
        type?: string | undefined;
    };
    export type val_content_v1_ContentDto = {
        version: string;
        characters: Array<val_content_v1_ContentItemDto>;
        maps: Array<val_content_v1_ContentItemDto>;
        chromas: Array<val_content_v1_ContentItemDto>;
        skins: Array<val_content_v1_ContentItemDto>;
        skinLevels: Array<val_content_v1_ContentItemDto>;
        equips: Array<val_content_v1_ContentItemDto>;
        gameModes: Array<val_content_v1_ContentItemDto>;
        sprays: Array<val_content_v1_ContentItemDto>;
        sprayLevels: Array<val_content_v1_ContentItemDto>;
        charms: Array<val_content_v1_ContentItemDto>;
        charmLevels: Array<val_content_v1_ContentItemDto>;
        playerCards: Array<val_content_v1_ContentItemDto>;
        playerTitles: Array<val_content_v1_ContentItemDto>;
        acts: Array<val_content_v1_ActDto>;
        ceremonies?: Array<val_content_v1_ContentItemDto> | undefined;
        totems?: Array<val_content_v1_ContentItemDto> | undefined;
    };
    export type val_match_v1_MatchInfoDto = {
        matchId: string;
        mapId: string;
        gameVersion: string;
        gameLengthMillis?: number | undefined;
        region: string;
        gameStartMillis: number;
        provisioningFlowId: string;
        isCompleted: boolean;
        customGameName: string;
        queueId: string;
        gameMode: string;
        isRanked: boolean;
        seasonId: string;
        premierMatchInfo: unknown;
    };
    export type val_match_v1_AbilityCastsDto = {
        grenadeCasts: number;
        ability1Casts: number;
        ability2Casts: number;
        ultimateCasts: number;
    };
    export type val_match_v1_PlayerStatsDto = {
        score: number;
        roundsPlayed: number;
        kills: number;
        deaths: number;
        assists: number;
        playtimeMillis: number;
        abilityCasts?: val_match_v1_AbilityCastsDto | undefined;
    };
    export type val_match_v1_PlayerDto = {
        puuid: string;
        gameName: string;
        tagLine: string;
        teamId: string;
        partyId: string;
        characterId?: string | undefined;
        stats?: val_match_v1_PlayerStatsDto | undefined;
        competitiveTier: number;
        isObserver: boolean;
        playerCard: string;
        playerTitle: string;
        accountLevel: number;
    };
    export type val_match_v1_CoachDto = { puuid: string; teamId: string };
    export type val_match_v1_TeamDto = {
        teamId: string;
        won: boolean;
        roundsPlayed: number;
        roundsWon: number;
        numPoints: number;
    };
    export type val_match_v1_LocationDto = { x: number; y: number };
    export type val_match_v1_PlayerLocationsDto = {
        puuid: string;
        viewRadians: number;
        location: val_match_v1_LocationDto;
    };
    export type val_match_v1_FinishingDamageDto = {
        damageType: string;
        damageItem: string;
        isSecondaryFireMode: boolean;
    };
    export type val_match_v1_KillDto = {
        timeSinceGameStartMillis: number;
        timeSinceRoundStartMillis: number;
        killer: string;
        victim: string;
        victimLocation: val_match_v1_LocationDto;
        assistants: Array<string>;
        playerLocations: Array<val_match_v1_PlayerLocationsDto>;
        finishingDamage: val_match_v1_FinishingDamageDto;
    };
    export type val_match_v1_DamageDto = {
        receiver: string;
        damage: number;
        legshots: number;
        bodyshots: number;
        headshots: number;
    };
    export type val_match_v1_EconomyDto = {
        loadoutValue: number;
        weapon: string;
        armor: string;
        remaining: number;
        spent: number;
    };
    export type val_match_v1_AbilityDto = Partial<{
        grenadeEffects: string;
        ability1Effects: string;
        ability2Effects: string;
        ultimateEffects: string;
    }>;
    export type val_match_v1_PlayerRoundStatsDto = {
        puuid: string;
        kills: Array<val_match_v1_KillDto>;
        damage: Array<val_match_v1_DamageDto>;
        score: number;
        economy: val_match_v1_EconomyDto;
        ability: val_match_v1_AbilityDto;
    };
    export type val_match_v1_RoundResultDto = {
        roundNum: number;
        roundResult: string;
        roundCeremony: string;
        winningTeam: string;
        winningTeamRole: string;
        bombPlanter?: string | undefined;
        bombDefuser?: string | undefined;
        plantRoundTime: number;
        plantPlayerLocations?: Array<val_match_v1_PlayerLocationsDto> | undefined;
        plantLocation: val_match_v1_LocationDto;
        plantSite: string;
        defuseRoundTime: number;
        defusePlayerLocations?: Array<val_match_v1_PlayerLocationsDto> | undefined;
        defuseLocation: val_match_v1_LocationDto;
        playerStats: Array<val_match_v1_PlayerRoundStatsDto>;
        roundResultCode: string;
    };
    export type val_match_v1_MatchDto = {
        matchInfo: val_match_v1_MatchInfoDto;
        players: Array<val_match_v1_PlayerDto>;
        coaches: Array<val_match_v1_CoachDto>;
        teams?: Array<val_match_v1_TeamDto> | undefined;
        roundResults?: Array<val_match_v1_RoundResultDto> | undefined;
    };
    export type val_match_v1_MatchlistEntryDto = { matchId: string; gameStartTimeMillis: number; queueId: string };
    export type val_match_v1_MatchlistDto = { puuid: string; history: Array<val_match_v1_MatchlistEntryDto> };
    export type val_match_v1_RecentMatchesDto = { currentTime: number; matchIds: Array<string> };
    export type val_ranked_v1_PlayerDto = {
        puuid?: string | undefined;
        gameName?: string | undefined;
        tagLine?: string | undefined;
        leaderboardRank: number;
        rankedRating: number;
        numberOfWins: number;
        competitiveTier?: number | undefined;
        prefix?: string | undefined;
        premierRosterType: string;
    };
    export type val_ranked_v1_TierDetailDto = {
        rankedRatingThreshold: number;
        startingPage: number;
        startingIndex: number;
    };
    export type val_ranked_v1_LeaderboardDto = {
        shard: string;
        actId: string;
        totalPlayers: number;
        players: Array<val_ranked_v1_PlayerDto>;
        immortalStartingPage?: number | undefined;
        immortalStartingIndex?: number | undefined;
        topTierRRThreshold?: number | undefined;
        tierDetails?: unknown | undefined;
        startIndex?: number | undefined;
        query?: string | undefined;
    };
    export type val_status_v1_ContentDto = { locale: string; content: string };
    export type val_status_v1_UpdateDto = {
        id: number;
        author: string;
        publish: boolean;
        publish_locations: Array<"riotclient" | "riotstatus" | "game">;
        translations: Array<val_status_v1_ContentDto>;
        created_at: string;
        updated_at: string;
    };
    export type val_status_v1_StatusDto = {
        id: number;
        maintenance_status: "scheduled" | "in_progress" | "complete";
        incident_severity: "info" | "warning" | "critical";
        titles: Array<val_status_v1_ContentDto>;
        updates: Array<val_status_v1_UpdateDto>;
        created_at: string;
        archive_at: string;
        updated_at: string;
        platforms: Array<"windows" | "macos" | "android" | "ios" | "ps4" | "xbone" | "switch">;
    };
    export type val_status_v1_PlatformDataDto = {
        id: string;
        name: string;
        locales: Array<string>;
        maintenances: Array<val_status_v1_StatusDto>;
        incidents: Array<val_status_v1_StatusDto>;
    };

    // </Schemas>
}

export namespace Endpoints {
    // <Endpoints>

    export type get_Account_v1_getByPuuid = {
        method: "GET";
        path: "/riot/account/v1/accounts/by-puuid/{puuid}";
        parameters: {
            path: { puuid: string };
        };
        response: Schemas.account_v1_AccountDto;
    };
    export type get_Account_v1_getByRiotId = {
        method: "GET";
        path: "/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}";
        parameters: {
            path: { tagLine: string; gameName: string };
        };
        response: Schemas.account_v1_AccountDto;
    };
    export type get_Account_v1_getByAccessToken = {
        method: "GET";
        path: "/riot/account/v1/accounts/me";
        parameters: never;
        response: Schemas.account_v1_AccountDto;
    };
    export type get_Account_v1_getActiveShard = {
        method: "GET";
        path: "/riot/account/v1/active-shards/by-game/{game}/by-puuid/{puuid}";
        parameters: {
            path: { game: "val" | "lor" | "2xko"; puuid: string };
        };
        response: Schemas.account_v1_ActiveShardDto;
    };
    export type get_Account_v1_getActiveRegion = {
        method: "GET";
        path: "/riot/account/v1/region/by-game/{game}/by-puuid/{puuid}";
        parameters: {
            path: { puuid: string; game: "lol" | "tft" };
        };
        response: Schemas.account_v1_AccountRegionDTO;
    };
    export type get_Champion_mastery_v4_getAllChampionMasteriesByPUUID = {
        method: "GET";
        path: "/lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}";
        parameters: {
            path: { encryptedPUUID: string };
        };
        response: Array<Schemas.champion_mastery_v4_ChampionMasteryDto>;
    };
    export type get_Champion_mastery_v4_getChampionMasteryByPUUID = {
        method: "GET";
        path: "/lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}/by-champion/{championId}";
        parameters: {
            path: { encryptedPUUID: string; championId: number };
        };
        response: Schemas.champion_mastery_v4_ChampionMasteryDto;
    };
    export type get_Champion_mastery_v4_getTopChampionMasteriesByPUUID = {
        method: "GET";
        path: "/lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}/top";
        parameters: {
            query: Partial<{ count: number }>;
            path: { encryptedPUUID: string };
        };
        response: Array<Schemas.champion_mastery_v4_ChampionMasteryDto>;
    };
    export type get_Champion_mastery_v4_getChampionMasteryScoreByPUUID = {
        method: "GET";
        path: "/lol/champion-mastery/v4/scores/by-puuid/{encryptedPUUID}";
        parameters: {
            path: { encryptedPUUID: string };
        };
        response: number;
    };
    export type get_Champion_v3_getChampionInfo = {
        method: "GET";
        path: "/lol/platform/v3/champion-rotations";
        parameters: never;
        response: Schemas.champion_v3_ChampionInfo;
    };
    export type get_Clash_v1_getPlayersByPUUID = {
        method: "GET";
        path: "/lol/clash/v1/players/by-puuid/{puuid}";
        parameters: {
            path: { puuid: string };
        };
        response: Array<Schemas.clash_v1_PlayerDto>;
    };
    export type get_Clash_v1_getTeamById = {
        method: "GET";
        path: "/lol/clash/v1/teams/{teamId}";
        parameters: {
            path: { teamId: string };
        };
        response: Schemas.clash_v1_TeamDto;
    };
    export type get_Clash_v1_getTournaments = {
        method: "GET";
        path: "/lol/clash/v1/tournaments";
        parameters: never;
        response: Array<Schemas.clash_v1_TournamentDto>;
    };
    export type get_Clash_v1_getTournamentByTeam = {
        method: "GET";
        path: "/lol/clash/v1/tournaments/by-team/{teamId}";
        parameters: {
            path: { teamId: string };
        };
        response: Schemas.clash_v1_TournamentDto;
    };
    export type get_Clash_v1_getTournamentById = {
        method: "GET";
        path: "/lol/clash/v1/tournaments/{tournamentId}";
        parameters: {
            path: { tournamentId: number };
        };
        response: Schemas.clash_v1_TournamentDto;
    };
    export type get_League_exp_v4_getLeagueEntries = {
        method: "GET";
        path: "/lol/league-exp/v4/entries/{queue}/{tier}/{division}";
        parameters: {
            query: Partial<{ page: number }>;
            path: {
                queue: "RANKED_SOLO_5x5" | "RANKED_TFT" | "RANKED_FLEX_SR" | "RANKED_FLEX_TT";
                tier:
                    | "CHALLENGER"
                    | "GRANDMASTER"
                    | "MASTER"
                    | "DIAMOND"
                    | "EMERALD"
                    | "PLATINUM"
                    | "GOLD"
                    | "SILVER"
                    | "BRONZE"
                    | "IRON";
                division: "I" | "II" | "III" | "IV";
            };
        };
        response: Array<Schemas.league_exp_v4_LeagueEntryDTO>;
    };
    export type get_League_v4_getChallengerLeague = {
        method: "GET";
        path: "/lol/league/v4/challengerleagues/by-queue/{queue}";
        parameters: {
            path: { queue: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | "RANKED_FLEX_TT" };
        };
        response: Schemas.league_v4_LeagueListDTO;
    };
    export type get_League_v4_getLeagueEntriesByPUUID = {
        method: "GET";
        path: "/lol/league/v4/entries/by-puuid/{encryptedPUUID}";
        parameters: {
            path: { encryptedPUUID: string };
        };
        response: Array<Schemas.league_v4_LeagueEntryDTO>;
    };
    export type get_League_v4_getLeagueEntries = {
        method: "GET";
        path: "/lol/league/v4/entries/{queue}/{tier}/{division}";
        parameters: {
            query: Partial<{ page: number }>;
            path: {
                division: "I" | "II" | "III" | "IV";
                tier: "DIAMOND" | "EMERALD" | "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "IRON";
                queue: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | "RANKED_FLEX_TT";
            };
        };
        response: Array<Schemas.league_v4_LeagueEntryDTO>;
    };
    export type get_League_v4_getGrandmasterLeague = {
        method: "GET";
        path: "/lol/league/v4/grandmasterleagues/by-queue/{queue}";
        parameters: {
            path: { queue: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | "RANKED_FLEX_TT" };
        };
        response: Schemas.league_v4_LeagueListDTO;
    };
    export type get_League_v4_getLeagueById = {
        method: "GET";
        path: "/lol/league/v4/leagues/{leagueId}";
        parameters: {
            path: { leagueId: string };
        };
        response: Schemas.league_v4_LeagueListDTO;
    };
    export type get_League_v4_getMasterLeague = {
        method: "GET";
        path: "/lol/league/v4/masterleagues/by-queue/{queue}";
        parameters: {
            path: { queue: "RANKED_SOLO_5x5" | "RANKED_FLEX_SR" | "RANKED_FLEX_TT" };
        };
        response: Schemas.league_v4_LeagueListDTO;
    };
    export type get_Lol_challenges_v1_getAllChallengeConfigs = {
        method: "GET";
        path: "/lol/challenges/v1/challenges/config";
        parameters: never;
        response: Array<Schemas.lol_challenges_v1_ChallengeConfigInfoDto>;
    };
    export type get_Lol_challenges_v1_getAllChallengePercentiles = {
        method: "GET";
        path: "/lol/challenges/v1/challenges/percentiles";
        parameters: never;
        response: unknown;
    };
    export type get_Lol_challenges_v1_getChallengeConfigs = {
        method: "GET";
        path: "/lol/challenges/v1/challenges/{challengeId}/config";
        parameters: {
            path: { challengeId: number };
        };
        response: Schemas.lol_challenges_v1_ChallengeConfigInfoDto;
    };
    export type get_Lol_challenges_v1_getChallengeLeaderboards = {
        method: "GET";
        path: "/lol/challenges/v1/challenges/{challengeId}/leaderboards/by-level/{level}";
        parameters: {
            query: Partial<{ limit: number }>;
            path: {
                level:
                    | "NONE"
                    | "IRON"
                    | "BRONZE"
                    | "SILVER"
                    | "GOLD"
                    | "PLATINUM"
                    | "DIAMOND"
                    | "MASTER"
                    | "GRANDMASTER"
                    | "CHALLENGER"
                    | "HIGHEST_NOT_LEADERBOARD_ONLY"
                    | "HIGHEST"
                    | "LOWEST";
                challengeId: number;
            };
        };
        response: Array<Schemas.lol_challenges_v1_ApexPlayerInfoDto>;
    };
    export type get_Lol_challenges_v1_getChallengePercentiles = {
        method: "GET";
        path: "/lol/challenges/v1/challenges/{challengeId}/percentiles";
        parameters: {
            path: { challengeId: number };
        };
        response: unknown;
    };
    export type get_Lol_challenges_v1_getPlayerData = {
        method: "GET";
        path: "/lol/challenges/v1/player-data/{puuid}";
        parameters: {
            path: { puuid: string };
        };
        response: Schemas.lol_challenges_v1_PlayerInfoDto;
    };
    export type get_Lol_rso_match_v1_getMatchIds = {
        method: "GET";
        path: "/lol/rso-match/v1/matches/ids";
        parameters: {
            query: Partial<{
                count: number;
                start: number;
                type: "ranked" | "normal" | "tourney" | "tutorial";
                queue: number;
                endTime: number;
                startTime: number;
            }>;
        };
        response: Array<string>;
    };
    export type get_Lol_rso_match_v1_getMatch = {
        method: "GET";
        path: "/lol/rso-match/v1/matches/{matchId}";
        parameters: {
            path: { matchId: string };
        };
        response: Schemas.match_v5_MatchDto;
    };
    export type get_Lol_rso_match_v1_getTimeline = {
        method: "GET";
        path: "/lol/rso-match/v1/matches/{matchId}/timeline";
        parameters: {
            path: { matchId: string };
        };
        response: Schemas.match_v5_TimelineDto;
    };
    export type get_Lol_status_v4_getPlatformData = {
        method: "GET";
        path: "/lol/status/v4/platform-data";
        parameters: never;
        response: Schemas.lol_status_v4_PlatformDataDto;
    };
    export type get_Lor_deck_v1_getDecks = {
        method: "GET";
        path: "/lor/deck/v1/decks/me";
        parameters: never;
        response: Array<Schemas.lor_deck_v1_DeckDto>;
    };
    export type post_Lor_deck_v1_createDeck = {
        method: "POST";
        path: "/lor/deck/v1/decks/me";
        parameters: {
            body: Schemas.lor_deck_v1_NewDeckDto;
        };
        response: string;
    };
    export type get_Lor_inventory_v1_getCards = {
        method: "GET";
        path: "/lor/inventory/v1/cards/me";
        parameters: never;
        response: Array<Schemas.lor_inventory_v1_CardDto>;
    };
    export type get_Lor_match_v1_getMatchIdsByPUUID = {
        method: "GET";
        path: "/lor/match/v1/matches/by-puuid/{puuid}/ids";
        parameters: {
            path: { puuid: string };
        };
        response: Array<string>;
    };
    export type get_Lor_match_v1_getMatch = {
        method: "GET";
        path: "/lor/match/v1/matches/{matchId}";
        parameters: {
            path: { matchId: string };
        };
        response: Schemas.lor_match_v1_MatchDto;
    };
    export type get_Lor_ranked_v1_getLeaderboards = {
        method: "GET";
        path: "/lor/ranked/v1/leaderboards";
        parameters: never;
        response: Schemas.lor_ranked_v1_LeaderboardDto;
    };
    export type get_Lor_status_v1_getPlatformData = {
        method: "GET";
        path: "/lor/status/v1/platform-data";
        parameters: never;
        response: Schemas.lor_status_v1_PlatformDataDto;
    };
    export type get_Match_v5_getMatchIdsByPUUID = {
        method: "GET";
        path: "/lol/match/v5/matches/by-puuid/{puuid}/ids";
        parameters: {
            query: Partial<{
                startTime: number;
                endTime: number;
                queue: number;
                type: "ranked" | "normal" | "tourney" | "tutorial";
                start: number;
                count: number;
            }>;
            path: { puuid: string };
        };
        response: Array<string>;
    };
    export type get_Match_v5_getReplay = {
        method: "GET";
        path: "/lol/match/v5/matches/by-puuid/{puuid}/replays";
        parameters: {
            path: { puuid: string };
        };
        response: Schemas.match_v5_ReplayDTO;
    };
    export type get_Match_v5_getMatch = {
        method: "GET";
        path: "/lol/match/v5/matches/{matchId}";
        parameters: {
            path: { matchId: string };
        };
        response: Schemas.match_v5_MatchDto;
    };
    export type get_Match_v5_getTimeline = {
        method: "GET";
        path: "/lol/match/v5/matches/{matchId}/timeline";
        parameters: {
            path: { matchId: string };
        };
        response: Schemas.match_v5_TimelineDto;
    };
    export type get_Riftbound_content_v1_getContent = {
        method: "GET";
        path: "/riftbound/content/v1/contents";
        parameters: {
            query: Partial<{ locale: string }>;
        };
        response: Schemas.riftbound_content_v1_RiftboundContentDTO;
    };
    export type get_Spectator_tft_v5_getCurrentGameInfoByPuuid = {
        method: "GET";
        path: "/lol/spectator/tft/v5/active-games/by-puuid/{encryptedPUUID}";
        parameters: {
            path: { encryptedPUUID: string };
        };
        response: Schemas.spectator_tft_v5_CurrentGameInfo;
    };
    export type get_Spectator_v5_getCurrentGameInfoByPuuid = {
        method: "GET";
        path: "/lol/spectator/v5/active-games/by-summoner/{encryptedPUUID}";
        parameters: {
            path: { encryptedPUUID: string };
        };
        response: Schemas.spectator_v5_CurrentGameInfo;
    };
    export type get_Summoner_v4_getByPUUID = {
        method: "GET";
        path: "/lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}";
        parameters: {
            path: { encryptedPUUID: string };
        };
        response: Schemas.summoner_v4_SummonerDTO;
    };
    export type get_Summoner_v4_getByAccessToken = {
        method: "GET";
        path: "/lol/summoner/v4/summoners/me";
        parameters: never;
        response: Schemas.summoner_v4_SummonerDTO;
    };
    export type get_Tft_league_v1_getLeagueEntriesByPUUID = {
        method: "GET";
        path: "/tft/league/v1/by-puuid/{puuid}";
        parameters: {
            path: { puuid: string };
        };
        response: Array<Schemas.tft_league_v1_LeagueEntryDTO>;
    };
    export type get_Tft_league_v1_getChallengerLeague = {
        method: "GET";
        path: "/tft/league/v1/challenger";
        parameters: {
            query: Partial<{ queue: "RANKED_TFT" | "RANKED_TFT_DOUBLE_UP" }>;
        };
        response: Schemas.tft_league_v1_LeagueListDTO;
    };
    export type get_Tft_league_v1_getLeagueEntries = {
        method: "GET";
        path: "/tft/league/v1/entries/{tier}/{division}";
        parameters: {
            query: Partial<{ queue: "RANKED_TFT" | "RANKED_TFT_DOUBLE_UP"; page: number }>;
            path: {
                tier: "DIAMOND" | "EMERALD" | "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "IRON";
                division: "I" | "II" | "III" | "IV";
            };
        };
        response: Array<Schemas.tft_league_v1_LeagueEntryDTO>;
    };
    export type get_Tft_league_v1_getGrandmasterLeague = {
        method: "GET";
        path: "/tft/league/v1/grandmaster";
        parameters: {
            query: Partial<{ queue: "RANKED_TFT" | "RANKED_TFT_DOUBLE_UP" }>;
        };
        response: Schemas.tft_league_v1_LeagueListDTO;
    };
    export type get_Tft_league_v1_getLeagueById = {
        method: "GET";
        path: "/tft/league/v1/leagues/{leagueId}";
        parameters: {
            path: { leagueId: string };
        };
        response: Schemas.tft_league_v1_LeagueListDTO;
    };
    export type get_Tft_league_v1_getMasterLeague = {
        method: "GET";
        path: "/tft/league/v1/master";
        parameters: {
            query: Partial<{ queue: "RANKED_TFT" | "RANKED_TFT_DOUBLE_UP" }>;
        };
        response: Schemas.tft_league_v1_LeagueListDTO;
    };
    export type get_Tft_league_v1_getTopRatedLadder = {
        method: "GET";
        path: "/tft/league/v1/rated-ladders/{queue}/top";
        parameters: {
            path: { queue: "RANKED_TFT_TURBO" };
        };
        response: Array<Schemas.tft_league_v1_TopRatedLadderEntryDto>;
    };
    export type get_Tft_match_v1_getMatchIdsByPUUID = {
        method: "GET";
        path: "/tft/match/v1/matches/by-puuid/{puuid}/ids";
        parameters: {
            query: Partial<{ start: number; endTime: number; startTime: number; count: number }>;
            path: { puuid: string };
        };
        response: Array<string>;
    };
    export type get_Tft_match_v1_getMatch = {
        method: "GET";
        path: "/tft/match/v1/matches/{matchId}";
        parameters: {
            path: { matchId: string };
        };
        response: Schemas.tft_match_v1_MatchDto;
    };
    export type get_Tft_status_v1_getPlatformData = {
        method: "GET";
        path: "/tft/status/v1/platform-data";
        parameters: never;
        response: Schemas.tft_status_v1_PlatformDataDto;
    };
    export type get_Tft_summoner_v1_getByPUUID = {
        method: "GET";
        path: "/tft/summoner/v1/summoners/by-puuid/{encryptedPUUID}";
        parameters: {
            path: { encryptedPUUID: string };
        };
        response: Schemas.tft_summoner_v1_SummonerDTO;
    };
    export type get_Tft_summoner_v1_getByAccessToken = {
        method: "GET";
        path: "/tft/summoner/v1/summoners/me";
        parameters: never;
        response: Schemas.tft_summoner_v1_SummonerDTO;
    };
    export type post_Tournament_stub_v5_createTournamentCode = {
        method: "POST";
        path: "/lol/tournament-stub/v5/codes";
        parameters: {
            query: { count: number; tournamentId: number };

            body: Schemas.tournament_stub_v5_TournamentCodeParametersV5;
        };
        response: Array<string>;
    };
    export type get_Tournament_stub_v5_getTournamentCode = {
        method: "GET";
        path: "/lol/tournament-stub/v5/codes/{tournamentCode}";
        parameters: {
            path: { tournamentCode: string };
        };
        response: Schemas.tournament_stub_v5_TournamentCodeV5DTO;
    };
    export type get_Tournament_stub_v5_getLobbyEventsByCode = {
        method: "GET";
        path: "/lol/tournament-stub/v5/lobby-events/by-code/{tournamentCode}";
        parameters: {
            path: { tournamentCode: string };
        };
        response: Schemas.tournament_stub_v5_LobbyEventV5DTOWrapper;
    };
    export type post_Tournament_stub_v5_registerProviderData = {
        method: "POST";
        path: "/lol/tournament-stub/v5/providers";
        parameters: {
            body: Schemas.tournament_stub_v5_ProviderRegistrationParametersV5;
        };
        response: number;
    };
    export type post_Tournament_stub_v5_registerTournament = {
        method: "POST";
        path: "/lol/tournament-stub/v5/tournaments";
        parameters: {
            body: Schemas.tournament_stub_v5_TournamentRegistrationParametersV5;
        };
        response: number;
    };
    export type post_Tournament_v5_createTournamentCode = {
        method: "POST";
        path: "/lol/tournament/v5/codes";
        parameters: {
            query: { tournamentId: number; count: number };

            body: Schemas.tournament_v5_TournamentCodeParametersV5;
        };
        response: Array<string>;
    };
    export type get_Tournament_v5_getTournamentCode = {
        method: "GET";
        path: "/lol/tournament/v5/codes/{tournamentCode}";
        parameters: {
            path: { tournamentCode: string };
        };
        response: Schemas.tournament_v5_TournamentCodeV5DTO;
    };
    export type put_Tournament_v5_updateCode = {
        method: "PUT";
        path: "/lol/tournament/v5/codes/{tournamentCode}";
        parameters: {
            path: { tournamentCode: string };

            body: Schemas.tournament_v5_TournamentCodeUpdateParametersV5;
        };
        response: unknown;
    };
    export type get_Tournament_v5_getGames = {
        method: "GET";
        path: "/lol/tournament/v5/games/by-code/{tournamentCode}";
        parameters: {
            path: { tournamentCode: string };
        };
        response: Array<Schemas.tournament_v5_TournamentGamesV5>;
    };
    export type get_Tournament_v5_getLobbyEventsByCode = {
        method: "GET";
        path: "/lol/tournament/v5/lobby-events/by-code/{tournamentCode}";
        parameters: {
            path: { tournamentCode: string };
        };
        response: Schemas.tournament_v5_LobbyEventV5DTOWrapper;
    };
    export type post_Tournament_v5_registerProviderData = {
        method: "POST";
        path: "/lol/tournament/v5/providers";
        parameters: {
            body: Schemas.tournament_v5_ProviderRegistrationParametersV5;
        };
        response: number;
    };
    export type post_Tournament_v5_registerTournament = {
        method: "POST";
        path: "/lol/tournament/v5/tournaments";
        parameters: {
            body: Schemas.tournament_v5_TournamentRegistrationParametersV5;
        };
        response: number;
    };
    export type get_Val_console_match_v1_getMatch = {
        method: "GET";
        path: "/val/match/console/v1/matches/{matchId}";
        parameters: {
            path: { matchId: string };
        };
        response: Schemas.val_console_match_v1_MatchDto;
    };
    export type get_Val_console_match_v1_getMatchlist = {
        method: "GET";
        path: "/val/match/console/v1/matchlists/by-puuid/{puuid}";
        parameters: {
            query: { platformType: "playstation" | "xbox" };
            path: { puuid: string };
        };
        response: Schemas.val_console_match_v1_MatchlistDto;
    };
    export type get_Val_console_match_v1_getRecent = {
        method: "GET";
        path: "/val/match/console/v1/recent-matches/by-queue/{queue}";
        parameters: {
            path: {
                queue:
                    | "console_unrated"
                    | "console_swiftplay"
                    | "console_hurm"
                    | "console_deathmatch"
                    | "console_competitive"
                    | "console_skirmish2v2"
                    | "console_skirmishascension1v1"
                    | "console_skirmishascension2v2";
            };
        };
        response: Schemas.val_console_match_v1_RecentMatchesDto;
    };
    export type get_Val_console_ranked_v1_getLeaderboard = {
        method: "GET";
        path: "/val/console/ranked/v1/leaderboards/by-act/{actId}";
        parameters: {
            query: { platformType: "playstation" | "xbox"; startIndex: number; size: number };
            path: { actId: string };
        };
        response: Schemas.val_console_ranked_v1_LeaderboardDto;
    };
    export type get_Val_content_v1_getContent = {
        method: "GET";
        path: "/val/content/v1/contents";
        parameters: {
            query: Partial<{ locale: string }>;
        };
        response: Schemas.val_content_v1_ContentDto;
    };
    export type get_Val_match_v1_getMatch = {
        method: "GET";
        path: "/val/match/v1/matches/{matchId}";
        parameters: {
            path: { matchId: string };
        };
        response: Schemas.val_match_v1_MatchDto;
    };
    export type get_Val_match_v1_getMatchlist = {
        method: "GET";
        path: "/val/match/v1/matchlists/by-puuid/{puuid}";
        parameters: {
            path: { puuid: string };
        };
        response: Schemas.val_match_v1_MatchlistDto;
    };
    export type get_Val_match_v1_getRecent = {
        method: "GET";
        path: "/val/match/v1/recent-matches/by-queue/{queue}";
        parameters: {
            path: {
                queue:
                    | "competitive"
                    | "unrated"
                    | "spikerush"
                    | "tournamentmode"
                    | "deathmatch"
                    | "onefa"
                    | "ggteam"
                    | "hurm"
                    | "swiftplay"
                    | "skirmish2v2"
                    | "skirmishascension1v1"
                    | "skirmishascension2v2";
            };
        };
        response: Schemas.val_match_v1_RecentMatchesDto;
    };
    export type get_Val_ranked_v1_getLeaderboard = {
        method: "GET";
        path: "/val/ranked/v1/leaderboards/by-act/{actId}";
        parameters: {
            query: Partial<{ size: number; startIndex: number }>;
            path: { actId: string };
        };
        response: Schemas.val_ranked_v1_LeaderboardDto;
    };
    export type get_Val_status_v1_getPlatformData = {
        method: "GET";
        path: "/val/status/v1/platform-data";
        parameters: never;
        response: Schemas.val_status_v1_PlatformDataDto;
    };

    // </Endpoints>
}

// <EndpointByMethod>
export type EndpointByMethod = {
    get: {
        "/riot/account/v1/accounts/by-puuid/{puuid}": Endpoints.get_Account_v1_getByPuuid;
        "/riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}": Endpoints.get_Account_v1_getByRiotId;
        "/riot/account/v1/accounts/me": Endpoints.get_Account_v1_getByAccessToken;
        "/riot/account/v1/active-shards/by-game/{game}/by-puuid/{puuid}": Endpoints.get_Account_v1_getActiveShard;
        "/riot/account/v1/region/by-game/{game}/by-puuid/{puuid}": Endpoints.get_Account_v1_getActiveRegion;
        "/lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}": Endpoints.get_Champion_mastery_v4_getAllChampionMasteriesByPUUID;
        "/lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}/by-champion/{championId}": Endpoints.get_Champion_mastery_v4_getChampionMasteryByPUUID;
        "/lol/champion-mastery/v4/champion-masteries/by-puuid/{encryptedPUUID}/top": Endpoints.get_Champion_mastery_v4_getTopChampionMasteriesByPUUID;
        "/lol/champion-mastery/v4/scores/by-puuid/{encryptedPUUID}": Endpoints.get_Champion_mastery_v4_getChampionMasteryScoreByPUUID;
        "/lol/platform/v3/champion-rotations": Endpoints.get_Champion_v3_getChampionInfo;
        "/lol/clash/v1/players/by-puuid/{puuid}": Endpoints.get_Clash_v1_getPlayersByPUUID;
        "/lol/clash/v1/teams/{teamId}": Endpoints.get_Clash_v1_getTeamById;
        "/lol/clash/v1/tournaments": Endpoints.get_Clash_v1_getTournaments;
        "/lol/clash/v1/tournaments/by-team/{teamId}": Endpoints.get_Clash_v1_getTournamentByTeam;
        "/lol/clash/v1/tournaments/{tournamentId}": Endpoints.get_Clash_v1_getTournamentById;
        "/lol/league-exp/v4/entries/{queue}/{tier}/{division}": Endpoints.get_League_exp_v4_getLeagueEntries;
        "/lol/league/v4/challengerleagues/by-queue/{queue}": Endpoints.get_League_v4_getChallengerLeague;
        "/lol/league/v4/entries/by-puuid/{encryptedPUUID}": Endpoints.get_League_v4_getLeagueEntriesByPUUID;
        "/lol/league/v4/entries/{queue}/{tier}/{division}": Endpoints.get_League_v4_getLeagueEntries;
        "/lol/league/v4/grandmasterleagues/by-queue/{queue}": Endpoints.get_League_v4_getGrandmasterLeague;
        "/lol/league/v4/leagues/{leagueId}": Endpoints.get_League_v4_getLeagueById;
        "/lol/league/v4/masterleagues/by-queue/{queue}": Endpoints.get_League_v4_getMasterLeague;
        "/lol/challenges/v1/challenges/config": Endpoints.get_Lol_challenges_v1_getAllChallengeConfigs;
        "/lol/challenges/v1/challenges/percentiles": Endpoints.get_Lol_challenges_v1_getAllChallengePercentiles;
        "/lol/challenges/v1/challenges/{challengeId}/config": Endpoints.get_Lol_challenges_v1_getChallengeConfigs;
        "/lol/challenges/v1/challenges/{challengeId}/leaderboards/by-level/{level}": Endpoints.get_Lol_challenges_v1_getChallengeLeaderboards;
        "/lol/challenges/v1/challenges/{challengeId}/percentiles": Endpoints.get_Lol_challenges_v1_getChallengePercentiles;
        "/lol/challenges/v1/player-data/{puuid}": Endpoints.get_Lol_challenges_v1_getPlayerData;
        "/lol/rso-match/v1/matches/ids": Endpoints.get_Lol_rso_match_v1_getMatchIds;
        "/lol/rso-match/v1/matches/{matchId}": Endpoints.get_Lol_rso_match_v1_getMatch;
        "/lol/rso-match/v1/matches/{matchId}/timeline": Endpoints.get_Lol_rso_match_v1_getTimeline;
        "/lol/status/v4/platform-data": Endpoints.get_Lol_status_v4_getPlatformData;
        "/lor/deck/v1/decks/me": Endpoints.get_Lor_deck_v1_getDecks;
        "/lor/inventory/v1/cards/me": Endpoints.get_Lor_inventory_v1_getCards;
        "/lor/match/v1/matches/by-puuid/{puuid}/ids": Endpoints.get_Lor_match_v1_getMatchIdsByPUUID;
        "/lor/match/v1/matches/{matchId}": Endpoints.get_Lor_match_v1_getMatch;
        "/lor/ranked/v1/leaderboards": Endpoints.get_Lor_ranked_v1_getLeaderboards;
        "/lor/status/v1/platform-data": Endpoints.get_Lor_status_v1_getPlatformData;
        "/lol/match/v5/matches/by-puuid/{puuid}/ids": Endpoints.get_Match_v5_getMatchIdsByPUUID;
        "/lol/match/v5/matches/by-puuid/{puuid}/replays": Endpoints.get_Match_v5_getReplay;
        "/lol/match/v5/matches/{matchId}": Endpoints.get_Match_v5_getMatch;
        "/lol/match/v5/matches/{matchId}/timeline": Endpoints.get_Match_v5_getTimeline;
        "/riftbound/content/v1/contents": Endpoints.get_Riftbound_content_v1_getContent;
        "/lol/spectator/tft/v5/active-games/by-puuid/{encryptedPUUID}": Endpoints.get_Spectator_tft_v5_getCurrentGameInfoByPuuid;
        "/lol/spectator/v5/active-games/by-summoner/{encryptedPUUID}": Endpoints.get_Spectator_v5_getCurrentGameInfoByPuuid;
        "/lol/summoner/v4/summoners/by-puuid/{encryptedPUUID}": Endpoints.get_Summoner_v4_getByPUUID;
        "/lol/summoner/v4/summoners/me": Endpoints.get_Summoner_v4_getByAccessToken;
        "/tft/league/v1/by-puuid/{puuid}": Endpoints.get_Tft_league_v1_getLeagueEntriesByPUUID;
        "/tft/league/v1/challenger": Endpoints.get_Tft_league_v1_getChallengerLeague;
        "/tft/league/v1/entries/{tier}/{division}": Endpoints.get_Tft_league_v1_getLeagueEntries;
        "/tft/league/v1/grandmaster": Endpoints.get_Tft_league_v1_getGrandmasterLeague;
        "/tft/league/v1/leagues/{leagueId}": Endpoints.get_Tft_league_v1_getLeagueById;
        "/tft/league/v1/master": Endpoints.get_Tft_league_v1_getMasterLeague;
        "/tft/league/v1/rated-ladders/{queue}/top": Endpoints.get_Tft_league_v1_getTopRatedLadder;
        "/tft/match/v1/matches/by-puuid/{puuid}/ids": Endpoints.get_Tft_match_v1_getMatchIdsByPUUID;
        "/tft/match/v1/matches/{matchId}": Endpoints.get_Tft_match_v1_getMatch;
        "/tft/status/v1/platform-data": Endpoints.get_Tft_status_v1_getPlatformData;
        "/tft/summoner/v1/summoners/by-puuid/{encryptedPUUID}": Endpoints.get_Tft_summoner_v1_getByPUUID;
        "/tft/summoner/v1/summoners/me": Endpoints.get_Tft_summoner_v1_getByAccessToken;
        "/lol/tournament-stub/v5/codes/{tournamentCode}": Endpoints.get_Tournament_stub_v5_getTournamentCode;
        "/lol/tournament-stub/v5/lobby-events/by-code/{tournamentCode}": Endpoints.get_Tournament_stub_v5_getLobbyEventsByCode;
        "/lol/tournament/v5/codes/{tournamentCode}": Endpoints.get_Tournament_v5_getTournamentCode;
        "/lol/tournament/v5/games/by-code/{tournamentCode}": Endpoints.get_Tournament_v5_getGames;
        "/lol/tournament/v5/lobby-events/by-code/{tournamentCode}": Endpoints.get_Tournament_v5_getLobbyEventsByCode;
        "/val/match/console/v1/matches/{matchId}": Endpoints.get_Val_console_match_v1_getMatch;
        "/val/match/console/v1/matchlists/by-puuid/{puuid}": Endpoints.get_Val_console_match_v1_getMatchlist;
        "/val/match/console/v1/recent-matches/by-queue/{queue}": Endpoints.get_Val_console_match_v1_getRecent;
        "/val/console/ranked/v1/leaderboards/by-act/{actId}": Endpoints.get_Val_console_ranked_v1_getLeaderboard;
        "/val/content/v1/contents": Endpoints.get_Val_content_v1_getContent;
        "/val/match/v1/matches/{matchId}": Endpoints.get_Val_match_v1_getMatch;
        "/val/match/v1/matchlists/by-puuid/{puuid}": Endpoints.get_Val_match_v1_getMatchlist;
        "/val/match/v1/recent-matches/by-queue/{queue}": Endpoints.get_Val_match_v1_getRecent;
        "/val/ranked/v1/leaderboards/by-act/{actId}": Endpoints.get_Val_ranked_v1_getLeaderboard;
        "/val/status/v1/platform-data": Endpoints.get_Val_status_v1_getPlatformData;
    };
    post: {
        "/lor/deck/v1/decks/me": Endpoints.post_Lor_deck_v1_createDeck;
        "/lol/tournament-stub/v5/codes": Endpoints.post_Tournament_stub_v5_createTournamentCode;
        "/lol/tournament-stub/v5/providers": Endpoints.post_Tournament_stub_v5_registerProviderData;
        "/lol/tournament-stub/v5/tournaments": Endpoints.post_Tournament_stub_v5_registerTournament;
        "/lol/tournament/v5/codes": Endpoints.post_Tournament_v5_createTournamentCode;
        "/lol/tournament/v5/providers": Endpoints.post_Tournament_v5_registerProviderData;
        "/lol/tournament/v5/tournaments": Endpoints.post_Tournament_v5_registerTournament;
    };
    put: {
        "/lol/tournament/v5/codes/{tournamentCode}": Endpoints.put_Tournament_v5_updateCode;
    };
};

// </EndpointByMethod>

// <EndpointByMethod.Shorthands>
export type GetEndpoints = EndpointByMethod["get"];
export type PostEndpoints = EndpointByMethod["post"];
export type PutEndpoints = EndpointByMethod["put"];
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
    parameters?: EndpointParameters | undefined
) => Promise<Endpoint["response"]>;

type RequiredKeys<T> = {
    [P in keyof T]-?: undefined extends T[P] ? never : P;
}[keyof T];

type MaybeOptionalArg<T> = RequiredKeys<T> extends never ? [config?: T] : [config: T];

// </ApiClientTypes>

// <ApiClient>
export class RiotApiClient {
    baseUrl: string = "";
    fetcher: Fetcher;

    constructor(fetcher: Fetcher) {
        this.fetcher = fetcher;
    }

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
        return this.fetcher("post", this.baseUrl + path, params[0]) as Promise<TEndpoint["response"]>;
    }
    // </ApiClient.post>

    // <ApiClient.put>
    put<Path extends keyof PutEndpoints, TEndpoint extends PutEndpoints[Path]>(
        path: Path,
        ...params: MaybeOptionalArg<TEndpoint["parameters"]>
    ): Promise<TEndpoint["response"]> {
        return this.fetcher("put", this.baseUrl + path, params[0]);
    }
    // </ApiClient.put>
}

export function createApiClient(fetcher: Fetcher, baseUrl?: string) {
    return new RiotApiClient(fetcher).setBaseUrl(baseUrl ?? "");
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
