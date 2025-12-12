// import express from "express";
// import auth from "../middleware/auth.js";
// import Semester from "../models/semester.js";
// import StudySession from "../models/studysession.js";
// import Class from "../models/class.js";
// import Assignment from "../models/assignment.js";
// import Distraction from "../models/distraction.js";
// import AssignmentWork from "../models/assignmentwork.js";
// import Study from "../models/study.js";
// import mongoose from "mongoose";
// import { Types } from "mongoose";
// const { ObjectId } = Types;

// const router = express.Router();

// router.post("/getFilteredRecords", auth, async (req, res) => {
//     try {
//         const userId = req.user.id;
//         console.log("User ID from auth middleware:", userId);

//         const { filterClass,
//             filterAssignment,
//             filterDistractionType,
//             filterDates,
//             startDate,
//             endDate,
//             selectedClasses,
//             selectedAssignments,
//             selectedDistractionTypes 
//         } = req.body;

//         console.log("Filters received:", req.body);

//         const join_pipeline = [];

//         join_pipeline.push(
//             {$lookup: {
//                 from: "users",
//                 localField: "user",
//                 foreignField: "_id",
//                 as: "user"
//             }},
//             {$match: { "user._id": new ObjectId(userId) }}
//         );

//         join_pipeline.push(
//             {$lookup: {
//                 from: "distractions",
//                 localField: "_id",
//                 foreignField: "session",
//                 as: "distractions"
//             }}
//         );

//         join_pipeline.push(
//             {$lookup: {
//                 from: "assignmentworks",
//                 localField: "_id",
//                 foreignField: "session",
//                 as: "assignmentworks",
//                 pipeline: [
//                     {$lookup: {
//                         from: "assignments",
//                         localField: "assignment",
//                         foreignField: "_id",
//                         as: "assignment",
//                         pipeline:[
//                             {$lookup: {
//                                 from: "classes",
//                                 localField: "class",
//                                 foreignField: "_id",
//                                 as: "class"
//                             }},
//                             {$unwind: "$class"},
//                         ]
//                     }},
//                     {$unwind: "$assignment"},
//                 ]
//             }}
//         );

//         join_pipeline.push(
//             {$lookup: {
//                 from: "studies",
//                 localField: "_id",
//                 foreignField: "session",
//                 as: "studies"
//             }}
//         );

//         const filter_pipeline = [];

//         if (filterClass && filterAssignment) {
//         const classIds = selectedClasses.map(c => new ObjectId(c._id));
//         const assignmentIds = selectedAssignments.map(a => new ObjectId(a._id));

//         filter_pipeline.push({
//             $match: {
//             $and: [
//                 { "assignmentworks.assignment.class._id": { $in: classIds } },
//                 { "assignmentworks.assignment._id": { $in: assignmentIds } }
//             ]
//             }
//         });
//         }

//         else if (filterClass)
//         {
//             const classIds = selectedClasses.map(c => new ObjectId(c._id));
//             filter_pipeline.push(
//                 {$match: {
//                     "assignmentworks.assignment.class._id": { $in: classIds }
//                 }}
//             );
//         }

//         else if (filterAssignment)
//         {
//             const assignmentIds = selectedAssignments.map(a => new ObjectId(a._id));
//             filter_pipeline.push(
//                 {$match: {
//                     "assignmentworks.assignment._id": { $in: assignmentIds }
//                 }}
//             );
//         }

//         if (filterDistractionType)
//         {
//             filter_pipeline.push(
//                 {$match: {
//                     "distractions.type": { $in: selectedDistractionTypes}
//                 }}
//             );
//         }

//         if (filterDates)
//         {
//             filter_pipeline.push(
//                 {$match: {
//                     "datetime": {
//                         $gte: new Date(startDate),
//                         $lte: new Date(endDate)
//                     }
//                 }}
//             );
//         }

//         const project_pipeline = [];

//         project_pipeline.push(
//             {$project: {
//                 _id: 1,
//                 datetime: 1,
//                 title: 1,
//                 "distractions.type": 1,
//                 "distractions.timeTaken": 1,
//                 "assignmentworks.time": 1,
//                 "assignmentworks.assignment._id": 1,
//                 "assignmentworks.assignment.title": 1,
//                 "assignmentworks.assignment.class._id": 1,
//                 "assignmentworks.assignment.class.classId": 1,
//                 "assignmentworks.assignment.class.professor": 1,
//                 "studies.what": 1,
//                 "studies.understanding": 1,
//                 "studies.time": 1,

