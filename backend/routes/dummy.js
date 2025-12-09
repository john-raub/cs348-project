//this is legacy code now

const pipeline = [
  ...join_pipeline,
  ...filter_pipeline,
  {
    $facet: {
      // --- PART 1: Per-session details ---
      sessions: [
        {
          $project: {
            _id: 1,
            date: 1,
            title: 1,
            "distractions.type": 1,
            "distractions.timeTaken": 1,
            "assignmentworks.time": 1,
            "assignmentworks.assignment.title": 1,
            "studies.what": 1,
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
        }
      ],

      // --- PART 2: Overall averages ---
      averages: [
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
        {
          $group: {
            _id: null,
            avgDistractionFraction: { $avg: "$distractionFraction" },
            avgAssignmentFraction: { $avg: "$assignmentFraction" },
            avgStudyFraction: { $avg: "$studyFraction" },
            avgTotalTime: { $avg: "$totalSessionTime" }
          }
        }
      ]
    }
  }
];
