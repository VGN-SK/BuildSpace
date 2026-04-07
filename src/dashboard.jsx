// src/dashboard.jsx
import { createSignal, For, Show } from "solid-js";
import "./App.css";
import { sampleUser, sampleProjects, sampleOpportunities } from "./models";

export default function Dashboard(props) {
  // Basic user data
  const [user] = createSignal(sampleUser);

  // Projects
  const [projects, setProjects] = createSignal(sampleProjects);
  const [showProjectForm, setShowProjectForm] = createSignal(false);
  const [projectTitle, setProjectTitle] = createSignal("");
  const [projectDescription, setProjectDescription] = createSignal("");
  const [projectTechStack, setProjectTechStack] = createSignal("");
  const [projectSearch, setProjectSearch] = createSignal("");

  // Opportunities
  const [opportunities, setOpportunities] = createSignal(sampleOpportunities);
  const [showOpportunityForm, setShowOpportunityForm] = createSignal(false);
  const [oppType, setOppType] = createSignal("Hackathon team opening");
  const [oppTitle, setOppTitle] = createSignal("");
  const [oppDescription, setOppDescription] = createSignal("");
  const [oppContact, setOppContact] = createSignal("");
  const [opportunitySearch, setOpportunitySearch] = createSignal("");

  // Feed controls (data comes from props.feedItems)
  const [feedFilter, setFeedFilter] = createSignal("all"); // all | project | opportunity | request
  const [feedSearch, setFeedSearch] = createSignal("");

  // Derived views
  const filteredFeedItems = () => {
    const f = feedFilter();
    const search = feedSearch().toLowerCase();
    return (props.feedItems || []).filter((item) => {
      const matchesType = f === "all" || item.type === f;
      const matchesSearch =
        !search || (item.text || "").toLowerCase().includes(search);
      return matchesType && matchesSearch;
    });
  };

  const filteredProjects = () => {
    const search = projectSearch().toLowerCase();
    if (!search) return projects();
    return projects().filter((p) => {
      const text = (
        p.title + " " + p.description + " " + (p.techStack || []).join(" ")
      ).toLowerCase();
      return text.includes(search);
    });
  };

  const filteredOpportunities = () => {
    const search = opportunitySearch().toLowerCase();
    if (!search) return opportunities();
    return opportunities().filter((o) => {
      const text = (
        o.title + " " + o.description + " " + (o.type || "")
      ).toLowerCase();
      return text.includes(search);
    });
  };

  // Create project
  function handleCreateProject(e) {
    e.preventDefault();
    const title = projectTitle().trim();
    const description = projectDescription().trim();
    const techStackInput = projectTechStack().trim();

    if (!title || !description) return;

    const techStack =
      techStackInput.length > 0
        ? techStackInput.split(",").map((s) => s.trim())
        : [];

    const newProject = {
      id: Date.now(),
      title,
      description,
      techStack,
      status: "Open for collaborators",
      members: [user().name],
    };

    setProjects([newProject, ...projects()]);

    props.addFeedItem?.(`New project created: ${title}`, "project");

    // Reset form and close
    setProjectTitle("");
    setProjectDescription("");
    setProjectTechStack("");
    setShowProjectForm(false);
  }

  // Request teammates for a project
  function handleRequestTeammates(project) {
    // Create an opportunity entry
    const newOpp = {
      id: Date.now(),
      type: "Looking for teammates",
      title: `Looking for teammates: ${project.title}`,
      description: "Seeking teammates to collaborate on this project.",
      contact: "@johndoe", // placeholder handle
    };
    setOpportunities([newOpp, ...opportunities()]);

    // Add to feed as a request
    props.addFeedItem?.(
      `Teammates requested for project "${project.title}"`,
      "request"
    );
  }

  // Create opportunity
  function handleCreateOpportunity(e) {
    e.preventDefault();
    const title = oppTitle().trim();
    const description = oppDescription().trim();
    const contact = oppContact().trim();

    if (!title || !description) return;

    const newOpp = {
      id: Date.now(),
      type: oppType(),
      title,
      description,
      contact,
    };

    setOpportunities([newOpp, ...opportunities()]);
    props.addFeedItem?.(`New opportunity posted: ${title}`, "opportunity");

    // Reset form and close
    setOppTitle("");
    setOppDescription("");
    setOppContact("");
    setOppType("Hackathon team opening");
    setShowOpportunityForm(false);
  }

  return (
    <div class="dashboard-root">
      {/* Left: Profile summary */}
      <aside class="dashboard-sidebar">
        <div class="profile-card" onClick={props.openProfile}>
          <img src={user().avatar} alt="Profile" class="profile-pic" />
          <h2>{user().name}</h2>
          <p class="profile-bio">{user().bio}</p>

          <div class="profile-tags">
            <p class="profile-section-title">Skills</p>
            <div class="tag-row">
              <For each={user().skills}>
                {(skill) => <span class="tag">{skill}</span>}
              </For>
            </div>
            <p class="profile-section-title">Interests</p>
            <div class="tag-row">
              <For each={user().interests}>
                {(interest) => <span class="tag tag-secondary">{interest}</span>}
              </For>
            </div>
          </div>

          <button type="button" class="primary-btn">
            View full profile
          </button>
        </div>

        <button
          type="button"
          class="secondary-btn small"
          style={{ marginTop: "0.75rem" }}
          onClick={props.openProjects}
        >
          View all projects →
        </button>
      </aside>

      {/* Center: Feed */}
      <main class="dashboard-main">
        <div class="dashboard-main-header">
          <div>
            <h1>BuildSpace Dashboard</h1>
            <p class="subtitle">
              A unified space for developer profiles, projects, and opportunities.
            </p>
          </div>
          <button
            type="button"
            class="secondary-btn small"
            onClick={props.toggleTheme}
          >
            {props.theme === "light" ? "Switch to dark" : "Switch to light"}
          </button>
        </div>

        <section class="card feed-card">
          <div class="feed-header">
            <h2>Community Feed</h2>
            <div class="feed-controls">
              <input
                type="text"
                class="feed-search"
                placeholder="Search feed..."
                value={feedSearch()}
                onInput={(e) => setFeedSearch(e.currentTarget.value)}
              />
              <div class="feed-filters">
                <button
                  type="button"
                  class={
                    "small-btn filter-btn" +
                    (feedFilter() === "all" ? " active" : "")
                  }
                  onClick={() => setFeedFilter("all")}
                >
                  All
                </button>
                <button
                  type="button"
                  class={
                    "small-btn filter-btn" +
                    (feedFilter() === "project" ? " active" : "")
                  }
                  onClick={() => setFeedFilter("project")}
                >
                  Projects
                </button>
                <button
                  type="button"
                  class={
                    "small-btn filter-btn" +
                    (feedFilter() === "opportunity" ? " active" : "")
                  }
                  onClick={() => setFeedFilter("opportunity")}
                >
                  Opportunities
                </button>
                <button
                  type="button"
                  class={
                    "small-btn filter-btn" +
                    (feedFilter() === "request" ? " active" : "")
                  }
                  onClick={() => setFeedFilter("request")}
                >
                  Requests
                </button>
              </div>
            </div>
          </div>

          <Show
            when={filteredFeedItems().length > 0}
            fallback={<p>No activity yet.</p>}
          >
            <ul class="feed-list">
              <For each={filteredFeedItems()}>
                {(item) => (
                  <li class={`feed-item feed-${item.type}`}>
                    <span class="feed-label">{item.type.toUpperCase()}</span>
                    <span class="feed-text">{item.text}</span>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </section>
      </main>

      {/* Right: Projects & Opportunities */}
      <aside class="dashboard-right">
        {/* Projects section */}
        <section class="card section-projects">
          <div class="section-header">
            <h2>Projects</h2>
            <button
              type="button"
              class="small-btn"
              onClick={() => setShowProjectForm(!showProjectForm())}
            >
              {showProjectForm() ? "Close" : "New Project"}
            </button>
          </div>

          <input
            type="text"
            class="section-search"
            placeholder="Search projects..."
            value={projectSearch()}
            onInput={(e) => setProjectSearch(e.currentTarget.value)}
          />

          <Show when={showProjectForm()}>
            <form class="form" onSubmit={handleCreateProject}>
              <input
                type="text"
                placeholder="Project title"
                value={projectTitle()}
                onInput={(e) => setProjectTitle(e.currentTarget.value)}
              />
              <textarea
                placeholder="Short description"
                value={projectDescription()}
                onInput={(e) => setProjectDescription(e.currentTarget.value)}
              />
              <input
                type="text"
                placeholder="Tech stack (comma separated)"
                value={projectTechStack()}
                onInput={(e) => setProjectTechStack(e.currentTarget.value)}
              />
              <button type="submit" class="primary-btn small">
                Create Project
              </button>
            </form>
          </Show>

          <Show
            when={filteredProjects().length > 0}
            fallback={<p>No projects found.</p>}
          >
            <ul class="project-list">
              <For each={filteredProjects()}>
                {(proj) => (
                  <li class="project-item">
                    <h3>{proj.title}</h3>
                    <p class="project-desc">{proj.description}</p>
                    <p class="project-meta">
                      Tech stack:{" "}
                      {proj.techStack && proj.techStack.length
                        ? proj.techStack.join(", ")
                        : "Not specified"}
                    </p>
                    <p class="project-meta">
                      Status: <strong>{proj.status}</strong>
                    </p>
                    <p class="project-meta">
                      Members: {proj.members.join(", ")}
                    </p>
                    <div class="project-actions">
                      <button
                        type="button"
                        class="primary-btn small"
                        onClick={() => handleRequestTeammates(proj)}
                      >
                        Request teammates
                      </button>
                    </div>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </section>

        {/* Opportunities section */}
        <section class="card section-opportunities">
          <div class="section-header">
            <h2>Opportunities</h2>
            <button
              type="button"
              class="small-btn"
              onClick={() => setShowOpportunityForm(!showOpportunityForm())}
            >
              {showOpportunityForm() ? "Close" : "Post Opportunity"}
            </button>
          </div>

          <input
            type="text"
            class="section-search"
            placeholder="Search opportunities..."
            value={opportunitySearch()}
            onInput={(e) => setOpportunitySearch(e.currentTarget.value)}
          />

          <Show when={showOpportunityForm()}>
            <form class="form" onSubmit={handleCreateOpportunity}>
              <select
                value={oppType()}
                onInput={(e) => setOppType(e.currentTarget.value)}
              >
                <option>Hackathon team opening</option>
                <option>Looking for teammates</option>
                <option>Hiring for project roles</option>
              </select>
              <input
                type="text"
                placeholder="Opportunity title"
                value={oppTitle()}
                onInput={(e) => setOppTitle(e.currentTarget.value)}
              />
              <textarea
                placeholder="Description"
                value={oppDescription()}
                onInput={(e) => setOppDescription(e.currentTarget.value)}
              />
              <input
                type="text"
                placeholder="Contact / handle"
                value={oppContact()}
                onInput={(e) => setOppContact(e.currentTarget.value)}
              />
              <button type="submit" class="primary-btn small">
                Post Opportunity
              </button>
            </form>
          </Show>

          <Show
            when={filteredOpportunities().length > 0}
            fallback={<p>No opportunities found.</p>}
          >
            <ul class="opportunity-list">
              <For each={filteredOpportunities()}>
                {(opp) => (
                  <li class="opportunity-item">
                    <span class="opp-type">{opp.type}</span>
                    <h3>{opp.title}</h3>
                    <p class="opp-desc">{opp.description}</p>
                    <p class="opp-contact">Contact: {opp.contact}</p>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </section>
      </aside>
    </div>
  );
}
