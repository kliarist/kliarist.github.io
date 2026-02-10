j=[
    [true,false,false,false],
    [true,true,true,false],
    [false,false,false,false],
    [false,false,false,false]
    ]
l=[
    [false,false,true,false],
    [true,true,true,false],
    [false,false,false,false],
    [false,false,false,false]
    ]
t=[
    [false,true,false,false],
    [true,true,true,false],
    [false,false,false,false],
    [false,false,false,false]
    ]
o =[
    [false,true,true,false],
    [false,true,true,false],
    [false,false,false,false],
    [false,false,false,false]
    ]
s=[
    [false,true,true,false],
    [true,true,false,false],
    [false,false,false,false],
    [false,false,false,false]
    
    ]
z =[
    [true,true,false,false],
    [false,true,true,false],
    [false,false,false,false],
    [false,false,false,false]
    ]
i=[
    [false,false,false,false],
    [true,true,true,true],
    [false,false,false,false],
    [false,false,false,false]
    ]
let randomclock = 0;
let BlocksArray = [[j,"j"],[l,"l"],[t,"t"],[o,"o"],[s,"s"],[z,"z"],[i,"i"]]
let nextBlocks  = []
const setRandomiser = () => {
    if(randomclock===0){
        shuffle(BlocksArray,true)
        nextBlocks.push(...BlocksArray)
    }
    
    currentBlock=[...nextBlocks[0][0]]
    currentBlockType = nextBlocks[0][1]
    nextBlocks.shift()    
}
const RandomiserInit = () =>{
    nextBlocks = []
    shuffle(BlocksArray,true)
    nextBlocks.push(...BlocksArray)
}
