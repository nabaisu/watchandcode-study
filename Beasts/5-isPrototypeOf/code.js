function isPrototypeOf(prototypeObj, object) {
  if (prototypeObj === undefined || prototypeObj === null) {
    //this should throw TypeError
    throw new TypeError("the prototype Object can't be null nor empty");
  }
  if (
    prototypeObj === Object.prototype &&
    object.constructor.name === "Object"
  ) {
    return true;
  }

  //it must return true or false
  function getNestedProto(obj) {
    return Object.getPrototypeOf(obj);
  }
  var copyOfObject = object;
  while (copyOfObject !== null) {
    if (getNestedProto(copyOfObject) === prototypeObj) {
      return true;
    } 
      copyOfObject = getNestedProto(copyOfObject);
    
  }
  return false;
}

let canine = {
  bark () {
    console.log("bark");
  },
};

let dog = Object.create(canine);
dog.fetch = function () {
  console.log('fetch');
};

let myDog = Object.create(dog);
let empty = Object.create(null);
