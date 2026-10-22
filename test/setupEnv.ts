import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';

beforeAll(setupContainer);

afterAll(stopContainer);
afterEach(resetContainer);

let container: StartedPostgreSqlContainer;

async function setupContainer() {
  container = await new PostgreSqlContainer('postgres:latest').start();
  vi.stubEnv('DB_HOST', container.getHost());
  vi.stubEnv('DB_DATABASE', container.getDatabase());
  vi.stubEnv('DB_USERNAME', container.getUsername());
  vi.stubEnv('DB_PASSWORD', container.getPassword());
  vi.stubEnv('DB_PORT', container.getPort().toString());
  vi.stubEnv('JWT_SECRET', 'testtesttesttesttesttesttesttesttesttesttest');
  await container.snapshot();
}

async function resetContainer() {
  await container.restoreSnapshot();
}

async function stopContainer() {
  await container.stop();
}
