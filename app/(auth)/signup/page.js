'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, Wallet, Shield, Zap, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignupPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [validationErrors, setValidationErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const { signup, loading, error, isAuthenticated } = useAuth()

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            window.location.href = '/dashboard'
        }
    }, [isAuthenticated])

    const validateForm = () => {
        const errors = {}

        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required'
        }

        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required'
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid'
        }

        if (formData.phone && !/^\+?[1-9]\d{1,14}$/.test(formData.phone)) {
            errors.phone = 'Phone number is invalid'
        }

        if (!formData.password) {
            errors.password = 'Password is required'
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters'
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match'
        }

        setValidationErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        const userData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone || undefined,
            password: formData.password
        }

        await signup(userData)
        setIsLoading(false)
    }

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))

        // Clear validation error when user starts typing
        if (validationErrors[e.target.name]) {
            setValidationErrors(prev => ({
                ...prev,
                [e.target.name]: ''
            }))
        }
    }

    const benefits = [
        { icon: Shield, text: "Bank-level security", color: "text-green-400" },
        { icon: Zap, text: "Lightning fast insights", color: "text-yellow-400" },
        { icon: Star, text: "Smart AI categorization", color: "text-purple-400" }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
            {/* Left Side - Hero Section */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-blue-600/20" />
                <div className="relative z-10 flex flex-col justify-center px-12 text-white">
                    <div className="mb-8">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold">Flux</h1>
                        </div>
                        <h2 className="text-4xl font-bold mb-4 leading-tight">
                            Start your
                            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent"> financial journey</span>
                        </h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Join thousands of users who have transformed their spending habits with Flux
                        </p>
                    </div>

                    <div className="space-y-4">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center space-x-3 group">
                                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <benefit.icon className={`w-5 h-5 ${benefit.color}`} />
                                </div>
                                <span className="text-gray-200">{benefit.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="mt-12 grid grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">10K+</div>
                            <div className="text-sm text-gray-400">Active Users</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">₹50L+</div>
                            <div className="text-sm text-gray-400">Money Tracked</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">4.9★</div>
                            <div className="text-sm text-gray-400">User Rating</div>
                        </div>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-green-500/30 to-blue-500/30 rounded-full blur-xl animate-pulse" />
                    <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-xl animate-pulse delay-1000" />
                </div>
            </div>

            {/* Right Side - Signup Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Header */}
                    <div className="lg:hidden text-center mb-8">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold text-white">Flux</h1>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Create account</h2>
                            <p className="text-gray-300">Start tracking your expenses today</p>
                        </div>

                        {error && (
                            <Alert className="mb-6 bg-red-500/10 border-red-500/20 text-red-300">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-200 mb-2">
                                        First Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            id="firstName"
                                            name="firstName"
                                            type="text"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 transition-all duration-200 ${validationErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/20 focus:border-green-500 focus:ring-green-500/20'
                                                }`}
                                            placeholder="John"
                                        />
                                    </div>
                                    {validationErrors.firstName && (
                                        <p className="text-red-400 text-sm mt-1">{validationErrors.firstName}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-200 mb-2">
                                        Last Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <Input
                                            id="lastName"
                                            name="lastName"
                                            type="text"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 transition-all duration-200 ${validationErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/20 focus:border-green-500 focus:ring-green-500/20'
                                                }`}
                                            placeholder="Doe"
                                        />
                                    </div>
                                    {validationErrors.lastName && (
                                        <p className="text-red-400 text-sm mt-1">{validationErrors.lastName}</p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 transition-all duration-200 ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/20 focus:border-green-500 focus:ring-green-500/20'
                                            }`}
                                        placeholder="john@example.com"
                                    />
                                </div>
                                {validationErrors.email && (
                                    <p className="text-red-400 text-sm mt-1">{validationErrors.email}</p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-2">
                                    Phone Number <span className="text-gray-400">(optional)</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 transition-all duration-200 ${validationErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/20 focus:border-green-500 focus:ring-green-500/20'
                                            }`}
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                                {validationErrors.phone && (
                                    <p className="text-red-400 text-sm mt-1">{validationErrors.phone}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 transition-all duration-200 ${validationErrors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/20 focus:border-green-500 focus:ring-green-500/20'
                                            }`}
                                        placeholder="At least 6 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {validationErrors.password && (
                                    <p className="text-red-400 text-sm mt-1">{validationErrors.password}</p>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <Input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:ring-2 transition-all duration-200 ${validationErrors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-white/20 focus:border-green-500 focus:ring-green-500/20'
                                            }`}
                                        placeholder="Repeat your password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {validationErrors.confirmPassword && (
                                    <p className="text-red-400 text-sm mt-1">{validationErrors.confirmPassword}</p>
                                )}
                            </div>

                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={loading || isLoading}
                                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading || isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                            <span>Creating account...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            <span>Create Account</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-gray-300">
                                Already have an account?{' '}
                                <Link
                                    href="/login"
                                    className="text-green-400 hover:text-green-300 font-semibold transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        {/* Terms */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-400">
                                By creating an account, you agree to our{' '}
                                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Terms of Service</a>
                                {' '}and{' '}
                                <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</a>
                            </p>
                        </div>

                        {/* Security Features */}
                        <div className="mt-6 pt-6 border-t border-white/10">
                            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span>256-bit SSL</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                    <span>GDPR Compliant</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                                    <span>Zero Knowledge</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}