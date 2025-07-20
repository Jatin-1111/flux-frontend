// app/analytics/page.js
'use client'
import { useState, useEffect } from 'react'
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
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Crunching your financial data...</p>
                    </div>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-white" />
                                </div>
                                <span>Financial Analytics</span>
                            </h1>
                            <p className="text-gray-600 mt-1">Understand your spending patterns and make smarter decisions</p>
                        </div>

                        <div className="mt-4 md:mt-0 flex items-center space-x-4">
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="quarter">This Quarter</option>
                                <option value="year">This Year</option>
                            </select>
                            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2">
                                <Download size={16} />
                                <span>Export</span>
                            </button>
                        </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Spent</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(analytics.monthlyStats?.reduce((acc, cat) => acc + cat.total, 0) || 0)}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        {getChangeIcon(insights?.monthlyComparison?.changePercentage || 0)}
                                        <span className={`text-sm ${getChangeColor(insights?.monthlyComparison?.changePercentage || 0)}`}>
                                            {Math.abs(insights?.monthlyComparison?.changePercentage || 0).toFixed(1)}% vs last month
                                        </span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Budget Status</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {((budgetSummary.totalSpent / budgetSummary.totalBudget) * 100 || 0).toFixed(1)}%
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {formatCurrency(budgetSummary.totalRemaining || 0)} remaining
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Transactions</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {analytics.monthlyStats?.reduce((acc, cat) => acc + cat.count, 0) || 0}
                                    </p>
                                    <p className="text-sm text-blue-600 mt-1">This month</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Avg/Day</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatCurrency((analytics.monthlyStats?.reduce((acc, cat) => acc + cat.total, 0) || 0) / new Date().getDate())}
                                    </p>
                                    <p className="text-sm text-purple-600 mt-1">Daily spending</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Spending Trend */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Spending Trend</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <TrendingUp size={16} />
                                    <span>Last 6 months</span>
                                </div>
                            </div>
                            <div className="h-80">
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
                            </div>
                        </div>

                        {/* Category Breakdown */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <PieChart size={16} />
                                    <span>This month</span>
                                </div>
                            </div>
                            <div className="h-80">
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
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Daily Spending */}
                        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Daily Spending</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <BarChart3 size={16} />
                                    <span>This month</span>
                                </div>
                            </div>
                            <div className="h-80">
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
                            </div>
                        </div>

                        {/* Top Categories */}
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Top Categories</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Target size={16} />
                                    <span>Highest spending</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {categoryData.slice(0, 5).map((category, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            ></div>
                                            <span className="text-sm font-medium text-gray-900">{category.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-gray-900">{formatCurrency(category.value)}</p>
                                            <p className="text-xs text-gray-500">{category.count} transactions</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Insights Section */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Financial Insights</h3>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Zap size={16} />
                                <span>AI-powered recommendations</span>
                            </div>
                        </div>

                        {insights && insights.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {insights.map((insight, index) => (
                                    <div key={index} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                                        <div className="flex items-start space-x-3">
                                            {getInsightIcon(insight.type)}
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{insight.message}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {insight.priority === 'high' ? 'High Priority' :
                                                        insight.priority === 'medium' ? 'Medium Priority' : 'Low Priority'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500">Add more expenses to get personalized insights</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}