# Lead WhatsApp two-way inbox

The Leads WhatsApp inbox lets staff read and reply to customer messages without leaving
MooNsEvents. It is intentionally human-operated: Maya does not send autonomous replies from this
inbox.

The first release supports:

- inbound and outbound text messages;
- approved Meta text templates when the 24-hour customer-service window is closed;
- sent, delivered, read, and failed delivery states;
- unread badges, read receipts, cursor pagination, Socket.IO updates, and polling fallback;
- automatic lead creation for a new inbound phone number; and
- visible placeholders for unsupported inbound media.

Media sending is not included yet.

## Before you connect Meta

You need a Meta app with WhatsApp enabled, a WhatsApp Business Account, and a phone number registered
for the Cloud API. In Meta's dashboard, collect:

- a permanent/system-user access token;
- the Meta app secret;
- the phone-number ID;
- the WhatsApp Business Account ID; and
- the Graph API version your app uses, such as `v21.0`.

Do not paste these values into source code, documentation, screenshots, issues, or commits.

Set one private deployment-level verification token in the API environment:

```dotenv
META_WHATSAPP_VERIFY_TOKEN=
```

Generate a long random value in your secret manager. This is the value Meta will send during the
webhook challenge. It is not a workspace access token.

## Connect a workspace

1. Sign in as a workspace administrator with a recently verified MFA session.
2. Open **Leads** and select the WhatsApp action for any lead.
3. Enter the access token, app secret, phone-number ID, business-account ID, and Graph API version.
4. Select **Save and verify connection**.
5. Copy the callback URL shown in the panel.
6. In Meta's WhatsApp webhook settings, use that callback URL and the deployment's
   `META_WHATSAPP_VERIFY_TOKEN`.
7. Subscribe the app to the `messages` webhook field.

Credentials are write-only. MooNsEvents encrypts them through the existing tenant secret store,
keeps the phone-number ID as an indexed non-secret routing identifier, and marks the provider active
only after Meta verifies it.

The public callback is:

```text
https://YOUR_API_HOST/api/v1/public/webhooks/meta/whatsapp
```

Meta POST requests must include a valid `X-Hub-Signature-256` signature generated with the app
secret. Unsigned or incorrectly signed events are rejected before message content is processed.

## Legacy single-workspace development

The workspace panel is the preferred configuration. A legacy local deployment can instead use the
empty placeholders in `.env.example`:

```dotenv
META_WHATSAPP_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_BUSINESS_ACCOUNT_ID=
META_WHATSAPP_APP_SECRET=
META_WHATSAPP_VERIFY_TOKEN=
META_WHATSAPP_API_VERSION=v21.0
```

Keep the real values only in an ignored `.env` file or external secret manager. Restart the API and
worker after changing environment values.

## Agent workflow

1. Open **Leads**.
2. Select the green WhatsApp action in a lead row or the same action in the lead detail panel.
3. Review the customer, assigned owner, message timeline, timestamps, and delivery state.
4. Edit the prefilled greeting and press Enter to send. Use Shift+Enter for a new line.
5. If the service window is closed, choose an approved template. Customer and agent names prefill
   the first two template values when those values exist.
6. Open the inbox to clear its unread count. Failed messages keep a safe provider error and can be
   retried.

Messages are limited to 4,096 characters. Indian ten-digit numbers are normalized to `91...`;
explicit international country codes are preserved. Missing, ambiguous, or invalid numbers are
rejected.

## API

Authenticated lead-authorized staff can use:

```text
GET  /api/v1/whatsapp/leads/:leadId/conversation?cursor=&limit=
POST /api/v1/whatsapp/leads/:leadId/messages
POST /api/v1/whatsapp/leads/:leadId/read
GET  /api/v1/whatsapp/templates
```

Example text request:

```json
{
  "type": "text",
  "text": "Hi Ananya, this is MooN. How can I help with your event?",
  "clientMessageId": "4bfe9d2f-4396-43a1-b57f-13810b4f5b87"
}
```

Example template request:

```json
{
  "type": "template",
  "template": {
    "name": "lead_greeting",
    "language": "en",
    "parameters": ["Ananya", "MooN"]
  },
  "clientMessageId": "514ea336-b184-4e31-8e15-30776c6b7029"
}
```

The `clientMessageId` makes retries idempotent. Meta message IDs deduplicate inbound delivery and
associate delivery-status webhooks with outbound messages.

## Local verification

After installing dependencies:

```bash
npm run prisma:generate
npm run typecheck
npm test
npm run lint
npm run build
npm run secrets:check
```

Apply both migration sets before testing with a real workspace:

```bash
npm run prisma:deploy
npm run prisma:deploy:platform
```

Meta must reach the callback over public HTTPS. Use a trusted development tunnel only for local
webhook testing, and never include credentials in the tunnel URL or terminal output.

## Troubleshooting

- **WhatsApp is not connected:** ask a workspace admin to save and verify the Meta connection.
- **Approved template required:** the last inbound customer message is older than 24 hours; select
  an approved template.
- **Invalid webhook signature:** confirm the workspace app secret and ensure the request body is not
  modified by a proxy.
- **Webhook endpoint not registered:** confirm Meta's phone-number ID matches the workspace
  connection.
- **No instant update:** the inbox automatically falls back to five-second polling when Socket.IO
  is unavailable.
