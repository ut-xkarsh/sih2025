# ML Model Integration Guide for Internest Backend

## 📊 Data Storage Verification

✅ **Backend Status**: All input data is successfully stored in SQLite database  
✅ **API Endpoints**: Working correctly with proper data formatting  
✅ **Data Integrity**: All 4 fields (Education, Skills, Sector, Location) are captured  

## 🗄️ Database Schema

**Table**: `preferences`
```sql
- id: INTEGER PRIMARY KEY (Auto-increment)
- session_id: TEXT (Unique session identifier)  
- user_ip: TEXT (User IP address for analytics)
- education_level: TEXT (Education qualification)
- skills: TEXT (Comma-separated skills list)
- sector: TEXT (Industry/sector preference)
- location: TEXT (Preferred location)
- created_at: DATETIME (Timestamp)
- updated_at: DATETIME (Last modified)
```

## 🔌 API Endpoints for ML Integration

### 1. Store New Preferences
```
POST /api/preferences
Content-Type: application/json

{
  "education": "Bachelor's Degree",
  "skills": "JavaScript, React, Node.js", 
  "sector": "Information Technology",
  "location": "Karnataka"
}
```

### 2. Retrieve All Data (Standard Format)
```
GET /api/preferences/admin/all
GET /api/preferences/admin/all?limit=100&offset=0
```

### 3. Retrieve ML-Ready Data Format
```
GET /api/preferences/admin/all?export_format=ml
```

## 🤖 ML-Ready Data Format

The backend provides pre-processed data optimized for ML models:

```json
{
  "success": true,
  "format": "ml_ready",
  "count": 5,
  "data": [
    {
      "id": 3,
      "features": {
        "education_level": "Bachelor's Degree",
        "skills": ["JavaScript", "React", "Node.js"],
        "sector": "Information Technology", 
        "location": "Karnataka"
      },
      "metadata": {
        "created_at": "2025-09-18 11:27:26",
        "session_id": "session_1758194846356_kujkkoyfs",
        "user_ip": "::1"
      }
    }
  ]
}
```

## 📈 Current Data Status

- **Total Records**: 5 stored preferences
- **Data Quality**: All fields properly captured
- **Timestamp Tracking**: Full audit trail available
- **Session Management**: Unique session IDs for user tracking

## 🔧 ML Model Integration Steps

### Option 1: Real-time API Integration
```python
import requests

# Fetch ML-ready data
response = requests.get('http://localhost:5000/api/preferences/admin/all?export_format=ml')
data = response.json()

# Process features for ML model
features = []
for record in data['data']:
    features.append({
        'education': record['features']['education_level'],
        'skills': record['features']['skills'],
        'sector': record['features']['sector'],
        'location': record['features']['location']
    })
```

### Option 2: Database Direct Access
```python
import sqlite3

conn = sqlite3.connect('./backend/data/internest.db')
cursor = conn.cursor()

cursor.execute("""
    SELECT education_level, skills, sector, location, created_at 
    FROM preferences 
    ORDER BY created_at DESC
""")

data = cursor.fetchall()
```

## 🎯 Feature Engineering Ready

### Education Levels (Categorical)
- "10th Pass" → secondary
- "12th Pass" → higher_secondary  
- "Diploma" → diploma
- "Bachelor's Degree" → bachelor
- "Master's Degree" → master
- "PhD" → doctorate

### Skills (Multi-label)
- Comma-separated strings → Arrays
- Example: "JavaScript, React, Node.js" → ["javascript", "react", "node.js"]

### Sectors (Categorical)
- "Information Technology" → information_technology
- "Healthcare" → healthcare
- "Education" → education
- etc.

### Locations (Categorical)
- State/UT names → normalized lowercase with underscores
- "Karnataka" → karnataka

## 📊 Data Analytics Available

### Basic Statistics Endpoint
```
GET /api/preferences/stats/overview
```

### Sample Analytics
- **Most Popular Education Level**: Bachelor's Degree
- **Top Skills**: JavaScript, Python, React
- **Popular Sectors**: Information Technology
- **Common Locations**: Karnataka, Maharashtra

## 🚀 Next Steps for ML Integration

1. **Set up ML Pipeline**: Use the `/api/preferences/admin/all?export_format=ml` endpoint
2. **Feature Preprocessing**: Apply normalization and encoding
3. **Model Training**: Use historical preference data for recommendation system
4. **Real-time Predictions**: Integrate ML model with internship matching API
5. **Feedback Loop**: Store user interactions for model improvement

## 🛡️ Production Considerations

- **Rate Limiting**: API has built-in rate limiting (100 requests/15min)
- **Data Privacy**: Session-based tracking, no personal info stored
- **Scalability**: SQLite for development, consider PostgreSQL for production
- **Caching**: Implement Redis caching for ML model predictions
- **Monitoring**: Built-in logging and activity tracking

## 📝 Testing Commands

```bash
# Test data submission
node test-data-submission.js

# Inspect database
node inspect-data.js

# Check API health
curl http://localhost:5000/health

# Get ML data
curl "http://localhost:5000/api/preferences/admin/all?export_format=ml"
```

---

**Status**: ✅ **Ready for ML Model Integration**  
**Last Updated**: September 18, 2025  
**Data Records**: 5+ preferences stored and validated