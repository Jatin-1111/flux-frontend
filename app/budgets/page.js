// app/budgets/page.js
'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { api } from '@/lib/api'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { Plus, Target, MoreVertical, Edit, Trash2, X, AlertCircle, PieChart } from 'lucide-react'

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

export default function BudgetsPage() {
    const { user } = useAuth()
    const [budgets, setBudgets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showAddForm, setShowAddForm] = useState(false)
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
                fetchBudgets() // Refresh the list
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
            fetchBudgets(); // Refresh the list
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

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Budgets</h1>
                            <p className="text-gray-600 mt-1">Manage your spending goals and stay on track</p>
                        </div>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center space-x-2"
                        >
                            <Plus size={20} />
                            <span>Create Budget</span>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center space-x-2">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Budgets Grid */}
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="text-gray-500 mt-4">Loading your budgets...</p>
                        </div>
                    ) : budgets.length === 0 ? (
                        <div className="text-center py-16 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Target className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No active budgets found</h3>
                            <p className="text-gray-500 mb-6">Create a budget to start tracking your spending goals.</p>
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Create Your First Budget
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {budgets.map(budget => (
                                <div key={budget._id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/50 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: `${BUDGET_CATEGORIES[budget.category]?.color}20` }}>
                                                    {BUDGET_CATEGORIES[budget.category]?.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{budget.name}</h3>
                                                    <p className="text-sm text-gray-500">{BUDGET_CATEGORIES[budget.category]?.name}</p>
                                                </div>
                                            </div>
                                            <div className="relative group">
                                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                                    <MoreVertical size={20} />
                                                </button>
                                                <div className="absolute right-0 w-40 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                                                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"><Edit size={14} /><span>Edit</span></button>
                                                    <button onClick={() => deleteBudget(budget._id)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"><Trash2 size={14} /><span>Delete</span></button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-2xl font-bold text-gray-900">{formatCurrency(budget.spent)}</span>
                                                <span className="text-sm text-gray-500">of {formatCurrency(budget.amount)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full"
                                                    style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        {budget.remaining > 0 ? (
                                            <p className="text-sm text-green-600 font-medium text-center">{formatCurrency(budget.remaining)} left to spend</p>
                                        ) : (
                                            <p className="text-sm text-red-600 font-medium text-center">{formatCurrency(Math.abs(budget.remaining))} over budget</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Budget Modal */}
                {showAddForm && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-gray-900">Create New Budget</h3>
                                <button onClick={() => setShowAddForm(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {formErrors.submit && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {formErrors.submit}
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name*</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${formErrors.name ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-300 focus:ring-blue-500/50'}`}
                                        placeholder="e.g., Monthly Groceries"
                                    />
                                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${formErrors.category ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-300 focus:ring-blue-500/50'}`}
                                    >
                                        <option value="">Select a category</option>
                                        {Object.entries(BUDGET_CATEGORIES).map(([key, cat]) => (
                                            <option key={key} value={key}>{cat.icon} {cat.name}</option>
                                        ))}
                                    </select>
                                    {formErrors.category && <p className="text-red-500 text-sm mt-1">{formErrors.category}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount*</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${formErrors.amount ? 'border-red-300 focus:ring-red-500/50' : 'border-gray-300 focus:ring-blue-500/50'}`}
                                        placeholder="0.00"
                                    />
                                    {formErrors.amount && <p className="text-red-500 text-sm mt-1">{formErrors.amount}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                                    <select
                                        value={formData.period}
                                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/50"
                                    >
                                        <option value="monthly">Monthly</option>
                                        <option value="weekly">Weekly</option>
                                        <option value="yearly">Yearly</option>
                                    </select>
                                </div>
                                <div className="flex items-center justify-end space-x-4 pt-4">
                                    <button type="button" onClick={() => setShowAddForm(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                                    <button type="submit" className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">Create Budget</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
