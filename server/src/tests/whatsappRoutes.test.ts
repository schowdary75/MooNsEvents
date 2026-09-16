import request from 'supertest';
import { describe, expect, it } from 'vitest';

const { createApp } = await import('../app.js');

describe('lead WhatsApp route security', () => {
  it.each([
    ['get', '/api/v1/whatsapp/leads/1/conversation'],
    ['post', '/api/v1/whatsapp/leads/1/messages'],
    ['post', '/api/v1/whatsapp/leads/1/read'],
    ['get', '/api/v1/whatsapp/templates'],
  ] as const)('requires staff authentication for %s %s', async (method, path) => {
    const response = await request(createApp())[method](path);
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      success: false,
      code: 'AUTHENTICATION_REQUIRED',
    });
  });
});
