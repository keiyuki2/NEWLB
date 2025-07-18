
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { LeaderboardPage } from './components/leaderboard/LeaderboardPage';
import { ClansPage } from './components/clans/ClansPage';
import { ClanProfilePage } from './components/clans/ClanProfilePage';
import { WorldRecordsPage } from './components/world-records/WorldRecordsPage';
import { PlayerProfilePage } from './components/profile/PlayerProfilePage';
import { AdminPanelPage } from './components/admin/AdminPanelPage';
import { NAV_ITEMS } from './constants';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { RobloxAvatar } from './components/ui/RobloxAvatar';
import { Button } from './components/ui/Button';
import { LoginModal } from './components/auth/LoginModal';
import { SignUpModal } from './components/auth/SignUpModal';
import { SubmitPage } from './components/submit/SubmitPage';
import { BadgesDisplayPage } from './components/badges/BadgesDisplayPage';
import { BadgeIndexView } from './components/badges/BadgeIndexView';
import { MessagesPage } from './components/messages/MessagesPage';
import { Alert } from './components/ui/Alert';
import { Announcement } from './types';
import { CommandBar } from './components/admin/CommandBar';
import { OverallLeaderboardPage } from './components/leaderboard/OverallLeaderboardPage';


const GlobalAnnouncements: React.FC = () => {
  const { getActiveGlobalAnnouncements, dismissGlobalAnnouncement } = useAppContext();
  const activeAnnouncementsFromContext = useMemo(() => getActiveGlobalAnnouncements(), [getActiveGlobalAnnouncements]);

  const [managedAnnouncements, setManagedAnnouncements] = useState<Array<Announcement & { animationState?: 'entering' | 'exiting' | 'visible' }>>([]);

  useEffect(() => {
    setManagedAnnouncements(currentManaged => {
      const newManagedList: Array<Announcement & { animationState?: 'entering' | 'exiting' | 'visible' }> = [];
      const activeContextIds = new Set(activeAnnouncementsFromContext.map(a => a.id));

      currentManaged.forEach(managedAnn => {
        if (activeContextIds.has(managedAnn.id)) {
          if (managedAnn.animationState === 'exiting') {
             newManagedList.push({ ...managedAnn, animationState: 'entering' });
          } else {
            newManagedList.push({ ...managedAnn, animationState: managedAnn.animationState === 'entering' ? 'entering' : 'visible' });
          }
        } else if (managedAnn.animationState !== 'exiting') {
          newManagedList.push({ ...managedAnn, animationState: 'exiting' });
        } else {
           newManagedList.push(managedAnn);
        }
      });

      activeAnnouncementsFromContext.forEach(contextAnn => {
        if (!newManagedList.find(ma => ma.id === contextAnn.id)) {
          newManagedList.push({ ...contextAnn, animationState: 'entering' });
        }
      });
      
      return newManagedList.filter(ann => ann.animationState !== 'exiting' || activeContextIds.has(ann.id));
    });
  }, [activeAnnouncementsFromContext]);

  const handleAnimationEnd = (id: string, endedState: 'entering' | 'exiting') => {
    setManagedAnnouncements(currentManaged => {
      if (endedState === 'entering') {
        return currentManaged.map(ann => ann.id === id ? { ...ann, animationState: 'visible' } : ann);
      }
      if (endedState === 'exiting') {
        return currentManaged.filter(ann => ann.id !== id);
      }
      return currentManaged;
    });
  };
  
  const onAlertClose = (id: string) => {
    dismissGlobalAnnouncement(id); 
  };

  if (managedAnnouncements.filter(ann => ann.animationState !== 'exiting' || activeAnnouncementsFromContext.some(a => a.id === ann.id)).length === 0) return null;


  return (
    <div className="global-toast-container space-y-2">
      {managedAnnouncements.map(announcement => (
        <div 
            key={announcement.id} 
            className={`global-toast 
              ${announcement.animationState === 'entering' ? 'toast-entering' : ''}
              ${announcement.animationState === 'exiting' ? 'toast-exiting' : ''}`}
            onAnimationEnd={() => {
              if (announcement.animationState === 'entering' || announcement.animationState === 'exiting') {
                handleAnimationEnd(announcement.id, announcement.animationState);
              }
            }}
        >
            <Alert
                type={announcement.type}
                title={announcement.title}
                onClose={announcement.isDismissible ? () => onAlertClose(announcement.id) : undefined}
                className="shadow-xl"
            >
                {announcement.message}
            </Alert>
        </div>
      ))}
    </div>
  );
};


