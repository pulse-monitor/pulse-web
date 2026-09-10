import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * 扫全部源码，抓「该调用却写成了属性访问」的方法。
 *
 * 背景：项目早期有一次批量替换误删了大量 `()`。绝大多数当场编译不过，
 * 但 `str.trim`、`d.getTime` 这类**合法的属性访问**活了下来 ——
 * TypeScript 不报，运行时也不抛，只是行为悄悄变了：
 *
 *   name: e.name.trim   → JSON.stringify 直接把这个字段丢掉
 *   reload              → 语句位置求值后丢弃，列表不刷新
 *
 * 这一类只能靠扫源码兜住。名单里都是「拿到函数引用本身没有任何意义」的方法。
 */
const ALWAYS_CALLED = [
  'trim', 'trimStart', 'trimEnd',
  'toLowerCase', 'toUpperCase', 'toFixed', 'toISOString', 'toLocaleString',
  'getTime', 'getTimezoneOffset',
  'toSorted', 'toReversed',
]

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) return walk(p)
    return /\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p) ? [p] : []
  })
}

describe('没有漏掉括号的方法调用', () => {
  it.each(ALWAYS_CALLED)('.%s 后面必须紧跟 (', (method) => {
    const bad: string[] = []
    for (const file of walk('src')) {
      readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
        // 注释里会正常地讨论这些方法（比如解释「少一对括号」这个坑本身），
        // 不跳过的话这个测试会被自己的说明文字绊倒
        const code = line.trim()
        if (code.startsWith('//') || code.startsWith('*') || code.startsWith('/*')) return
        // .method 后面不是 ( 也不是标识符字符 → 是属性访问，不是调用
        const re = new RegExp(`\\.${method}(?![\\w(])`)
        if (re.test(line)) bad.push(`${file}:${i + 1}  ${code}`)
      })
    }
    expect(bad, `这些地方拿到的是函数本身，不是调用结果：\n${bad.join('\n')}`).toEqual([])
  })
})
