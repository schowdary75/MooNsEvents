import { platformAuthService } from '../src/services/platformAuthService.js';

async function test() {
  try {
    const res = await platformAuthService.login('admin@moon.com', 'admin', undefined, { ipAddress: '127.0.0.1' });
    console.log('SUCCESSFUL LOGIN RESULT:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('LOGIN ERROR STACK:', err);
  }
}

test();
