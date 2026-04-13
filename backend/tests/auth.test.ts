import request from 'supertest';
import app from '../src/app';
import { pool } from '../src/config/db';

afterAll(async () => {
  await pool.end();
});

beforeAll(async () => {
  // Clean up test data
  await pool.query("DELETE FROM users WHERE email = 'authtest@test.com'");
});

// Test 1: Full auth flow
it('registers and logs in successfully', async () => {
  const reg = await request(app)
    .post('/auth/register')
    .send({ name: 'Test', email: 'authtest@test.com', password: 'pass1234' });
  expect(reg.status).toBe(201);
  expect(reg.body.token).toBeDefined();
  expect(reg.body.user.email).toBe('authtest@test.com');
  expect(reg.body.user.password).toBeUndefined();

  const login = await request(app)
    .post('/auth/login')
    .send({ email: 'authtest@test.com', password: 'pass1234' });
  expect(login.status).toBe(200);
  expect(login.body.token).toBeDefined();
});

// Test 2: Unauthenticated access returns 401
it('returns 401 for unauthenticated requests', async () => {
  const res = await request(app).get('/projects');
  expect(res.status).toBe(401);
});

// Test 3: Task creation round-trip
it('creates a task and it appears in project detail', async () => {
  // Register and get token
  const reg = await request(app)
    .post('/auth/register')
    .send({ name: 'TaskTest', email: 'tasktest@test.com', password: 'pass1234' });
  const token = reg.body.token;

  // Create project
  const proj = await request(app)
    .post('/projects')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Project', description: 'For testing' });
  expect(proj.status).toBe(201);
  const projectId = proj.body.id;

  // Create task
  const task = await request(app)
    .post(`/projects/${projectId}/tasks`)
    .set('Authorization', `Bearer ${token}`)
    .send({ title: 'Test Task', priority: 'high' });
  expect(task.status).toBe(201);
  expect(task.body.title).toBe('Test Task');

  // Verify task appears in project detail
  const detail = await request(app)
    .get(`/projects/${projectId}`)
    .set('Authorization', `Bearer ${token}`);
  expect(detail.status).toBe(200);
  expect(detail.body.tasks).toHaveLength(1);
  expect(detail.body.tasks[0].title).toBe('Test Task');

  // Cleanup
  await pool.query('DELETE FROM projects WHERE id = $1', [projectId]);
  await pool.query("DELETE FROM users WHERE email IN ('tasktest@test.com')");
});
