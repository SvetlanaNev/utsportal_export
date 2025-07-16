import Airtable, { FieldSet, Record } from 'airtable';
import { STARTUPS_TABLE, TEAM_MEMBERS_TABLE } from './constants';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID!);

export async function findUserByEmail(email: string): Promise<{ record: Record<FieldSet>; table: string } | null> {
  const lowercasedEmail = email.toLowerCase();

  // Check Startups table
  const startupRecords = await base(STARTUPS_TABLE).select({
    filterByFormula: `LOWER({Primary contact email}) = "${lowercasedEmail}"`,
    maxRecords: 1
  }).firstPage();

  if (startupRecords.length > 0) {
    return { record: startupRecords[0], table: STARTUPS_TABLE };
  }

  // Check Team Members table
  const teamMemberRecords = await base(TEAM_MEMBERS_TABLE).select({
    filterByFormula: `LOWER({Personal email*}) = "${lowercasedEmail}"`,
    maxRecords: 1
  }).firstPage();

  if (teamMemberRecords.length > 0) {
    return { record: teamMemberRecords[0], table: TEAM_MEMBERS_TABLE };
  }

  return null;
}

export async function findUserByToken(token: string): Promise<{ record: Record<FieldSet>; table: string } | null> {
  // Check Startups table
  const startupRecords = await base(STARTUPS_TABLE).select({
    filterByFormula: `{Magic Link} = "${token}"`,
    maxRecords: 1
  }).firstPage();

  if (startupRecords.length > 0) {
    return { record: startupRecords[0], table: STARTUPS_TABLE };
  }

  // Check Team Members table
  const teamMemberRecords = await base(TEAM_MEMBERS_TABLE).select({
    filterByFormula: `{Magic Link} = "${token}"`,
    maxRecords: 1
  }).firstPage();

  if (teamMemberRecords.length > 0) {
    return { record: teamMemberRecords[0], table: TEAM_MEMBERS_TABLE };
  }

  return null;
}

export async function getDashboardData(email: string) {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  let startupRecord;
  if (user.table === TEAM_MEMBERS_TABLE) {
    const startupIdsFromAirtable = user.record.get('Startup*');
    if (!startupIdsFromAirtable) {
      return null; // Team member not linked to any startup
    }
    // Handle both single and multiple linked records
    const startupId = Array.isArray(startupIdsFromAirtable) ? (startupIdsFromAirtable[0] as string) : (startupIdsFromAirtable as string);
    try {
      startupRecord = await base(STARTUPS_TABLE).find(startupId);
    } catch (error) {
      console.error(`Could not find startup with ID ${startupId} linked from team member ${user.record.id}`);
      return null; // The linked startup was not found
    }
  } else {
    startupRecord = user.record;
  }

  const startupName = startupRecord.get('Startup Name (or working title)') as string;
  const primaryContactEmail = startupRecord.get('Primary contact email') as string;
  const teamMemberIdsFromAirtable = startupRecord.get('Team');
  console.log('[DASHBOARD_DATA] Raw team member IDs from Airtable:', teamMemberIdsFromAirtable);

  const teamMembers: { id: string, name: string, email: string, position: string, mobile: string, association: string }[] = [];

  // Handle both single and multiple linked records for team members
  let idsToFetch: string[] = [];
  if (teamMemberIdsFromAirtable) {
    if (Array.isArray(teamMemberIdsFromAirtable)) {
      idsToFetch = teamMemberIdsFromAirtable as string[];
    } else {
      idsToFetch = [teamMemberIdsFromAirtable as string];
    }
  }

  if (idsToFetch.length > 0) {
    // The Airtable API is returning the primary field value (name) of linked records, not their IDs.
    // We must build a formula to select the team members by their names.
    const filterFormula = "OR(" + idsToFetch.map(name => `{Team member ID} = '${name.replace(/'/g, "\\'")}'`).join(',') + ")";

    const teamMemberRecords = await base(TEAM_MEMBERS_TABLE).select({
      filterByFormula: filterFormula
    }).all();

    for (const record of teamMemberRecords) {
      teamMembers.push({
        id: record.id,
        name: record.get('Team member ID') as string,
        email: record.get('Personal email*') as string,
        position: record.get('Position at startup*') as string,
        mobile: record.get('Mobile*') as string,
        association: record.get('What is your association to UTS?*') as string,
      });
    }
  }

  console.log('[DASHBOARD_DATA] Final processed team members array:', teamMembers);
  return {
    startupId: startupRecord.id,
    startupName,
    primaryContactEmail,
    teamMembers,
  };
}


export { base, STARTUPS_TABLE, TEAM_MEMBERS_TABLE };
export type { FieldSet }; 