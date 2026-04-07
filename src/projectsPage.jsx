import { createSignal, For, Show } from "solid-js";
import { sampleProjects } from "./models";
import "./App.css";

export default function ProjectsPage(props) {
  const [projects, setProjects] = createSignal(
    sampleProjects.map((p) => ({
      ...p,
      requests: [], // { id, name }
      invited: [], // { id, name }
    }))
  );

  const [selectedProjectId, setSelectedProjectId] = createSignal(
    sampleProjects[0]?.id ?? null
  );

  const [inviteName, setInviteName] = createSignal("");

  const selectedProject = () =>
    projects().find((p) => p.id === selectedProjectId()) ?? null;

  function handleInvite(e) {
    e.preventDefault();
    const name = inviteName().trim();
    if (!name || !selectedProject()) return;

    setProjects(
      projects().map((p) =>
        p.id === selectedProjectId()
          ? {
              ...p,
              invited: [...p.invited, { id: Date.now(), name }],
            }
          : p
      )
    );
    setInviteName("");

    // Push invite into feed (optional, as a request-type item)
    props.addFeedItem?.(
      `Invite sent to ${name} for project "${selectedProject().title}"`,
      "request"
    );
  }

  function handleAcceptRequest(requestId) {
    const proj = selectedProject();
    if (!proj) return;

    setProjects(
      projects().map((p) => {
        if (p.id !== proj.id) return p;
        const request = p.requests.find((r) => r.id === requestId);
        if (!request) return p;
        return {
          ...p,
          members: [...p.members, request.name],
          requests: p.requests.filter((r) => r.id !== requestId),
        };
      })
    );

    const accepted =
      selectedProject()?.requests.find((r) => r.id === requestId) || null;
    if (accepted) {
      props.addFeedItem?.(
        `${accepted.name} was accepted into project "${selectedProject().title}"`,
        "request"
      );
    }
  }

  // For demo: simulate a join request for the selected project
  function handleMockJoinRequest() {
    const proj = selectedProject();
    if (!proj) return;
    const mockName = `Dev ${proj.requests.length + 1}`;
    setProjects(
      projects().map((p) =>
        p.id === proj.id
          ? {
              ...p,
              requests: [...p.requests, { id: Date.now(), name: mockName }],
            }
          : p
      )
    );

    props.addFeedItem?.(
      `Join request received from ${mockName} for project "${proj.title}"`,
      "request"
    );
  }

  return (
    <div class="projects-page">
      <div class="projects-page-header">
        <button
          type="button"
          class="secondary-btn small"
          onClick={props.goBack}
        >
          ← Back to Dashboard
        </button>
        <h1>My Projects</h1>
        <p class="subtitle">
          Manage members, invites, and join requests for your projects.
        </p>
      </div>

      <div class="projects-layout">
        <aside class="card projects-list-card">
          <h2>Projects</h2>
          <ul class="projects-list">
            <For each={projects()}>
              {(proj) => (
                <li>
                  <button
                    type="button"
                    class={
                      "project-tab" +
                      (proj.id === selectedProjectId() ? " active" : "")
                    }
                    onClick={() => setSelectedProjectId(proj.id)}
                  >
                    <span class="project-tab-title">{proj.title}</span>
                    <span class="project-tab-status">{proj.status}</span>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </aside>

        <main class="card project-detail-card">
          <Show when={selectedProject()} fallback={<p>No project selected.</p>}>
            {(proj) => (
              <div>
                <h2>{proj().title}</h2>
                <p class="project-desc">{proj().description}</p>
                <p class="project-meta">
                  Tech stack: {proj().techStack.join(", ")}
                </p>
                <p class="project-meta">
                  Status: <strong>{proj().status}</strong>
                </p>

                <section class="project-section">
                  <h3>Members</h3>
                  <ul class="chip-list">
                    <For each={proj().members}>
                      {(m) => <li class="chip">{m}</li>}
                    </For>
                  </ul>
                </section>

                <section class="project-section">
                  <h3>Invite collaborators</h3>
                  <form class="inline-form" onSubmit={handleInvite}>
                    <input
                      type="text"
                      placeholder="Enter name or handle"
                      value={inviteName()}
                      onInput={(e) => setInviteName(e.currentTarget.value)}
                    />
                    <button type="submit" class="primary-btn small">
                      Send Invite
                    </button>
                  </form>
                  <Show when={proj().invited.length > 0}>
                    <p class="project-meta" style={{ marginTop: "0.5rem" }}>
                      Pending invites:
                    </p>
                    <ul class="chip-list">
                      <For each={proj().invited}>
                        {(inv) => (
                          <li class="chip chip-secondary">{inv.name}</li>
                        )}
                      </For>
                    </ul>
                  </Show>
                </section>

                <section class="project-section">
                  <h3>Join requests</h3>
                  <button
                    type="button"
                    class="secondary-btn small"
                    onClick={handleMockJoinRequest}
                  >
                    + Simulate join request
                  </button>
                  <Show
                    when={proj().requests.length > 0}
                    fallback={
                      <p class="project-meta" style={{ marginTop: "0.5rem" }}>
                        No pending requests.
                      </p>
                    }
                  >
                    <ul class="requests-list">
                      <For each={proj().requests}>
                        {(req) => (
                          <li class="request-item">
                            <span>{req.name}</span>
                            <button
                              type="button"
                              class="primary-btn small"
                              onClick={() => handleAcceptRequest(req.id)}
                            >
                              Accept
                            </button>
                          </li>
                        )}
                      </For>
                    </ul>
                  </Show>
                </section>
              </div>
            )}
          </Show>
        </main>
      </div>
    </div>
  );
}
