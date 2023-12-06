/*Various global variables*/



// For production, use relative URL
// For local development, use http://localhost:3000/api
// set the base URL for the API server
const BASE_URL = "/api";


//the data the table builds off of
heroData=[];
//keeps track of which list is selected and if one is loaded onto the table
selectedList="";
loadedList="";

//search parameters
searchField = "name";
n = 5;

//publishers info
publishers = []
getPublishers();

//Row modal content
selectedRow = undefined;
rowModalContent = document.createElement("div");
rowModalContent.classList.add("zoomContent")


/*Event Listeners */

//Field drop-down menu
fieldsList = document.querySelector("#fields");
fieldsList.addEventListener("change",function(event){
    searchField= fieldsList.value
})


//Powers button
powersBtn = document.querySelector("#togglePowersBtn");
showPowers = false;
powersBtn.addEventListener("click",function(event){
    showPowers=!showPowers;
    //rebuild table to show changes
    if(heroData){
      buildTable();
    }
});

//Search button and box
searchBtn = document.querySelector("#searchBtn");
searchBox = document.querySelector("#searchBox");
searchBtn.addEventListener("click",function(event){
    //get search pattern, search accordingly
    searchPattern = inputSanitization(searchBox.value);
    //list not loaded
    loadedList="";
    search(searchField,searchPattern,n);
});

//Sort button
sortBtn = document.querySelector("#sortBtn");
sortBtn.addEventListener("click",sort)

//Data table
dataTable = document.querySelector("#dataTable");
tableHeaders = document.querySelector("#table-headers")
tableBody = document.querySelector("#table-body")

//Lists drop-down menu
listDropDown = document.querySelector("#listDropDown");
listDropDown.addEventListener("change",function(event){
  //set selectedList
  selectedList = listDropDown.value;
})
populateListDropDown();

//Create List Button
createListBtn = document.querySelector("#createBtn");
modal = document.querySelector("#nameModal");
createListBtn.addEventListener("click",toggleListModalVisibility);

//initialize a new lisst
document.querySelector('#nameModal button').addEventListener('click',function(event){
  //get list name
  newListName = inputSanitization(document.querySelector("#nameModal input").value);
  //set new list to be laoded and selected
  selectedList = newListName;
  loadedList =newListName;

  toggleListModalVisibility();

  //create option for drop down, add it
  option = document.createElement("option");
  option.value=newListName;
  option.text = newListName;
  listDropDown.appendChild(option);
  option.selected = true;

  //create the new list
  createList(newListName);
});


//Load List Button
loadListBtn = document.querySelector("#loadBtn");
loadListBtn.addEventListener("click",function(event){
  //load data from list and build table
  heroData = loadList(selectedList);
  loadedList = selectedList;
});

//Add to list button
addBtn = document.querySelector("#addBtn");
addBtn.addEventListener("click",function(event){
  //get hero from selected row
  //nothing if no row selectedd
  if(selectedRow){
    addToList(selectedRow);
  }
});

//Remove from list button
removeBtn = document.querySelector("#removeBtn");
removeBtn.addEventListener("click",function(event){
  //if a row has been selected
  if(selectedRow){
    removeFromList(selectedRow);
  }
});

//Delete list button
deleteBtn = document.querySelector("#deleteBtn");
deleteBtn.addEventListener("click",deleteList);

//Save list(s) button
saveBtn = document.querySelector("#saveBtn");
saveBtn.addEventListener("click",saveLists);

//Zoom button
zoomBtn = document.querySelector("#zoom");
zoomBtn.addEventListener("click",toggleRowModalVisibility);
//modal to display row details
rowModal = document.querySelector("#rowModal")

//n box, specifies the number of heroes to return in search
nBox = document.querySelector("#nBox");
nBox.addEventListener("input",()=>{
  //if value is not NaN (double negative), retrieve input after sanitization
  if(!isNaN(nBox.value)){
    n=inputSanitization(parseInt(nBox.value));
  }
});

//Publishers button
document.querySelector("#publishers").addEventListener("click",togglePublisherModalVisibility);



/*Methods and Async Fetch Methods */



