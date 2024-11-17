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
  const completedList = document.getElementById('completed-todos');
  const showButton = document.getElementById('show');

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
          completedList.appendChild(li);
          li.removeChild(deleteButton); 
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

// Show/Hide completed items
showButton.onclick = function () {
  if (completedList.style.display === "none" || completedList.classList.contains('hidden')) {
      completedList.style.display = "block"; 
      showButton.textContent = 'Hide'; 
  } else {
      completedList.style.display = "none"; 
      showButton.textContent = 'Show'; 
  }
};


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


  document.getElementById("add-event-button").onclick = function () {
    const title = document.getElementById('event-title').value.trim();
    const start = document.getElementById('event-start').value;
    const end = document.getElementById('event-end').value;
    const location = document.getElementById('event-location').value;
    const notes = document.getElementById('event-notes').value;

    if (title && start) {
      const event = {
        title: title,
        start: start,
        end: end || null,
        location: location || null,
        notes: notes || null
      };
      calendar.addEvent(event);

      // Clear entry fields
      document.getElementById('event-title').value = '';
      document.getElementById('event-start').value = '';
      document.getElementById('event-end').value = '';
      document.getElementById('event-location').value = '';
      document.getElementById('event-notes').value = '';

      // Close the add event window
      modal.style.display = "none";
    } else {
      alert('Please fill in event title and start time.');
    }
  };
  calendar.on('eventClick', function(info) {
    const event = info.event;

    // Populate the modal fields with event details
    document.getElementById('event-title').value = event.title || ''; // Set the title

    // Format the start and end values for datetime-local
    document.getElementById('event-start').value = event.start ? formatDateForInput(event.start) : ''; // Format for datetime-local
    document.getElementById('event-end').value = event.end ? formatDateForInput(event.end) : ''; // Format for datetime-local

    document.getElementById('event-location').value = event.location || ''; // Set the location
    document.getElementById('event-notes').value = event.notes || ''; // Set the notes in the textarea

    // Show the modal
    modal.style.display = "block"; // Display the modal
  });

  // Function to format date for datetime-local input
  function formatDateForInput(date) {
    const localDate = new Date(date); // Create a new Date object
    const offset = localDate.getTimezoneOffset(); // Get timezone offset in minutes
    localDate.setMinutes(localDate.getMinutes() - offset); // Adjust for timezone offset
    // Format to YYYY-MM-DDTHH:MM
    return localDate.toISOString().slice(0, 16);
  }

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