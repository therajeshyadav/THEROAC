import React from 'react';
import { Link } from 'react-router-dom';
import { createDetailsURL } from '../utils/urlUtils';

const JobCard = ({ job }) => {
    const company = job.company || job.companyName || 'Company';
    const detailsURL = createDetailsURL('jobs', job.title, company, job.id);

    return (
        <div className="job-card mb-3 p-4 border rounded">
            <h4>{job.title}</h4>
            <p><strong>Company:</strong> {company}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Experience:</strong> {job.experience}</p>
            <p>{job.description}</p>
            <Link to={detailsURL} className="btn btn-primary">
                View Details
            </Link>
        </div>
    );
};

export default JobCard;