// components/jobs/JobList.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Spinner, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { jobService } from '../../services/api/jobs';
import JobCard from './JobCard';
import './joblist.css';
import Footer from '../layout/Footer/Footer';

const JobList = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('developer');
    const [locationFilter, setLocationFilter] = useState('india');

    // Fetch jobs from Flask backend
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            // API: /jobs/search?q=<keyword>&location=<location>
            const data = await jobService.searchJobs(searchTerm, locationFilter);
            setJobs(data || []);
            setLoading(false);
        } catch (err) {
            console.error('Error searching jobs:', err);
            setLoading(false);
        }
    };

    // On page load, fetch default jobs
    useEffect(() => {
        handleSearch();
    }, []);

    return (
        <>
            <Container className="job-list-container py-5">
                <Row className="mb-4">
                    <Col>
                        <h1 className="job-list-title text-center">Find Your Next Tech Opportunity</h1>
                    </Col>
                </Row>

                {/* Search Bar Section */}
                <Card className="search-card mb-5 shadow-sm border-0 bg-light">
                    <Card.Body className="p-4">
                        <Form onSubmit={handleSearch}>
                            <Row className="g-3">
                                <Col md={5}>
                                    <InputGroup size="lg">
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FontAwesomeIcon icon={faSearch} className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            className="border-start-0"
                                            placeholder="Job title or skills..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={5}>
                                    <InputGroup size="lg">
                                        <InputGroup.Text className="bg-white border-end-0">
                                            <FontAwesomeIcon icon={faLocationDot} className="text-primary" />
                                        </InputGroup.Text>
                                        <Form.Control
                                            className="border-start-0"
                                            placeholder="Location (e.g. India, Remote)..."
                                            value={locationFilter}
                                            onChange={(e) => setLocationFilter(e.target.value)}
                                        />
                                    </InputGroup>
                                </Col>
                                <Col md={2}>
                                    <Button variant="primary" size="lg" type="submit" className="w-100">
                                        Search
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </Card.Body>
                </Card>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="grow" variant="primary" className="me-2" />
                        <span className="h4 text-muted">Loading best matches...</span>
                    </div>
                ) : (
                    <Row>
                        {jobs.length > 0 ? (
                            jobs.map((job) => (
                                <Col md={12} key={job._id || job.id || Math.random()}>
                                    <JobCard job={job} />
                                </Col>
                            ))
                        ) : (
                            <Col className="text-center py-5">
                                <Alert variant="warning" className="p-5 border-0 shadow-sm">
                                    <h3 className="mb-3">No jobs found matching your criteria.</h3>
                                    <Button variant="outline-primary" onClick={() => { setSearchTerm('developer'); setLocationFilter('india'); handleSearch(); }}>
                                        Try default search
                                    </Button>
                                </Alert>
                            </Col>
                        )}
                    </Row>
                )}
            </Container>
            <Footer />
        </>
    );
};

export default JobList;