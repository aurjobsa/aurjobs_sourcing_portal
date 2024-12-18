// Import dependencies
const express = require('express');
const bodyParser = require('body-parser');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config(); // Load environment variables from .env file

// Initialize the app
const app = express();
const port = 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Routes

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Sourcing10.html'));
});

// Candidate registration page route
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'Candidate_Registration.html'));
});

// Candidate search page route
app.get('/search', (req, res) => {
    res.sendFile(path.join(__dirname, 'Candidate_Search_Portal.html'));
});

// Candidate registration API (using Supabase)
app.post('/api/candidates/register', async (req, res) => {
    const {
        name, email, phone, location, experience,
        candidate_current_role, current_industry, annual_salary,
        preferred_work_mode, availability, education_level, candidate_image, candidate_resume
    } = req.body;

    try {
        const { data, error } = await supabase
            .from('candidates')
            .insert([{
                name,
                email,
                phone,
                location,
                experience,
                candidate_current_role,
                current_industry,
                annual_salary,
                preferred_work_mode,
                availability,
                education_level,
                candidate_image,
                candidate_resume,
            }])
            .select('id')
            .single();
        
            console.log(data);

        if (error) {
            throw error;
        }
        console.log('Candidate registered Successfully');
        res.status(200).json({ message: 'Candidate registered successfully', candidateId: data.id });
        
    } catch (err) {
        console.log(err);
        console.error(err);
        res.status(500).json({ message: 'Error registering candidate' });
    }
});


// Candidate search API (using Supabase)
app.post('/api/candidates/search', async (req, res) => {
    const { experience, education_level, location, current_role, industry, skills, language, certification, annual_salary, preferred_work_mode, availability } = req.body;

    try {
        let query = supabase.from('candidates').select('*');
        //     candidate_skills (skill),
        //     candidate_languages (language, proficiency),
        //     candidate_certifications (certification)
        // `)
        // .leftJoin('candidate_skills', 'candidate_skills.candidate_id', 'candidates.id')
        // .leftJoin('candidate_languages', 'candidate_languages.candidate_id', 'candidates.id')
        // .leftJoin('candidate_certifications', 'candidate_certifications.candidate_id', 'candidates.id');

        // Add filters if provided
        if (experience) {
            query = query.eq('experience', experience);
        }
        if (education_level) {
            query = query.eq('education_level', education_level);
        }
        if (location) {
            query = query.eq('location', location);
        }
        if (current_role) {
            query = query.eq('current_role', current_role);
        }
        if (industry) {
            query = query.eq('current_industry', industry);
        }
        if (annual_salary) {
            query = query.gte('annual_salary', annual_salary);
        }
        if (preferred_work_mode) {
            query = query.eq('preferred_work_mode', preferred_work_mode);
        }
        if (availability) {
            query = query.eq('availability', availability);
        }

        // Filter by skills (multiple skills in array)
        if (skills && skills.length > 0) {
            skills.forEach(skill => {
                query = query.or(`candidate_skills.skill.ilike.%${skill}%`); // Partial match for skills
            });
        }

        // Filter by languages (multiple languages in array)
        if (language && language.length > 0) {
            language.forEach(language => {
                query = query.or(`candidate_languages.language.ilike.%${language}%`); // Partial match for languages
            });
        }

        // Filter by certifications (multiple certifications in array)
        if (certification && certification.length > 0) {
            certification.forEach(certification => {
                query = query.or(`candidate_certifications.certification.ilike.%${certification}%`); // Partial match for certifications
            });
        }

        const { data, error } = await query;

        if (error) {
            return res.status(500).json({ message: 'Error searching candidates', error });
        }

        // Return the candidates data as JSON
        console.log('Search results are Provided');
        res.status(200).json({ candidates: data });
    } catch (err) {
        console.error('Error fetching candidates:', err);
        res.status(500).json({ message: 'Error searching candidates' });
    }
});


// Check Supabase connection and log message
supabase
    .rpc('ping') // Using a test RPC to check the connection
    .then(() => {
        console.log('Connected to Supabase');
    })
    .catch((err) => {
        console.error('Error connecting to Supabase:', err);
    });

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});






