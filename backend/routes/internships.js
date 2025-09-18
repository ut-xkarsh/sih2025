const express = require('express');
const router = express.Router();

// Mock internship data for now
const mockInternships = [
  {
    id: 1,
    title: "Software Development Intern",
    company: "TechCorp Solutions",
    location: "Mumbai, Maharashtra",
    duration: "3 months",
    educationRequirements: "Bachelor's Degree",
    skillsRequired: ["React", "JavaScript", "Node.js"],
    description: "Join our team to work on cutting-edge web applications using modern technologies.",
    stipend: "₹15,000/month",
    sector: "Information Technology"
  },
  {
    id: 2,
    title: "Digital Marketing Intern",
    company: "MarketPro Agency",
    location: "Bangalore, Karnataka",
    duration: "4 months",
    educationRequirements: "12th Pass",
    skillsRequired: ["Social Media", "Content Writing", "Analytics"],
    description: "Help create and execute digital marketing campaigns for various clients.",
    stipend: "₹12,000/month",
    sector: "Marketing"
  },
  {
    id: 3,
    title: "Data Analyst Intern",
    company: "DataInsights Ltd",
    location: "Pune, Maharashtra",
    duration: "6 months",
    educationRequirements: "Bachelor's Degree",
    skillsRequired: ["Python", "SQL", "Excel"],
    description: "Analyze business data and create insights to drive decision making.",
    stipend: "₹18,000/month",
    sector: "Information Technology"
  }
];

// GET /api/internships - Get all internships with optional filtering
router.get('/', (req, res) => {
  try {
    const { education, skills, sector, location, page = 1, limit = 10 } = req.query;
    
    let filteredInternships = mockInternships;

    // Apply filters
    if (education) {
      filteredInternships = filteredInternships.filter(internship => 
        internship.educationRequirements.toLowerCase().includes(education.toLowerCase())
      );
    }

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim().toLowerCase());
      filteredInternships = filteredInternships.filter(internship =>
        skillsArray.some(skill =>
          internship.skillsRequired.some(reqSkill =>
            reqSkill.toLowerCase().includes(skill)
          )
        )
      );
    }

    if (sector) {
      filteredInternships = filteredInternships.filter(internship =>
        internship.sector.toLowerCase().includes(sector.toLowerCase())
      );
    }

    if (location) {
      filteredInternships = filteredInternships.filter(internship =>
        internship.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = filteredInternships.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredInternships.length,
        totalPages: Math.ceil(filteredInternships.length / limit)
      },
      filters: {
        education,
        skills,
        sector,
        location
      }
    });

  } catch (error) {
    console.error('Error retrieving internships:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve internships',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/internships/:id - Get specific internship
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const internship = mockInternships.find(int => int.id === parseInt(id));

    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found'
      });
    }

    res.json({
      success: true,
      data: internship
    });

  } catch (error) {
    console.error('Error retrieving internship:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve internship',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;