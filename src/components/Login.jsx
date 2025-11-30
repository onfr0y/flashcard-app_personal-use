import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { User, Lock, ArrowRight, UserPlus } from 'lucide-react';

import { useToast } from '../context/ToastContext';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login, signup } = useStore();
    const { addToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                await login(username, password);
                addToast('Welcome back!', 'success');
            } else {
                await signup(username, password);
                addToast('Account created successfully!', 'success');
            }
        } catch (err) {
            setError(err.message);
            addToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md">
            <div className="glass-panel p-8 w-full max-w-md relative overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-white/60 text-sm">
                        {isLogin ? 'Enter your credentials to access your decks' : 'Start your learning journey today'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white/80 transition-colors" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-black/30 transition-all"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40 group-focus-within:text-white/80 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-black/30 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                            setUsername('');
                            setPassword('');
                        }}
                        className="text-sm text-white/50 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                    >
                        {isLogin ? (
                            <>Don't have an account? <span className="text-white font-medium">Sign up</span></>
                        ) : (
                            <>Already have an account? <span className="text-white font-medium">Sign in</span></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
