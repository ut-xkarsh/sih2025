const { runQuery, getQuery, allQuery } = require('../config/database');

class PreferenceModel {
  // Save user preferences
  static async savePreferences(data) {
    const { sessionId, userIp, educationLevel, skills, sector, location } = data;
    
    const sql = `
      INSERT INTO preferences (
        session_id, user_ip, education_level, skills, sector, location
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [sessionId, userIp, educationLevel, skills, sector, location];
    
    try {
      const result = await runQuery(sql, params);
      return { 
        success: true, 
        id: result.id,
        message: 'Preferences saved successfully' 
      };
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw new Error('Failed to save preferences');
    }
  }

  // Get preferences by session ID
  static async getPreferencesBySession(sessionId) {
    const sql = `
      SELECT * FROM preferences 
      WHERE session_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    try {
      const result = await getQuery(sql, [sessionId]);
      return result;
    } catch (error) {
      console.error('Error getting preferences by session:', error);
      throw new Error('Failed to retrieve preferences');
    }
  }

  // Get all preferences with pagination
  static async getAllPreferences(limit = 100, offset = 0) {
    const sql = `
      SELECT id, session_id, user_ip, education_level as education, skills, sector, location, created_at, updated_at
      FROM preferences 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    try {
      const results = await allQuery(sql, [limit, offset]);
      return results;
    } catch (error) {
      console.error('Error getting all preferences:', error);
      throw new Error('Failed to retrieve preferences');
    }
  }

  // Update preferences
  static async updatePreferences(id, data) {
    const { educationLevel, skills, sector, location } = data;
    
    const sql = `
      UPDATE preferences 
      SET education_level = ?, skills = ?, sector = ?, location = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [educationLevel, skills, sector, location, id];
    
    try {
      const result = await runQuery(sql, params);
      if (result.changes === 0) {
        throw new Error('Preference not found');
      }
      return { 
        success: true, 
        message: 'Preferences updated successfully' 
      };
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  // Delete preferences
  static async deletePreferences(id) {
    const sql = `DELETE FROM preferences WHERE id = ?`;
    
    try {
      const result = await runQuery(sql, [id]);
      if (result.changes === 0) {
        throw new Error('Preference not found');
      }
      return { 
        success: true, 
        message: 'Preferences deleted successfully' 
      };
    } catch (error) {
      console.error('Error deleting preferences:', error);
      throw error;
    }
  }

  // Get preferences statistics
  static async getPreferencesStats() {
    const queries = {
      total: 'SELECT COUNT(*) as count FROM preferences',
      byEducation: `
        SELECT education_level, COUNT(*) as count 
        FROM preferences 
        WHERE education_level IS NOT NULL AND education_level != '' 
        GROUP BY education_level 
        ORDER BY count DESC
      `,
      bySector: `
        SELECT sector, COUNT(*) as count 
        FROM preferences 
        WHERE sector IS NOT NULL AND sector != '' 
        GROUP BY sector 
        ORDER BY count DESC
      `,
      byLocation: `
        SELECT location, COUNT(*) as count 
        FROM preferences 
        WHERE location IS NOT NULL AND location != '' 
        GROUP BY location 
        ORDER BY count DESC 
        LIMIT 10
      `,
      recent: `
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM preferences 
        WHERE created_at >= date('now', '-30 days')
        GROUP BY DATE(created_at) 
        ORDER BY date DESC
      `
    };

    try {
      const [total, byEducation, bySector, byLocation, recent] = await Promise.all([
        getQuery(queries.total),
        allQuery(queries.byEducation),
        allQuery(queries.bySector),
        allQuery(queries.byLocation),
        allQuery(queries.recent)
      ]);

      return {
        total: total.count,
        byEducation,
        bySector,
        byLocation,
        recent
      };
    } catch (error) {
      console.error('Error getting preferences stats:', error);
      throw new Error('Failed to retrieve statistics');
    }
  }
}

module.exports = PreferenceModel;