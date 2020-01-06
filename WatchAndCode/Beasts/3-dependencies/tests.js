tests({
  '1. it should insert and read libraries ': function () {
    librarySystem('name', [], () => {
      return "Gordon";
    });
    eq(librarySystem('name'), 'Gordon');
  },
  '2. it should be able to access other libraries as arguments ': function () {
    librarySystem('company', [], () => {
      return "Watch and Code";
    });

    librarySystem('workBlurb', ['name', 'company'], (name, company) => {
      return name + " works at " + company;
    });

    eq(librarySystem('workBlurb'), 'Gordon works at Watch and Code'); // 'Gordon works at Watch and Code'
  },
});
