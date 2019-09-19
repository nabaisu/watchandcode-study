tests({
  '1. it should insert and read libraries ': function () {
    librarySystem('name', [], () => 'Gordon');
    eq(librarySystem('name'), 'Gordon');
  },
});
