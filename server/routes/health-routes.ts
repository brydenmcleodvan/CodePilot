import { Router } from 'express';
import { storage } from '../storage';
import { authenticateToken } from '../security/auth/auth-middleware';
import { requireOwnership } from '../security/auth/auth-middleware';
import { sanitizeInputs, validateWith } from '../security/utils/input-sanitization';
import { ResourceType, ResourceAction } from '../security/permissions/permission-types';
import { requirePermission } from '../security/permissions/permission-checker';
import { z } from 'zod';

const router = Router();

// Apply input sanitization to all routes
router.use(sanitizeInputs);

// Validation schemas
const healthMetricSchema = z.object({
  metricType: z.string().min(1),
  value: z.number(),
  unit: z.string().optional(),
  timestamp: z.string().optional().transform(val => val || new Date().toISOString()),
  notes: z.string().optional(),
  source: z.string().optional()
});

const medicationSchema = z.object({
  name: z.string().min(1),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  startDate: z.string().transform(val => new Date(val).toISOString()),
  endDate: z.string().optional().nullable().transform(val => val ? new Date(val).toISOString() : null),
  notes: z.string().optional(),
  prescribedBy: z.string().optional(),
  active: z.boolean().optional().default(true)
});

const symptomSchema = z.object({
  name: z.string().min(1),
  severity: z.number().min(1).max(10),
  startTime: z.string().transform(val => new Date(val).toISOString()),
  endTime: z.string().optional().nullable().transform(val => val ? new Date(val).toISOString() : null),
  notes: z.string().optional(),
  relatedCondition: z.string().optional(),
  bodyLocation: z.string().optional()
});

const appointmentSchema = z.object({
  title: z.string().min(1),
  provider: z.string().min(1),
  location: z.string().optional(),
  datetime: z.string().transform(val => new Date(val).toISOString()),
  duration: z.number().optional(), // in minutes
  notes: z.string().optional(),
  reminderTime: z.string().optional().transform(val => val ? new Date(val).toISOString() : null),
  type: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no-show']).default('scheduled')
});

/**
 * Health Metrics Routes
 */

/**
 * @route GET /metrics
 * @description Get user health metrics
 * @access Private
 */
