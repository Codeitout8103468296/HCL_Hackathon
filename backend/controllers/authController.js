const User = require('../models/User');
const Patient = require('../models/Patient');
const Provider = require('../models/Provider');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, role, consentGiven } = req.body;

    if (!consentGiven) {
      return res.status(400).json({
        success: false,
        message: 'Consent must be given to register'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      name,
      role: role || 'patient',
      consentGiven
    });

    // Create patient or provider profile
    if (user.role === 'patient') {
      const { dob, sex } = req.body;
      if (!dob || !sex) {
        return res.status(400).json({
          success: false,
          message: 'Date of birth and sex are required for patient registration'
        });
      }
      await Patient.create({
        userId: user._id,
        dob,
        sex
      });
    } else if (user.role === 'provider') {
      await Provider.create({
        userId: user._id,
        specialization: req.body.specialization,
        licenseNumber: req.body.licenseNumber
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Get patient or provider profile
    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id });
    } else if (user.role === 'provider') {
      profile = await Provider.findOne({ userId: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
};

