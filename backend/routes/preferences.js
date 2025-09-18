const express = require('express');
const { body, validationResult, query } = require('express-validator');
const PreferenceModel = require('../models/Preference');
const router = express.Router();

// Middleware to generate session ID if not present
const generateSessionId = (req, res, next) => {
  if (!req.body.sessionId && !req.headers['x-session-id']) {
    req.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  } else {
    req.sessionId = req.body.sessionId || req.headers['x-session-id'];
  }
  next();
};

// Get user IP address
const getUserIP = (req) => {
  return req.headers['x-forwarded-for'] || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

// Validation middleware
const validatePreferences = [
  body('education').optional().isString().trim().isLength({ max: 100 }),
  body('skills').optional().isString().trim().isLength({ max: 500 }),
  body('sector').optional().isString().trim().isLength({ max: 100 }),
  body('location').optional().isString().trim().isLength({ max: 100 }),
];

// POST /api/preferences - Save user preferences
router.post('/', generateSessionId, validatePreferences, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { education, skills, sector, location } = req.body;
    const userIP = getUserIP(req);

    // Prepare data for database
    const preferenceData = {
      sessionId: req.sessionId,
      userIp: userIP,
      educationLevel: education || null,
      skills: skills || null,
      sector: sector || null,
      location: location || null
    };

    // Save to database
    const result = await PreferenceModel.savePreferences(preferenceData);

    res.status(201).json({
      success: true,
      message: result.message,
      data: {
        id: result.id,
        sessionId: req.sessionId,
        preferences: {
          education,
          skills,
          sector,
          location
        }
      }
    });

  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/preferences/:sessionId - Get preferences by session ID
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }

    const preferences = await PreferenceModel.getPreferencesBySession(sessionId);

    if (!preferences) {
      return res.status(404).json({
        success: false,
        message: 'No preferences found for this session'
      });
    }

    res.json({
      success: true,
      data: {
        id: preferences.id,
        sessionId: preferences.session_id,
        preferences: {
          education: preferences.education_level,
          skills: preferences.skills,
          sector: preferences.sector,
          location: preferences.location
        },
        createdAt: preferences.created_at,
        updatedAt: preferences.updated_at
      }
    });

  } catch (error) {
    console.error('Error retrieving preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/preferences - Get all preferences (with pagination)
router.get('/', [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const page = req.query.page || 1;
    const limit = req.query.limit || 20;

    const preferences = await PreferenceModel.getAllPreferences(page, limit);

    res.json({
      success: true,
      data: preferences.map(pref => ({
        id: pref.id,
        sessionId: pref.session_id,
        userIP: pref.user_ip,
        preferences: {
          education: pref.education_level,
          skills: pref.skills,
          sector: pref.sector,
          location: pref.location
        },
        createdAt: pref.created_at,
        updatedAt: pref.updated_at
      })),
      pagination: {
        page,
        limit,
        total: preferences.length
      }
    });

  } catch (error) {
    console.error('Error retrieving all preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// PUT /api/preferences/:id - Update preferences
router.put('/:id', validatePreferences, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { education, skills, sector, location } = req.body;

    const updateData = {
      educationLevel: education || null,
      skills: skills || null,
      sector: sector || null,
      location: location || null
    };

    const result = await PreferenceModel.updatePreferences(id, updateData);

    res.json({
      success: true,
      message: result.message,
      data: {
        id: parseInt(id),
        preferences: {
          education,
          skills,
          sector,
          location
        }
      }
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    if (error.message === 'Preference not found') {
      res.status(404).json({
        success: false,
        message: 'Preference not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
});

// DELETE /api/preferences/:id - Delete preferences
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await PreferenceModel.deletePreferences(id);

    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Error deleting preferences:', error);
    if (error.message === 'Preference not found') {
      res.status(404).json({
        success: false,
        message: 'Preference not found'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to delete preferences',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
});

// GET /api/preferences/stats/overview - Get preferences statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await PreferenceModel.getPreferencesStats();

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error retrieving preferences stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/preferences/admin/all - Get all preferences for data inspection (Admin only)
router.get('/admin/all', async (req, res) => {
  try {
    const { limit = 100, offset = 0, export_format } = req.query;
    
    const preferences = await PreferenceModel.getAllPreferences(parseInt(limit), parseInt(offset));
    
    if (export_format === 'ml') {
      // Format data for ML model
      const mlData = preferences.map(pref => ({
        id: pref.id,
        features: {
          education_level: pref.education || 'not_specified',
          skills: pref.skills ? pref.skills.split(',').map(s => s.trim()) : [],
          sector: pref.sector || 'not_specified',
          location: pref.location || 'not_specified'
        },
        metadata: {
          created_at: pref.created_at,
          session_id: pref.session_id,
          user_ip: pref.user_ip
        }
      }));
      
      return res.json({
        success: true,
        format: 'ml_ready',
        count: mlData.length,
        data: mlData
      });
    }
    
    res.json({
      success: true,
      count: preferences.length,
      data: preferences,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });

  } catch (error) {
    console.error('Error retrieving all preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve preferences data',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;