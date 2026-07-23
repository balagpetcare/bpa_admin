import assert from 'node:assert/strict'
import test from 'node:test'
import { isSuperAdminRole } from './usePermission'

// Regression coverage for the "clinic edit page appears permanently
// read-only" bug: bpa_api's authorize() middleware bypasses all permission
// checks for 'super_admin' (local convention) AND 'SUPER_ADMIN' /
// 'GLOBAL_SUPER_ADMIN' (Central Auth's convention for its highest-privilege
// principals). usePermission previously only recognized the lowercase form,
// so a real Central-Auth super admin got can(...) === false for every
// action — every edit/publish/archive control rendered disabled even though
// the backend would have allowed the identical request.

test('recognizes the local lowercase super_admin role', () => {
  assert.equal(isSuperAdminRole(['super_admin']), true)
})

test('recognizes Central Auth uppercase SUPER_ADMIN role', () => {
  assert.equal(isSuperAdminRole(['SUPER_ADMIN']), true)
})

test('recognizes Central Auth GLOBAL_SUPER_ADMIN role', () => {
  assert.equal(isSuperAdminRole(['GLOBAL_SUPER_ADMIN']), true)
})

test('recognizes a super admin role mixed in with other roles', () => {
  assert.equal(isSuperAdminRole(['editor', 'GLOBAL_SUPER_ADMIN']), true)
})

test('returns false for a non-super-admin role set', () => {
  assert.equal(isSuperAdminRole(['editor', 'campaign_manager']), false)
})

test('returns false for an empty role list', () => {
  assert.equal(isSuperAdminRole([]), false)
})
