///<reference path="Astar.ts"/>

class Shortestpathex implements Graph<number[]>{   // index 0 = x, index 1 = y
    _nodeValues : Array<number[]>;
    _nodeneighbors : Array<Array<number>>;   //neighboring nodes to index node 
    _edges : Array<Array<number>>;        //from index node a to index node b
    _width : number;
    _heigth : number;
    _heuristicWeight : number;

    constructor(size:number, wall:boolean, hole:number, heuristic:number){
        this._heuristicWeight = heuristic;
        this._width = size;
        this._heigth = size;
        this._nodeValues = [];
        var index = 0;
        for(var i = 0; i < this._width; i++){
            for(var j = 0; j < this._heigth; j++){
                this._nodeValues[index] = [i,j];  
                index ++;  
            }
        }
        if(wall){
            this.makewall(hole);    
        }
        
        
        this._nodeneighbors = [[1,2],[4],[3],[5],[]];
        this._edges         = [[2,3],[2],[3],[3],[]];
        
    }
    
    makewall(hole:number){
        //make a wall
        for(var i = 4; i < 7; i++){
            if(i != hole){
                this._nodeValues.splice(this.specialIndexOf([10-i,i]),1);
            }
        }
    }
    
    getneighbors(node: number):Array<number>{
        var cur = this._nodeValues[node];
        var neig :Array<number> = [];
        var found;
        if(cur[0]>0){
            found = this.specialIndexOf([cur[0]-1,cur[1]]);
            if(found >= 0){
                neig.push(found);  
            }
        }
        if(cur[0]<this._width){
            found = this.specialIndexOf([cur[0]+1,cur[1]]);
            if (found >= 0){
                neig.push(found);
            }
        }
        if(cur[1]>0){
            found = this.specialIndexOf([cur[0],cur[1]-1]);
            if (found >= 0){
                neig.push(found);
            }
        }
        if(cur[1]<this._heigth){
            found = this.specialIndexOf([cur[0],cur[1]+1]);
            if (found >= 0){
                neig.push(found);
            }
        }
        return neig;
    }
    
    getcost(from: number,to:number):number{
        return this.manhattan(from, to);
    }
    
    manhattan(current : number, goal : number) : number{
        var cur = this._nodeValues[current];
        var gol = this._nodeValues[goal];
        //Manhathan distance
        return (Math.abs(gol[0] - cur[0]) + Math.abs(gol[1] - cur[1]));
    }
    
    heuristic_cost_estimate(current : number, goal : number) : number{
        return this.manhattan(current, goal)*this._heuristicWeight;
    }
    
    specialIndexOf(obj:number[]):number {    
        for (var i = 0; i < this._nodeValues.length; i++) {
            if (this._nodeValues[i][0] == obj[0] && this._nodeValues[i][1] == obj[1]) {
                return i;
            }
        }
        return -1;
    }
}

function printres(res:number[], nodeVal){
    if(res.length == 0){
    console.log("no path found");
    }else{
        console.log("Path -> ");
        var conv = [];
        for(var i = 0 ; i < res.length; i ++){
            conv[i]= nodeVal[res[i]].toString(); 
        }
        conv = conv.reverse();
        conv.forEach(c => {
            console.log("<" + c+">");   
        
            });
        console.log("Path length: " + conv.length);
    }

}
/* ex 1 */
console.info("Example 1 with heuristic: no wall");

var sp = new Shortestpathex(10, false, -1, 1);// 10x10 map, true for wall and 5 for hole in wall 
var as = new Astar<number[]>(sp);
var start = sp.specialIndexOf([2,2]);
var end = sp.specialIndexOf([6,6]);
console.log("Start: <2,2> End: <6,6>");
var res = as.star(start,end);
printres(res, sp._nodeValues);

/* ex 2 */
console.info("Example 2 with heuristic: wall");


var sp = new Shortestpathex(10, true, -1, 1);// 10x10 map, true for wall and 5 for hole in wall 
var as = new Astar<number[]>(sp);
var start = sp.specialIndexOf([2,2]);
var end = sp.specialIndexOf([6,6]);
console.log("Start: <2,2> End: <6,6>");
var res = as.star(start,end);
printres(res, sp._nodeValues);

/* ex 3 */
console.info("Example 3 with heuristic: wall with hole in middle");


var sp = new Shortestpathex(10, true, 5, 1);// 10x10 map, true for wall and 5 for hole in wall 
var as = new Astar<number[]>(sp);
var start = sp.specialIndexOf([2,2]);
var end = sp.specialIndexOf([6,6]);
console.log("Start: <2,2> End: <6,6>");
var res = as.star(start,end);
printres(res, sp._nodeValues);

/* ex 4 */
console.info("Example 4 without heuristic: wall with hole in middle");


var sp = new Shortestpathex(10, true, 5, 0);// 10x10 map, true for wall and 5 for hole in wall 
var as = new Astar<number[]>(sp);
var start = sp.specialIndexOf([2,2]);
var end = sp.specialIndexOf([6,6]);
console.log("Start: <2,2> End: <6,6>");
var res = as.star(start,end);
printres(res, sp._nodeValues);

