import { createSignal, createEffect } from "solid-js";
import "./App.css";
import Dashboard from "./dashboard";
import ProfilePage from "./profilePage";
import ProjectsPage from "./projectsPage";
import AuthPage from "./authPage";

function App() {
  const [page, setPage] = createSignal("auth");

  // Theme: "dark" or "light"
  const [theme, setTheme] = createSignal("dark");

  // Global auth state
  const [currentUser, setCurrentUser] = createSignal(null);
  const [authToken, setAuthToken] = createSignal(null);

  // Global feed state
  const [feedItems, setFeedItems] = createSignal([
    {
      id: 1,
      type: "project",
      text: "New project created: Hyperloop Telemetry Dashboard",
    },
    {
      id: 2,
      type: "opportunity",
      text: "New opportunity: Looking for frontend dev for BuildSpace",
    },
  ]);

  function addFeedItem(text, type) {
    setFeedItems([{ id: Date.now(), type, text }, ...feedItems()]);
  }

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  // Apply theme class to body
  createEffect(() => {
    const t = theme();
    document.body.classList.remove("light-theme", "dark-theme");
    document.body.classList.add(t === "light" ? "light-theme" : "dark-theme");
  });

  function handleAuthSuccess(user, token) {
    setCurrentUser(user);
    setAuthToken(token);
    setPage("dashboard");
  }

  // Hard guard: if not logged in, always show auth page
  const isAuthenticated = () => !!currentUser() && !!authToken();

  return (
    <>
      {!isAuthenticated() && (
        <AuthPage onAuthSuccess={handleAuthSuccess} />
      )}
      {isAuthenticated() && page() === "dashboard" && (
        <Dashboard
          openProfile={() => setPage("profilePage")}
          openProjects={() => setPage("projects")}
          feedItems={feedItems()}
          addFeedItem={addFeedItem}
          theme={theme()}
          toggleTheme={toggleTheme}
          currentUser={currentUser()}
          authToken={authToken()}
        />
      )}
      {isAuthenticated() && page() === "profilePage" && (
        <ProfilePage goBack={() => setPage("dashboard")} />
      )}
      {isAuthenticated() && page() === "projects" && (
        <ProjectsPage
          goBack={() => setPage("dashboard")}
          addFeedItem={addFeedItem}
        />
      )}
    </>
  );
}

export default App;
