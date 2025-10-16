import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
    const [searchParams] = useSearchParams();
    const userType = searchParams.get('type') || 'candidate';

    const [formData, setFormData] = useState({
        // Common fields
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',

        // Candidate specific
        university: '',
        course: '',
        graduationYear: '',
        skills: '',

        // Recruiter specific
        companyName: '',
        designation: '',
        companySize: '',
        industry: '',
        website: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        console.log('Signup data:', { ...formData, userType });
        // Add signup logic here
    };

    return (
        <div className="auth-container">
            <div className="auth-background"></div>

            <div className="auth-content">
                <div className="auth-card signup-card">
                    <div className="auth-header">
                        <h2>
                            {userType === 'recruiter' ? 'Join as Recruiter' : 'Register as Candidate'}
                        </h2>
                        <Link to="/" className="close-btn">×</Link>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form signup-form">
                        {/* Common Fields */}
                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="First Name"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Last Name"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            <i className="fa-solid fa-envelope input-icon"></i>
                        </div>

                        <div className="form-group">
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                            <i className="fa-solid fa-phone input-icon"></i>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                                <i className="fa-solid fa-lock input-icon"></i>
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                                <i className="fa-solid fa-lock input-icon"></i>
                            </div>
                        </div>

                        {/* Candidate Specific Fields */}
                        {userType === 'candidate' && (
                            <>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="university"
                                        placeholder="University/College"
                                        value={formData.university}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="course"
                                            placeholder="Course/Degree"
                                            value={formData.course}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <select
                                            name="graduationYear"
                                            value={formData.graduationYear}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Graduation Year</option>
                                            {Array.from({ length: 10 }, (_, i) => {
                                                const year = new Date().getFullYear() + i - 5;
                                                return <option key={year} value={year}>{year}</option>;
                                            })}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <textarea
                                        name="skills"
                                        placeholder="Skills (comma separated)"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        rows="3"
                                    />
                                </div>
                            </>
                        )}

                        {/* Recruiter Specific Fields */}
                        {userType === 'recruiter' && (
                            <>
                                <div className="form-group">
                                    <input
                                        type="text"
                                        name="companyName"
                                        placeholder="Company Name"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="designation"
                                            placeholder="Your Designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <select
                                            name="companySize"
                                            value={formData.companySize}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Company Size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201-500">201-500 employees</option>
                                            <option value="500+">500+ employees</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <input
                                            type="text"
                                            name="industry"
                                            placeholder="Industry"
                                            value={formData.industry}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <input
                                            type="url"
                                            name="website"
                                            placeholder="Company Website"
                                            value={formData.website}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button type="submit" className="auth-btn">
                            {userType === 'recruiter' ? 'Join as Recruiter' : 'Create Account'}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>Already have an account? <Link to="/login">Login</Link></p>
                        <p>
                            Want to register as {userType === 'candidate' ? 'recruiter' : 'candidate'}?
                            <Link to="/register"> Choose different option</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;