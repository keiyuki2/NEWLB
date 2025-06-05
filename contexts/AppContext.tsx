
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Player, Clan, WorldRecord, Badge, Submission, SiteSettings, AppContextType, TierLevel, SubmissionStatus, LoginCredentials, SignUpCredentials, SubmissionData, ClanApplicationData, RecordVerificationData, StatUpdateProofData, PlayerProfileUpdateData, UsernameColorTag, Conversation, Message, PlayerStats, LeaderboardCategory, SpeedSubCategory, EconomySubCategory, CosmeticsSubCategory, UnreadCounts, Announcement, AnnouncementType, LeaderboardWeights } from '../types';
import { MOCK_PLAYERS, MOCK_CLANS, MOCK_WORLD_RECORDS, INITIAL_BADGES, DEFAULT_SITE_SETTINGS, MOCK_SUBMISSIONS, MOCK_USERNAME_COLOR_TAGS, MOCK_CONVERSATIONS, MOCK_MESSAGES, INITIAL_LEADERBOARD_WEIGHTS } from '../constants';

const AppContext = createContext<AppContextType | undefined>(undefined);

const loadState = <T,>(key: string, defaultValue: T): T => {
  try {
    const serializedState = localStorage.getItem(key);
    if (serializedState === null) {
      return defaultValue;
    }
    return JSON.parse(serializedState, (k, v) => {
      const dateKeys = ['lastActive', 'foundedDate', 'timestamp', 'submissionDate', 'joinedDate', 'lastMessageTimestamp', 'creationDate', 'displayUntil'];
      if (dateKeys.includes(k)) {
        if (v) return new Date(v);
      }
      return v;
    });
  } catch (error) {
    console.warn(`Error loading state for ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveState = <T,>(key: string, value: T) => {
  try {
    const serializedState = JSON.stringify(value);
    localStorage.setItem(key, serializedState);
  } catch (error) {
    console.warn(`Error saving state for ${key} to localStorage:`, error);
  }
};


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [players, setPlayers] = useState<Player[]>(() => loadState('evade_players', MOCK_PLAYERS));
  const [clans, setClans] = useState<Clan[]>(() => loadState('evade_clans', MOCK_CLANS));
  const [worldRecords, setWorldRecords] = useState<WorldRecord[]>(() => loadState('evade_worldRecords', MOCK_WORLD_RECORDS));
  const [badges, setBadges] = useState<Badge[]>(() => loadState('evade_badges', INITIAL_BADGES));
  const [submissions, setSubmissions] = useState<Submission<SubmissionData>[]>(() => loadState('evade_submissions', MOCK_SUBMISSIONS));
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => loadState('evade_siteSettings', DEFAULT_SITE_SETTINGS));
  
  const [usernameColorTags, setUsernameColorTags] = useState<UsernameColorTag[]>(() => loadState('evade_usernameColorTags', MOCK_USERNAME_COLOR_TAGS));
  const [conversations, setConversations] = useState<Conversation[]>(() => loadState('evade_conversations', MOCK_CONVERSATIONS));
  const [messages, setMessages] = useState<Message[]>(() => loadState('evade_messages', MOCK_MESSAGES));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadState('evade_announcements', []));
  const [leaderboardWeights, setLeaderboardWeights] = useState<LeaderboardWeights>(() => loadState('evade_leaderboardWeights', INITIAL_LEADERBOARD_WEIGHTS));


  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUserInternal] = useState<Player | null>(() => loadState<Player | null>('evade_currentUser', null));
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);

  const setCurrentUser = useCallback((user: Player | null) => {
    setCurrentUserInternal(user);
  }, []); 
  
  useEffect(() => {
    if (currentUser) {
        const adminStatus = currentUser.badges.includes("game_admin");
        const staffStatus = adminStatus || currentUser.badges.includes("moderator");
        setIsAdmin(adminStatus);
        setIsStaff(staffStatus);
    } else {
        setIsAdmin(false);
        setIsStaff(false);
    }
  }, [currentUser]); 

  useEffect(() => saveState('evade_players', players), [players]);
  useEffect(() => saveState('evade_clans', clans), [clans]);
  useEffect(() => saveState('evade_worldRecords', worldRecords), [worldRecords]);
  useEffect(() => saveState('evade_badges', badges), [badges]);
  useEffect(() => saveState('evade_submissions', submissions), [submissions]);
  useEffect(() => saveState('evade_siteSettings', siteSettings), [siteSettings]);
  useEffect(() => saveState('evade_currentUser', currentUser), [currentUser]);
  useEffect(() => saveState('evade_usernameColorTags', usernameColorTags), [usernameColorTags]);
  useEffect(() => saveState('evade_conversations', conversations), [conversations]);
  useEffect(() => saveState('evade_messages', messages), [messages]);
  useEffect(() => saveState('evade_announcements', announcements), [announcements]);
  useEffect(() => saveState('evade_leaderboardWeights', leaderboardWeights), [leaderboardWeights]);


  useEffect(() => {
    let loginAttempted = false;
    if (!currentUser) {
        const adminForTesting = players.find(p => p.id === "admin_user_noah"); // Simplified to Noah for testing
        if (adminForTesting && adminForTesting.password) { // Check for password
            loginAttempted = true;
            loginUser({ username: adminForTesting.username, password: adminForTesting.password })
              .catch(err => console.error("Auto-login failed", err))
              .finally(() => setLoading(false)); 
        }
    }
    if (!loginAttempted) { 
        setTimeout(() => {
          setLoading(false);
        }, 200); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Removed players and loginUser from deps to prevent re-triggering on player data change

  const loginUser = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = players.find(p => p.username.toLowerCase() === credentials.username.toLowerCase() && p.password === credentials.password);
            if (user) {
                if (user.isBlacklisted) {
                    setLoading(false);
                    console.warn(`Login attempt for blacklisted user: ${user.username}`);
                    resolve(false); 
                    return;
                }
                setCurrentUser(user); 
                setLoading(false);
                resolve(true);
            } else {
                setLoading(false);
                resolve(false);
            }
        }, 750); 
    });
  }, [players, setCurrentUser]);

  const logoutUser = useCallback(() => {
    setCurrentUser(null); 
  }, [setCurrentUser]);

  const signUpUser = useCallback(async (credentials: SignUpCredentials): Promise<{success: boolean; message?: string}> => {
    setLoading(true);
    return new Promise((resolve) => {
        setTimeout(() => {
            const existingUser = players.find(p => p.username.toLowerCase() === credentials.username.toLowerCase());
            if (existingUser) {
                setLoading(false);
                resolve({ success: false, message: "Username already exists." });
                return;
            }
            const existingEmail = credentials.email && players.find(p => p.email?.toLowerCase() === credentials.email?.toLowerCase());
            if (existingEmail) {
                setLoading(false);
                resolve({ success: false, message: "Email already in use." });
                return;
            }

            const newPlayer: Player = {
                id: `player${Date.now()}_${Math.random().toString(36).substring(7)}`,
                username: credentials.username,
                email: credentials.email || undefined,
                robloxId: credentials.robloxId || "0", 
                tier: TierLevel.T5,
                stats: { speedNormal: 0, speedGlitched: 0, economyMoney: 0, economyPoints: 0, cosmeticsUnusuals: 0, cosmeticsAccessories: 0, timeAlive: 0 },
                badges: [], lastActive: new Date(), password: credentials.password, 
                robloxAvatarUrl: undefined, pronouns: undefined, location: undefined, bio: "", customAvatarUrl: null,
                socialLinks: {}, joinedDate: new Date(), isVerifiedPlayer: false, selectedUsernameTagId: undefined, isBlacklisted: false,
            };
            setPlayers(prevPlayers => [...prevPlayers, newPlayer]);
            setCurrentUser(newPlayer); 
            setLoading(false);
            resolve({ success: true });
        }, 750);
    });
  }, [players, setCurrentUser]);
  
  const createPlayer = useCallback(async (playerData: Pick<Player, 'username' | 'password' | 'robloxId' | 'email'>): Promise<{success: boolean; message?: string; player?: Player}> => {
    const existingUser = players.find(p => p.username.toLowerCase() === playerData.username.toLowerCase());
    if (existingUser) {
        return { success: false, message: "Username already exists." };
    }
    if (playerData.email) {
        const existingEmail = players.find(p => p.email?.toLowerCase() === playerData.email?.toLowerCase());
        if (existingEmail) {
            return { success: false, message: "Email already in use." };
        }
    }

    const newPlayer: Player = {
        id: `player_created_${Date.now()}`,
        username: playerData.username,
        password: playerData.password,
        email: playerData.email || undefined,
        robloxId: playerData.robloxId || "0",
        tier: TierLevel.T5,
        stats: { speedNormal: 0, speedGlitched: 0, economyMoney: 0, economyPoints: 0, cosmeticsUnusuals: 0, cosmeticsAccessories: 0, timeAlive: 0 },
        badges: [],
        lastActive: new Date(),
        joinedDate: new Date(),
        isVerifiedPlayer: false,
        isBlacklisted: false,
    };
    setPlayers(prev => [...prev, newPlayer]);
    return { success: true, message: "Player created successfully.", player: newPlayer };
  }, [players]);

  const createTestUser = useCallback(async (username: string): Promise<{success: boolean; message: string; player?: Player}> => {
    const existingUser = players.find(p => p.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
        return { success: false, message: `Username "${username}" already exists.` };
    }
    const newPlayer: Player = {
        id: `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        username: username,
        password: "testpassword", // Standard password for test users
        email: `${username.toLowerCase().replace(/\s+/g, '')}@example.com`,
        robloxId: Math.floor(100000 + Math.random() * 900000).toString(), // Random 6-digit Roblox ID
        tier: TierLevel.T5,
        stats: { 
            speedNormal: Math.floor(100 + Math.random() * 200), // Random speed between 100-300s
            speedGlitched: Math.floor(80 + Math.random() * 150), // Random speed between 80-230s
            economyMoney: Math.floor(Math.random() * 50000),
            economyPoints: Math.floor(Math.random() * 10000),
            cosmeticsUnusuals: Math.floor(Math.random() * 5),
            cosmeticsAccessories: Math.floor(Math.random() * 10),
            timeAlive: Math.floor(Math.random() * 100000),
        },
        badges: ["beta_tester"], // Default badge
        lastActive: new Date(),
        joinedDate: new Date(),
        isVerifiedPlayer: false,
        isBlacklisted: false,
    };
    setPlayers(prev => [...prev, newPlayer]);
    return { success: true, message: `Test user "${username}" created successfully with password "testpassword".`, player: newPlayer };
  }, [players]);

  const deletePlayer = useCallback((playerId: string) => {
    setPlayers(prev => prev.filter(p => p.id !== playerId));
    if (currentUser?.id === playerId) {
        logoutUser(); 
    }
  }, [currentUser, logoutUser]);

  const setPlayerBlacklistedStatus = useCallback((playerId: string, isBlacklisted: boolean) => {
    setPlayers(prev => prev.map(p => {
        if (p.id === playerId) {
            const updatedPlayer = { ...p, isBlacklisted };
            if (currentUser?.id === playerId && isBlacklisted) {
                logoutUser(); 
            }
            return updatedPlayer;
        }
        return p;
    }));
  }, [currentUser, logoutUser]);

  const updatePlayerProfile = useCallback(async (playerId: string, data: PlayerProfileUpdateData): Promise<{success: boolean; message?: string}> => {
    const playerToUpdate = players.find(p => p.id === playerId);
    if (!playerToUpdate) return { success: false, message: "Player not found."};

    if (data.username && data.username !== playerToUpdate.username) {
        const existingUser = players.find(p => p.username.toLowerCase() === data.username!.toLowerCase() && p.id !== playerId);
        if (existingUser) {
            return { success: false, message: "Username already taken." };
        }
    }
    
    setPlayers(prevPlayers => prevPlayers.map(p => {
        if (p.id === playerId) {
            const updatedPlayer = { 
                ...p, 
                ...data, 
                username: data.username || p.username, 
                selectedUsernameTagId: data.selectedUsernameTagId !== undefined ? data.selectedUsernameTagId : p.selectedUsernameTagId 
            };
            if (currentUser?.id === playerId) setCurrentUser(updatedPlayer); 
            return updatedPlayer;
        }
        return p;
    }));
    return { success: true, message: "Profile updated." };
  }, [players, currentUser, setCurrentUser]);


  const togglePlayerVerification = useCallback((playerId: string) => {
    setPlayers(prevPlayers => prevPlayers.map(p => {
      if (p.id === playerId) {
        const updatedPlayer = { ...p, isVerifiedPlayer: !p.isVerifiedPlayer };
        if (currentUser?.id === playerId) setCurrentUser(updatedPlayer);
        return updatedPlayer;
      }
      return p;
    }));
  }, [currentUser, setCurrentUser]);

  const updatePlayerTier = useCallback((playerId: string, tier: TierLevel) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const updatedPlayer = { ...p, tier };
         if (currentUser?.id === playerId) setCurrentUser(updatedPlayer);
        return updatedPlayer;
      }
      return p;
    }));
  }, [currentUser, setCurrentUser]);

  const resetPlayerStats = useCallback((playerId: string) => {
    let playerUsername = "User";
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        playerUsername = p.username;
        const updatedPlayer = { 
            ...p, 
            stats: { 
                speedNormal: 0, 
                speedGlitched: 0, 
                economyMoney: 0, 
                economyPoints: 0, 
                cosmeticsUnusuals: 0, 
                cosmeticsAccessories: 0, 
                timeAlive: p.stats.timeAlive // Preserve timeAlive
            } 
        };
         if (currentUser?.id === playerId) setCurrentUser(updatedPlayer);
        return updatedPlayer;
      }
      return p;
    }));
    alert(`Stats for ${playerUsername} have been reset. Speed, Economy, and Cosmetics are now 0. Time Alive preserved.`);
  }, [currentUser, setCurrentUser]);

  const addPlayerBadge = useCallback((playerId: string, badgeId: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const updatedPlayer = { ...p, badges: [...new Set([...p.badges, badgeId])] };
        if (currentUser?.id === playerId) setCurrentUser(updatedPlayer);
        return updatedPlayer;
      }
      return p;
    }));
  }, [currentUser, setCurrentUser]);

  const removePlayerBadge = useCallback((playerId: string, badgeId: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const updatedPlayer = { ...p, badges: p.badges.filter(b => b !== badgeId) };
        if (currentUser?.id === playerId) setCurrentUser(updatedPlayer);
        return updatedPlayer;
      }
      return p;
    }));
  }, [currentUser, setCurrentUser]);
  
  const updatePlayer = useCallback(async (updatedPlayerData: Player): Promise<{success: boolean; message?: string}> => {
    const originalPlayer = players.find(p => p.id === updatedPlayerData.id);
    if (!originalPlayer) return { success: false, message: "Original player not found." };

    if (updatedPlayerData.username !== originalPlayer.username) {
        if (currentUser?.id !== updatedPlayerData.id) {
             return { success: false, message: "Admins cannot change other users' usernames." };
        }
        const existingUserWithNewName = players.find(p => p.username.toLowerCase() === updatedPlayerData.username.toLowerCase() && p.id !== updatedPlayerData.id);
        if (existingUserWithNewName) {
            return { success: false, message: `Username "${updatedPlayerData.username}" is already taken.` };
        }
    }

    setPlayers(prev => prev.map(p => (p.id === updatedPlayerData.id ? updatedPlayerData : p)));
    if (currentUser?.id === updatedPlayerData.id) {
        setCurrentUser(updatedPlayerData);
    }
    return { success: true, message: "Player updated successfully."};
  }, [players, currentUser, setCurrentUser]);

  const addClan = useCallback((clanData: ClanApplicationData) => { 
    const newClan: Clan = { ...clanData, id: `clan${Date.now()}`, memberCount: 1, members: [clanData.leaderId], activityStatus: "Recruiting", foundedDate: new Date(), isVerified: false };
    setClans(prev => [...prev, newClan]);
    setPlayers(prevPlayers => prevPlayers.map(p => p.id === clanData.leaderId ? {...p, clanId: newClan.id} : p));
  }, []);

  const approveClan = useCallback((clanId: string) => setClans(prev => prev.map(c => c.id === clanId ? { ...c, isVerified: true } : c)), []);
  const rejectClan = useCallback((clanId: string, reason: string) => { console.log(`Clan ${clanId} rejected. Reason: ${reason}`); setSubmissions(prev => prev.filter(s => !(s.type === "ClanApplication" && (s.data as ClanApplicationData).name === clans.find(c=>c.id===clanId)?.name))); }, [clans]);
  const toggleClanVerification = useCallback((clanId: string) => setClans(prev => prev.map(c => c.id === clanId ? { ...c, isVerified: !c.isVerified } : c)), []);
  const addWorldRecord = useCallback((recordData: RecordVerificationData) => { const newRecord: WorldRecord = { ...recordData, id: `wr${Date.now()}`, timestamp: new Date(), isVerified: false }; setWorldRecords(prev => [...prev, newRecord]); }, []);
  const approveRecord = useCallback((recordId: string) => setWorldRecords(prev => prev.map(r => r.id === recordId ? { ...r, isVerified: true } : r)), []);
  const rejectRecord = useCallback((recordId: string, reason: string) => { console.log(`Record ${recordId} rejected. Reason: ${reason}`); setSubmissions(prev => prev.filter(s => !(s.type === "RecordVerification" && (s.data as RecordVerificationData).proofUrl === worldRecords.find(wr=>wr.id===recordId)?.proofUrl ))); }, [worldRecords]);

  const submitClanApplication = useCallback((clanData: Omit<Clan, 'id' | 'memberCount' | 'members' | 'activityStatus' | 'foundedDate' | 'isVerified' | 'leaderId'>, leaderId: string) => { if (!currentUser) return; const newSubmission: Submission<ClanApplicationData> = { id: `sub_clan_${Date.now()}`, type: "ClanApplication", data: {...clanData, leaderId}, submittedBy: currentUser.id, submissionDate: new Date(), status: SubmissionStatus.PENDING }; setSubmissions(prev => [newSubmission, ...prev]); }, [currentUser]);
  const submitRecord = useCallback((recordData: Omit<WorldRecord, 'id' | 'timestamp' | 'isVerified'>) => { if (!currentUser) return; const newSubmission: Submission<RecordVerificationData> = { id: `sub_rec_${Date.now()}`, type: "RecordVerification", data: recordData, submittedBy: currentUser.id, submissionDate: new Date(), status: SubmissionStatus.PENDING }; setSubmissions(prev => [newSubmission, ...prev]); }, [currentUser]);
  const submitStatUpdateProof = useCallback((data: StatUpdateProofData) => { if (!currentUser) return; const newSubmission: Submission<StatUpdateProofData> = { id: `sub_stat_${Date.now()}`, type: "StatUpdateProof", data, submittedBy: currentUser.id, submissionDate: new Date(), status: SubmissionStatus.PENDING }; setSubmissions(prev => [newSubmission, ...prev]); }, [currentUser]);
  
  const processSubmission = useCallback((submissionId: string, newStatus: SubmissionStatus, reason?: string) => {
    setSubmissions(prevSubmissions => 
        prevSubmissions.map(sub => {
            if (sub.id === submissionId) {
                if (newStatus === SubmissionStatus.APPROVED) {
                    if (sub.type === "ClanApplication") addClan(sub.data as ClanApplicationData); 
                    else if (sub.type === "RecordVerification") {
                        const tempRecord: WorldRecord = { ...(sub.data as RecordVerificationData), id: `wr_approved_${Date.now()}`, timestamp: new Date(), isVerified: true };
                        setWorldRecords(prevRecords => [tempRecord, ...prevRecords]);
                    } else if (sub.type === "StatUpdateProof") {
                        const { playerId, category, subCategory, newValue, mapName } = sub.data as StatUpdateProofData;
                        console.log(`Processing stat update for player ${playerId} in category ${category} (${subCategory}) ${mapName ? `on map ${mapName}` : ''} with value ${newValue}.`);
                        if (mapName && category === LeaderboardCategory.SPEED) {
                            console.warn(`Map-specific stat storage for map '${mapName}' is pending data structure update. Applying to general '${subCategory}' stat for now.`);
                        }
                        setPlayers(prevPlayers => prevPlayers.map(p => {
                            if (p.id === playerId) {
                                const newStats: PlayerStats = {...p.stats};
                                if (category === LeaderboardCategory.SPEED) {
                                    // Current PlayerStats structure only supports general speedNormal/Glitched.
                                    // Map-specific logic would require newStats.speedNormal[mapName] = newValue;
                                    if (subCategory === SpeedSubCategory.NORMAL) newStats.speedNormal = newValue;
                                    else if (subCategory === SpeedSubCategory.GLITCHED) newStats.speedGlitched = newValue;
                                } else if (category === LeaderboardCategory.ECONOMY) {
                                    if (subCategory === EconomySubCategory.MONEY) newStats.economyMoney = newValue;
                                    else if (subCategory === EconomySubCategory.POINTS) newStats.economyPoints = newValue;
                                } else if (category === LeaderboardCategory.COSMETICS) {
                                    if (subCategory === CosmeticsSubCategory.UNUSUALS) newStats.cosmeticsUnusuals = newValue;
                                    else if (subCategory === CosmeticsSubCategory.ACCESSORIES) newStats.cosmeticsAccessories = newValue;
                                }
                                const updatedPlayer = {...p, stats: newStats};
                                if(currentUser?.id === playerId) setCurrentUser(updatedPlayer);
                                return updatedPlayer;
                            }
                            return p;
                        }));
                    }
                }
                return { ...sub, status: newStatus, moderatorReason: reason };
            }
            return sub;
        })
    );
  }, [addClan, currentUser, setCurrentUser]); 

  const createBadge = useCallback((badgeData: Omit<Badge, 'id'>) => { 
    const newBadge: Badge = { ...badgeData, id: `badge_${Date.now()}_${badgeData.name.replace(/\s+/g, '_')}` }; 
    setBadges(prev => [...prev, newBadge]); 
  }, []);

  const updateBadge = useCallback((badgeId: string, badgeData: Partial<Omit<Badge, 'id'>>) => {
    setBadges(prevBadges => prevBadges.map(b => {
        if (b.id === badgeId) {
            return { ...b, ...badgeData };
        }
        return b;
    }));
  }, []);

  const deleteBadge = useCallback((badgeId: string) => {
    const badgeToDelete = badges.find(b => b.id === badgeId);
    if (!badgeToDelete) {
        console.error(`[AppContext] Badge with ID ${badgeId} not found for deletion.`);
        alert(`Error: Badge with ID ${badgeId} not found.`);
        return; 
    }

    setBadges(prev => prev.filter(b => b.id !== badgeId));
    setPlayers(prevPlayers => prevPlayers.map(p => ({
      ...p,
      badges: p.badges.filter(bId => bId !== badgeId),
      selectedUsernameTagId: (p.selectedUsernameTagId && badgeToDelete.colorTagId === p.selectedUsernameTagId) ? undefined : p.selectedUsernameTagId
    })));
    alert(`Badge '${badgeToDelete.name}' has been deleted.`);
  }, [badges]);


  const updateSiteSettings = useCallback((settingsUpdate: Partial<SiteSettings>) => setSiteSettings(prev => ({ ...prev, ...settingsUpdate })), []);
  const createUsernameColorTag = useCallback((tagData: Omit<UsernameColorTag, 'id'>) => { const newTag: UsernameColorTag = { ...tagData, id: `uct_${Date.now()}` }; setUsernameColorTags(prev => [...prev, newTag]); }, []);
  const deleteUsernameColorTag = useCallback((tagId: string) => { setUsernameColorTags(prev => prev.filter(tag => tag.id !== tagId)); setPlayers(prevPlayers => prevPlayers.map(p => { if (p.selectedUsernameTagId === tagId) { const updatedPlayer = {...p, selectedUsernameTagId: undefined}; if(currentUser?.id === p.id) setCurrentUser(updatedPlayer); return updatedPlayer; } return p; })); }, [currentUser, setCurrentUser]);

  const getConversationsForUser = useCallback((userId: string): Conversation[] => conversations.filter(convo => convo.participantIds.includes(userId)).sort((a, b) => b.lastMessageTimestamp.getTime() - a.lastMessageTimestamp.getTime()), [conversations]);
  const getMessagesInConversation = useCallback((conversationId: string): Message[] => messages.filter(msg => msg.conversationId === conversationId).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()), [messages]);

  const getOrCreateConversation = useCallback(async (participantIds: string[]): Promise<string> => {
    setLoading(true);
    return new Promise((resolve) => {
        setTimeout(() => {
            if (!currentUser || participantIds.length < 2) {
                 setLoading(false); resolve(''); 
                 return;
            }
            
            const sortedParticipantIds = [...new Set(participantIds)].sort();

            const existingConversation = conversations.find(c => {
                const sortedConvoParticipants = [...new Set(c.participantIds)].sort();
                return sortedConvoParticipants.length === sortedParticipantIds.length &&
                       sortedConvoParticipants.every((id, index) => id === sortedParticipantIds[index]);
            });

            if (existingConversation) {
                setLoading(false);
                resolve(existingConversation.id);
                return;
            }

            const newConvoId = `convo_${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const unreadCounts: UnreadCounts = {};
            sortedParticipantIds.forEach(id => {
                if (id !== currentUser.id) unreadCounts[id] = 0; 
            });

            const newConversation: Conversation = {
                id: newConvoId,
                participantIds: sortedParticipantIds, 
                lastMessageText: "Conversation started.",
                lastMessageTimestamp: new Date(),
                lastMessageSenderId: currentUser.id, 
                unreadCountByParticipant: { ...unreadCounts, [currentUser.id]: 0 },
            };
            setConversations(prev => [newConversation, ...prev]);
            setLoading(false);
            resolve(newConvoId);
        }, 250);
    });
  }, [currentUser, conversations, setLoading]);


  const sendMessage = useCallback(async (conversationId: string, text: string): Promise<boolean> => {
    if (!currentUser) return false;
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        const conversation = conversations.find(c => c.id === conversationId);
        if (!conversation) {
          setLoading(false);
          resolve(false);
          return;
        }

        const newMsgId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const newMessageTimestamp = new Date();
        
        const updatedUnreadCounts: UnreadCounts = { ...(conversation.unreadCountByParticipant || {}) };
        conversation.participantIds.forEach(pid => {
            if (pid !== currentUser.id) {
                updatedUnreadCounts[pid] = (updatedUnreadCounts[pid] || 0) + 1;
            } else {
                updatedUnreadCounts[pid] = 0; 
            }
        });

        const updatedConversation: Conversation = {
            ...conversation,
            lastMessageText: text,
            lastMessageTimestamp: newMessageTimestamp,
            lastMessageSenderId: currentUser.id,
            unreadCountByParticipant: updatedUnreadCounts
        };
        
        setConversations(prev => prev.map(c => c.id === conversationId ? updatedConversation : c));
        
        const newMessage: Message = { id: newMsgId, conversationId: conversation.id, senderId: currentUser.id, text, timestamp: newMessageTimestamp };
        setMessages(prev => [...prev, newMessage]);
        setLoading(false);
        resolve(true);
      }, 150); 
    });
  }, [currentUser, conversations, messages, setLoading]);


  const markMessagesAsRead = useCallback((conversationId: string, userId: string) => { setConversations(prevConvos => prevConvos.map(convo => { if (convo.id === conversationId) { const updatedUnreadCounts = { ...(convo.unreadCountByParticipant || {}) }; updatedUnreadCounts[userId] = 0; return { ...convo, unreadCountByParticipant: updatedUnreadCounts }; } return convo; })); }, []);
  const getUnreadMessagesCount = useCallback((userId: string): number => conversations.reduce((total, convo) => { if (convo.participantIds.includes(userId) && convo.unreadCountByParticipant?.[userId]) { return total + convo.unreadCountByParticipant[userId]; } return total; }, 0), [conversations]);

  const createAnnouncement = useCallback((announcementData: Omit<Announcement, 'id' | 'creationDate' | 'isActive'>): Announcement => {
    const newAnnouncement: Announcement = {
      ...announcementData,
      id: `announce_${Date.now()}`,
      creationDate: new Date(),
      isActive: false, 
    };
    setAnnouncements(prev => [newAnnouncement, ...prev]);
    return newAnnouncement; 
  }, []);

  const updateAnnouncement = useCallback((updatedAnnouncement: Announcement) => {
    setAnnouncements(prev => prev.map(ann => ann.id === updatedAnnouncement.id ? updatedAnnouncement : ann));
  }, []);

  const deleteAnnouncementFromState = useCallback((announcementId: string) => { 
    setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
  }, []);

  const publishAnnouncement = useCallback((announcementId: string, durationMinutes?: number) => {
    setAnnouncements(prev => prev.map(ann => {
      if (ann.id === announcementId) {
        return {
          ...ann,
          isActive: true,
          displayUntil: durationMinutes ? new Date(Date.now() + durationMinutes * 60000) : undefined,
        };
      }
      return ann;
    }));
  }, []);

  const dismissGlobalAnnouncement = useCallback((announcementId: string) => {
    setAnnouncements(prev => prev.map(ann => ann.id === announcementId ? { ...ann, isActive: false } : ann));
  }, []);
  
  const getActiveGlobalAnnouncements = useCallback((): Announcement[] => {
    return announcements.filter(ann => ann.isActive && (!ann.displayUntil || new Date(ann.displayUntil) > new Date()));
  }, [announcements]);

  const refreshLeaderboard = useCallback(async () => {
    // This is a conceptual placeholder for now.
    // In a real app, this might re-fetch data, re-calculate rankings, etc.
    console.log("Leaderboard refresh initiated by admin command...");
    setLoading(true);
    // Simulate some async work
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setLoading(false);
    console.log("Leaderboard refresh complete.");
    // Potentially trigger a re-render of leaderboard components if necessary,
    // though React's state updates should handle this if data sources change.
  }, []);

  const resetLeaderboardForSeason = useCallback(async () => {
    setLoading(true);
    console.log("Initiating season reset for leaderboards and stats...");
    
    // 1. Clear all World Records
    setWorldRecords([]);
    console.log("All world records have been cleared.");

    // 2. Reset relevant player stats
    setPlayers(prevPlayers => 
      prevPlayers.map(player => ({
        ...player,
        stats: {
          ...player.stats,
          speedNormal: 0,
          speedGlitched: 0,
          economyMoney: 0,
          economyPoints: 0,
          // Keep cosmetics and timeAlive
        }
      }))
    );
    console.log("Player speed and economy stats have been reset to 0 for all players.");

    // Potentially add other season reset tasks here (e.g., archive old data, update season counters)
    
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate async operations
    setLoading(false);
    console.log("Season reset complete.");
    alert("Leaderboards and player stats (Speed, Economy) have been reset for the new season. World Records cleared.");
  }, []);

  const updateLeaderboardWeights = useCallback((newWeights: LeaderboardWeights) => {
    const totalWeight = Object.values(newWeights).reduce((sum, w) => sum + w, 0);
    if (totalWeight !== 100) {
      alert("Error: Leaderboard weights must sum to 100%. Please adjust.");
      // Optionally, don't update if they don't sum to 100, or normalize them.
      // For now, we'll still set them but the admin UI should prevent this state.
    }
    setLeaderboardWeights(newWeights);
    alert("Leaderboard weights updated. Overall scores will reflect this change on next calculation/view.");
  }, []);


  const executeAdminCommand = useCallback(async (command: string): Promise<{success: boolean, message: string}> => {
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (cmd === "/help") {
        const helpMessage = `Available commands:\n` +
                            `/ban <username> [reason] - Bans a user.\n` +
                            `/unban <username> - Unbans a user.\n` +
                            `/badge add <username> <badge_id> - Adds a badge to a user.\n` +
                            `/badge remove <username> <badge_id> - Removes a badge from a user.\n` +
                            `/badge delete <badge_id> - Deletes a badge definition globally.\n` +
                            `/tier <username> <T1|T2|T3|T4|T5> - Sets a user's tier.\n` +
                            `/setrank <username> <T1|T2|T3|T4|T5> - Alias for /tier.\n` +
                            `/verify_player <username> <true|false> - Sets player verification status.\n` +
                            `/announce <type> <message> - Creates and publishes a global announcement (type: info, success, warning, error).\n` +
                            `/refreshleaderboard - Simulates a leaderboard refresh.\n` +
                            `/resetseason - Resets all leaderboards and key player stats for a new season (USE WITH CAUTION).\n`+
                            `/addtestuser <username> - Creates a new test user with default password "testpassword".\n` +
                            `/removetestuser <username> - Deletes a user.\n` +
                            `/resetstats <username> - Resets gameplay stats for a user.`;
        return { success: true, message: helpMessage };
    }
     if (cmd === "/resetseason") {
        const confirmReset = window.confirm("CRITICAL: Are you sure you want to reset all World Records and key player stats (Speed, Economy) for a new season? This action is IRREVERSIBLE and will affect all users.");
        if (confirmReset) {
            const doubleConfirm = window.prompt("To confirm, type 'RESET ALL DATA' in all caps:");
            if (doubleConfirm === "RESET ALL DATA") {
                await resetLeaderboardForSeason();
                return { success: true, message: "Season reset process initiated. World Records cleared, player Speed/Economy stats reset." };
            } else {
                return { success: false, message: "Season reset cancelled. Confirmation phrase incorrect." };
            }
        } else {
            return { success: false, message: "Season reset cancelled by user." };
        }
    }


    if (cmd === "/removetestuser") {
        if (args.length < 1) return { success: false, message: "Usage: /removetestuser <username>" };
        const playerToDelete = players.find(p => p.username.toLowerCase() === args[0].toLowerCase());
        if (!playerToDelete) return { success: false, message: `Player '${args[0]}' not found.` };
        deletePlayer(playerToDelete.id);
        return { success: true, message: `User ${playerToDelete.username} removed successfully.` };
    }

    if (cmd === "/ban") {
        if (args.length < 1) return { success: false, message: "Usage: /ban <username> [reason]" };
        const playerToBan = players.find(p => p.username.toLowerCase() === args[0].toLowerCase());
        if (!playerToBan) return { success: false, message: `Player '${args[0]}' not found.` };
        setPlayerBlacklistedStatus(playerToBan.id, true);
        return { success: true, message: `Player ${playerToBan.username} banned. Reason: ${args.slice(1).join(' ') || 'No reason provided.'}` };
    }
    if (cmd === "/unban") {
        if (args.length < 1) return { success: false, message: "Usage: /unban <username>" };
        const playerToUnban = players.find(p => p.username.toLowerCase() === args[0].toLowerCase());
        if (!playerToUnban) return { success: false, message: `Player '${args[0]}' not found.` };
        setPlayerBlacklistedStatus(playerToUnban.id, false);
        return { success: true, message: `Player ${playerToUnban.username} unbanned.` };
    }
    if (cmd === "/badge") {
        if (args.length < 2) return { success: false, message: "Usage: /badge <add|remove|delete> <args...>" };
        const subCmd = args[0].toLowerCase();
        if (subCmd === 'add' || subCmd === 'remove') {
            if (args.length < 3) return { success: false, message: `Usage: /badge ${subCmd} <username> <badge_id>` };
            const playerForBadge = players.find(p => p.username.toLowerCase() === args[1].toLowerCase());
            if (!playerForBadge) return { success: false, message: `Player '${args[1]}' not found.` };
            const badge = badges.find(b => b.id.toLowerCase() === args[2].toLowerCase());
            if (!badge) return { success: false, message: `Badge ID '${args[2]}' not found.` };
            if (subCmd === 'add') {
                addPlayerBadge(playerForBadge.id, badge.id);
                return { success: true, message: `Badge '${badge.name}' added to ${playerForBadge.username}.` };
            } else {
                removePlayerBadge(playerForBadge.id, badge.id);
                return { success: true, message: `Badge '${badge.name}' removed from ${playerForBadge.username}.` };
            }
        } else if (subCmd === 'delete') {
            if (args.length < 2) return { success: false, message: "Usage: /badge delete <badge_id>" };
            const badgeIdToDelete = args[1];
            const badgeToDelete = badges.find(b => b.id.toLowerCase() === badgeIdToDelete.toLowerCase());
            if (!badgeToDelete) return { success: false, message: `Badge ID '${badgeIdToDelete}' not found.` };
            deleteBadge(badgeToDelete.id); // deleteBadge function already shows an alert
            return { success: true, message: `Badge '${badgeToDelete.name}' (ID: ${badgeToDelete.id}) scheduled for deletion.` };
        } else {
            return { success: false, message: "Invalid /badge subcommand. Use add, remove, or delete." };
        }
    }
    if (cmd === "/tier" || cmd === "/setrank") { 
        if (args.length < 2) return { success: false, message: "Usage: /tier <username> <T1|T2|T3|T4|T5>" };
        const playerForTier = players.find(p => p.username.toLowerCase() === args[0].toLowerCase());
        if (!playerForTier) return { success: false, message: `Player '${args[0]}' not found.` };
        const tier = args[1].toUpperCase() as TierLevel;
        if (!Object.values(TierLevel).includes(tier)) return { success: false, message: "Invalid tier. Use T1, T2, T3, T4, or T5." };
        updatePlayerTier(playerForTier.id, tier);
        return { success: true, message: `${playerForTier.username} tier set to ${tier}.` };
    }
     if (cmd === "/verify_player") {
        if (args.length < 2) return { success: false, message: "Usage: /verify_player <username> <true|false>" };
        const playerToVerify = players.find(p => p.username.toLowerCase() === args[0].toLowerCase());
        if (!playerToVerify) return { success: false, message: `Player '${args[0]}' not found.`};
        const verifyStatus = args[1].toLowerCase() === 'true';
        setPlayers(prev => prev.map(p => p.id === playerToVerify.id ? {...p, isVerifiedPlayer: verifyStatus} : p));
        if(currentUser?.id === playerToVerify.id) {
          setCurrentUser({...playerToVerify, isVerifiedPlayer: verifyStatus});
        }
        return { success: true, message: `Player ${playerToVerify.username} verification status set to ${verifyStatus}.` };
    }
    if (cmd === "/announce") {
        if (args.length < 2) return { success: false, message: "Usage: /announce <type (info|success|warning|error)> <message>" };
        const announcementType = args[0].toLowerCase() as AnnouncementType;
        if (!['info', 'success', 'warning', 'error'].includes(announcementType)) return { success: false, message: "Invalid announcement type. Use info, success, warning, or error."};
        const messageContent = args.slice(1).join(' ');
        const newAnnData: Omit<Announcement, 'id' | 'creationDate' | 'isActive'> = {
            title: `${announcementType.charAt(0).toUpperCase() + announcementType.slice(1)} Announcement`,
            message: messageContent,
            type: announcementType,
            isDismissible: true,
        };
        const createdAnnouncement = createAnnouncement(newAnnData); 
        if (createdAnnouncement) {
             publishAnnouncement(createdAnnouncement.id, 60); 
        } else {
             console.warn("Could not reliably find the announcement to publish by command.");
        }
        return { success: true, message: `Announcement of type '${announcementType}' published: ${messageContent}` };
    }
    if (cmd === "/refreshleaderboard") {
        await refreshLeaderboard();
        return { success: true, message: "Leaderboard refresh process initiated." };
    }
    if (cmd === "/addtestuser") {
        if (args.length < 1) return { success: false, message: "Usage: /addtestuser <username>" };
        const result = await createTestUser(args[0]);
        return { // Ensure the returned object matches executeAdminCommand's return type
            success: result.success,
            message: result.message, // result.message is now string
        };
    }
    if (cmd === "/resetstats") {
        if (args.length < 1) return { success: false, message: "Usage: /resetstats <username>" };
        const playerToReset = players.find(p => p.username.toLowerCase() === args[0].toLowerCase());
        if (!playerToReset) return { success: false, message: `Player '${args[0]}' not found.` };
        resetPlayerStats(playerToReset.id); // resetPlayerStats already shows an alert
        return { success: true, message: `Stats reset initiated for ${playerToReset.username}.` };
    }


    return { success: false, message: `Unknown command: ${cmd}` };
  } 
  , [players, badges, addPlayerBadge, removePlayerBadge, deleteBadge, updatePlayerTier, setPlayerBlacklistedStatus, createAnnouncement, publishAnnouncement, refreshLeaderboard, createTestUser, resetPlayerStats, setPlayers, currentUser, setCurrentUser, deletePlayer, resetLeaderboardForSeason]);


  return (
    <AppContext.Provider value={{
      players, clans, worldRecords, badges, submissions, siteSettings, loading, currentUser, isAdmin, isStaff,
      usernameColorTags, createUsernameColorTag, deleteUsernameColorTag,
      loginUser, logoutUser, signUpUser,
      createPlayer, createTestUser, deletePlayer, setPlayerBlacklistedStatus,
      updatePlayerTier, resetPlayerStats, addPlayerBadge, removePlayerBadge, updatePlayer, updatePlayerProfile, togglePlayerVerification,
      approveClan, rejectClan, toggleClanVerification, addClan,
      approveRecord, rejectRecord, addWorldRecord,
      submitClanApplication, submitRecord, submitStatUpdateProof, processSubmission,
      createBadge, updateBadge, deleteBadge, 
      updateSiteSettings,
      conversations, messages, getConversationsForUser, getMessagesInConversation, sendMessage, markMessagesAsRead, getUnreadMessagesCount,
      getOrCreateConversation,
      announcements, createAnnouncement, updateAnnouncement, deleteAnnouncement: deleteAnnouncementFromState, publishAnnouncement, dismissGlobalAnnouncement, getActiveGlobalAnnouncements,
      leaderboardWeights, updateLeaderboardWeights,
      executeAdminCommand, refreshLeaderboard, resetLeaderboardForSeason
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = React.useContext(AppContext);
  if (context === undefined) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};