const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isAdmin, isStaff, loading, logoutUser, getUnreadMessagesCount, players } = useAppContext();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const unreadMessagesCount = useMemo(() => {
    if (currentUser && isStaff) { 
      return getUnreadMessagesCount(currentUser.id);
    }
    return 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, isStaff, getUnreadMessagesCount, useAppContext().conversations, useAppContext().messages]);


  const handleLogout = () => {
    logoutUser();
    setIsMobileMenuOpen(false);
  };

  const openLoginModal = () => {
    setIsSignUpModalOpen(false);
    setIsLoginModalOpen(true);
    setIsMobileMenuOpen(false);
  }
  const openSignUpModal = () => {
    setIsLoginModalOpen(false);
    setIsSignUpModalOpen(true);
    setIsMobileMenuOpen(false);
  }

  const visibleNavItems = useMemo(() => {
    return NAV_ITEMS.filter(item => {
      if (item.path === "/messages") return currentUser && isStaff;
      if (item.path === "/world-records") return currentUser && isAdmin; 
      return true;
    });
  }, [currentUser, isAdmin, isStaff]);

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <GlobalAnnouncements />
      <header className="bg-dark-header shadow-md sticky top-0 z-40 border-b border-dark-border">
        <nav className="container mx-auto px-4 h-16 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-white hover:text-brand-primary transition-colors flex items-center" onClick={() => setIsMobileMenuOpen(false)}>
            <img src="https://cdn2.steamgriddb.com/logo_thumb/2b8c692d740d1b9d09508dc9bdf180fa.png" alt="Evade Logo" className="h-10 object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-semibold transition-colors flex items-center hover:bg-dark-surface relative ${
                    isActive
                      ? 'text-white bg-dark-surface'
                      : 'text-gray-400 hover:text-white'
                  }`
                }
              >
                <i className={`${item.icon} mr-1.5 opacity-80`}></i>
                {item.label}
                {item.path === "/messages" && currentUser && isStaff && unreadMessagesCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 rounded-full leading-tight flex items-center justify-center min-w-[16px] h-4">
                    {unreadMessagesCount > 9 ? '9+' : unreadMessagesCount}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {loading && !currentUser ? <LoadingSpinner size="sm" /> : currentUser ? (
              <>
                {isAdmin && (
                    <NavLink
                        to="/admin"
                        className={({ isActive }) =>`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center hover:bg-dark-surface ${ isActive ? 'text-white bg-dark-surface' : 'text-gray-400 hover:text-white'}`}
                        title="Admin Panel"
                    >
                        <i className="fas fa-cog"></i>
                    </NavLink>
                )}
                <Link to={`/profile/${currentUser.id}`} className="flex items-center space-x-2 p-1 pr-3 bg-dark-surface rounded-full hover:bg-gray-700 transition-colors">
                  <RobloxAvatar
                    robloxId={currentUser.robloxId}
                    customAvatarUrl={currentUser.customAvatarUrl}
                    username={currentUser.username}
                    size={28}
                    className="border-none"
                    isVerifiedPlayer={currentUser.isVerifiedPlayer}
                  />
                  <span className="text-sm text-white font-medium">{currentUser.username}</span>
                </Link>
                <Button onClick={handleLogout} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white">Logout</Button>
              </>
            ) : (
              <>
                <Button onClick={openLoginModal} variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white">Login</Button>
                <Button onClick={openSignUpModal} variant="primary" size="sm">Sign Up</Button>
              </>
            )}
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white focus:outline-none p-2">
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-dark-surface/95 backdrop-blur-sm md:hidden">
          <div className="container mx-auto px-4 py-5 pt-20"> {/* Adjust pt to clear header */}
            <nav className="flex flex-col space-y-3">
              {visibleNavItems.map((item) => (
                <NavLink
                  key={`mobile-${item.path}`}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-md text-base font-medium transition-colors flex items-center hover:bg-dark-border relative ${
                      isActive
                        ? 'text-brand-primary bg-dark-border'
                        : 'text-gray-200 hover:text-white'
                    }`
                  }
                >
                  <i className={`${item.icon} mr-2 opacity-80 w-5 text-center`}></i>
                  {item.label}
                  {item.path === "/messages" && currentUser && isStaff && unreadMessagesCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </span>
                  )}
                </NavLink>
              ))}
              <hr className="border-dark-border my-3"/>
              {/* Mobile Auth Buttons */}
              {loading && !currentUser ? <div className="px-4 py-3"><LoadingSpinner size="sm" text="Loading user..."/></div> : currentUser ? (
                <>
                  {isAdmin && (
                     <NavLink to="/admin" onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-3 rounded-md text-base font-medium transition-colors flex items-center hover:bg-dark-border ${isActive ? 'text-brand-primary bg-dark-border' : 'text-gray-200 hover:text-white'}`}>
                        <i className="fas fa-cog mr-2 opacity-80 w-5 text-center"></i>Admin Panel
                     </NavLink>
                  )}
                  <NavLink to={`/profile/${currentUser.id}`} onClick={() => setIsMobileMenuOpen(false)} className={({ isActive }) => `px-4 py-3 rounded-md text-base font-medium transition-colors flex items-center hover:bg-dark-border ${isActive ? 'text-brand-primary bg-dark-border' : 'text-gray-200 hover:text-white'}`}>
                    <RobloxAvatar robloxId={currentUser.robloxId} customAvatarUrl={currentUser.customAvatarUrl} username={currentUser.username} size={24} className="mr-2 border-none" isVerifiedPlayer={currentUser.isVerifiedPlayer} />
                    My Profile
                  </NavLink>
                  <Button onClick={handleLogout} variant="outline" className="w-full justify-center mt-2 border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white">Logout</Button>
                </>
              ) : (
                <>
                  <Button onClick={openLoginModal} variant="outline" className="w-full justify-center border-gray-600 text-gray-300 hover:border-gray-400 hover:text-white">Login</Button>
                  <Button onClick={openSignUpModal} variant="primary" className="w-full justify-center mt-2">Sign Up</Button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 py-6 md:py-8">
        {children}
      </main>
      {currentUser && isAdmin && <CommandBar />} 
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onSwitchToSignUp={openSignUpModal} />
      <SignUpModal isOpen={isSignUpModalOpen} onClose={() => setIsSignUpModalOpen(false)} onSwitchToLogin={openLoginModal} />
    </div>
  );
};


const AppContent: React.FC = () => {
  const { loading: contextLoading, currentUser, isAdmin, isStaff, players } = useAppContext(); 

  if (contextLoading && !currentUser && typeof localStorage.getItem('evade_currentUser') !== 'string' ) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-dark-bg">
        <LoadingSpinner size="lg" text="Initializing Evade Systems..."/>
      </div>
    );
  }

  // Add key to Routes that depend on players list to force re-render
  const playerListKey = players.length;

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<LeaderboardPage key={`leaderboard-${playerListKey}`} />} />
        <Route path="/overall-leaderboard" element={<OverallLeaderboardPage key={`overall-${playerListKey}`} />} />
        <Route path="/clans" element={<ClansPage />} />
        <Route path="/clans/:clanId" element={<ClanProfilePage />} />
        <Route path="/world-records" element={currentUser && isAdmin ? <WorldRecordsPage /> : <Navigate to="/" replace />} />
        <Route path="/badges" element={<BadgesDisplayPage />} />
        <Route path="/badges/index" element={<BadgeIndexView />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/profile/:userId" element={<PlayerProfilePage />} />
        <Route path="/admin" element={currentUser && isAdmin ? <AdminPanelPage key={`adminpanel-${playerListKey}`} /> : <Navigate to="/" replace />} />
        <Route path="/messages" element={currentUser && isStaff ? <MessagesPage /> : <Navigate to="/" replace />} />
        <Route path="*" element={<div className="text-center py-10">
                                    <h1 className="text-4xl font-bold text-red-500">404 - Page Not Found</h1>
                                    <p className="text-gray-300 mt-2">The page you are looking for does not exist.</p>
                                    <Link to="/" className="mt-4 inline-block px-4 py-2 bg-brand-primary text-white rounded hover:bg-purple-700">Go Home</Link>
                                 </div>} />
      </Routes>
    </MainLayout>
  );
}


const App: React.FC = () => {
  return (
    <AppProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AppProvider>
  );
};

export default App;
