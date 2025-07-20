'use client'
import Link from 'next/link'
import { Home, SearchX, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center text-white overflow-hidden">
            <div className="relative z-10 text-center p-8">
                {/* Background decorative elements */}
                <div className="absolute -top-20 -left-20 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 sm:p-12 shadow-2xl border border-white/20">
                    <div className="mb-8">
                        <SearchX className="w-24 h-24 text-purple-400 mx-auto" strokeWidth={1} />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                        404
                    </h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Page Not Found
                    </h2>
                    <p className="text-lg text-gray-300 mb-10 max-w-md mx-auto">
                        Oops! The page you are looking for does not exist. It might have been moved or deleted.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                        <Link
                            href="/"
                            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 border border-white/20"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Go Back</span>
                        </Link>
                        <Link
                            href="/dashboard"
                            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                        >
                            <Home className="w-5 h-5" />
                            <span>Go to Dashboard</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
