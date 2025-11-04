import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import './Auth.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Invalid verification link.');
            setLoading(false);
            return;
        }

        verifyEmail();
    }, [token]);

    const verifyEmail = async () => {
        try {
            const response = await apiService.verifyEmail(token);
            setMessage(response.message || 'Email verified successfully!');
            setIsSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login?verified=success');
            }, 3000);
        } catch (err) {
            setError(err.message || 'Email verification failed.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="auth-container">
                <div className="container row justify-content-between auth-card">
                    <div className="col-5 align-content-center">
                        <img src="assets/img/login/Login-pana.svg" alt="Email Verification" />
                    </div>
                    <div className="col-6">
                        <div className="auth-header">
                            <h2>Verifying Email...</h2>
                        </div>
                        <div className="preloader">
                            <div className="loading-container">
                                <div className="loading"></div>
                                <div id="loading-icon">
                                    <img src="assets/img/logo/preloader.png" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="auth-container">
                <div className="container row justify-content-between auth-card">
                    <div className="col-5 align-content-center">
                        <img src="assets/img/login/Login-pana.svg" alt="Email Verified" />
                    </div>
                    <div className="col-6">
                        <div className="auth-header">
                            <h2>Email Verified!</h2>
                        </div>

                        <div className="success-message">
                            <i className="fas fa-check-circle"></i>
                            <p>{message}</p>
                            <p className="text-muted">
                                You will be redirected to the login page in a few seconds...
                            </p>
                        </div>

                        <div className="auth-footer">
                            <p>
                                <Link to="/login">Continue to Login</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="container row justify-content-between auth-card">
                <div className="col-5 align-content-center">
                    <img src="assets/img/login/Login-pana.svg" alt="Verification Failed" />
                </div>
                <div className="col-6">
                    <div className="auth-header">
                        <h2>Verification Failed</h2>
                    </div>

                    <div className="error-message">
                        <i className="fas fa-exclamation-circle"></i>
                        <p>{error}</p>
                    </div>

                    <div className="auth-footer">
                        <p>
                            <Link to="/resend-verification">Request new verification email</Link> or{' '}
                            <Link to="/login">Back to Login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;