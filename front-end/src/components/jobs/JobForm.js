// components/jobs/JobForm.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, Alert } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { jobService } from '../../services/api/jobs';
import { useAuth } from '../../contexts/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './JobForm.css';

const JobForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditMode = !!id;

    // Initial form state
    const initialFormState = {
        title: '',
        company: '',
        location: '',
        description: '',
        skills: '',       // Comma separated string for input
        salary: '',       // String field as per new schema
        experience: '',   // String field as per new schema
        requirements: '',
        how_to_apply: '',
        apply_link: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [validated, setValidated] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loadingJob, setLoadingJob] = useState(isEditMode);

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("Image size should be less than 5MB");
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle text input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle rich text editor changes
    const handleEditorChange = (value, field) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (!form.checkValidity()) {
            e.stopPropagation();
            setValidated(true);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Prepare data using FormData for file upload
            const data = new FormData();

            // Add basic fields
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });

            // Add image if selected
            if (image) {
                data.append('image', image);
            }

            if (isEditMode) {
                await jobService.updateJob(id, data);
                setSuccess('Job updated successfully');
            } else {
                await jobService.createJob(data);
                setSuccess('Job created successfully');
            }

            setTimeout(() => {
                navigate('/jobs');
            }, 1500);
        } catch (err) {
            console.error('Error saving job:', err);
            setError(err.response?.data?.message || 'Failed to save job.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch job data for editing
    useEffect(() => {
        if (isEditMode) {
            const fetchJobData = async () => {
                try {
                    const data = await jobService.getJobById(id);
                    setFormData({
                        title: data.title || '',
                        company: data.company || '',
                        location: data.location || '',
                        description: data.description || '',
                        skills: data.skills ? data.skills.join(', ') : '',
                        salary: data.salary || '',
                        experience: data.experience || '',
                        requirements: data.requirements || '',
                        how_to_apply: data.how_to_apply || '',
                        apply_link: data.apply_link || ''
                    });
                    setLoadingJob(false);
                } catch (err) {
                    setError('Failed to load job details.');
                    setLoadingJob(false);
                }
            };
            fetchJobData();
        }
    }, [id, isEditMode]);

    // Role check
    useEffect(() => {
        if (user && user.role !== 'alumni') {
            navigate('/jobs');
        }
    }, [user, navigate]);

    const editorModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    if (loadingJob) return <div className="text-center py-5"><Spinner animation="border" /></div>;

    return (
        <Container className="py-5">
            <Card className="shadow-sm border-0">
                <Card.Body className="p-4">
                    <h2 className="mb-4">{isEditMode ? 'Edit Job' : 'Post a New Job'}</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form noValidate validated={validated} onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Job Title *</Form.Label>
                                    <Form.Control
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Full Stack Developer"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Company *</Form.Label>
                                    <Form.Control
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Google"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Location *</Form.Label>
                                    <Form.Control
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="e.g. Bangalore, Remote"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Salary</Form.Label>
                                    <Form.Control
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 15-20 LPA"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Experience</Form.Label>
                                    <Form.Control
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 2+ years"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Skills (comma separated)</Form.Label>
                            <Form.Control
                                name="skills"
                                value={formData.skills}
                                onChange={handleInputChange}
                                placeholder="e.g. React, Node.js, MongoDB"
                            />
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Job Banner / Photo (Optional)</Form.Label>
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                            />
                            <Form.Text className="text-muted">
                                Upload a photo or company banner (max 5MB).
                            </Form.Text>
                        </Form.Group>

                        {imagePreview && (
                            <div className="mb-4 border rounded p-2 text-center bg-light">
                                <p className="small text-muted mb-2">Image Preview</p>
                                <img
                                    src={imagePreview}
                                    alt="Job Preview"
                                    style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'contain' }}
                                />
                                <div className="mt-2 text-center">
                                    <Button variant="outline-danger" size="sm" onClick={() => { setImage(null); setImagePreview(null); }}>
                                        Remove Photo
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Form.Group className="mb-3">
                            <Form.Label>Description *</Form.Label>
                            <ReactQuill
                                theme="snow"
                                value={formData.description}
                                onChange={(val) => handleEditorChange(val, 'description')}
                                modules={editorModules}
                                className="bg-white"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Requirements</Form.Label>
                            <ReactQuill
                                theme="snow"
                                value={formData.requirements}
                                onChange={(val) => handleEditorChange(val, 'requirements')}
                                modules={editorModules}
                                className="bg-white"
                            />
                        </Form.Group>

                        <div className="d-flex gap-2 mt-4">
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? 'Saving...' : (isEditMode ? 'Update Job' : 'Post Job')}
                            </Button>
                            <Link to="/jobs" className="btn btn-outline-secondary">Cancel</Link>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default JobForm;