// src/components/jobs/JobCard.js
import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faMoneyBillWave, faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import './JobCard.css';

const JobCard = ({ job }) => {
    // Adzuna jobs use redirect_url and salary_min/max
    const applyUrl = job.redirect_url || job.apply_link;

    return (
        <Card className="job-card shadow-sm border-0 mb-4">
            <Card.Body>
                <div className="mb-3">
                    <h3 className="job-title text-primary mb-1">{job.title}</h3>
                    <h5 className="company-name text-muted">{job.company}</h5>
                </div>

                <div className="job-meta d-flex flex-wrap gap-3 mb-3 text-secondary">
                    <span><FontAwesomeIcon icon={faLocationDot} className="me-1" /> {job.location}</span>
                    {(job.salary || job.salary_min) && (
                        <span>
                            <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" />
                            {job.salary || `₹${job.salary_min.toLocaleString()}${job.salary_max ? ' - ₹' + job.salary_max.toLocaleString() : ''}`}
                        </span>
                    )}
                </div>

                <Card.Text className="job-description">
                    {job.description?.length > 200 ? job.description.substring(0, 200) + '...' : job.description}
                </Card.Text>

                <div className="mt-4">
                    {applyUrl ? (
                        <Button
                            href={applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-apply-green px-5 py-2 shadow-sm"
                        >
                            Apply Now <FontAwesomeIcon icon={faExternalLinkAlt} className="ms-2" />
                        </Button>
                    ) : (
                        <Button variant="outline-secondary" className="px-4 py-2 disabled">
                            No Apply Link
                        </Button>
                    )}
                </div>
            </Card.Body>
        </Card>
    );
};

export default JobCard;