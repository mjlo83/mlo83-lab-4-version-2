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
 
 
 
 
 
 
 
 /*Endpoints for web app */
 
 
 //search end point
 apiRouter.get("/superheroes/search",(req,res)=>{
     //search parameters (n-# of heroes to return, field - attribute to look at, pattern - search pattern)
     n = req.query.n;
     field = req.query.field;
     pattern = req.query.pattern;
 
     list = search(field,pattern,n);
     //send list if successful search, else send error code
     if(list){
         res.send(list);
     }
     else{
         res.status(404).send(`No matches found`);
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
     if(body.hasOwnProperty("name")){
         //get check if name is already taken
         listName = body.name;
         taken = favouriteLists.find(l=>l.name===listName);
         //if not taken, create list and return it
         if(!taken){
             createList(listName);
             res.send(getList(listName));
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
 
 
 
 
 
 
 
 // BETA SEARCH FUNCTION -> COMMENT OUT OR DELTE IF TESTING NEW FUNCTION FAILS
 // Query the JSON files with fuzzy matching
 function search(field, pattern, n = 0) {
     pattern = pattern.toLowerCase();
     foundHeroes = [];
     
     if (field === "Powers") {
         // Rest of your existing logic for filtering powers...
     } else {
         // Use isFuzzyMatch to find heroes whose attribute of type field matches the pattern
         matches = superHeroInfo.filter((h) => {
             if (field in h) {
                 if (typeof h[field] === 'string') {
                     return isFuzzyMatch(h[field], pattern);
                 } else if (!isNaN(pattern) && (field === "Weight" || field === "Height")) {
                     return h[field] === Number(pattern);
                 }
             }
             return false;
         });
 
         for (let i = 0; i < matches.length; i++) {
             foundHeroes.push({
                 info: matches[i],
                 powers: getPowers(matches[i].id)
             });
         }
     }
 
     if (n !== 0 && n < matches.length) {
         return foundHeroes.slice(0, n);
     }
     console.log(foundHeroes);
     return foundHeroes;
 }
 
 
 
 
 // WORKING SEARCH FUNCTION -> UNCOMMENT IF TESTING NEW FUNCTION FAILS
 // //Query the JSON files
 // function search(field,pattern,n=0){
 
 //     pattern = pattern.toLowerCase();
 //     foundHeroes = [];
 //     //if powers are being searched
 //     if(field=="Powers"){
 //         //filter powers
 //         matches = superHeroPowers.filter((h)=>{
 //             for(const power in h){
 //                 //if power contains pattern and is true, return
 //                 if(power.toLowerCase()==pattern && h[power]==="True"){
 //                     return true;
 //                 }
 //             }
 //             return false;
 //         });
 //         //for all matches, get corresponding hero info
 //         for(let i=0;i<matches.length;i++){
 //             foundHeroes.push({
 //                 info: superHeroInfo.find(s=>s.name===matches[i].hero_names),
 //                 powers:matches[i]
 //             })
 //         }
 //     }
 //     else{
 //         //find heroes whose attribute of type field includes pattern
 //         matches = superHeroInfo.filter((h)=>{
 //             switch(field){
 //                 case "Gender":
 //                     //return true only if matches perfectly (user has to search male or female)
 //                     return (h["Gender"].toLowerCase()===String(pattern).toLowerCase())
 //                 case "Weight":
 //                     //only check if pattern is a number (not NaN, double negative I guess)
 //                     if(!isNaN(pattern)){
 //                         return (h["Weight"]===pattern);
 //                     }
 //                 case "Height":
 //                     if(!isNaN(pattern)){
 //                         return (h["Height"]===pattern);
 //                     }
 //                 default:
 //                     pattern = String(pattern).toLowerCase();
 //                     val = h[field].toLowerCase();
 //                     return (val.includes(pattern))
 //             }
 //         });
 //         //iterate thru matches, return content including corresponding powers
 //         for(let i=0;i<matches.length;i++){
 //             foundHeroes.push({
 //                 info:matches[i],
 //                 powers:getPowers(matches[i].id)
 //             });
 //         }
 
 //     }
 //     //if n is given or n is less than the number of matches
 //     if(n!=0 && n<matches.length){
 //         return foundHeroes.slice(0,n)
 //     }
 //     console.log(foundHeroes);
 //     return foundHeroes;
 // }
 
 
 
 
 // A helper function to perform fuzzy matching
 function isFuzzyMatch(str, pattern) {
     // Remove whitespace and convert to lower case for a case-insensitive match
     str = str.replace(/\s+/g, '').toLowerCase();
     pattern = pattern.replace(/\s+/g, '').toLowerCase();
     
     // If the strings are equal or the pattern is empty, return true
     if (str === pattern || pattern === '') return true;
     
     // If the pattern length is greater than the string length plus allowed mismatch, return false
     const allowedMismatch = 2;
     if (pattern.length > str.length + allowedMismatch) return false;
   
     // Check for up to 'allowedMismatch' incorrect characters
     let mismatchCount = 0;
     for (let i = 0, j = 0; i < str.length && j < pattern.length; i++, j++) {
       if (str[i] !== pattern[j]) {
         mismatchCount++;
         if (mismatchCount > allowedMismatch) {
           return false;
         }
         // If characters don't match, check next character in the string
         if (str[i + 1] === pattern[j]) {
           i++;
         } else if (str[i] !== pattern[j + 1]) {
           // If the next character in the pattern also doesn't match, increase mismatch count
           j++;
         }
       }
     }
   
     // Return true if the mismatch count is within the allowed limit
     return mismatchCount <= allowedMismatch;
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
         //list of ids
         list:[]
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
 
 function updatePublicLists(listName, addToList) {
    const publicListsDiv = document.getElementById("publicLists");
    const MAX_PUBLIC_LISTS = 10;
  
    if (addToList) {
        // Check if the maximum limit has been reached
        if (publicListsDiv.children.length < MAX_PUBLIC_LISTS) {
            // Add new list name to the box
            const newList = document.createElement("p");
            newList.textContent = listName;
            publicListsDiv.appendChild(newList);
            
            
            
        } else {
            alert("Maximum limit of public lists reached. Cannot add more.");
        }
    } else {
        // Remove list name from the box
        Array.from(publicListsDiv.children).forEach(child => {
            if (child.textContent === listName) {
                publicListsDiv.removeChild(child);
            }
        });
    }
  }
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
   