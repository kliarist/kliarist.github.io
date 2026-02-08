let grid = new Array(20)
let leftOff=3,topOff=1;
let staticGrid = new Array(20)
let staticGridColors = new Array(20)
let currentBlock;
let currentBlockType =null;
let holdBlock = [] 
let Holdpressed = false;
let speed = 30,Currentspeed =25;
let tempTopOff =0;


const clearGrid=()=>{
    for(let i=0;i< 20 ;i++){
        grid[i]=new Array(12)
        .fill(false)
    }
}

const setStaticBlocks = ()=>{
    staticGrid = new Array(20);
    for(let i=0;i<20;i++){
        staticGrid[i] = new Array(12).fill(false)
        staticGrid[i][0] = true
        staticGrid[i][11] = true
    }
    staticGrid[0] = new Array(12).fill(true)
    staticGrid[19] = new Array(12).fill(true)
}

const setStaticBlockColors = ()=>{
    staticGridColors = new Array(20);
    for(let i=0;i<20;i++){
        staticGridColors[i] = new Array(12).fill("0")
        staticGridColors[i][0] = "f"
        staticGridColors[i][11] = "f"
    }
    staticGridColors[0] = new Array(12).fill("f")
    staticGridColors[19] = new Array(12).fill("f")
}


const setBLock=()=>{
    leftOff =3;
    topOff = 1;
}


const setCurrentBlock = (t,l) =>{    

    for(let i=0;i<min(4,20-t);i++){
        for(let j=0;j<4;j++){
            staticGridColors[i+t][j+l] = (currentBlock[i][j])?currentBlockType:staticGridColors[i+t][j+l]
            staticGrid[i+t][j+l] = currentBlock[i][j] ||  staticGrid[i+t][j+l]
        }
    }    
}

const setTempBlock = ()=>{
    let i=0;
    for(i=0;i<=18-topOff;i++){
     tempTopOff=topOff+i;
     if(!checkifPossible(currentBlock,i,0)){
         break
        }      
    } 
}

const updateGrid=()=>{
    let isFree = true
    clearGrid()
    for(let i=0;i<4;i++){
        for(let j=0;j<4;j++){
            if(currentBlock[i][j] &&  staticGrid[i+topOff][j+leftOff]){
                setCurrentBlock(topOff-1,leftOff)
                randomclock = (randomclock+1)%7
                setRandomiser()
                isFree= false
                Holdpressed=false
                topOff=1;
                leftOff =4;
                setTempBlock()
                break
            }
        }
    }
    if(isFree){
        if(topOff<19){
            topOff++;
        }
        else{
            setCurrentBlock(topOff,leftOff)
            randomclock = (randomclock+1)%7
            setRandomiser()
            Holdpressed=false
            topOff=2;
            leftOff=4;
        }
    }

}

const checkRow =()=>{
let fullRow=0;
for(let i=1;i<11;i++){
    if(staticGrid[1][i]){
        gameOver=true
    }
}
   staticGrid = staticGrid.filter( (st,ind) => {
    if(ind>0 && ind<19)    
        for(let i=0;i<12;i++){
                if(!st[i]){
                    return true
                } 
            }
    else{
        return true
    }
        

    return false 
    
    })
    staticGridColors = staticGridColors.filter( (st,ind) => {
        if(ind>0 && ind<19)    
            for(let i=0;i<12;i++){
                    if(st[i]==="0"){
                        return true
                    }
                        
                }
        else
            return true
    
        return false 
        
        })
    fullRow = 20 - staticGrid.length
    if(fullRow!=0){
        lines+=fullRow;
        if((level+1)*10<=lines){
            speed--;
        }
        level = int(lines/10)
        if(fullRow===1){
            score += 40*(level+1)
        }
        else if(fullRow===2){
            score += 100*(level+1)
        }
        else if(fullRow===3){
            score += 300*(level+1)
        }
        else if(fullRow===4){
            score += 1200*(level+1)
        }
        
    }
    while( fullRow>0 ){
        staticGrid.splice(1,0,new Array(12).fill(false))
        staticGridColors.splice(1,0,new Array(12).fill("0"))
        staticGridColors[1][0]="f"
        staticGridColors[1][11]="f"
        staticGrid[1][0]=true;
        staticGrid[1][11]=true;
        fullRow--;
    }
        
}


const setHold = () => {
    if(holdBlock.length===0){
        holdBlock = [currentBlock,currentBlockType]
        randomclock = (randomclock+1)%7
        setRandomiser()
        topOff=2;
        leftOff=4;
    }
    else{
        if(!Holdpressed){
            let temp = holdBlock
            holdBlock = [currentBlock,currentBlockType]
            currentBlock = temp[0]
            currentBlockType = temp[1] 
            topOff = 2
            leftOff =4           
        }
    }
        
} 