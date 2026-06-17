const express = require('express');

const router = express.Router();

const PDDIKTI_BASE_URL = 'https://pddikti.fastapicloud.dev/api';

// GET /api/universities/search/:keyword — Search universities via PDDikti API
router.get('/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;

    if (!keyword || keyword.length < 3) {
      return res.status(400).json({ message: 'Kata kunci minimal 3 karakter.' });
    }

    const response = await fetch(`${PDDIKTI_BASE_URL}/search/pt/${encodeURIComponent(keyword)}/`);

    if (!response.ok) {
      // If PDDikti is down, return empty results gracefully
      console.warn('PDDikti API returned status:', response.status);
      return res.json({ universities: [] });
    }

    const data = await response.json();

    // Map to simpler format
    const universities = (Array.isArray(data) ? data : []).map(pt => ({
      id: pt.id,
      kode: pt.kode,
      nama: pt.nama,
      singkatan: pt.nama_singkat || '',
    }));

    res.json({ universities });
  } catch (error) {
    console.error('University search error:', error);
    // Return empty results if API is unreachable
    res.json({ universities: [] });
  }
});

module.exports = router;
