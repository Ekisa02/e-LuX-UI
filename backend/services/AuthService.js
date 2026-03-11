const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');
const log = require('../utils/logger');
const DatabaseService = require('../database/DatabaseService');

/**
 * Authentication Service
 * Handles facial recognition and user authentication
 */
class AuthService {
  constructor() {
    this.db = DatabaseService.getInstance();
    this.modelsLoaded = false;
    this.currentUser = null;
    this.faceMatcher = null;
    this.knownFaces = [];
    
    this.init();
  }

  /**
   * Initialize face-api models
   */
  async init() {
    try {
      const modelPath = path.join(__dirname, '../../../ai/models/faceRecognition');
      
      // Load face-api models
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
      
      this.modelsLoaded = true;
      log.info('Face recognition models loaded');
      
      // Load known faces from database
      await this.loadKnownFaces();
      
    } catch (error) {
      log.error('Failed to load face models:', error);
    }
  }

  /**
   * Load known faces from database
   */
  async loadKnownFaces() {
    try {
      const users = await this.db.all('SELECT * FROM users WHERE face_descriptor IS NOT NULL');
      
      this.knownFaces = users.map(user => ({
        label: user.username,
        descriptor: new Float32Array(JSON.parse(user.face_descriptor))
      }));

      if (this.knownFaces.length > 0) {
        this.faceMatcher = new faceapi.FaceMatcher(this.knownFaces);
      }
      
      log.info(`Loaded ${this.knownFaces.length} known faces`);
      
    } catch (error) {
      log.error('Failed to load known faces:', error);
    }
  }

  /**
   * Authenticate user with face
   */
  async authenticateFace(imageData) {
    try {
      if (!this.modelsLoaded) {
        throw new Error('Face recognition models not loaded');
      }

      // Load image
      const img = await canvas.loadImage(imageData);
      
      // Detect face
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        return { success: false, error: 'No face detected' };
      }

      // Match against known faces
      if (this.faceMatcher) {
        const bestMatch = this.faceMatcher.findBestMatch(detections.descriptor);
        
        if (bestMatch.label !== 'unknown' && bestMatch.distance < 0.5) {
          this.currentUser = await this.getUserByUsername(bestMatch.label);
          
          // Log successful login
          await this.logLogin(this.currentUser.id, true);
          
          return {
            success: true,
            user: {
              id: this.currentUser.id,
              username: this.currentUser.username,
              role: this.currentUser.role
            },
            confidence: 1 - bestMatch.distance
          };
        }
      }

      // No match found
      return {
        success: false,
        error: 'Face not recognized'
      };

    } catch (error) {
      log.error('Face authentication failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Register new face
   */
  async registerFace(imageData, username) {
    try {
      if (!this.modelsLoaded) {
        throw new Error('Face recognition models not loaded');
      }

      // Check if user exists
      const existingUser = await this.db.get(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Load image
      const img = await canvas.loadImage(imageData);
      
      // Detect face
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        return { success: false, error: 'No face detected' };
      }

      // Store face descriptor
      const descriptor = Array.from(detections.descriptor);
      
      // Create user in database
      const result = await this.db.run(`
        INSERT INTO users (username, face_descriptor, role, created_at)
        VALUES (?, ?, ?, ?)
      `, [
        username,
        JSON.stringify(descriptor),
        'user',
        new Date().toISOString()
      ]);

      // Reload known faces
      await this.loadKnownFaces();

      return {
        success: true,
        userId: result.lastID,
        message: 'Face registered successfully'
      };

    } catch (error) {
      log.error('Face registration failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify face against current user
   */
  async verifyFace(imageData) {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'Not logged in' };
      }

      const img = await canvas.loadImage(imageData);
      
      const detections = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        return { success: false, error: 'No face detected' };
      }

      // Get user's face descriptor
      const user = await this.db.get(
        'SELECT face_descriptor FROM users WHERE id = ?',
        [this.currentUser.id]
      );

      if (!user || !user.face_descriptor) {
        return { success: false, error: 'User has no registered face' };
      }

      const userDescriptor = new Float32Array(JSON.parse(user.face_descriptor));
      
      // Compare faces
      const distance = faceapi.euclideanDistance(detections.descriptor, userDescriptor);
      const verified = distance < 0.5;

      return {
        success: true,
        verified,
        confidence: 1 - distance
      };

    } catch (error) {
      log.error('Face verification failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username) {
    return this.db.get('SELECT * FROM users WHERE username = ?', [username]);
  }

  /**
   * Log login attempt
   */
  async logLogin(userId, success) {
    try {
      await this.db.run(`
        INSERT INTO login_logs (user_id, success, timestamp)
        VALUES (?, ?, ?)
      `, [userId, success ? 1 : 0, new Date().toISOString()]);
    } catch (error) {
      log.error('Failed to log login:', error);
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    this.currentUser = null;
    return { success: true };
  }

  /**
   * Get authentication status
   */
  async getStatus() {
    return {
      authenticated: !!this.currentUser,
      user: this.currentUser,
      modelsLoaded: this.modelsLoaded
    };
  }
}

module.exports = new AuthService();