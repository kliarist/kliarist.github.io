let  black,white,gray,dark_gray,px,UIx_off;
let level = 0;lines=0,score=0;
function setColors(){
    UIx_off = 13 * boxSide 
    black = color(64,66,67);
    white = color(198,207,161);
    gray = color(139,147,113)
    dark_gray = color(108,115,85);
}

function displayUI(){

    display_score()
}
function display_side_wall(){
    push();
    let lineWidth = px
    strokeWeight(lineWidth)
    stroke(white);
    line(boxSide-lineWidth/2,0,boxSide-lineWidth/2,18*boxSide)
    line(13*boxSide+lineWidth/2,0,13*boxSide+lineWidth/2,18*boxSide)

    for(let i=0;i<24;i++){
      image(wall_img,1*boxSide,i*boxSide*0.75,boxSide,boxSide*0.75)
      image(wall_img,12*boxSide,i*boxSide*0.75,boxSide,boxSide*0.75)
    }
    pop();
  }
function load_Font(){
    RetroFont = loadFont('assets/font.ttf')
}
function display_score(){
    push()
    image(score_board,boxSide*13+px,0,px*55,px*144)
    fill(black);
    textFont(RetroFont);
    textSize(px*8);
    textAlign(RIGHT);
    text(score, px*153, px*31);
    text(level, px*145, px*63);
    text(lines, px*145, px*87);
    pop()
}
