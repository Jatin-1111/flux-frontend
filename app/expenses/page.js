'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Search, Calendar, Edit3, Trash2, Tag, Receipt, AlertCircle, X, Filter, TrendingUp
} from 'lucide-react'

// Categories data
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
};

// Animation variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
        }
    }
};

const headerVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 120,
            damping: 20
        }
    }
};

const cardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15
        }
    },
    hover: {
        scale: 1.02,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10
        }
    }
};

const expenseItemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 12
        }
    },
    exit: {
        x: 20,
        opacity: 0,
        transition: {
            duration: 0.2
        }
    },
    hover: {
        backgroundColor: 'rgba(99, 102, 241, 0.05)',
        transition: {
            duration: 0.2
        }
    }
};

const buttonVariants = {
    hover: {
        scale: 1.05,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10
        }
    },
    tap: {
        scale: 0.95,
        transition: {
            duration: 0.1
        }
    }
};

const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 0.3 }
    },
    exit: {
        opacity: 0,
        transition: { duration: 0.2 }
    }
};

const modalVariants = {
    hidden: {
        scale: 0.8,
        opacity: 0,
        y: 50
    },
    visible: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 30
        }
    },
    exit: {
        scale: 0.8,
        opacity: 0,
        y: 50,
        transition: {
            duration: 0.2
        }
    }
};

const loadingVariants = {
    animate: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear'
        }
    }
};

const statsVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: 'spring',
            stiffness: 200,
            damping: 20
        }
    }
};

