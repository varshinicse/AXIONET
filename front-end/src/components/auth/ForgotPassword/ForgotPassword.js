import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../services/axios';
import '../Signin/style_login.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const response = await axios.post('/forgot-password', { email });
            setMessage(response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-background">
            <div className="container">
                <div className="row min-vh-100 align-items-center justify-content-center">
                    <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                        <div className="login-container">
                            <h2 className="text-center">Forgot Password</h2>
                            {message && <div className="alert alert-success">{message}</div>}
                            {error && <div className="alert alert-danger">{error}</div>}

                            {!message ? (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="email">Email address</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            id="email"
                                            placeholder="Enter your registered email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 mt-4"
                                        disabled={loading}
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Link'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center mt-4">
                                    <p style={{ color: 'rgba(255,255,255,0.8)' }}>
                                        For this demonstration, you can now proceed to reset your password.
                                    </p>
                                    <Link to="/reset-password" state={{ email }} className="btn btn-primary mt-2">
                                        Go to Reset Page
                                    </Link>
                                </div>
                            )}

                            <div className="text-center mt-4">
                                <Link to="/signin" style={{ color: 'rgba(255,255,255,0.7)' }}>Back to Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
