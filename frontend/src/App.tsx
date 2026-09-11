import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import TasksPage from './pages/TasksPage';
import { logout } from './api/auth';
import './App.css';

interface StoredUser {
  id: number;
  name: string;
  email: string;
}

function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

function App() {
  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem('token')),
  );
  const [user, setUser] = useState<StoredUser | null>(getStoredUser());

  function handleLogin() {
    setUser(getStoredUser());
    setAuthenticated(true);
  }

  async function handleLogout() {
    await logout().catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setAuthenticated(false);
  }

  if (!authenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <span className="topbar-brand">Task Management</span>
        <div className="topbar-user">
          {user && <span className="topbar-email">{user.email}</span>}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </header>
      <main className="app-main">
        <TasksPage />
      </main>
    </div>
  );
}

export default App;