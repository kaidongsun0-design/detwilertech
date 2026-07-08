export const runtime = 'nodejs'

export async function GET() {
  const result: Record<string, unknown> = {
    step: 'start',
    dbUri: process.env.DATABASE_URI
      ? process.env.DATABASE_URI.replace(/\/\/.*@/, '//***@')
      : 'NOT SET',
  }

  // Step 1: 测试 pg 模块是否能加载
  try {
    const pg = await import('pg')
    result.pgLoaded = 'OK'
    result.pgVersion = pg.default?.version || 'unknown'

    // Step 2: 尝试连接数据库
    try {
      const { Pool } = pg
      const pool = new Pool({
        connectionString: process.env.DATABASE_URI,
        max: 1,
        connectionTimeoutMillis: 5000,
      })

      result.step = 'connecting'
      const client = await pool.connect()
      result.connected = 'OK'

      const res = await client.query('SELECT NOW() as now, version() as version')
      result.query = 'OK'
      result.dbTime = res.rows[0]?.now
      result.dbVersion = String(res.rows[0]?.version).split(',')[0]

      client.release()
      await pool.end()
    } catch (dbErr) {
      result.dbError = 'CONNECTION FAILED'
      result.dbErrorMessage = String(dbErr)
      if (dbErr instanceof Error) {
        result.dbErrorCode = (dbErr as NodeJS.ErrnoException).code
        result.dbErrorStack = dbErr.stack?.split('\n').slice(0, 3)
      }
    }
  } catch (e) {
    result.pgLoaded = 'FAILED'
    result.pgError = String(e)
    if (e instanceof Error) {
      result.pgErrorMessage = e.message
      result.pgErrorStack = e.stack?.split('\n').slice(0, 3)
    }
  }

  return Response.json(result)
}
