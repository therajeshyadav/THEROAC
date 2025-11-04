import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardHeader.css';

const DashboardHeader = ({ user, activeTab, setActiveTab, isAdmin = false, onTabChange }) => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const tabs = isAdmin ? [
        { id: 'overview', label: 'Overview', icon: 'fas fa-tachometer-alt' },
        { id: 'users', label: 'Users', icon: 'fas fa-users' },
        { id: 'jobs', label: 'Jobs', icon: 'fas fa-briefcase' },
        { id: 'events', label: 'Events', icon: 'fas fa-calendar' },
        { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-line' }
    ] : [
        { id: 'overview', label: 'Overview', icon: 'fas fa-tachometer-alt' },
        { id: 'jobs', label: 'My Jobs', icon: 'fas fa-briefcase' },
        { id: 'candidates', label: 'Candidates', icon: 'fas fa-users' },
        { id: 'events', label: 'Events', icon: 'fas fa-calendar' },
        { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-line' }
    ];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (onTabChange) {
            onTabChange(tabId);
        }
    };

    return (
        <>
            {/* Top Header */}
            <div className="dashboard-header">
                <div className="header-left">
                    <div className="logo-section">
                        <img src="/logo.png" alt="TheROAC" />
                    </div>
                    <h1 className="panel-title">
                        {isAdmin ? 'Admin Dashboard' : 'Recruiter Dashboard'}
                    </h1>
                </div>

                <div className="header-right">
                    <div className="header-actions">
                        <button className="notification-btn">
                            <i className="fas fa-bell"></i>
                            <span className="notification-badge">3</span>
                        </button>

                        <div className="user-info">
                            <div className="user-avatar">
                                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <span className="user-name">{user?.fullName}</span>
                        </div>

                        <button className="logout-btn" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="dashboard-nav">
                <div className="nav-tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => handleTabChange(tab.id)}
                        >
                            <i className={tab.icon}></i>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};

export default DashboardHeader;