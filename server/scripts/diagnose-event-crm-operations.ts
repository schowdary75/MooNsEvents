import { crmLogin } from '../src/operations/identityOperations.js';
import { adminGetJourneyBoard } from '../src/operations/eventExecutionOperations.js';
import { adminGetLocationsAll } from '../src/operations/catalogOperations.js';
import { adminGetDeals, adminGetPipelines } from '../src/operations/crmOperations.js';
import { getAllSupportChats } from '../src/operations/supportOperations.js';
import {
  adminGetListingRevisions,
  adminGetLeads,
  adminGetVendorsAll,
} from '../src/legacy/api/db.functions.server.js';

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
if (!email || !password) throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');

const login = (await crmLogin({ data: { email, password } })) as any;
if (!login.success) throw new Error(`CRM login failed: ${login.error}`);

const auth = { email, sessionToken: login.user.session_token };
const operations = {
  adminGetJourneyBoard,
  getAllSupportChats,
  adminGetLocationsAll,
  adminGetVendorsAll,
  adminGetListingRevisions,
  adminGetPipelines,
  adminGetDeals,
  adminGetLeads,
};

let failed = false;
for (const [name, operation] of Object.entries(operations)) {
  try {
    await operation({ data: { auth } });
    console.log(`${name}\tPASS`);
  } catch (error) {
    failed = true;
    console.error(`${name}\tFAIL`);
    console.error(error);
  }
}

process.exit(failed ? 1 : 0);
