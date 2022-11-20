let map;

function loadMap(){
    
    map = L.map('map').setView([53.43, 14.55], 13);

    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

}

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    document.getElementById("coord").innerHTML = "Brak wsparcia dla lokalizacji.";
  }
}

function showPosition(position) {
    changeBtnToRaster();
    document.getElementById("coord").innerHTML = "Twoje współrzędne: szerokość: " + position.coords.latitude + ", wysokość: " + position.coords.longitude;
    map.setView([position.coords.latitude, position.coords.longitude], 14);
    const popup = L.marker([position.coords.latitude, position.coords.longitude]).addTo(map);
}

function changeBtnToRaster(){
    var btn = document.getElementById("button1");
    btn.innerHTML = "RASTER";
    btn.setAttribute("onclick", "raster()");
}

function raster(){
    html2canvas(document.getElementById("map"), {
        allowTaint: true,
        width: 600,
        height: 600
      }).then(function(canvas){
        canvas.classList.add("puz");
        canvas.setAttribute("id", "raster");
        document.getElementById("map").hidden=true;
        document.getElementById("leftPanel").appendChild(canvas);
        changeBtnToPuzzle();
      });
}

function changeBtnToPuzzle(){
    //zmiana przycisku
    var btn = document.getElementById("button1");
    btn.innerHTML = "ZAGRAJ!";
    btn.setAttribute("onclick", "puzzle()");
}

function changeBtnToReset(){
    var btn = document.getElementById("button1");
    btn.innerHTML = "RESET";
    btn.setAttribute("onclick", "reset()");
}

function reset(){
    document.getElementById('game').innerHTML='';
    puzzle();
}

function puzzle(){
    changeBtnToReset();

    document.getElementById('leftPanel').style.width='49.9%';
    document.getElementById('rightPanel').style.display='block';

    // zrodlo do pociecia
    var raster = document.getElementById('raster');
    var rasterCtx = raster.getContext('2d');

    // cel
    var dstDiv = document.getElementById('game');

    // ustawienia trudnosci
    var numberOfTiles = 16;
    var numberColsRows = Math.sqrt(numberOfTiles);

    // ustawienia rozmiarow
    var srcTileWidth = raster.width/numberColsRows;
    var srcTileHeight = raster.height/numberColsRows;
    var dstTileSize = 150;
    
    array = Array.from(Array(16).keys());
    
    var currentIndex = array.length, randomIndex;
    while (currentIndex != 0){
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    var newArray = [];
    while(array.length) newArray.push(array.splice(0,4));
    array = newArray;

    //pętla mieszająca
    var x=0;
    for (var i = 0; i < 4; i++){
          for (var j = 0; j < 4; j++){
            var gameDiv = document.createElement('div');
            gameDiv.classList.add("gameDiv");
            gameDiv.setAttribute("id", "div"+x);
            x++;

            var newTile = document.createElement('canvas');
            var newCtx = newTile.getContext('2d');
            newTile.width = newTile.height = dstTileSize;

            newTile.classList.add("gameElement");
            newTile.setAttribute("id", "tile"+array[i][j]);
            newTile.setAttribute("draggable", "true");
            newTile.setAttribute('ondragstart', 'drag(event)');
           
             
            newCtx.drawImage(raster, array[i][j]%4*srcTileWidth, Math.floor(array[i][j]/4)*srcTileHeight, srcTileWidth, srcTileHeight, 0, 0, dstTileSize, dstTileSize);

            newTile.setAttribute('ondragover', 'allowDrop(event)');
            newTile.setAttribute('ondrop', 'drop(event)');

            gameDiv.appendChild(newTile);
            dstDiv.appendChild(gameDiv);
        }
    }
}


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("canvasId", ev.target.id);
    ev.dataTransfer.setData("divId", document.getElementById(ev.target.id).parentElement.id);
}

function drop(ev) {
    ev.preventDefault();
    var curr = ev.target.parentElement;
    var oldCanvas = document.getElementById(ev.target.id);
    
    var idPrevDiv = ev.dataTransfer.getData("divId");
    var idNewCanvas = ev.dataTransfer.getData("canvasId");
    var newCanvas = document.getElementById(idNewCanvas);
    
    curr.innerHTML='';
    curr.appendChild(newCanvas);

    document.getElementById(idPrevDiv).innerHTML='';
    document.getElementById(idPrevDiv).appendChild(oldCanvas);

    checkAnswer();
}

function checkAnswer(){
    for(var i=0; i<=15; i++){
        tileId = document.getElementById('div'+i).firstChild.id.substr(4);
        if(tileId==i){
            if(i==15){
                console.log('you win!');
                notifyMe();
            }
            continue;
        }else{
            break;
        }
    }
}

function notifyMe() {
    if (!("Notification" in window)) {
      alert("Brak wsparcia dla notyfikacji");
    } else if (Notification.permission === "granted") {
      const notification = new Notification("Wygrana!");
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            const notification = new Notification("Wygrana!");
        }
      });
    }
}

