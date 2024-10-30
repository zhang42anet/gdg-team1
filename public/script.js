//Load content of html into the current  file
document.addEventListener('DOMContentLoaded', function () {

    //Load in main container 
    var appContainer = document.getElementById('app-container');
    if (!appContainer) {
      console.error('App container not found');
      return;
    }
    //Load in main window (calendar & todo & add event) 
    var mainContent = document.getElementById('main-content');
    if (!mainContent) {
      console.error('Main content container not found');
      return;
    }
  
    var calendarEl = document.getElementById('calendar');
    if (!calendarEl) {
      console.error('Calendar element not found');
      return;
    }
  
    // Implement FullCalendar
    var calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 'auto',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listDay'
      },
      views: {
        listDay: { buttonText: 'List' }
      },
      //adjust window to size of window
      windowResize: function (view) {
        if (window.innerWidth < 768) {
          calendar.changeView('listWeek');
        } else {
          calendar.changeView('dayGridMonth');
        }
      }
    });
    calendar.render();
  
    // Todo list 
    const todoList = document.getElementById('todos');
    const newTodoInput = document.getElementById('new-todo');
    const addTodoButton = document.getElementById('add-todo');
  
    //Check if elements in todo list exist
    if (todoList && newTodoInput && addTodoButton) {
      addTodoButton.addEventListener('click', addTodo);
      //If enter is pressed, new todo event is created
      newTodoInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          addTodo();
        }
      });
  
      function addTodo() {
        //Remove spaces in text entered
        const todoText = newTodoInput.value.trim();
        if (todoText) {
          //Create todo item and "Completed!" button
          const li = document.createElement('li');
          li.textContent = todoText;
          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Completed!';
          deleteButton.addEventListener('click', function () {
            li.remove();
          });
          //Add "Completed" and new item to todo list
          li.appendChild(deleteButton);
          todoList.appendChild(li);
          //Clear input field
          newTodoInput.value = '';
        }
      }
    } else {
      console.error('Todo list elements not found');
    }
  
    //Add event window
    var modal = document.getElementById("eventModal");
    var btn = document.getElementById("open-modal");
    var span = document.getElementsByClassName("close")[0];
  
    // Show the add event window
    btn.onclick = function () {
      modal.style.display = "block";
    }
  
    // Close the add event window
    span.onclick = function () {
      modal.style.display = "none";
    }
  
    // Close the add event window when clicking anywhere outside
    modal.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  
    // Initialize Quill notepad
    var quill = new Quill('#quill-editor', {
      theme: 'snow',
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          ['image'],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'size': ['small', 'large', 'huge'] }]
        ]
      }
    });
  
    document.getElementById("add-event-button").onclick = function () {
      const title = document.getElementById('event-title').value.trim();
      const start = document.getElementById('event-start').value;
      const end = document.getElementById('event-end').value;
      const notes = quill.root.innerHTML;
  
      if (title && start) {//Check for null entry in title and start date
        const event = {
          title: title,
          start: start,
          end: end || null,
          notes: notes
        };
  
        calendar.addEvent(event);
  
        //Clear entry fields
        document.getElementById('event-title').value = '';
        document.getElementById('event-start').value = '';
        document.getElementById('event-end').value = '';
        quill.setContents([]);
  
        // Close the add event window
        modal.style.display = "none";
      } else {
        alert('Please fill in event title and start time.');
      }
    };
  });
  
  /*Menu*/
  
  document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.getElementById('menu-button');
    var menuList = document.getElementById('menu-list');
  
    // Show the menu when the button is clicked
    menuButton.onclick = function (event) {
      event.stopPropagation(); // Prevent affecting parent elements like the window
      menuList.classList.toggle('hidden'); // If the window is closed, open it, and vise versa
    };
  
    // Closing the menu when clicking anywhere outside of it in the window
    window.onclick = function (event) {
      //checks if menu is visable and if the click does not occur on menu button
      if (!menuList.classList.contains('hidden') && !menuButton.contains(event.target)) {
        menuList.classList.add('hidden');
      }
    };
  });
  