

export enum TierLevel {
  T1 = "T1", // Top Tier
  T2 = "T2",
  T3 = "T3",
  T4 = "T4",
  T5 = "T5", // Lowest Tier
}

export enum LeaderboardCategory {
  SPEED = "Speed",
  ECONOMY = "Economy",
  COSMETICS = "Cosmetics",
}

export type LeaderboardWeights = Record<LeaderboardCategory, number>;

export enum SpeedSubCategory {
  NORMAL = "Normal",
  GLITCHED = "Glitched",
}

export enum EconomySubCategory {
  MONEY = "Money",
  POINTS = "Points",
}

export enum CosmeticsSubCategory {
  UNUSUALS = "Unusuals",
  ACCESSORIES = "Accessories",
}

export type BadgeCategory = 'Achievement' | 'Role' | 'Verification' | 'Event' | 'General';

export interface UsernameColorTag {
  id: string;
  name: string;
  description?: string;
  cssClasses: string[]; // For text color, gradients
  effectClass?: string; // For animations like pulse, shimmer
  iconClass?: string; // e.g., Font Awesome class for an icon next to name
}

export interface Badge {
  id: string;
  name: string;
  description: string; 
  iconClass: string; 
  colorClass: string; 
  unlockCriteria: string; 
  value: number; 
  category: BadgeCategory;
  usernameColorUnlock?: { 
    textClasses: string[]; 
    description: string; 
  };
  colorTagId?: string; 
}

export interface PlayerStats {
  speedNormal: number; // Time in seconds, lower is better
  speedGlitched: number; // Time in seconds, lower is better
  economyMoney: number; // Higher is better
  economyPoints: number; // Higher is better
  cosmeticsUnusuals: number; // Count, higher is better
  cosmeticsAccessories: number; // Count, higher is better
  timeAlive: number; // Total seconds, higher is better
}

export interface Player {
  id: string;
  username: string;
  email?: string; 
  robloxId: string;
  robloxAvatarUrl?: string; 
  tier: TierLevel;
  stats: PlayerStats;
  badges: string[]; 
  lastActive: Date;
  clanId?: string;
  password?: string;

  pronouns?: string;
  location?: string;
  bio?: string;
  customAvatarUrl?: string | null; 
  socialLinks?: {
    twitch?: string;
    youtube?: string;
    twitter?: string;
    discord?: string; 
    tiktok?: string;
  };
  joinedDate?: Date; 
  isVerifiedPlayer?: boolean; 
  selectedUsernameTagId?: string; 
  isBlacklisted?: boolean; // New field
}

export interface Clan {
  id: string;
  name: string;
  bannerUrl?: string;
  tag: string;
  memberCount: number;
  activityStatus: "Active" | "Inactive" | "Recruiting";
  foundedDate: Date;
  discordLink?: string;
  description: string; 
  requirementsToJoin: string;
  isVerified: boolean;
  leaderId: string;
  members: string[]; 
}

export enum WorldRecordType {
  SPEED_NORMAL_FACILITY = "Speed - Normal - Facility",
  SPEED_NORMAL_COMPOUND = "Speed - Normal - Compound",
  SPEED_NORMAL_SITE_OMEGA = "Speed - Normal - Site Omega",
  SPEED_GLITCHED_FACILITY = "Speed - Glitched - Facility",
  SPEED_GLITCHED_COMPOUND = "Speed - Glitched - Compound",
  SPEED_GLITCHED_SITE_OMEGA = "Speed - Glitched - Site Omega",
  ECONOMY_MONEY_MATCH = "Economy - Money (Match)",
  ECONOMY_POINTS_MATCH = "Economy - Points (Match)",
  COSMETICS_UNUSUALS_TOTAL = "Cosmetics - Unusuals (Total)",
  COSMETICS_ACCESSORIES_TOTAL = "Cosmetics - Accessories (Total)",
  LONGEST_SURVIVAL_ANY = "Longest Survival (Any Mode)",
}

