
import { useCallback, useEffect, useState } from "react";
import { fetchTasks, fetchStats, updateTask, createTask } from "./api";
import TaskItem from "./TaskItem";

const USERS = ["alice", "bob", "carol"];

const EMPTY_STATS = {
  todo: 0,
  in_progress: 0,
  done: 0,
  overdue: 0,
};

const EMPTY_FORM = {
  title: "",
  description: "",
  status: "todo",
  due_date: "",
};

export default function App() {
  const [user, setUser] = useState("alice");
  const [status, setStatus] = useState("");
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);

    try {
      const [tasksData, statsData] = await Promise.all([
        fetchTasks(user, status),
        fetchStats(user),
      ]);

      setTasks(
        Array.isArray(tasksData) ? tasksData : tasksData.results || []
      );

      setStats({
        todo: statsData.todo ?? 0,
        in_progress: statsData.in_progress ?? 0,
        done: statsData.done ?? 0,
        overdue: statsData.overdue ?? 0,
      });
    } catch (err) {
      setError(err.message || "Failed to load tasks.");
    }
  }, [user, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleCreateTask = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await createTask(user, {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        due_date: form.due_date
          ? new Date(form.due_date).toISOString()
          : null,
        assigned_to: user === "alice" ? 1 : user === "bob" ? 2 : 3,
      });

      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to create task.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkDone = async (task) => {
    try {
      setError(null);
      await updateTask(user, task.id, { status: "done" });
      await loadData();
    } catch (err) {
      setError(err.message || "Failed to update task.");
    }
  };

  return (
    <div className="container">
      <h1>Task Tracker</h1>

      <div className="controls">
        <label>
          Logged in as{" "}
          <select
            value={user}
            onChange={(event) => setUser(event.target.value)}
          >
            {USERS.map((username) => (
              <option key={username} value={username}>
                {username}
              </option>
            ))}
          </select>
        </label>

        <label>
          Status{" "}
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="">All</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={() => {
          setShowForm((visible) => !visible);
          setError(null);
        }}
      >
        {showForm ? "Cancel" : "+ Add Task"}
      </button>

      {showForm && (
        <form className="task-form" onSubmit={handleCreateTask}>
          <h2>Add New Task</h2>

          <label>
            Title *
            <input
              name="title"
              value={form.title}
              onChange={handleFormChange}
              required
              maxLength={200}
              placeholder="Enter task title"
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Enter task description"
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleFormChange}
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </label>

          <label>
            Due date
            <input
              type="datetime-local"
              name="due_date"
              value={form.due_date}
              onChange={handleFormChange}
            />
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Task"}
          </button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      <section className="stats" aria-label="Task statistics">
        <div className="stat-card">
          <span>To do</span>
          <strong>{stats.todo}</strong>
        </div>
        <div className="stat-card">
          <span>In progress</span>
          <strong>{stats.in_progress}</strong>
        </div>
        <div className="stat-card">
          <span>Done</span>
          <strong>{stats.done}</strong>
        </div>
        <div className="stat-card">
          <span>Overdue</span>
          <strong>{stats.overdue}</strong>
        </div>
      </section>

      <p className="meta">{tasks.length} tasks</p>

      <ul className="tasks">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onMarkDone={handleMarkDone}
          />
        ))}
      </ul>
    </div>
  );
}
