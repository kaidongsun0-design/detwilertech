export const runtime = 'nodejs'

export async function GET() {
  return Response.json({
    ok: true,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL || 'not set',
    dbUri: process.env.DATABASE_URI ? 'SET' : 'NOT SET',
  })
}
