const pool = require('../config/database');
const { body, validationResult } = require('express-validator');
const { uploadImageAndGetUrl, uploadMediaAndGetUrl } = require('../services/mediaStorage');

const folderValidation = [body('name').isLength({ min: 1, max: 255 }).trim()];

const storyValidation = [
  body('caption').optional({ nullable: true }).isLength({ max: 500 }).trim(),
];

async function fetchFoldersWithStories() {
  const foldersResult = await pool.query(
    `SELECT id, name, cover_image_url, sort_order, created_at
     FROM ambience_folders
     ORDER BY sort_order ASC, id ASC`
  );

  const storiesResult = await pool.query(
    `SELECT id, folder_id, image_url, media_type, caption, sort_order, created_at
     FROM ambience_stories
     ORDER BY sort_order ASC, id ASC`
  );

  const storiesByFolder = new Map();
  storiesResult.rows.forEach((story) => {
    const list = storiesByFolder.get(story.folder_id) || [];
    list.push(story);
    storiesByFolder.set(story.folder_id, list);
  });

  return foldersResult.rows.map((folder) => ({
    ...folder,
    stories: storiesByFolder.get(folder.id) || [],
  }));
}

const getAmbience = async (req, res) => {
  try {
    const folders = await fetchFoldersWithStories();
    res.json(folders);
  } catch (error) {
    if (error.code === '42P01') {
      return res.json([]);
    }
    console.error('getAmbience:', error);
    res.json([]);
  }
};

const createFolder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid folder data', details: errors.array() });
    }

    const { name } = req.body;
    let cover_image_url = req.body.cover_image_url || null;

    if (req.file) {
      cover_image_url = await uploadImageAndGetUrl(req.file, 'elnadhour/ambience/folders');
    }

    const maxRow = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM ambience_folders'
    );
    const sort_order = maxRow.rows[0].n;

    const result = await pool.query(
      `INSERT INTO ambience_folders (name, cover_image_url, sort_order)
       VALUES ($1, $2, $3) RETURNING *`,
      [name, cover_image_url, sort_order]
    );

    res.status(201).json({ ...result.rows[0], stories: [] });
  } catch (error) {
    console.error('createFolder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

const updateFolder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid folder data', details: errors.array() });
    }

    const { id } = req.params;
    const { name } = req.body;
    let cover_image_url = req.body.cover_image_url;

    const existing = await pool.query('SELECT * FROM ambience_folders WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    if (req.file) {
      cover_image_url = await uploadImageAndGetUrl(req.file, 'elnadhour/ambience/folders');
    } else if (cover_image_url === undefined) {
      cover_image_url = existing.rows[0].cover_image_url;
    }

    const result = await pool.query(
      `UPDATE ambience_folders SET name = $1, cover_image_url = $2 WHERE id = $3 RETURNING *`,
      [name, cover_image_url, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('updateFolder:', error);
    res.status(500).json({ error: 'Failed to update folder' });
  }
};

const deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM ambience_folders WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    res.json({ message: 'Deleted', id: parseInt(id, 10) });
  } catch (error) {
    console.error('deleteFolder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};

const createStory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid story data', details: errors.array() });
    }

    const { folderId } = req.params;
    const caption = req.body.caption?.trim() || null;

    if (!req.file) {
      return res.status(400).json({ error: 'Fichier image ou vidéo requis' });
    }

    const folderCheck = await pool.query('SELECT id FROM ambience_folders WHERE id = $1', [folderId]);
    if (folderCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    const isVideo = req.file.mimetype?.startsWith('video/');
    const media_type = isVideo ? 'video' : 'image';
    const image_url = await uploadMediaAndGetUrl(req.file, 'elnadhour/ambience/stories');

    const maxRow = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS n FROM ambience_stories WHERE folder_id = $1',
      [folderId]
    );
    const sort_order = maxRow.rows[0].n;

    const result = await pool.query(
      `INSERT INTO ambience_stories (folder_id, image_url, media_type, caption, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [folderId, image_url, media_type, caption, sort_order]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('createStory:', error);
    res.status(500).json({ error: 'Failed to create story' });
  }
};

const deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM ambience_stories WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Story not found' });
    }
    res.json({ message: 'Deleted', id: parseInt(id, 10) });
  } catch (error) {
    console.error('deleteStory:', error);
    res.status(500).json({ error: 'Failed to delete story' });
  }
};

module.exports = {
  folderValidation,
  storyValidation,
  getAmbience,
  createFolder,
  updateFolder,
  deleteFolder,
  createStory,
  deleteStory,
};