router.get('/metrics', authenticateToken, async (req, res) => {
  try {
    const metrics = await storage.getHealthMetrics(req.user.id);
    res.json(metrics);
  } catch (error) {
    console.error('Error retrieving health metrics:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve health metrics',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @route POST /metrics
 * @description Add a new health metric
 * @access Private
 */
router.post(
  '/metrics', 
  authenticateToken,
  requirePermission(ResourceType.HEALTH_DATA, ResourceAction.CREATE),
  validateWith(healthMetricSchema),
  async (req, res) => {
    try {
      // Add userId to the metric data
      const metricData = {
        ...req.body,
        userId: req.user.id
      };
      
      const metric = await storage.addHealthMetric(metricData);
      
      res.status(201).json({
        metric,
        message: 'Health metric added successfully'
      });
    } catch (error) {
      console.error('Error adding health metric:', error);
      res.status(500).json({ 
        message: 'Failed to add health metric',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * @route GET /metrics/:id
 * @description Get a specific health metric
 * @access Private
 */
router.get(
  '/metrics/:id', 
  authenticateToken,
  requireOwnership('id', 'userId'),
  async (req, res) => {
    try {
      const metric = await storage.getHealthMetricById(parseInt(req.params.id));
      
      if (!metric) {
        return res.status(404).json({ 
          message: 'Health metric not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Verify ownership
      if (metric.userId !== req.user.id) {
        return res.status(403).json({ 
          message: 'You do not have permission to access this resource',
          code: 'PERMISSION_DENIED'
        });
      }
      
      res.json(metric);
    } catch (error) {
      console.error('Error retrieving health metric:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve health metric',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * @route DELETE /metrics/:id
 * @description Delete a health metric
 * @access Private
 */
router.delete(
  '/metrics/:id', 
  authenticateToken,
  requireOwnership('id', 'userId'),
  async (req, res) => {
    try {
      const metric = await storage.getHealthMetricById(parseInt(req.params.id));
      
      if (!metric) {
        return res.status(404).json({ 
          message: 'Health metric not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Verify ownership
      if (metric.userId !== req.user.id) {
        return res.status(403).json({ 
          message: 'You do not have permission to delete this resource',
          code: 'PERMISSION_DENIED'
        });
      }
      
      await storage.deleteHealthMetric(parseInt(req.params.id));
      
      res.json({
        message: 'Health metric deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting health metric:', error);
      res.status(500).json({ 
        message: 'Failed to delete health metric',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * Medication Routes
 */

/**
 * @route GET /medications
 * @description Get user medications
 * @access Private
 */
router.get('/medications', authenticateToken, async (req, res) => {
  try {
    const medications = await storage.getMedications(req.user.id);
    res.json(medications);
  } catch (error) {
    console.error('Error retrieving medications:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve medications',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @route POST /medications
 * @description Add a new medication
 * @access Private
 */
router.post(
  '/medications', 
  authenticateToken,
  requirePermission(ResourceType.MEDICATION, ResourceAction.CREATE),
  validateWith(medicationSchema),
  async (req, res) => {
    try {
      // Add userId to the medication data
      const medicationData = {
        ...req.body,
        userId: req.user.id
      };
      
      const medication = await storage.addMedication(medicationData);
      
      res.status(201).json({
        medication,
        message: 'Medication added successfully'
      });
    } catch (error) {
      console.error('Error adding medication:', error);
      res.status(500).json({ 
        message: 'Failed to add medication',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * @route GET /medications/:id
 * @description Get a specific medication
 * @access Private
 */
router.get(
  '/medications/:id', 
  authenticateToken,
  requireOwnership('id', 'userId'),
  async (req, res) => {
    try {
      const medication = await storage.getMedicationById(parseInt(req.params.id));
      
      if (!medication) {
        return res.status(404).json({ 
          message: 'Medication not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Verify ownership
      if (medication.userId !== req.user.id) {
        return res.status(403).json({ 
          message: 'You do not have permission to access this resource',
          code: 'PERMISSION_DENIED'
        });
      }
      
      res.json(medication);
    } catch (error) {
      console.error('Error retrieving medication:', error);
      res.status(500).json({ 
        message: 'Failed to retrieve medication',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * @route PATCH /medications/:id
 * @description Update a medication
 * @access Private
 */
router.patch(
  '/medications/:id',
  authenticateToken,
  requireOwnership('id', 'userId'),
  async (req, res) => {
    try {
      const medication = await storage.getMedicationById(parseInt(req.params.id));
      
      if (!medication) {
        return res.status(404).json({ 
          message: 'Medication not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Verify ownership
      if (medication.userId !== req.user.id) {
        return res.status(403).json({ 
          message: 'You do not have permission to update this resource',
          code: 'PERMISSION_DENIED'
        });
      }
      
      const updatedMedication = await storage.updateMedication(
        parseInt(req.params.id),
        req.body
      );
      
      res.json({
        medication: updatedMedication,
        message: 'Medication updated successfully'
      });
    } catch (error) {
      console.error('Error updating medication:', error);
      res.status(500).json({ 
        message: 'Failed to update medication',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * @route DELETE /medications/:id
 * @description Delete a medication
 * @access Private
 */
router.delete(
  '/medications/:id',
  authenticateToken,
  requireOwnership('id', 'userId'),
  async (req, res) => {
    try {
      const medication = await storage.getMedicationById(parseInt(req.params.id));
      
      if (!medication) {
        return res.status(404).json({ 
          message: 'Medication not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Verify ownership
      if (medication.userId !== req.user.id) {
        return res.status(403).json({ 
          message: 'You do not have permission to delete this resource',
          code: 'PERMISSION_DENIED'
        });
      }
      
      await storage.deleteMedication(parseInt(req.params.id));
      
      res.json({
        message: 'Medication deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting medication:', error);
      res.status(500).json({ 
        message: 'Failed to delete medication',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * Symptom Routes
 */

/**
 * @route GET /symptoms
 * @description Get user symptoms
 * @access Private
 */
router.get('/symptoms', authenticateToken, async (req, res) => {
  try {
    const symptoms = await storage.getSymptoms(req.user.id);
    res.json(symptoms);
  } catch (error) {
    console.error('Error retrieving symptoms:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve symptoms',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @route POST /symptoms
 * @description Record a new symptom
 * @access Private
 */
router.post(
  '/symptoms', 
  authenticateToken,
  requirePermission(ResourceType.SYMPTOM, ResourceAction.CREATE),
  validateWith(symptomSchema),
  async (req, res) => {
    try {
      // Add userId to the symptom data
      const symptomData = {
        ...req.body,
        userId: req.user.id
      };
      
      const symptom = await storage.addSymptom(symptomData);
      
      res.status(201).json({
        symptom,
        message: 'Symptom recorded successfully'
      });
    } catch (error) {
      console.error('Error recording symptom:', error);
      res.status(500).json({ 
        message: 'Failed to record symptom',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * Appointment Routes
 */

/**
 * @route GET /appointments
 * @description Get user appointments
 * @access Private
 */
router.get('/appointments', authenticateToken, async (req, res) => {
  try {
    const appointments = await storage.getAppointments(req.user.id);
    res.json(appointments);
  } catch (error) {
    console.error('Error retrieving appointments:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve appointments',
      code: 'SERVER_ERROR'
    });
  }
});

/**
 * @route POST /appointments
 * @description Create a new appointment
 * @access Private
 */
router.post(
  '/appointments', 
  authenticateToken,
  requirePermission(ResourceType.APPOINTMENT, ResourceAction.CREATE),
  validateWith(appointmentSchema),
  async (req, res) => {
    try {
      // Add userId to the appointment data
      const appointmentData = {
        ...req.body,
        userId: req.user.id
      };
      
      const appointment = await storage.addAppointment(appointmentData);
      
      res.status(201).json({
        appointment,
        message: 'Appointment created successfully'
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(500).json({ 
        message: 'Failed to create appointment',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * @route PATCH /appointments/:id
 * @description Update an appointment
 * @access Private
 */
router.patch(
  '/appointments/:id',
  authenticateToken,
  requireOwnership('id', 'userId'),
  async (req, res) => {
    try {
      const appointment = await storage.getAppointmentById(parseInt(req.params.id));
      
      if (!appointment) {
        return res.status(404).json({ 
          message: 'Appointment not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      // Verify ownership
      if (appointment.userId !== req.user.id) {
        return res.status(403).json({ 
          message: 'You do not have permission to update this resource',
          code: 'PERMISSION_DENIED'
        });
      }
      
      const updatedAppointment = await storage.updateAppointment(
        parseInt(req.params.id),
        req.body
      );
      
      res.json({
        appointment: updatedAppointment,
        message: 'Appointment updated successfully'
      });
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(500).json({ 
        message: 'Failed to update appointment',
        code: 'SERVER_ERROR'
      });
    }
  }
);

/**
 * Health Summary Route
 */

/**
 * @route GET /summary
 * @description Get user health summary
 * @access Private
 */
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const metrics = await storage.getHealthMetrics(req.user.id);
    const medications = await storage.getMedications(req.user.id);
    const symptoms = await storage.getSymptoms(req.user.id);
    const appointments = await storage.getAppointments(req.user.id);
    
    // Get user profile
    const user = await storage.getUser(req.user.id);
    let healthData = {};
    
    if (user?.healthData) {
      try {
        healthData = JSON.parse(user.healthData);
      } catch (error) {
        console.error('Error parsing health data:', error);
      }
    }
    
    // Create summary
    const summary = {
      metrics: {
        recent: metrics.slice(0, 5),
        count: metrics.length
      },
      medications: {
        active: medications.filter(med => med.active),
        count: medications.length
      },
      symptoms: {
        recent: symptoms.slice(0, 5),
        count: symptoms.length
      },
      appointments: {
        upcoming: appointments.filter(apt => new Date(apt.datetime) > new Date()),
        count: appointments.length
      },
      healthProfile: healthData
    };
    
    res.json(summary);
  } catch (error) {
    console.error('Error retrieving health summary:', error);
    res.status(500).json({ 
      message: 'Failed to retrieve health summary',
      code: 'SERVER_ERROR'
    });
  }
});

export default router;