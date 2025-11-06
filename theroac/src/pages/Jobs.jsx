import React from 'react';
import JobCard from '../components/JobCard';

const Jobs = () => {
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
                {/* Example jobs data - replace with actual API data */}
                <JobCard job={{
                  id: 1,
                  title: "Frontend Developer",
                  company: "Tech Solutions Inc.",
                  location: "Remote",
                  experience: "2-4 years",
                  description: "We are looking for a skilled Frontend Developer to join our team..."
                }} />
                
                <JobCard job={{
                  id: 2,
                  title: "Data Scientist",
                  company: "Analytics Pro",
                  location: "Bangalore",
                  experience: "3-5 years",
                  description: "Join our data science team to work on cutting-edge ML projects..."
                }} />
                
                <JobCard job={{
                  id: 3,
                  title: "UI/UX Designer",
                  company: "Creative Studios",
                  location: "Mumbai",
                  experience: "1-3 years",
                  description: "Design beautiful and intuitive user experiences for our products..."
                }} />
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