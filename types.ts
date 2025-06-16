

export enum TierLevel {
  T1 = "T1", // Top Tier
  T2 = "T2",
  T3 = "T3",
  T4 = "T4",
  T5 = "T5", // Lowest Tier
}

export enum LeaderboardCategory {
  SPEED = "Speed",
  COSMETICS = "Cosmetics",
}

export type LeaderboardWeights = Record<LeaderboardCategory, number>;

export enum SpeedSubCategory {
  NORMAL = "Normal",
  GLITCHED = "Glitched",
}

export enum CosmeticsSubCategory {
  UNUSUALS = "Unusuals",
  ACCESSORIES = "Accessories",
}

export type BadgeCategory = 'Achievement' | 'Role' | 'Verification' | 'Event' | 'General';

export interface UsernameColorTag {
  id: string; // UUID
  name: string;
  description?: string;
  cssClasses: string[]; // For text color, gradients
  effectClass?: string; // For animations like pulse, shimmer
  iconClass?: string; // e.g., Font Awesome class for an icon next to name
  created_at?: string; // Supabase default
}

export interface Badge {
  id: string; // UUID
  name: string;
  description: string; 
  iconClass: string; 
  colorClass: string; 
  unlockCriteria: string; 
  value?: number; // Can be 0 or undefined
  category: BadgeCategory;
  isVisible: boolean; 
  usernameColorUnlock?: { 
    textClasses: string[]; 
    description: string; 
  };
  colorTagId?: string; // UUID, foreign key to username_color_tags.id
  created_at?: string; // Supabase default
}

export interface PlayerStats {
  speedNormal: number; 
  speedGlitched: number; 
  cosmeticsUnusuals: number; 
  cosmeticsAccessories: number; 
  timeAlive: number; 
}

// Player's 'id' will be the Supabase Auth user UUID.
// Password is handled by Supabase Auth and not stored here.
export interface Player {
  id: string; // UUID, references auth.users.id
  username: string;
  email?: string; 
  robloxId: string;
  robloxAvatarUrl?: string; 
  tier: TierLevel;
  stats: PlayerStats; // This might be better as separate columns or JSONB in Supabase
  badges: string[]; // Array of badge IDs (UUIDs)
  lastActive: Date;
  clanId?: string; // UUID, foreign key to clans.id

  pronouns?: string;
  location?: string;
  bio?: string;
  customAvatarUrl?: string | null; 
  customProfileBannerUrl?: string | null; 
  canSetCustomBanner?: boolean; 
  socialLinks?: {
    twitch?: string;
    youtube?: string;
    twitter?: string;
    discord?: string; 
    tiktok?: string;
  };
  joinedDate?: Date; // Renamed from created_at from player table
  isVerifiedPlayer?: boolean; 
  selectedUsernameTagId?: string; // UUID
  isBlacklisted?: boolean; 
  // created_at is implicit from Supabase
}

export interface Clan {
  id: string; // UUID
  name: string;
  bannerUrl?: string;
  tag: string;
  memberCount: number; // This might be a computed value or updated via trigger
  activityStatus: "Active" | "Inactive" | "Recruiting";
  foundedDate: Date; // Corresponds to created_at from clans table
  discordLink?: string;
  description: string; 
  requirementsToJoin: string;
  isVerified: boolean;
  leaderId: string; // UUID, foreign key to players.id (which is auth.users.id)
  members: string[]; // Array of Player IDs (UUIDs), managed by clan_members table
  created_at?: string; // Supabase default
}

export interface ClanMember {
  clan_id: string; // UUID, foreign key to clans.id
  player_id: string; // UUID, foreign key to players.id
  role: 'Leader' | 'Co-Leader' | 'Officer' | 'Member';
  joined_at: string; // ISO date string
  id?: string; // Optional: if clan_members has its own primary key
}


