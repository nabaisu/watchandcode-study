function toFixed(number, precision) {

  /*special cases:
  if precision > decimals   ==> add zeros
  if precision = 0          ==> round directly
  if precision = decimals   ==> return directly same value
  if integer                ==> just add . and zeros   
  if negative number: round in absolute values (incoherences when rounding negatives)

  else: move comma, round , remove comma
  */

  //this implies that all of the below values have commas
  if (Number.isInteger(number)){
    if (precision === 0) {
      return String(number)
    } else {
      return String(number) +'.'+ addZeros(precision);
    }
  }

  var isNegative = false;
  if (number < 0) {
    isNegative = true
  }
  var stringedNumber = String(Math.abs(number));
  var length = stringedNumber.length;
  var indexOfComma = stringedNumber.match(/(\.)/).index
  var decimals = length - (indexOfComma+1);
  var finalString;

  if (precision === 0) {
      //here as implies the use of round I'll use the absolute value for it
    if (isNegative){
      // if the final result is 0 
      if (Math.round(Math.abs(number)) === 0){
        return String(Math.round(Math.abs(number)));
      // if the final result is 1
      } else {
        return '-'+String(Math.round(Math.abs(number)));
      }
    } else {
      return String(Math.round(Math.abs(number)));
    } 
  } else if (precision === decimals) {
      return String(number);
  } else if (precision > decimals) {
    //need to add decimals here
    return String(number)+addZeros(precision-decimals);
  }

  // remove the comma
  stringedNumber = stringedNumber.replace(/(\.)/, "");
  //put the comma to the side
  var delocatedString =
    stringedNumber.substring(0, indexOfComma + precision) +
    "." +
    stringedNumber.substring(indexOfComma + precision, length);

  //round and get back to a string
  var almostFinishedString = String(Math.round(Number(delocatedString)));
  if (stringedNumber.startsWith('0')){
    almostFinishedString = '0'+almostFinishedString
  }

  //get the comma back to place
  stringedNumber = stringedNumber.replace(/(\.)/, "");
  finalString =
    almostFinishedString.substring(0, indexOfComma) +
    "." +
    almostFinishedString.substring(indexOfComma, length);

    //return the final string
    if (isNegative){
      return '-'+finalString
    } 
      return finalString
     
};
// function just to add zeros to the precision numbers
function addZeros(numberOfZeros) {
  let zeroed = '';
  for (i = 0; i < numberOfZeros; i++) {
    zeroed += "0";
  }
  return zeroed;
}
