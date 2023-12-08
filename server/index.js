/**
 * Required modules
 */
const express = require('express'); // Import the express module
const fs = require('fs'); // Import the file system module
const cors = require('cors'); // Import the cors module
const storage = require('node-storage'); // Import the node-storage module

/**
 * Initialize express object and apiRouter
 */
const app = express(); // Initialize the express object
const apiRouter = express.Router(); // Initialize the apiRouter

/**
 * Set the port number
 */
const port = process.env.PORT || 3000; // Set the port number to 3000

/**
 * Connect to the front-end
 */
app.use(express.static("client")); // Connect to the front-end
app.use(cors()); // Use cors

/**
 * Install apiRouter at /api
 */
app.use('/api',apiRouter); // Install the apiRouter at /api

/**
 * Parse body data as JSON
 */
apiRouter.use(express.json()); // Parse body data as JSON

/**
 * Listen over port
 */
app.listen(port,()=>{
    console.log(`Listening on port ${port}`) // Listen over port
});


/**
 * Load JSON data
 */
const path = require('path'); // Import the path module


app.use(express.static(path.join(__dirname, '..', 'client'))); // Connect to the front-ends






//JSON objects -> point to current directory
superHeroInfo = readJSON("../superhero_info.json");
superHeroPowers = readJSON("../superhero_powers.json");
favouriteLists = loadFavouritesLists();


// Helper function to create a regex pattern that allows for up to two mismatches
function createFuzzyMatchPattern(str) {
    // Escape regex special characters in string
    str = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const maxMismatches = 5;
    let patterns = [str];  // Start with the exact string

    // Function to recursively replace characters with '.'
    function buildPattern(s, mismatches, startIndex) {
        if (mismatches > maxMismatches) return;

        for (let i = startIndex; i < s.length; i++) {
            let pattern = s.substring(0, i) + '.' + s.substring(i + 1);
            patterns.push(pattern);
            buildPattern(pattern, mismatches + 1, i + 1);  // Recurse with one more mismatch
        }
    }

    buildPattern(str, 0, 0);

    // Deduplicate patterns
    patterns = [...new Set(patterns)];

    // Join the patterns with '|', meaning "or" in regex
    return new RegExp(patterns.join('|'), 'i');
}





/*Endpoints for web app */


//search end point
apiRouter.get("/superheroes/search", async (req, res) => {
    // Original parameters
    let n = parseInt(req.query.n) || 10;
    let field = req.query.field;
    let pattern = req.query.pattern;

    // Additional parameters from the first API
    let nameField = req.query.name;
    let raceField = req.query.race;
    let powerField = req.query.power;
    let publisherField = req.query.publisher;

    // Construct query object
    const query = {};

    if (field && pattern) {
        // Replace whitespace with a regex that matches any number of whitespace characters
        pattern = pattern.replace(/\s+/g, '\\s*');
        query[field] = createFuzzyMatchPattern(pattern);
    }

    // Adding functionality from the first API
    if(nameField && nameField != "empty") query.name = new RegExp(nameField, 'i');
    if(raceField && raceField != "empty") query.race = new RegExp(raceField, 'i');
    if(publisherField && publisherField != "empty") query.publisher = new RegExp(publisherField, 'i');

    // For the power field, similar logic as in the first API
    
    
    if (powerField && powerField != "empty") {
        // ... existing code to find maxSimilarity.power ...
        powerField = powerField.replace(/\s+/g, '\\s*');
        query[`Powers.${maxSimilarity.power}`] = createFuzzyMatchPattern(powerField);
    }

    try {
        // Perform the search with the constructed query
        let results = (Object.keys(query).length === 0) ? await Hero.find().limit(n) : await Hero.find(query).limit(n);

        let heroes = results.map(hero => hero); // Simplified from the original forEach loop
        res.send(heroes);
    } catch (err) {
        console.log(err);
        res.status(404).send("No matches found");
    }
});





//get content from list of ids
apiRouter.get("/superheroes/content",(req,res)=>{
    ids = req.body.ids; //[array of ids] 
    heroObjList = [];
    //if ids properly sent
    if(ids){
        //iterate thru ids, add object containing info and powers of each corresponding her to returned list
        for(let i=0;i<ids.length;i++){
            heroObjList.push({
                info:getHeroById(list[i]),
                powers: getPowers(list[i])
            });
        }
        res.send(heroObjList);
    }
    else{
        res.status(404).send("List of that name was not found");
    }
});

