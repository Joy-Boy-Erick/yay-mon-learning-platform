import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Role } from '../types';
import Spinner from '../components/Spinner';

const ProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        email: '',
        bio: '',
    });
    const [newProfilePicture, setNewProfilePicture] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');
    const [pfpError, setPfpError] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                bio: user.bio || '',
            });
            setPfpError(false);
            setNewProfilePicture(null);
        }
    }, [user]);

    if (!user) {
        return <p>Loading profile...</p>;
    }

    const userInitials = user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    
    const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Please upload a PNG, JPEG, or WebP image.');
                return;
            }
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                setError('File is too large. Please upload an image under 2MB.');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProfilePicture(reader.result as string);
                setPfpError(false);
            };
            reader.readAsDataURL(file);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage('');
        setError('');
        
        try {
            const updatedUserData: User = { 
                ...user, 
                name: formData.name || user.name,
                email: formData.email || user.email,
                bio: formData.bio || user.bio,
                profilePicture: newProfilePicture || user.profilePicture,
            };
            await updateUser(updatedUserData);
            setNewProfilePicture(null);
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch(err) {
            setError("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const getRoleClass = (role: Role) => {
        switch(role) {
            case Role.Admin: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            case Role.Teacher: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
            case Role.Student: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    }
    
    const displayPicture = newProfilePicture || user.profilePicture;

    return (
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800/50 p-8 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700/80">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 flex flex-col items-center text-center">
                    <div className="relative group">
                        <label htmlFor="pfp-upload" className="cursor-pointer">
                            { (pfpError && !newProfilePicture) || !displayPicture ? (
                                <div role="img" aria-label={`Profile picture of ${user.name}`} className="w-32 h-32 rounded-full bg-primary/20 text-primary flex items-center justify-center text-4xl font-bold border-4 border-primary shadow-lg">
                                    {userInitials}
                                </div>
                            ) : (
                                <img 
                                    src={displayPicture} 
                                    alt={`Profile picture of ${user.name}`} 
                                    className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg"
                                    onError={() => {
                                        if (!newProfilePicture) setPfpError(true)
                                    }}
                                />
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                Change
                            </div>
                        </label>
                        <input type="file" id="pfp-upload" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handlePictureChange} />
                    </div>
                    
                    <h1 className="text-2xl font-bold mt-4 text-dark dark:text-light">{user.name}</h1>
                    <p className={`mt-1 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getRoleClass(user.role)}`}>{user.role}</p>
                    <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm">{formData.bio || 'No bio provided.'}</p>
                </div>
                <div className="md:col-span-2">
                     <h2 className="text-xl font-bold text-dark dark:text-light mb-6">Edit Profile</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {successMessage && <div className="bg-green-100 text-green-700 p-3 rounded-md text-sm">{successMessage}</div>}
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">{error}</div>}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                id="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                autoComplete="name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                autoComplete="email"
                            />
                        </div>
                        <div>
                            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                            <textarea
                                name="bio"
                                id="bio"
                                rows={4}
                                value={formData.bio}
                                onChange={handleChange}
                                className="mt-1 block w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Tell us a little about yourself..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-105 disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                            {isSaving && <Spinner className="w-5 h-5 mr-2" />}
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;