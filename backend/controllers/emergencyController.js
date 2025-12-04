const mongoose = require('mongoose');
const EmergencyCard = require('../models/EmergencyCard');
const Patient = require('../models/Patient');
const User = require('../models/User');
const QRCode = require('qrcode');

// @desc    Generate/update emergency card
// @route   POST /api/patients/:id/emergency-card
// @access  Private
exports.generateEmergencyCard = async (req, res, next) => {
  try {
    // Convert string ID to ObjectId
    const userId = mongoose.Types.ObjectId.isValid(req.params.id) 
      ? new mongoose.Types.ObjectId(req.params.id) 
      : req.params.id;
    
    const patient = await Patient.findOne({ userId })
      .populate('userId', 'name');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify ownership
    if (req.user.role === 'patient' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    let emergencyCard = await EmergencyCard.findOne({ patientId: patient._id });

    if (emergencyCard) {
      emergencyCard.fields = req.body.fields || emergencyCard.fields;
      emergencyCard.isPublic = req.body.isPublic !== undefined ? req.body.isPublic : emergencyCard.isPublic;
      emergencyCard.lastUpdated = new Date();
      await emergencyCard.save();
    } else {
      emergencyCard = await EmergencyCard.create({
        patientId: patient._id,
        fields: req.body.fields || {
          name: true,
          bloodGroup: true,
          allergies: true,
          emergencyContact: true
        },
        isPublic: req.body.isPublic || false
      });
    }

    // Generate QR code
    const publicUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/emergency/${emergencyCard.publicToken}`;
    const qrCodeDataUrl = await QRCode.toDataURL(publicUrl);

    res.status(200).json({
      success: true,
      data: {
        emergencyCard,
        qrCode: qrCodeDataUrl,
        publicUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get patient's emergency card
// @route   GET /api/patients/:id/emergency-card
// @access  Private
exports.getEmergencyCard = async (req, res, next) => {
  try {
    // Convert string ID to ObjectId
    const userId = mongoose.Types.ObjectId.isValid(req.params.id) 
      ? new mongoose.Types.ObjectId(req.params.id) 
      : req.params.id;
    
    const patient = await Patient.findOne({ userId })
      .populate('userId', 'name');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Verify ownership
    if (req.user.role === 'patient' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    let emergencyCard = await EmergencyCard.findOne({ patientId: patient._id });

    if (!emergencyCard) {
      // Create a default emergency card if it doesn't exist
      emergencyCard = await EmergencyCard.create({
        patientId: patient._id,
        fields: {
          name: true,
          bloodGroup: true,
          allergies: true,
          emergencyContact: true
        },
        isPublic: false
      });
    }

    // Generate QR code
    const publicUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/emergency/${emergencyCard.publicToken}`;
    const qrCodeDataUrl = await QRCode.toDataURL(publicUrl);

    res.status(200).json({
      success: true,
      data: {
        emergencyCard,
        qrCode: qrCodeDataUrl,
        publicUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get public emergency card
// @route   GET /emergency/:publicToken
// @access  Public
exports.getPublicEmergencyCard = async (req, res, next) => {
  try {
    const { publicToken } = req.params;

    const emergencyCard = await EmergencyCard.findOne({ publicToken })
      .populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'name' }
      });

    if (!emergencyCard || !emergencyCard.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Emergency card not found or not publicly available'
      });
    }

    const patient = emergencyCard.patientId;
    if (!patient || !patient.userId) {
      return res.status(404).json({
        success: false,
        message: 'Patient data not found'
      });
    }
    
    const user = patient.userId;

    // Build response with only allowed fields
    const response = {};
    if (emergencyCard.fields.name && user) {
      response.name = user.name;
    }
    if (emergencyCard.fields.bloodGroup && patient.bloodGroup) {
      response.bloodGroup = patient.bloodGroup;
    }
    if (emergencyCard.fields.allergies && patient.allergies) {
      response.allergies = patient.allergies;
    }
    if (emergencyCard.fields.emergencyContact && patient.emergencyContact) {
      response.emergencyContact = patient.emergencyContact;
    }

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

