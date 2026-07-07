#!/usr/bin/env node
/**
 * dev-clean.js — 跨平台干净启动 dev server
 * 跨平台依赖 stdlib(无第三方) — Windows / macOS / Linux 通用
 *
 * 1. 杀掉占用 3000 端口的进程
 * 2. 杀掉残留的 next / node 进程
 * 3. 清掉 .next-dev 缓存(不动 .next/,那个是 build 产物)
 * 4. 启动 next dev
 */

const { execSync, spawn } = require('node:child_process')
const { existsSync, rmSync } = require('node:fs')
const { join } = require('node:path')
const os = require('node:os')

const ROOT = join(__dirname, '..')
const PORT = process.env.PORT || '3000'

function log(s) { console.log(`[dev-clean] ${s}`) }
function run(cmd, opts = {}) {
  try {
    return execSync(cmd, { stdio: 'pipe', ...opts }).toString()
  } catch {
    return ''
  }
}

function killOnPort(port) {
  const platform = os.platform()
  if (platform === 'win32') {
    // netstat 找 PID — 只针对 LISTENING 状态的 3000 端口
    const out = run(`netstat -ano`)
    const pids = new Set()
    out.split('\n').forEach((line) => {
      if (line.includes(`:${port}`) && line.includes('LISTENING')) {
        const parts = line.trim().split(/\s+/)
        const pid = parts[parts.length - 1]
        if (pid && /^\d+$/.test(pid)) pids.add(pid)
      }
    })
    if (pids.size === 0) {
      log('port 3000 is free, nothing to kill')
      return
    }
    pids.forEach((pid) => {
      log(`killing PID ${pid} on port ${port}`)
      try { execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' }) } catch (e) {
        log(`  kill PID ${pid} failed: ${e.message}`)
      }
    })
  } else {
    // Unix
    try {
      const out = run(`lsof -ti :${port}`)
      out.split('\n').filter(Boolean).forEach((pid) => {
        log(`killing PID ${pid} on port ${port}`)
        try { process.kill(Number(pid), 'SIGKILL') } catch {}
      })
    } catch {}
    try { run(`pkill -f "next dev" || true`) } catch {}
  }
}

function cleanCache() {
  const devCache = join(ROOT, '.next-dev')
  const devLog = join(ROOT, 'dev.log')
  if (existsSync(devCache)) {
    log('removing .next-dev')
    // Windows 在进程被杀后短暂持有文件句柄,rmSync 立刻跑会 ENOTEMPTY,加重试
    let attempts = 0
    while (attempts < 6) {
      try {
        rmSync(devCache, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 })
        break
      } catch (e) {
        attempts++
        if (attempts >= 6) {
          log(`  .next-dev cleanup failed after ${attempts} attempts: ${e.message}`)
          throw e
        }
        log(`  .next-dev busy, retry ${attempts}/5 ...`)
        // 同步 sleep(避免拉新依赖)
        const end = Date.now() + 500
        while (Date.now() < end) { /* wait */ }
      }
    }
  }
  if (existsSync(devLog)) {
    log('removing dev.log')
    try { rmSync(devLog, { force: true }) } catch {}
  }
}

function start() {
  log(`starting next dev on port ${PORT} (distDir=.next-dev) ...`)
  // Windows 下 spawn .cmd 必须 shell: true
  // shell 模式 + detached + unref 一起用,父进程退出不影响子进程
  const isWindows = os.platform() === 'win32'
  const child = spawn(
    isWindows ? 'npx.cmd' : 'npx',
    ['next', 'dev', '-p', PORT, '-H', '0.0.0.0'],
    {
      cwd: ROOT,
      stdio: 'inherit',
      detached: true,
      shell: isWindows,  // Windows 必须
      env: { ...process.env, NODE_OPTIONS: '--no-deprecation' },
      windowsHide: true,
    },
  )
  child.unref()
  log(`dev server spawned, PID=${child.pid}`)
  // 父进程立即退出,不要等子进程
  process.exit(0)
}

;(async () => {
  try {
    log('step 1/3: kill port ' + PORT)
    killOnPort(PORT)
    // Windows 上进程死后文件句柄可能要几百毫秒才完全释放,先等一下
    await new Promise(r => setTimeout(r, 800))
    log('step 2/3: clean dev cache')
    cleanCache()
    log('step 3/3: start dev server')
    start()
  } catch (e) {
    console.error('[dev-clean] FATAL', e)
    process.exit(1)
  }
})()
