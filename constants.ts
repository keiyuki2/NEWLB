

import { TierLevel, Badge, Player, Clan, WorldRecord, WorldRecordType, SiteSettings, Submission, SubmissionStatus, SubmissionData, ClanApplicationData, RecordVerificationData, StatUpdateProofData, BadgeCategory, UsernameColorTag, Message, Conversation, PlayerStats, LeaderboardCategory, SpeedSubCategory, EconomySubCategory, CosmeticsSubCategory, Region, CollectionRank, LeaderboardWeights } from './types';

export const TIER_STYLES: Record<TierLevel, { name: string; badgeClass: string; cardClass: string; iconClass: string, glowClass?: string }> = {
  [TierLevel.T1]: { name: "Tier 1 - Apex Sovereign", badgeClass: "bg-gradient-to-br from-tier1 via-amber-400 to-yellow-600 text-black font-bold border-2 border-yellow-700 shadow-md", cardClass: "border-tier1", iconClass: "fas fa-chess-king text-black", glowClass: "shadow-glow-tier1" },
  [TierLevel.T2]: { name: "Tier 2 - Diamond Vanguard", badgeClass: "bg-gradient-to-br from-tier2 via-slate-300 to-gray-500 text-gray-900 font-semibold border-2 border-gray-600 shadow-md", cardClass: "border-tier2", iconClass: "fas fa-chess-queen text-gray-800", glowClass: "shadow-glow-tier2" },
  [TierLevel.T3]: { name: "Tier 3 - Bronze Warlord", badgeClass: "bg-gradient-to-br from-tier3 via-orange-500 to-yellow-700 text-white font-medium border-2 border-orange-700 shadow-md", cardClass: "border-tier3", iconClass: "fas fa-chess-knight text-white", glowClass: "shadow-glow-tier3" },
  [TierLevel.T4]: { name: "Tier 4 - Steel Legionnaire", badgeClass: "bg-gradient-to-br from-tier4 to-slate-500 text-white border-slate-600", cardClass: "border-tier4", iconClass: "fas fa-chess-rook text-slate-300" },
  [TierLevel.T5]: { name: "Tier 5 - Iron Aspirant", badgeClass: "bg-gradient-to-br from-tier5 to-stone-600 text-white border-stone-700", cardClass: "border-tier5", iconClass: "fas fa-chess-pawn text-stone-300" },
};

export const USERNAME_TAG_EFFECTS: { name: string; cssClass: string; description: string }[] = [
    { name: "None", cssClass: "", description: "No special effect." },
    { name: "Pulse", cssClass: "animate-pulse", description: "Gentle pulsing effect." },
    { name: "Shimmer", cssClass: "animate-pulse-fast", description: "Fast shimmering/pulsing effect." },
    { name: "Glow", cssClass: "text-shadow-glow", description: "Subtle text glow." }, 
];

export const MOCK_USERNAME_COLOR_TAGS: UsernameColorTag[] = [
    { id: "uct_yt_verified", name: "YouTube Verified", cssClasses: ['bg-clip-text', 'text-transparent', 'bg-gradient-to-r', 'from-red-500', 'via-red-400', 'to-white'], iconClass: "fab fa-youtube", description: "Red & White Gradient for YouTube Creators" },
    { id: "uct_tiktok_verified", name: "TikTok Verified", cssClasses: ['bg-clip-text', 'text-transparent', 'bg-gradient-to-r', 'from-blue-400', 'via-pink-400', 'to-sky-300'], effectClass: "animate-pulse-fast", iconClass: "fab fa-tiktok", description: "Blue & Pink Shimmer for TikTok Creators" },
    { id: "uct_admin_glow", name: "Admin Glow", cssClasses: ['text-red-500'], effectClass: "text-shadow-glow", iconClass: "fas fa-shield-alt", description: "Glowing Red for Admins" },
];

