// components/layout/Header.js
'use client'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LogOut, Settings, Bell, Wallet, User } from 'lucide-react'

export default function Header() {
    const { user, logout, isAuthenticated } = useAuth()
    const pathname = usePathname()

    // Don't show header on auth pages or landing page
    const hideHeaderPages = ['/', '/login', '/signup']
    if (hideHeaderPages.includes(pathname)) {
        return null
    }

    // If not authenticated, don't show header
    if (!isAuthenticated) {
        return null
    }

    return (
        <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                            <Wallet className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                            Flux
                        </h1>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/dashboard"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname === '/dashboard'
                                    ? 'text-blue-600'
                                    : 'text-gray-700'
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            href="/expenses"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname.startsWith('/expenses')
                                    ? 'text-blue-600'
                                    : 'text-gray-700'
                                }`}
                        >
                            Expenses
                        </Link>
                        <Link
                            href="/budgets"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname === '/budgets'
                                    ? 'text-blue-600'
                                    : 'text-gray-700'
                                }`}
                        >
                            Budgets
                        </Link>
                        <Link
                            href="/analytics"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname === '/analytics'
                                    ? 'text-blue-600'
                                    : 'text-gray-700'
                                }`}
                        >
                            Analytics
                        </Link>
                        <Link
                            href="/goals"
                            className={`text-sm font-medium transition-colors hover:text-blue-600 ${pathname === '/goals'
                                    ? 'text-blue-600'
                                    : 'text-gray-700'
                                }`}
                        >
                            Goals
                        </Link>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                            <Bell size={20} />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        </button>

                        {/* User Profile */}
                        <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-semibold">
                                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                </span>
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-medium text-gray-900">
                                    {user?.firstName} {user?.lastName}
                                </p>
                                <p className="text-xs text-gray-500">Premium User</p>
                            </div>
                        </div>

                        {/* Settings */}
                        <Link
                            href="/settings"
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Settings size={20} />
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={logout}
                            className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden border-t border-gray-200/50 px-4 py-3">
                <div className="flex items-center justify-around">
                    <Link
                        href="/dashboard"
                        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${pathname === '/dashboard'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Wallet size={20} />
                        <span className="text-xs font-medium">Dashboard</span>
                    </Link>
                    <Link
                        href="/expenses"
                        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${pathname.startsWith('/expenses')
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <User size={20} />
                        <span className="text-xs font-medium">Expenses</span>
                    </Link>
                    <Link
                        href="/budgets"
                        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${pathname === '/budgets'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Settings size={20} />
                        <span className="text-xs font-medium">Budgets</span>
                    </Link>
                    <Link
                        href="/analytics"
                        className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${pathname === '/analytics'
                                ? 'text-blue-600 bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        <Bell size={20} />
                        <span className="text-xs font-medium">Analytics</span>
                    </Link>
                </div>
            </div>
        </nav>
    )
}