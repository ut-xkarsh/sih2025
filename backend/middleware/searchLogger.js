// Middleware to log search activities
const { runQuery } = require('../config/database');

const logSearchActivity = async (req, res, next) => {
  // Store original res.json to intercept response
  const originalJson = res.json;

  res.json = function(data) {
    // Log search activity if this is a search request
    if (req.method === 'GET' && req.path.includes('internships')) {
      const logData = {
        sessionId: req.headers['x-session-id'] || 'anonymous',
        userIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip,
        searchParams: JSON.stringify(req.query),
        resultsCount: data.data ? data.data.length : 0
      };

      // Log to database asynchronously (don't wait for it)
      const sql = `
        INSERT INTO search_logs (session_id, user_ip, search_params, results_count)
        VALUES (?, ?, ?, ?)
      `;
      
      runQuery(sql, [logData.sessionId, logData.userIp, logData.searchParams, logData.resultsCount])
        .catch(err => console.error('Error logging search activity:', err));
    }

    // Call original res.json
    return originalJson.call(this, data);
  };

  next();
};

module.exports = {
  logSearchActivity
};