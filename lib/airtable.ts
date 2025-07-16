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
    const startupIds = user.record.get('Startup*') as string[] | undefined;
    if (!startupIds || startupIds.length === 0) {
      return null; // Team member not linked to any startup
    }
    startupRecord = await base(STARTUPS_TABLE).find(startupIds[0]);
  } else {
    startupRecord = user.record;
  }

  const startupName = startupRecord.get('Startup Name (or working title)') as string;
  const primaryContactEmail = startupRecord.get('Primary contact email') as string;
  const teamMemberIds = startupRecord.get('Team') as string[] | undefined;

  const teamMembers: { id: string, name: string, email: string, position: string, mobile: string, association: string }[] = [];

  if (teamMemberIds) {
    const teamMemberRecords = await Promise.all(
      teamMemberIds.map((id) => base(TEAM_MEMBERS_TABLE).find(id))
    );

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

  return {
    startupId: startupRecord.id,
    startupName,
    primaryContactEmail,
    teamMembers,
  };
}


export { base, STARTUPS_TABLE, TEAM_MEMBERS_TABLE };
export type { FieldSet }; 