//                 totalDistractionTime: { $sum: "$distractions.timeTaken" },
//                 totalAssignmentTime: { $sum: "$assignmentworks.time" },
//                 totalStudyTime: { $sum: "$studies.time" },

//                 totalSessionTime: {
//                 $add: [
//                     { $sum: "$distractions.timeTaken" },
//                     { $sum: "$assignmentworks.time" },
//                     { $sum: "$studies.time" }
//                 ]
//                 },

//                 distractionFraction: {
//                 $cond: [
//                     { $gt: [
//                     { $add: [
//                         { $sum: "$distractions.timeTaken" },
//                         { $sum: "$assignmentworks.time" },
//                         { $sum: "$studies.time" }
//                     ] },
//                     0
//                     ] },
//                     {
//                     $divide: [
//                         { $sum: "$distractions.timeTaken" },
//                         {
//                         $add: [
//                             { $sum: "$distractions.timeTaken" },
//                             { $sum: "$assignmentworks.time" },
//                             { $sum: "$studies.time" }
//                         ]
//                         }
//                     ]
//                     },
//                     0
//                 ]
//                 },
                
//                 assignmentFraction: {
//                 $cond: [
//                     { $gt: [
//                     { $add: [
//                         { $sum: "$distractions.timeTaken" },
//                         { $sum: "$assignmentworks.time" },
//                         { $sum: "$studies.time" }
//                     ] },
//                     0
//                     ] },
//                     {
//                     $divide: [
//                         { $sum: "$assignmentworks.time" },
//                         {
//                         $add: [
//                             { $sum: "$distractions.timeTaken" },
//                             { $sum: "$assignmentworks.time" },
//                             { $sum: "$studies.time" }
//                         ]
//                         }
//                     ]
//                     },
//                     0
//                 ]
//                 },
                
//                 studyFraction: {
//                 $cond: [
//                     { $gt: [
//                     { $add: [
//                         { $sum: "$distractions.timeTaken" },
//                         { $sum: "$assignmentworks.time" },
//                         { $sum: "$studies.time" }
//                     ] },
//                     0
//                     ] },
//                     {
//                     $divide: [
//                         { $sum: "$studies.time" },
//                         {
//                         $add: [
//                             { $sum: "$distractions.timeTaken" },
//                             { $sum: "$assignmentworks.time" },
//                             { $sum: "$studies.time" }
//                         ]
//                         }
//                     ]
//                     },
//                     0
//                 ]
//                 }
//             }},
//             { $sort: { datetime: 1 }}
//         );

//         const aggregate_pipeline = [];

//         aggregate_pipeline.push(
//             { $project: {
//                 totalDistractionTime: { $sum: "$distractions.timeTaken" },
//                 totalAssignmentTime: { $sum: "$assignmentworks.time" },
//                 totalStudyTime: { $sum: "$studies.time" },
//                 totalSessionTime: {
//                 $add: [
//                     { $sum: "$distractions.timeTaken" },
//                     { $sum: "$assignmentworks.time" },
//                     { $sum: "$studies.time" }
//                 ]
//                 }
//             }},
//             {
//             $group: { _id: null,
//                 AllDistractionTime: { $sum: "$totalDistractionTime" },
//                 AllAssignmentTime: { $sum: "$totalAssignmentTime" },
//                 AllStudyTime: { $sum: "$totalStudyTime" },
//                 AllSessionTime: { $sum: "$totalSessionTime" }
//             }},
//             {
//             $project: {
//                 _id: 0,
//                 AllDistractionTime: 1,
//                 AllAssignmentTime: 1,
//                 AllStudyTime: 1,
//                 AllSessionTime: 1,

//                 distractionFraction: {
//                 $cond: [
//                     { $gt: ["$AllSessionTime", 0] },
//                     { $divide: ["$AllDistractionTime", "$AllSessionTime"] },
//                     0
//                 ]
//                 },
//                 assignmentFraction: {
//                 $cond: [
//                     { $gt: ["$AllSessionTime", 0] },
//                     { $divide: ["$AllAssignmentTime", "$AllSessionTime"] },
//                     0
//                 ]
//                 },
//                 studyFraction: {
//                 $cond: [
//                     { $gt: ["$AllSessionTime", 0] },
//                     { $divide: ["$AllStudyTime", "$AllSessionTime"] },
//                     0
//                 ]
//                 }
//             }
//             }

