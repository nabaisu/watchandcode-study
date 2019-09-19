/* eslint-disable linebreak-style */

const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

const util = {
  store(namespace, data) {
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    }
    const store = localStorage.getItem(namespace);
    return (store && JSON.parse(store)) || [];
  },
  uuid() {
    /* jshint bitwise:false */
    let i; let random;
    let uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
  },
};


const model = {
  todos: util.store('todos-jquery'),

  // add a todo with id,
  addTodo(todoText, idofparent) {
    if (arguments.length > 1) {
      // it has a parent, find parent and add to the subTodos array
      const elementToAddSubTodo = this.findIdRecursively(idofparent, this.todos); // need to get a recursive pattern here to find the element needed
      elementToAddSubTodo.subTodos.push({
        id: util.uuid(),
        todoText,
        subTodos: [],
        completed: false,
      });
    } else {
      this.todos.push({
        id: util.uuid(),
        todoText,
        subTodos: [],
        completed: false,
      });
    }
    // this.store('todos-jquery', this.todos);
  },
  //find recursively inside an object
  findIdRecursively: function (id, array) {
    //base case = finite for loop
    let encontrei = false;
    for (let i = 0; i < array.length; i++) {
      if (encontrei){
        return encontrei
      }
      if (array[i].id === id) {
        //if found, then send directly
        return array[i]
      }
      //recursive case (recursion inside the objects)
      if (array[i].subTodos.length !== 0) {
        encontrei = this.findIdRecursively(id, array[i].subTodos) //either false or the object
      }
    }
  },
  changeTodo(position, todoText, idofparent) {
    const todo = this.todos[position];
    todo.todoText = todoText;
    this.store('todos-jquery', this.todos);
  },
  deleteTodo(position) {
    this.todos.splice(position, 1);
    this.store('todos-jquery', this.todos);
  },
  toggleCompleted(position) {
    const todo = this.todos[position];
    todo.completed = !todo.completed;
    this.store('todos-jquery', this.todos);
  },
  toggleAll() {
    const totalTodos = this.todos.length;
    let completedTodos = 0;
    this.todos.forEach((item) => {
      if (item.completed === true) {
        completedTodos += 1;
      }
    });
    this.todos.forEach((todo) => {
      if (completedTodos === totalTodos) {
        todo.completed = false;
      } else {
        todo.completed = true;
      }
    });
    this.store('todos-jquery', this.todos);
  },
  store() {
    util.store('todos-jquery', this.todos);
  },
};


const view = {
  init() {
    this.displayTodos();
  },
  displayTodos() {
    // display the todos in this ul element
    const todosUl = document.querySelector('ul');
    todosUl.innerHTML = '';
    model.todos.forEach(function toBeUsedOnForEach(todo, index) {
      const todosLi = document.createElement('li');
      let todoTextWithCompletion = '';
      if (nestTodos in todo) {
        // recurse

      } else {
        /*
          don't recurse
          just print normally under the other before him
          things to do:
            - get the value of the above parent
            - set the nested under under this
         */
      }
      if (todo.completed === true) {
        todoTextWithCompletion = `[X] ${todo.todoText}`;
      } else {
        todoTextWithCompletion = `[ ] ${todo.todoText}`;
      }
      todosLi.id = index;
      todosLi.dataset.amigo = index;
      todosLi.textContent = todoTextWithCompletion;
      todosLi.appendChild(this.createDeleteButton());
      todosUl.appendChild(todosLi);
    }, this);
  },
  createDeleteButton() {
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'deleteButton';
    return deleteButton;
  },
  setupEventListeners() {
    const todosUl = document.querySelector('ul');
    // main input on the top
    const mainInput = document.getElementById('addTodoInputText');

    mainInput.addEventListener('keyup', (event) => {
      if (event.which === 13) {
        octopus.addTodo();
      }
    });


    // inside the ul
    todosUl.addEventListener('click', (event) => {
      const elementClicked = event.target;
      // event listener for the delete button
      if (elementClicked.className === 'deleteButton') {
        const position = elementClicked.parentNode.dataset.amigo;
        octopus.deleteTodo(position);
      }
    });
    todosUl.addEventListener('dblclick', (event) => {
      const elementClicked = event.target;
      // event listener for the delete button
      if (elementClicked.className === 'deleteButton') {
        const position = parseInt(elementClicked.parentNode.id);
        octopus.deleteTodo(position);
      }
    });
    /*
    document.getElementsByClassName('new-todo').on('keyup', this.create.bind(this));
    document.getElementsByClassName('toggle-all').on('change', this.toggleAll.bind(this));
    document.getElementsByClassName('footer').on('click', '.clear-completed', this.destroyCompleted.bind(this));
    document.getElementsByClassName('todo-list')
      .on('change', '.toggle', this.toggle.bind(this))
      .on('dblclick', 'label', this.editingMode.bind(this))
      .on('keyup', '.edit', this.editKeyup.bind(this))
      .on('focusout', '.edit', this.update.bind(this))
      .on('click', '.destroy', this.destroy.bind(this));
      */
  },
};


const octopus = {

  init() {
    view.init();
    view.setupEventListeners();
  },
  addTodo() {
    const addTodoInputText = document.getElementById('addTodoInputText');
    model.addTodo(addTodoInputText.value);
    addTodoInputText.value = '';
    view.displayTodos();
  },
  changeTodo() {
    const changeTodoInputPosition = document.getElementById('changeTodoInputPosition');
    const changeTodoInputText = document.getElementById('changeTodoInputText');

    model.changeTodo(changeTodoInputPosition.valueAsNumber, changeTodoInputText.value);

    changeTodoInputPosition.value = '';
    changeTodoInputText.value = '';

    view.displayTodos();
  },
  deleteTodo(position) {
    model.deleteTodo(position);
    view.displayTodos();
  },
  toggleCompleted() {
    const toggleCompletedInputPosition = document.getElementById('toggleCompletedInputPosition');
    model.toggleCompleted(toggleCompletedInputPosition.valueAsNumber);
    toggleCompletedInputPosition.value = '';
    view.displayTodos();
  },
  toggleAll() {
    model.toggleAll();
    view.displayTodos();
  },
};

octopus.init();
