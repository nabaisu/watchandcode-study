(function () {
  let libraryStorage = {};
  let librarySystem = function (libraryName, dependencyArray, callback) {
    if (arguments.length > 1) {
      // create mode

      if (dependencyArray.length === 0) {
        libraryStorage[libraryName] = callback();
      } else {
        let dependencyAll = [];
        dependencyArray.map((dependencyName) => {
          // run the dependency arrays ?
          dependencyAll.push(libraryStorage[dependencyName]);
        });
        libraryStorage[libraryName] = callback.apply(null, dependencyAll);
      }
    } else {
      // use mode
      return libraryStorage[libraryName];
    }
  };
  // export to root window
  window.librarySystem = librarySystem;
}());
