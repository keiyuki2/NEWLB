
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Player, Conversation, Message } from '../../types';
import { Card } from '../ui/Card';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { RobloxAvatar } from '../ui/RobloxAvatar';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { NewStaffChatModal } from './NewStaffChatModal'; 

const ConversationListItem: React.FC<{ 
    conversation: Conversation; 
    onSelect: () => void; 
    isSelected: boolean; 
    otherParticipants: Player[]; // Changed from single participant
    currentUser: Player;
}> = ({ conversation, onSelect, isSelected, otherParticipants, currentUser }) => {
    const unreadCount = conversation.unreadCountByParticipant?.[currentUser.id] || 0;
    const isGroupChat = conversation.participantIds.length > 2;
    
    let displayName = "Unknown Chat";
    let displayAvatar: React.ReactNode;

    if (isGroupChat) {
        displayName = conversation.name || otherParticipants.map(p => p.username).slice(0, 2).join(', ') + (otherParticipants.length > 2 ? `, +${otherParticipants.length - 2}` : '');
        displayAvatar = (
            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 text-lg">
                <i className="fas fa-users"></i>
            </div>
        );
    } else if (otherParticipants.length === 1) {
        const otherUser = otherParticipants[0];
        displayName = otherUser.username;
        displayAvatar = <RobloxAvatar robloxId={otherUser.robloxId} username={otherUser.username} size={40} customAvatarUrl={otherUser.customAvatarUrl} isVerifiedPlayer={otherUser.isVerifiedPlayer} />;
    } else {
        // Should not happen if conversation is valid
        displayName = "Empty Chat"; 
        displayAvatar = <div className="w-10 h-10 rounded-full bg-gray-700"></div>;
    }


    return (
        <button 
            onClick={onSelect}
            className={`w-full text-left p-3 flex items-center space-x-3 rounded-lg transition-colors duration-150
                ${isSelected ? 'bg-brand-primary/20' : 'hover:bg-dark-border/50'}`}
        >
            {displayAvatar}
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                    <h3 className={`text-sm font-semibold truncate ${isSelected ? 'text-brand-primary' : 'text-gray-100'}`}>
                        {displayName}
                    </h3>
                    {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <p className={`text-xs truncate ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                    {conversation.lastMessageSenderId === currentUser.id ? "You: " : ""}{conversation.lastMessageText || "No messages yet."}
                </p>
            </div>
            <span className={`text-[10px] ml-auto whitespace-nowrap ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                {new Date(conversation.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </button>
    );
};

const MessageBubble: React.FC<{ message: Message; isOwnMessage: boolean; sender?: Player }> = ({ message, isOwnMessage, sender }) => {
    return (
        <div className={`flex mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end space-x-2 max-w-[75%] ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwnMessage && sender && (
                    <RobloxAvatar robloxId={sender.robloxId} username={sender.username} size={28} customAvatarUrl={sender.customAvatarUrl} isVerifiedPlayer={sender.isVerifiedPlayer}/>
                )}
                 {!isOwnMessage && !sender && ( // Fallback for deleted user or loading state
                    <div className="w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 text-sm">?</div>
                )}
                <div className={`p-2.5 rounded-lg text-sm ${isOwnMessage ? 'bg-brand-primary text-white rounded-br-none' : 'bg-dark-surface text-gray-200 rounded-bl-none'}`}>
                    {!isOwnMessage && sender && <p className="text-xs font-semibold mb-0.5 text-brand-accent">{sender.username}</p>}
                    <p>{message.text}</p>
                    <p className={`text-[10px] mt-1 ${isOwnMessage ? 'text-purple-200' : 'text-gray-500'} text-right`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        </div>
    );
};


export const MessagesPage: React.FC = () => {
  const { currentUser, isStaff, players, getConversationsForUser, getMessagesInConversation, sendMessage, markMessagesAsRead, conversations: allConversations, getOrCreateConversation, loading } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversations = useMemo(() => {
    if (!currentUser || !isStaff) return [];
    return getConversationsForUser(currentUser.id);
  }, [currentUser, isStaff, getConversationsForUser, allConversations]); 

  const messagesInSelectedConvo = useMemo(() => {
    if (!selectedConversationId || !isStaff) return [];
    return getMessagesInConversation(selectedConversationId);
  }, [selectedConversationId, getMessagesInConversation, isStaff, allConversations]); // Added allConversations to refresh messages when conversation updates

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messagesInSelectedConvo]);

  useEffect(() => {
    if (!currentUser || !isStaff) {
      navigate('/', { replace: true });
      return;
    }

    const initialRecipientId = searchParams.get('with');
    if (initialRecipientId && currentUser) {
      const staffRecipient = players.find(p => p.id === initialRecipientId && (p.badges.includes('game_admin') || p.badges.includes('moderator')));
      if (staffRecipient) {
        getOrCreateConversation([currentUser.id, initialRecipientId]).then(convoId => {
            if (convoId) setSelectedConversationId(convoId);
        });
      }
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('with');
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, currentUser, players, isStaff, navigate, getOrCreateConversation]);


  useEffect(() => {
    if (selectedConversationId && currentUser && isStaff) {
      markMessagesAsRead(selectedConversationId, currentUser.id);
    }
  }, [selectedConversationId, currentUser, markMessagesAsRead, messagesInSelectedConvo.length, isStaff]);


  const handleSelectConversation = (convoId: string) => {
    setSelectedConversationId(convoId);
  };

  const handleStartChatWithStaff = async (staffPlayerIds: string[]) => {
    if (!currentUser || staffPlayerIds.length === 0) return;
    const allParticipantIds = [currentUser.id, ...staffPlayerIds];
    const uniqueParticipantIds = [...new Set(allParticipantIds)];

    if (uniqueParticipantIds.length < 2) return; // Need at least two unique people

    const convoId = await getOrCreateConversation(uniqueParticipantIds);
    if (convoId) {
        setSelectedConversationId(convoId);
    }
    setIsNewChatModalOpen(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser || !isStaff || !selectedConversationId) return;
    await sendMessage(selectedConversationId, replyText);
    setReplyText('');
  };

  if (!currentUser) {
    return <Card title="Messages"><p className="text-gray-400 text-center py-8">Please log in.</p></Card>;
  }
  if (!isStaff) {
    return <Card title="Access Denied"><p className="text-red-400 text-center py-8">Messaging is only available for staff members.</p></Card>;
  }

  const getParticipantObjects = (participantIds: string[]): Player[] => {
    return participantIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[];
  };
  
  let activeChatParticipants: Player[] = [];
  let currentConversationName: string = "Chat";

  if (selectedConversationId) {
    const conversation = conversations.find(c => c.id === selectedConversationId);
    if (conversation) {
        activeChatParticipants = getParticipantObjects(conversation.participantIds.filter(id => id !== currentUser.id));
        if (conversation.participantIds.length > 2) { // Group chat
            currentConversationName = conversation.name || activeChatParticipants.map(p => p.username).slice(0,3).join(', ') + (activeChatParticipants.length > 3 ? '...' : '');
        } else if (activeChatParticipants.length === 1) { // 1-on-1
            currentConversationName = activeChatParticipants[0].username;
        }
    }
  }


  return (
    <div className="flex h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)]"> 
      <div className="w-full md:w-1/3 lg:w-1/4 bg-dark-surface border-r border-dark-border flex flex-col">
        <div className="p-3 border-b border-dark-border flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-100">Staff Chats</h2>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setIsNewChatModalOpen(true)}
            leftIcon={<i className="fas fa-plus"></i>}
            className="border-gray-600 hover:border-gray-400"
          >
            New
          </Button>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-1">
          {loading && conversations.length === 0 && <div className="p-4"><LoadingSpinner text="Loading chats..."/></div>}
          {!loading && conversations.length === 0 && <p className="text-xs text-gray-500 text-center p-4">No conversations yet. Click 'New' to start one.</p>}
          {conversations.map(convo => {
            const otherParticipants = getParticipantObjects(convo.participantIds.filter(id => id !== currentUser.id));
            return (
              <ConversationListItem 
                key={convo.id} 
                conversation={convo} 
                onSelect={() => handleSelectConversation(convo.id)} 
                isSelected={selectedConversationId === convo.id}
                otherParticipants={otherParticipants}
                currentUser={currentUser}
              />
            );
          })}
        </div>
      </div>

      <div className="flex-grow flex flex-col bg-dark-bg">
        {selectedConversationId && activeChatParticipants.length > 0 ? (
          <>
            <div className="p-3 border-b border-dark-border flex items-center space-x-3 bg-dark-surface">
                {activeChatParticipants.length === 1 ? (
                    <RobloxAvatar robloxId={activeChatParticipants[0].robloxId} username={activeChatParticipants[0].username} size={36} customAvatarUrl={activeChatParticipants[0].customAvatarUrl} isVerifiedPlayer={activeChatParticipants[0].isVerifiedPlayer}/>
                ) : (
                    <div className="w-9 h-9 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 text-lg">
                        <i className="fas fa-users"></i>
                    </div>
                )}
                <div className="font-semibold text-gray-100 hover:text-brand-primary">
                    {currentConversationName}
                    {activeChatParticipants.length === 1 && <Link to={`/profile/${activeChatParticipants[0].id}`} className="ml-1 text-xs text-gray-400 hover:underline">(View Profile)</Link>}
                </div>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-2">
              {messagesInSelectedConvo.map(msg => (
                <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    isOwnMessage={msg.senderId === currentUser.id} 
                    sender={getParticipantObjects([msg.senderId])[0]}
                />
              ))}
              <div ref={messagesEndRef} />
               {(selectedConversationId && messagesInSelectedConvo.length === 0) && <p className="text-sm text-gray-500 text-center pt-10">No messages in this conversation yet. Say hello!</p>}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-t border-dark-border bg-dark-surface">
              <div className="flex space-x-2">
                <Input 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={`Message ${currentConversationName}...`}
                  className="flex-grow bg-dark-bg"
                  wrapperClassName="flex-grow"
                  aria-label={`Message ${currentConversationName}`}
                />
                <Button type="submit" variant="primary" disabled={!replyText.trim()} rightIcon={<i className="fas fa-paper-plane"></i>}>
                  Send
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-gray-500 p-8">
            <i className="fas fa-comments text-5xl mb-4"></i>
            <p className="text-lg">Select a conversation or start a new one</p>
            <p className="text-sm">Click the "New" button to chat with other staff members.</p>
          </div>
        )}
      </div>
      <NewStaffChatModal 
        isOpen={isNewChatModalOpen} 
        onClose={() => setIsNewChatModalOpen(false)}
        onStartChat={handleStartChatWithStaff}
      />
    </div>
  );
};