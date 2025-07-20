// app/settings/page.js
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import {
    User,
    Lock,
    CreditCard,
    Bell,
    Globe,
    Palette,
    Download,
    Trash2,
    Save,
    Eye,
    EyeOff,
    AlertCircle,
    Check,
    Settings as SettingsIcon,
    DollarSign,
    Shield,
    LogOut,
    Crown,
    Smartphone
} from 'lucide-react'

const CURRENCIES = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' }
]

const TIMEZONES = [
    'UTC',
    'America/New_York',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Kolkata',
    'Asia/Shanghai',
    'Australia/Sydney'
]

export default function SettingsPage() {
    const { user, logout } = useAuth()
    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    // Profile settings state
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        annualIncome: ''
    })

    // Preferences state
    const [preferences, setPreferences] = useState({
        currency: 'INR',
        timezone: 'UTC',
        theme: 'light'
    })

    // Password change state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    })

    // Delete account state
    const [deleteConfirmation, setDeleteConfirmation] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                phone: user.phone || '',
                annualIncome: user.stats?.currentIncome?.annual || ''
            })
            setPreferences({
                currency: user.preferences?.currency || 'INR',
                timezone: user.preferences?.timezone || 'UTC',
                theme: user.preferences?.theme || 'light'
            })
        }
    }, [user])

    const clearMessages = () => {
        setSuccess('')
        setError('')
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        clearMessages()

        try {
            await api.put('/auth/profile', {
                ...profileData,
                annualIncome: profileData.annualIncome ? parseFloat(profileData.annualIncome) : undefined
            })
            setSuccess('Profile updated successfully!')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handlePreferencesUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        clearMessages()

        try {
            await api.put('/auth/profile', { preferences })
            setSuccess('Preferences updated successfully!')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update preferences')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setLoading(true)
        clearMessages()

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setError('New passwords do not match')
            setLoading(false)
            return
        }

        if (passwordData.newPassword.length < 6) {
            setError('New password must be at least 6 characters')
            setLoading(false)
            return
        }

        try {
            await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
            setSuccess('Password changed successfully!')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password')
        } finally {
            setLoading(false)
        }
    }

    const handleAccountDelete = async () => {
        if (deleteConfirmation !== 'DELETE') {
            setError('Please type DELETE to confirm')
            return
        }

        setLoading(true)
        try {
            await api.delete('/auth/account', {
                data: { password: passwordData.currentPassword }
            })
            logout()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account')
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'preferences', name: 'Preferences', icon: SettingsIcon },
        { id: 'security', name: 'Security', icon: Lock },
        { id: 'subscription', name: 'Subscription', icon: Crown },
        { id: 'privacy', name: 'Privacy & Data', icon: Shield }
    ]

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-600 mt-1">Manage your account and application preferences</p>
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 flex items-center space-x-2">
                            <Check size={20} />
                            <span>{success}</span>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center space-x-2">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
                                <nav className="space-y-2">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => {
                                                setActiveTab(tab.id)
                                                clearMessages()
                                            }}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors text-left ${activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-600 border border-blue-200'
                                                : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <tab.icon size={20} />
                                            <span className="font-medium">{tab.name}</span>
                                        </button>
                                    ))}
                                </nav>

                                {/* Quick Actions */}
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                                    <div className="space-y-2">
                                        <button className="w-full flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                                            <Download size={16} />
                                            <span>Export Data</span>
                                        </button>
                                        <button
                                            onClick={logout}
                                            className="w-full flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
                                        >
                                            <LogOut size={16} />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-8">

                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                            <User size={24} />
                                            <span>Profile Information</span>
                                        </h2>

                                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        First Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profileData.firstName}
                                                        onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Last Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={profileData.lastName}
                                                        onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Email Address
                                                </label>
                                                <input
                                                    type="email"
                                                    value={user?.email || ''}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500"
                                                    disabled
                                                />
                                                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={profileData.phone}
                                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="+91 98765 43210"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Annual Income (Optional)
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={profileData.annualIncome}
                                                        onChange={(e) => setProfileData({ ...profileData, annualIncome: e.target.value })}
                                                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Help us provide better financial insights
                                                </p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2"
                                            >
                                                <Save size={20} />
                                                <span>{loading ? 'Saving...' : 'Save Profile'}</span>
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Preferences Tab */}
                                {activeTab === 'preferences' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                            <SettingsIcon size={24} />
                                            <span>App Preferences</span>
                                        </h2>

                                        <form onSubmit={handlePreferencesUpdate} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Default Currency
                                                </label>
                                                <select
                                                    value={preferences.currency}
                                                    onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    {CURRENCIES.map((currency) => (
                                                        <option key={currency.code} value={currency.code}>
                                                            {currency.symbol} {currency.name} ({currency.code})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Timezone
                                                </label>
                                                <select
                                                    value={preferences.timezone}
                                                    onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    {TIMEZONES.map((timezone) => (
                                                        <option key={timezone} value={timezone}>
                                                            {timezone}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Theme
                                                </label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreferences({ ...preferences, theme: 'light' })}
                                                        className={`p-4 border-2 rounded-xl transition-colors flex items-center space-x-3 ${preferences.theme === 'light'
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className="w-4 h-4 bg-white border border-gray-300 rounded-full"></div>
                                                        <span>Light</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setPreferences({ ...preferences, theme: 'dark' })}
                                                        className={`p-4 border-2 rounded-xl transition-colors flex items-center space-x-3 ${preferences.theme === 'dark'
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
                                                        <span>Dark</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2"
                                            >
                                                <Save size={20} />
                                                <span>{loading ? 'Saving...' : 'Save Preferences'}</span>
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Security Tab */}
                                {activeTab === 'security' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                            <Lock size={24} />
                                            <span>Security Settings</span>
                                        </h2>

                                        <form onSubmit={handlePasswordChange} className="space-y-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Current Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.current ? 'text' : 'password'}
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.new ? 'text' : 'password'}
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Confirm New Password
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type={showPasswords.confirm ? 'text' : 'password'}
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center space-x-2"
                                            >
                                                <Lock size={20} />
                                                <span>{loading ? 'Changing...' : 'Change Password'}</span>
                                            </button>
                                        </form>

                                        {/* Two-Factor Authentication */}
                                        <div className="mt-12 pt-8 border-t border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                                <div className="flex items-center space-x-3">
                                                    <Smartphone className="text-blue-600" size={20} />
                                                    <div>
                                                        <p className="text-blue-800 font-medium">Coming Soon</p>
                                                        <p className="text-blue-600 text-sm">Two-factor authentication will be available in a future update</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Subscription Tab */}
                                {activeTab === 'subscription' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                            <Crown size={24} />
                                            <span>Subscription</span>
                                        </h2>

                                        <div className="space-y-6">
                                            {/* Current Plan */}
                                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                                            {user?.subscription === 'premium' ? (
                                                                <>
                                                                    <Crown className="text-yellow-500" size={20} />
                                                                    <span>Premium Plan</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CreditCard className="text-blue-600" size={20} />
                                                                    <span>Free Plan</span>
                                                                </>
                                                            )}
                                                        </h3>
                                                        <p className="text-gray-600 mt-1">
                                                            {user?.subscription === 'premium'
                                                                ? 'Unlimited expenses and premium features'
                                                                : `${user?.stats?.totalExpenses || 0}/${user?.stats?.monthlyLimit || 100} expenses this month`
                                                            }
                                                        </p>
                                                    </div>
                                                    {user?.subscription !== 'premium' && (
                                                        <button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                                                            Upgrade to Premium
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Plan Comparison */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="border border-gray-200 rounded-xl p-6">
                                                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Free Plan</h4>
                                                    <ul className="space-y-2 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <Check size={16} className="text-green-500" />
                                                            <span>100 expenses per month</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <Check size={16} className="text-green-500" />
                                                            <span>Basic categorization</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <Check size={16} className="text-green-500" />
                                                            <span>Simple analytics</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <Check size={16} className="text-green-500" />
                                                            <span>Mobile app access</span>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="border-2 border-yellow-400 rounded-xl p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <Crown className="text-yellow-500" size={20} />
                                                        <h4 className="text-lg font-semibold text-gray-900">Premium Plan</h4>
                                                    </div>
                                                    <p className="text-2xl font-bold text-gray-900 mb-4">₹299<span className="text-sm font-normal text-gray-600">/month</span></p>
                                                    <ul className="space-y-2 text-sm text-gray-600">
                                                        <li className="flex items-center space-x-2">
                                                            <Check size={16} className="text-green-500" />
                                                            <span>Unlimited expenses</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <Check size={16} className="text-green-500" />
                                                            <span>AI-powered insights</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <Check size={16} className="text-green-500" />
                                                            <span>Advanced analytics</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <Check size={16} className="text-green-500" />
                                                            <span>Expense splitting</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <Check size={16} className="text-green-500" />
                                                            <span>Multi-currency support</span>
                                                        </li>
                                                        <li className="flex items-center space-x-2">
                                                            <Check size={16} className="text-green-500" />
                                                            <span>Priority support</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Privacy & Data Tab */}
                                {activeTab === 'privacy' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                                            <Shield size={24} />
                                            <span>Privacy & Data</span>
                                        </h2>

                                        <div className="space-y-8">
                                            {/* Data Export */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Your Data</h3>
                                                <p className="text-gray-600 mb-4">
                                                    Download a copy of all your financial data in JSON or CSV format.
                                                </p>
                                                <div className="flex space-x-4">
                                                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <Download size={16} />
                                                        <span>Export as JSON</span>
                                                    </button>
                                                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                                        <Download size={16} />
                                                        <span>Export as CSV</span>
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Privacy Settings */}
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">Analytics</h4>
                                                            <p className="text-sm text-gray-600">Help improve Flux by sharing anonymous usage data</p>
                                                        </div>
                                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                                                    </div>
                                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">Email Notifications</h4>
                                                            <p className="text-sm text-gray-600">Receive updates about new features and tips</p>
                                                        </div>
                                                        <input type="checkbox" className="w-4 h-4 text-blue-600 rounded" defaultChecked />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Delete Account */}
                                            <div className="pt-8 border-t border-gray-200">
                                                <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                                                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                                                    <h4 className="font-semibold text-red-800 mb-2">Delete Account</h4>
                                                    <p className="text-red-700 text-sm mb-4">
                                                        Permanently delete your account and all associated data. This action cannot be undone.
                                                    </p>
                                                    <button
                                                        onClick={() => setShowDeleteModal(true)}
                                                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                                                    >
                                                        <Trash2 size={16} />
                                                        <span>Delete Account</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Account Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-red-600 mb-4">Delete Account</h3>
                                <p className="text-gray-600 mb-6">
                                    This will permanently delete your account and all your data. Type <strong>DELETE</strong> to confirm.
                                </p>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Type DELETE"
                                    />

                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <div className="flex items-center justify-end space-x-4 mt-6">
                                    <button
                                        onClick={() => setShowDeleteModal(false)}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAccountDelete}
                                        disabled={loading || deleteConfirmation !== 'DELETE' || !passwordData.currentPassword}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                                    >
                                        {loading ? 'Deleting...' : 'Delete Account'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}