import { NextResponse } from 'next/server'
import pg from 'pg'

export async function GET() {
  const url = process.env.DATABASE_URL ?? 'NOT SET'
  const masked = url.replace(/:([^@]+)@/, ':***@')

  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

  try {
    const res = await pool.query('SELECT COUNT(*) FROM technician_profiles')
    return NextResponse.json({ ok: true, count: res.rows[0].count, url: masked })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, url: masked }, { status: 500 })
  } finally {
    await pool.end()
  }
}
