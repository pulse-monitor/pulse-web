import { describe, expect, it } from 'vitest'
import { pingTaskBody, type TaskDraft } from './PingTasks'
import type { Scope } from './ScopePicker'

const draft = (o: Partial<TaskDraft> = {}): TaskDraft => ({
  name: '上海电信',
  kind: 'tcp',
  host: 'sh-ct-v4.ip.zstaticcdn.com',
  port: 80,
  expect_status: null,
  interval_s: 60,
  packets: 3,
  timeout_ms: 2000,
  enabled: true,
  ...o,
})

const ALL: Scope = { kind: '', ids: [] }

describe('pingTaskBody', () => {
  /**
   * 这条是这个文件存在的理由。
   *
   * 曾经 `name: e.name.trim`（少一对括号）跑了很久没人发现：TypeScript 不报，
   * 因为 `.trim` 是合法的属性访问；但 JSON.stringify 会把值为函数的字段
   * **整个丢掉**，服务端只回一句 "missing field `name`"。
   *
   * 所以断言必须走 **JSON 往返**，不能只看对象上的属性 ——
   * 直接看 body.name 的话，函数值同样是 truthy，测试会假通过。
   */
  it('序列化后必须带上 name 和 host（不能是函数）', () => {
    const sent = JSON.parse(JSON.stringify(pingTaskBody(draft(), ALL)))
    expect(Object.keys(sent)).toContain('name')
    expect(Object.keys(sent)).toContain('host')
    expect(sent.name).toBe('上海电信')
    expect(sent.host).toBe('sh-ct-v4.ip.zstaticcdn.com')
  })

  it('每个字段都能挺过 JSON 往返', () => {
    const body = pingTaskBody(draft(), ALL)
    const sent = JSON.parse(JSON.stringify(body))
    // 值为函数或 undefined 的字段会在这一步消失
    expect(Object.keys(sent).sort()).toEqual(Object.keys(body).sort())
  })

  it('两头的空白会被去掉', () => {
    const sent = pingTaskBody(draft({ name: '  上海电信  ', host: ' example.com ' }), ALL)
    expect(sent.name).toBe('上海电信')
    expect(sent.host).toBe('example.com')
  })

  it('icmp 不带端口', () => {
    expect(pingTaskBody(draft({ kind: 'icmp', port: 80 }), ALL).port).toBeNull()
  })

  it('只有 http 才带 expect_status', () => {
    expect(pingTaskBody(draft({ kind: 'http', expect_status: 200 }), ALL).expect_status).toBe(200)
    expect(pingTaskBody(draft({ kind: 'tcp', expect_status: 200 }), ALL).expect_status).toBeNull()
  })
})
