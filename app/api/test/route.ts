import { NextResponse } from 'next/server'
import prisma from '@/lib/db/prisma'

export async function GET() {
  try {
    const count = await prisma.technicianProfile.count()
    return NextResponse.json({ ok: true, count })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message, code: e.code }, { status: 500 })
  }
}