export type Region = "NA" | "EU" | "ASIA" | "OCE" | "SA";

export interface WorldRecord {
  id: string;
  playerId: string;
  type: WorldRecordType;
  value: number; 
  proofUrl: string; 
  timestamp: Date;
  region?: Region;
  isVerified: boolean;
}

export interface ForumPost {
  id: string;
  clanId: string;
  authorId: string; 
  title: string;
  content: string; 
  timestamp: Date;
  type: "Announcement" | "Recruitment" | "Achievement";
}

export enum SubmissionStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
}

export type SubmissionType = "ClanApplication" | "RecordVerification" | "BadgeProof" | "StatUpdateProof";

export interface StatUpdateProofData {
  playerId: string;
  category: LeaderboardCategory;
  subCategory: SpeedSubCategory | EconomySubCategory | CosmeticsSubCategory | string; 
  mapName?: string; 
  newValue: number;
  videoProofUrl: string;
  imageProofName?: string; 
  notes?: string;
}

export interface ClanApplicationData extends Omit<Clan, 'id' | 'memberCount' | 'members' | 'activityStatus' | 'foundedDate' | 'isVerified'> {
  leaderId: string;
}
export interface RecordVerificationData extends Omit<WorldRecord, 'id' | 'timestamp' | 'isVerified'> {}
export interface BadgeProofData { badgeId: string; userId: string; proof: string }


export type SubmissionData = ClanApplicationData | RecordVerificationData | BadgeProofData | StatUpdateProofData;

export interface Submission<T extends SubmissionData> {
  id: string;
  type: SubmissionType;
  data: T;
  submittedBy: string; 
  submissionDate: Date;
  status: SubmissionStatus;
  moderatorReason?: string;
}

export interface SiteSettings {
  theme: "dark" | "light";
  rulesPageContent: string; 
  faqPageContent: string; 
  submissionGuidelinesContent: string; 
  bannerImageUrl?: string;
  primaryButtonColor: string; 
  cardBorderRadius: string; 
}

export interface LoginCredentials {
  username: string;
  password?: string; 
}

export interface SignUpCredentials extends LoginCredentials {
    robloxId: string;
    email?: string; 
}

export interface PlayerProfileUpdateData {
    username?: string; // Added for username change
    pronouns?: string;
    location?: string;
    bio?: string;
    customAvatarUrl?: string | null;
    socialLinks?: Player['socialLinks'];
    selectedUsernameTagId?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string; 
  text: string;
  timestamp: Date;
}

export interface UnreadCounts {
  [participantId: string]: number; 
}

export interface Conversation {
  id: string;
  participantIds: string[]; 
  name?: string; 
  lastMessageText?: string;
  lastMessageTimestamp: Date;
  lastMessageSenderId?: string;
  unreadCountByParticipant?: UnreadCounts;
}

export interface CollectionRank {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
  imageUrl: string;
}

export type AnnouncementType = 'info' | 'success' | 'warning' | 'error';

export interface Announcement {
    id: string;
    title: string;
    message: string;
    type: AnnouncementType;
    creationDate: Date;
    isDismissible: boolean;
    isActive?: boolean; // For global display
    displayUntil?: Date; // Optional expiry for display
}

export interface AppContextType {
  players: Player[];
  clans: Clan[];
  worldRecords: WorldRecord[];
  badges: Badge[];
  submissions: Submission<SubmissionData>[];
  siteSettings: SiteSettings;
  loading: boolean;
  currentUser: Player | null;
  isAdmin: boolean;
  isStaff?: boolean; 
  
  usernameColorTags: UsernameColorTag[];
  createUsernameColorTag: (tagData: Omit<UsernameColorTag, 'id'>) => void;
  deleteUsernameColorTag: (tagId: string) => void;

  loginUser: (credentials: LoginCredentials) => Promise<boolean>;
  logoutUser: () => void;
  signUpUser: (credentials: SignUpCredentials) => Promise<{success: boolean; message?: string}>;
  
