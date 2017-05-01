var MongoClient = require('mongodb').MongoClient

// Connection URL
var url = 'mongodb://localhost:27017/social_net';
var stdin = process.stdin;


function run() {
  console.log("Select 1-6 for the queries, press q to exit");
  console.log("Listed after the assignment discription.");

  var collection;
  var db;

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  MongoClient.connect(url, function(err, dbConnection) {
    if (err) return console.log(err);
    db = dbConnection;
    collection = db.collection('tweets');
  });
  // on any data into stdin
  stdin.on('data', function(key) {
    // ctrl-c ( end of text )
    if (key === '\u0071') {
      console.log("Bye!");
      db.close();
      process.exit();
    }
    if (key === '\u0031') {
      query1(collection, function(err, docs) {
        console.log("How many Twitter users are in our database?");
        console.log(docs.length);
        console.log("");
        console.log("Select 1-6");
      })
    } else if (key === '\u0032') {
      query2(collection, function(err, docs) {
        console.log("Which Twitter users link the most to other Twitter users?");
        console.log(docs);
        console.log("");
        console.log("Select 1-6");
      })
    } else if (key === '\u0033') {
      query3(collection, function(err, docs) {
        console.log("Who is are the most mentioned Twitter users?");
        console.log(docs);
        console.log("");
        console.log("Select 1-6");
      })
    } else if (key === '\u0034') {
      query4(collection, function(err, docs) {
        console.log("Who are the most active Twitter users?");
        console.log(docs);
        console.log("");
        console.log("Select 1-6");
      })

    } else if (key === '\u0035') {
      query5(collection, function(err, docs) {
        console.log("Who are the five most happy?");
        console.log(docs);
        console.log("");
        console.log("Select 1-6");
      })
    } else if (key === '\u0036') {
      query6(collection, function(err, docs) {
        console.log("Who are the five most grumpy?");
        console.log(docs);
        console.log("");
        console.log("Select 1-6");
      })
    }
    process.stdout.write(key);
  });

}

// #1
function query1(collection, callback) {
  collection.distinct("user", (function(err, docs) {
    callback(null, docs)
  }))
}

// #2
function query2(collection, callback) {
  collection.aggregate(
    [{
        $match: {
          tweet: {
            $regex: new RegExp(/(@)\w+/)
          }
        }
      },
      {
        $group: {
          _id: "$user",
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 10
      }
    ], {
      allowDiskUse: true
    }
  ).toArray(function(err, docs) {
    callback(null, docs);
  });
}

// #3
function query3(collection, callback) {
  collection.aggregate(
    [{
        $match: {
          tweet: {
            $regex: new RegExp(/ @w+/)
          }
        }
      },
      {
        $project: {
          res: {
            $split: ["$tweet", " "]
          }
        }
      },
      {
        $unwind: "$res"
      },
      {
        $match: {
          res: {
            $regex: new RegExp(/(@)\w+/)
          }
        }
      },
      {
        $group: {
          _id: "$res",
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 10
      }
    ], {
      allowDiskUse: true
    }).toArray(function(err, docs) {
    callback(null, docs);
  });
}

// #4
function query4(collection, callback) {
  collection.aggregate(
    [{
        "$group": {
          "_id": "$user",
          "tweets": {
            "$sum": 1
          }
        }
      },
      {
        "$sort": {
          "tweets": -1
        }
      },
      {
        "$limit": 10
      }
    ]).toArray(function(err, docs) {
    callback(null, docs);
  });
}

// #5
function query5(collection, callback) {
  collection.aggregate([{
      $group: {
        _id: "$user",
        score: {
          $sum: "$polarity"
        },
        count: {
          $sum: 1
        }
      }
    },
    {
      $project: {
        "_id": 1,
        "count": 1,
        score: 1,
        avg: {
          $cond: {
            if: {
              $eq: ["$score", 0]
            },
            then: 0,
            else: {
              $divide: ["$count", "$score"]
            }
          }
        }
      }
    },
    {
      $sort: {
        "avg": -1,
        "count": -1
      }
    },
    {
      $limit: 5
    }
  ], {
    allowDiskUse: true
  }).toArray(function(err, docs) {
    callback(null, docs);
  });
}

// #6
function query6(collection, callback) {
  collection.aggregate([{
      $group: {
        _id: "$user",
        score: {
          $sum: "$polarity"
        },
        count: {
          $sum: 1
        }
      }
    },
    {
      $project: {
        "_id": 1,
        "count": 1,
        score: 1,
        avg: {
          $cond: {
            if: {
              $eq: ["$score", 0]
            },
            then: 0,
            else: {
              $divide: ["$count", "$score"]
            }
          }
        }
      }
    },
    {
      $sort: {
        "avg": 1,
        "count": -1
      }
    },
    {
      $limit: 5
    }
  ], {
    allowDiskUse: true
  }).toArray(function(err, docs) {
    callback(null, docs);
  });
}


run();
