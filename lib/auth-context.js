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
            if (!token) {
                setLoading(false)
                return
            }

            const response = await api.get('/auth/me')
            setUser(response.data.user)
        } catch (error) {
            console.error('Auth check failed:', error)
            localStorage.removeItem('token')
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

            const { token, user } = response.data

            localStorage.setItem('token', token)
            setUser(user)
            router.push('/dashboard')

            return { success: true }
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed'
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
            const { token, user } = response.data

            localStorage.setItem('token', token)
            setUser(user)
            router.push('/dashboard')

            return { success: true }
        } catch (error) {
            const message = error.response?.data?.message || 'Signup failed'
            setError(message)
            return { success: false, error: message }
        } finally {
            setLoading(false)
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
        router.push('/login')
    }

    const value = {
        user,
        loading,
        error,
        login,
        signup,
        logout,
        isAuthenticated: !!user
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}