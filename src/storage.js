import { supabase } from './supabaseClient.js';

const COLUMNS = 'date, weight, body_fat, visceral_fat, chest, arm, waist, hip, thigh';

function toRecord(row) {
  const record = {
    date: row.date,
    weight: row.weight,
    bodyFat: row.body_fat,
    visceralFat: row.visceral_fat,
  };
  if (row.chest !== null) record.chest = row.chest;
  if (row.arm !== null) record.arm = row.arm;
  if (row.waist !== null) record.waist = row.waist;
  if (row.hip !== null) record.hip = row.hip;
  if (row.thigh !== null) record.thigh = row.thigh;
  return record;
}

function toRow(record, userId) {
  return {
    user_id: userId,
    date: record.date,
    weight: record.weight,
    body_fat: record.bodyFat,
    visceral_fat: record.visceralFat,
    chest: record.chest ?? null,
    arm: record.arm ?? null,
    waist: record.waist ?? null,
    hip: record.hip ?? null,
    thigh: record.thigh ?? null,
  };
}

export async function getRecords() {
  const { data, error } = await supabase
    .from('records')
    .select(COLUMNS)
    .order('date', { ascending: false });

  if (error) {
    console.error('getRecords error', error);
    return [];
  }
  return data.map(toRecord);
}

export async function saveRecord(newRecord) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error('Not authenticated');

  const row = toRow(newRecord, userData.user.id);
  const { error } = await supabase
    .from('records')
    .upsert(row, { onConflict: 'user_id,date' });

  if (error) throw error;
}

export async function deleteRecord(date) {
  const { error } = await supabase.from('records').delete().eq('date', date);
  if (error) throw error;
}

export async function exportData() {
  const records = await getRecords();
  return JSON.stringify(records, null, 2);
}

export async function importData(jsonData) {
  try {
    const records = JSON.parse(jsonData);
    if (!Array.isArray(records)) throw new Error('Data must be an array');
    for (const record of records) {
      await saveRecord(record);
    }
    return true;
  } catch (e) {
    console.error('Import failed', e);
    return false;
  }
}
