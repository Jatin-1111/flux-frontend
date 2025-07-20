// app/expenses/page.js
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import {
    Plus,
    Search,
    Filter,
    Calendar,
    TrendingUp,
    Edit3,
    Trash2,
    Tag,
    MapPin,
    Repeat,
    Receipt,
    AlertCircle,
    ChevronDown,
    X
} from 'lucide-react'

// Category data matching backend
const EXPENSE_CATEGORIES = {
    food: { name: 'Food & Dining', icon: '🍽️', color: '#FF6B6B' },
    transport: { name: 'Transportation', icon: '🚗', color: '#4ECDC4' },
    entertainment: { name: 'Entertainment', icon: '🎬', color: '#45B7D1' },
    shopping: { name: 'Shopping', icon: '🛍️', color: '#96CEB4' },
    bills: { name: 'Bills & Utilities', icon: '⚡', color: '#FFEAA7' },
    healthcare: { name: 'Healthcare', icon: '🏥', color: '#DDA0DD' },
    education: { name: 'Education', icon: '📚', color: '#98D8C8' },
    travel: { name: 'Travel', icon: '✈️', color: '#74B9FF' },
    groceries: { name: 'Groceries', icon: '🛒', color: '#55A3FF' },
    business: { name: 'Business', icon: '💼', color: '#FD79A8' },
    personal: { name: 'Personal Care', icon: '🧴', color: '#FDCB6E' },
    recharge: { name: 'Recharge & Bills', icon: '📱', color: '#00CEC9' },
    investment: { name: 'Investment', icon: '📈', color: '#6C5CE7' },
    other: { name: 'Other', icon: '📂', color: '#636E72' }
}

