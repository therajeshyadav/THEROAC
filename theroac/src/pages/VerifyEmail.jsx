import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/api';
import './Auth.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const hasVerified = useRef(false);
    const token = searchParams.get('token');

    const verifyEmail = async () => {
        // Prevent duplicate calls
        if (hasVerified.current) return;
        hasVerified.current = true;
        try {
            const response = await apiService.verifyEmail(token);
            
            // Show success toast
            toast.success(
                'Email verified successfully! You can now login to your account.',
                {
                    position: "top-center",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                }
            );
            
            // Redirect to login page after successful verification
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            // Show error toast only if we haven't already shown success
            toast.error(
                err.message || 'Email verification failed. Please request a new verification link.',
                {
                    position: "top-center",
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                }
            );
            
            // Redirect to resend verification page after error
            setTimeout(() => {
                navigate('/resend-verification');
            }, 2000);
        }
    };

    useEffect(() => {
        if (!token) {
            toast.error('Invalid verification link. Please request a new one.');
            setTimeout(() => {
                navigate('/resend-verification');
            }, 2000);
            return;
        }

        verifyEmail();
    }, []); // Empty dependency array to run only once

    // Don't render anything, just show toast and redirect
    return null;
};

export default VerifyEmail;