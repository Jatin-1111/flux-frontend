'use client'
import { useState, useEffect, useCallback } from 'react' // Import useCallback
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Plus, Search, Calendar, Edit3, Trash2, Tag, Receipt, AlertCircle, X
} from 'lucide-react'

// --- (Category Data and Framer Motion variants are unchanged) ---
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

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
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

const modalBackdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
};

const modalPanelVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
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

    // This handler resets pagination when a filter changes
    const handleFilterChange = (newFilters) => {
        setPagination(p => ({ ...p, currentPage: 1 }));
        setFilters(prev => ({ ...prev, ...newFilters }));
    }

    // Use useCallback to memoize the fetching function
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
                setExpenses(response.data.data.expenses || []);
                setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
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
            setUserStats(null); // Premium users don't need stats
            return;
        }
        try {
            const statsResponse = await api.get(`/expenses/analytics/stats`);
            if (statsResponse.data.success) {
                const { count, limit } = statsResponse.data.data;
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

    // This effect now correctly depends on primitive values.
    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]); // The dependency is the memoized function itself.

    // This effect fetches stats only when the user status changes.
    useEffect(() => {
        fetchUserStats();
    }, [fetchUserStats]);


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
                // After adding, refetch expenses and stats
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
            // After deleting, refetch expenses and stats
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

    // The JSX part remains the same, but now it uses the `handleFilterChange` helper
    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
                <motion.div
                    className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    {/* Header */}
                    <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Expenses</h1>
                            <p className="text-gray-500 mt-1">Track and manage your daily spending.</p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center space-x-4">
                            {userStats && !user?.isPremium && (
                                <div className={`px-3 py-2 rounded-lg text-sm font-medium ${userStats.isNearLimit ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {userStats.monthlyExpenses} / {userStats.monthlyLimit} this month
                                </div>
                            )}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowAddForm(true)}
                                disabled={userStats?.isLimitReached}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg shadow-sm flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={20} />
                                <span>Add Expense</span>
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Monthly limit warning */}
                    {userStats?.isLimitReached && (
                        <motion.div variants={itemVariants} className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400">
                            <div className="flex">
                                <div className="flex-shrink-0"><AlertCircle className="h-5 w-5 text-orange-400" /></div>
                                <div className="ml-3">
                                    <p className="text-sm text-orange-700">
                                        You have reached your monthly limit. <a href="/premium" className="font-medium underline text-orange-700 hover:text-orange-600">Upgrade to Premium</a> for unlimited expenses.
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Filters with handleFilterChange */}
                    <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200/80 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="text" placeholder="Search by description..." value={filters.search} onChange={e => handleFilterChange({ search: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                            </div>
                            <select value={filters.category} onChange={e => handleFilterChange({ category: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition">
                                <option value="all">All Categories</option>
                                {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => <option key={key} value={key}>{cat.icon} {cat.name}</option>)}
                            </select>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="date" value={filters.startDate} onChange={e => handleFilterChange({ startDate: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                            </div>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input type="date" value={filters.endDate} onChange={e => handleFilterChange({ endDate: e.target.value })} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Rest of the JSX remains the same */}
                    <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {loading ? (
                                <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center text-gray-500">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                    <p className="mt-4">Loading expenses...</p>
                                </motion.div>
                            ) : expenses.length === 0 ? (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-8 text-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Receipt className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h4 className="text-lg font-medium text-gray-800 mb-1">No expenses found</h4>
                                    <p className="text-gray-500">Try adjusting your filters or add a new expense.</p>
                                </motion.div>
                            ) : (
                                <motion.div key="list" className="divide-y divide-gray-200">
                                    {expenses.map((expense) => (
                                        <motion.div key={expense._id} variants={itemVariants} className="p-4 sm:p-6 hover:bg-gray-50/70 transition-colors">
                                            <div className="flex items-center justify-between flex-wrap gap-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${EXPENSE_CATEGORIES[expense.category]?.color}20`, color: EXPENSE_CATEGORIES[expense.category]?.color }}>
                                                        {EXPENSE_CATEGORIES[expense.category]?.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">{expense.description}</h4>
                                                        <div className="flex items-center flex-wrap gap-x-3 text-sm text-gray-500 mt-1">
                                                            <span>{EXPENSE_CATEGORIES[expense.category]?.name}</span>
                                                            {expense.tags.length > 0 && <span className="flex items-center gap-1"><Tag size={12} /> {expense.tags.join(', ')}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4 sm:space-x-6">
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg text-gray-800">{formatCurrency(expense.amount, expense.currency)}</p>
                                                        <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"><Edit3 size={16} /></motion.button>
                                                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => deleteExpense(expense._id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && !loading && (
                            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-sm text-gray-600">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </p>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })} disabled={pagination.currentPage === 1} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">Previous</button>
                                    <button onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })} disabled={pagination.currentPage === pagination.totalPages} className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors">Next</button>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Modal */}
                    <AnimatePresence>
                        {showAddForm && (
                            <motion.div
                                key="modal-backdrop"
                                variants={modalBackdropVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                                onClick={() => setShowAddForm(false)}
                            >
                                <motion.div
                                    key="modal-panel"
                                    variants={modalPanelVariants}
                                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
                                    onClick={(e) => e.stopPropagation()} // Prevents closing modal when clicking inside
                                >
                                    <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                        <h3 className="text-xl font-semibold text-gray-900">Add New Expense</h3>
                                        <motion.button whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} onClick={() => setShowAddForm(false)} className="p-2 text-gray-500 hover:text-gray-800 rounded-full transition-colors"><X size={20} /></motion.button>
                                    </div>
                                    <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                                        {errors.submit && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{errors.submit}</div>}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount *</label>
                                            <input type="number" step="0.01" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 ${errors.amount ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`} placeholder="₹0.00" />
                                            {errors.amount && <p className="text-red-600 text-sm mt-1">{errors.amount}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description *</label>
                                            <input type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 ${errors.description ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`} placeholder="e.g., Lunch with colleagues" />
                                            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                                            <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 ${errors.category ? 'border-red-400 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'}`}>
                                                <option value="">Select a category</option>
                                                {Object.entries(EXPENSE_CATEGORIES).map(([key, cat]) => <option key={key} value={key}>{cat.icon} {cat.name}</option>)}
                                            </select>
                                            {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                                            <input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags</label>
                                            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyPress} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Type a tag and press Enter" />
                                            {formData.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {formData.tags.map((tag, index) => (
                                                        <span key={index} className="inline-flex items-center gap-x-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                                                            {tag}
                                                            <button type="button" onClick={() => removeTag(tag)} className="text-indigo-500 hover:text-indigo-700"><X size={14} /></button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-end space-x-4 pt-4">
                                            <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold transition-colors">Cancel</button>
                                            <button type="submit" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors">Add Expense</button>
                                        </div>
                                    </form>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </ProtectedRoute>
    );
}