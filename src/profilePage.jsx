import { createSignal, For, Show } from "solid-js";

export default function ProfilePage(props) {
  const [name, setName] = createSignal("John Doe");
  const [age, setAge] = createSignal(20);
  const [bio, setBio] = createSignal(
    "Hyperloop enthusiast @ IITM, building cool projects on BuildSpace."
  );
  const [avatarUrl, setAvatarUrl] = createSignal(
    "https://via.placeholder.com/150"
  );

  const [skills, setSkills] = createSignal([
    "JavaScript",
    "SolidJS",
    "CSS",
  ]);
  const [interests, setInterests] = createSignal([
    "Web Development",
    "UI/UX Design",
    "Open Source",
  ]);
  const [inputSkill, setInputSkill] = createSignal(false);
  const [inputInterest, setInputInterest] = createSignal(false);
  const [newSkill, setNewSkill] = createSignal("");
  const [newInterest, setNewInterest] = createSignal("");

  const [editingBasic, setEditingBasic] = createSignal(false);

  function handleAddSkill(e) {
    e.preventDefault();
    const value = newSkill().trim();
    if (!value) return;
    setSkills([...skills(), value]);
    setNewSkill("");
    setInputSkill(false);
  }

  function handleAddInterest(e) {
    e.preventDefault();
    const value = newInterest().trim();
    if (!value) return;
    setInterests([...interests(), value]);
    setNewInterest("");
    setInputInterest(false);
  }

  function handleSaveBasic(e) {
    e.preventDefault();
    // signals already updated via onInput; just close edit mode
    setEditingBasic(false);
  }

  return (
    <div class="profile-page">
      <div class="profile-page-card">
        <div class="profile-page-header">
          <button
            type="button"
            class="secondary-btn small"
            onClick={props.goBack}
          >
            ← Back to Dashboard
          </button>
          <h1>Developer Profile</h1>
          <p class="profile-page-subtitle">
            Manage your basic info, skills, interests, and avatar.
          </p>
        </div>

        <section class="profile-page-section">
          <h2>Basic Info</h2>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <img
              src={avatarUrl()}
              alt="Avatar preview"
              style={{
                width: "80px",
                height: "80px",
                "border-radius": "999px",
                "object-fit": "cover",
                border: "3px solid #60a5fa",
              }}
            />
            <div style={{ flex: 1 }}>
              <Show when={!editingBasic()} fallback={
                <form class="basic-form" onSubmit={handleSaveBasic}>
                  <div class="basic-form-row">
                    <label>Name</label>
                    <input
                      type="text"
                      value={name()}
                      onInput={(e) => setName(e.currentTarget.value)}
                    />
                  </div>
                  <div class="basic-form-row">
                    <label>Age</label>
                    <input
                      type="number"
                      min="0"
                      value={age()}
                      onInput={(e) => setAge(parseInt(e.currentTarget.value) || 0)}
                    />
                  </div>
                  <div class="basic-form-row">
                    <label>Bio</label>
                    <textarea
                      rows={3}
                      value={bio()}
                      onInput={(e) => setBio(e.currentTarget.value)}
                    />
                  </div>
                  <div class="basic-form-row">
                    <label>Avatar URL</label>
                    <input
                      type="text"
                      value={avatarUrl()}
                      onInput={(e) => setAvatarUrl(e.currentTarget.value)}
                    />
                  </div>
                  <button type="submit" class="primary-btn small">
                    Save changes
                  </button>
                </form>
              }>
                <>
                  <p>
                    <strong>Name:</strong> {name()}
                  </p>
                  <p>
                    <strong>Age:</strong> {age()}
                  </p>
                  <p>
                    <strong>Bio:</strong> {bio()}
                  </p>
                  <button
                    type="button"
                    class="primary-btn small"
                    style={{ marginTop: "0.5rem" }}
                    onClick={() => setEditingBasic(true)}
                  >
                    Edit profile
                  </button>
                </>
              </Show>
            </div>
          </div>
        </section>

        <section class="profile-page-section">
          <h2>Skills</h2>
          <ul class="chip-list">
            <For each={skills()}>{(skill) => <li class="chip">{skill}</li>}</For>
          </ul>
          {!inputSkill() && (
            <button
              type="button"
              class="primary-btn small"
              onClick={() => setInputSkill(true)}
            >
              + Add Skill
            </button>
          )}
          {inputSkill() && (
            <form class="inline-form" onSubmit={handleAddSkill}>
              <input
                type="text"
                placeholder="Enter new skill"
                value={newSkill()}
                onInput={(e) => setNewSkill(e.currentTarget.value)}
              />
              <button type="submit" class="primary-btn small">
                Save
              </button>
            </form>
          )}
        </section>

        <section class="profile-page-section">
          <h2>Interests</h2>
          <ul class="chip-list">
            <For each={interests()}>
              {(interest) => <li class="chip chip-secondary">{interest}</li>}
            </For>
          </ul>
          {!inputInterest() && (
            <button
              type="button"
              class="primary-btn small"
              onClick={() => setInputInterest(true)}
            >
              + Add Interest
            </button>
          )}
          {inputInterest() && (
            <form class="inline-form" onSubmit={handleAddInterest}>
              <input
                type="text"
                placeholder="Enter new interest"
                value={newInterest()}
                onInput={(e) => setNewInterest(e.currentTarget.value)}
              />
              <button type="submit" class="primary-btn small">
                Save
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