export const INITIAL_BADGES: Badge[] = [
  { id: "beta_tester", name: "Beta Tester", description: "Played during early access", iconClass: "fas fa-star", colorClass: "text-yellow-400", unlockCriteria: "Participated in the game's early access phase.", value: 400, category: "Event" },
  { id: "verified_yt", name: "Verified YouTuber", description: "10K+ subs, approved", iconClass: "fab fa-youtube", colorClass: "text-red-500", unlockCriteria: "Official content creator with 10K+ YouTube subscribers, approved by admin.", value: 1000, category: "Verification", colorTagId: "uct_yt_verified" },
  { id: "verified_tiktok", name: "Verified TikToker", description: "50K+ followers, approved", iconClass: "fab fa-tiktok", colorClass: "text-pink-500", unlockCriteria: "Official content creator with 50K+ TikTok followers, approved by admin.", value: 1000, category: "Verification", colorTagId: "uct_tiktok_verified" },
  { id: "game_admin", name: "Game Admin (Owner)", description: "Assigned by staff", iconClass: "fas fa-crown", colorClass: "text-red-600", unlockCriteria: "Official game administrator/owner, assigned by staff.", value: 4000, category: "Role", colorTagId: "uct_admin_glow" },
  { id: "moderator", name: "Moderator", description: "Assigned by staff", iconClass: "fas fa-shield-alt", colorClass: "text-purple-500", unlockCriteria: "Community Moderator, assigned by staff.", value: 1500, category: "Role" },
  { id: "clan_founder", name: "Clan Founder", description: "Owns a clan with 10+ members", iconClass: "fas fa-crown", colorClass: "text-purple-400", unlockCriteria: "Founded a clan that has reached 10 or more verified members.", value: 250, category: "Achievement" },
  { id: "economy_mogul", name: "Economy Mogul", description: "Earned 1M total money", iconClass: "fas fa-sack-dollar", colorClass: "text-green-400", unlockCriteria: "Accumulate 1,000,000 in-game money.", value: 500, category: "Achievement" },
  { id: "speed_demon", name: "Speed Demon", description: "Held a #1 Speed Record", iconClass: "fas fa-bolt", colorClass: "text-yellow-300", unlockCriteria: "Hold a #1 world record for speed in any official category.", value: 1200, category: "Achievement" },
  { id: "event_winner_s1", name: "Season 1 Champion", description: "Winner of Season 1 tourney", iconClass: "fas fa-trophy", colorClass: "text-amber-500", unlockCriteria: "Achieved 1st place in the Season 1 official tournament.", value: 2000, category: "Event", usernameColorUnlock: { textClasses: ['text-amber-400', 'font-black'], description: "Bold Amber Username" } },
  { id: "collector_adept", name: "Adept Collector", description: "Owns 10+ unusuals", iconClass: "fas fa-gem", colorClass: "text-indigo-400", unlockCriteria: "Own at least 10 different Unusual cosmetic items.", value: 300, category: "Achievement" },
];

