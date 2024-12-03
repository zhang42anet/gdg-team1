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
    const startString = document.getElementById('event-start').value; // Get the start value as a string
    const endString = document.getElementById('event-end').value; // Get the end value as a string
    const location = document.getElementById('event-location').value;
    const notes = document.getElementById('event-notes').value;
    const isWeekly = document.getElementById('weekly-event').checked; // Capture checkbox state

    if (title && startString) {
      const start = new Date(startString); // Convert start string to Date object
      const end = endString ? new Date(endString) : null; // Convert end string to Date object if provided
      const event = {
        title: title,
        start: start,
        end: end,
        location: location || null,
        notes: notes || null,
        isWeekly: isWeekly // Include weekly event status
      };

      // Handle weekly events
      if (isWeekly) {
        for (let i = 0; i < 26; i++) { // Example: Create 10 weekly occurrences
          const nextWeek = new Date(start);
          nextWeek.setDate(start.getDate() + (i * 7)); // Add 7 days for each occurrence
          calendar.addEvent({
            title: title,
            start: nextWeek.toISOString(),
            end: end ? new Date(nextWeek.getTime() + (end - start)).toISOString() : null,
            location: location,
            notes: notes,
            isWeekly: true
          });
        }


      } else {
        calendar.addEvent(event);
      }
              // Clear entry fields
              document.getElementById('event-title').value = '';
              document.getElementById('event-start').value = '';
              document.getElementById('event-end').value = '';
              document.getElementById('event-location').value = '';
              document.getElementById('event-notes').value = '';
              document.getElementById('weekly-event').checked = false; // Reset checkbox
      
              // Close the modal
              modal.style.display = "none";
    };
  }

  calendar.on('eventClick', function (info) {
    currentEvent = info.event; // Store the clicked event

    // Populate the modal fields with event details
    document.getElementById('event-title').value = currentEvent.title || ''; // Set the title
    document.getElementById('event-start').value = formatDateForInput(currentEvent.start); // Format for datetime-local
    document.getElementById('event-end').value = currentEvent.end ? formatDateForInput(currentEvent.end) : ''; // Format for datetime-local
    document.getElementById('event-location').value = currentEvent.extendedProps.location || ''; // Set the location
    document.getElementById('event-notes').value = currentEvent.extendedProps.notes || ''; // Set the notes in the textarea
    document.getElementById('weekly-event').checked = currentEvent.extendedProps.isWeekly || false; // Set the checkbox state

    // Show the modal
    modal.style.display = "block";

    document.getElementById("add-event-button").onclick = function () {
      const title = document.getElementById('event-title').value.trim();
      const startString = document.getElementById('event-start').value; // Get the start value as a string
      const endString = document.getElementById('event-end').value; // Get the end value as a string
      const location = document.getElementById('event-location').value;
      const notes = document.getElementById('event-notes').value;
      const isWeekly = document.getElementById('weekly-event').checked; // Capture checkbox state
  
      // Convert start and end strings to Date objects
      const start = new Date(startString);
      const end = endString ? new Date(endString) : null;
  
      // Check if currentEvent is defined before accessing its properties
      if (currentEvent) {
          // Check if the event is a weekly event
          if (currentEvent.extendedProps.isWeekly) {
              // Delete all occurrences of the old weekly event
              const allEvents = calendar.getEvents(); // Get all events from the calendar
              allEvents.forEach(e => {
                  if (e.title === currentEvent.title) {
                      e.remove(); // Remove the old event
                  }
              });
          calendar.addEvent({
            title: title,
                      start: start,
                      end: end,
                      location: location || null,
                      notes: notes || null,
                      isWeekly: false // Mark as a weekly event
          })
            }

          if (isWeekly){
            currentEvent.setProp('title', title); // Update the title
            currentEvent.setStart(start); // Update the start time
            currentEvent.setEnd(end); // Update the end time
            currentEvent.setExtendedProp('location', location); // Update the location
            currentEvent.setExtendedProp('notes', notes); // Update the notes
            currentEvent.setExtendedProp('isWeekly', isWeekly); // Update the weekly status
              // Create new occurrences for the updated weekly event
              for (let i = 1; i < 26; i++) { // Example: Create 26 occurrences
                  const nextWeek = new Date(start);
                  nextWeek.setDate(start.getDate() + (i * 7)); // Add 7 days for each occurrence
                  calendar.addEvent({
                      title: title,
                      start: nextWeek.toISOString(),
                      end: end ? new Date(nextWeek.getTime() + (end - start)).toISOString() : null,
                      location: location || null,
                      notes: notes || null,
                      isWeekly: true // Mark as a weekly event
                  });
              }
          } else {
              // Update the event properties for non-weekly events
              currentEvent.setProp('title', title); // Update the title
              currentEvent.setStart(start); // Update the start time
              currentEvent.setEnd(end); // Update the end time
              currentEvent.setExtendedProp('location', location); // Update the location
              currentEvent.setExtendedProp('notes', notes); // Update the notes
              currentEvent.setExtendedProp('isWeekly', isWeekly); // Update the weekly status
          }
          // Close the modal
          modal.style.display = "none";
      } else {
          alert('No event selected for update. Please select an event to update.');
      }
  };
      document.getElementById("delete-event-button").onclick = function () {
        const event = info.event; // Assuming you have access to the event object

        if (event.extendedProps.isWeekly) {
          // Logic to delete all occurrences of the weekly event
          const allEvents = calendar.getEvents(); // Get all events from the calendar
          allEvents.forEach(e => {
            if (e.title === event.title) {
              e.remove(); // Remove the event
            }
          });
          alert('The event is deleted for all weeks. ');
        } else {
          // Logic to delete the single event
          event.remove(); // Remove the single event
          alert('The event has been deleted.');
        }
                      // Clear entry fields
                      document.getElementById('event-title').value = '';
                      document.getElementById('event-start').value = '';
                      document.getElementById('event-end').value = '';
                      document.getElementById('event-location').value = '';
                      document.getElementById('event-notes').value = '';
                      document.getElementById('weekly-event').checked = false; // Reset checkbox
                      // Close the modal after deletion
                      modal.style.display = "none";
      };

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