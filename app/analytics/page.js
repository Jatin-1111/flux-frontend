// app/analytics/page.js
'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Target,
    PieChart,
    BarChart3,
    Download,
    Filter,
    Zap,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Wallet
} from 'lucide-react'
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart as RechartsPieChart,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Pie
} from 'recharts'

// Category colors matching backend
const CATEGORY_COLORS = {
    food: '#FF6B6B',
    transport: '#4ECDC4',
    entertainment: '#45B7D1',
    shopping: '#96CEB4',
    bills: '#FFEAA7',
    healthcare: '#DDA0DD',
    education: '#98D8C8',
    travel: '#74B9FF',
    groceries: '#55A3FF',
    business: '#FD79A8',
    personal: '#FDCB6E',
    recharge: '#00CEC9',
    investment: '#6C5CE7',
    other: '#636E72'
}

const CATEGORY_NAMES = {
    food: 'Food & Dining',
    transport: 'Transportation',
    entertainment: 'Entertainment',
    shopping: 'Shopping',
    bills: 'Bills & Utilities',
    healthcare: 'Healthcare',
    education: 'Education',
    travel: 'Travel',
    groceries: 'Groceries',
    business: 'Business',
    personal: 'Personal Care',
    recharge: 'Recharge & Bills',
    investment: 'Investment',
    other: 'Other'
}

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
}

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    },
    hover: {
        scale: 1.02,
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    }
}

const numberCounterVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            delay: 0.3
        }
    }
}

const loadingVariants = {
    animate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: "linear"
        }
    }
}

const insightVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    }),
    hover: {
        x: 5,
        transition: {
            duration: 0.2,
            ease: "easeInOut"
        }
    }
}

const chartContainerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            delay: 0.4
        }
    }
}