//         );

//         /*
//         const productivity_pipeline = [
//         {
//             $project: {
//             _id: 1,
//             title: 1,
//             date: 1,
//             totalDistractionTime: { $sum: "$distractions.timeTaken" },
//             totalAssignmentTime: { $sum: "$assignmentworks.time" },
//             totalStudyTime: { $sum: "$studies.time" },
//             totalSessionTime: {
//                 $add: [
//                 { $sum: "$distractions.timeTaken" },
//                 { $sum: "$assignmentworks.time" },
//                 { $sum: "$studies.time" }
//                 ]
//             }
//             }
//         },
//         {
//             $addFields: {
//             distractionFraction: {
//                 $cond: [
//                 { $gt: ["$totalSessionTime", 0] },
//                 { $divide: ["$totalDistractionTime", "$totalSessionTime"] },
//                 0
//                 ]
//             }
//             }
//         },
//         {
//             $facet: {
//             mostProductive: [
//                 { $sort: { distractionFraction: 1 } }, // lowest first
//                 { $limit: 1 }
//             ],
//             leastProductive: [
//                 { $sort: { distractionFraction: -1 } }, // highest first
//                 { $limit: 1 }
//             ]
//             }
//         }
//         ];
//         */


//         const pipeline = [
//             ...join_pipeline,
//             ...filter_pipeline,
//             {
//                 $facet: {
//                 sessions: project_pipeline,
//                 overall: aggregate_pipeline
//                 }
//             }
//         ];

//         const records = await StudySession.aggregate(pipeline);
//         console.log(JSON.stringify(records, null, 2));



//         res.status(200).json(records);
//     } catch (error) {
//         console.error("Error fetching filtered records:", error);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });

// export default router;




import express from "express";
import auth from "../middleware/auth.js";
import Semester from "../models/semester.js";
import StudySession from "../models/studysession.js";
import Class from "../models/class.js";
import Assignment from "../models/assignment.js";
import Distraction from "../models/distraction.js";
import AssignmentWork from "../models/assignmentwork.js";
import Study from "../models/study.js";
import mongoose from "mongoose";
import { Types } from "mongoose";
import { 
  validateBody, 
  validateDateRange,
  sanitizeObjectIdArray,
  sanitizeStringArray,
  toObjectId 
} from "../middleware/validators.js";

const { ObjectId } = Types;
const router = express.Router();

/**
 * POST get filtered study session records with aggregated statistics
 * Protected: Requires authentication
 * Validates: All filter inputs including arrays, dates, and boolean flags
 * 
 * This is the most complex route - it builds MongoDB aggregation pipelines
 * based on user-provided filters. Heavy validation is critical here.
 */
