require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());

app.post('/chat', async (req, res) => {
    try {
        const prompt = req.body.prompt;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        console.log('API response:', JSON.stringify(data, null, 2));

        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (reply) {
            res.json({ text: reply });
        } else {
            res.status(500).json({ error: 'No valid response from Gemini API' });
        }
    } catch (err) {
        console.error('Gemini API call failed:', err);
        res.status(500).json({ error: 'API call failed' });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
