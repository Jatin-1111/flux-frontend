// app/dashboard/page.js
'use client'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'
import { LogOut, User, Settings, Plus, TrendingUp, TrendingDown, Wallet, PieChart, Calendar, Bell } from 'lucide-react'

export default function DashboardPage() {
    const { user, logout } = useAuth()

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                {/* Top Navigation */}
                <nav className="bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                        <Wallet className="w-4 h-4 text-white" />
                                    </div>
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        Flux
                                    </h1>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Bell size={20} />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                                </button>

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

                                <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                    <Settings size={20} />
                                </button>

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
                </nav>

                {/* Dashboard Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Welcome back, {user?.firstName}! 👋
                                </h2>
                                <p className="text-gray-600 mt-2">
                                    Here&apos;s your financial overview for today
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2">
                                    <Plus size={20} />
                                    <span>Add Expense</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">This Month</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">₹0</p>
                                    <p className="text-sm text-red-600 mt-1 flex items-center">
                                        <TrendingUp size={14} className="mr-1" />
                                        0% vs last month
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <TrendingDown className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Budget Left</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">₹0</p>
                                    <p className="text-sm text-green-600 mt-1 flex items-center">
                                        <TrendingUp size={14} className="mr-1" />
                                        100% remaining
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
                                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                                        <Calendar size={14} className="mr-1" />
                                        This month
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <PieChart className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Savings Rate</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">0%</p>
                                    <p className="text-sm text-purple-600 mt-1 flex items-center">
                                        <TrendingUp size={14} className="mr-1" />
                                        Great start!
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Empty State / Recent Expenses */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        View all
                                    </button>
                                </div>

                                {/* Empty State */}
                                <div className="text-center py-12">
                                    <div className="mx-auto w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-6">
                                        <Wallet className="w-12 h-12 text-blue-600" />
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                        No expenses yet
                                    </h4>
                                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                                        Start tracking your expenses to get insights into your spending habits and achieve your financial goals
                                    </p>
                                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
                                        Add Your First Expense
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Plus className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Add Expense</span>
                                    </button>
                                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <PieChart className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">Create Budget</span>
                                    </button>
                                    <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <span className="font-medium text-gray-900">View Analytics</span>
                                    </button>
                                </div>
                            </div>

                            {/* Financial Health */}
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Health</h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Budget Status</span>
                                        <span className="text-sm font-medium text-green-600">Excellent</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-0"></div>
                                    </div>

                                    <div className="pt-2">
                                        <p className="text-xs text-gray-500">
                                            Start adding expenses to see your financial health score
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Pro Tip</h3>
                                <p className="text-sm text-gray-600">
                                    Set up your monthly income to get personalized savings recommendations and better financial insights.
                                </p>
                                <button className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    Add Income →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}