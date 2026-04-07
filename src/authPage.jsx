import { createSignal, Show } from "solid-js";
import { apiFetch } from "./apiClient";

export default function AuthPage(props) {
  const [mode, setMode] = createSignal("login");
  const [step, setStep] = createSignal("form");
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [name, setName] = createSignal("");
  const [otp, setOtp] = createSignal("");
  const [error, setError] = createSignal("");
  const [notice, setNotice] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [resending, setResending] = createSignal(false);

  function switchMode(nextMode) {
    setMode(nextMode);
    setStep("form");
    setOtp("");
    setError("");
    setNotice("");
  }

  async function handleSignup(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const data = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email: email(),
          password: password(),
          name: name(),
        }),
      });
      setStep("verify");
      setOtp("");
      setNotice(data.message || `We sent a verification code to ${email()}.`);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const result = await apiFetch("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email: email(), code: otp() }),
      });
      setNotice(result.message || "Email verified. Logging you in...");
      await handleLoginInternal();
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLoginInternal() {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email(), password: password() }),
    });
    props.onAuthSuccess(data.user, data.accessToken);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);
    try {
      await handleLoginInternal();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError("");
    setNotice("");
    setResending(true);
    try {
      const data = await apiFetch("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: email() }),
      });
      setNotice(data.message || `A new verification code was sent to ${email()}.`);
    } catch (err) {
      setError(err.message || "Could not resend the verification code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div class="profile-page">
      <div class="profile-page-card">
        <div class="profile-page-header">
          <h1>BuildSpace Login</h1>
          <p class="profile-page-subtitle">
            Sign in or create an account to access your dashboard.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.5rem", "margin-bottom": "0.75rem" }}>
          <button
            type="button"
            class={`small-btn ${mode() === "login" ? "primary-btn" : "secondary-btn"}`}
            onClick={() => switchMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            class={`small-btn ${mode() === "signup" ? "primary-btn" : "secondary-btn"}`}
            onClick={() => switchMode("signup")}
          >
            Create account
          </button>
        </div>

        <Show when={error()}>
          <p style={{ color: "#f87171", "margin-bottom": "0.5rem" }}>{error()}</p>
        </Show>

        <Show when={notice()}>
          <p style={{ color: "#60a5fa", "margin-bottom": "0.5rem" }}>{notice()}</p>
        </Show>

        <Show when={mode() === "login" && step() === "form"}>
          <form class="basic-form" onSubmit={handleLogin}>
            <div class="basic-form-row">
              <label>Email</label>
              <input
                type="email"
                required
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
              />
            </div>
            <div class="basic-form-row">
              <label>Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
              />
            </div>
            <button type="submit" class="primary-btn" disabled={loading()}>
              {loading() ? "Logging in..." : "Login"}
            </button>
          </form>
        </Show>

        <Show when={mode() === "signup" && step() === "form"}>
          <form class="basic-form" onSubmit={handleSignup}>
            <div class="basic-form-row">
              <label>Name</label>
              <input
                type="text"
                required
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
              />
            </div>
            <div class="basic-form-row">
              <label>Email</label>
              <input
                type="email"
                required
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
              />
            </div>
            <div class="basic-form-row">
              <label>Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
              />
            </div>
            <button type="submit" class="primary-btn" disabled={loading()}>
              {loading() ? "Creating account..." : "Continue"}
            </button>
          </form>
        </Show>

        <Show when={mode() === "signup" && step() === "verify"}>
          <form class="basic-form" onSubmit={handleVerify}>
            <p class="profile-page-subtitle">
              We have sent a verification code to {email()}. Enter it below.
            </p>
            <div class="basic-form-row">
              <label>Verification code</label>
              <input
                type="text"
                required
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                value={otp()}
                onInput={(e) =>
                  setOtp(e.currentTarget.value.replace(/\D/g, "").slice(0, 6))
                }
              />
            </div>
            <button type="submit" class="primary-btn" disabled={loading()}>
              {loading() ? "Verifying..." : "Verify & Login"}
            </button>
            <button
              type="button"
              class="secondary-btn"
              disabled={resending()}
              onClick={handleResendCode}
            >
              {resending() ? "Sending..." : "Resend code"}
            </button>
          </form>
        </Show>
      </div>
    </div>
  );
}
