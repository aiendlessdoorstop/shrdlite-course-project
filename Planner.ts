///<reference path="World.ts"/>
///<reference path="Interpreter.ts"/>
///<reference path="Astar.ts"/>

class Shortestpath implements Graph<number[]>{   // index 0 = x, index 1 = y
     _nodeValues : Array<WorldState>;
    _nodeneighbors : Array<Array<WorldState>>;   //neighboring nodes to index node 
    _edges : Array<Array<WorldState>>;        //from index node a to index node b
    //_width : number;
    //_heigth : number;
    _heuristicWeight : number;

    constructor(heuristic:number){
        this._heuristicWeight = heuristic;
        
        this._nodeValues = [];
        var index = 0;  
                index ++;  
        
    }

    
    getneighbors(node :number):Array<number>{
        console.log("in get neighbor func");
        var state : WorldState = this._nodeValues[node];
        //var cur = this._nodeValues[node];
        console.log("Narmpos: "+state.arm + " , holding: " + state.holding);
        var neig :Array<WorldState> = [];
        var neigNumbers :Array<number> =[];
        //var found;
        //only if not it nodevalues
        console.log("stop1");
        if(state.arm > 0){
            neig.push(state);
            neig[neig.length-1].arm = state.arm-1;
            neig[neig.length-1].planAction = "l";
        }
        console.log("stop2");
        if(state.arm < GetFloorSize(state)){
            neig.push(state);
            neig[neig.length-1].arm = state.arm+1;
            neig[neig.length-1].planAction = "r";
        }
        console.log("stop3");
        var pddlIndex:number = this.getTopObjInd(state, state.pddl.toArray());
        console.log("topobj worked");
        console.log("pddlindex" + pddlIndex);
        console.log("printing neig: " + neig[neig.length-1].toString() );
        //world.printWorld(state.holding ? "holding" : "not holding");
        if(state.holding != null){
            console.log("if1");
            neig.push(state);
            //Already holding, drop at position
             /* find object on top at positon, set as index, add relation on top between holding
             item and the current on top */ 
            var newobj : Interpreter.Literal;
             newobj.rel = "ontop";
             newobj.args = [neig[neig.length-1].holding, state.pddl[pddlIndex].args[0]];
             //neig[neig.length].holding = state.pddl.push(newobj)
             state.pddl.add(newobj);
             neig[neig.length-1].holding = null;
             neig[neig.length-1].planAction = "d";
        }else if( pddlIndex >0){//neig[neig.length-1].pddl[pddlIndex].args[0].substr(0, 1) != "f" /* object in position */) {
            console.log("if2");
            neig.push(state);
            //not holding, pick at position    
            /* find object on top at positon, set as index, remove relation, and add object to pddl.holding */             
            neig[neig.length-1].holding = this.getTopObj(state, state.pddl.toArray());
            neig[neig.length-1].pddl.remove(this.getTopRelation (state, state.pddl.toArray())); // this may be error
            neig[neig.length-1].planAction = "p";
        }
        console.log("stop4");
        for(var i = 0; i < neig.length;i++){
            var bflag:boolean = false;
            for(var j = 0; j <  this._nodeValues.length;j++){
                console.log("stop5");
                if(neig[i].arm !=  this._nodeValues[j].arm && neig[i].holding !=  this._nodeValues[j].holding){
                    //if arm is different positon, no need to check rest????
                    for(var k = 0; k < state[j].pddl.length;k++){
                        if(neig[i].pddl==state[j].pddl[k]){
                            bflag=true;
                            break;
                        }
                    }
                }
                if(bflag){break;}
            }
            if(!bflag){
                //New node did not excist before, so add it
                //if new node exist, do not return that.(no need to go back)
                console.log("NN: "+neigNumbers);
                 this._nodeValues.push(neig[i]);
                neigNumbers.push( this._nodeValues.length-1);
            }   
        }
        console.log("ENDNarmpos: "+state.arm + " , holding: " + state.holding);
        //Add new to nodevalues, return new indexes
        return neigNumbers; 
    }
    getTopObj(state:WorldState, pddls:Interpreter.Literal[]):string{
        var ind :number= -1;
        var fln = state.arm;
        var z = "f" + fln.toString();
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            var x = pddl.args[1];
            if(pddl.rel == "ontop" && this.equalObjects(state.objects[x], state.objects[z])){
                z = pddl.args[0];
                ind=index;
                index = -1;

                //counter++;
            }
        }
        return z;
    }
    
    getTopRelation(state:WorldState, pddls:Interpreter.Literal[]):Interpreter.Literal{
        var ind :number= -1;
        var fln = state.arm;
        var z = "f" + fln.toString();
        var pd;
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            var x = pddl.args[1];
            if(pddl.rel == "ontop" && this.equalObjects(state.objects[x], state.objects[z])){
                z = pddl.args[0];
                ind=index;
                index = -1;
                pd = pddl;

                //counter++;
            }
        }
        return pddl;
    }

    getTopObjInd(state:WorldState, pddls:Interpreter.Literal[]):number{
        var ind :number= -1;
        var fln = state.arm;
        var z = "f" + fln.toString();
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            var x = pddl.args[1];
            if(pddl.rel == "ontop" && this.equalObjects(state.objects[x], state.objects[z])){
                z = pddl.args[0];
                ind=index;
                index = -1;

                //counter++;
            }
        }
        return ind;
    }


    getcost(from: number,to:number):number{
        return 1;
    }
    

    //counts objects on top of given object
    countOnTop(a:string,state:WorldState, pddls:Interpreter.Literal[]):number{
        var counter = 0;
        var z = a;
        console.log("at countontop");
         for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            var x = pddl.args[1];
            if(this.equalObjects(state.objects[x], state.objects[z])){
                z = pddl.args[0];
                index = -1;
                counter++;
            }
        }
        console.log("returning from countontop");
        return counter;
    }

    amountOfTiles(a:string, state:WorldState, pddls:Interpreter.Literal[]){
        var counter = 0;
        counter += this.findPosition(a,state, pddls);
        
        var floor;
        var x = a;
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            if(this.equalObjects(state.objects[pddl.args[0]], state.objects[x])){
                if(state.objects[pddl.args[1]].form == "floor") {
                    //found floor
                    floor = pddl.args[1];//----------------------------------
                }
                else{
                    x = pddl.args[1];
                    index = -1;
                }
            }
        }
        //time to move rightwards along the floors
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            if(pddl.rel == "rightof" &&  this.equalObjects(state.objects[pddl.args[1]], state.objects[floor])){
                floor = pddl.args[0];
                index = -1;
                counter ++;
            }
        }
        return counter;
    }


    //returns x-pos (0->x) for object a
    findPosition(a:string, state:WorldState, pddls:Interpreter.Literal[]):number{
       var x = a;
       var position = 0;
       var floor;
       console.log("at findPosition");
        for(var index = 0; index < pddls.length; index++){
  
            var pddl = pddls[index];
            if(this.equalObjects(state.objects[pddl.args[0]], state.objects[x])){
                if(state.objects[pddl.args[1]].form == "floor") {
                    //found floor
                    floor = pddl.args[1];
                }
                else{
                    x = pddl.args[1];
                    index = -1;
                }
            }
        }
        //time to move leftwards along the floors
        for(var index = 0; index < pddls.length; index++){
            var pddl = pddls[index];
            if(pddl.rel == "leftof" && this.equalObjects(state.objects[pddl.args[1]], state.objects[floor])){
                floor = pddl.args[0];
                index = -1;
                position ++;

            }
            if(floor == "f0"){
                console.log("returning from findPosition1");
                return position;
            }
        }
        return position;//should never happen
    }
    equalObjects(a:ObjectDefinition, b:ObjectDefinition):boolean{
       // if(a == null || b == null)
         //   return true;
        if(a.form == b.form && a.color == b.color && a.size == b.size)
            return true;
        return false;
    }

    heuristic_cost_estimate(current:number, goal:Interpreter.Literal[]):number{
        var count = 0;
        for(var i = 0; i < goal.length; i++ ){
            console.log("starting heur loop");
            if(goal[i] != null){
                console.log("wasnt null");
                count += this.heuristic_cost(current, goal[i]);

            }
        }
        console.log("finished heur");
        console.log("armpos: "+ this._nodeValues[current].arm + " , holding: " +  this._nodeValues[current].holding);
        return count;
    }

    heuristic_cost(current:number, goal:Interpreter.Literal):number{//some parts can be improved
        var cond = goal;
        var state = this._nodeValues[current];
        console.log("printing a: "+cond.args[0]+", b: " +cond.args[1] );
        var ao = state.objects[cond.args[0]];
        var a = cond.args[0];
        var pddls = state.pddl.toArray();
        var count = 0;
        var samePile:boolean = false;
        console.log("at heuristics");

        
        console.log("11armpos: "+state.arm + " , holding: " + state.holding);
        if(cond.rel == "hold"){
            console.log("at hold1");
            if(state.holding != null){
                console.log("at hold2");
                if(this.equalObjects(state.objects[state.holding], ao)){
                    return 0;
                }
                else{
                    return this.countOnTop(a,state,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm-1) +1;//should maybe be +2..
                }
            }
            else{
                console.log("not holding the right object");
                return this.countOnTop(a,state,pddls) + Math.abs(this.findPosition(a,state,pddls)-state.arm);
            }
        }
        console.log("after hold");
        var bo = state.objects[cond.args[1]];
        var b = cond.args[1];
        console.log("a: " + a + ", b: " + b + ", hold: " + state.holding);

        if(cond.rel == "ontop" || cond.rel == "inside"){
            //if a above b, take #objects on b * 4 + (ifnotinsamepile)#objects on a*4 + distancefromcrane to a + distancefromatob
            if(state.holding != null && this.equalObjects(state.objects[state.holding], state.objects[a]) && this.countOnTop(b,state,pddls) == 0){//check if a's stack is full
                return 1 + Math.abs(this.findPosition(b,state,pddls) - state.arm);
            }
            else if(state.holding != null && this.equalObjects(state.objects[state.holding], state.objects[b])){
                return 1+ this.countOnTop(a,state,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)+2;
            }
            
            var z = b;
            //traverse up through b;
            for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[1];
                if(this.equalObjects(state.objects[x], state.objects[z])){
                    if(this.equalObjects(state.objects[pddl.args[0]], ao)){
                        if(this.equalObjects(state.objects[pddl.args[1]],bo))
                            return 0;
                        samePile = true;

                    }
                    else{
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    }
                }

            }
            //if a is not in the same pile as b, check how many objects on top of a
            if(!samePile){
                z= a;//z ==a...
                for(var index = 0; index < pddls.length; index++){
                    var pddl = pddls[index];
                    var x = pddl.args[1];
                    if(this.equalObjects(state.objects[x],state.objects[z])){
                       
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    
                    }

                }
                //check distance from crane to a + distance from a to b, also multiply count by 4(number of moves for each object)
                count = count * 4 + Math.abs(this.findPosition(a,state,pddls)-state.arm) + Math.abs(this.findPosition(a,state,pddls)
                 - this.findPosition(b,state,pddls));
                

            }
            else{
               count = count*4 + Math.abs(this.findPosition(a,state,pddls) - state.arm) + 3;//if they are in the same pile but not finished, a will require 3 more moves to get back
            }
            return count; 

        }
        else if(cond.rel == "above"){
            if(state.holding != null && this.equalObjects(state.objects[state.holding], ao)){
                return 1 + Math.abs(this.findPosition(b,state,pddls) - state.arm);
            }
            else if(state.holding != null && this.equalObjects(state.objects[state.holding], bo)){
                return 1+ this.countOnTop(a,state,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)*2;
            }
            if(this.findPosition(a,state,pddls) == this.findPosition(b,state,pddls) && this.countOnTop(b,state,pddls) > this.countOnTop(a,state,pddls))//check if completed
                return 0;
            var z = a;
            //traverse up through a;
             for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[1];
                if(this.equalObjects(state.objects[x],state.objects[z])){
                    if(this.equalObjects(state.objects[ pddl.args[0]], bo))
                        samePile = true;
                    else{
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    }
                }

            }
            count = count*4;
            if(this.findPosition(a,state,pddls) == this.findPosition(b,state,pddls))
                   count += 3 + Math.abs(this.findPosition(b,state,pddls) - state.arm);
            else{
                count += Math.abs(this.findPosition(a,state,pddls)-state.arm) + Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls));
            }

            return count;
        }
        else if(cond.rel == "under"){
            if(state.holding != null && this.equalObjects(state.objects[state.holding], bo)){//check if a's stack is full
                return 1 + Math.abs(this.findPosition(a,state,pddls) - state.arm);
            }
            else if(state.holding != null && this.equalObjects(state.objects[state.holding], ao)){
                return 1+ this.countOnTop(b,state,pddls)*4 + Math.abs(this.findPosition(b,state,pddls)-state.arm)*2;
            }
            if(this.findPosition(a,state,pddls) == this.findPosition(b,state,pddls) && this.countOnTop(b,state,pddls) < this.countOnTop(a,state,pddls))
                return 0;
            var z = cond.args[0];
            //traverse up through b;
             for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[1];
                if(this.equalObjects(state.objects[x],state.objects[z])){
                    if(this.equalObjects(state.objects[pddl.args[0]], ao))
                        samePile = true;
                    else{
                        z = pddl.args[0];
                        index = -1;
                        count++;
                    }
                }

            }
            count = count*4;
            if(this.findPosition(a,state,pddls) == this.findPosition(b,state,pddls))
                count += 3 + Math.abs(this.findPosition(b,state,pddls) - state.arm);
            else{
                count += Math.abs(this.findPosition(b,state,pddls)-state.arm) + Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls));
            }

            return count;
        }
        else if(cond.rel == "rightof"){//currently not handling if B is in holding

            if(state.holding != null && this.equalObjects(state.objects[state.holding], ao) && this.findPosition(b,state,pddls) != this.amountOfTiles(b,state,pddls)){
                return Math.abs(this.findPosition(b,state,pddls)-state.arm+1); // currently not checking if stack next to b is full

            }
            else if(state.holding != null && this.equalObjects(state.objects[state.holding], bo)){
                return 1+ this.countOnTop(a,state,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)*2;
            }

            if(this.findPosition(b,state,pddls) == this.amountOfTiles(b,state,pddls)){//not perfect
                count = this.countOnTop(a,state,pddls)*4 + this.countOnTop(b,state,pddls) + Math.abs(this.findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls)-1))+2;//not working if both in the last stack?
            }

            if(this.countOnTop(b,state,pddls)>this.countOnTop(a,state,pddls)){

                count = this.countOnTop(b,state,pddls)*4 + Math.abs(this.findPosition(b,state,pddls)-state.arm) + (Math.abs(this.findPosition(a,state,pddls)
                -this.findPosition(b,state,pddls)+1))+2;//+2 is for picking up and dropping b 
            }
            else{
                //move A
                count = this.countOnTop(a,state,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm) + (Math.abs(this.findPosition(a,state,pddls)
                    -this.findPosition(b,state,pddls)+1))+2;
            }

        }
        else if(cond.rel == "leftof"){
            if(state.holding != null && this.equalObjects(state.objects[state.holding], ao) && this.findPosition(b,state,pddls) != 0){
                return Math.abs(this.findPosition(b,state,pddls)-state.arm-1); // currently not checking if stack next to b is full

            }
            else if(state.holding != null && this.equalObjects(state.objects[state.holding], bo)){
                if(this.amountOfTiles(a,state,pddls) == state.arm)
                    return 2+ this.countOnTop(a,state,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)*2;
                return 1+ this.countOnTop(a,state,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)*2;
            }

            if(this.findPosition(b,state,pddls) == 0){//not perfect
                count = this.countOnTop(a,state,pddls)*4 + this.countOnTop(b,state,pddls) + Math.abs(this.findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls)-1))+2;
            }

            else if(this.countOnTop(b,state,pddls)>this.countOnTop(a,state,pddls)){

                count = this.countOnTop(a,state,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm) 
                + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls)-1))+2;//+2 is for picking up and dropping b 
            }
            else{
                //move B
                count = this.countOnTop(b,state,pddls)*4 + Math.abs(this.findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls)-1))+2;
            }

        }
        else if(cond.rel == "beside"){
            if(state.holding != null && this.equalObjects(state.objects[state.holding], ao)){
                return Math.abs(this.findPosition(b,state,pddls)-state.arm)-1; // currently not checking if stack next to b is full
            }
             else if(state.holding != null && this.equalObjects(state.objects[state.holding], bo)){
                return 1 + Math.abs(this.findPosition(a,state,pddls)-state.arm)-1;
            }
            if(this.countOnTop(b,state,pddls)>this.countOnTop(a,state,pddls)){

                count = this.countOnTop(b,state,pddls)*4 + Math.abs(this.findPosition(b,state,pddls)-state.arm) 
                + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls))-1)+2;//+2 is for picking up and dropping b 
            }
            else{
                //move A
                count = this.countOnTop(a,state,pddls)*4 + Math.abs(this.findPosition(a,state,pddls)-state.arm)
                 + (Math.abs(this.findPosition(a,state,pddls)-this.findPosition(b,state,pddls))-1)+2;
            }
            // a on floor? #objects on top of b + #objects leftofA < rightofA

        }
        console.log("Path length: " + count);
        return count;

    }
    specialIndexOf(obj:number[]):number {    
        for (var i = 0; i < this._nodeValues.length; i++) {
            if (this._nodeValues[i][0] == obj[0] && this._nodeValues[i][1] == obj[1]) {
                return i;
            }
        }
        return -1;
    }
    reachedGoal(current: number, cond :  Interpreter.Literal[]):boolean{
      // var state = this._nodeValues[current];
        for(var i = 0; i < cond.length; i++ ){
            if( cond[i] != null && !this.checkGoal( current, cond[i]))
                return false;
            
        }
        return true;
    }

    checkGoal(current:number, goal:Interpreter.Literal):boolean {
        console.log("at checkgoal");
        var cond = goal;
        var state = this._nodeValues[current];
        var a = cond.args[0];
        var pddls = state.pddl.toArray();

        if(cond.rel == "hold"){
            console.log("this is it");
            if(state.holding != null && this.equalObjects(state.objects[state.holding], state.objects[a]))
                return true;
            return false;
        }
        var b = cond.args[1];

        if(cond.rel == "above"){
            for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[0];
                if(this.equalObjects(state.objects[x], state.objects[a])){
                    var y = pddl.args[1];
                    if(this.equalObjects(state.objects[y], state.objects[b]))
                        return true;
                    else if(state.objects[y].form == "floor") //hopefully this is the correct syntax
                        return false;
                    else{
                       a=x;
                       index =-1;
                    }
                }
            }
        }
        else if(cond.rel == "ontop" || cond.rel == "inside"){
            for(var index = 0; index < pddls.length; index++){
                 var pddl = pddls[index];
                 if(this.equalObjects(state.objects[pddl.args[0]], state.objects[a])){
                    if(this.equalObjects(state.objects[pddl.args[1]], state.objects[b]))
                        return true;
                    return false;
                 }
            }
        }
        else if(cond.rel == "under"){
             for(var index = 0; index < pddls.length; index++){
                var pddl = pddls[index];
                var x = pddl.args[0];
                if(this.equalObjects(state.objects[x], state.objects[b])){
                    var y = pddl.args[1];
                    if(this.equalObjects(state.objects[y],state.objects[a]))
                        return true;
                    else if(state.objects[y].form == "floor") 
                        return false;
                    else{
                       b=x;
                       index =-1;
                    }
                }
            }
            
        }
        else if(cond.rel == "beside"|| cond.rel == "rightof"|| cond.rel == "leftof"){
            if(cond.rel == "beside"|| cond.rel == "rightof"){
                //find floor (a is rightof b, so floor to left of floor and search upwards)
                var floor;
                for(var index = 0; index < pddls.length; index++){
                    var pddl = pddls[index];
                    var x = pddl.args[0];
                    if(x == a){
                        if(state.objects[pddl.args[1]].form == "floor")
                            floor = pddl.args[1];//found floor
                        else{
                           a=x;
                           index =-1;
                        }
                    }
                }
                var floor2;
                for(var indexFloor= 0; indexFloor < pddls.length; indexFloor++){
                    var pddl = pddls[indexFloor];
                    var x = pddl.args[0];
                    if(pddl.rel == "rightof" && this.equalObjects(state.objects[x],state.objects[floor])){
                        floor2 = pddl.args[1];
                    }
                    //found floor, now work up
                }
                for(var indexLeft = 0; indexLeft < pddls.length; indexLeft++){
                    var pddl = pddls[indexLeft];
                    var x = pddl.args[1];
                    if(this.equalObjects(state.objects[x],state.objects[floor2])){
                        if(this.equalObjects(state.objects[pddl.args[0]], state.objects[b]))
                            return true;
                        else{
                            floor2 = pddl.args[0];
                            indexLeft = -1;
                        }
                    }

                }

            }
            if(cond.rel == "beside"|| cond.rel == "leftof"){
                var floor;
                for(var index = 0; index < pddls.length; index++){
                    var pddl = pddls[index];
                    var x = pddl.args[0];
                    if(this.equalObjects(state.objects[x], state.objects[a])){//------------------
                        if(state.objects[pddl.args[1]].form == "floor")
                            floor = pddl.args[1];//found floor
                        else{
                           a=x;
                           index =-1;
                        }
                    }
                }
                var floor2;
                for(var indexFloor= 0; indexFloor < pddls.length; indexFloor++){
                    var pddl = pddls[indexFloor];
                    var x = pddl.args[0];
                    if(pddl.rel == "leftof" && this.equalObjects(state.objects[x],state.objects[floor])){
                        floor2 = pddl.args[1];
                    }
                    //found floor, now work up
                }
                for(var indexRight = 0; indexRight < pddls.length; indexRight++){
                    var pddl = pddls[indexRight];
                    var x = pddl.args[1];
                    if(this.equalObjects(state.objects[x],state.objects[floor2])){
                        if(this.equalObjects(state.objects[pddl.args[0]], state.objects[b]))
                            return true;
                        else{
                            floor2 = pddl.args[0];
                            indexRight = -1;
                        }
                    }

                }
            }
            return false;
            
        }
        return true;
    }
}


