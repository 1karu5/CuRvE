(function(UNDEFINED){
    var canvas;
    // test commit
    //socket
    var ws;
    //context for drawing
    var ctx;
    
    //bind keypress to window    
    var binds = [];
    var oldKeypress = window.onkeypress;
    window.onkeypress = function(e){
        for (var i = 0; i < binds.length; i++) {
            binds[i](e);
        }
        oldKeypress && oldKeypress(e);
    }
    
    //player object
    var addPlayer = function(startx, starty, startDirection, startSpeed, color, name, keyCodes){
        var posX = startx;
        var posY = starty;
        var direction = startDirection; //degrees
        var speed = startSpeed;
        var stop = false;
        
        var toDraw = [];
        
        ws.send(JSON.stringify({
            message: "connect",
            data: {
                name: name,
                color: color
            }
        }));
        
        binds.push(function(e){
            var code = e.charCode || e.keyCode || e.which;
            if (code == keyCodes[0]) {
                speed++;
            }
            if (code == keyCodes[1]) {
                speed--;
            }
            if (code == keyCodes[2]) {
                direction -= 0.3;
            }
            if (code == keyCodes[3]) {
                direction += 0.3;
            }
            return false;
        });
        
        //update position and send it to server
        var update = function(){
            posX += speed * Math.cos(direction);
            posY += speed * Math.sin(direction);
            
            ws.send(JSON.stringify({
                message: "update",
                data: {
                    name: name,
                    x: posX,
                    y: posY
                }
            }));
            
            if (posX > canvas.width) {
                posX = posX - canvas.width;
            }
            if (posX < 0) {
                posX = canvas.width + posX;
            }
            if (posY > canvas.height) {
                posY = posY - canvas.height;
            }
            if (posY < 0) {
                posY = canvas.height + posY;
            }
            
            if (!stop) {
                setTimeout(update, 100);
            }
        };
        
        //draw everything (including other players)        
        var draw = function(){
            for (var i = 0; i < toDraw.length; i++) {
                ctx.beginPath();
                ctx.fillStyle = toDraw[i][2];
                ctx.arc(toDraw[i][0], toDraw[i][1], 5, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            }
            
            if (!stop) {
                setTimeout(draw, 50);
            }
        };
        
        //response from server
        ws.onmessage = function(evt){
            var data = JSON.parse(evt.data)
            
            if (data.message == "init") { //start, recive all stuff (all coords, colors, etc)
                var color = data.data.color;
                var collision = data.data.collision;
                var players = Object.keys(collision);
                for (var n = 0; n < players.length; n++) {
                    var p = players[n];
                    for (var i = 0; i < collision[p].length; i++) {
                        toDraw.push([collision[p][i].x, collision[p][i].y, color[collision[p][i].name]]);
                    }
                }
            }
            
            if (data.message == "killed") { //collided
                stop = true;
                console.log("-.-");
            }
            
            if (data.message == "update") { //update packet
                toDraw.push([data.data.x, data.data.y, data.data.color]);
            }
        };
        
        //"start" player
        draw();
        update();
    };
    
    var rdy = function(){
        canvas = document.getElementById("canvas");
        if (canvas == UNDEFINED) {
            setTimeout(rdy, 10);
        }
        else {
            ctx = canvas.getContext("2d");
            
            var prmstr = decodeURIComponent(window.location.search).substr(1);
            var prmarr = prmstr.split("&");
            var params = {};
            for (var i = 0; i < prmarr.length; i++) {
                var tmparr = prmarr[i].split("=");
                params[tmparr[0]] = tmparr[1];
            }
            
            canvas.width = 600;
            canvas.height = 600;
            
            ws = new WebSocket("ws://192.168.1.21:8888/");
            ws.onopen = function(){
                //ws.send("Hello, world");
                addPlayer(Math.random() * 1000, Math.random() * 1000, 0, 3, params.color || '#' + parseInt(Math.random() * 1000000), params.name || "nonename" + parseInt(Math.random() * 1000000), [38, 40, 37, 39]);
            };
        }
    }
    rdy();
})();
