// import express from 'express';
// import auth from '../middleware/auth.js';
// import Distraction from '../models/distraction.js';
// import StudySession from '../models/studysession.js';
// import mongoose from 'mongoose';
// import { Types } from 'mongoose';
// import { sanitizeString } from '../middleware/sanitize.js';
// const { ObjectId } = Types;

// const router = express.Router();

// /**
//  * Get all distractions for a study session
//  */
// router.get('/getDistractions/:sessionId', auth, async (req, res) => {
//   try {
//     const distractions = await Distraction.find({ session: req.params.sessionId });
//     res.json(distractions);
//   } catch (error) {
//     console.error('Error fetching distractions:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// router.get('/getUserDistractionTypes', auth, async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const types = await Distraction.aggregate([
//       {
//         $lookup: {
//           from: 'studysessions',
//           localField: 'session',
//           foreignField: '_id',
//           as: 'session'
//         }
//       },
//       { $unwind: '$session' },
//       { $match: { 'session.user': new ObjectId(userId) } },
//       { $group: { _id: '$type' } }, // group by distinct type field
//       { $project: { _id: 0, type: '$_id' } } // rename _id -> type
//     ]);

//     res.json(types.map(t => t.type));
//   } catch (error) {
//     console.error('Error fetching distinct distraction types:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// /**
//  * Create a new distraction entry
//  */
// router.post('/create', auth, async (req, res) => {
//   try {
//     const newDistraction = new Distraction(req.body);
//     await newDistraction.save();
//     res.status(201).json(newDistraction);
//   } catch (error) {
//     console.error('Error creating distraction:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


// /**
//  * Delete a distraction entry
//  */
// router.delete('/delete/:id', auth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Distraction.findByIdAndDelete(id);
//     res.status(204).send();
//   } catch (error) {
//     console.error('Error deleting distraction:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


// /**
//  * update a distraction entry
//  */
// router.put('/update/:id', auth, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { type, timeTaken } = req.body;
//     const foundDistraction = await Distraction.findById(id);
//     if (type) foundDistraction.type = sanitizeString(type, 50);
//     if (timeTaken) foundDistraction.timeTaken = Number(timeTaken);
//     const updatedDistraction =  await foundDistraction.save();
//     res.json(updatedDistraction);
//   } catch (error) {
//     console.error('Error updating distraction:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// export default router;


import express from 'express';
import auth from '../middleware/auth.js';
import Distraction from '../models/distraction.js';
import StudySession from '../models/studysession.js';
import mongoose from 'mongoose';
import { Types } from 'mongoose';
import { sanitizeString } from '../middleware/sanitize.js';
import { 
  validateParamId, 
  validateBody,
  toObjectId 
} from '../middleware/validators.js';

const { ObjectId } = Types;
const router = express.Router();

/**
 * GET all distractions for a specific study session
 * Protected: Requires authentication
 * Validates: sessionId must be valid ObjectId
 * Note: Verifies user owns the session
 */
router.get('/getDistractions/:sessionId', 
  auth,
  validateParamId('sessionId'),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Verify the session belongs to the user
      const studysession = await StudySession.findOne({
        _id: sessionId,
        user: userObjectId
      }).session(session);

      if (!studysession) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(404).json({ 
          message: "Study session not found or you don't have permission to view it" 
        });
      }

      const distractions = await Distraction.find({ session: sessionId }).session(session);
      res.json(distractions);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error('Error fetching distractions:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
    finally {
      await session.endSession();
    }
  }
);

/**
 * GET all unique distraction types for the logged-in user
 * Protected: Requires authentication
 * Returns: Array of distinct distraction type strings
 * Uses: MongoDB aggregation to find unique types across all user's sessions
 */
router.get('/getUserDistractionTypes', 
  auth, 
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      const types = await Distraction.aggregate([
        {
          $lookup: {
            from: 'studysessions',
            localField: 'session',
            foreignField: '_id',
            as: 'session'
          }
        },
        { $unwind: '$session' },
        { $match: { 'session.user': userObjectId } },
        { $group: { _id: '$type' } }, // group by distinct type field
        { $project: { _id: 0, type: '$_id' } } // rename _id -> type
      ]).session(session);

      res.json(types.map(t => t.type));
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error('Error fetching distinct distraction types:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
    finally {
      await session.endSession();
    }
  }
);

/**
 * POST create a new distraction entry
 * Protected: Requires authentication
 * Validates:
 *   - session: valid ObjectId, required
 *   - type: string, 1-50 chars, required (type of distraction)
 *   - timeTaken: number, 0-1440 minutes, required
 */
