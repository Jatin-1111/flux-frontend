// app/goals/page.js
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import {
    Target,
    Plus,
    Edit3,
    Trash2,
    Calendar,
    DollarSign,
    TrendingUp,
    Award,
    Zap,
    CheckCircle,
    Clock,
    AlertCircle,
    X,
    Wallet,
    Gift,
    Home,
    Car,
    Plane,
    Smartphone,
    Gamepad2,
    Heart,
    Star,
    MoreHorizontal
} from 'lucide-react'

// Goal category icons and colors
const GOAL_CATEGORIES = {
    emergency: {
        name: 'Emergency Fund',
        icon: AlertCircle,
        color: '#EF4444',
        gradient: 'from-red-500 to-red-600',
        bgGradient: 'from-red-50 to-red-100'
    },
    vacation: {
        name: 'Vacation',
        icon: Plane,
        color: '#06B6D4',
        gradient: 'from-cyan-500 to-blue-500',
        bgGradient: 'from-cyan-50 to-blue-100'
    },
    gadget: {
        name: 'Electronics',
        icon: Smartphone,
        color: '#8B5CF6',
        gradient: 'from-purple-500 to-purple-600',
        bgGradient: 'from-purple-50 to-purple-100'
    },
    car: {
        name: 'Vehicle',
        icon: Car,
        color: '#059669',
        gradient: 'from-emerald-500 to-green-600',
        bgGradient: 'from-emerald-50 to-green-100'
    },
    home: {
        name: 'Home',
        icon: Home,
        color: '#D97706',
        gradient: 'from-amber-500 to-orange-600',
        bgGradient: 'from-amber-50 to-orange-100'
    },
    education: {
        name: 'Education',
        icon: Award,
        color: '#0EA5E9',
        gradient: 'from-sky-500 to-blue-600',
        bgGradient: 'from-sky-50 to-blue-100'
    },
    gift: {
        name: 'Gift',
        icon: Gift,
        color: '#EC4899',
        gradient: 'from-pink-500 to-rose-600',
        bgGradient: 'from-pink-50 to-rose-100'
    },
    entertainment: {
        name: 'Entertainment',
        icon: Gamepad2,
        color: '#7C3AED',
        gradient: 'from-violet-500 to-purple-600',
        bgGradient: 'from-violet-50 to-purple-100'
    },
    health: {
        name: 'Health & Fitness',
        icon: Heart,
        color: '#DC2626',
        gradient: 'from-red-500 to-pink-600',
        bgGradient: 'from-red-50 to-pink-100'
    },
    other: {
        name: 'Other',
        icon: Star,
        color: '#6B7280',
        gradient: 'from-gray-500 to-gray-600',
        bgGradient: 'from-gray-50 to-gray-100'
    }
}