export default function ExpensesPage() {
    const { user } = useAuth()
    const [expenses, setExpenses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [userStats, setUserStats] = useState(null)

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        tags: [],
    })

    const [filters, setFilters] = useState({
        category: 'all',
        search: '',
        startDate: '',
        endDate: '',
        sortBy: 'date',
        sortOrder: 'desc'
    })

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalExpenses: 0,
        limit: 10
    })

    const [errors, setErrors] = useState({})
    const [tagInput, setTagInput] = useState('')

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.currentPage,
                limit: pagination.limit,
                sort: `${filters.sortOrder === 'desc' ? '-' : ''}${filters.sortBy}`
            });
            if (filters.search) params.set('search', filters.search);
            if (filters.category !== 'all') params.set('category', filters.category);
            if (filters.startDate) params.set('startDate', filters.startDate);
            if (filters.endDate) params.set('endDate', filters.endDate);

            const response = await api.get(`/expenses?${params}`);

            if (response.data.success) {
                const expensesData = response.data.data?.expenses || [];
                const paginationData = response.data.data?.pagination || {};

                setExpenses(expensesData);
                setPagination(prev => ({ ...prev, ...paginationData }));
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    }, [
        pagination.currentPage,
        pagination.limit,
        filters.search,
        filters.category,
        filters.startDate,
        filters.endDate,
        filters.sortBy,
        filters.sortOrder
    ]);

    const fetchUserStats = useCallback(async () => {
        if (user?.isPremium) {
            setUserStats(null);
            return;
        }
        try {
            const statsResponse = await api.get(`/expenses/analytics/stats`);

            if (statsResponse.data.success) {
                const statsData = statsResponse.data.data;
                const count = statsData?.count || 0;
                const limit = statsData?.limit || 100;

                setUserStats({
                    monthlyExpenses: count,
                    monthlyLimit: limit,
                    isNearLimit: count >= limit * 0.8,
                    isLimitReached: count >= limit,
                });
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    }, [user?.isPremium]);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    useEffect(() => {
        fetchUserStats();
    }, [fetchUserStats]);

    const handleFilterChange = (newFilters) => {
        setPagination(p => ({ ...p, currentPage: 1 }));
        setFilters(prev => ({ ...prev, ...newFilters }));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const newErrors = {};
        if (!formData.amount || formData.amount <= 0) newErrors.amount = 'A valid amount is required.';
        if (!formData.description.trim()) newErrors.description = 'Description is required.';
        if (!formData.category) newErrors.category = 'Category is required.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const expenseData = {
                ...formData,
                amount: parseFloat(formData.amount),
                tags: formData.tags.filter(tag => tag.trim()),
                date: new Date(formData.date)
            };
            const response = await api.post('/expenses', expenseData);

            if (response.data.success) {
                setShowAddForm(false);
                setFormData({
                    amount: '',
                    description: '',
                    category: '',
                    date: new Date().toISOString().split('T')[0],
                    tags: [],
                });
                fetchExpenses();
                fetchUserStats();
            }
        } catch (error) {
            setErrors({
                submit: error.response?.data?.message || 'An error occurred while creating the expense.'
            });
        }
    };

    const deleteExpense = async (expenseId) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;
        try {
            await api.delete(`/expenses/${expenseId}`);
            fetchExpenses();
            fetchUserStats();
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Failed to delete expense.');
        }
    };

    const handleTagKeyPress = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
    };

    const formatCurrency = (amount, currency = 'INR') => new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(amount);
    const formatDate = (date) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                <motion.div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Header */}
                    <motion.div
                        variants={headerVariants}
                        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
                    >
                        <div>
                            <motion.h1
                                className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                Expenses
                            </motion.h1>
                            <motion.p
                                className="text-gray-600 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Track and manage your daily spending with style.
                            </motion.p>
                        </div>
                        <motion.div
                            className="mt-4 md:mt-0 flex items-center space-x-4"
                            variants={itemVariants}
                        >
                            <AnimatePresence>
                                {userStats && !user?.isPremium && (
                                    <motion.div
                                        variants={statsVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        className={`px-4 py-2 rounded-xl text-sm font-medium backdrop-blur-sm ${userStats.isNearLimit
                                                ? 'bg-orange-100/80 text-orange-800 border border-orange-200'
                                                : 'bg-blue-100/80 text-blue-800 border border-blue-200'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp size={16} />
                                            <span>{userStats.monthlyExpenses} / {userStats.monthlyLimit} this month</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <motion.button
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => setShowAddForm(true)}
                                disabled={userStats?.isLimitReached}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg flex items-center space-x-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <motion.div
                                    animate={{ rotate: showAddForm ? 45 : 0 }}
                                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                >
                                    <Plus size={20} />
                                </motion.div>
                                <span>Add Expense</span>
                            </motion.button>
                        </motion.div>
                    </motion.div>

                    {/* Filters */}
                    <motion.div
                        variants={cardVariants}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 mb-8"
                    >
                        <motion.div
                            className="flex items-center space-x-2 mb-4"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Filter size={20} className="text-gray-600" />
                            <h3 className="font-semibold text-gray-800">Filters</h3>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by description..."
                                    value={filters.search}
                                    onChange={e => handleFilterChange({ search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                />
                            </motion.div>
                            <motion.select
                                value={filters.category}
                                onChange={e => handleFilterChange({ category: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <option value="all">All Categories</option>
                                {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) =>
                                    <option key={key} value={key}>{cat.icon} {cat.name}</option>
                                )}
                            </motion.select>
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={e => handleFilterChange({ startDate: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                />
                            </motion.div>
                            <motion.div
                                className="relative"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 400 }}
                            >
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={e => handleFilterChange({ endDate: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                                />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <motion.div
                        variants={cardVariants}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div
                                    key="loader"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-12 text-center"
                                >
                                    <motion.div
                                        variants={loadingVariants}
                                        animate="animate"
                                        className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full mx-auto mb-4"
                                    />
                                    <motion.p
                                        className="text-gray-600 font-medium"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Loading your expenses...
                                    </motion.p>
                                </motion.div>
                            ) : expenses.length === 0 ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="p-16 text-center"
                                >
                                    <motion.div
                                        className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <Receipt className="w-12 h-12 text-gray-400" />
                                    </motion.div>
                                    <motion.h4
                                        className="text-xl font-semibold text-gray-800 mb-2"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        No expenses found
                                    </motion.h4>
                                    <motion.p
                                        className="text-gray-500 mb-8"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        Ready to start tracking? Add your first expense below.
                                    </motion.p>
                                    <motion.button
                                        variants={buttonVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        onClick={() => setShowAddForm(true)}
                                        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        Add Your First Expense
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="expenses"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="divide-y divide-gray-100"
                                >
                                    <AnimatePresence>
                                        {expenses.map((expense, index) => (
                                            <motion.div
                                                key={expense._id}
                                                variants={expenseItemVariants}
                                                initial="hidden"
                                                animate="visible"
                                                exit="exit"
                                                whileHover="hover"
                                                custom={index}
                                                className="p-6 cursor-pointer"
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4">
                                                        <motion.div
                                                            className="w-14 h-14 rounded-xl flex items-center justify-center text-xl shadow-sm"
                                                            style={{
                                                                backgroundColor: `${EXPENSE_CATEGORIES[expense.category]?.color}15`,
                                                                color: EXPENSE_CATEGORIES[expense.category]?.color,
                                                                border: `2px solid ${EXPENSE_CATEGORIES[expense.category]?.color}20`
                                                            }}
                                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                                            transition={{ type: 'spring', stiffness: 400 }}
                                                        >
                                                            {EXPENSE_CATEGORIES[expense.category]?.icon}
                                                        </motion.div>
                                                        <div>
                                                            <motion.h4
                                                                className="font-semibold text-gray-900 text-lg"
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.1 }}
                                                            >
                                                                {expense.description}
                                                            </motion.h4>
                                                            <motion.div
                                                                className="flex items-center space-x-3 text-sm text-gray-500 mt-1"
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.2 }}
                                                            >
                                                                <span className="font-medium">{EXPENSE_CATEGORIES[expense.category]?.name}</span>
                                                                {expense.tags && expense.tags.length > 0 && (
                                                                    <motion.span
                                                                        className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full"
                                                                        whileHover={{ scale: 1.05 }}
                                                                    >
                                                                        <Tag size={12} />
                                                                        <span>{expense.tags.join(', ')}</span>
                                                                    </motion.span>
                                                                )}
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-6">
                                                        <motion.div
                                                            className="text-right"
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.1 }}
                                                        >
                                                            <motion.p
                                                                className="font-bold text-xl text-gray-900"
                                                                whileHover={{ scale: 1.05 }}
                                                            >
                                                                {formatCurrency(expense.amount, expense.currency)}
                                                            </motion.p>
                                                            <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                                                        </motion.div>
                                                        <div className="flex items-center space-x-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, backgroundColor: '#EEF2FF' }}
                                                                whileTap={{ scale: 0.9 }}
                                                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-full transition-colors"
                                                            >
                                                                <Edit3 size={18} />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1, backgroundColor: '#FEF2F2' }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => deleteExpense(expense._id)}
                                                                className="p-2 text-gray-400 hover:text-red-600 rounded-full transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pagination */}
                        <AnimatePresence>
                            {pagination.totalPages > 1 && !loading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50"
                                >
                                    <motion.p
                                        className="text-sm text-gray-600"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        Page {pagination.currentPage} of {pagination.totalPages}
                                    </motion.p>
                                    <div className="flex items-center space-x-3">
                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                                            disabled={pagination.currentPage === 1}
                                            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            Previous
                                        </motion.button>
                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                                            disabled={pagination.currentPage === pagination.totalPages}
                                            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50 transition-colors"
                                        >
                                            Next
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </motion.div>

                {/* Add Expense Modal */}
                <AnimatePresence>
                    {showAddForm && (
                        <motion.div
                            variants={modalBackdropVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                            onClick={() => setShowAddForm(false)}
                        >
                            <motion.div
                                variants={modalVariants}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <motion.div
                                    className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h3 className="text-xl font-semibold text-white">Add New Expense</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowAddForm(false)}
                                        className="p-2 text-white/80 hover:text-white rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </motion.button>
                                </motion.div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                    <AnimatePresence>
                                        {errors.submit && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-2"
                                            >
                                                <AlertCircle size={16} />
                                                <span>{errors.submit}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                                        <motion.input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 ${errors.amount
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                                }`}
                                            placeholder="₹0.00"
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                        <AnimatePresence>
                                            {errors.amount && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-red-600 text-sm mt-1"
                                                >
                                                    {errors.amount}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                        <motion.input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 ${errors.description
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                                }`}
                                            placeholder="e.g., Lunch with colleagues"
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                        <AnimatePresence>
                                            {errors.description && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-red-600 text-sm mt-1"
                                                >
                                                    {errors.description}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                        <motion.select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 ${errors.category
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                                                }`}
                                            whileFocus={{ scale: 1.02 }}
                                        >
                                            <option value="">Select a category</option>
                                            {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => (
                                                <option key={key} value={key}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </motion.select>
                                        <AnimatePresence>
                                            {errors.category && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-red-600 text-sm mt-1"
                                                >
                                                    {errors.category}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                        <motion.input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                                        <motion.input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleTagKeyPress}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                                            placeholder="Type a tag and press Enter"
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                        <AnimatePresence>
                                            {formData.tags.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="flex flex-wrap gap-2 mt-3"
                                                >
                                                    <AnimatePresence>
                                                        {formData.tags.map((tag, index) => (
                                                            <motion.span
                                                                key={tag}
                                                                initial={{ opacity: 0, scale: 0.8 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.8 }}
                                                                whileHover={{ scale: 1.05 }}
                                                                className="inline-flex items-center gap-x-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                                                                layout
                                                            >
                                                                {tag}
                                                                <motion.button
                                                                    type="button"
                                                                    onClick={() => removeTag(tag)}
                                                                    className="text-indigo-500 hover:text-indigo-700"
                                                                    whileHover={{ scale: 1.1 }}
                                                                    whileTap={{ scale: 0.9 }}
                                                                >
                                                                    <X size={14} />
                                                                </motion.button>
                                                            </motion.span>
                                                        ))}
                                                    </AnimatePresence>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    <motion.div
                                        className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.35 }}
                                    >
                                        <motion.button
                                            type="button"
                                            onClick={() => setShowAddForm(false)}
                                            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Cancel
                                        </motion.button>
                                        <motion.button
                                            type="submit"
                                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Add Expense
                                        </motion.button>
                                    </motion.div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    );
}