export enum WorldRecordType {
  SPEED_NORMAL_FACILITY = "Speed - Normal - Facility",
  SPEED_NORMAL_COMPOUND = "Speed - Normal - Compound",
  SPEED_NORMAL_SITE_OMEGA = "Speed - Normal - Site Omega",
  SPEED_GLITCHED_FACILITY = "Speed - Glitched - Facility",
  SPEED_GLITCHED_COMPOUND = "Speed - Glitched - Compound",
  SPEED_GLITCHED_SITE_OMEGA = "Speed - Glitched - Site Omega",
  COSMETICS_UNUSUALS_TOTAL = "Cosmetics - Unusuals (Total)",
  COSMETICS_ACCESSORIES_TOTAL = "Cosmetics - Accessories (Total)",
  LONGEST_SURVIVAL_ANY = "Longest Survival (Any Mode)",
}

export type Region = "NA" | "EU" | "ASIA" | "OCE" | "SA";

export interface WorldRecord {
  id: string; // UUID
  playerId: string; // UUID, foreign key to players.id
  type: WorldRecordType;
  value: number; 
  proofUrl: string; 
  timestamp: Date; // Corresponds to created_at from world_records table
  region?: Region;
  isVerified: boolean;
  created_at?: string; // Supabase default
}

export interface ForumPost {
  id: string; // UUID
  clanId: string; // UUID, foreign key to clans.id
  authorId: string; // UUID, foreign key to players.id
  title: string;
  content: string; 
  timestamp: Date; // Corresponds to created_at
  type: "Announcement" | "Recruitment" | "Achievement";
  created_at?: string; // Supabase default
}

export enum SubmissionStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export type SubmissionType = "ClanApplication" | "RecordVerification" | "BadgeProof" | "StatUpdateProof";

export interface StatUpdateProofData {
  playerId: string; // UUID
  category: LeaderboardCategory;
  subCategory: SpeedSubCategory | CosmeticsSubCategory | string; 
  mapName?: string; 
  newValue: number;
  videoProofUrl: string;
  imageProofName?: string; // Name of file if uploaded to storage
  notes?: string;
}

export interface ClanApplicationData extends Omit<Clan, 'id' | 'memberCount' | 'members' | 'activityStatus' | 'foundedDate' | 'isVerified' | 'created_at'> {
  leaderId: string; // UUID
}
export interface RecordVerificationData extends Omit<WorldRecord, 'id' | 'timestamp' | 'isVerified' | 'created_at'> {}
export interface BadgeProofData { badgeId: string; userId: string; proof: string } // badgeId and userId are UUIDs


export type SubmissionData = ClanApplicationData | RecordVerificationData | BadgeProofData | StatUpdateProofData;

export interface Submission<T extends SubmissionData> {
  id: string; // UUID
  type: SubmissionType;
  data: T;
  submittedBy: string; // UUID, foreign key to players.id
  submissionDate: Date; // Corresponds to created_at
  status: SubmissionStatus;
  moderatorReason?: string;
  created_at?: string; // Supabase default
}

export interface SiteSettings {
  id?: boolean; // For single row table
  theme: "dark" | "light";
  rulesPageContent: string; 
  faqPageContent: string; 
  submissionGuidelinesContent: string; 
  bannerImageUrl?: string;
  primaryButtonColor: string; 
  cardBorderRadius: string; 
  leaderboardWeights: LeaderboardWeights; // Stored as JSONB
  updated_at?: string; // Supabase default
}

// Credentials for Supabase Auth
export interface LoginCredentials {
  email: string; // Supabase uses email for login by default
  password?: string; 
}

export interface SignUpCredentials extends LoginCredentials {
    username: string; // Add username for our players table
    robloxId: string;
}

export interface PlayerProfileUpdateData {
    username?: string; 
    pronouns?: string;
    location?: string;
    bio?: string;
    customAvatarUrl?: string | null;
    customProfileBannerUrl?: string | null; 
    socialLinks?: Player['socialLinks'];
    selectedUsernameTagId?: string; // UUID
}

