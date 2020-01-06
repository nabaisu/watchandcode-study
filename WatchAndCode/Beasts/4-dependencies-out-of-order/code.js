/* eslint-disable linebreak-style */
(function library() {
  const libraryStorage = {};
  const librarySystem = function (libraryName, dependencyArray, callback) {
    if (arguments.length > 1) {
      // create mode
      storeLibrary(libraryName, dependencyArray, callback);
      //       updateLibraries(libraryName);
    } else {
      return loadLibrary(
        libraryName,
        libraryStorage[libraryName].dependencies,
        libraryStorage[libraryName].callback,
      );
    }
    // export
    window.librarySystem = librarySystem;

    // just store the library and its informations
    function storeLibrary(libraryName, dependencies, callback) {
      libraryStorage[libraryName] = {
        dependencies,
        callback,
      };
    }

    function updateLibraries(libraryName) {
      dependenciesToUpdate = checkForDependencies(libraryName);

      // if no (library was NOT used before), then just load the library
      if (dependenciesToUpdate.length === 0) {
        // if yes, then load the library and then update all of the other libraries that depend on this one
      } else {
        // all of the libraries to update are elements
        dependenciesToUpdate.map((nameOfLibraryToUpdate) => {
          const dependencyAll = [];
          libraryStorage[nameOfLibraryToUpdate].dependencies.map((
            dependencyName,
          ) => {
            // run the dependency arrays ?
            dependencyAll.push(libraryStorage[nameOfLibraryToUpdate]);
          });
          libraryStorage[nameOfLibraryToUpdate].result = libraryStorage[
            nameOfLibraryToUpdate
          ].callback.apply(null, dependencyAll);
        });
      }

      // check if the library was used before
      //      => loop over the array of the storage and check if dependencies are in the name of this one
      //      => store all of the libraries to update in an array
    }

    function checkForDependencies(libraryName) {
      let dependenciesFound = [];
      dependenciesFound = Object.keys(libraryStorage).filter((
        element,
      ) => {
        const libraryExists = libraryStorage[element].dependencies.some(
          (elemente) => elemente === libraryName,
        );
        if (libraryExists) {
          return libraryStorage[element];
        }
      });
      return dependenciesFound;
    }

    function loadLibrary(libraryName, dependencies, callback) {
      // if it was already loaded, then return its result
      if ('result' in libraryStorage[libraryName]) {
        return libraryStorage[libraryName].result;
      }
      // if she has no dependency, then run directly and cache the result
      if (libraryStorage[libraryName].dependencies.length === 0) {
        libraryStorage[libraryName].result = callback();
        return libraryStorage[libraryName].result;
      }
      // run the callback function of the function and store its value
      libraryStorage[libraryName].result = libraryStorage[
        libraryName
      ].callback.apply(null, loadDependencies(dependencies));
      return libraryStorage[libraryName].result;
    }

    function loadDependencies(dependencies) {
      let loadedDependencies = [];
      loadedDependencies = dependencies.map((libraryName) => {
        if (libraryStorage[libraryName]) {
          return loadLibrary(
            libraryName,
            libraryStorage[libraryName].dependencies,
            libraryStorage[libraryName].callback,
          );
        }
      });
      return loadedDependencies;
    }
  };
    // export to root window
  window.librarySystem = librarySystem;
  // have to get the libraries with data binding
}());