export const COLLECTION_RANKS: CollectionRank[] = [
  { id: "cr_bronze", name: "Bronze", pointsRequired: 0, description: "Everyone starts here.", imageUrl: "https://media.discordapp.net/attachments/1332299182626574356/1379761738936881222/bronze.png?ex=68416ac1&is=68401941&hm=a85fe6be0207cdd11aeadb5c5fde4c89572261515d30f1613ae1ba9f6cc98ec9&=&format=webp&quality=lossless" },
  { id: "cr_silver", name: "Silver", pointsRequired: 2000, description: "Got a few common badges.", imageUrl: "https://media.discordapp.net/attachments/1332299182626574356/1379761740509872128/silver.png?ex=68416ac1&is=68401941&hm=6cf44ecb9d5bc343a4be9025f9b8300113ac6b831b947c3fc17d01d209820be5&=&format=webp&quality=lossless" },
  { id: "cr_gold", name: "Gold", pointsRequired: 5000, description: "Dedicated collector.", imageUrl: "https://media.discordapp.net/attachments/1332299182626574356/1379761739624616006/gold.png?ex=68416ac1&is=68401941&hm=cfa8dabe5d238c195b2f7c05bac15e704f312784e7477b4a19e7b47d50b8f6b0&=&format=webp&quality=lossless" },
  { id: "cr_platinum", name: "Platinum", pointsRequired: 10000, description: "Has many epic/rare badges.", imageUrl: "https://media.discordapp.net/attachments/1332299182626574356/1379761739972874340/platinum.png?ex=68416ac1&is=68401941&hm=898821b97bd4a5d80ed45309b18455062336c8ca3e9d3a99bfb8d6cc6411cd89&=&format=webp&quality=lossless" },
  { id: "cr_diamond", name: "Diamond", pointsRequired: 15000, description: "Elite badge hunter.", imageUrl: "https://media.discordapp.net/attachments/1332299182626574356/1379761739297722389/diamond.png?ex=68416ac1&is=68401941&hm=e40c7db2083c80b785f525c4858f3b4c70195a3b9fc8855192eda14f7a8c40d4&=&format=webp&quality=lossless" },
  { id: "cr_radiant_nexus", name: "Radiant Nexus", pointsRequired: 20000, description: "Badge god. Limited flex status.", imageUrl: "https://media.discordapp.net/attachments/1332299182626574356/1379761740228722718/Radiant_Nexus_.png?ex=68416ac1&is=68401941&hm=111cebfeef14bb59e413bc0148d64f193e69afd0c1a36a103537766de482689c&=&format=webp&quality=lossless" },
];

export const MOCK_PLAYERS: Player[] = [
  {
    id: "admin_user_noah", username: "Noah", email: "tuvsheenee916@gmail.com", robloxId: "1356770784",
    tier: TierLevel.T1, 
    stats: { speedNormal: 90, speedGlitched: 70, economyMoney: 1000000, economyPoints: 50000, cosmeticsUnusuals: 20, cosmeticsAccessories: 50, timeAlive: 36000 },
    badges: ["game_admin", "beta_tester", "event_winner_s1", "speed_demon", "economy_mogul", "collector_adept"], lastActive: new Date(), password: "FM)dj19uqfn8!U^+",
    pronouns: "He/Him", location: "USA", bio: "Keeping Evade fair and fun! I'm the lead admin for Evade Competitive.", joinedDate: new Date("2023-01-01"),
    customAvatarUrl: null, socialLinks: { youtube: "https://youtube.com/@Evade", twitter: "https://x.com/EvadeGame" },
    isVerifiedPlayer: true, selectedUsernameTagId: "uct_admin_glow"
  },
];

export const MOCK_CLANS: Clan[] = []; 

