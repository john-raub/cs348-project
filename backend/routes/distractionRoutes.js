import express from 'express';
import auth from '../middleware/auth.js';
import Distraction from '../models/distraction.js';

const router = express.Router();

/**
 * Get all distractions for a study session
 */
router.get('/getDistractions/:sessionId', auth, async (req, res) => {
  try {
    const distractions = await Distraction.find({ session: req.params.sessionId });
    res.json(distractions);
  } catch (error) {
    console.error('Error fetching distractions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


/**
 * Create a new distraction entry
 */
router.post('/create', auth, async (req, res) => {
  try {
    const newDistraction = new Distraction(req.body);
    await newDistraction.save();
    res.status(201).json(newDistraction);
  } catch (error) {
    console.error('Error creating distraction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


/**
 * Delete a distraction entry
 */
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await Distraction.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting distraction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


/**
 * update a distraction entry
 */
router.put('/update/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, timeTaken } = req.body;
    const foundDistraction = await Distraction.findById(id);
    if (type) foundDistraction.type = type;
    if (timeTaken) foundDistraction.timeTaken = timeTaken;
    const updatedDistraction =  await foundDistraction.save();
    res.json(updatedDistraction);
  } catch (error) {
    console.error('Error updating distraction:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;