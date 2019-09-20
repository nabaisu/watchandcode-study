/* eslint-disable linebreak-style */

/*
Requirements:

MODEL:
// destroy
it should be able to delete todos
 - delete on the model and update the store
// create
it should be able to add todos
 - add todo if id is not passed                                                                                   ===> check
 - add todo to the other todo if id is passed                                                                     ===> check
// update
it should be able to change todos
 - change todo by id, update text or completed                                                                    ===> check   
it should be able to toggle the todos
 - change todo by id, update complete property if completed
 - it should toggle all if they are not toggled, and if all of them are toggled, then set all as false            ===> check
// read
it should be able to display the nested todos

VIEW:
// create
when clicked in the + button, it should be able to add a new todo (get text from the only field available)
// read
it should display all of the todos, add a ul and its respective li to each of the todos if the subTodos property is not empty
// update (text)
when clicked twice in the text, it should be able to change the todo text
 - listen to the double click and send to the form. (hidden form first, change with the new text)
// update (toggle)
it should have a toggle button in the side and toggle the element if needed
// destroy
it should have a delete button in the side and delete the element if needed
*/


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
  //recursive map for the object arrays (used for the toggleAll)
  recursiveMapTodos(array, callback, thisConfObj) {
    //base case
    if (thisConfObj) {
      confCallback = callback.bind(thisConfObj);
    } else {
      confCallback = callback;
    }
    var resultingArray = [];
    for (let i = 0; i < array.length; i++) {
      if (array[i].subTodos.length !== 0) {
        resultingArray[i] = this.recursiveMapTodos(array[i].subTodos, confCallback);
      }
      resultingArray[i] = confCallback(array[i]);
    }
    return resultingArray
  }
};


