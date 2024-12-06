let currentEvent;

document.addEventListener('DOMContentLoaded', function () {

  //Load in main container 
  var appContainer = document.getElementById('app-container');
  if (!appContainer) {
    console.error('Window not found');
    return;
  }
  //Load in main window (calendar & todo & add event) 
  var mainContent = document.getElementById('main-content');
  if (!mainContent) {
    console.error('Window not found');
    return;
  }

  var calendarEl = document.getElementById('calendar');
  if (!calendarEl) {
    console.error('Calendar not found');
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
    const startString = document.getElementById('event-start').value;
    const endString = document.getElementById('event-end').value;
    const location = document.getElementById('event-location').value;
    const notes = document.getElementById('event-notes').value;
    const isWeekly = document.getElementById('weekly-event').checked;



    if (title && startString) {
      const start = new Date(startString);
      const end = endString ? new Date(endString) : null;
      const daysOfWeek = [
        { name: 'monday', index: 1 },
        { name: 'tuesday', index: 2 },
        { name: 'wednesday', index: 3 },
        { name: 'thursday', index: 4 },
        { name: 'friday', index: 5 },
        { name: 'saturday', index: 6 },
        { name: 'sunday', index: 0 }
      ];

      daysOfWeek.forEach(day => {
        const isChecked = document.getElementById(day.name).checked;
        if (isChecked) {
          addEventForDay(day.index, title, start, end, location, notes);
        }
      });

      const existingEvents = calendar.getEvents();
      const eventExists = existingEvents.some(event =>
        event.title === title &&
        event.start.getTime() === new Date(startString).getTime() &&
        (endString ? event.end.getTime() === new Date(endString).getTime() : true)
      );


      const event = {
        title: title,
        start: start,
        end: end,
        location: location || null,
        notes: notes || null,
        isWeekly: isWeekly
      };

      if (isWeekly) {
        if (!eventExists) {
          for (let i = 0; i < 26; i++) {
            const nextWeek = new Date(start);
            nextWeek.setDate(start.getDate() + (i * 7));
            calendar.addEvent({
              title: title,
              start: nextWeek.toISOString(),
              end: end ? new Date(nextWeek.getTime() + (end - start)).toISOString() : null,
              location: location,
              notes: notes,
              isWeekly: true
            });
          }
        }
      } else {
        calendar.addEvent(event);
      }
      document.getElementById('event-title').value = '';
      document.getElementById('event-start').value = '';
      document.getElementById('event-end').value = '';
      document.getElementById('event-location').value = '';
      document.getElementById('event-notes').value = '';
      document.getElementById('weekly-event').checked = false;

      modal.style.display = "none";
    };

  }
  function addEventForDay(dayIndex, title, start, end, location, notes) {
    for (let i = 0; i < 26; i++) {
      const nextDate = new Date(start);
      nextDate.setDate(start.getDate() + (i * 7) + (dayIndex - start.getDay() + 7) % 7);
      calendar.addEvent({
        title: title,
        start: nextDate.toISOString(),
        end: end ? new Date(nextDate.getTime() + (end - start)).toISOString() : null,
        location: location,
        notes: notes,
        isWeekly: true
      });
    }
  }

  calendar.on('eventClick', function (info) {
    //get current event
    currentEvent = info.event;

    //get the attributes of the current event
    document.getElementById('event-title').value = currentEvent.title || '';
    document.getElementById('event-start').value = formatDateForInput(currentEvent.start);
    document.getElementById('event-end').value = currentEvent.end ? formatDateForInput(currentEvent.end) : '';
    document.getElementById('event-location').value = currentEvent.extendedProps.location || '';
    document.getElementById('event-notes').value = currentEvent.extendedProps.notes || '';
    document.getElementById('weekly-event').checked = currentEvent.extendedProps.isWeekly || false;

    //show current event
    modal.style.display = "block";

    //update the current event by updating the entry fields
    document.getElementById("add-event-button").onclick = function () {
      const title = document.getElementById('event-title').value.trim();
      const startString = document.getElementById('event-start').value;
      const endString = document.getElementById('event-end').value;
      const location = document.getElementById('event-location').value;
      const notes = document.getElementById('event-notes').value;
      const isWeekly = document.getElementById('weekly-event').checked;

      const start = new Date(startString);
      const end = endString ? new Date(endString) : null;

      //check if current event exists
      if (currentEvent) {
        if (currentEvent.extendedProps.isWeekly) {
          const allEvents = calendar.getEvents();
          allEvents.forEach(e => {
            if (e.title === currentEvent.title) {
              e.remove(); // remove all old events
            }
          });
          //add in new event
          calendar.addEvent({
            title: title,
            start: start,
            end: end,
            location: location || null,
            notes: notes || null,
            isWeekly: isWeekly
          })
        }

        currentEvent.setProp('title', title);
        currentEvent.setStart(start);
        currentEvent.setEnd(end);
        currentEvent.setExtendedProp('location', location);
        currentEvent.setExtendedProp('notes', notes);

        if (isWeekly) {
          currentEvent.setExtendedProp('isWeekly', true);
          for (let i = 1; i < 26; i++) {
            const nextWeek = new Date(start);
            nextWeek.setDate(start.getDate() + (i * 7));
            calendar.addEvent({
              title: title,
              start: nextWeek.toISOString(),
              end: end ? new Date(nextWeek.getTime() + (end - start)).toISOString() : null,
              location: location || null,
              notes: notes || null,
              isWeekly: true
            });
          }
        } else {
          currentEvent.setExtendedProp('isWeekly', isWeekly);
        }
        modal.style.display = "none";
      } else {
        alert('Please select an event to update.');
      }


    };
    document.getElementById("delete-event-button").onclick = function () {
      const event = info.event;
      if (confirm('Are you sure you want to delete this event?')) {
        if (event.extendedProps.isWeekly) {
          const allEvents = calendar.getEvents();
          allEvents.forEach(e => {
            if (e.title === event.title) {
              e.remove();
            }
          });
          alert('The event is deleted for all weeks. ');
        } else {
          event.remove();
          alert('The event has been deleted.');
        }
        document.getElementById('event-title').value = '';
        document.getElementById('event-start').value = '';
        document.getElementById('event-end').value = '';
        document.getElementById('event-location').value = '';
        document.getElementById('event-notes').value = '';
        document.getElementById('weekly-event').checked = false;
        modal.style.display = "none";
      }
    };
  });

  function formatDateForInput(date) {
    const localDate = new Date(date);
    const offset = localDate.getTimezoneOffset();
    localDate.setMinutes(localDate.getMinutes() - offset);
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