export default function ExpensesPage() {
    const { user } = useAuth()
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [userStats, setUserStats] = useState(null)

    // Form state
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: '',
        subcategory: '',
        date: new Date().toISOString().split('T')[0],
        tags: [],
        location: ''
    })

    // Filter state
    const [filters, setFilters] = useState({
        category: 'all',
        search: '',
        startDate: '',
        endDate: '',
        sortBy: 'date',
        sortOrder: 'desc'
    })

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalExpenses: 0,
        limit: 20
    })

    const [errors, setErrors] = useState({})
    const [tagInput, setTagInput] = useState('')

    // Fetch expenses
    const fetchExpenses = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                ...filters
            })

            if (filters.category !== 'all') params.set('category', filters.category)
            if (filters.search) params.set('search', filters.search)
            if (filters.startDate) params.set('startDate', filters.startDate)
            if (filters.endDate) params.set('endDate', filters.endDate)

            const response = await api.get(`/expenses?${params}`)

            if (response.data.success) {
                setExpenses(response.data.data.expenses || [])
                setPagination({
                    ...pagination,
                    ...response.data.data.pagination
                })
            }
        } catch (error) {
            console.error('Error fetching expenses:', error)
        } finally {
            setLoading(false)
        }
    }

    // Fetch user stats
    const fetchUserStats = async () => {
        try {
            if (!user?.isPremium) {
                // Get current month expense count for free users
                const now = new Date()
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
                const response = await api.get(`/expenses?startDate=${startOfMonth}`)

                const monthlyCount = response.data.data.pagination?.totalExpenses || 0
                setUserStats({
                    monthlyExpenses: monthlyCount,
                    monthlyLimit: user?.stats?.monthlyLimit || 100,
                    isNearLimit: monthlyCount >= (user?.stats?.monthlyLimit || 100) * 0.8
                })
            }
        } catch (error) {
            console.error('Error fetching user stats:', error)
        }
    }

    useEffect(() => {
        fetchExpenses()
        fetchUserStats()
    }, [pagination.currentPage, filters])

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})

        // Validation
        const newErrors = {}
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'Valid amount is required'
        if (!formData.description.trim()) newErrors.description = 'Description is required'
        if (!formData.category) newErrors.category = 'Category is required'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            const expenseData = {
                ...formData,
                amount: parseFloat(formData.amount),
                tags: formData.tags.filter(tag => tag.trim()),
                date: new Date(formData.date)
            }

            const response = await api.post('/expenses', expenseData)

            if (response.data.success) {
                setShowAddForm(false)
                setFormData({
                    amount: '',
                    description: '',
                    category: '',
                    subcategory: '',
                    date: new Date().toISOString().split('T')[0],
                    tags: [],
                    location: ''
                })
                fetchExpenses()
                fetchUserStats()
            }
        } catch (error) {
            setErrors({
                submit: error.response?.data?.message || 'Error creating expense'
            })
        }
    }

    // Handle tag input
    const handleTagKeyPress = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault()
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({
                    ...formData,
                    tags: [...formData.tags, tagInput.trim()]
                })
            }
            setTagInput('')
        }
    }

    const removeTag = (tagToRemove) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter(tag => tag !== tagToRemove)
        })
    }

    // Delete expense
    const deleteExpense = async (expenseId) => {
        if (!confirm('Are you sure you want to delete this expense?')) return

        try {
            await api.delete(`/expenses/${expenseId}`)
            fetchExpenses()
            fetchUserStats()
        } catch (error) {
            console.error('Error deleting expense:', error)
        }
    }

    const formatCurrency = (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency
        }).format(amount)
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
                            <p className="text-gray-600 mt-1">Track and manage your spending</p>
                        </div>

                        <div className="mt-4 md:mt-0 flex items-center space-x-4">
                            {/* Free user limit indicator */}
                            {userStats && !user?.isPremium && (
                                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${userStats.isNearLimit
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {userStats.monthlyExpenses}/{userStats.monthlyLimit} this month
                                </div>
                            )}

                            <button
                                onClick={() => setShowAddForm(true)}
                                disabled={userStats?.monthlyExpenses >= userStats?.monthlyLimit}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                            >
                                <Plus size={20} />
                                <span>Add Expense</span>
                            </button>
                        </div>
                    </div>

                    {/* Monthly limit warning */}
                    {userStats?.monthlyExpenses >= userStats?.monthlyLimit && (
                        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                            <div className="flex items-center space-x-2 text-orange-800">
                                <AlertCircle size={20} />
                                <span className="font-medium">Monthly limit reached!</span>
                            </div>
                            <p className="text-orange-700 mt-1">
                                Upgrade to Premium for unlimited expenses and advanced features.
                            </p>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search expenses..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Category Filter */}
                            <select
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">All Categories</option>
                                {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                                    <option key={key} value={key}>
                                        {cat.icon} {cat.name}
                                    </option>
                                ))}
                            </select>

                            {/* Start Date */}
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />

                            {/* End Date */}
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Expenses List */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
                        <div className="p-6 border-b border-gray-200/50">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-2">Loading expenses...</p>
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Receipt className="w-8 h-8 text-gray-400" />
                                </div>
                                <h4 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h4>
                                <p className="text-gray-500">Start tracking your expenses to see them here</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200/50">
                                {expenses.map((expense) => (
                                    <div key={expense._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold"
                                                    style={{ backgroundColor: EXPENSE_CATEGORIES[expense.category]?.color }}
                                                >
                                                    {EXPENSE_CATEGORIES[expense.category]?.icon}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{expense.description}</h4>
                                                    <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
                                                        <span>{EXPENSE_CATEGORIES[expense.category]?.name}</span>
                                                        <span>•</span>
                                                        <span>{formatDate(expense.date)}</span>
                                                        {expense.tags.length > 0 && (
                                                            <>
                                                                <span>•</span>
                                                                <div className="flex items-center space-x-1">
                                                                    <Tag size={12} />
                                                                    <span>{expense.tags.join(', ')}</span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-4">
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        {formatCurrency(expense.amount, expense.currency)}
                                                    </p>
                                                    {expense.recurring?.isRecurring && (
                                                        <div className="flex items-center text-xs text-blue-600 mt-1">
                                                            <Repeat size={12} className="mr-1" />
                                                            <span>Recurring</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteExpense(expense._id)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="p-6 border-t border-gray-200/50 flex items-center justify-between">
                                <p className="text-sm text-gray-500">
                                    Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                                    {Math.min(pagination.currentPage * pagination.limit, pagination.totalExpenses)} of{' '}
                                    {pagination.totalExpenses} expenses
                                </p>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                        disabled={pagination.currentPage === 1}
                                        className="px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium">
                                        {pagination.currentPage}
                                    </span>
                                    <button
                                        onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Expense Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">Add New Expense</h3>
                                <button
                                    onClick={() => setShowAddForm(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {errors.submit && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {errors.submit}
                                    </div>
                                )}

                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.amount ? 'border-red-300' : 'border-gray-200'
                                            }`}
                                        placeholder="0.00"
                                    />
                                    {errors.amount && (
                                        <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.description ? 'border-red-300' : 'border-gray-200'
                                            }`}
                                        placeholder="e.g., Lunch at restaurant"
                                    />
                                    {errors.description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                                    )}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category *
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.category ? 'border-red-300' : 'border-gray-200'
                                            }`}
                                    >
                                        <option value="">Select category</option>
                                        {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                                            <option key={key} value={key}>
                                                {cat.icon} {cat.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className="text-red-500 text-sm mt-1">{errors.category}</p>
                                    )}
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tags
                                    </label>
                                    <input
                                        type="text"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyPress={handleTagKeyPress}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Add tags (press Enter)"
                                    />
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                                >
                                                    <span>{tag}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Submit */}
                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-colors"
                                    >
                                        Add Expense
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}