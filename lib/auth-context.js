'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from './api'

const AuthContext = createContext({})

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const router = useRouter()

    // Check if user is authenticated on app load
    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token || token === 'null' || token === 'undefined') {
                setLoading(false)
                return
            }

            const response = await api.get('/auth/me')

            // Handle nested response structure
            const userData = response.data?.data?.user || response.data?.user
            if (userData) {
                setUser(userData)
            } else {
                throw new Error('Invalid user data structure')
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            localStorage.removeItem('token')
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            setError(null)
            setLoading(true)

            const response = await api.post('/auth/login', {
                email,
                password
            })

            // Handle nested response structure
            const responseData = response.data?.data || response.data
            const { token, user } = responseData

            if (!token) {
                throw new Error('No token received from server')
            }

            localStorage.setItem('token', token)
            setUser(user)

            // Use setTimeout to ensure state updates before navigation
            setTimeout(() => {
                router.push('/dashboard')
            }, 100)

            return { success: true }
        } catch (error) {
            console.error('Login error:', error)
            const message = error.response?.data?.message || error.message || 'Login failed'
            setError(message)
            return { success: false, error: message }
        } finally {
            setLoading(false)
        }
    }

    const signup = async (userData) => {
        try {
            setError(null)
            setLoading(true)

            const response = await api.post('/auth/signup', userData)

            // Handle nested response structure
            const responseData = response.data?.data || response.data
            const { token, user } = responseData

            if (!token) {
                throw new Error('No token received from server')
            }

            localStorage.setItem('token', token)
            setUser(user)

            // Use setTimeout to ensure state updates before navigation
            setTimeout(() => {
                router.push('/dashboard')
            }, 100)

            return { success: true }
        } catch (error) {
            console.error('Signup error:', error)
            const message = error.response?.data?.message || error.message || 'Signup failed'
            setError(message)
            return { success: false, error: message }
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        try {
            localStorage.removeItem('token')
            setUser(null)
            setError(null)
            router.push('/login')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        checkAuth
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}