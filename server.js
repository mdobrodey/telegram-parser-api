import express from 'express';
import TelegramParser from 'telegram-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import cleanUsername from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const parser = new TelegramParser();

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/:username', async (req, res) => {
  try {
    const username = cleanUsername(req.params.username);

    if (!username) {
      return res.status(400).json({ error: 'username is required' });
    }

    const result = await parser.parse(username);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Parse error: ', err);
    res.status(500).json({
      success: false,
      error: 'failed to parse',
    });
  }
});

app.get('/:username/latestPosts', async (req, res) => {
  try {
    const username = cleanUsername(req.params.username);

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'invalid username',
      });
    }

    const result = await parser.getLastPosts(username);

    if (!result || !result.posts) {
      return res.status(404).json({
        success: false,
        error: 'channel not found or has no posts',
      });
    }

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Parse error: ', err);
    res.status(500).json({
      success: false,
      error: 'failed to parse',
    });
  }
});

app.get('/:username/:postId', async (req, res) => {
  try {
    const { username, postId } = req.params;
    const cleanedUsername = cleanUsername(username);

    if (!cleanedUsername || !postId) {
      return res.status(400).json({
        success: false,
        error: 'invalid parameters',
      });
    }

    if (!/^\d+$/.test(postId)) {
      return res.status(400).json({
        success: false,
        error: 'invalid postId',
      });
    }

    const postLink = `${cleanedUsername}/${postId}`;
    const result = await parser.parse(postLink);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Parse error: ', err);
    res.status(500).json({
      success: false,
      error: 'failed to parse',
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
