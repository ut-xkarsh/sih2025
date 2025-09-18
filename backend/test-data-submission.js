#!/usr/bin/env node
/**
 * Test Data Submission Script
 * This script will submit test data to verify backend storage
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDataSubmission() {
  console.log('🧪 Testing Data Submission to Backend...\n');
  
  const testCases = [
    {
      education: "Bachelor's Degree",
      skills: "JavaScript, React, Node.js",
      sector: "Information Technology", 
      location: "Karnataka"
    },
    {
      education: "Master's Degree",
      skills: "Python, Machine Learning, Data Science",
      sector: "Healthcare",
      location: "Maharashtra"
    },
    {
      education: "Diploma",
      skills: "Digital Marketing, SEO",
      sector: "Education",
      location: "Delhi"
    }
  ];
  
  console.log(`📋 Submitting ${testCases.length} test cases...\n`);
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`Test ${i + 1}: ${testCase.education} in ${testCase.sector}`);
    
    try {
      const response = await fetch('http://localhost:5000/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log(`✅ Success: ${result.message} (ID: ${result.id})`);
      } else {
        console.log(`❌ Failed: ${result.message}`);
      }
    } catch (error) {
      console.log(`❌ Network Error: ${error.message}`);
    }
    
    console.log('');
  }
  
  // Now retrieve all data
  console.log('📊 Retrieving all stored data...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/preferences/admin/all');
    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ Retrieved ${result.count} preferences:`);
      result.data.forEach((pref, index) => {
        console.log(`\n${index + 1}. ID: ${pref.id}`);
        console.log(`   Education: ${pref.education || 'Not specified'}`);
        console.log(`   Skills: ${pref.skills || 'Not specified'}`);
        console.log(`   Sector: ${pref.sector || 'Not specified'}`);
        console.log(`   Location: ${pref.location || 'Not specified'}`);
        console.log(`   Created: ${pref.created_at}`);
      });
    } else {
      console.log(`❌ Failed to retrieve data: ${result.message}`);
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
  
  console.log('\n🎯 Testing ML-ready format...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/preferences/admin/all?export_format=ml');
    const result = await response.json();
    
    if (response.ok) {
      console.log(`🤖 ML-ready data (${result.count} records):`);
      if (result.data.length > 0) {
        console.log('\nSample ML record:');
        console.log(JSON.stringify(result.data[0], null, 2));
      }
    } else {
      console.log(`❌ Failed to retrieve ML data: ${result.message}`);
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
  }
  
  console.log('\n✅ Testing completed!');
}

// Run the test
testDataSubmission().catch(console.error);