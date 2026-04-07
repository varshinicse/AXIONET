// src/services/api/jobs.js (CORRECTED URL Template Strings)
import axios from '../axios';

const BASE_URL = '/jobs';

export const jobService = {
    getAllJobs: async (page = 1, limit = 10) => {
        try {
            const response = await axios.get(BASE_URL, {
                params: { page, limit }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    searchJobs: async (query = '', location = '', role = '') => {
        try {
            const params = { q: query, location };
            if (role) params.role = role;
            const response = await axios.get(`${BASE_URL}/search`, { params });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getJobById: async (id) => {
        try {
            const response = await axios.get(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createJob: async (jobData) => {
        try {
            const config = (jobData instanceof FormData) ?
                { headers: { 'Content-Type': 'multipart/form-data' } } : {};
            const response = await axios.post(`${BASE_URL}/create-job`, jobData, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    applyForJob: async (jobId) => {
        try {
            const response = await axios.post(`${BASE_URL}/apply`, { job_id: jobId });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateJob: async (id, jobData) => {
        try {
            const response = await axios.put(`${BASE_URL}/${id}`, jobData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteJob: async (id) => {
        try {
            const response = await axios.delete(`${BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};