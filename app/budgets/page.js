'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, MoreVertical, Edit, Trash2, X, AlertCircle, PieChart, TrendingUp, Wallet, Calendar } from 'lucide-react'

// Categories to match the backend schema
const BUDGET_CATEGORIES = {
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
    other: { name: 'Other', icon: '📂', color: '#636E72' },
    total: { name: 'Total Spending', icon: '💰', color: '#A29BFE' }
}

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

const budgetCardVariants = {
    hidden: { scale: 0.9, opacity: 0, y: 30 },
    visible: {
        scale: 1,
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15
        }
    },
    hover: {
        scale: 1.02,
        y: -5,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10
        }
    },
    tap: {
        scale: 0.98,
        transition: {
            duration: 0.1
        }
    }
};

const progressBarVariants = {
    hidden: { width: 0 },
    visible: (percentage) => ({
        width: `${Math.min(percentage, 100)}%`,
        transition: {
            duration: 1.5,
            ease: "easeOut",
            delay: 0.5
        }
    })
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

const alertVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 500,
            damping: 30
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.95,
        transition: {
            duration: 0.2
        }
    }
};

const iconVariants = {
    hover: {
        scale: 1.2,
        rotate: 5,
        transition: {
            type: 'spring',
            stiffness: 400,
            damping: 10
        }
    }
};

const dropdownVariants = {
    hidden: {
        opacity: 0,
        scale: 0.95,
        y: -10
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 500,
            damping: 30
        }
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -10,
        transition: {
            duration: 0.1
        }
    }
};