/* ex 5 */
console.info("Example 5 with heuristic weight 10(instead of 1): wall with hole in middle");


var sp = new Shortestpathex(10, true, 5, 10);// 10x10 map, true for wall and 5 for hole in wall 
var as = new Astar<number[]>(sp);
var start = sp.specialIndexOf([2,2]);
var end = sp.specialIndexOf([6,6]);
console.log("Start: <2,2> End: <6,6>");
var res = as.star(start,end);
printres(res, sp._nodeValues);


/*
class eightpuzzle implements  Graph<number[][]>{
    initstate : number[][];
    goalstate : number[][];
    
    _nodeValues : Array<number[][]>;
    _nodeneighbors : Array<Array<number>>;   //neighboring nodes to index node 
    _edges : Array<Array<number>>;        //from index node a to index node b
    _width : number;
    _heigth : number;
    
    constructor(){
        this.initstate = this.createState([2, 4, 0, 5, 7, 1 ,8 ,3, 6]);
        this.goalstate = this.createState([0, 1, 2, 3, 4, 5, 6, 7, 8]);
        this._nodeValues.push(this.initstate);
        this._nodeValues.push(this.goalstate);
    }
    
    specialIndexOf(obj:number[][]):number {    
        var found = false;
        for (var i = 0; i < this._nodeValues.length; i++ ) {
            for(var j = 0; j < 3; j++ ){
                for(var k = 0 ; k < 3; k++ ){
                    if (this._nodeValues[i][j][k] == obj[j][k] && this._nodeValues[i][j][k] == obj[j][k]) {
                        found = true;
                    }else{
                        found = false;    
                    }
               
                }
            }
            if(found){
                return i;    
            }
        }
        return -1;
    }
    
    //For 8 puzzle
    heuristic_cost_estimate(current : number, goal : number) : number{
        var manhattanDist:number = 0;
        for(var i=0;i<N;i++){
            manhattanDist = current
        }
        var N = Math.sqrt(current.length)
        for(var x=0;x<N;x++){
            for(var y=0;y<N;y++){
                var currentValue:number = current[y*N + x];

                if(currentValue){ //0 is the empty block
                    var target:number = goal.indexOf(currentValue);
                    
                    manhattanDist += Math.abs(x - target / N) + Math.abs(y - target % N) 
                }
            }
        }
        //TODO
        return manhattanDist;
    }
    
    findZero(curstate: number[][]):number[]{
        var indexzero : number[] = [-1,-1];
        for(var i = 0; i < 4; i ++){
            if(instate[i].indexOf(0) >= 0){
                indexzero[0] = i;
                indexzero[1] = curstate[i].indexOf(0);
                return indexzero;
            }
        }
        return indexzero;
    }
    
    getneighbors(curindex: number):Array<number>{
        var result: Array<number[][]>;
        var curstate = this._nodeValues[curindex];
        var indexzero = this.findZero(curstate);
        
        var found;
        var nindexzero = indexzero;
        if(indexzero[0]-1 >= 0){
            nindexzero[0] = indexzero[0]-1;
            found = this.transitionState(curstate, indexzero, nindexzero);
            if(this.specialIndexOf(found)=== -1){
                this._nodeValues.push(found);
            }
            result.push(found);
        }
        if(indexzero[0]+1 < 3){
            nindexzero[0] = indexzero[0]+1;
            found = this.transitionState(curstate, indexzero, nindexzero);
            if(this.specialIndexOf(found)=== -1){
                this._nodeValues.push(found);
            }
            result.push(found);
        }
        if(indexzero[1]-1 >= 0){
            nindexzero[1] = indexzero[1]-1;
            found = this.transitionState(curstate, indexzero, nindexzero);
            if(this.specialIndexOf(found)=== -1){
                this._nodeValues.push(found);
            }
            result.push(found);    
        }
        if(indexzero[1]+1 < 3){
            nindexzero[1] = indexzero[1]+1;
            found = this.transitionState(curstate, indexzero, nindexzero);
            if(this.specialIndexOf(found)=== -1){
                this._nodeValues.push(found);
            }
            result.push(found);   
        }
        this._nodeValues.join
        return result;    
    }
    
    transitionState(instate: number[][], oldZ: number[],newZ: number[]): number[][]{
        instate[oldZ[0]][oldZ[1]] = instate[newZ[0]][newZ[1]];
        instate[newZ[0]][newZ[1]] = 0;
        return instate;
    }
    
    createState(input : number[]):number[][]{
        var sum : number = 0;
        var nstate : number [][];
        for(var i = 0; i < 3; i++){
            for(var j = 0; j < 3; j++){
                this.nstate[i][j] = input[sum];
                sum ++;
            }
        }    
        return nstate;
    }
    
    getcost(from: number,to:number):number{
        return 1;
        
    }
    
}*/