const model = {
  todos: util.store('todos-jquery'),

  // add a todo with id,
  addTodo(todoText, idofparent) {
    if (idofparent !== undefined) {
      // it has a parent, find parent and add to the subTodos array
      const elementToAddSubTodo = this.findElementById(idofparent, this.todos); // need to get a recursive pattern here to find the element needed
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
    this.store('todos-jquery', this.todos);
  },
  //find recursively inside an object
  findElementById: function (id, array, destro) {
    //base case = finite for loop
    let encontrei = false;
    for (let i = 0; i < array.length; i++) {
      if (encontrei) {
        return encontrei
      }
      //recursive case (recursion inside the objects)
      if (array[i].subTodos.length !== 0) {
        if (destro){
          encontrei = this.findElementById(id, array[i].subTodos, true)
        } else {
          encontrei = this.findElementById(id, array[i].subTodos) //either false or the object
        }
        if (encontrei) {
          return encontrei
        }
        
      }
          if (array[i].id === id) {
            //if found, then send directly
            if (destro){
              array.splice(i,1);
              encontrei = true;
              return encontrei;
            }
            return array[i]
          }
    }
  },
  changeTodo(todoText,id) {
    const todo = this.findElementById(id, this.todos);
    todo.todoText = todoText;
    this.store('todos-jquery', this.todos);
  },
  deleteTodo(id) {
    //++falta encontrar o parent dele
    //this.todos.splice(findElementById(id), 1);
    this.findElementById(id,this.todos,true); //this true in the end is to destroy the todo as soon as he finds it
    this.store('todos-jquery', this.todos);
  },
  toggleCompleted(id) {
    const todo = this.findElementById(id, this.todos);
    todo.completed = !todo.completed;
    this.store('todos-jquery', this.todos);
  },
  toggleAll(array) {
    totalCount = this.countRecursively(this.todos)
    countTrue = this.countRecursively(this.todos, true);
    // toggle all if all are done
    if (countTrue === totalCount || countTrue === 0) {
      //if all of the elements or not are true, then toggle all of the elements
      util.recursiveMapTodos(this.todos, function (element) { return element.completed = !element.completed })
    } else {
      //if some elements are false, then set all to true (toggle all true)
      util.recursiveMapTodos(this.todos, function (element) { return element.completed = true })
    }
    //store todos
    this.store('todos-jquery', this.todos);
  },
  store() {
    util.store('todos-jquery', this.todos);
  },
  countRecursively(array, option) {
    //used to find the total amount of todos and the total amount of todos completed or not
    let counter = 0;
    array.forEach((item) => {
      if (item.subTodos.length !== 0) {
        counter += this.countRecursively(item.subTodos, option);
        if (option !== undefined) {
          if (item.completed === option) {
            return counter++;
          }
        } else {
          return counter++;
        }
        return counter;
      } else {
        if (option !== undefined) {
          if (item.completed === option) {
            return counter++;
          }
        } else {
          return counter++;
        }
      }
    })
    return counter;
  }
};


const view = {
  init() {
    this.displayTodos();
  },
  buildList(array) {
    var todosUl = document.createElement('ul');
    var subTodos;
    array.forEach(function (todo){
      todosLi = document.createElement('li');
      let todoTextWithCompletion = '';
      if (todo.completed === true) {
        todoTextWithCompletion = `[X] ${todo.todoText}`;
      } else {
        todoTextWithCompletion = `[ ] ${todo.todoText}`;
      }
      todosLi.id = todo.id;
      todosLi.dataset.amigo = todo.id;
      todosLi.textContent = todoTextWithCompletion;
      todosLi.appendChild(this.createButton('delete'));
      todosLi.appendChild(this.createButton('nest'));
      todosLi.appendChild(this.createButton('toggle'));

    todosUl.appendChild(todosLi);
      if (todo.subTodos.length > 0){
        subTodos = this.buildList(todo.subTodos);
        todosUl.appendChild(subTodos);
      }  
    //todosUl.appendChild(todosLi);
    }, this);

    return todosUl;

  },
  displayTodos() {
    //base case
    //    return a li element

    //recursive case
    //    return a ul element with the lis inside
    //initial ul
    todosUl = document.querySelector('#mylist')
    todosUl.innerHTML = ''
    todosUl.appendChild(this.buildList(model.todos))
  },
  createButton(type) {
    let button = document.createElement('button');
    button.textContent = type;
    button.className = type+'Button';
    return button;
  },
  setupEventListeners() {
    const todosUl = document.querySelector('#mylist');
    // main input on the top
    const addButton = document.querySelector('#addButton')
    const mainInput = document.getElementById('thecenter');

    mainInput.addEventListener('keyup', (event) => {
      if (event.which === 13) {
        const textOfThing = document.getElementById('thecenter'); 
        if (textOfThing.value !== ''){
          octopus.addTodo(textOfThing.value);
        }else {
          alert("can't add an empty todo")
        }
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
    // for the nest button
    todosUl.addEventListener('click', (event) => {
      const elementClicked = event.target;
      // event listener for the delete button
      if (elementClicked.className === 'nestButton') {
        const textOfThing = document.getElementById('thecenter');
        if (textOfThing.value !== ''){
        const position = elementClicked.parentNode.dataset.amigo;
        octopus.addTodo(textOfThing.value,position);
        } else {
          alert("can't add an empty todo")
        }
      }
    });
    todosUl.addEventListener('click', (event) => {
      const elementClicked = event.target;
      if (elementClicked.className === 'toggleButton') {
        const position = elementClicked.parentNode.dataset.amigo;
        octopus.toggleCompleted(position);
      }
    }); 
    todosUl.addEventListener('click', (event) => {
      const elementClicked = event.target;
      // event listener for the delete button
      if (elementClicked.tagName === 'LI') {
        const position = elementClicked.dataset.amigo;
        octopus.changeTodo(position);
      }
    });
    addButton.addEventListener('click', (event) => {
        const textOfThing = document.getElementById('thecenter'); 
        if (textOfThing.value !== ''){
          octopus.addTodo(textOfThing.value);
        }else {
          alert("can't add an empty todo")
        }
    });
  },
};


const octopus = {

  init() {
    view.init();
    view.setupEventListeners();
  },
  addTodo(value, id) {
    const addTodoInputText = document.getElementById('thecenter');
    model.addTodo(value,id);
    addTodoInputText.value = '';
    view.displayTodos();
  },
  changeTodo(id) {
    const textOfThing = document.getElementById('thecenter');
    model.changeTodo(textOfThing.value, id);
    textOfThing.value = ''

    view.displayTodos();
  },
  deleteTodo(position) {
    model.deleteTodo(position);
    view.displayTodos();
  },
  toggleCompleted(position) {
    model.toggleCompleted(position);
    view.displayTodos();
  },
  toggleAll() {
    model.toggleAll();
    view.displayTodos();
  },
};

octopus.init();