//Get superhero with matching ID (#1)
apiRouter.get("/superheroes/:id",(req,res)=>{
    const heroID = parseInt(req.params.id);
    //retrieve hero
    hero = getHeroById(heroID);
    if(hero){
        res.send(hero);
    }
    else{
        res.status(404).send(`No hero with id ${heroID} was found`);
    }
});

//Get publishers (#3)
apiRouter.get("/publishers",(req,res)=>{
    //retrieve and send publishers
    publishers = getPublishers()
    if(publishers){
        res.send(publishers)
    }
    else{
        res.status(404).send("Publishers not found");
    }
}
);

//Get all powers for a given ID (#2)
apiRouter.get("/superheroes/:id/powers",(req,res)=>{
    const heroID = parseInt(req.params.id);
    powers = getPowers(heroID);
    if(powers){
        res.send(powers)
    }
    else{
        res.status(404).send(`No hero with id ${heroID} was found`);
    }
});


//Create a new list (#5)
apiRouter.post("/lists",(req,res)=>{
    //body - object with only name property
    let body = req.body;
    //if proper body sent
    if (body.hasOwnProperty("name") && body.hasOwnProperty("public") && body.hasOwnProperty("description")) {
        let listName = body.name;
        let isPublic = body.public;
        let description = body.description;
        taken = favouriteLists.find(l=>l.name===listName);
        //if not taken, create list and return it
        if(!taken){
            createList(listName, isPublic, description);
            res.send(getList(listName));
            console.log("List created"+listName+isPublic+description);
        }
        //else send error code
        else{
            //error code, taken name
            res.status(403).send("Forbidden: list name already taken");
        }
    }
    //if body not recieved properly
    else{
       //error code 
       res.status(400).send("Bad request: list name not recieved");
    }
    console.log("List created"+listName+isPublic+description);
});





///////////////////////////////////search all
// Endpoint to search across all fields
apiRouter.get("/superheroes/search/all", (req, res) => {
    const pattern = req.query.pattern.toLowerCase();
    const n = parseInt(req.query.n, 10);

    // Function to search across all fields
    const allFieldSearch = (hero, pattern) => {
        return Object.values(hero.info).some(value => String(value).toLowerCase().includes(pattern)) ||
               Object.values(hero.powers).some(value => String(value).toLowerCase().includes(pattern));
    };

    // Filter superheroes based on the search pattern across all fields
    const foundHeroes = heroData.filter(hero => allFieldSearch(hero, pattern));
    
    // Debugging: Log the first few found heroes
    console.log("Found Heroes Sample:", foundHeroes.slice(0, 3));

    // Limit the results if 'n' is provided
    const limitedResults = n ? foundHeroes.slice(0, n) : foundHeroes;

    // Debugging: Log the response being sent
    console.log("Response Sample:", limitedResults.slice(0, 3));

    res.json(limitedResults);
});







//Save a hero's id to an existing list (#6)
apiRouter.put("/lists/:name",(req,res)=>{
    listName = req.params.name;
    //object of ids is an array of hero ids [12,43,32,etc..]
    id = req.body.id;
    console.log(id);
    //if list is retrieved
    if(getList(listName)){
        //if ids were passed,save to list
        //if not, just save to JSON file
        if(id){
            addToList(id,listName);
            console.log(getList(listName))
        }
        saveFavouritesLists();
        res.json("Success")
    }
    else{
        res.status(404).send("List of that name not found")
    }
});

//get a list of hero ids from a list
apiRouter.get("/lists/:name/ids",(req,res)=>{
    const listName = req.params.name;

    //reserved word to reuse the end point (input validation will disallow this to name to be used)
    if(listName!="populateDropDown"){
        //retrieve list of given name
        list = getList(listName).list;
        if(list){
            res.send(list);
        }
        else{
            res.status(404).send("List of that name was not found");
        }
    }
    //if populateDropDown
    else{
        //generate list of list names and return it
        listNames = [];
        for(let i=0;i<favouriteLists.length;i++){
            listNames.push(favouriteLists[i].name);
        }
        res.send(listNames);
    }
});

