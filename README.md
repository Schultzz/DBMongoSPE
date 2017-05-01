# Mongo SPE 

This exercise uses Mongo query, to fetch uses from a rather big dataset of 1.600.000 documents. 

The queries:

* How many Twitter users are in our database? 
* Which Twitter users link the most to other Twitter users? (Provide the top ten.) 
* Who is are the most mentioned Twitter users? (Provide the top five.) 
* Who are the most active Twitter users (top ten)? 
* Who are the five most grumpy (most negative tweets) and the most happy (most positive tweets)? (Provide five users for each group) 

## Setup

Pre-requirements
* Node is installed on your machine
* You've got the lastest Vagrant pull.

1. Clone the project from github.
2. Make sure you've got Vagrant VM is up and running with Mongo server installed (v 3.4+ is preferred)
3. Open a terminal in the cloned folder, and run the provided shell script (./download.sh)
	* It will download and import the training-data set, if allready downloaded it just import it to the running Vargrant VM. 
4. Type "npm start" in the terminal to start the CLI UI and follow further instruction.


## Results


##### How many Twitter users are in our database
```
db.tweets.distinct("user").length
```
Users:|659777
-|-

##### Which Twitter users link the most to other Twitter users?
```
db.tweets.aggregate(
[
    {$match: {tweet: { $regex: new RegExp(/(@)\w+/) } } },
    {$group:{_id:"$user",count:{$sum: 1}}},
    {$sort: {count : -1}},
    {$limit: 10}
],
{allowDiskUse: true})
```
User|Links
-|-
lost_dog|549
tweetpet|310
VioletsCRUK|251
what_bugs_u|246
tsarnick|245
SallytheShizzle|229
mcraddictal|217
Karen230683|216
keza34|221
TraceyHewins|202

##### Who is are the most mentioned Twitter users?
We were unsure how to solve this one, even when we managed to get the matched regex as a single entry (@username). Then there is no way of knowing if it is a user or a tag as (@Work). Here is our take on it anyways:

```
db.tweets.aggregate(
[
{$match: {tweet: { $regex: new RegExp(/ @w+/) } } },
{$project: { res : {$split: ["$tweet", " "] }} },
{$unwind: "$res"},
{$match: {res: { $regex: new RegExp(/(@)\w+/) } } },
{$group:{_id:"$res",count:{$sum: 1}}},
{$sort: {count : -1}}
],
{allowDiskUse: true})
```
User|Mentioned
-|-
@wossy|27
@work|23
@wildwindart|10
@wilw|10
@JuliaTSimpson|10

##### Who are the most active Twitter users?

```
db.tweets.aggregate(
[
{ "$group": {"_id":"$user", "tweets":{ "$sum":1 } }},
{ "$sort": {"tweets": -1}},
{ "$limit" : 10 }
])
```
User|Tweet count
-|-
lost_dog|549
webwoke|345
tweetpet|310
SallytheShizzle|281
VioletsCRUK|279
mcraddictal|276
tsarnick|248
what_bugs_u|246
Karen230683|238
DarkPiano|236

##### Who are the five most grumpy/happy?

```
db.tweets.aggregate(
[
{$group: {_id: "$user", score: {$sum: "$polarity"}, count: {$sum: 1}}},
{$project: {"_id": 1, "count": 1, score: 1, avg: {
    $cond: { if: { $eq: [ "$score", 0 ] }, then: 0, else: {$divide: ["$count", "$score"]} } }}},
{$sort: {"avg": -1, "count": -1}} //flip avg for grumpy.
],
{allowDiskUse: true})
```
Most happy:

User|Avg polrity
-|-
wowlew|26.5
Fanny_Ingabout|15.0
Haarlz|12.25
SANCHEZJAMIE|10.5
ggimmickgirl|10.5

Most grumpy:

User|Avg polrity|Tweets
-|-|-
lost_dog|0.0|549
tweetpet|0.0|310
TheAmazingCat|0.0|86
nova937music|0.0|67
Nathan133|0.0|51