export interface Message {
  id: string; // UUID
  conversationId: string; // UUID, foreign key to conversations.id
  senderId: string; // UUID, foreign key to players.id
  text: string;
  timestamp: Date; // Corresponds to created_at
  created_at?: string; // Supabase default
}

export interface UnreadCounts {
  [participantId: string]: number; // participantId is UUID
}

export interface Conversation {
  id: string; // UUID
  participantIds: string[]; // Array of Player IDs (UUIDs)
  name?: string; 
  lastMessageText?: string;
  lastMessageTimestamp: Date;
  lastMessageSenderId?: string; // UUID
  unreadCountByParticipant?: UnreadCounts; // Stored as JSONB
  created_at?: string; // Supabase default
  updated_at?: string; // Supabase default
}

export interface CollectionRank {
  id: string; // e.g. "cr_bronze"
  name: string;
  pointsRequired: number;
  description: string;
  imageUrl: string;
  created_at?: string; // Supabase default
}

export type AnnouncementType = 'info' | 'success' | 'warning' | 'error';

export interface Announcement {
    id: string; // UUID
    title: string;
    message: string;
    type: AnnouncementType;
    creationDate: Date; // Corresponds to created_at
    isDismissible: boolean;
    isActive?: boolean; 
    displayUntil?: Date; 
    created_at?: string; // Supabase default
    updated_at?: string; // Supabase default
}

export interface AppContextType {
  players: Player[];
  clans: Clan[];
  worldRecords: WorldRecord[];
  badges: Badge[];
  submissions: Submission<SubmissionData>[];
  siteSettings: SiteSettings;
  loading: boolean;
  currentUser: Player | null; // This will be enriched with data from 'players' table
  isAdmin: boolean;
  isStaff?: boolean; 
  
  usernameColorTags: UsernameColorTag[];
  createUsernameColorTag: (tagData: Omit<UsernameColorTag, 'id' | 'created_at'>) => Promise<{success: boolean, data?: UsernameColorTag, error?: any}>;
  deleteUsernameColorTag: (tagId: string) => Promise<{success: boolean, error?: any}>;

  loginUser: (credentials: LoginCredentials) => Promise<{success: boolean; message?: string}>;
  logoutUser: () => Promise<void>;
  signUpUser: (credentials: SignUpCredentials) => Promise<{success: boolean; message?: string, userId?: string}>;
  
  createPlayer: (playerData: Pick<Player, 'username' | 'robloxId' | 'email'> & {password: string}) => Promise<{success: boolean; message?: string; player?: Player}>; // Used by admin
  createTestUser: (username: string) => Promise<{success: boolean; message: string; player?: Player}>; 
  deletePlayer: (playerId: string) => Promise<{success: boolean, error?: any}>; // playerId is auth.users.id
  setPlayerBlacklistedStatus: (playerId: string, isBlacklisted: boolean) => Promise<{success: boolean, error?: any}>;

  updatePlayerTier: (playerId: string, tier: TierLevel) => Promise<{success: boolean, error?: any}>;
  resetPlayerStats: (playerId: string) => Promise<{success: boolean, error?: any}>; 
  addPlayerBadge: (playerId: string, badgeId: string) => Promise<{success: boolean, error?: any}>;
  removePlayerBadge: (playerId: string, badgeId: string) => Promise<{success: boolean, error?: any}>;
  updatePlayer: (playerData: Partial<Player> & {id: string}) => Promise<{success: boolean; message?: string, data?: Player}>; 
  updatePlayerProfile: (playerId: string, data: PlayerProfileUpdateData, avatarFile?: File | null, bannerFile?: File | null) => Promise<{success: boolean; message?: string}>; 
  togglePlayerVerification: (playerId: string, isVerified: boolean) => Promise<{success: boolean, error?: any}>;

