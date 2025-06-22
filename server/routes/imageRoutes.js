// routes/removeBackground.js
const express = require('express');
const { removeBackground } = require('@imgly/background-removal-node');

const router = express.Router();

router.post('/', async (req, res) => {
    try {

        const { image } = req.body;
        console.log("Received: ", image)

        if (!image) {
            return res.status(400).json({ error: 'No image provided' });
        }

        // Remove the base64 prefix if present
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const imageBuffer = Buffer.from(base64Data, 'base64');

        console.log("Removing bg...")
        const outputBuffer = await removeBackground(imageBuffer, {
            output: { format: 'buffer' }
        });
        console.log("Done removing bg.")

        const outputBase64 = outputBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${outputBase64}`;

        return res.json({ image: dataUrl });
    } catch (err) {
        console.error('Background removal failed:', err);
        res.status(500).json({ error: 'Background removal failed' });
    }
});

module.exports = router;
