'use client'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Plus, TrendingUp, TrendingDown, Wallet, PieChart, Calendar, ShoppingCart, Utensils, Car, Home, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// Helper to get an icon for a given category
const CategoryIcon = ({ category, className }) => {
    const icons = {
        'Food': <Utensils className={className} />,
        'Transport': <Car className={className} />,
        'Shopping': <ShoppingCart className={className} />,
        'Housing': <Home className={className} />,
        'Default': <MoreHorizontal className={className} />
    };
    return icons[category] || icons['Default'];
};

// Skeleton loader component for the recent expenses list
const ExpenseSkeletonLoader = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
        ))}
    </div>
);

export default function DashboardPage() {
    const { user } = useAuth()
    const [expenses, setExpenses] = useState([])
    const [proTip, setProTip] = useState('')
    const [loading, setLoading] = useState(true)

    /**
     * Fetches all necessary data for the dashboard on initial load.
     * This includes recent expenses and the daily pro tip.
     */
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Create promises for all initial data fetches
                const params = new URLSearchParams({
                    limit: '10',
                    sort: '-createdAt'
                });

                // This now uses the imported 'api' client to make a real network request
                const expensesPromise = await api.get(`/expenses?${params}`);
                const tipPromise = await api.get('tips/today');

                // Wait for all promises to settle
                const [expensesResponse, tipResponse] = await Promise.all([
                    expensesPromise,
                    tipPromise
                ]);

                // Set expenses state
                if (expensesResponse.data.success) {
                    setExpenses(expensesResponse.data.data.expenses || []);
                }

                // Set pro tip state
                if (tipResponse.data.success) {
                    setProTip(tipResponse.data.tip);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                // Set a fallback tip in case of an error
                setProTip("Check your budget and save for a rainy day!");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                {/* Dashboard Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">
                                    Welcome back, {user?.firstName || 'User'}! 👋
                                </h2>
                                <p className="text-gray-600 mt-2">
                                    Here&apos;s your financial overview for today
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0">
                                <Link href="/expenses/add">
                                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2">
                                        <Plus size={20} />
                                        <span>Add Expense</span>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Cards remain the same */}
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
                        {/* Recent Expenses Section */}
                        <div className="lg:col-span-2">
                            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/50">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                        View all
                                    </button>
                                </div>

                                {loading ? (
                                    <ExpenseSkeletonLoader />
                                ) : expenses.length > 0 ? (
                                    <div className="space-y-4">
                                        {expenses.map((expense) => (
                                            <div key={expense._id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100/50 transition-colors duration-200">
                                                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                                                    <CategoryIcon category={expense.category} className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-800">{expense.title}</p>
                                                    <p className="text-sm text-gray-500">{expense.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">{new Date(expense.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
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
                                        <Link href="/expenses/add">
                                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
                                                Add Your First Expense
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
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
                                <p className="text-sm text-gray-600 min-h-[40px] flex items-center">
                                    {loading ? 'Generating your daily tip...' : proTip}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
