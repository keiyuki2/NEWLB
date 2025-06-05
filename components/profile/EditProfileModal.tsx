
import React, { useState, ChangeEvent, FormEvent, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { Input, TextArea } from '../ui/Input';
import { Button } from '../ui/Button';
import { Player, PlayerProfileUpdateData, Badge as BadgeType, UsernameColorTag } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { SOCIAL_LINK_DEFINITIONS } from '../../constants';
import { RobloxAvatar } from '../ui/RobloxAvatar';
import { Select } from '../ui/Select';
import { Alert } from '../ui/Alert';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, player }) => {
  const { updatePlayerProfile, badges: allBadgesConfig, usernameColorTags } = useAppContext();
  
  const [username, setUsername] = useState(player.username); 
  const [pronouns, setPronouns] = useState(player.pronouns || '');
  const [location, setLocation] = useState(player.location || '');
  const [bio, setBio] = useState(player.bio || '');
  const [socialLinks, setSocialLinks] = useState(player.socialLinks || {});
  
  const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(player.customAvatarUrl || null);
  
  const [customBannerFile, setCustomBannerFile] = useState<File | null>(null);
  const [customBannerPreview, setCustomBannerPreview] = useState<string | null>(player.customProfileBannerUrl || null);
  
  const [selectedTagId, setSelectedTagId] = useState(player.selectedUsernameTagId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_BANNER_SIZE_MB = 5;
  const MAX_AVATAR_SIZE_MB = 2;

  const unlockedColorTags = useMemo(() => {
    const tags: UsernameColorTag[] = [];
    player.badges.forEach(badgeId => {
        const badge = allBadgesConfig.find(b => b.id === badgeId);
        if (badge?.colorTagId) {
            const tag = usernameColorTags.find(t => t.id === badge.colorTagId);
            if (tag && !tags.find(existing => existing.id === tag.id)) { // Avoid duplicates
                tags.push(tag);
            }
        }
    });
    return tags;
  }, [player.badges, allBadgesConfig, usernameColorTags]);

  const colorTagOptions = useMemo(() => [
    { value: "", label: "Default Username Color" },
    ...unlockedColorTags.map(tag => ({ value: tag.id, label: tag.name }))
  ], [unlockedColorTags]);


  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > MAX_AVATAR_SIZE_MB * 1024 * 1024) {
        setError(`Avatar image must be less than ${MAX_AVATAR_SIZE_MB}MB.`);
        setCustomAvatarFile(null);
        return;
      }
      setError(null);
      setCustomAvatarFile(file);
      setCustomAvatarPreview(URL.createObjectURL(file));
    }
  };
  
  const handleBannerChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
       if (file.size > MAX_BANNER_SIZE_MB * 1024 * 1024) {
        setError(`Banner image must be less than ${MAX_BANNER_SIZE_MB}MB.`);
        setCustomBannerFile(null);
        return;
      }
      setError(null);
      setCustomBannerFile(file);
      setCustomBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSocialLinkChange = (platform: keyof NonNullable<Player['socialLinks']>, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!username.trim()) {
        setError("Username cannot be empty.");
        setIsLoading(false);
        return;
    }

    let finalAvatarUrl: string | null | undefined = player.customAvatarUrl; 
    if (customAvatarFile) { 
        try {
            finalAvatarUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = (err) => reject(err);
                reader.readAsDataURL(customAvatarFile);
            });
        } catch (readError) {
            setError("Could not process avatar image.");
            setIsLoading(false); return;
        }
    } else if (customAvatarPreview === null) { 
        finalAvatarUrl = null;
    }

    let finalBannerUrl: string | null | undefined = player.customProfileBannerUrl;
    if (customBannerFile && player.canSetCustomBanner) {
        try {
            finalBannerUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = (err) => reject(err);
                reader.readAsDataURL(customBannerFile);
            });
        } catch (readError) {
             setError("Could not process banner image.");
             setIsLoading(false); return;
        }
    } else if (customBannerPreview === null && player.canSetCustomBanner) {
        finalBannerUrl = null;
    }
    
    const updateData: PlayerProfileUpdateData = {
      username: username.trim(),
      pronouns: pronouns.trim() || undefined,
      location: location.trim() || undefined,
      bio: bio.trim() || undefined,
      socialLinks,
      customAvatarUrl: finalAvatarUrl,
      customProfileBannerUrl: player.canSetCustomBanner ? finalBannerUrl : player.customProfileBannerUrl, // Only update if allowed
      selectedUsernameTagId: selectedTagId || undefined,
    };

    try {
        const result = await updatePlayerProfile(player.id, updateData);
        if (result.success) {
            onClose(); 
        } else {
            setError(result.message || "Failed to update profile.");
        }
    } catch (updateError) {
        console.error("Error updating profile:", updateError);
        setError("Failed to save profile changes. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleRemoveAvatar = () => {
    setCustomAvatarFile(null);
    setCustomAvatarPreview(null); 
  };
  
  const handleRemoveBanner = () => {
    setCustomBannerFile(null);
    setCustomBannerPreview(null);
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Profile" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
        {error && <Alert type="error" onClose={() => setError(null)}>{error}</Alert>}

        <div className="flex items-center space-x-4">
            <RobloxAvatar 
                username={player.username} 
                robloxId={player.robloxId}
                customAvatarUrl={customAvatarPreview} 
                size={80}
                isVerifiedPlayer={player.isVerifiedPlayer}
            />
            <div className="flex-grow">
                <label htmlFor="avatarUpload" className="block text-xs font-medium text-gray-400 mb-1">
                    Custom Avatar (Max {MAX_AVATAR_SIZE_MB}MB, PNG/JPG/GIF)
                </label>
                <Input
                    id="avatarUpload"
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    onChange={handleAvatarChange}
                    className="file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-purple-600"
                />
                {customAvatarPreview && (
                    <Button type="button" variant="ghost" size="xs" onClick={handleRemoveAvatar} className="mt-1 text-red-400 hover:text-red-300">Remove Custom Avatar</Button>
                )}
            </div>
        </div>
        
        {player.canSetCustomBanner && (
          <div className="space-y-2 pt-2 border-t border-dark-border">
            <label htmlFor="bannerUpload" className="block text-xs font-medium text-gray-400">
                Custom Profile Banner (Max {MAX_BANNER_SIZE_MB}MB, GIF/APNG/WebP)
            </label>
            {customBannerPreview && (
                <div className="mb-2 rounded border border-dark-border overflow-hidden h-24 w-full">
                    <img src={customBannerPreview} alt="Banner preview" className="w-full h-full object-cover"/>
                </div>
            )}
            <Input
                id="bannerUpload"
                type="file"
                accept=".gif,.png,.webp" // .png for APNG, .webp for animated WebP
                onChange={handleBannerChange}
                className="file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-brand-primary file:text-white hover:file:bg-purple-600"
            />
            {customBannerPreview && (
                <Button type="button" variant="ghost" size="xs" onClick={handleRemoveBanner} className="mt-1 text-red-400 hover:text-red-300">Remove Banner</Button>
            )}
          </div>
        )}
        
        <Input 
            label="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            required 
            placeholder="Enter your new username"
        />
        <Input label="Pronouns" value={pronouns} onChange={e => setPronouns(e.target.value)} placeholder="e.g., He/Him, She/Her, They/Them" />
        <Input label="Location" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g., USA, London, Mars" />
        <TextArea label="Bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us a bit about yourself..." rows={4} />

        {unlockedColorTags.length > 0 && (
            <Select
                label="Username Color Style"
                options={colorTagOptions}
                value={selectedTagId}
                onChange={e => setSelectedTagId(e.target.value)}
            />
        )}

        <fieldset className="border border-dark-border p-3 rounded-md">
          <legend className="text-sm font-medium text-gray-300 px-1">Social Links</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 mt-1">
            {Object.entries(SOCIAL_LINK_DEFINITIONS).map(([key, def]) => (
              <Input
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                icon={<i className={`${def.icon} ${def.color}`}></i>}
                value={socialLinks[key as keyof typeof socialLinks] || ''}
                onChange={e => handleSocialLinkChange(key as keyof typeof socialLinks, e.target.value)}
                placeholder={def.placeholder}
              />
            ))}
          </div>
        </fieldset>

        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={isLoading}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
};
