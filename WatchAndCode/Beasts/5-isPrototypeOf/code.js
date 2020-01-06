function isPrototypeOf(prototypeObj, object) {
  if (prototypeObj === undefined || prototypeObj === null) {
    // this should throw TypeError
    throw new TypeError("the prototype Object can't be null nor empty");
  }
  if (
    prototypeObj === Object.prototype
    && object.constructor.name === 'Object'
  ) {
    return true;
  }

   if (Object.getPrototypeOf(object) === null) {
    //base case
    return false;
   }
  //recursive case
    if (Object.getPrototypeOf(object) !== prototypeObj) {
      return isPrototypeOf(prototypeObj,Object.getPrototypeOf(object));
    } else {
      return true;
    }
 }


const canine = {
  bark() {
    console.log('bark');
  },
};

const dog = Object.create(canine);
dog.fetch = function () {
  console.log('fetch');
};

const myDog = Object.create(dog);
const empty = Object.create(null);