//call AFTER heroData has been retrieved
function buildTable(){

  //reset table before rebuilding
  selectedRow = undefined;
  while(tableHeaders.firstChild){
    tableHeaders.removeChild(tableHeaders.firstChild);
  }
  while(tableBody.firstChild){
    tableBody.removeChild(tableBody.firstChild);
  }

  //if heroData is loaded
  if(heroData.length!=0){
    //use one of the heroes temporarily
    tempHero = heroData[0];
    console.log(tempHero);


    //creating column headers
    columns = document.createElement("tr");
    //use powers or info depending on showPowers
    for(key in (showPowers ? tempHero.powers : tempHero.info)){
      //create header element with textContent of key, append to columns
      header = document.createElement("th");
      header.textContent = key;
      columns.appendChild(header);
    }
    tableHeaders.appendChild(columns);
  
    //rows for each hero in heroData
    heroData.forEach((hero)=>{
      //create row
      row = document.createElement("tr");
      //iterate thru values of hero object
      iterateOver = (showPowers ? hero.powers : hero.info);
      for(key in iterateOver){
        //create cell and append to row
        value = iterateOver[key];
        cell = document.createElement("td");
        content = document.createTextNode(value);
        cell.appendChild(content)
        row.appendChild(cell);
      }
      //add row to body
      tableBody.appendChild(row);
    });
  
    //selectable event listener
    for(row of tableBody.children){
      row.addEventListener('click',function(event){
        //remove selected class from all rows
        for(row of tableBody.children){
          row.classList.remove('selected');
        }
        //add selected class to selectedd row (for css)
        this.classList.add("selected");
        const index = Array.from(tableBody.children).indexOf(this);
        selectedRow = heroData[index]; //for zoom, add, and remove operations
        console.log("Selected row: ",selectedRow);
      });
    }
  }
  else{
    //empty table
  }
}

