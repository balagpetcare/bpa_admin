import assert from 'node:assert/strict'
import test, { mock } from 'node:test'

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:4000/api/v1'
;(global as unknown as { window: unknown }).window = { location: { origin: 'http://localhost:3001' } }

function stubFetch(status: number, body: unknown = { success: false, error: { code: 'UNAUTHORIZED', message: 'nope' } }) {
  const original = global.fetch
  global.fetch = (async () =>
    ({
      status,
      ok: status >= 200 && status < 300,
      json: async () => body,
    }) as Response) as typeof fetch
  return () => {
    global.fetch = original
  }
}

test('an isolated endpoint 401 does not sign the user out when the session is still valid', async (t) => {
  const restoreFetch = stubFetch(401)
  let signOutCalls = 0
  mock.module('next-auth/react', {
    // @ts-expect-error — installed @types/node's MockModuleOptions predates the
    // `exports` option (stable at runtime on Node 24; only the type lags).
    exports: {
      getSession: async () => ({ error: undefined }),
      signOut: async () => {
        signOutCalls++
      },
    },
  })
  t.after(() => {
    restoreFetch()
    mock.reset()
  })

  // @ts-expect-error — the `.ts` extension import is valid at runtime under tsx/node's
  // TS loader; tsc's own resolution rules just don't allow writing it explicitly.
  const { apiClient, ApiError } = await import('./api.ts')
  await assert.rejects(() => apiClient('/some/widget'), ApiError)
  assert.equal(signOutCalls, 0, 'signOut must not fire for an endpoint-specific 401 when session.error is unset')
})

test('a confirmed dead session (RefreshTokenExpired) triggers exactly one sign-out even with concurrent 401s', async (t) => {
  const restoreFetch = stubFetch(401)
  let signOutCalls = 0
  mock.module('next-auth/react', {
    // @ts-expect-error — installed @types/node's MockModuleOptions predates the
    // `exports` option (stable at runtime on Node 24; only the type lags).
    exports: {
      getSession: async () => ({ error: 'RefreshTokenExpired' }),
      signOut: async () => {
        signOutCalls++
        return undefined
      },
    },
  })
  t.after(() => {
    restoreFetch()
    mock.reset()
  })

  // @ts-expect-error — see the `.ts` extension note above; the query string
  // here additionally cache-busts the module so this test gets a fresh mock.
  const { apiClient } = await import('./api.ts?confirmed-dead-session')
  await Promise.allSettled([
    apiClient('/a').catch(() => {}),
    apiClient('/b').catch(() => {}),
    apiClient('/c').catch(() => {}),
  ])
  assert.equal(signOutCalls, 1, 'concurrent 401s against a genuinely dead session must single-flight into one sign-out')
})
