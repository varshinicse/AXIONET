import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from '../../../services/axios';
import '../Signin/style_login.css';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Get email from location state (passed from ForgotPassword)
    const email = location.state?.email || '';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!email) {
            setError('Missing email information. Please go back to the forgot password page.');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post('/reset-password', {
                email,
                password
            });
            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/signin');
            }, 3000);
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
                            <h2 className="text-center">Reset Password</h2>
                            <p className="text-center" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                Setting new password for: <strong>{email}</strong>
                            </p>

                            {message && <div className="alert alert-success">{message} Redirecting to login...</div>}
                            {error && <div className="alert alert-danger">{error}</div>}

                            {!message && (
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group mb-3">
                                        <label htmlFor="password">New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="password"
                                            placeholder="Enter new password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-3">
                                        <label htmlFor="confirmPassword">Confirm New Password</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            id="confirmPassword"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 mt-4"
                                        disabled={loading}
                                    >
                                        {loading ? 'Updating...' : 'Reset Password'}
                                    </button>
                                </form>
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

export default ResetPassword;
