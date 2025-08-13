const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.get('/:username', (req, res) => {
    const username = req.params.username;
    
    // Path should point to views directory from the routers folder
    const profilePath = path.join(__dirname, '../views/userProfile.html');
    fs.readFile(profilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading profile template:', err);
            return res.status(500).send('Error loading profile');
        }
        res.send(data);
    });
});

module.exports = router;