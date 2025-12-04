const Patient = require('../models/Patient');
const PreventiveRule = require('../models/PreventiveRule');

// @desc    Get preventive care recommendations
// @route   GET /api/recommendations/:patientId
// @access  Private
exports.getRecommendations = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.patientId)
      .populate('userId', 'name email');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Calculate age
    const age = Math.floor((Date.now() - patient.dob) / (365.25 * 24 * 60 * 60 * 1000));

    // Get all enabled rules
    const rules = await PreventiveRule.find({ enabled: true });

    // Evaluate rules against patient
    const recommendations = [];

    for (const rule of rules) {
      const shouldRecommend = evaluateRule(rule, patient, age);

      if (shouldRecommend) {
        // Check if test was done recently
        const lastTest = patient.lastTests.find(
          t => t.type === rule.testType
        );

        const daysSinceLastTest = lastTest
          ? Math.floor((Date.now() - new Date(lastTest.date)) / (24 * 60 * 60 * 1000))
          : Infinity;

        if (daysSinceLastTest >= rule.recommendedIntervalDays) {
          recommendations.push({
            ruleId: rule._id,
            testType: rule.testType,
            recommendationText: rule.recommendationText,
            dueDate: lastTest
              ? new Date(new Date(lastTest.date).getTime() + rule.recommendedIntervalDays * 24 * 60 * 60 * 1000)
              : new Date(),
            daysOverdue: Math.max(0, daysSinceLastTest - rule.recommendedIntervalDays),
            priority: daysSinceLastTest > rule.recommendedIntervalDays * 2 ? 'high' : 'medium'
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Evaluate recommendations
// @route   POST /api/recommendations/evaluate
// @access  Private
exports.evaluateRecommendations = async (req, res, next) => {
  try {
    const { patientId } = req.body;

    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // This would trigger a full evaluation
    // For now, just return success
    res.status(200).json({
      success: true,
      message: 'Recommendations evaluated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to evaluate a rule
function evaluateRule(rule, patient, age) {
  // Simple rule evaluation (can be enhanced)
  const expression = rule.conditionExpression.toLowerCase();

  if (expression.includes('age')) {
    const ageMatch = expression.match(/age\s*[><=]+\s*(\d+)/);
    if (ageMatch) {
      const threshold = parseInt(ageMatch[1]);
      const operator = expression.match(/age\s*([><=]+)/)[1];
      
      if (operator.includes('>=') && age < threshold) return false;
      if (operator.includes('<=') && age > threshold) return false;
      if (operator.includes('>') && age <= threshold) return false;
      if (operator.includes('<') && age >= threshold) return false;
      if (operator.includes('=') && age !== threshold) return false;
    }
  }

  if (expression.includes('sex')) {
    const sexMatch = expression.match(/sex\s*===\s*['"]([^'"]+)['"]/);
    if (sexMatch) {
      const requiredSex = sexMatch[1].toLowerCase();
      if (patient.sex.toLowerCase() !== requiredSex) return false;
    }
  }

  if (expression.includes('condition')) {
    // Check if patient has specific conditions
    // Simplified for MVP
  }

  return true;
}

