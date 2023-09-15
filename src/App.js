import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import "./App.css";
import { BsTrash, BsCheckCircle, BsCircle, BsX, BsPencilFill, BsCheck, BsGearFill } from "react-icons/bs"; // Import icons
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'; // Import react-beautiful-dnd
import Options from "./components/Options";
const { ipcRenderer } = window.require('electron');

function App() {
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const [tasks, setTasks] = useState(storedTasks);
  const [taskText, setTaskText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notificationEnabled, setNotificationEnabled] = useState(localStorage.getItem("notificationEnabled") === "false" ? false : true);
  const [filter, setFilter] = useState("all"); // Default filter is "All"
  const [editedTaskText, setEditedTaskText] = useState("");
  const [editedDeadline, setEditedDeadline] = useState("");
  const [editMode, setEditMode] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [autoStart, setAutoStart] = useState(JSON.parse(localStorage.getItem('autoStart')) ? JSON.parse(localStorage.getItem('autoStart')) : false);

  // Load tasks from local storage when the component mounts
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(storedTasks);

    // Retrieve the dark mode state from local storage
    const storedDarkMode = localStorage.getItem("darkMode");
    if (storedDarkMode === "dark") {
      document.documentElement.setAttribute("data-bs-theme", "dark");
      setDarkMode(true);
    } else {
      document.documentElement.setAttribute("data-bs-theme", "light");
      setDarkMode(false);
    }
    const storedNotificationEnabled = localStorage.getItem("notificationEnabled") === "false" ? false : true;
    setNotificationEnabled(storedNotificationEnabled);

    resetIsNotified();

  }, []);

  // Save tasks to local storage whenever tasks change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    const interval = setInterval(() => {
      checkDeadlinesAndNotify();
    }, 1000); // 60 seconds

    return () => clearInterval(interval);
  }, [tasks]);

  const toggleDarkMode = () => {
    const newTheme = darkMode ? "light" : "dark";

    // Set the data-bs-theme attribute to the new theme
    document.documentElement.setAttribute("data-bs-theme", newTheme);

    // Store the dark mode state in local storage
    localStorage.setItem("darkMode", newTheme);

    // Update the dark mode state
    setDarkMode(!darkMode);
  };

  const toggleNotification = () => {
    const newNotificationEnabled = !notificationEnabled;
    setNotificationEnabled(newNotificationEnabled);

    // Save the preference to local storage
    localStorage.setItem("notificationEnabled", newNotificationEnabled);
  };

  const handleTaskTextChange = (e) => {
    setTaskText(e.target.value);
  };

  const handleDeadlineChange = (e) => {
    setDeadline(e.target.value);
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  const openOptions = () => {
    setShowOptions(true);
  };

  const closeOptions = () => {
    setShowOptions(false);
  };
  const addTask = () => {
    if (taskText.trim() === "") {
      return; // Don't add empty tasks
    }

    // Format the deadline in "mm/dd/yyyy - hh:mm am/pm" format
    const formattedDeadline = deadline
      ? new Date(deadline).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "";

    const newTask = {
      taskText: taskText,
      nonFormattedDeadline: deadline.valueOf(),
      deadline: formattedDeadline,
      completed: false,
      isNotified: false,
    };

    setTasks([...tasks, newTask]);
    setTaskText("");
    setDeadline("");
  };

  const checkDeadlinesAndNotify = () => {
    if (!notificationEnabled) {
      return; // Notifications are disabled, do not proceed
    }

    const currentTime = new Date();
    const notificationThreshold = 24 * 60 * 60 * 1000;
    tasks.forEach((task, index) => {
      if (!task.completed && task.deadline) {
        const deadlineTime = new Date(task.nonFormattedDeadline);
        const timeDifference = deadlineTime.getTime() - currentTime.getTime();


        if (timeDifference > 0 && timeDifference <= notificationThreshold && !task.isNotified) {
          sendTaskForNotification(task)

          const updatedTasks = [...tasks];
          updatedTasks[index].isNotified = true;
          setTasks(updatedTasks);
        }
      }
    });
  };

  const sendTaskForNotification = (task) => {
    ipcRenderer.send('trigger-notification', 'Task Deadline Reminder', `Task "${task.taskText}" is due in one day!`);
  };

  const resetIsNotified = () => {
    const updatedTasks = tasks.map((task) => ({
      ...task,
      isNotified: false,
    }));
    setTasks(updatedTasks);
  };

  const deleteTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    setTasks(updatedTasks);
  };

  const toggleCompletion = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);

  };

  // Function to handle the "Enable Start on Launch" switch
  const toggleAutoStart = () => {
    const newAutoStart = !autoStart;
    setAutoStart(newAutoStart);

    // Save the preference to local storage
    localStorage.setItem("autoStart", newAutoStart);

    // Send the preference to the main process
    ipcRenderer.send('toggle-auto-start', newAutoStart);
  };

  // Function to handle drag-and-drop reordering of tasks
  const onDragEnd = (result) => {
    if (!result.destination) {
      return; // Item was dropped outside the list
    }

    const updatedTasks = [...tasks];
    const [movedTask] = updatedTasks.splice(result.source.index, 1); // Remove the dragged task
    updatedTasks.splice(result.destination.index, 0, movedTask); // Insert the task at the destination index
    setTasks(updatedTasks);
  };

  // Filter the tasks based on the selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") {
      return !task.completed;
    } else if (filter === "completed") {
      return task.completed;
    }
    return true; // "All" filter, show all tasks
  });

  const startEdit = (index) => {
    const taskToEdit = tasks[index];
    setEditedTaskText(taskToEdit.taskText);
    setEditedDeadline(taskToEdit.deadline);
    setEditMode(index);
  };

  const cancelEdit = () => {
    setEditedTaskText("");
    setEditedDeadline("");
    setEditMode(null);
  };

  const updateTask = (index) => {
    if (editedTaskText.trim() === "") {
      return; // Don't update with empty task text
    }

    const formattedDeadline = editedDeadline
      ? new Date(editedDeadline).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      : "";
    const updatedTasks = [...tasks];
    updatedTasks[index] = {
      ...updatedTasks[index],
      taskText: editedTaskText,
      deadline: formattedDeadline,
    };
    setTasks(updatedTasks);
    setEditedTaskText("");
    setEditedDeadline("");
    setEditMode(null);
  };

  const runAbout = () => {
    ipcRenderer.send('run-about', 'https://github.com/Zaimoo/to-do-list')
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="">To-Do List</h1>
        <button className="btn btn-secondary btn-sm" onClick={openOptions}>
          <BsGearFill />
        </button>
      </div>
      <Options
        style={{ display: 'block', position: 'initial' }}
        showModal={showOptions}
        closeModal={closeOptions}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        notificationEnabled={notificationEnabled}
        toggleNotification={toggleNotification}
        autoStart={autoStart}
        toggleAutoStart={toggleAutoStart}
        about={runAbout}
      />

      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Task"
          value={taskText}
          onChange={handleTaskTextChange}
        />
        <input
          type="datetime-local" // Use datetime-local input for date and time
          className="form-control"
          value={deadline}
          onChange={handleDeadlineChange}
        />
        <div className="input-group-append">
          <button className="btn btn-primary" onClick={addTask}>
            Add
          </button>
        </div>
      </div>
      <div className="btn-group mb-3">
        <button
          className={`btn btn-outline-primary ${
            filter === "all" ? "active" : ""
            }`}
          onClick={() => handleFilterChange("all")}
        >
          All
        </button>
        <button
          className={`btn btn-outline-primary ${
            filter === "active" ? "active" : ""
            }`}
          onClick={() => handleFilterChange("active")}
        >
          Active
        </button>
        <button
          className={`btn btn-outline-primary ${
            filter === "completed" ? "active" : ""
            }`}
          onClick={() => handleFilterChange("completed")}
        >
          Completed
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="task-list">
          {(provided) => (
            <ul
              className="list-group"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {filteredTasks.map((task, index) => (
                <Draggable key={index} draggableId={index.toString()} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`list-group-item d-flex flex-column ${
                        task.completed ? "list-group-item-success" : ""
                        }`}
                    >
                      {editMode === index ? (
                        <div className="d-flex justify-content-between align-items-center">
                          <input
                            type="text"
                            className="form-control"
                            value={editedTaskText}
                            onChange={(e) => setEditedTaskText(e.target.value)}
                          />
                          <input
                            type="datetime-local"
                            className="form-control"
                            value={editedDeadline}
                            onChange={(e) => setEditedDeadline(e.target.value)}
                          />
                          <div>
                            <button
                              className="btn btn-success btn-sm ml-1"
                              onClick={() => {
                                updateTask(index);
                              }}
                            >
                              <BsCheck />
                            </button>
                            <button
                              className="btn btn-danger btn-sm ml-1"
                              onClick={() => {
                                cancelEdit();
                              }}
                            >
                              <BsX />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex justify-content-between align-items-center">
                          <span>{task.taskText}</span>
                          <div>
                            <button
                              className="btn btn-success btn-sm "
                              onClick={() => {
                                toggleCompletion(index);
                              }}
                            >
                              {task.completed ? <BsCheckCircle /> : <BsCircle />}
                            </button>
                            <button
                              className="btn btn-warning btn-sm mx-1"
                              onClick={() => {
                                startEdit(index);
                              }}
                            >
                              <BsPencilFill />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => {
                                deleteTask(index);
                              }}
                            >
                              <BsTrash />
                            </button>
                          </div>
                        </div>
                      )}
                      {task.deadline && (
                        <small className="text-muted mt-2">
                          Deadline: {task.deadline}
                        </small>
                      )}
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default App;
