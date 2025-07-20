'use client'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import { Plus, TrendingUp, TrendingDown, Wallet, PieChart, Calendar, ShoppingCart, Utensils, Car, Home, MoreHorizontal, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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
        {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
        ))}
    </div>
);

// Framer Motion Variants for animations
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 100 }
    }
};

export default function DashboardPage() {
    const { user } = useAuth()
    const [expenses, setExpenses] = useState([])
    const [proTip, setProTip] = useState('')
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    /**
     * Fetches all necessary data for the dashboard on initial load.
     * This now correctly runs API calls in parallel for better performance.
     */
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    limit: '5', // Limiting to 5 for a cleaner recent list
                    sort: '-createdAt'
                });

                // Fetch expenses and tips in parallel
                const expensesPromise = api.get(`/expenses?${params}`);
                const tipPromise = api.get('tips/today');

                const [expensesResponse, tipResponse] = await Promise.all([
                    expensesPromise,
                    tipPromise
                ]);

                if (expensesResponse.data.success) {
                    setExpenses(expensesResponse.data.data.expenses || []);
                }

                if (tipResponse.data.success) {
                    setProTip(tipResponse.data.tip);
                }

            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Could not load dashboard data. Please try again later.');
                setProTip("Check your budget and save for a rainy day!");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <motion.div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Welcome Header */}
                    <motion.div variants={itemVariants} className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">
                                    Welcome back, {user?.firstName || 'User'}! 👋
                                </h2>
                                <p className="text-gray-500 mt-1">
                                    Here&apos;s your financial overview for today.
                                </p>
                            </div>
                            <motion.div
                                className="mt-4 md:mt-0"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link href="/expenses/add">
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm flex items-center space-x-2 transition-colors duration-200">
                                        <Plus size={20} />
                                        <span>Add Expense</span>
                                    </button>
                                </Link>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Quick Stats Cards */}
                    <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Placeholder Cards - to be connected to backend logic */}
                        <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200/80">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">This Month</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">₹0</p>
                                </div>
                                <div className="w-11 h-11 bg-red-50 rounded-lg flex items-center justify-center">
                                    <TrendingDown className="w-6 h-6 text-red-500" />
                                </div>
                            </div>
                        </motion.div>
                        <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200/80">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Budget Left</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">₹0</p>
                                </div>
                                <div className="w-11 h-11 bg-green-50 rounded-lg flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-green-500" />
                                </div>
                            </div>
                        </motion.div>
                        <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200/80">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Expenses</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">0</p>
                                </div>
                                <div className="w-11 h-11 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <PieChart className="w-6 h-6 text-blue-500" />
                                </div>
                            </div>
                        </motion.div>
                        <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200/80">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Savings Rate</p>
                                    <p className="text-2xl font-bold text-gray-800 mt-1">0%</p>
                                </div>
                                <div className="w-11 h-11 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-purple-500" />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Expenses Section */}
                        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-xl shadow-sm p-8 border border-gray-200/80">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-800">Recent Expenses</h3>
                                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium transition-colors">
                                    View all
                                </button>
                            </div>

                            {/* AnimatePresence manages the transition between loading/error/data states */}
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        <ExpenseSkeletonLoader />
                                    </motion.div>
                                ) : error ? (
                                    <motion.div key="error" variants={itemVariants} className="text-center py-12 text-red-500">
                                        <AlertTriangle className="mx-auto w-12 h-12 mb-4" />
                                        <p className="font-semibold">{error}</p>
                                    </motion.div>
                                ) : expenses.length > 0 ? (
                                    <motion.div key="expenses" variants={containerVariants} initial="hidden" animate="visible" className="space-y-3">
                                        {expenses.map((expense) => (
                                            <motion.div key={expense._id} variants={itemVariants} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100/70 transition-colors duration-200 cursor-pointer">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                    <CategoryIcon category={expense.category} className="w-6 h-6 text-indigo-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800">{expense.title}</p>
                                                    <p className="text-sm text-gray-500">{expense.category}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">₹{expense.amount.toLocaleString()}</p>
                                                    <p className="text-xs text-gray-500">{new Date(expense.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                ) : (
                                    <motion.div key="empty" variants={itemVariants} className="text-center py-12">
                                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                            <Wallet className="w-12 h-12 text-gray-400" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">No expenses yet</h4>
                                        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                                            Click the button below to add your first expense and start tracking.
                                        </p>
                                        <Link href="/expenses/add">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm transition-colors duration-200"
                                            >
                                                Add First Expense
                                            </motion.button>
                                        </Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* Sidebar */}
                        <motion.div variants={itemVariants} className="space-y-6">
                            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200/80">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Health</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Budget Status</span>
                                        <span className="text-sm font-medium text-green-600">Excellent</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        {/* Example progress bar */}
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                                    </div>
                                    <p className="text-xs text-gray-500 pt-1">
                                        Your spending is well within your budget. Keep it up!
                                    </p>
                                </div>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">💡 Pro Tip</h3>
                                <p className="text-sm text-blue-800 min-h-[40px] flex items-center">
                                    {loading ? 'Generating your daily tip...' : proTip}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </ProtectedRoute>
    )
}