  // Player Admin Functions
  createPlayer: (playerData: Pick<Player, 'username' | 'password' | 'robloxId' | 'email'>) => Promise<{success: boolean; message?: string; player?: Player}>;
  createTestUser: (username: string) => Promise<{success: boolean; message: string; player?: Player}>; // New, message non-optional
  deletePlayer: (playerId: string) => void;
  setPlayerBlacklistedStatus: (playerId: string, isBlacklisted: boolean) => void;

  updatePlayerTier: (playerId: string, tier: TierLevel) => void;
  resetPlayerStats: (playerId: string) => void; 
  addPlayerBadge: (playerId: string, badgeId: string) => void;
  removePlayerBadge: (playerId: string, badgeId: string) => void;
  updatePlayer: (player: Player) => Promise<{success: boolean; message?: string}>; // Modified to return status
  updatePlayerProfile: (playerId: string, data: PlayerProfileUpdateData) => Promise<{success: boolean; message?: string}>; // Modified for username change
  togglePlayerVerification: (playerId: string) => void;

  approveClan: (clanId: string) => void;
  rejectClan: (clanId: string, reason: string) => void;
  toggleClanVerification: (clanId: string) => void;
  addClan: (clanData: ClanApplicationData) => void;
  
  approveRecord: (recordId: string) => void;
  rejectRecord: (recordId: string, reason: string) => void;
  addWorldRecord: (record: RecordVerificationData) => void;
  
  submitClanApplication: (clanData: Omit<Clan, 'id' | 'memberCount' | 'members' | 'activityStatus' | 'foundedDate' | 'isVerified' | 'leaderId'>, leaderId: string) => void;
  submitRecord: (recordData: Omit<WorldRecord, 'id' | 'timestamp' | 'isVerified'>) => void;
  submitStatUpdateProof: (data: StatUpdateProofData) => void;
  processSubmission: (submissionId: string, newStatus: SubmissionStatus, reason?: string) => void;
  
  createBadge: (badge: Omit<Badge, 'id'>) => void;
  updateBadge: (badgeId: string, badgeData: Partial<Omit<Badge, 'id'>>) => void; 
  deleteBadge: (badgeId: string) => void; 

  updateSiteSettings: (settings: Partial<SiteSettings>) => void;

  conversations: Conversation[];
  messages: Message[];
  getConversationsForUser: (userId: string) => Conversation[];
  getMessagesInConversation: (conversationId: string) => Message[];
  sendMessage: (conversationId: string, text: string) => Promise<boolean>;
  markMessagesAsRead: (conversationId: string, userId: string) => void;
  getUnreadMessagesCount: (userId: string) => number;
  getOrCreateConversation: (participantIds: string[]) => Promise<string>; 

  // Announcements
  announcements: Announcement[];
  createAnnouncement: (announcementData: Omit<Announcement, 'id' | 'creationDate' | 'isActive'>) => Announcement;
  updateAnnouncement: (announcement: Announcement) => void;
  deleteAnnouncement: (announcementId: string) => void;
  publishAnnouncement: (announcementId: string, durationMinutes?: number) => void; // Make active globally
  dismissGlobalAnnouncement: (announcementId: string) => void;
  getActiveGlobalAnnouncements: () => Announcement[];

  // Leaderboard Settings
  leaderboardWeights: LeaderboardWeights;
  updateLeaderboardWeights: (newWeights: LeaderboardWeights) => void;

  // Admin Commands
  executeAdminCommand: (command: string) => Promise<{success: boolean, message: string}>;
  refreshLeaderboard: () => Promise<void>;
  resetLeaderboardForSeason: () => Promise<void>;
}

export type SortOptionPlayer = keyof PlayerStats | "lastActive"; 
export type SortOptionClan = "name" | "memberCount" | "activityStatus" | "foundedDate";
export type SortOptionRecord = "value" | "timestamp" | "type";