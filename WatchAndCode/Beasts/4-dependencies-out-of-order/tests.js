tests({
  '1. it should be able to create a new library ': function () {
    librarySystem('ola', [], () => 'bom dia ');
    eq(librarySystem('ola'), 'bom dia ');
  },
  '2. it should be able to read a library': function () {
    eq(librarySystem('ola'), 'bom dia ');
  },
  '3. it should be able to input the result of another library as a dependency': function () {
    librarySystem('oli', ['ola'], (ola) => `${ola  }joao`);
    eq(librarySystem('oli'), 'bom dia joao');
  },

  '4. it should be able to update the value of the libraries that he is dependent on': function () {
    librarySystem('oi', ['nome'], (nome) => `${nome  } will do this task`);

    librarySystem('nome', [], () => 'my friend');
    eq(librarySystem('oi'), 'my friend will do this task');
  },
  'It should be able to load libraries out of order.': function () {
    librarySystem('workBlurb', ['name', 'company'], (name, company) => `${name  } works at ${  company}`);

    librarySystem('name', [], () => 'my friend');

    librarySystem('company', [], () => 'his company');
    eq(librarySystem('workBlurb'), 'my friend works at his company');
  },
  'It should call the libraryName callback once and cache it for later use.': function () {
    let timesCallbackHasRun = 0;
    librarySystem('myCallbackShouldRunOnce', [], () => {
      timesCallbackHasRun++;
    });

    librarySystem('myCallbackShouldRunOnce');
    librarySystem('myCallbackShouldRunOnce');

    eq(timesCallbackHasRun, 1);
  },
  'It should also cache dependencies.': function () {
    let timesCallbackHasRun = 0;
    librarySystem('cat', [], () => {
      timesCallbackHasRun++;
      return 'meow';
    });

    librarySystem('petTheCat', ['cat'], (cat) => 'The cat says: ' + cat);

    librarySystem('feedTheCat', ['cat'], (cat) => 'The cat eats and then says: ' + cat);

    eq(librarySystem('petTheCat'), 'The cat says: meow');
    eq(librarySystem('feedTheCat'), 'The cat eats and then says: meow');
    eq(timesCallbackHasRun, 1);
  },
});
