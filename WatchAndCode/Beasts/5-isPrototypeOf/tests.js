tests({
  '1. native function should return same as function ': function () {
    eq(dog.isPrototypeOf(myDog), isPrototypeOf(dog, myDog));
  },
  '2. it should return an empty object if it has no prototype': function () {
    eq(dog.isPrototypeOf(empty), isPrototypeOf(dog, empty));
  },
  '3. it should check whether the object is a prototype of the Object array itself ': function () {
    eq(
      Object.prototype.isPrototypeOf(myDog),
      isPrototypeOf(Object.prototype, myDog),
    );
  },
  '4. it should check recursively for higher levels or hierarchy ': function () {
    eq(isPrototypeOf(canine, myDog), true);
  },
  '5. it should return TypeError if the prototypeObject is null or undefined': function () {
    try {
      isPrototypeOf(null, myDog);
    } catch (e) {
      eq(e.name === 'TypeError', true);
    }
  },
});
