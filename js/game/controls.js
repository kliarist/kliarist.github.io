window.addEventListener("keydown",
(event)=>{
    if(event.key=== "ArrowRight"){
        if(checkifPossible(currentBlock,0,1)){
            leftOff = (leftOff+1)%11
            setTempBlock()
        }
    }
    else if(event.key=== "ArrowDown"){
        if(checkifPossible(currentBlock,1,0)){
            topOff = (topOff+1)%20
            score++;
            setTempBlock()
        } else {
            setCurrentBlock(topOff,leftOff)
            randomclock = (randomclock+1)%7
            setRandomiser()
            Holdpressed=false
            topOff=1;
            leftOff=3;
            setTempBlock()
            checkRow()
        }
    }
    else if(event.key=== "ArrowLeft"){
        if(checkifPossible(currentBlock,0,-1)){
            leftOff = (leftOff-1)%11
            
            setTempBlock()
        }
            
    }
    else if(event.key === "ArrowUp"){
        topOff = topOff
        cb = currentBlock.map(s=>[...s])
        rotateBlock(cb)
        if(checkifPossible(cb,0,0)){
            currentBlock = cb
            setTempBlock()
        }
    }
    else if(event.key ==="c"){
        setHold()
        setTempBlock()
        Holdpressed = true
    }
    else if(event.key ===" "){
        if(gameStart) {
            gameOver = !gameOver
            setTempBlock()
            playPauseMusic();
        }
    }
    else if(event.key==="Shift"){
        topOff = tempTopOff
    }
    else if(event.key ==="Enter"){
        // Reset game on game over
        if(gameOver) {
            gameOver = false;
            score = 0;
            level = 0;
            speed = 30;
            clearGrid();
            setStaticBlocks();
            setStaticBlockColors();
            setBLock();
            setRandomiser();
            setTempBlock();
        }
        gameStart = true;
        window.gameStart = true;
        
        // Start music on first interaction
        if(!themeSongPlay) {
            playPauseMusic();
        }
    }
})
const checkifPossible=(cb,xoff,yoff)=>{
    for(let i=0;i<4;i++){
        for(let j=0;j<4;j++){
            if(cb[i][j] && staticGrid[i+topOff+xoff][j+leftOff+yoff]){
                return false
            }
        }
    }
    return true
}
function rotateBlock(a) {
    
    if(currentBlockType!=="o"){
        var n=a.length;
        if(currentBlockType!=="i")
            n--;

        for (var i=0; i<n/2; i++) {
            for (var j=i; j<n-i-1; j++) {
                var tmp=a[i][j];
                a[i][j]=a[n-j-1][i];
                a[n-j-1][i]=a[n-i-1][n-j-1];
                a[n-i-1][n-j-1]=a[j][n-i-1];
                a[j][n-i-1]=tmp;
            }
        }
        if(leftOff===0){
            leftOff++;
        }
        if(leftOff===9){
            leftOff--;
        }
    }
};