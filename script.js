var apiKey = "xVLyHw.8StylA:IbBlVT5bLrkxQDGJDm526eqqkRUx-kB22g5sXOtFqac";
var ably = new Ably.Realtime({ key: apiKey, clientId: 'user' });

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
var colorPicker = document.getElementById("favcolor");

var channel = ably.channels.get('channel');

var admin = false; 
var adminInterval;
var allTiles = [];
var allChips = [];
var tileSize = 100;
var chipSpeed = 15;
var chipSize = 40;
var allPlayers = {};
var thisPlayer = {id:1,color:"#ff0000"};
//var thisColor = "#ffffff";

var grid = [
[1,1,1,1,1,1,1],
[1,1,1,1,1,1,1],
[1,1,1,1,1,1,1],
[1,1,1,1,1,1,1],
[1,1,1,1,1,1,1],
[1,1,1,1,1,1,1]
];






ably.connection.on('connected', function() {
  setRandId(thisPlayer);
  
  channel.presence.enter();
  channel.presence.get(function(err, members) {
    console.log('There are ' + members.length + ' members on this channel');
    if(members.length == 0){
      admin = true;
    }
  });
  
  createObjectsByGrid(grid,Tile);
  for(var i=0;i<allTiles.length;i++){
      allTiles[i].getAdjTiles();
    
  }
  
  colorPicker.onchange = function(e){
    thisPlayer.color = colorPicker.value;
  };
  
  window.requestAnimationFrame(update);

});

function update(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  
  
  batchUpdate(allChips);
  batchDraw(allChips);
  batchDraw(allTiles);
  
  
  if(admin && !adminInterval){
	  adminInterval = (function(){
		  
	  },1000);
  }
  
  window.requestAnimationFrame(update);
}



window.onclick = function(e){
  clickPos = {x:e.clientX,y:e.clientY};
  for(var i=0;i<allTiles.length;i++){
      allTiles[i].onclick(clickPos);
  }
  //new Chip(50,550,"#FF0000");
  /*
  if(isInCollision({x:0,y:0,width:100,height:600},clickPos)){
    console.log("col 1 is selected");
  }
  if(isInCollision({x:100,y:0,width:100,height:600},clickPos)){
    console.log("col 1 is selected");
  }
  */
};


function addPlayer(){
  //var player = {};
  //player.id = setRandId(); 
  //allPlayers[player.id] = player;
}

function removeAllChips(){
  for(var i=0;i<allTiles.length;i++){
      allTiles[i].chip = null;
  }
  allChips = [];
}




function Chip(tile,player){
	this.x = (tile.x*100)+50;
	this.y = -100;
    this.targetX = (tile.x*100)+50;
    this.targetY = (tile.y*100)+50;
	this.size = chipSize;
    this.color = "#ff0000";
    this.player = player;
	//setRandId(this);
    allChips.push(this);
}
Chip.prototype.draw = function(){
  drawCircle(this.x,this.y,this.size,this.color);
};
Chip.prototype.update = function(){
  this.color = this.player.color;
  if(this.y >= this.targetY){
    this.y = this.targetY;
  }
  else{
    this.y += chipSpeed;
  }
};








function Tile(x,y){
  this.x = x;
  this.y = y;
  this.width = 100;
  this.height = 100;
  this.color = "#ffffff";
  this.player = null;
  this.chip = null;
  setRandId(this);
  allTiles.push(this);
}
Tile.prototype.update = function(){
  
};
Tile.prototype.onclick = function(cursor){
  var pos = {};
  pos.x = this.x*100;
  pos.y = this.y*100;
  pos.width = this.width;
  pos.height = this.height;
  if(isInCollision(pos,cursor)){
    if(this.chip){
      this.addChipUp();
    }
    else{
      this.addChipDown();
    }
    
  }
  
};
Tile.prototype.addChipDown = function(){
  
  if(this.tileDown != null){
    if(!this.tileDown.chip){
      console.log("the tile down has no chip, atempting to call addchip to that tile");
      this.tileDown.addChipDown();
    }
    else{
      console.log("down tile has chip, sending chip here");
     this.chip = new Chip(this,thisPlayer);
   }
  }
  else{
      console.log("has no tile beneath, creating chip");
     this.chip = new Chip(this,thisPlayer);
   }
};
Tile.prototype.addChipUp = function(){
  
  if(this.tileUp != null){
    if(!this.tileUp.chip){
      console.log("the tile Up has no chip, send chip there");
      this.tileUp.chip = new Chip(this.tileUp,thisPlayer);
    }
    else{
      console.log("Up tile has chip, sending chip here");
      this.tileUp.addChipUp();
   }
  }
  else{
      console.log("has no tile over top, canceling");
  }
};
Tile.prototype.getAdjTiles = function(){
	
  var pos1 = {};
  pos1.x = this.x;
  pos1.y = this.y+1;
  
  var pos2 = {};
  pos2.x = this.x;
  pos2.y = this.y-1;
  
  var pos3 = {};
  pos3.x = this.x+1;
  pos3.y = this.y;
  
  var pos4 = {};
  pos4.x = this.x-1;
  pos4.y = this.y;
  
    this.tileUp = findByPos(pos2,allTiles);
	this.tileDown = findByPos(pos1,allTiles);
	this.tileLeft = findByPos(pos4,allTiles);
	this.tileRight = findByPos(pos3,allTiles);
};
Tile.prototype.draw = function(){
  ctx.beginPath();
  ctx.rect(this.x*tileSize, this.y*tileSize, tileSize, tileSize);
  ctx.stroke(); 
};

/*
if(isInCollision(this,pos) && !this.player){
    this.player = thisPlayer;
    new Chip(this.x+50,this.y+50,this.player);
    
  }
*/

channel.subscribe(function(msg) {
  
  //for(var i=0;i<){
      
  //}
  //new Chip();
  
});
  



//methods ================================
function setRandId(obj){
	obj.id = Math.random();
}
function isInCollision(region,pos){
	return pos.x >= region.x && pos.x <= (region.x)+region.width && pos.y >= region.y && pos.y <= (region.y)+region.height;
}

function batchDraw(arr){
	//calls draw prototype for all elements in arg
	for(var i in arr){
	  var obj = arr[i];
	  obj.draw();
  }
}
function batchUpdate(arr){
	//calls draw prototype for all elements in arg
	for(var i in arr){
	  var obj = arr[i];
	  obj.update();
  }
}

function createObjectsByGrid(dimenArr,objClass){
	//creates object if element is equal to "1"
	for(var y=0;y<dimenArr.length;y++){
		for(var x=0;x<dimenArr[y].length;x++){
			if(dimenArr[y][x] == 1){
				new objClass(x,y);
			}
		}
	}
}

function drawCircle(x,y,size,color){
	ctx.beginPath();
	ctx.arc(x,y,size, 0, 2 * Math.PI, false);
	ctx.fillStyle = color;
	ctx.fill();
}

function findByPos(pos,arr){
	for(var i=0;i<arr.length;i++){
		var obj = arr[i];
		if(pos.x == obj.x && pos.y == obj.y){
			return obj;
		}
	}
	return null;
}
function findByPosGrid(pos,arr,size){
	for(var i=0;i<arr.length;i++){
		var obj = arr[i];
		if(pos.x == (obj.x*size) && pos.y == (obj.y*size)){
		  console.log("found adj tile");
          return obj;
		}
	}
	return null;
}
