//Populate the drop down menu with the favourite lists of the user
async function populateListDropDown(){
  try{
    //fetch list names http request
    const response = await fetch(`${BASE_URL}/lists/populateDropDown/ids`);
    
    if(!response.ok){
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    //await for parsed data
    const data = await response.json();
    console.log(data);

    //for each list name in data, create option element and append to list drop down
    data.forEach((item)=>{
      option = document.createElement("option");
      option.value=item;
      option.text=item;
      listDropDown.appendChild(option);
    });
    selectedList = listDropDown.children[0].value;

  }catch(error){
    console.log("Error: ",error)
  }
}

//search the backend for specific heroes
async function search(field,pattern,n){
  try{
    //search HTTP request
    const response = await fetch(`${BASE_URL}/superheroes/search?field=${field}&pattern=${pattern}&n=${n}`);

    if(!response.ok){
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    //await for parsed data, then set to heroData
    data = await response.json()
    console.log(data);
    heroData = data;

  }catch(error){
    console.log("Error: ",error)
  }
  //build table after data has been retrieved
  buildTable();
}

//sort table according to field
function sort(){
  sortBy = searchField;
  //if sorting by info
  if(sortBy!=="Powers"){

    //reset table before sorting if open to powers
    if(showPowers){
      showPowers=false;
      buildTable()
    }
    //sort by callback function
    heroData.sort((heroA,heroB)=>{

      //parse to int
      valA = parseInt(heroA.info[sortBy]);
      valB = parseInt(heroB.info[sortBy]);
      
      //if values are numbers
      if(!isNaN(valA) && !isNaN(valB)){
        return valA-valB;
      }
      //if values are NaN
      else{
        return heroA.info[sortBy].localeCompare(heroB.info[sortBy]);
      }

    });
  }
  //if sorting by powers
  else{
    //if displaying info, rebuild to display powers first
    if(!showPowers){
      showPowers=true;
      buildTable();
    }

    //sort by callback
    heroData.sort((heroA,heroB)=>{
      let cA,cB=0;
      //iterate thru powers of heroA, count how many powers it has
      for(key in heroA.powers){
        if(heroA.powers[key]){
          cA++
        }
      }
      //iterate thru powers of heroB, count how many powers it has
      for(key in heroB.powers){
        if(heroB.powers[key]){
          cB++
        }
      }
      //return difference
      return cA-cB;
    });
  }
  //rebuild table with sorted heroData
  buildTable();
}

//create new favourites list
//called by listModal after name is inputted
async function createList(listName){
  let response = null; // Define response here

  try {
      // Create new list post request
      response = await fetch(`${BASE_URL}/lists`, {
          method: "POST",
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({name: listName})
      });

      if (!response.ok) {
          throw new Error(`HTTP error, Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data);

  } catch (error) {
      console.log("Error:", error);
  }

  // Check response status outside of the catch block
  if (response) {
      if (response.status === 400) {
          alert("Bad request: list name not received");
      } else if (response.status === 403) {
          alert("Forbidden: list name already taken");
      }
  }

  // Load empty table
  heroData = [];
  buildTable();
}

//load existing list
async function loadList(name){
  //empty hero data
  heroData=[];
  try{
    //get list content request
    const response = await fetch(`${BASE_URL}/lists/${name}/content`);

    if(!response.ok){
      throw new Error(`HTTP error, Status:${response.status}`);
    }

    //await for parsed data, set to heroData and rebuild table
    data = await response.json();
    heroData=data;
    buildTable();

    loadedList = selectedList;

  }catch(error){
    console.log("Error:",error)
  }
}

//add hero to selected list
async function addToList(hero){
  console.log(hero);
  //fetch put list method
  try{
    const url = `${BASE_URL}/lists/${selectedList}`;

    const response = await fetch(url,{
      method:"PUT",
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({id:hero.info.id})
    });

    if(!response.ok){throw new Error(`HTTP error, Status: ${response.status}`)}
    else{
      alert("Hero was added to list successfully");
    }

  }catch(error){
    console.log("Error: ",error);
  }
}

//remove hero from currently displayed list
async function removeFromList(hero){
  //delete hero from list fetch
  try{
    
    const response = await fetch(`${BASE_URL}/lists/${selectedList}/${hero.info.id}`,{method:"DELETE"});
    
    if(!response.ok){
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    data = await response.json()
    console.log(data);
    
    //remove hero from table and list
    if(data==="Id successfully removed from list"){
      console.log("reached")
      heroData.splice(heroData.indexOf(hero),1);
      buildTable();
    }

  }catch(error){
    console.log("Error: ",error)
  }


}

//delete selected list
//bug seems to delete first option in listDropDown but not the selectedList, regardless of
async function deleteList(){
  //fetch to delete list endpoint
  try{
    const response = await fetch(`${BASE_URL}/lists/${selectedList}`,{method:"DELETE"});

    if(!response.ok){
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    //remove list from drop down
    console.log(selectedList);
    optionToRemove = listDropDown.querySelector(`option[value="${selectedList}"]`);

    if(optionToRemove){
      listDropDown.removeChild(optionToRemove);
    }
    //if list was loaded onto table, unload it
    if(selectedList==loadedList){
      loadedList="";
      heroData=[];
      buildTable();
    }

  }catch(error){
    console.log("Error: ",error)
  }
}

//save currently displayed content to backend and save backend lists to JSON
async function saveLists(list){
  //fetch save lists request
  //list - [ids] or nothing (save list to backend and write to JSON or just write to JSON)

  try{
    const response = await fetch(`${BASE_URL}/lists/${selectedList}`,{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(list)});

    if(!response.ok){
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    data = await response.json()
    console.log(data);

    if(data==="Success"){
      alert("Lists saved sucessfully")
    }

  }catch(error){
    console.log("Error: ",error)
    alert("Error: List was not saved")
  }
}

//get hero id fetch
async function getHero(id){
  try{
    const url = `${BASE_URL}/superheroes/${id}`;
    const response = await fetch(url);

    if(!response.ok){throw new Error(`HTTP Error, Status: ${response.status}`)}

    const data = await response.json();
    
    //build data of zoom modal
    p = `Name: ${data.name} `;
    rowModalContent.appendChild(document.createTextNode(p));
    //iterate thru keys
    for(key in data){
      //add each key-value to p except name
      if(key!="name"){
          p=document.createElement("p");
          p.appendChild(document.createTextNode(`${key}: ${data[key]}`));
          rowModalContent.appendChild(p);
        }
    }
    
    //add cancel button
    cancelBtn = document.createElement("button");
      cancelBtn.type="button";
      cancelBtn.appendChild(document.createTextNode("Cancel"));
      cancelBtn.addEventListener('click',toggleRowModalVisibility);
      rowModalContent.appendChild(cancelBtn);

  }catch(error){
    console.log("Error: ",error)
  }
}

//get powers id fetch
async function getPowers(id){
  try{
    const url = `${BASE_URL}/superheroes/${id}/powers`;
    const response = await fetch(url);

    if(!response.ok){throw new Error(`HTTP Error, Status: ${response.status}`)}

    const data = await response.json();

    //build data of zoom modal
    p = `Name: ${data.hero_names} `;
    rowModalContent.appendChild(document.createTextNode(p));
    //iterate thru keys, add true powers to paragraph
    for(key in data){
      if(data[key]=="True"){
        p=document.createElement("p");
        p.appendChild(document.createTextNode(`${key}`));
        rowModalContent.appendChild(p);
      }
    }
    //add cancel button
    cancelBtn = document.createElement("button");
      cancelBtn.type="button";
      cancelBtn.appendChild(document.createTextNode("Cancel"));
      cancelBtn.addEventListener('click',toggleRowModalVisibility);
      rowModalContent.appendChild(cancelBtn);

  }catch(error){
    console.log("Error: ",error)
  }
}

//get list of publishers
async function getPublishers(){
  try{
    const response = await fetch(`${BASE_URL}/publishers`);

    if(!response.ok){
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    data = await response.json()
    //retrieve publishers info for later display
    publishers = data;

  }catch(error){
    console.log("Error: ",error)
  }
}

//toggle visibility of modal
function toggleListModalVisibility(){
  if(modal.style.display==="none"){
    modal.style.display="flex";
  }
  else{
    modal.style.display="none";
  }
}

//toggle visibility of zoom modal
function toggleRowModalVisibility(){
  //if a row is selected
  if(selectedRow){

    if(rowModal.style.display==="none"){
      //make visible
      rowModal.style.display="flex";
  
      //add content to row modal
      rowModalContent.classList.add("zoomContent");
      if(showPowers){
        //build modal with hero name + powers the hero has
  
        getPowers(selectedRow.info.id);
      }
      else{
        //build modal with all hero info
        getHero(selectedRow.info.id);
      }
  
      //reset innerHTML and append new content
      rowModal.innerHTML = "";
      rowModal.append(rowModalContent);
    }
    else{
      rowModal.style.display="none";
      rowModalContent.innerHTML="";
    }
  }
}

//toggle visibility and build publisher modal
function togglePublisherModalVisibility() {
  const publisherModal = document.querySelector("#publishersModal");

  if (publisherModal.style.display === "none") {
    
    //show modal
    publisherModal.style.display = "flex";

    getPublishers();

    // Create a container for the modal content
    const modalContent = document.createElement("div");
    modalContent.classList.add("zoomContent");
    const title = document.createElement("p");
    title.appendChild(document.createTextNode("Publishers:"));
    modalContent.appendChild(title);

    // Add publisher strings to the modal
    publishers.forEach((publisher) => {
      const pElement = document.createElement("p");
      pElement.appendChild(document.createTextNode(publisher));
      modalContent.appendChild(pElement);
    });

    // Add "Cancel" button
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.appendChild(document.createTextNode("Cancel"));
    cancelBtn.addEventListener('click', togglePublisherModalVisibility);
    modalContent.appendChild(cancelBtn);

    // Append the modal content to the publisher modal
    publisherModal.appendChild(modalContent);
  } else {
    // Set visibility to "none" to hide the modal
    publisherModal.style.display = "none";
    // Clear the modal content
    publisherModal.innerHTML = "";
  }
}

//input sanitization method
function inputSanitization(input){
  //illegal characters to input
  const illegalChars = {
    '&':'&',
    '<':'<',
    '>':'>',
    '"':'"',
    "'":"'",
    ";":";"
  }
  //regex
  const regex =/[&<>"']/gi;
  //replaces any instances of an illegal character with the regex/their html entities
  return input.replace(regex,(match)=>{return map[match]})
}