function GetFloorSize(state : WorldState):number{
    var nFloors : number = 0;
    do{
        nFloors++;
        var temp : Interpreter.Literal[] = state.pddl.toArray();
        for(var i = 0; i < state.pddl.size(); i++){
            var found : boolean = (temp[i].args[0]=="f" + nFloors);
            if(found){
                break;
            }
        }
        
     }while(!found)          
    return nFloors;
}


module Planner {

    //////////////////////////////////////////////////////////////////////
    // exported functions, classes and interfaces/types

    export function plan(interpretations : Interpreter.Result[], currentState : WorldState) : Result[] {
        var plans : Result[] = [];

        interpretations.forEach((intprt) => {
            var plan : Result = <Result>intprt;
            plan.plan = planInterpretation(plan.intp, currentState);
            plans.push(plan);
        });
        if (plans.length) {
            return plans;
        } else {
            throw new Planner.Error("Found no plans");
        }
    }


    export interface Result extends Interpreter.Result {plan:string[];}


    export function planToString(res : Result) : string {
        return res.plan.join(", ");
    }


    export class Error implements Error {
        public name = "Planner.Error";
        constructor(public message? : string) {}
        public toString() {return this.name + ": " + this.message}
    }


    //////////////////////////////////////////////////////////////////////
    // private functions

