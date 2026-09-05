require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(cors());
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Route 1: Search CVEs from the NVD database
app.get('/api/cve/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const response = await axios.get(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(keyword)}&resultsPerPage=5`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to fetch CVE data' });
  }
});

// Route 2: Ask Claude to explain a CVE in plain English
app.post('/api/explain', async (req, res) => {
  try {
    const { cveData } = req.body;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Explain this security vulnerability in simple, plain English for someone who isn't deeply technical. Include: what it affects, how severe it is, and what someone should do about it.\n\n${JSON.stringify(cveData)}`,
        },
      ],
    });

    res.json({ explanation: message.content[0].text });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Failed to get AI explanation' });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});