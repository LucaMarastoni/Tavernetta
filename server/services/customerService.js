import { getDatabase } from '../db/database.js';

function normalizePhone(phone = '') {
  return phone.replace(/\s+/g, ' ').trim();
}

function normalizeEmail(email = '') {
  const value = email.trim();
  return value || null;
}

function normalizeCustomer(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    email: row.email,
    createdAt: row.created_at,
  };
}

export function findCustomerByPhone(phone, database = getDatabase()) {
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    return null;
  }

  const row = database
    .prepare('select id, full_name, phone, email, created_at from customers where phone = ? limit 1')
    .get(normalizedPhone);

  return normalizeCustomer(row);
}

export function upsertCustomer(customer, database = getDatabase()) {
  const fullName = customer.fullName?.trim() || customer.full_name?.trim() || '';
  const phone = normalizePhone(customer.phone);
  const email = normalizeEmail(customer.email);

  const existingCustomer = database.prepare('select id from customers where phone = ? limit 1').get(phone);

  if (existingCustomer) {
    database
      .prepare(
        `
          update customers
          set full_name = ?, email = coalesce(?, email)
          where id = ?
        `,
      )
      .run(fullName, email, existingCustomer.id);

    return normalizeCustomer(
      database.prepare('select id, full_name, phone, email, created_at from customers where id = ?').get(existingCustomer.id),
    );
  }

  const insertResult = database
    .prepare(
      `
        insert into customers (full_name, phone, email)
        values (?, ?, ?)
      `,
    )
    .run(fullName, phone, email);

  return normalizeCustomer(
    database.prepare('select id, full_name, phone, email, created_at from customers where id = ?').get(insertResult.lastInsertRowid),
  );
}