    function planInterpretation(intprt : Interpreter.Literal[][], state : WorldState) : string[] {
        
        console.log("armpos: "+state.arm + " , holding: " + state.holding);
        var shortest = null;//keeps track of shortest path encountered

        var sp = new Shortestpath(1);
        var as = new Astar<number[]>(sp);

        sp._nodeValues.push(state);//added this.. not sure if this is the place

        var result = null;
        var temp;
        var tempNodevalues = [];
        for(var i = 0; i < intprt.length; i++){
            this._nodeValues = [];
            this._neighborValues = [];
            this._nodeValues.push(state);

            temp = as.star(0, intprt[i]);

            if(result == null ||temp.length < result.length ){
                result = temp;      
                tempNodevalues = this._nodeValues;
            }

        }
        this._nodeValues = tempNodevalues;

        //sen execute:A den bästa planen (om det blev någon plan)
        var plan : string[] = [];

        if(result != null){
            console.log("length of plan: " + tempNodevalues.length)
            for(var i = 0; i<this._nodeValues.length; i++ ){
                console.log("action planned: "+this._nodeValues[i].planAction);
                plan.push("p");//possible to check what kind of action and add text here
            }
        }
        else{
            //throw error
        }
        console.log("armpos2: "+state.arm + " , holding: " + state.holding);
        return plan;
    }


    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }




    
    
    
}
