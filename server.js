const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post('/composite', upload.fields([
  { name: 'background', maxCount: 1 },
  { name: 'overlay', maxCount: 1 }
]), async (req, res) => {
  try {
    const background = req.files['background'][0].buffer;
    const overlay = req.files['overlay'][0].buffer;

    const left = parseInt(req.body.left || 0);
    const top = parseInt(req.body.top || 0);

    const result = await sharp(background)
      .composite([
        {
          input: overlay,
          left,
          top
        }
      ])
      .png()
      .toBuffer();

    res.set('Content-Type', 'image/png');
    res.send(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Sharp API running on port 3000');
});
