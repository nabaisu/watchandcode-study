// it sums all of the things inside an array
function sumOfIntegersInArray(array){
    //base case
    if (array.length === 0 ){
        return 0 ; //qq chose
    } else {
        //recursive case
        var newArray = [...array];
        newArray.pop();
        return array[array.length-1] + sumOfIntegersInArray(newArray)
    }
}


//range between 2 numbers
function range(firstNum, lastNum) {
    //base case
    if (lastNum - firstNum === 2) {

        return [firstNum + 1]
    } else {
        //recursive case
        var list = range(firstNum, lastNum -1)
        list.push(lastNum - 1);
        return list
    }

}

//function to calculate the exponent of a number
function exponent(number, exp){
    //base case
    if (exp === 1) {
        return number;
    } else {
        //recursive case
        return number * exponent(number, exp-1)
    }
}


//function to get the numbers of the fibonnacci numbers with the input
function fibonnacci(number){
    //base case
    //here i put 2 for the minimum possible
    if (number <= 2){
        return [0, 1];     
    } else {
    // recursive case
        list = fibonnacci(number - 1);
        list.push(list[list.length-1] + list[list.length-2]);
        return list;
    }
}

// even or odd
// (makes no sense to me but yeah the solution was even worse than this)
function evenOrOdd (number){
    //base case
    if (Math.abs(number) % 2 === 1){
        return 'odd'
    } else {
        return 'even'
    }
}


//create a sort program using recursion
function sort(array){
    length = array.length - 1
    //just in case...
    if (array.length <= 1) {
        return array;
    }
    var thereIsAnError = false;
    for (var i = 0; i < length; i++){
        left = array[i]
        right = array[i+1]
        if (array[i] > array[i+1]){
            //this means there is an error, but first lets switch
            array[i] = right;
            array[i+1] = left
            thereIsAnError = true;
            break;
        }
    }
    
    if (!thereIsAnError){
    //base case
        return array;
    } else {
        //recursive case
        return sort(array)
    }
}


//factorial
function factorial (number){
    if (number === 1){
        //base case
        return 1
    } else {
        //recursive case
        return number * factorial(number - 1)
    }
}


//parse an array
function totalIntegers(array){    
    let counter = 0;
    //base case is the for loop (finite)
    for (let i = 0; i < array.length; i++){
        //recursive case is the array type
        if (Array.isArray(array[i])){
            counter = counter + totalIntegers(array[i])
        }
        if (Number.isInteger(array[i])){
            counter++;
        }
    }
    return counter;
}


//sum the squares of the numbers inside an array
function SumSquares(array){
    let sum = 0;
    //base case finite for loop
    for (let i= 0; i< array.length;i++){
        if (Array.isArray(array[i])){
            sum = sum + SumSquares(array[i]);
        } else {
            sum = sum + (array[i]*array[i])
        }
    }
    return sum;
}


//replicate , example: replicate(3,5) => [5,5,5]

function replicate(times, number){
    //base case
    if (times === 0){
        return [];
    } else {
        //recursive case
        list = replicate(times-1 , number) 
        list.push(number)
        return list
    }
}


//find recursively inside an object
function findRecursively(id, array){
    //base case = finite for loop
    for(let i = 0; i < array.length; i++){
        //recursive case (recursion inside the arrays)
        if (Array.isArray(array[i])){
            return findRecursively(id, array[i])
        }
        if (array[i].id === id) {
            //if found, then send directly
            return array[i]
        } 
    }
}

