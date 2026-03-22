import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Home = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSubmitTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    try {
      const payload = { 
        title: newTaskTitle, 
        description: newTaskDescription, 
        dueDate: newTaskDueDate || null 
      };

      if (editingTask) {
        const res = await api.put(`/tasks/${editingTask._id}`, payload);
        setTasks(tasks.map(t => t._id === editingTask._id ? res.data : t));
      } else {
        const res = await api.post('/tasks', payload);
        setTasks([res.data, ...tasks]);
      }
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setEditingTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setNewTaskTitle(task.title);
    setNewTaskDescription(task.description);
    setNewTaskDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    document.getElementById('addTaskDialog').showModal();
  };

  const openAddDialog = () => {
    setEditingTask(null);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    document.getElementById('addTaskDialog').showModal();
  };

  const toggleTaskComplete = async (task) => {
    try {
      const res = await api.put(`/tasks/${task._id}`, { completed: !task.completed });
      setTasks(tasks.map(t => t._id === task._id ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const addSubtask = async (taskId, subtaskTitle, subtaskDate) => {
    if (!subtaskTitle) return;
    try {
      const task = tasks.find(t => t._id === taskId);
      const updatedSubtasks = [...task.subtasks, { 
        title: subtaskTitle, 
        completed: false, 
        dueDate: subtaskDate || null 
      }];
      const res = await api.put(`/tasks/${taskId}`, { subtasks: updatedSubtasks });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    try {
      const task = tasks.find(t => t._id === taskId);
      const updatedSubtasks = task.subtasks.map(st => 
        st._id === subtaskId ? { ...st, completed: !st.completed } : st
      );
      const res = await api.put(`/tasks/${taskId}`, { subtasks: updatedSubtasks });
      setTasks(tasks.map(t => t._id === taskId ? res.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <h1>Task Manager</h1>
        <div className="navbar-actions">
          <button className="btn" onClick={openAddDialog}>Add Task</button>
          <button className="btn" style={{ background: 'var(--danger)' }} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <dialog id="addTaskDialog" style={{ padding: '2rem', borderRadius: '12px', background: 'var(--card-bg)', color: 'white', border: '1px solid var(--border-color)', margin: 'auto', width: '90%', maxWidth: '500px' }}>
        <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
        <form onSubmit={(e) => { handleSubmitTask(e); document.getElementById('addTaskDialog').close(); }}>
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input type="text" value={newTaskDescription} onChange={e => setNewTaskDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Due Date (Optional)</label>
            <input type="date" value={newTaskDueDate} onChange={e => setNewTaskDueDate(e.target.value)} style={{ colorScheme: 'dark' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn">Save Task</button>
            <button type="button" className="btn" style={{ background: 'var(--border-color)' }} onClick={() => document.getElementById('addTaskDialog').close()}>Cancel</button>
          </div>
        </form>
      </dialog>

      <main className="dashboard">
        {tasks.map(task => (
          <div key={task._id} style={{
            background: 'var(--card-bg)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  onChange={() => toggleTaskComplete(task)}
                  style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
                />
                <div>
                  <h3 style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-muted)' : 'white', marginBottom: '0.2rem' }}>
                    {task.title}
                  </h3>
                  {task.dueDate && <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginBottom: '0.4rem', fontWeight: 500 }}>&#128197; Due: {new Date(task.dueDate).toLocaleDateString()}</div>}
                  {task.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{task.description}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  className="btn" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => openEditDialog(task)}
                >
                  Edit
                </button>
                <button 
                  className="btn" 
                  style={{ background: 'var(--danger)', padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => deleteTask(task._id)}
                >
                  Delete
                </button>
              </div>
            </div>

            <div style={{ marginTop: '1rem', paddingLeft: '2.2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Subtasks</h4>
              {task.subtasks?.map(st => (
                <div key={st._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="checkbox" 
                    checked={st.completed} 
                    onChange={() => toggleSubtask(task._id, st._id)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '0.85rem', textDecoration: st.completed ? 'line-through' : 'none' }}>
                    {st.title} 
                    {st.dueDate && <span style={{ color: 'var(--primary)', marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 500 }}>&#128197; {new Date(st.dueDate).toLocaleDateString()}</span>}
                  </span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  id={`subtask-title-${task._id}`}
                  placeholder="New subtask title..." 
                  style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'white', fontSize: '0.8rem', flex: 1, minWidth: '150px' }}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      const dateInput = document.getElementById(`subtask-date-${task._id}`);
                      addSubtask(task._id, e.target.value, dateInput.value);
                      e.target.value = '';
                      dateInput.value = '';
                    }
                  }}
                />
                <input 
                  type="date"
                  id={`subtask-date-${task._id}`}
                  style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'white', fontSize: '0.8rem', colorScheme: 'dark' }}
                />
                <button 
                  className="btn" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  onClick={() => {
                    const titleInput = document.getElementById(`subtask-title-${task._id}`);
                    const dateInput = document.getElementById(`subtask-date-${task._id}`);
                    addSubtask(task._id, titleInput.value, dateInput.value);
                    titleInput.value = '';
                    dateInput.value = '';
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
            No tasks found. Click "Add Task" to create one.
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