export default function GoalsPage() {
    const { user } = useAuth()
    const [goals, setGoals] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddForm, setShowAddForm] = useState(false)
    const [editingGoal, setEditingGoal] = useState(null)
    const [showContributeModal, setShowContributeModal] = useState(null)

    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        currentAmount: '',
        deadline: '',
        category: 'other',
        description: '',
        autoSave: {
            enabled: false,
            amount: '',
            frequency: 'monthly'
        }
    })

    const [contributeAmount, setContributeAmount] = useState('')
    const [errors, setErrors] = useState({})

    const fetchGoals = async () => {
        try {
            setLoading(true)
            // Mock API call - replace with actual endpoint when available
            const response = await api.get('/goals')
            setGoals(response.data.data?.goals || [])
        } catch (error) {
            console.error('Error fetching goals:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGoals()
    }, [])

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount)
    }

    const calculateProgress = (current, target) => {
        return Math.min((current / target) * 100, 100)
    }

    const calculateDaysLeft = (deadline) => {
        const today = new Date()
        const deadlineDate = new Date(deadline)
        const diffTime = deadlineDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays > 0 ? diffDays : 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})

        // Validation
        const newErrors = {}
        if (!formData.name.trim()) newErrors.name = 'Goal name is required'
        if (!formData.targetAmount || formData.targetAmount <= 0) newErrors.targetAmount = 'Valid target amount is required'
        if (!formData.deadline) newErrors.deadline = 'Deadline is required'
        if (formData.currentAmount < 0) newErrors.currentAmount = 'Current amount cannot be negative'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        try {
            const goalData = {
                ...formData,
                targetAmount: parseFloat(formData.targetAmount),
                currentAmount: parseFloat(formData.currentAmount || 0),
                autoSave: {
                    ...formData.autoSave,
                    amount: formData.autoSave.enabled ? parseFloat(formData.autoSave.amount || 0) : 0
                }
            }

            if (editingGoal) {
                // Update existing goal
                const updatedGoals = goals.map(goal =>
                    goal._id === editingGoal._id ? { ...goal, ...goalData } : goal
                )
                setGoals(updatedGoals)
                setEditingGoal(null)
            } else {
                // Create new goal
                const newGoal = {
                    ...goalData,
                    _id: Date.now().toString(),
                    isCompleted: false,
                    createdAt: new Date().toISOString()
                }
                setGoals([newGoal, ...goals])
            }

            setShowAddForm(false)
            resetForm()
        } catch (error) {
            setErrors({ submit: error.response?.data?.message || 'Error saving goal' })
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            targetAmount: '',
            currentAmount: '',
            deadline: '',
            category: 'other',
            description: '',
            autoSave: {
                enabled: false,
                amount: '',
                frequency: 'monthly'
            }
        })
        setErrors({})
    }

    const handleEdit = (goal) => {
        setFormData({
            name: goal.name,
            targetAmount: goal.targetAmount.toString(),
            currentAmount: goal.currentAmount.toString(),
            deadline: goal.deadline,
            category: goal.category,
            description: goal.description || '',
            autoSave: {
                enabled: goal.autoSave?.enabled || false,
                amount: goal.autoSave?.amount?.toString() || '',
                frequency: goal.autoSave?.frequency || 'monthly'
            }
        })
        setEditingGoal(goal)
        setShowAddForm(true)
    }

    const handleDelete = async (goalId) => {
        if (!confirm('Are you sure you want to delete this goal?')) return

        try {
            setGoals(goals.filter(goal => goal._id !== goalId))
        } catch (error) {
            console.error('Error deleting goal:', error)
        }
    }

    const handleContribute = async (goalId) => {
        if (!contributeAmount || contributeAmount <= 0) return

        try {
            const updatedGoals = goals.map(goal => {
                if (goal._id === goalId) {
                    const newAmount = goal.currentAmount + parseFloat(contributeAmount)
                    return {
                        ...goal,
                        currentAmount: Math.min(newAmount, goal.targetAmount),
                        isCompleted: newAmount >= goal.targetAmount
                    }
                }
                return goal
            })
            setGoals(updatedGoals)
            setShowContributeModal(null)
            setContributeAmount('')
        } catch (error) {
            console.error('Error contributing to goal:', error)
        }
    }

    const getStatusBadge = (goal) => {
        if (goal.isCompleted) {
            return (
                <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    <CheckCircle size={12} />
                    <span>Completed</span>
                </div>
            )
        }

        const daysLeft = calculateDaysLeft(goal.deadline)
        if (daysLeft === 0) {
            return (
                <div className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    <AlertCircle size={12} />
                    <span>Overdue</span>
                </div>
            )
        }

        if (daysLeft <= 30) {
            return (
                <div className="inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    <Clock size={12} />
                    <span>{daysLeft} days left</span>
                </div>
            )
        }

        return (
            <div className="inline-flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                <Clock size={12} />
                <span>{daysLeft} days left</span>
            </div>
        )
    }

    const activeGoals = goals.filter(goal => !goal.isCompleted)
    const completedGoals = goals.filter(goal => goal.isCompleted)
    const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
    const totalTargets = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                    <Target className="w-5 h-5 text-white" />
                                </div>
                                <span>Savings Goals</span>
                            </h1>
                            <p className="text-gray-600 mt-1">Track your progress toward financial milestones</p>
                        </div>

                        <button
                            onClick={() => {
                                resetForm()
                                setEditingGoal(null)
                                setShowAddForm(true)
                            }}
                            className="mt-4 md:mt-0 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Add Goal</span>
                        </button>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Total Saved</p>
                                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalSaved)}</p>
                                    <p className="text-sm text-green-600 mt-1">
                                        {totalTargets > 0 ? `${((totalSaved / totalTargets) * 100).toFixed(1)}% of targets` : 'Start saving!'}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                    <DollarSign className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Active Goals</p>
                                    <p className="text-2xl font-bold text-gray-900">{activeGoals.length}</p>
                                    <p className="text-sm text-blue-600 mt-1">{completedGoals.length} completed</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Avg Progress</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {activeGoals.length > 0
                                            ? `${(activeGoals.reduce((sum, goal) => sum + calculateProgress(goal.currentAmount, goal.targetAmount), 0) / activeGoals.length).toFixed(1)}%`
                                            : '0%'
                                        }
                                    </p>
                                    <p className="text-sm text-purple-600 mt-1">Across all goals</p>
                                </div>
                                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Goals Grid */}
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                            <p className="text-gray-500 mt-4">Loading your goals...</p>
                        </div>
                    ) : goals.length === 0 ? (
                        <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Target className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No goals yet</h3>
                            <p className="text-gray-500 mb-6">Start building your financial future by setting your first savings goal</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Create Your First Goal
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Active Goals */}
                            {activeGoals.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                        <Zap className="w-5 h-5 text-yellow-500" />
                                        <span>Active Goals</span>
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {activeGoals.map(goal => {
                                            const category = GOAL_CATEGORIES[goal.category] || GOAL_CATEGORIES.other
                                            const IconComponent = category.icon
                                            const progress = calculateProgress(goal.currentAmount, goal.targetAmount)

                                            return (
                                                <div key={goal._id} className={`bg-gradient-to-br ${category.bgGradient} rounded-2xl shadow-lg p-6 border border-white/50 hover:shadow-xl transition-all duration-300 group`}>
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-12 h-12 bg-gradient-to-r ${category.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                                                                <IconComponent className="w-6 h-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-gray-900">{goal.name}</h3>
                                                                <p className="text-sm text-gray-600">{category.name}</p>
                                                            </div>
                                                        </div>
                                                        <div className="relative group/menu">
                                                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-colors">
                                                                <MoreHorizontal size={16} />
                                                            </button>
                                                            <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 group-hover/menu:opacity-100 transition-opacity pointer-events-none group-hover/menu:pointer-events-auto z-10">
                                                                <button
                                                                    onClick={() => handleEdit(goal)}
                                                                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                                                >
                                                                    <Edit3 size={12} />
                                                                    <span>Edit</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(goal._id)}
                                                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                                                >
                                                                    <Trash2 size={12} />
                                                                    <span>Delete</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mb-4">
                                                        <div className="flex justify-between items-baseline mb-2">
                                                            <span className="text-2xl font-bold text-gray-900">{formatCurrency(goal.currentAmount)}</span>
                                                            <span className="text-sm text-gray-600">of {formatCurrency(goal.targetAmount)}</span>
                                                        </div>
                                                        <div className="w-full bg-white/70 rounded-full h-3 mb-2">
                                                            <div
                                                                className={`bg-gradient-to-r ${category.gradient} h-3 rounded-full transition-all duration-500 relative overflow-hidden`}
                                                                style={{ width: `${progress}%` }}
                                                            >
                                                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-700">{progress.toFixed(1)}% complete</span>
                                                            {getStatusBadge(goal)}
                                                        </div>
                                                    </div>

                                                    {goal.description && (
                                                        <p className="text-sm text-gray-600 mb-4">{goal.description}</p>
                                                    )}

                                                    {goal.autoSave?.enabled && (
                                                        <div className="bg-white/50 rounded-lg p-3 mb-4">
                                                            <div className="flex items-center space-x-2 text-sm">
                                                                <Zap className="w-4 h-4 text-green-600" />
                                                                <span className="font-medium text-green-700">Auto-save active</span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {formatCurrency(goal.autoSave.amount)} every {goal.autoSave.frequency}
                                                            </p>
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => setShowContributeModal(goal._id)}
                                                        className={`w-full bg-gradient-to-r ${category.gradient} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg`}
                                                    >
                                                        Add Money
                                                    </button>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Completed Goals */}
                            {completedGoals.length > 0 && (
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                        <Award className="w-5 h-5 text-green-500" />
                                        <span>Completed Goals</span>
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {completedGoals.map(goal => {
                                            const category = GOAL_CATEGORIES[goal.category] || GOAL_CATEGORIES.other
                                            const IconComponent = category.icon

                                            return (
                                                <div key={goal._id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-green-200 relative overflow-hidden">
                                                    <div className="absolute top-4 right-4">
                                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                            <CheckCircle className="w-5 h-5 text-white" />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-3 mb-4">
                                                        <div className={`w-12 h-12 bg-gradient-to-r ${category.gradient} rounded-xl flex items-center justify-center opacity-75`}>
                                                            <IconComponent className="w-6 h-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-gray-900">{goal.name}</h3>
                                                            <p className="text-sm text-gray-600">{category.name}</p>
                                                        </div>
                                                    </div>

                                                    <div className="text-center py-4">
                                                        <p className="text-2xl font-bold text-green-600">{formatCurrency(goal.targetAmount)}</p>
                                                        <p className="text-sm text-gray-500">Goal achieved!</p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Add/Edit Goal Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {editingGoal ? 'Edit Goal' : 'Create New Goal'}
                                </h3>
                                <button
                                    onClick={() => {
                                        setShowAddForm(false)
                                        setEditingGoal(null)
                                        resetForm()
                                    }}
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

                                {/* Goal Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Goal Name *</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                                        placeholder="e.g., Emergency Fund, iPhone 15, Japan Trip"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {Object.entries(GOAL_CATEGORIES).map(([key, category]) => {
                                            const IconComponent = category.icon
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, category: key })}
                                                    className={`p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${formData.category === key
                                                        ? `border-${category.color} bg-${category.color}/10`
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <div className={`w-8 h-8 bg-gradient-to-r ${category.gradient} rounded-lg flex items-center justify-center`}>
                                                        <IconComponent className="w-4 h-4 text-white" />
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700">{category.name}</span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Amounts */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.targetAmount}
                                            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.targetAmount ? 'border-red-300' : 'border-gray-200'}`}
                                            placeholder="100000"
                                        />
                                        {errors.targetAmount && <p className="text-red-500 text-sm mt-1">{errors.targetAmount}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.currentAmount}
                                            onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                                            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.currentAmount ? 'border-red-300' : 'border-gray-200'}`}
                                            placeholder="0"
                                        />
                                        {errors.currentAmount && <p className="text-red-500 text-sm mt-1">{errors.currentAmount}</p>}
                                    </div>
                                </div>

                                {/* Deadline */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Date *</label>
                                    <input
                                        type="date"
                                        value={formData.deadline}
                                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.deadline ? 'border-red-300' : 'border-gray-200'}`}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                    {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="What's this goal for? Any additional details..."
                                    />
                                </div>

                                {/* Auto Save */}
                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Auto-Save</h4>
                                            <p className="text-sm text-gray-500">Automatically contribute to this goal</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.autoSave.enabled}
                                                onChange={(e) => setFormData({
                                                    ...formData,
                                                    autoSave: { ...formData.autoSave, enabled: e.target.checked }
                                                })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                                        </label>
                                    </div>

                                    {formData.autoSave.enabled && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={formData.autoSave.amount}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        autoSave: { ...formData.autoSave, amount: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    placeholder="5000"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                                                <select
                                                    value={formData.autoSave.frequency}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        autoSave: { ...formData.autoSave, frequency: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                >
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="quarterly">Quarterly</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Submit */}
                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddForm(false)
                                            setEditingGoal(null)
                                            resetForm()
                                        }}
                                        className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-colors"
                                    >
                                        {editingGoal ? 'Update Goal' : 'Create Goal'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Contribute Modal */}
                {showContributeModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">Add Money</h3>
                                <button
                                    onClick={() => {
                                        setShowContributeModal(null)
                                        setContributeAmount('')
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6">
                                {(() => {
                                    const goal = goals.find(g => g._id === showContributeModal)
                                    if (!goal) return null

                                    const category = GOAL_CATEGORIES[goal.category] || GOAL_CATEGORIES.other
                                    const IconComponent = category.icon
                                    const remaining = goal.targetAmount - goal.currentAmount

                                    return (
                                        <div>
                                            <div className="flex items-center space-x-3 mb-6">
                                                <div className={`w-12 h-12 bg-gradient-to-r ${category.gradient} rounded-xl flex items-center justify-center`}>
                                                    <IconComponent className="w-6 h-6 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{goal.name}</h4>
                                                    <p className="text-sm text-gray-600">{formatCurrency(remaining)} remaining</p>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Add</label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max={remaining}
                                                    value={contributeAmount}
                                                    onChange={(e) => setContributeAmount(e.target.value)}
                                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                                    placeholder="Enter amount"
                                                />
                                            </div>

                                            <div className="flex items-center justify-end space-x-4">
                                                <button
                                                    onClick={() => {
                                                        setShowContributeModal(null)
                                                        setContributeAmount('')
                                                    }}
                                                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleContribute(showContributeModal)}
                                                    disabled={!contributeAmount || contributeAmount <= 0}
                                                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                                                >
                                                    Add {contributeAmount ? formatCurrency(parseFloat(contributeAmount)) : 'Money'}
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })()}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}