  approveClan: (clanId: string) => Promise<{success: boolean, error?: any}>;
  rejectClan: (clanId: string, reason: string) => Promise<{success: boolean, error?: any}>;
  toggleClanVerification: (clanId: string, isVerified: boolean) => Promise<{success: boolean, error?: any}>;
  addClan: (clanData: ClanApplicationData) => Promise<{success: boolean, data?: Clan, error?: any}>; // data should be from ClanApplicationData
  
  approveRecord: (recordId: string) => Promise<{success: boolean, error?: any}>;
  rejectRecord: (recordId: string, reason: string) => Promise<{success: boolean, error?: any}>;
  // addWorldRecord: (record: RecordVerificationData) => void; // This is done via submission
  
  submitClanApplication: (clanData: Omit<ClanApplicationData, 'leaderId'>, leaderId: string) => Promise<{success: boolean, error?: any}>;
  submitRecord: (recordData: Omit<RecordVerificationData, 'playerId'>) => Promise<{success: boolean, error?: any}>;
  submitStatUpdateProof: (data: Omit<StatUpdateProofData, 'playerId'>) => Promise<{success: boolean, error?: any}>;
  processSubmission: (submissionId: string, newStatus: SubmissionStatus, reason?: string) => Promise<{success: boolean, error?: any}>;
  
  createBadge: (badgeData: Omit<Badge, 'id' | 'created_at'>) => Promise<{success: boolean, data?: Badge, error?: any}>;
  updateBadge: (badgeId: string, badgeData: Partial<Omit<Badge, 'id' | 'created_at'>>) => Promise<{success: boolean, data?: Badge, error?: any}>;
  deleteBadge: (badgeId: string) => Promise<{success: boolean, error?: any}>; 

  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<{success: boolean, error?: any}>;

  conversations: Conversation[];
  messages: Message[];
  getConversationsForUser: (userId: string) => Conversation[]; // This will now fetch from state updated by Supabase
  getMessagesInConversation: (conversationId: string) => Message[]; // This will now fetch from state updated by Supabase
  sendMessage: (conversationId: string, text: string) => Promise<{success: boolean, error?: any}>;
  markMessagesAsRead: (conversationId: string, userId: string) => Promise<{success: boolean, error?: any}>;
  getUnreadMessagesCount: (userId: string) => number;
  getOrCreateConversation: (participantIds: string[], groupName?: string) => Promise<string | null>; 

  announcements: Announcement[];
  createAnnouncement: (announcementData: Omit<Announcement, 'id' | 'creationDate' | 'isActive' | 'created_at' | 'updated_at'>) => Promise<{success: boolean, data?: Announcement, error?: any}>;
  updateAnnouncement: (announcement: Partial<Announcement> & {id: string}) => Promise<{success: boolean, data?: Announcement, error?: any}>;
  deleteAnnouncement: (announcementId: string) => Promise<{success: boolean, error?: any}>;
  publishAnnouncement: (announcementId: string, durationMinutes?: number) => Promise<{success: boolean, error?: any}>;
  dismissGlobalAnnouncement: (announcementId: string) => Promise<{success: boolean, error?: any}>;
  getActiveGlobalAnnouncements: () => Announcement[];

  leaderboardWeights: LeaderboardWeights;
  updateLeaderboardWeights: (newWeights: LeaderboardWeights) => Promise<{success: boolean, error?: any}>;

  executeAdminCommand: (command: string) => Promise<{success: boolean, message: string}>;
  refreshLeaderboard: () => Promise<void>; // May need to be async if it hits Supabase
  resetLeaderboardForSeason: () => Promise<void>; // May need to be async
}

export type SortOptionPlayer = keyof PlayerStats | "lastActive"; 
export type SortOptionClan = "name" | "memberCount" | "activityStatus" | "foundedDate";
export type SortOptionRecord = "value" | "timestamp" | "type";

// This Database type will be generated by `supabase gen types typescript --project-id <your-project-id> > types/supabase.ts`
// It is moved to types/supabase.ts to be correctly picked up by the Supabase client.
// export interface Database { /* ... */ } removed from here