export default function AnalyticsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [dateRange, setDateRange] = useState('month')
    const [analytics, setAnalytics] = useState({})
    const [insights, setInsights] = useState({})
    const [budgetSummary, setBudgetSummary] = useState({})

    const fetchAnalytics = async () => {
        try {
            setLoading(true)
            const [analyticsRes, insightsRes, budgetRes] = await Promise.all([
                api.get('/expenses/analytics/stats'),
                api.get('/expenses/analytics/insights'),
                api.get('/budgets/analytics/summary')
            ])

            setAnalytics(analyticsRes.data.data)
            setInsights(insightsRes.data.data.insights)
            setBudgetSummary(budgetRes.data.data)
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [dateRange])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount)
    }

    const getInsightIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertCircle className="w-5 h-5 text-orange-500" />
            case 'success': return <TrendingUp className="w-5 h-5 text-green-500" />
            case 'info': return <Zap className="w-5 h-5 text-blue-500" />
            default: return <Eye className="w-5 h-5 text-gray-500" />
        }
    }

    const getChangeIcon = (change) => {
        if (change > 0) return <ArrowUpRight className="w-4 h-4 text-red-500" />
        if (change < 0) return <ArrowDownRight className="w-4 h-4 text-green-500" />
        return <div className="w-4 h-4" />
    }

    const getChangeColor = (change) => {
        if (change > 0) return 'text-red-600'
        if (change < 0) return 'text-green-600'
        return 'text-gray-600'
    }

    // Prepare chart data
    const spendingTrendData = analytics.spendingTrend?.map(item => ({
        month: `${item._id.month}/${item._id.year}`,
        amount: item.total,
        count: item.count
    })) || []

    const categoryData = analytics.topCategories?.map(item => ({
        name: CATEGORY_NAMES[item._id] || item._id,
        value: item.total,
        count: item.count,
        color: CATEGORY_COLORS[item._id] || '#636E72'
    })) || []

    const dailySpendingData = analytics.dailySpending?.map(item => ({
        day: item._id,
        amount: item.total,
        count: item.count
    })) || []

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                    <motion.div
                        className="text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <motion.div
                            className="w-12 h-12 border-b-2 border-blue-600 rounded-full mx-auto mb-4"
                            variants={loadingVariants}
                            animate="animate"
                        />
                        <motion.p
                            className="text-gray-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            Crunching your financial data...
                        </motion.p>
                    </motion.div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <motion.div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <motion.div
                        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
                        variants={itemVariants}
                    >
                        <div>
                            <motion.h1
                                className="text-3xl font-bold text-gray-900 flex items-center space-x-3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <motion.div
                                    className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center"
                                    initial={{ rotate: -10, scale: 0.8 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                >
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </motion.div>
                                <span>Financial Analytics</span>
                            </motion.h1>
                            <motion.p
                                className="text-gray-600 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                Understand your spending patterns and make smarter decisions
                            </motion.p>
                        </div>

                        <motion.div
                            className="mt-4 md:mt-0 flex items-center space-x-4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <motion.select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                                whileFocus={{ scale: 1.02 }}
                                transition={{ duration: 0.2 }}
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </motion.select>
                            <motion.button
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-lg flex items-center space-x-2"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Download size={16} />
                                <span>Export</span>
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Key Metrics */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                        variants={containerVariants}
                    >
                        {[
                            {
                                title: "Total Spent",
                                value: formatCurrency(analytics.monthlyStats?.reduce((acc, cat) => acc + cat.total, 0) || 0),
                                change: insights?.monthlyComparison?.changePercentage || 0,
                                changeText: `${Math.abs(insights?.monthlyComparison?.changePercentage || 0).toFixed(1)}% vs last month`,
                                icon: DollarSign,
                                gradient: "from-red-500 to-pink-500"
                            },
                            {
                                title: "Budget Status",
                                value: `${((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100 || 0).toFixed(1)}%`,
                                change: 0,
                                changeText: `${formatCurrency(budgetSummary.totalRemaining || 0)} remaining`,
                                icon: Target,
                                gradient: "from-green-500 to-emerald-500"
                            },
                            {
                                title: "Transactions",
                                value: analytics.monthlyStats?.reduce((acc, cat) => acc + cat.count, 0) || 0,
                                change: 0,
                                changeText: "This month",
                                icon: Calendar,
                                gradient: "from-blue-500 to-cyan-500"
                            },
                            {
                                title: "Avg/Day",
                                value: formatCurrency((analytics.monthlyStats?.reduce((acc, cat) => acc + cat.total, 0) || 0) / new Date().getDate()),
                                change: 0,
                                changeText: "Daily spending",
                                icon: TrendingUp,
                                gradient: "from-purple-500 to-indigo-500"
                            }
                        ].map((metric, index) => (
                            <motion.div
                                key={index}
                                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
                                variants={cardVariants}
                                whileHover="hover"
                                custom={index}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                                        <motion.p
                                            className="text-2xl font-bold text-gray-900"
                                            variants={numberCounterVariants}
                                        >
                                            {metric.value}
                                        </motion.p>
                                        <div className="flex items-center mt-1">
                                            {getChangeIcon(metric.change)}
                                            <span className={`text-sm ${getChangeColor(metric.change)}`}>
                                                {metric.changeText}
                                            </span>
                                        </div>
                                    </div>
                                    <motion.div
                                        className={`w-12 h-12 bg-gradient-to-r ${metric.gradient} rounded-xl flex items-center justify-center`}
                                        initial={{ scale: 0, rotate: -90 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{
                                            duration: 0.5,
                                            delay: 0.2 + (index * 0.1),
                                            type: "spring",
                                            stiffness: 200
                                        }}
                                    >
                                        <metric.icon className="w-6 h-6 text-white" />
                                    </motion.div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Charts Row 1 */}
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
                        variants={containerVariants}
                    >
                        {/* Spending Trend */}
                        <motion.div
                            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
                            variants={cardVariants}
                            whileHover="hover"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Spending Trend</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <TrendingUp size={16} />
                                    <span>Last 6 months</span>
                                </div>
                            </div>
                            <motion.div
                                className="h-80"
                                variants={chartContainerVariants}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={spendingTrendData}>
                                        <defs>
                                            <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                                        <YAxis stroke="#6B7280" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                            }}
                                            formatter={(value) => [formatCurrency(value), 'Amount']}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="amount"
                                            stroke="#3B82F6"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSpending)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </motion.div>

                        {/* Category Breakdown */}
                        <motion.div
                            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
                            variants={cardVariants}
                            whileHover="hover"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <PieChart size={16} />
                                    <span>This month</span>
                                </div>
                            </div>
                            <motion.div
                                className="h-80"
                                variants={chartContainerVariants}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value) => [formatCurrency(value), 'Amount']}
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Charts Row 2 */}
                    <motion.div
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
                        variants={containerVariants}
                    >
                        {/* Daily Spending */}
                        <motion.div
                            className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
                            variants={cardVariants}
                            whileHover="hover"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Daily Spending</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <BarChart3 size={16} />
                                    <span>This month</span>
                                </div>
                            </div>
                            <motion.div
                                className="h-80"
                                variants={chartContainerVariants}
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailySpendingData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                                        <XAxis dataKey="day" stroke="#6B7280" fontSize={12} />
                                        <YAxis stroke="#6B7280" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: 'none',
                                                borderRadius: '12px',
                                                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                            }}
                                            formatter={(value) => [formatCurrency(value), 'Amount']}
                                        />
                                        <Bar dataKey="amount" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </motion.div>

                        {/* Top Categories */}
                        <motion.div
                            className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
                            variants={cardVariants}
                            whileHover="hover"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Target size={16} />
                                    <span>Highest spending</span>
                                </div>
                            </div>
                            <motion.div
                                className="space-y-4"
                                variants={containerVariants}
                            >
                                {categoryData.slice(0, 5).map((category, index) => (
                                    <motion.div
                                        key={index}
                                        className="flex items-center justify-between"
                                        variants={itemVariants}
                                        whileHover={{ x: 5 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <motion.div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{
                                                    delay: index * 0.1,
                                                    type: "spring",
                                                    stiffness: 300
                                                }}
                                            />
                                            <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(category.value)}</p>
                                            <p className="text-xs text-gray-500">{category.count} transactions</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Insights Section */}
                    <motion.div
                        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50"
                        variants={cardVariants}
                        whileHover="hover"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Financial Insights</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Zap size={16} />
                                <span>AI-powered recommendations</span>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {insights && insights.length > 0 ? (
                                <motion.div
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    {insights.map((insight, index) => (
                                        <motion.div
                                            key={index}
                                            className="p-4 rounded-xl border border-gray-200 bg-gray-50/50"
                                            variants={insightVariants}
                                            whileHover="hover"
                                            custom={index}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <motion.div
                                                    initial={{ scale: 0, rotate: -90 }}
                                                    animate={{ scale: 1, rotate: 0 }}
                                                    transition={{
                                                        delay: index * 0.1 + 0.3,
                                                        type: "spring",
                                                        stiffness: 200
                                                    }}
                                                >
                                                    {getInsightIcon(insight.type)}
                                                </motion.div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {insight.priority === 'high' ? 'High Priority' :
                                                            insight.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="text-center py-8"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <motion.div
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.2, duration: 0.5 }}
                                    >
                                        <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500">Add more expenses to get personalized insights</p>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>
            </div>
        </ProtectedRoute>
    )
}