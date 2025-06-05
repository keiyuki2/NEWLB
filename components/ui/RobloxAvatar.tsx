
import React, { useState, useEffect } from 'react';

interface RobloxAvatarProps {
  robloxId?: string; 
  username: string;
  customAvatarUrl?: string | null; 
  isVerifiedPlayer?: boolean; // New prop for verification
  size?: number;
  className?: string;
  grayscaleFallback?: boolean;
}

export const RobloxAvatar: React.FC<RobloxAvatarProps> = ({
  robloxId,
  username,
  customAvatarUrl,
  isVerifiedPlayer = false,
  size = 48,
  className = '', // This className is applied to the wrapper div
  grayscaleFallback = true,
}) => {
  const [actualAvatarUrl, setActualAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=1f2937&color=E5E7EB&size=${size * 2}&rounded=true`;

  useEffect(() => {
    setError(null); 

    if (customAvatarUrl) {
      setActualAvatarUrl(customAvatarUrl);
      return; 
    }

    if (!robloxId || robloxId === "0" || robloxId === "" || !/^\d+$/.test(robloxId)) {
      setError(robloxId ? `Invalid Roblox ID: ${robloxId}` : 'No Roblox ID provided and no custom avatar.');
      setActualAvatarUrl(null); 
      return;
    }

    const fetchRobloxAvatar = async () => {
      setActualAvatarUrl(null); 
      
      const robloxApiUrl = `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${robloxId}&size=150x150&format=Png&isCircular=false`; // isCircular=true on API doesn't always work with proxies
      const proxiedUrl = `https://corsproxy.io/?${encodeURIComponent(robloxApiUrl)}`;
      
      try {
        const response = await fetch(proxiedUrl, { cache: 'default' });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Proxy error: ${response.status} ${response.statusText}.`);
        }

        const data = await response.json();
        if (data.data && data.data.length > 0 && data.data[0].imageUrl) {
          setActualAvatarUrl(data.data[0].imageUrl);
        } else if (data.data && data.data.length > 0 && data.data[0].state === "Error") {
          throw new Error(`Roblox API error for ID ${robloxId}: ${data.data[0].message || data.data[0].state}`);
        } else {
          throw new Error('Avatar URL not found in Roblox API response.');
        }
      } catch (err: any) {
        if (err instanceof TypeError && err.message === "Failed to fetch") {
            setError(`Network error: Could not reach the avatar service for ID ${robloxId}.`);
        } else {
            setError(err.message || `An unknown error occurred while fetching Roblox avatar for ID ${robloxId}.`);
        }
        setActualAvatarUrl(null); 
      }
    };

    fetchRobloxAvatar();
  }, [robloxId, customAvatarUrl, username]); 

  const effectiveUrl = actualAvatarUrl || placeholderUrl;
  const imageStyle = { width: `${size}px`, height: `${size}px` };

  return (
    <div className={`relative inline-block ${className}`} style={imageStyle}> {/* Wrapper div receives className */}
      <img
        src={effectiveUrl}
        alt={`${username}'s avatar`}
        style={{ ...imageStyle, display: 'block' }} 
        className={`rounded-full object-cover w-full h-full ${grayscaleFallback && error && !customAvatarUrl ? 'filter grayscale' : ''}`} // img is always rounded-full and fills wrapper
        onError={(e) => { 
          if (effectiveUrl !== placeholderUrl && !error) { 
              const newErrorMsg = `Error loading image source: ${effectiveUrl}. Falling back to placeholder.`;
              console.error(`RobloxAvatar: ${newErrorMsg}`);
              setError(newErrorMsg); 
              setActualAvatarUrl(null); 
          }
        }}
      />
      {isVerifiedPlayer && (
        <div 
            className="absolute -bottom-0.5 -right-0.5 bg-blue-500 rounded-full p-0.5 border-2 border-dark-bg"
            style={{ 
                width: size * 0.35, 
                height: size * 0.35, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
            }}
            title="Verified Player"
        >
          <i className="fas fa-check text-white" style={{ fontSize: size * 0.18 }}></i>
        </div>
      )}
    </div>
  );
};