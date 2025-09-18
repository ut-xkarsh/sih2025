#!/usr/bin/env node
/**
 * Database Inspector Tool
 * Use this script to check stored preferences data and verify ML model integration readiness
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { getQuery, allQuery } = require('./config/database');

class DatabaseInspector {
  
  // Check if tables exist and show schema
  static async checkTables() {
    console.log('🔍 Checking database tables...\n');
    
    try {
      const tables = await allQuery(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
      `);
      
      console.log('📋 Available tables:');
      tables.forEach(table => console.log(`  - ${table.name}`));
      
      // Show preferences table schema
      const schema = await allQuery(`PRAGMA table_info(preferences)`);
      console.log('\n📊 Preferences table schema:');
      schema.forEach(col => {
        console.log(`  ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''} ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
      
    } catch (error) {
      console.error('❌ Error checking tables:', error.message);
    }
  }
  
  // Count total stored preferences
  static async countPreferences() {
    try {
      const result = await getQuery('SELECT COUNT(*) as count FROM preferences');
      console.log(`\n📈 Total stored preferences: ${result.count}`);
      return result.count;
    } catch (error) {
      console.error('❌ Error counting preferences:', error.message);
      return 0;
    }
  }
  
  // Show sample data
  static async showSampleData(limit = 5) {
    try {
      const samples = await allQuery(`
        SELECT 
          id, session_id, education_level, skills, sector, location, 
          created_at, user_ip
        FROM preferences 
        ORDER BY created_at DESC 
        LIMIT ?
      `, [limit]);
      
      console.log(`\n📝 Sample preferences data (latest ${limit}):`);
      samples.forEach((pref, index) => {
        console.log(`\n  ${index + 1}. ID: ${pref.id}`);
        console.log(`     Session: ${pref.session_id}`);
        console.log(`     Education: ${pref.education_level || 'Not specified'}`);
        console.log(`     Skills: ${pref.skills || 'Not specified'}`);
        console.log(`     Sector: ${pref.sector || 'Not specified'}`);
        console.log(`     Location: ${pref.location || 'Not specified'}`);
        console.log(`     Created: ${pref.created_at}`);
        console.log(`     IP: ${pref.user_ip}`);
      });
      
      return samples;
    } catch (error) {
      console.error('❌ Error retrieving sample data:', error.message);
      return [];
    }
  }
  
  // Generate ML-ready data format
  static async generateMLData() {
    try {
      const preferences = await allQuery(`
        SELECT 
          id, education_level, skills, sector, location, created_at 
        FROM preferences 
        ORDER BY created_at DESC
      `);
      
      const mlData = preferences.map(pref => ({
        id: pref.id,
        features: {
          education_level: this.normalizeEducation(pref.education_level),
          skills: this.normalizeSkills(pref.skills),
          sector: this.normalizeSector(pref.sector),
          location: this.normalizeLocation(pref.location)
        },
        timestamp: pref.created_at
      }));
      
      console.log(`\n🤖 ML-ready data format (${mlData.length} records):`);
      if (mlData.length > 0) {
        console.log('Sample ML record:');
        console.log(JSON.stringify(mlData[0], null, 2));
      }
      
      return mlData;
    } catch (error) {
      console.error('❌ Error generating ML data:', error.message);
      return [];
    }
  }
  
  // Normalize education levels for ML
  static normalizeEducation(education) {
    const mapping = {
      '10th Pass': 'secondary',
      '12th Pass': 'higher_secondary',
      'Diploma': 'diploma',
      'Bachelor\'s Degree': 'bachelor',
      'Master\'s Degree': 'master',
      'PhD': 'doctorate'
    };
    return mapping[education] || 'unknown';
  }
  
  // Normalize skills for ML
  static normalizeSkills(skills) {
    if (!skills) return [];
    return skills.split(',').map(skill => skill.trim().toLowerCase());
  }
  
  // Normalize sector for ML
  static normalizeSector(sector) {
    if (!sector) return 'unknown';
    return sector.toLowerCase().replace(/\s+/g, '_');
  }
  
  // Normalize location for ML
  static normalizeLocation(location) {
    if (!location) return 'unknown';
    return location.toLowerCase().replace(/\s+/g, '_');
  }
  
  // Full inspection report
  static async runFullInspection() {
    console.log('🚀 Starting Database Inspection...\n');
    console.log('='.repeat(50));
    
    await this.checkTables();
    const count = await this.countPreferences();
    
    if (count > 0) {
      await this.showSampleData();
      await this.generateMLData();
    } else {
      console.log('\n⚠️  No preferences data found. Submit some test data through the frontend first.');
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Inspection complete!');
  }
}

// Run inspection when script is called directly
if (require.main === module) {
  DatabaseInspector.runFullInspection().catch(console.error);
}

module.exports = DatabaseInspector;