export const MOCK_WORLD_RECORDS: WorldRecord[] = [
  { id: "wr_admin_speed_facility_normal", playerId: "admin_user_noah", type: WorldRecordType.SPEED_NORMAL_FACILITY, value: 90, proofUrl: "https://example.com/proof", timestamp: new Date("2024-01-01"), isVerified: true },
  // { id: "wr_admin_speed_compound_normal", playerId: "admin_user_noah", type: WorldRecordType.SPEED_NORMAL_COMPOUND, value: 105, proofUrl: "https://example.com/proof2", timestamp: new Date("2024-01-02"), isVerified: true },
  { id: "wr_admin_eco_money", playerId: "admin_user_noah", type: WorldRecordType.ECONOMY_MONEY_MATCH, value: 50000, proofUrl: "https://example.com/proof3", timestamp: new Date("2024-01-03"), isVerified: true },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  theme: "dark",
  rulesPageContent: `## Evade Competitive - Official Game Rules

Welcome to the Evade Competitive Platform! To ensure a fair, respectful, and enjoyable environment for all participants, please adhere to the following rules. Violations may result in warnings, temporary suspensions, or permanent bans from the platform and associated game servers.

### I. Fair Play & Integrity

1.  **No Cheating or Exploiting:**
    *   The use of third-party software (hacks, scripts, aimbots, etc.), unauthorized modifications, or any method to gain an unfair advantage is strictly prohibited.
    *   **"Normal" Speed Runs:** Must adhere to standard game mechanics. Intentionally abusing glitches or bugs not considered part of "Normal" gameplay will result in submission rejection and potential penalties.
    *   **"Glitched" Speed Runs:** Allow the use of known and accepted in-game glitches and physics exploits. However, external tools or game-breaking exploits that disrupt server stability or other players' experiences are still forbidden.
    *   Discovery of new, unclassified major exploits should be reported to staff immediately, not abused.

2.  **Account Integrity:**
    *   **Account Sharing:** Sharing your Evade platform account or in-game account for the purpose of boosting stats, completing challenges, or participating in events on your behalf is not allowed.
    *   **Impersonation:** Impersonating staff members, other players, or notable community figures is strictly prohibited.
    *   You are responsible for the security of your account.

### II. Player Conduct & Communication

1.  **Respectful Interaction:**
    *   Treat all players, staff, and community members with respect. Harassment, discrimination, hate speech, threats, or any form of toxic behavior will not be tolerated.
    *   This includes, but is not limited to, interactions on this platform, in-game chat, associated Discord servers, and other official community spaces.

2.  **Appropriate Communication:**
    *   Keep all communication (usernames, clan names/tags, profile content, in-game chat) appropriate and free of offensive, explicit, or harmful content.
    *   Spamming, excessive use of profanity, or disruptive behavior in chat or forums is prohibited.

3.  **False Reporting:**
    *   Submitting false reports against other players or intentionally misleading staff members is a serious offense.

### III. Platform & Clan Conduct

1.  **Clan Integrity:**
    *   Clan names, tags, and descriptions must adhere to the same conduct standards as individual players.
    *   "Poaching" members from other clans in a disruptive or disrespectful manner is discouraged.

2.  **Submission System Abuse:**
    *   Do not spam the submission system with frivolous, duplicate, or clearly invalid proofs.
    *   Attempting to mislead reviewers with edited or fabricated proof will result in severe penalties.

### IV. Staff Interaction & Reporting

1.  **Staff Authority:**
    *   Admins and Moderators are here to ensure a fair environment. Follow their instructions and treat them with respect.
    *   Arguing with or being disrespectful towards staff decisions in public channels is not productive. Utilize designated channels or private messages for disputes if necessary.

2.  **Reporting Violations:**
    *   If you witness a rule violation, please report it to staff through the appropriate channels (e.g., Discord ticket, in-game report system if available) with clear evidence if possible.

**Ignorance of these rules is not an excuse for violations. These rules are subject to change; updates will be announced accordingly. Thank you for helping us maintain a positive and competitive Evade community!**`,
  faqPageContent: `## FAQ
**Q: How do I join a clan?**
A: Contact clan leaders or apply through their profile if they are recruiting.
**Q: How are tiers calculated?**
A: Tiers are primarily based on your performance in the primary leaderboard categories (Speed, Economy).
**Q: How do I submit a record?**
A: Go to the 'Submit' page and fill out the record submission form with valid proof.`,
  submissionGuidelinesContent: `## Evade Competitive - Submission Guidelines

To ensure your stat updates, world records, and other proofs are processed efficiently and accurately, please adhere to the following guidelines. Failure to meet these standards may result in your submission being delayed or rejected.

### I. General Requirements for All Submissions

1.  **Read Game Rules First:** Ensure your submission and the gameplay it represents comply with all official Evade Game Rules.
2.  **Accuracy:** Provide accurate and truthful information. Misleading information will lead to rejection and potential penalties.
3.  **One Submission Per Feat:** Submit each distinct achievement, record, or stat update separately. Do not bundle multiple unrelated items into a single submission.
4.  **Patience:** Our moderation team reviews many submissions. Please allow adequate time for processing. You will be notified of the outcome.

### II. Video Proof - Mandatory Standards

Video proof is **required** for all World Record attempts and significant Stat Updates (especially for Speed and high-value Economy/Cosmetic achievements).

1.  **Clarity & Quality:**
    *   Video must be of sufficient quality to clearly see all necessary information (e.g., gameplay, UI elements, scores, timers).
    *   Avoid excessive motion blur, poor lighting, or extremely low resolution.
    *   Audio is recommended, especially if it helps verify gameplay.

2.  **Full, Unedited Gameplay:**
    *   **Start to Finish:** For speed runs, the video must show the run from the starting trigger/moment until the completion screen/final result. For other stats, show the relevant gameplay segment where the stat was achieved.
    *   **No Cuts or Edits:** The core gameplay segment demonstrating the achievement must be continuous and unedited. Montages or heavily edited clips are not acceptable as primary proof.
    *   Allowed edits: Minor trims at the very beginning/end (outside the core gameplay), or adding commentary if it doesn't obscure gameplay.

3.  **Essential Information Visible:**
    *   **Your In-Game Username:** Your username must be clearly visible during the gameplay and on any final result screens.
    *   **Game Interface/HUD:** Timers, scores, currency, item counts, and other relevant UI elements must be clearly visible.
    *   **Final Result Screen:** If applicable (e.g., end-of-match scoreboard, inventory screen), this must be clearly shown.

4.  **Platform & Timestamps:**
    *   **Recommended Platforms:** YouTube (unlisted or public), Streamable, Twitch VODs (with timestamps). Ensure the link is accessible to our review team.
    *   **Timestamps (Highly Recommended):** If your video is long, please provide a direct timestamp in the "Additional Notes" section pointing to the key moment(s) of the achievement. This significantly speeds up the review process.

### III. Image Proof - Optional but Recommended

While video is primary, high-quality screenshots can supplement your submission for quicker verification, especially for stats that are easily captured on a single screen.

1.  **Content:** Should clearly show the final stat, scoreboard, or relevant UI element with your username visible.
2.  **Format:** PNG, JPG, or GIF. Max file size is 2MB.
3.  **Not a Replacement for Video:** For most competitive stats, an image alone is insufficient.

### IV. Common Reasons for Rejection

*   Violation of Game Rules (cheating, unauthorized exploits for 'Normal' category, etc.).
*   Insufficient or unclear proof (blurry video, missing information, edited gameplay).
*   Incorrect category/sub-category selected for the submission.
*   Duplicate submission.
*   Proof link is broken, private, or inaccessible.
*   Evidence of account sharing or boosting.

### V. The Review Process

1.  **Queue:** Submissions are placed in a queue and reviewed in a timely manner.
2.  **Verification:** Moderators will carefully examine your proof against these guidelines and game rules.
3.  **Outcome:** You will be notified of whether your submission is Approved or Rejected. If rejected, a reason will typically be provided.
4.  **Appeals:** If you believe your submission was rejected in error, you may contact staff through designated channels for a secondary review, providing any additional clarification.

**Thank you for your cooperation! Your adherence to these guidelines helps us maintain the integrity of the Evade leaderboards and records.**`,
  bannerImageUrl: "https://picsum.photos/seed/sitebanner/1200/300",
  primaryButtonColor: "#7C3AED",
  cardBorderRadius: "rounded-lg",
};

