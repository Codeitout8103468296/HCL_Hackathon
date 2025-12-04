const SymptomReport = require('../models/SymptomReport');
const Patient = require('../models/Patient');

// Symptom rules for triage
const SYMPTOM_RULES = [
  {
    symptoms: ['chest pain', 'shortness of breath', 'dizziness'],
    severityThreshold: 7,
    recommendation: 'emergency',
    urgencyLevel: 'critical'
  },
  {
    symptoms: ['fever', 'cough', 'body aches'],
    severityThreshold: 6,
    recommendation: 'see-gp',
    urgencyLevel: 'high'
  },
  {
    symptoms: ['headache', 'fatigue'],
    severityThreshold: 5,
    recommendation: 'self-care',
    urgencyLevel: 'low'
  }
];

// @desc    Submit symptom report
// @route   POST /api/symptoms/report
// @access  Private
exports.submitSymptomReport = async (req, res, next) => {
  try {
    const { patientId, symptoms } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify patient ownership
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ userId: req.user.id });
      if (patientProfile._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }

    // Evaluate symptoms against rules
    const evaluation = evaluateSymptoms(symptoms);

    const report = await SymptomReport.create({
      patientId,
      symptoms,
      recommendation: evaluation.recommendation,
      urgencyLevel: evaluation.urgencyLevel
    });

    res.status(201).json({
      success: true,
      data: report,
      disclaimer: 'This is not a medical diagnosis. Please consult a healthcare professional for proper medical advice.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get symptom history
// @route   GET /api/symptoms/history/:patientId
// @access  Private
exports.getSymptomHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify authorization
    if (req.user.role === 'patient') {
      const patientProfile = await Patient.findOne({ userId: req.user.id });
      if (patientProfile._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized'
        });
      }
    }

    const reports = await SymptomReport.find({ patientId })
      .sort({ timestamp: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to evaluate symptoms
function evaluateSymptoms(symptoms) {
  let recommendation = 'self-care';
  let urgencyLevel = 'low';

  // Check against rules
  for (const rule of SYMPTOM_RULES) {
    const matchingSymptoms = symptoms.filter(s =>
      rule.symptoms.some(rs => s.name.toLowerCase().includes(rs.toLowerCase()))
    );

    if (matchingSymptoms.length > 0) {
      const maxSeverity = Math.max(...matchingSymptoms.map(s => s.severity));
      
      if (maxSeverity >= rule.severityThreshold) {
        recommendation = rule.recommendation;
        urgencyLevel = rule.urgencyLevel;
        break;
      }
    }
  }

  // Check for high severity symptoms
  const highSeveritySymptoms = symptoms.filter(s => s.severity >= 8);
  if (highSeveritySymptoms.length > 0 && recommendation === 'self-care') {
    recommendation = 'see-gp';
    urgencyLevel = 'high';
  }

  return { recommendation, urgencyLevel };
}

