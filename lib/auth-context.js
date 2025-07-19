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

            // Handle various response structures
            const userData = response.data?.data?.user ||
                response.data?.user ||
                response.data?.data ||
                response.data

            if (userData && (userData.id || userData._id || userData.email)) {
                setUser(userData)
            } else {
                console.warn('Invalid user data structure:', response.data)
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

            // Handle multiple possible response structures
            let token, user

            // Try different response structures
            if (response.data?.data) {
                // Structure: { data: { token, user } }
                token = response.data.data.token
                user = response.data.data.user
            } else if (response.data?.token) {
                // Structure: { token, user }
                token = response.data.token
                user = response.data.user
            } else if (response.data?.access_token) {
                // Structure: { access_token, user }
                token = response.data.access_token
                user = response.data.user
            } else if (response.data?.accessToken) {
                // Structure: { accessToken, user }
                token = response.data.accessToken
                user = response.data.user
            } else {
                // Log the response structure to help debug
                console.error('❌ Unexpected response structure:', response.data)
                throw new Error(`Unexpected response structure. Expected token but got: ${JSON.stringify(Object.keys(response.data))}`)
            }

            if (!token) {
                console.error('❌ No token found in response:', response.data)
                throw new Error('No authentication token received from server')
            }

            localStorage.setItem('token', token)
            setUser(user || { email }) // Fallback user object

            // Use setTimeout to ensure state updates before navigation
            setTimeout(() => {
                router.push('/dashboard')
            }, 100)

            return { success: true }
        } catch (error) {
            console.error('❌ Login error:', error)
            const message = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Login failed'
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

            // Handle multiple possible response structures
            let token, user

            // Try different response structures
            if (response.data?.data) {
                // Structure: { data: { token, user } }
                token = response.data.data.token
                user = response.data.data.user
            } else if (response.data?.token) {
                // Structure: { token, user }
                token = response.data.token
                user = response.data.user
            } else if (response.data?.access_token) {
                // Structure: { access_token, user }
                token = response.data.access_token
                user = response.data.user
            } else if (response.data?.accessToken) {
                // Structure: { accessToken, user }
                token = response.data.accessToken
                user = response.data.user
            } else {
                // Log the response structure to help debug
                console.error('❌ Unexpected response structure:', response.data)
                throw new Error(`Unexpected response structure. Expected token but got: ${JSON.stringify(Object.keys(response.data))}`)
            }

            if (!token) {
                console.error('❌ No token found in response:', response.data)
                throw new Error('No authentication token received from server')
            }

            localStorage.setItem('token', token)
            setUser(user || userData) // Fallback to submitted user data

            // Use setTimeout to ensure state updates before navigation
            setTimeout(() => {
                router.push('/dashboard')
            }, 100)

            return { success: true }
        } catch (error) {
            console.error('❌ Signup error:', error)
            const message = error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Signup failed'
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