export default function BudgetsPage() {
    const { user } = useAuth()
    const [budgets, setBudgets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
    const [hoveredBudget, setHoveredBudget] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        amount: '',
        period: 'monthly'
    })
    const [formErrors, setFormErrors] = useState({})

    const fetchBudgets = async () => {
        try {
            setLoading(true)
            setError(null)
            const response = await api.get('/budgets?active=true')
            if (response.data.success) {
                setBudgets(response.data.data.budgets || [])
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch budgets')
            console.error('Error fetching budgets:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            fetchBudgets()
        }
    }, [user])

    const validateForm = () => {
        const errors = {}
        if (!formData.name.trim()) errors.name = 'Budget name is required'
        if (!formData.category) errors.category = 'Category is required'
        if (!formData.amount || formData.amount <= 0) errors.amount = 'A valid amount is required'
        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validateForm()) return

        try {
            const response = await api.post('/budgets', {
                ...formData,
                amount: parseFloat(formData.amount)
            })

            if (response.data.success) {
                setShowAddForm(false)
                setFormData({ name: '', category: '', amount: '', period: 'monthly' })
                fetchBudgets()
            }
        } catch (err) {
            setFormErrors({ submit: err.response?.data?.message || 'Error creating budget' })
            console.error('Error creating budget:', err)
        }
    }

    const deleteBudget = async (budgetId) => {
        if (!confirm('Are you sure you want to delete this budget?')) return;

        try {
            await api.delete(`/budgets/${budgetId}`);
            fetchBudgets();
        } catch (err) {
            console.error('Error deleting budget:', err);
            setError('Failed to delete budget. Please try again.');
        }
    };

    const formatCurrency = (amount, currency = 'INR') => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency
        }).format(amount)
    }

    const getBudgetStatus = (budget) => {
        const percentage = budget.percentageUsed || 0
        if (percentage >= 100) return { color: 'red', status: 'Over Budget' }
        if (percentage >= 80) return { color: 'orange', status: 'Almost Full' }
        if (percentage >= 60) return { color: 'yellow', status: 'On Track' }
        return { color: 'green', status: 'Good' }
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
                        variants={headerVariants}
                        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
                    >
                        <div>
                            <motion.h1
                                className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent flex items-center space-x-3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <motion.div
                                    className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 400 }}
                                >
                                    <Target className="w-5 h-5 text-white" />
                                </motion.div>
                                <span>Budgets</span>
                            </motion.h1>
                            <motion.p
                                className="text-gray-600 mt-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Manage your spending goals and stay on track with style
                            </motion.p>
                        </div>
                        <motion.button
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            onClick={() => setShowAddForm(true)}
                            className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg flex items-center space-x-2"
                        >
                            <motion.div
                                animate={{ rotate: showAddForm ? 45 : 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            >
                                <Plus size={20} />
                            </motion.div>
                            <span>Create Budget</span>
                        </motion.button>
                    </motion.div>

                    {/* Error Alert */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                variants={alertVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-800 flex items-center space-x-2 shadow-lg"
                            >
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 500 }}
                                >
                                    <AlertCircle size={20} />
                                </motion.div>
                                <span>{error}</span>
                                <motion.button
                                    onClick={() => setError(null)}
                                    className="ml-auto text-red-600 hover:text-red-800"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <X size={16} />
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Budgets Grid */}
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-20"
                            >
                                <motion.div
                                    variants={loadingVariants}
                                    animate="animate"
                                    className="inline-block w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                                />
                                <motion.p
                                    className="text-gray-600 font-medium"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Loading your budgets...
                                </motion.p>
                            </motion.div>
                        ) : budgets.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="text-center py-20 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50"
                            >
                                <motion.div
                                    className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6"
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Target className="w-12 h-12 text-gray-400" />
                                </motion.div>
                                <motion.h3
                                    className="text-xl font-semibold text-gray-900 mb-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    No active budgets found
                                </motion.h3>
                                <motion.p
                                    className="text-gray-500 mb-8"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Create a budget to start tracking your spending goals.
                                </motion.p>
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Create Your First Budget
                                </motion.button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="budgets"
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <AnimatePresence>
                                    {budgets.map((budget, index) => {
                                        const status = getBudgetStatus(budget)
                                        return (
                                            <motion.div
                                                key={budget._id}
                                                variants={budgetCardVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                custom={index}
                                                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 flex flex-col justify-between relative overflow-hidden group cursor-pointer"
                                                onHoverStart={() => setHoveredBudget(budget._id)}
                                                onHoverEnd={() => setHoveredBudget(null)}
                                                layout
                                                transition={{ delay: index * 0.1 }}
                                            >
                                                {/* Background gradient effect */}
                                                <motion.div
                                                    className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${BUDGET_CATEGORIES[budget.category]?.color}20, ${BUDGET_CATEGORIES[budget.category]?.color}05)`
                                                    }}
                                                />

                                                <div className="relative z-10">
                                                    <motion.div
                                                        className="flex items-center justify-between mb-4"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.1 }}
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <motion.div
                                                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border-2 border-white/50"
                                                                style={{ backgroundColor: `${BUDGET_CATEGORIES[budget.category]?.color}20` }}
                                                                variants={iconVariants}
                                                                whileHover="hover"
                                                            >
                                                                {BUDGET_CATEGORIES[budget.category]?.icon}
                                                            </motion.div>
                                                            <div>
                                                                <motion.h3
                                                                    className="font-bold text-gray-900"
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.2 }}
                                                                >
                                                                    {budget.name}
                                                                </motion.h3>
                                                                <motion.p
                                                                    className="text-sm text-gray-500"
                                                                    initial={{ opacity: 0, x: -10 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: 0.3 }}
                                                                >
                                                                    {BUDGET_CATEGORIES[budget.category]?.name}
                                                                </motion.p>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <motion.button
                                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full transition-colors"
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                            >
                                                                <MoreVertical size={20} />
                                                            </motion.button>
                                                            <AnimatePresence>
                                                                {hoveredBudget === budget._id && (
                                                                    <motion.div
                                                                        variants={dropdownVariants}
                                                                        initial="hidden"
                                                                        animate="visible"
                                                                        exit="exit"
                                                                        className="absolute right-0 top-full w-40 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-100 z-20 overflow-hidden"
                                                                    >
                                                                        <motion.button
                                                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors"
                                                                            whileHover={{ x: 5 }}
                                                                        >
                                                                            <Edit size={14} />
                                                                            <span>Edit</span>
                                                                        </motion.button>
                                                                        <motion.button
                                                                            onClick={() => deleteBudget(budget._id)}
                                                                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
                                                                            whileHover={{ x: 5 }}
                                                                        >
                                                                            <Trash2 size={14} />
                                                                            <span>Delete</span>
                                                                        </motion.button>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </motion.div>

                                                    <motion.div
                                                        className="mb-6"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.4 }}
                                                    >
                                                        <div className="flex justify-between items-baseline mb-3">
                                                            <motion.span
                                                                className="text-2xl font-bold text-gray-900"
                                                                initial={{ scale: 0.8 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                                                            >
                                                                {formatCurrency(budget.spent || 0)}
                                                            </motion.span>
                                                            <span className="text-sm text-gray-500">
                                                                of {formatCurrency(budget.amount)}
                                                            </span>
                                                        </div>

                                                        {/* Progress Bar */}
                                                        <div className="relative">
                                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                                <motion.div
                                                                    className="h-3 rounded-full relative overflow-hidden"
                                                                    style={{
                                                                        background: `linear-gradient(90deg, ${BUDGET_CATEGORIES[budget.category]?.color}, ${BUDGET_CATEGORIES[budget.category]?.color}80)`
                                                                    }}
                                                                    variants={progressBarVariants}
                                                                    initial="hidden"
                                                                    animate="visible"
                                                                    custom={budget.percentageUsed || 0}
                                                                >
                                                                    <motion.div
                                                                        className="absolute inset-0 bg-white/20"
                                                                        animate={{
                                                                            x: ['0%', '100%'],
                                                                            opacity: [0, 1, 0]
                                                                        }}
                                                                        transition={{
                                                                            duration: 2,
                                                                            repeat: Infinity,
                                                                            delay: 1
                                                                        }}
                                                                    />
                                                                </motion.div>
                                                            </div>
                                                            <motion.div
                                                                className="absolute -top-1 right-0 flex items-center space-x-1"
                                                                initial={{ opacity: 0, scale: 0 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: 1, type: 'spring', stiffness: 500 }}
                                                            >
                                                                <motion.div
                                                                    className={`w-2 h-2 rounded-full ${status.color === 'red' ? 'bg-red-500' :
                                                                            status.color === 'orange' ? 'bg-orange-500' :
                                                                                status.color === 'yellow' ? 'bg-yellow-500' :
                                                                                    'bg-green-500'
                                                                        }`}
                                                                    animate={{ scale: [1, 1.2, 1] }}
                                                                    transition={{ duration: 2, repeat: Infinity }}
                                                                />
                                                                <span className="text-xs text-gray-600 font-medium">
                                                                    {Math.min(budget.percentageUsed || 0, 100).toFixed(0)}%
                                                                </span>
                                                            </motion.div>
                                                        </div>
                                                    </motion.div>
                                                </div>

                                                <motion.div
                                                    className="relative z-10"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.6 }}
                                                >
                                                    {budget.remaining > 0 ? (
                                                        <motion.div
                                                            className="text-center"
                                                            whileHover={{ scale: 1.05 }}
                                                        >
                                                            <p className="text-sm text-green-600 font-medium">
                                                                {formatCurrency(budget.remaining)} left to spend
                                                            </p>
                                                            <div className="flex items-center justify-center space-x-1 mt-1">
                                                                <Wallet size={12} className="text-green-500" />
                                                                <span className="text-xs text-green-500">Good</span>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            className="text-center"
                                                            whileHover={{ scale: 1.05 }}
                                                        >
                                                            <p className="text-sm text-red-600 font-medium">
                                                                {formatCurrency(Math.abs(budget.remaining))} over budget
                                                            </p>
                                                            <div className="flex items-center justify-center space-x-1 mt-1">
                                                                <TrendingUp size={12} className="text-red-500" />
                                                                <span className="text-xs text-red-500">Over Budget</span>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Add Budget Modal */}
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
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <motion.div
                                    className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-purple-600"
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    <h3 className="text-xl font-semibold text-white">Create New Budget</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1, rotate: 90 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowAddForm(false)}
                                        className="p-2 text-white/80 hover:text-white rounded-full transition-colors"
                                    >
                                        <X size={20} />
                                    </motion.button>
                                </motion.div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                    <AnimatePresence>
                                        {formErrors.submit && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center space-x-2"
                                            >
                                                <AlertCircle size={16} />
                                                <span>{formErrors.submit}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Budget Name*</label>
                                        <motion.input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 ${formErrors.name
                                                    ? 'border-red-300 focus:ring-red-500/50'
                                                    : 'border-gray-300 focus:ring-blue-500/50'
                                                }`}
                                            placeholder="e.g., Monthly Groceries"
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                        <AnimatePresence>
                                            {formErrors.name && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-red-500 text-sm mt-1"
                                                >
                                                    {formErrors.name}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category*</label>
                                        <motion.select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 ${formErrors.category
                                                    ? 'border-red-300 focus:ring-red-500/50'
                                                    : 'border-gray-300 focus:ring-blue-500/50'
                                                }`}
                                            whileFocus={{ scale: 1.02 }}
                                        >
                                            <option value="">Select a category</option>
                                            {Object.entries(BUDGET_CATEGORIES).map(([key, cat]) => (
                                                <option key={key} value={key}>{cat.icon} {cat.name}</option>
                                            ))}
                                        </motion.select>
                                        <AnimatePresence>
                                            {formErrors.category && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-red-500 text-sm mt-1"
                                                >
                                                    {formErrors.category}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount*</label>
                                        <motion.input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 transition-all duration-200 ${formErrors.amount
                                                    ? 'border-red-300 focus:ring-red-500/50'
                                                    : 'border-gray-300 focus:ring-blue-500/50'
                                                }`}
                                            placeholder="₹0.00"
                                            whileFocus={{ scale: 1.02 }}
                                        />
                                        <AnimatePresence>
                                            {formErrors.amount && (
                                                <motion.p
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-red-500 text-sm mt-1"
                                                >
                                                    {formErrors.amount}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
                                        <motion.select
                                            value={formData.period}
                                            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500/50 transition-all duration-200"
                                            whileFocus={{ scale: 1.02 }}
                                        >
                                            <option value="monthly">📅 Monthly</option>
                                            <option value="weekly">📆 Weekly</option>
                                            <option value="yearly">🗓️ Yearly</option>
                                        </motion.select>
                                    </motion.div>

                                    <motion.div
                                        className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
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
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-colors"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            Create Budget
                                        </motion.button>
                                    </motion.div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    )
}