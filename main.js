let bookmarks = [];
let portal = 'https://siasky.net';
let app;
let refresh = true;

// Checks link for a valid link using regex and returns first valid skylink address, if none, returns null
function findValidSkynetLink(skylink){
  let skylinkTest = /[a-zA-Z0-9+_\-=]{46}(\/{1}.*)*/;
  let validLink = skylink.match(skylinkTest);
  return validLink;
}

function supportsHTML5Storage(){
  try{
    localStorage.setItem('test', 'testdata');
    localStorage.removeItem('test');
    return true;
  }catch(e){
    return false;
  }
}

function saveData(){
  if(supportsHTML5Storage()){
    localStorage.setItem('skynetBookmarks', JSON.stringify(bookmarks));
    portal = document.getElementById('portalText').value;
    localStorage.setItem('skynetPortal', portal);
  }else{
    errorPopup('Local storage is not supported on this device! Bookmarks can not be saved locally!');
  }
}

function loadData(){
  if(supportsHTML5Storage()){
    if('skynetBookmarks' in localStorage){
      bookmarks = JSON.parse(localStorage.getItem('skynetBookmarks'));
      portal = localStorage.getItem('skynetPortal');
    }else{
      errorPopup('No previous bookmarks were found.')
    }
  }else{
    errorPopup('Local storage is not supported on this device! Bookmarks can not be saved locally!');
  }
}

function bookmarkIncludes(skylink){
  for(let i = 0; i < bookmarks.length; i++){
    if(bookmarks[i].skylink === skylink){
      return true
    }
  }
  return false
}

// Adds the bookmark from the input field to the bookmark list
function addBookmark(){
  let bookmarkLink = document.getElementById('bookmarkLink').value;
  let bookmarkName = document.getElementById('bookmarkName').value;
  let validBookmark = findValidSkynetLink(bookmarkLink);
  if(validBookmark !== null){
    validBookmark = validBookmark[0]
    if(bookmarkIncludes(validBookmark)){
      errorPopup('Skylink was already in the bookmark list.')
    }else{
      let obj = {
        name: bookmarkName,
        skylink: validBookmark
      }
      bookmarks.push(obj);
      document.getElementById('bookmarkLink').value = '';
      document.getElementById('bookmarkName').value = '';
    }
  }else{
    errorPopup('Bookmark link did not contain a valid skylink.');
  }
  //saveData();
}

function errorPopup(errorText){
  hidePopup();
  document.getElementById('popup').innerHTML = errorText;
  document.getElementById('popup').classList.add('fade');
  setTimeout(function() {
    hidePopup();
  }, 3000);
}

function hidePopup(){
  if(document.getElementById('popup').classList.contains('fade')){
    document.getElementById('popup').classList.remove('fade');
  }
}

function removeBookmark(index){
  bookmarks.splice(index, 1);
  saveData()
}

// Raises the bookmark's index to the top of the bookmarks list.
function raiseBookmark(index){
  bookmarks.splice(0, 0, bookmarks.splice(index, 1)[0]);
  saveData()
}

// Parses an object to check whether it is correct bookmark array structure.
function isValidBookmarkFile(bookmarkParsed){
  if(Array.isArray(bookmarkParsed)){
    let valid = true;
    for(let i = 0; i < bookmarkParsed.length; i++){
      if(typeof(bookmarkParsed[i]) === 'object'){
        if(bookmarkParsed.hasOwnProperty('name') && bookmarkParsed.hasOwnProperty('skylink')){
          valid = false;
        }
      }
    }
    if(valid){
      return true
    }
  }
  return false
}

function importBookmarks(){
  let importFile = document.getElementById("importFile").files[0];

  let fileReader = new FileReader();
  fileReader.onload = function(fileLoadedEvent){
      let textFromFileLoaded = fileLoadedEvent.target.result;
      try{
        bookmarkParsed = JSON.parse(textFromFileLoaded);
        if(isValidBookmarkFile(bookmarkParsed)){
          let savedLength = bookmarks.length;
          for(let i = 0; i < savedLength; i++){
            bookmarks.pop();
          }
          savedLength = bookmarkParsed.length;
          for(let i = 0; i < savedLength; i++){
            bookmarks.push(bookmarkParsed.splice(0,1)[0])
          }
        }else{
          errorPopup('Error parsing txt file: File did not contain a valid bookmarks list.')
        }
      }catch(e){
        errorPopup('Error parsing txt file: ' + e);
      }
      saveData();
  };
  fileReader.readAsText(importFile, "UTF-8");
}

function exportBookmarks(){
  let linkElement = document.createElement('a');
  let date = new Date();
  linkElement.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(bookmarks)));
  linkElement.setAttribute('download', 'SkyMark-' + date.toISOString() + '.txt');
  linkElement.style.display = 'none';
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
}

// start le page
window.addEventListener('load', function () {
  loadData();

  app = new Vue({
    el: '#app',
    data: {
      portal: portal,
      bookmarks: bookmarks
    }
  })
}, false);
