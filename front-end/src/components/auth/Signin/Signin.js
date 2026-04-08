import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./style_login.css";
import { useAuth } from '../../../contexts/AuthContext';

const Signin = () => {
    const [email, setEmail] = useState('varshini@gmail.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const success = await login({
                email: email,
                password: password
            });

            if (success) {
                navigate('/');
            } else {
                setError('Login failed. Please check your credentials.');
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.message === 'Network Error') {
                setError('Unable to connect to server. Please try again.');
            } else if (error.response) {
                if (error.response.status === 404) {
                    setError('User does not exist. Please sign up.');
                } else if (error.response.status === 401) {
                    setError('Invalid credentials. Please try again.');
                } else {
                    setError(error.response.data?.message || 'Login failed. Please try again.');
                }
            } else {
                setError('Login failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Auto-login with default credentials on mount
    useEffect(() => {
        const hasAttemptedAutoLogin = sessionStorage.getItem('autoLoginAttempted');
        if (email === 'varshini@gmail.com' && password === 'password123' && !hasAttemptedAutoLogin) {
            sessionStorage.setItem('autoLoginAttempted', 'true');
            handleSubmit();
        }
    }, [email, password]);

    const handleQuickLogin = (quickEmail, quickPassword) => {
        setEmail(quickEmail);
        setPassword(quickPassword);
        // The useEffect will trigger handleSubmit due to state changes
    };

    return (
        <div className="login-background">
            <div className="floating-elements"></div>
            <div className="container">
                <div className="row min-vh-100 align-items-center justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                        <div className="login-container">
                            <h2 className="text-center">Login</h2>
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        placeholder="Enter Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100 mt-4"
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                            <div className="quick-login mt-4 pt-3 border-top border-secondary">
                                <p className="text-center mb-2" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>One-click Login:</p>
                                <div className="d-flex flex-wrap gap-2 justify-content-center">
                                    <button
                                        type="button"
                                        className="btn btn-outline-info btn-sm px-3"
                                        onClick={() => handleQuickLogin('varshini@gmail.com', 'password123')}
                                        disabled={loading}
                                    >
                                        Student
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-success btn-sm px-3"
                                        onClick={() => handleQuickLogin('vandhana@gmail.com', 'password123')}
                                        disabled={loading}
                                    >
                                        Alumni
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-warning btn-sm px-3"
                                        onClick={() => handleQuickLogin('staff@example.com', 'password123')}
                                        disabled={loading}
                                    >
                                        Staff
                                    </button>
                                </div>
                            </div>

                            <div className="text-center mt-3 d-flex justify-content-between align-items-center">
                                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Forgot Password?</Link>
                                <div>
                                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)' }}>Don't have an account? </span>
                                    <Link to="/signup" style={{ fontSize: '0.85rem' }}>Sign up</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signin;
