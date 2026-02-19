import { useState, useRef } from 'react';
import { X, Camera, Save, Loader2 } from 'lucide-react';
import { useAuth, getUserDisplayInfo } from '@/hooks/useAuth';

interface ProfileModalProps {
    open: boolean;
    onClose: () => void;
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
    const { user, updateProfile, uploadAvatar } = useAuth();
    const { displayName, avatarUrl, initial } = getUserDisplayInfo(user);

    const [newDisplayName, setNewDisplayName] = useState(displayName);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!open) return null;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be under 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        setError('');
        try {
            await uploadAvatar(file);
            setSuccess('Avatar updated!');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to upload avatar');
            setPreviewUrl(null);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!newDisplayName.trim()) {
            setError('Display name cannot be empty');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await updateProfile({ display_name: newDisplayName.trim() });
            setSuccess('Profile updated!');
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const currentAvatarUrl = previewUrl || avatarUrl;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-[#1a1d1b] border border-white/10 rounded-2xl w-full max-w-md mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white/5">
                                {currentAvatarUrl ? (
                                    <img
                                        src={currentAvatarUrl}
                                        alt={displayName}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
                                        {initial}
                                    </div>
                                )}
                            </div>

                            {/* Camera overlay */}
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                                ) : (
                                    <Camera className="w-6 h-6 text-white" />
                                )}
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>
                        <p className="text-xs text-gray-500">Click to change avatar (max 5MB)</p>
                    </div>

                    {/* Display Name */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                        <input
                            type="text"
                            value={newDisplayName}
                            onChange={(e) => setNewDisplayName(e.target.value)}
                            placeholder="Your display name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                    </div>

                    {/* Email (read only) */}
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Email</label>
                        <input
                            type="text"
                            value={user?.email || ''}
                            disabled
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    {/* Error / Success */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-xl px-4 py-3">
                            {success}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveProfile}
                        disabled={saving || newDisplayName === displayName}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-sm text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