export const MOCK_SUBMISSIONS: Submission<SubmissionData>[] = [];
export const MOCK_MESSAGES: Message[] = [];
export const MOCK_CONVERSATIONS: Conversation[] = [];

export const LEADERBOARD_CATEGORIES: { value: LeaderboardCategory; label: string; icon: string }[] = [
    { value: LeaderboardCategory.SPEED, label: "Speed", icon: "fas fa-stopwatch" },
    { value: LeaderboardCategory.ECONOMY, label: "Economy", icon: "fas fa-coins" },
    { value: LeaderboardCategory.COSMETICS, label: "Cosmetics", icon: "fas fa-paint-brush" },
];

export const SPEED_SUB_CATEGORIES_OPTIONS: { value: SpeedSubCategory; label: string }[] = [
    { value: SpeedSubCategory.NORMAL, label: "Normal" },
    { value: SpeedSubCategory.GLITCHED, label: "Glitched" },
];
export const ECONOMY_SUB_CATEGORIES_OPTIONS: { value: EconomySubCategory; label: string }[] = [
    { value: EconomySubCategory.MONEY, label: "Money" },
    { value: EconomySubCategory.POINTS, label: "Points" },
];
export const COSMETICS_SUB_CATEGORIES_OPTIONS: { value: CosmeticsSubCategory; label: string }[] = [
    { value: CosmeticsSubCategory.UNUSUALS, label: "Unusuals" },
    { value: CosmeticsSubCategory.ACCESSORIES, label: "Accessories" },
];