// Function to calculate the Levenshtein distance
// Helper function to calculate the Levenshtein distance
function levenshteinDistance(a, b) {
    const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1));
  
    for (let i = 0; i <= a.length; i++) {
      for (let j = 0; j <= b.length; j++) {
        if (i == 0) dp[i][j] = j;
        else if (j == 0) dp[i][j] = i;
        else if (a[i - 1] == b[j - 1]) dp[i][j] = dp[i - 1][j - 1];
        else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  
    return dp[a.length][b.length];
  }
  
  


const stringSimilarity = require('string-similarity');

apiRouter.get("/superheroes/search", async (req, res) => {
    // ... existing code ...

    // Adjust the query based on soft-matching requirements
    if (nameField && nameField !== "empty") {
        query.name = { $regex: new RegExp(nameField.trim(), 'i') };
    }
    if (raceField && raceField !== "empty") {
        query.race = { $regex: new RegExp(raceField.trim(), 'i') };
    }
    if (publisherField && publisherField !== "empty") {
        query.publisher = { $regex: new RegExp(publisherField.trim(), 'i') };
    }
    try {
        // Retrieve all potential matches from the database
        let potentialMatches = await Hero.find(query);

        // Filter out the results based on soft-matching criteria
        let matches = potentialMatches.filter(hero => {
            // Apply the Levenshtein distance function
            if (nameField && nameField !== "empty") {
                const distance = levenshteinDistance(hero.name.toLowerCase(), nameField.toLowerCase());
                if (distance > 2) return false; // If distance is more than 2, it's not a match.
            }
            if (raceField && raceField !== "empty") {
                const distance = levenshteinDistance(hero.race.toLowerCase(), raceField.toLowerCase());
                if (distance > 2) return false; // Same check for race.
            }
            // ... (apply same logic for other fields like 'powerField' and 'publisherField') ...

            return true; // If all checks pass, it's a match.
        });

        // Limit the results based on the provided 'n' value
        matches = matches.slice(0, n);

        res.send(matches);
    } catch (err) {
        console.log(err);
        res.status(404).send("No matches found");
    }
});





//get a list of heroes and their content
apiRouter.get("/lists/:name/content",(req,res)=>{

    const listName = req.params.name;
    //get list
    list = getList(listName).list;
    heroObjList = [];

    if(list){
        //iterate thru list
        for(let i=0;i<list.length;i++){
            //push object of {heroInfo, heroPowers} to heroObjList
            heroObjList.push({
                info:getHeroById(list[i]),
                powers: getPowers(list[i])
            });
        }
        res.send(heroObjList);
    }
    //send error code if list not found
    else{
        res.status(404).send("List of that name was not found");
    }
});

//delete a list with a given name
apiRouter.delete("/lists/:name",(req,res)=>{
    const listName = req.params.name;
    console.log(listName);
    list = getList(listName);
    //if list found
    if(list){
        //delete list, send status
        deleteList(listName);
        res.status(204).send("List successfully deleted");
    }
    else{
        res.status(404).send("List of that name was not found");
    }
    saveFavouritesLists();
});

//remove a superhero from a given list
apiRouter.delete("/lists/:name/:id",(req,res)=>{
    const listName = req.params.name;
    const id = parseInt(req.params.id);
    

    list = getList(listName).list;
    
    //if list and hero found
    console.log(list,getHeroById(id));
    if(list && getHeroById(id)){
        //remove from list
        removed = removeFromList(id,listName);
        if(removed){
            res.status(200).json("Id successfully removed from list");
        }
        else{
            res.status(404).json("Item not found in list");
        }
    }
    else{
        res.status(404).send("List of that name was not found");
    }
    saveFavouritesLists();
});




/*Backend functions*/

//to read the JSON objects from their files into JS objects
function readJSON(filePath){
    try{
        const data = fs.readFileSync(filePath,'utf8');
        return JSON.parse(data)
    }catch(error){
        console.log(error)
    }
}

//returns the hero with the id argument
function getHeroById(id){
    //find hero with matching id
    return superHeroInfo.find(s=>s.id===id);
}

//Get powers for a given hero
function getPowers(id){
    //get hero
    hero = getHeroById(id);
    heroName = hero.name;
    //return hero with matching name
    powers = superHeroPowers.find(s=>s.hero_names===heroName);
    return powers;
}

//returns all unique publishers in superHeroInfo
function getPublishers(){
    //set of unique values of publishers into an array
    return uniquePublishers = Array.from(new Set(superHeroInfo.map(superhero=>superhero.Publisher)))
}

//Query the JSON files
function search(field,pattern,n=0){

    pattern = pattern.toLowerCase();
    foundHeroes = [];
    //if powers are being searched
    if(field=="Powers"){
        //filter powers
        matches = superHeroPowers.filter((h)=>{
            for(const power in h){
                //if power contains pattern and is true, return
                if(power.toLowerCase()==pattern && h[power]==="True"){
                    return true;
                }
            }
            return false;
        });
        //for all matches, get corresponding hero info
        for(let i=0;i<matches.length;i++){
            foundHeroes.push({
                info: superHeroInfo.find(s=>s.name===matches[i].hero_names),
                powers:matches[i]
            })
        }
    }
    else{
        //find heroes whose attribute of type field includes pattern
        matches = superHeroInfo.filter((h)=>{
            switch(field){
                case "Gender":
                    //return true only if matches perfectly (user has to search male or female)
                    return (h["Gender"].toLowerCase()===String(pattern).toLowerCase())
                case "Weight":
                    //only check if pattern is a number (not NaN, double negative I guess)
                    if(!isNaN(pattern)){
                        return (h["Weight"]===pattern);
                    }
                case "Height":
                    if(!isNaN(pattern)){
                        return (h["Height"]===pattern);
                    }
                default:
                    pattern = String(pattern).toLowerCase();
                    val = h[field].toLowerCase();
                    return (val.includes(pattern))
            }
        });
        //iterate thru matches, return content including corresponding powers
        for(let i=0;i<matches.length;i++){
            foundHeroes.push({
                info:matches[i],
                powers:getPowers(matches[i].id)
            });
        }

    }
    //if n is given or n is less than the number of matches
    if(n!=0 && n<matches.length){
        return foundHeroes.slice(0,n)
    }
    console.log(foundHeroes);
    return foundHeroes;
}

//Load favourite lists from JSON
function loadFavouritesLists(){
    return readJSON("../lists.json");
}

//save lists to JSON file
function saveFavouritesLists(){
    stringifiedLists = JSON.stringify(favouriteLists);

    fs.writeFile("lists.json",stringifiedLists,(err)=>{
        if(err){
            console.log("Error writing to JSON file");
        }
        else{
            console.log("Written to JSON file successfully");
        }
    })

}

function createList(listName){
    //create list object
    newList = {
        name:listName,
        list:[],
        public: isPublic,
        description: description
    }
    //add to favouriteLists
    favouriteLists.push(newList);
}

//retrieve list based on name
function getList(listName){
    return favouriteLists.find(l=>l.name===listName);
}

//adds a list of heroes to an existing list
//any existing heroes already in the list are not added a second time
function addToList(heroID,listName){
    //get list
    console.log(favouriteLists);
    heroList = getList(listName);
    //if no heroIDs given, empty array to ensure no error at for loop
    if(!heroID){
        return;
    }
    //set of hero names
    //makes it easier to look up if a given name already exists in the set
    heroSet = new Set(heroList.list);

    //if heroID does not exist in heroID
    if(!heroSet.has(heroID)){
        heroList.list.push(heroID)
    }
    console.log(favouriteLists)
}

function removeFromList(heroID,listName){
    //get list
    heroList = getList(listName);
    idToRemove = heroID;

    if (heroList) {
        //get index of id to remove
        const indexToRemove = heroList.list.indexOf(heroID);
        //if found, remove
        if (indexToRemove !== -1) {
            heroList.list.splice(indexToRemove, 1);
            return true;
        }
        else{
            return false;
        }
    //error if list not found
    } else {
        console.log("List or heroList.list not found");
    }
}

function deleteList(listName){
    //find index of list with name
    index = favouriteLists.findIndex(list=> list.name===listName);
    //if found, remove, else nothing
    if(index!==-1){
        favouriteLists.splice(index,1);
    }
}

