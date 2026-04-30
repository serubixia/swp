const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post('/composite', upload.fields([
  { name: 'frame', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const frame = req.files['frame'][0].buffer;
    const image = req.files['image'][0].buffer;

    const left = parseInt(req.body.left || 0);
    const top = parseInt(req.body.top || 0);
    const width = parseInt(req.body.width || 0);
    const height = parseInt(req.body.height || 0);

    // 📐 Redimensionar si se especifica
    let resizedImage = image;
    if (width > 0 && height > 0) {
      resizedImage = await sharp(image)
        .resize(width, height)
        .toBuffer();
    }

    // 🧱 Crear composición correcta (foto debajo, marco encima)
    const result = await sharp({
      create: {
        width: (await sharp(frame).metadata()).width,
        height: (await sharp(frame).metadata()).height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
    .composite([
      {
        input: resizedImage,
        left,
        top
      },
      {
        input: frame,
        left: 0,
        top: 0
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
