export async function runEventAutomationBatch(limit = 50) {
  return {
    scanned: 0,
    succeeded: 0,
    failed: 0,
    incidentRecovery: { processed: 0 },
  };
}
