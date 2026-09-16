import { platformAuthService } from '../dist/services/platformAuthService.js';

async function test() {
  try {
    const res = await platformAuthService.login('admin@moon.com', 'admin', undefined, { ipAddress: '127.0.0.1' });
    console.log('Login Result:', res);
  } catch (err) {
    console.error('Login Error Stack:', err);
  }
}

test();
