import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { BsTrash, BsCheckCircle, BsCircle } from "react-icons/bs"; // Import icons
import { FaSun, FaMoon } from "react-icons/fa";

function App() {
  const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const [tasks, setTasks] = useState(storedTasks);
  const [taskText, setTaskText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState("all"); // Default filter is "All"

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
  }, []);

  // Save tasks to local storage whenever tasks change
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
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

  const handleTaskTextChange = (e) => {
    setTaskText(e.target.value);
  };

  const handleDeadlineChange = (e) => {
    setDeadline(e.target.value);
  };

  const handleFilterChange = (selectedFilter) => {
    setFilter(selectedFilter);
  };

  const addTask = () => {
    if (taskText.trim() === "") {
      return; // Don't add empty tasks
    }

    const newTask = {
      taskText: taskText,
      deadline: deadline,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setTaskText("");
    setDeadline("");
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

  // Filter the tasks based on the selected filter
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") {
      return !task.completed;
    } else if (filter === "completed") {
      return task.completed;
    }
    return true; // "All" filter, show all tasks
  });

  return (
    <div className="container mt-5">
      <h1 className="mb-4">To-Do List</h1>
      <div className="form-check form-switch mt-3">
        <input
          className="form-check-input"
          type="checkbox"
          id="darkModeSwitch"
          checked={darkMode}
          onChange={toggleDarkMode}
        />
        <label className="form-check-label mb-3" htmlFor="darkModeSwitch">
          {darkMode ? <FaMoon /> : <FaSun />} Toggle Dark Mode
        </label>
      </div>
      <div className="input-group mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Task"
          value={taskText}
          onChange={handleTaskTextChange}
        />
        <input
          type="date"
          className="form-control"
          placeholder="Deadline"
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
      <ul className="list-group">
        {filteredTasks.map((task, index) => (
          <li
            key={index}
            className={`list-group-item d-flex flex-column ${
              task.completed ? "list-group-item-success" : ""
            }`}
          >
            <div className="d-flex justify-content-between align-items-center">
              <span>{task.taskText}</span>
              <div>
                <button
                  className="btn btn-success btn-sm ml-1"
                  onClick={() => {
                    toggleCompletion(index);
                  }}
                >
                  {task.completed ? <BsCheckCircle /> : <BsCircle />}
                </button>
                <button
                  className="btn btn-danger btn-sm ml-1"
                  onClick={() => {
                    deleteTask(index);
                  }}
                >
                  <BsTrash />
                </button>
              </div>
            </div>
            {task.deadline && (
              <small className="text-muted mt-2">
                Deadline: {task.deadline}
              </small>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
