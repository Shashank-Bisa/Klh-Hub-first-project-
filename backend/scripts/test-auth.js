const API = process.env.API_URL || 'http://localhost:5000/api';

async function run() {
  console.log('Starting auth tests against', API);

  // Non-KLH register (should be blocked)
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Block Test', email: 'user@example.com', password: 'BadPass123!', role: 'student' })
    });
    const data = await res.json();
    console.log('\n--- Non-KLH register result ---');
    console.log('Status:', res.status);
    console.log('Body:', data);
    if (res.status === 400) console.log('✅ Non-KLH correctly blocked'); else throw new Error('Non-KLH registration was NOT blocked');
  } catch (err) {
    console.error('Non-KLH test failed:', err.message);
    process.exit(1);
  }

  // KLH register (should succeed)
  const ts = Date.now();
  const klhEmail = `testuser+${ts}@klh.edu.in`;
  let token = null;
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'KLH Test', email: klhEmail, password: 'GoodPass123!', role: 'student' })
    });
    const data = await res.json();
    console.log('\n--- KLH register result ---');
    console.log('Status:', res.status);
    console.log('Body:', data);
    if (res.status !== 201) throw new Error('KLH registration failed');
    token = data.token;
    console.log('✅ KLH registration succeeded');
  } catch (err) {
    console.error('KLH registration test failed:', err.message);
    process.exit(1);
  }

  // KLH login
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: klhEmail, password: 'GoodPass123!' })
    });
    const data = await res.json();
    console.log('\n--- KLH login result ---');
    console.log('Status:', res.status);
    console.log('Body:', data);
    if (res.status !== 200) throw new Error('KLH login failed');
    console.log('✅ KLH login succeeded');
  } catch (err) {
    console.error('KLH login test failed:', err.message);
    process.exit(1);
  }

  console.log('\nAll auth tests passed ✅');
  process.exit(0);
}

run();