export const TIER_OPTIONS = Object.values(TierLevel).map(t => ({value: t, label: TIER_STYLES[t].name.split(' - ')[0]}));
export const ALL_TIERS_OPTION = { value: "", label: "All Tiers" };

export const WORLD_RECORD_TYPE_OPTIONS = Object.values(WorldRecordType).map(wrt => ({value: wrt, label: wrt}));
export const REGION_OPTIONS: { value: Region; label: string }[] = (["NA", "EU", "ASIA", "OCE", "SA"] as Region[]).map(r => ({value: r, label: r}));


export const NAV_ITEMS = [
  { path: "/", label: "Leaderboard", icon: "fas fa-trophy" },
  { path: "/overall-leaderboard", label: "Overall", icon: "fas fa-star" },
  { path: "/clans", label: "Clans", icon: "fas fa-users" },
  { path: "/world-records", label: "Records", icon: "fas fa-globe-americas" },
  { path: "/badges", label: "Badges", icon: "fas fa-medal" },
  { path: "/messages", label: "Messages", icon: "fas fa-comments" },
  { path: "/submit", label: "Submit", icon: "fas fa-upload" },
];

export const BADGE_CATEGORIES_TABS: { label: string; category?: BadgeCategory }[] = [
    { label: "All Badges" }, { label: "Achievements", category: "Achievement" }, { label: "Roles", category: "Role" }, { label: "Verification", category: "Verification" }, { label: "Events", category: "Event" },
];

export const CLAN_STATUS_OPTIONS = [ { value: "", label: "All Status" }, { value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }, { value: "Recruiting", label: "Recruiting" }, ];

export const WORLD_RECORDS_PRIMARY_CATEGORY_OPTIONS: { value: LeaderboardCategory | ''; label: string }[] = [
    { value: "", label: "All Categories" },
    ...LEADERBOARD_CATEGORIES.map(cat => ({ value: cat.value, label: cat.label }))
];

export const WORLD_RECORDS_TYPE_FILTER_OPTIONS: { value: WorldRecordType | ''; label: string }[] = [
    { value: "", label: "All Record Types" }, 
    ...Object.values(WorldRecordType).map(wrt => ({value: wrt, label: wrt}))
];


export const SOCIAL_LINK_DEFINITIONS: Record<keyof NonNullable<Player['socialLinks']>, { icon: string, color: string, prefix?: string, placeholder: string }> = {
    twitch: { icon: 'fab fa-twitch', color: 'text-purple-500', prefix: 'https://twitch.tv/', placeholder: 'YourTwitchChannel' },
    youtube: { icon: 'fab fa-youtube', color: 'text-red-600', prefix: 'https://youtube.com/', placeholder: '@YourYouTubeChannel or Channel ID' },
    twitter: { icon: 'fab fa-twitter', color: 'text-sky-500', prefix: 'https://x.com/', placeholder: 'YourTwitterHandle' },
    discord: { icon: 'fab fa-discord', color: 'text-indigo-500', placeholder: 'YourDiscordTag#1234' },
    tiktok: { icon: 'fab fa-tiktok', color: 'text-pink-500', prefix: 'https://tiktok.com/@', placeholder: 'YourTikTokUsername' },
};

