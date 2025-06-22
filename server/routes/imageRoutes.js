const express = require('express');
const { removeBackground } = require('@uptotec/background-removal-node');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'No image provided' });

    const base64 = image.replace(/^data:image\/\w+;base64,/, '');
    const imgBuf = Buffer.from(base64, 'base64');

    const outBuf = await removeBackground({
      image: imgBuf,
      output: {
        type: 'buffer',
        format: 'image/png'
      }
    });

    const dataUrl = `data:image/png;base64,${outBuf.toString('base64')}`;
    res.json({ image: dataUrl });

  } catch (err) {
    console.error('BG removal error:', err);
    res.status(500).json({ error: 'Background removal failed' });
  }
});

module.exports = router;