const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getHeaders = () => {
  const token = localStorage.getItem("sevasync_token");
  return {
    "Bypass-Tunnel-Reminder": "true",
    "Content-Type": "application/json",
    ...(token ? { "x-auth-token": token } : {})
  };
};

export async function loginUser(data) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Login failed");
  }
  return res.json();
}

export async function signupUser(data) {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Signup failed");
  }
  return res.json();
}

export async function analyzeIssue(description) {
  const res = await fetch(`${BASE_URL}/ngo/analyze-issue`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ description })
  });
  if (!res.ok) throw new Error("Failed to analyze issue");
  return res.json();
}

export async function getIssues() {
  const res = await fetch(`${BASE_URL}/issues`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch issues");
  return res.json();
}

export async function getTasks() {
  const res = await fetch(`${BASE_URL}/issues`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch tasks");
  const data = await res.json();
  return Array.isArray(data) ? { tasks: data } : data;
}

export async function getTask(id) {
  const res = await fetch(`${BASE_URL}/issues/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch task");
  const data = await res.json();
  return data.task ? data : { task: data };
}

export async function createIssue(data) {
  const res = await fetch(`${BASE_URL}/issues`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to create issue: ${res.status}`);
  }
  return res.json();
}

export async function acceptIssue(issueId) {
  const res = await fetch(`${BASE_URL}/issues/${issueId}/accept`, {
    method: "POST",
    headers: getHeaders()
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to accept issue`);
  }
  return res.json();
}

export async function getNgoDashboard() {
  const res = await fetch(`${BASE_URL}/ngo/dashboard`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch NGO dashboard");
  return res.json();
}

export async function getVolunteerDashboard() {
  const res = await fetch(`${BASE_URL}/volunteer/dashboard`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch Volunteer dashboard");
  return res.json();
}


// ── AI / Gemini ──────────────────────────────────────────
export async function analyzeIssueDeep(description) {
  const res = await fetch(`${BASE_URL}/gemini/analyze`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ description })
  });
  if (!res.ok) throw new Error("AI analysis failed");
  return res.json();
}

export async function aiMatchVolunteers(issueId, volunteerLat, volunteerLng) {
  const res = await fetch(`${BASE_URL}/gemini/match/${issueId}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ volunteerLat, volunteerLng })
  });
  if (!res.ok) throw new Error("AI matching failed");
  return res.json();
}

export async function getCommunityStats() {
  const res = await fetch(`${BASE_URL}/gemini/community-stats`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to get community stats");
  return res.json();
}

// ── Survey ────────────────────────────────────────────────
export async function uploadSurveyBulk(entries) {
  const res = await fetch(`${BASE_URL}/survey/bulk`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ entries })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Survey upload failed");
  }
  return res.json();
}

export async function broadcastIssue(issueId) {
  const res = await fetch(`${BASE_URL}/issues/${issueId}/broadcast`, {
    method: "POST",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to trigger broadcast");
  return res.json();
}

// ── Issues extras ─────────────────────────────────────────
export async function completeIssue(issueId) {
  const res = await fetch(`${BASE_URL}/issues/${issueId}/complete`, {
    method: "POST",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Failed to mark complete");
  return res.json();
}

export async function getLeaderboard() {
  const res = await fetch(`${BASE_URL}/volunteer/leaderboard`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Failed to fetch leaderboard");
  return res.json();
}

export async function translateText(title, description, targetLang) {
  const res = await fetch(`${BASE_URL}/gemini/translate`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ text: { title, description }, targetLang })
  });
  if (!res.ok) throw new Error("Translation failed");
  return res.json();
}

export async function getImpactStory() {
  const res = await fetch(`${BASE_URL}/gemini/generate-story`, {
    method: "POST",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Story generation failed");
  return res.json();
}
