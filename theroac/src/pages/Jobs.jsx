import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    jobType: '',
    experienceLevel: '',
    locationType: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getJobs(filters);
      setJobs(response.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = () => {
    fetchJobs();
  };

  const handleApply = async (jobId) => {
    try {
      // Check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to apply for jobs');
        return;
      }
      
      // For now, just show alert. You can implement proper application flow
      alert('Application feature will be implemented soon!');
    } catch (error) {
      console.error('Error applying to job:', error);
    }
  };

  return (
    <>
    <div className="preloader">
      <div className="loading-container">
        <div className="loading"></div>
        <div id="loading-icon">
          <img src="assets/img/logo/preloader.png" alt="" />
        </div>
      </div>
    </div>
    <div className="paginacontainer">
      <div className="progress-wrap warp2">
        <svg className="progress-circle svg-content" width="100%" height="100%" viewBox="-1 -1 102 102">
          <path d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98" />
        </svg>
      </div>
    </div> 
    <div className="jobs-page">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="page-header text-center py-5">
              <h1>Job Opportunities</h1>
              <p>Find your dream career with top companies</p>
            </div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-12">
            <div className="jobs-content">
              <div className="job-filters mb-4">
                <h3>Filter Jobs</h3>
                <div className="row">
                  <div className="col-md-3">
                    <select className="form-control">
                      <option>All Categories</option>
                      <option>Software Development</option>
                      <option>Data Science</option>
                      <option>Design</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select className="form-control">
                      <option>All Locations</option>
                      <option>Remote</option>
                      <option>Delhi</option>
                      <option>Mumbai</option>
                      <option>Bangalore</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <select className="form-control">
                      <option>Experience Level</option>
                      <option>Entry Level</option>
                      <option>Mid Level</option>
                      <option>Senior Level</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-primary w-100">Search Jobs</button>
                  </div>
                </div>
              </div>
              
              <div className="jobs-list">
                <div className="job-card mb-3 p-4 border rounded">
                  <h4>Frontend Developer</h4>
                  <p><strong>Company:</strong> Tech Solutions Inc.</p>
                  <p><strong>Location:</strong> Remote</p>
                  <p><strong>Experience:</strong> 2-4 years</p>
                  <p>We are looking for a skilled Frontend Developer to join our team...</p>
                  <button className="btn btn-primary">Apply Now</button>
                </div>
                
                <div className="job-card mb-3 p-4 border rounded">
                  <h4>Data Scientist</h4>
                  <p><strong>Company:</strong> Analytics Pro</p>
                  <p><strong>Location:</strong> Bangalore</p>
                  <p><strong>Experience:</strong> 3-5 years</p>
                  <p>Join our data science team to work on cutting-edge ML projects...</p>
                  <button className="btn btn-primary">Apply Now</button>
                </div>
                
                <div className="job-card mb-3 p-4 border rounded">
                  <h4>UI/UX Designer</h4>
                  <p><strong>Company:</strong> Creative Studios</p>
                  <p><strong>Location:</strong> Mumbai</p>
                  <p><strong>Experience:</strong> 1-3 years</p>
                  <p>Design beautiful and intuitive user experiences for our products...</p>
                  <button className="btn btn-primary">Apply Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Jobs;