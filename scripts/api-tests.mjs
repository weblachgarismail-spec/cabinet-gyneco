const BASE = "http://127.0.0.1:3000";

async function json(url, opts = {}) {
  const headers = { "Content-Type": "application/json", ...opts.headers };
  const res = await fetch(url, { headers, ...opts });
  const body = await res.json().catch(() => null);
  return { status: res.status, body, headers: res.headers };
}

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`  \u2713 ${name}`);
    passed++;
  } catch (e) {
    console.log(`  \u2717 ${name}`);
    console.log(`      ${e.message}`);
    failed++;
  }
}

async function getCsrfAndLogin(username, password) {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  const { csrfToken } = await csrfRes.json();
  const csrfCookie = csrfRes.headers.get("set-cookie") || "";

  const loginRes = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": csrfCookie,
    },
    body: new URLSearchParams({ username, password, csrfToken }),
    redirect: "manual",
  });

  const allCookies = [];
  loginRes.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") allCookies.push(value);
  });
  const combined = allCookies.join("; ");
  const match = combined.match(/next-auth\.session-token=([^;]+)/);
  if (!match) throw new Error("Login failed - no session cookie");
  return `next-auth.session-token=${match[1]}`;
}

async function main() {
  console.log("API Integration Tests\n");

  // Booking
  const BOOK_DATE = "2026-07-20";
  const BOOK_TIME = "09:00";

  await test("POST /api/booking - creates appointment", async () => {
    const { status, body } = await json(`${BASE}/api/booking`, {
      method: "POST",
      body: JSON.stringify({ date: BOOK_DATE, time: BOOK_TIME, patientName: "API Test", phone: "0612345678" }),
    });
    if (status !== 201) throw new Error(`Expected 201, got ${status}`);
    if (!body.success) throw new Error("Expected success=true");
  });

  await test("POST /api/booking - returns 400 on missing fields", async () => {
    const { status } = await json(`${BASE}/api/booking`, {
      method: "POST",
      body: JSON.stringify({ patientName: "Incomplete" }),
    });
    if (status !== 400) throw new Error(`Expected 400, got ${status}`);
  });

  await test("POST /api/booking - returns 409 on double booking", async () => {
    const payload = { date: "2026-07-21", time: "10:00", patientName: "First", phone: "0611111111" };
    await json(`${BASE}/api/booking`, { method: "POST", body: JSON.stringify(payload) });
    const { status } = await json(`${BASE}/api/booking`, { method: "POST", body: JSON.stringify(payload) });
    if (status !== 409) throw new Error(`Expected 409, got ${status}`);
  });

  // Slots
  await test("GET /api/slots - returns time slots", async () => {
    const { status, body } = await json(`${BASE}/api/slots?date=2026-07-25`);
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!body || !Array.isArray(body.slots)) throw new Error("Expected { slots: [...] }");
  });

  // Auth
  let cookie;
  await test("Login as secretary returns session cookie", async () => {
    cookie = await getCsrfAndLogin("secretaire", "secretary123");
    if (!cookie) throw new Error("No cookie");
  });

  // Appointments (POST walk-in)
  await test("POST /api/admin/appointments - creates walk-in", async () => {
    const { status, body } = await json(`${BASE}/api/admin/appointments`, {
      method: "POST",
      body: JSON.stringify({ patientName: "Walk-in API", phone: "0622222222" }),
      headers: { Cookie: cookie },
    });
    if (status !== 201) throw new Error(`Expected 201, got ${status}`);
    if (!body || !body.id) throw new Error("Expected appointment id");
  });

  await test("POST /api/admin/appointments - 401 without auth", async () => {
    const { status } = await json(`${BASE}/api/admin/appointments`, {
      method: "POST",
      body: JSON.stringify({ patientName: "No Auth", phone: "0699999999" }),
    });
    if (status !== 401) throw new Error(`Expected 401, got ${status}`);
  });

  // Role-based access
  let adminCookie;
  await test("Login as admin returns session cookie", async () => {
    adminCookie = await getCsrfAndLogin("admin", "admin123");
    if (!adminCookie) throw new Error("No cookie");
  });

  await test("GET /api/admin/users - forbidden for secretary", async () => {
    const { status } = await json(`${BASE}/api/admin/users`, { headers: { Cookie: cookie } });
    if (status !== 403) throw new Error(`Expected 403, got ${status}`);
  });

  await test("GET /api/admin/users - allowed for super admin", async () => {
    const { status, body } = await json(`${BASE}/api/admin/users`, { headers: { Cookie: adminCookie } });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(body)) throw new Error("Expected array");
  });

  // Patients
  let patientId;
  await test("POST /api/admin/patients - creates patient", async () => {
    const { status, body } = await json(`${BASE}/api/admin/patients`, {
      method: "POST",
      body: JSON.stringify({ patientName: "Patient API", phone: "0633333333", city: "Casablanca" }),
      headers: { Cookie: cookie },
    });
    if (status !== 201) throw new Error(`Expected 201, got ${status}`);
    if (!body || !body.id) throw new Error("Expected patient id");
    patientId = body.id;
  });

  await test("GET /api/admin/patients - lists patients", async () => {
    const { status, body } = await json(`${BASE}/api/admin/patients`, { headers: { Cookie: cookie } });
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(body)) throw new Error("Expected array");
  });

  console.log(`\n${passed + failed} tests: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