export const STAT_UPDATE_CATEGORY_OPTIONS: { value: LeaderboardCategory; label: string }[] = LEADERBOARD_CATEGORIES.map(cat => ({value: cat.value, label: cat.label}));

export const STAT_UPDATE_SUBCATEGORY_OPTIONS: Record<LeaderboardCategory, { value: string; label: string }[]> = {
    [LeaderboardCategory.SPEED]: SPEED_SUB_CATEGORIES_OPTIONS,
    [LeaderboardCategory.ECONOMY]: ECONOMY_SUB_CATEGORIES_OPTIONS,
    [LeaderboardCategory.COSMETICS]: COSMETICS_SUB_CATEGORIES_OPTIONS,
};

const newMapData: { name: string, imageUrl: string }[] = [
    { name: "Brutalist Void", imageUrl: "https://static.wikia.nocookie.net/evade-nextbot/images/c/c6/Brutalist_Void_in_vote.png/revision/latest?cb=20250321161346" },
    { name: "Crossroads", imageUrl: "https://static.wikia.nocookie.net/evade-nextbot/images/5/5a/Crossroadspoll.png/revision/latest?cb=20240826115956" },
    { name: "Elysium Laboratory", imageUrl: "https://static.wikia.nocookie.net/evade-nextbot/images/9/90/Legacy_Laboratory.png/revision/latest/scale-to-width-down/1000?cb=20250409160101" },
    { name: "Neighborhood", imageUrl: "https://static.wikia.nocookie.net/evade-nextbot/images/7/76/Old_Neighborhood_Map_icon.png/revision/latest?cb=20241223162313" },
    { name: "Drab", imageUrl: "https://i.pinimg.com/736x/d2/06/09/d2060902e16f0f89404ce9bc2410fe86.jpg" },
    { name: "Desert Bus", imageUrl: "https://i.pinimg.com/736x/8c/13/64/8c13647498bccd35dc4e756b32e85280.jpg" },
    { name: "Facility", imageUrl: "https://example.com/facility.png" },
];

export const MAP_NAME_OPTIONS: { value: string; label: string; imageUrl?: string }[] = newMapData.map(map => ({
    value: map.name,
    label: map.name,
    imageUrl: map.imageUrl,
}));

export const MAP_FILTER_OPTIONS: { value: string; label: string; imageUrl?: string }[] = [
    { value: "", label: "All Maps" },
    ...MAP_NAME_OPTIONS,
];


export const STAT_METRIC_UNITS: Record<LeaderboardCategory, Partial<Record<SpeedSubCategory | EconomySubCategory | CosmeticsSubCategory, string>>> = {
    [LeaderboardCategory.SPEED]: {
        [SpeedSubCategory.NORMAL]: "seconds",
        [SpeedSubCategory.GLITCHED]: "seconds",
    },
    [LeaderboardCategory.ECONOMY]: {
        [EconomySubCategory.MONEY]: "$",
        [EconomySubCategory.POINTS]: "points",
    },
    [LeaderboardCategory.COSMETICS]: {
        [CosmeticsSubCategory.UNUSUALS]: "items",
        [CosmeticsSubCategory.ACCESSORIES]: "items",
    },
};

export const INITIAL_LEADERBOARD_WEIGHTS: LeaderboardWeights = {
  [LeaderboardCategory.SPEED]: 50,
  [LeaderboardCategory.ECONOMY]: 30,
  [LeaderboardCategory.COSMETICS]: 20,
};

export const getCategoryFromWorldRecordType = (recordType: WorldRecordType): LeaderboardCategory | null => {
  if (recordType.startsWith(LeaderboardCategory.SPEED)) return LeaderboardCategory.SPEED;
  if (recordType.startsWith(LeaderboardCategory.ECONOMY)) return LeaderboardCategory.ECONOMY;
  if (recordType.startsWith(LeaderboardCategory.COSMETICS)) return LeaderboardCategory.COSMETICS;
  // LONGEST_SURVIVAL_ANY currently does not map to a weighted category.
  return null; 
};