router.post('/create', 
  auth,
  validateBody({
    session: { 
      type: 'objectId', 
      required: true 
    },
    type: { 
      type: 'string', 
      required: true,
      minLength: 1,
      maxLength: 50,
      custom: (value) => {
        const cleaned = value.trim();
        if (cleaned.length === 0) {
          return 'type cannot be empty or whitespace only';
        }
        // Prevent NoSQL operator injection
        if (cleaned.startsWith('$')) {
          return 'type cannot start with $';
        }
        return null;
      }
    },
    timeTaken: { 
      type: 'number', 
      required: true,
      min: 0,
      max: 1440,  // 24 hours in minutes
      integer: true,
      custom: (value) => {
        if (value < 0) {
          return 'timeTaken cannot be negative';
        }
        if (value > 1440) {
          return 'timeTaken cannot exceed 24 hours (1440 minutes)';
        }
        return null;
      }
    }
  }),
  async (req, res) => {
    const sessiont = await mongoose.startSession();
    sessiont.startTransaction();
    try {
      const { session, type, timeTaken } = req.body;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Verify the session exists and belongs to the user
      const studySession = await StudySession.findOne({
        _id: session,
        user: userObjectId
      }).session(sessiont);

      if (!studySession) {
        await sessiont.abortTransaction();
        await sessiont.endSession();
        return res.status(404).json({ 
          message: "Study session not found or you don't have permission to add distractions to it" 
        });
      }

      const newDistraction = new Distraction({
        session: session,
        type: sanitizeString(type, 50),
        timeTaken: timeTaken
      });

      await newDistraction.save({ session: sessiont });
      res.status(201).json(newDistraction);
      await sessiont.commitTransaction();
    } catch (error) {
      await sessiont.abortTransaction();
      console.error('Error creating distraction:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
    finally {
      await sessiont.endSession();
    }
  }
);

/**
 * PUT update an existing distraction entry
 * Protected: Requires authentication + ownership verification
 * Validates:
 *   - id param: valid ObjectId
 *   - type: string, 1-50 chars, optional
 *   - timeTaken: number, 0-1440 minutes, optional
 */
router.put('/update/:id', 
  auth,
  validateParamId('id'),
  validateBody({
    type: { 
      type: 'string', 
      required: false,
      minLength: 1,
      maxLength: 50,
      custom: (value) => {
        if (value === undefined) return null;
        
        const cleaned = value.trim();
        if (cleaned.length === 0) {
          return 'type cannot be empty or whitespace only';
        }
        // Prevent NoSQL operator injection
        if (cleaned.startsWith('$')) {
          return 'type cannot start with $';
        }
        return null;
      }
    },
    timeTaken: { 
      type: 'number', 
      required: false,
      min: 0,
      max: 1440,
      integer: true
    }
  }),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const { type, timeTaken } = req.body;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Find the distraction entry
      const foundDistraction = await Distraction.findById(id).session(session).populate('session');

      if (!foundDistraction) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(404).json({ message: 'Distraction entry not found' });
      }

      // Verify the session belongs to the user
      if (!foundDistraction.session || foundDistraction.session.user.toString() !== userObjectId.toString()) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(403).json({ 
          message: "You don't have permission to update this distraction entry" 
        });
      }

      // Update only provided fields
      if (type !== undefined && type.trim().length > 0) {
        foundDistraction.type = sanitizeString(type, 50);
      }
      
      if (timeTaken !== undefined && timeTaken >= 0 && timeTaken <= 1440) {
        foundDistraction.timeTaken = Number(timeTaken);
      }

      const updatedDistraction = await foundDistraction.save({ session });
      res.json(updatedDistraction);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      console.error('Error updating distraction:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
    finally {
      await session.endSession();
    }
  }
);

/**
 * DELETE a distraction entry
 * Protected: Requires authentication + ownership verification
 * Validates: id param must be valid ObjectId
 */
router.delete('/delete/:id', 
  auth,
  validateParamId('id'),
  async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userObjectId = toObjectId(userId, 'userId');

      // Find the distraction entry first to verify ownership
      const distraction = await Distraction.findById(id).session(session).populate('session');

      if (!distraction) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(404).json({ message: 'Distraction entry not found' });
      }

      // Verify the session belongs to the user
      if (!distraction.session || distraction.session.user.toString() !== userObjectId.toString()) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(403).json({ 
          message: "You don't have permission to delete this distraction entry" 
        });
      }

      // Delete the distraction entry
      await Distraction.findByIdAndDelete(id).session(session);
      await session.commitTransaction();
      
      res.status(204).send();
    } catch (error) {
      await session.abortTransaction();
      console.error('Error deleting distraction:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
    finally {
      await session.endSession();
    }
  }
);

export default router;