/**
 * Debug endpoint — 测试 Payload 初始化
 * GET /api/debug → 返回 Payload 状态和错误信息
 */
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const info: Record<string, unknown> = {
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL || 'not set',
    dbUri: process.env.DATABASE_URI
      ? process.env.DATABASE_URI.replace(/\/\/.*@/, '//***@') // 隐藏密码
      : 'NOT SET',
    dbUriPrefix: process.env.DATABASE_URI?.split(':')[0] || 'N/A',
    payloadSecret: process.env.PAYLOAD_SECRET ? 'SET (length: ' + process.env.PAYLOAD_SECRET.length + ')' : 'NOT SET',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'NOT SET',
  }

  // 尝试初始化 Payload
  try {
    const { getPayload } = await import('payload')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const config = (await import('@payload-config')).default as any
    const payload = await getPayload({ config })
    info.payloadInit = 'OK'
    info.payloadReady = !!payload

    // 测试创建一条记录
    try {
      const result = await payload.find({ collection: 'inquiries', limit: 1 })
      info.dbQuery = 'OK'
      info.inquiryCount = result.totalDocs
    } catch (dbErr) {
      info.dbQuery = 'FAIL'
      info.dbError = String(dbErr)
    }
  } catch (e) {
    info.payloadInit = 'FAIL'
    info.payloadError = String(e)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (e instanceof Error) {
      info.errorMessage = e.message
      info.errorStack = e.stack?.split('\n').slice(0, 5)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      info.errorCause = String((e as any).cause || 'none')
    }
  }

  return NextResponse.json(info)
}