router.post("/getFilteredRecords", 
  auth,
  validateBody({
    // Boolean filter flags
    filterClass: { type: 'boolean', required: true },
    filterAssignment: { type: 'boolean', required: true },
    filterDistractionType: { type: 'boolean', required: true },
    filterDates: { type: 'boolean', required: true },
    
    // Date range (validated separately below)
    startDate: { type: 'date', required: false },
    endDate: { type: 'date', required: false },
    
    // Arrays of selections (will be validated manually for complex structure)
    selectedClasses: { 
      type: 'array', 
      required: false
    },
    selectedAssignments: { 
      type: 'array', 
      required: false
    },
    selectedDistractionTypes: { 
      type: 'array', 
      required: false,
      items: 'string',  // Each must be a string
      maxLength: 50
    }
  }),
  validateDateRange('startDate', 'endDate'),
  async (req, res) => {
    try {
      const userId = req.user.id;
      console.log("User ID from auth middleware:", userId);

      const { 
        filterClass,
        filterAssignment,
        filterDistractionType,
        filterDates,
        startDate,
        endDate,
        selectedClasses,
        selectedAssignments,
        selectedDistractionTypes 
      } = req.body;

      console.log("Filters received:", {
        filterClass,
        filterAssignment,
        filterDistractionType,
        filterDates,
        hasClasses: !!selectedClasses,
        hasAssignments: !!selectedAssignments,
        hasTypes: !!selectedDistractionTypes
      });

      // Sanitize and validate complex arrays
      let classIds = [];
      let assignmentIds = [];
      let distractionTypes = [];

      // Validate and sanitize selected classes
      if (filterClass && selectedClasses) {
        try {
          classIds = sanitizeObjectIdArray(selectedClasses, 'selectedClasses');
        } catch (err) {
          return res.status(400).json({ 
            message: `Invalid selectedClasses: ${err.message}` 
          });
        }
      }

      // Validate and sanitize selected assignments
      if (filterAssignment && selectedAssignments) {
        try {
          assignmentIds = sanitizeObjectIdArray(selectedAssignments, 'selectedAssignments');
        } catch (err) {
          return res.status(400).json({ 
            message: `Invalid selectedAssignments: ${err.message}` 
          });
        }
      }

      // Validate and sanitize distraction types
      if (filterDistractionType && selectedDistractionTypes) {
        try {
          distractionTypes = sanitizeStringArray(
            selectedDistractionTypes, 
            'selectedDistractionTypes', 
            50
          );
        } catch (err) {
          return res.status(400).json({ 
            message: `Invalid selectedDistractionTypes: ${err.message}` 
          });
        }
      }

      // Convert userId to ObjectId safely
      const userObjectId = toObjectId(userId, 'userId');

      // Build the aggregation pipeline
      const join_pipeline = [];

      // Join with users and filter by current user
      join_pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
          }
        },
        {
          $match: { "user._id": userObjectId }
        }
      );

      // Join with distractions
      join_pipeline.push(
        {
          $lookup: {
            from: "distractions",
            localField: "_id",
            foreignField: "session",
            as: "distractions"
          }
        }
      );

      // Join with assignment works (and nested assignments/classes)
      join_pipeline.push(
        {
          $lookup: {
            from: "assignmentworks",
            localField: "_id",
            foreignField: "session",
            as: "assignmentworks",
            pipeline: [
              {
                $lookup: {
                  from: "assignments",
                  localField: "assignment",
                  foreignField: "_id",
                  as: "assignment",
                  pipeline: [
                    {
                      $lookup: {
                        from: "classes",
                        localField: "class",
                        foreignField: "_id",
                        as: "class"
                      }
                    },
                    { $unwind: "$class" }
                  ]
                }
              },
              { $unwind: "$assignment" }
            ]
          }
        }
      );

      // Join with studies
      join_pipeline.push(
        {
          $lookup: {
            from: "studies",
            localField: "_id",
            foreignField: "session",
            as: "studies"
          }
        }
      );

      // Build filter pipeline based on user selections
      const filter_pipeline = [];

      // Filter by class AND assignment (both must match)
      if (filterClass && filterAssignment && classIds.length > 0 && assignmentIds.length > 0) {
        filter_pipeline.push({
          $match: {
            $and: [
              { "assignmentworks.assignment.class._id": { $in: classIds } },
              { "assignmentworks.assignment._id": { $in: assignmentIds } }
            ]
          }
        });
      }
      // Filter by class only
      else if (filterClass && classIds.length > 0) {
        filter_pipeline.push({
          $match: {
            "assignmentworks.assignment.class._id": { $in: classIds }
          }
        });
      }
      // Filter by assignment only
      else if (filterAssignment && assignmentIds.length > 0) {
        filter_pipeline.push({
          $match: {
            "assignmentworks.assignment._id": { $in: assignmentIds }
          }
        });
      }

      // Filter by distraction type
      if (filterDistractionType && distractionTypes.length > 0) {
        filter_pipeline.push({
          $match: {
            "distractions.type": { $in: distractionTypes }
          }
        });
      }

      // Filter by date range
      if (filterDates && startDate && endDate) {
        filter_pipeline.push({
          $match: {
            "datetime": {
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            }
          }
        });
      }

      // Project and calculate statistics for each session
      const project_pipeline = [];
      project_pipeline.push(
        {
          $project: {
            _id: 1,
            datetime: 1,
            title: 1,
            "distractions.type": 1,
            "distractions.timeTaken": 1,
            "assignmentworks.time": 1,
            "assignmentworks.assignment._id": 1,
            "assignmentworks.assignment.title": 1,
            "assignmentworks.assignment.class._id": 1,
            "assignmentworks.assignment.class.classId": 1,
            "assignmentworks.assignment.class.professor": 1,
            "studies.what": 1,
            "studies.understanding": 1,
            "studies.time": 1,

            totalDistractionTime: { $sum: "$distractions.timeTaken" },
            totalAssignmentTime: { $sum: "$assignmentworks.time" },
            totalStudyTime: { $sum: "$studies.time" },

            totalSessionTime: {
              $add: [
                { $sum: "$distractions.timeTaken" },
                { $sum: "$assignmentworks.time" },
                { $sum: "$studies.time" }
              ]
            },

            distractionFraction: {
              $cond: [
                { 
                  $gt: [
                    { 
                      $add: [
                        { $sum: "$distractions.timeTaken" },
                        { $sum: "$assignmentworks.time" },
                        { $sum: "$studies.time" }
                      ] 
                    },
                    0
                  ] 
                },
                {
                  $divide: [
                    { $sum: "$distractions.timeTaken" },
                    {
                      $add: [
                        { $sum: "$distractions.timeTaken" },
                        { $sum: "$assignmentworks.time" },
                        { $sum: "$studies.time" }
                      ]
                    }
                  ]
                },
                0
              ]
            },
            
            assignmentFraction: {
              $cond: [
                { 
                  $gt: [
                    { 
                      $add: [
                        { $sum: "$distractions.timeTaken" },
                        { $sum: "$assignmentworks.time" },
                        { $sum: "$studies.time" }
                      ] 
                    },
                    0
                  ] 
                },
                {
                  $divide: [
                    { $sum: "$assignmentworks.time" },
                    {
                      $add: [
                        { $sum: "$distractions.timeTaken" },
                        { $sum: "$assignmentworks.time" },
                        { $sum: "$studies.time" }
                      ]
                    }
                  ]
                },
                0
              ]
            },
            
            studyFraction: {
              $cond: [
                { 
                  $gt: [
                    { 
                      $add: [
                        { $sum: "$distractions.timeTaken" },
                        { $sum: "$assignmentworks.time" },
                        { $sum: "$studies.time" }
                      ] 
                    },
                    0
                  ] 
                },
                {
                  $divide: [
                    { $sum: "$studies.time" },
                    {
                      $add: [
                        { $sum: "$distractions.timeTaken" },
                        { $sum: "$assignmentworks.time" },
                        { $sum: "$studies.time" }
                      ]
                    }
                  ]
                },
                0
              ]
            }
          }
        },
        { $sort: { datetime: 1 } }
      );

      // Aggregate overall statistics across all sessions
      const aggregate_pipeline = [];
      aggregate_pipeline.push(
        { 
          $project: {
            totalDistractionTime: { $sum: "$distractions.timeTaken" },
            totalAssignmentTime: { $sum: "$assignmentworks.time" },
            totalStudyTime: { $sum: "$studies.time" },
            totalSessionTime: {
              $add: [
                { $sum: "$distractions.timeTaken" },
                { $sum: "$assignmentworks.time" },
                { $sum: "$studies.time" }
              ]
            }
          }
        },
        {
          $group: { 
            _id: null,
            AllDistractionTime: { $sum: "$totalDistractionTime" },
            AllAssignmentTime: { $sum: "$totalAssignmentTime" },
            AllStudyTime: { $sum: "$totalStudyTime" },
            AllSessionTime: { $sum: "$totalSessionTime" }
          }
        },
        {
          $project: {
            _id: 0,
            AllDistractionTime: 1,
            AllAssignmentTime: 1,
            AllStudyTime: 1,
            AllSessionTime: 1,

            distractionFraction: {
              $cond: [
                { $gt: ["$AllSessionTime", 0] },
                { $divide: ["$AllDistractionTime", "$AllSessionTime"] },
                0
              ]
            },
            assignmentFraction: {
              $cond: [
                { $gt: ["$AllSessionTime", 0] },
                { $divide: ["$AllAssignmentTime", "$AllSessionTime"] },
                0
              ]
            },
            studyFraction: {
              $cond: [
                { $gt: ["$AllSessionTime", 0] },
                { $divide: ["$AllStudyTime", "$AllSessionTime"] },
                0
              ]
            }
          }
        }
      );

      // Combine all pipeline stages with facet for parallel execution
      const pipeline = [
        ...join_pipeline,
        ...filter_pipeline,
        {
          $facet: {
            sessions: project_pipeline,
            overall: aggregate_pipeline
          }
        }
      ];

      // Execute the aggregation
      const records = await StudySession.aggregate(pipeline);
      console.log("Aggregation completed successfully");

      res.status(200).json(records);
    } catch (error) {
      console.error("Error fetching filtered records:", error);
      res.status(500).json({ 
        message: "Server error", 
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  }
);

export default router;