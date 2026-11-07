// Merge selected default project records into the admin's stored list.
// Records whose id is in `ids` are replaced (or inserted, directly after
// `boys-girls-clubs`); every other stored record is returned untouched and in
// its original order, so admin edits to other projects survive.

const ANCHOR_ID = 'boys-girls-clubs'
const clone = (v) => JSON.parse(JSON.stringify(v))

export function mergeProjects(existingItems, defaultItems, ids) {
  const wanted = ids.map((id) => defaultItems.find((p) => p.id === id)).filter(Boolean)
  const byId = new Map(wanted.map((p) => [p.id, p]))
  const stored = new Set(existingItems.map((p) => p.id))

  const out = existingItems.map((p) => (byId.has(p.id) ? clone(byId.get(p.id)) : p))

  const fresh = wanted.filter((p) => !stored.has(p.id)).map(clone)
  if (fresh.length === 0) return out

  const anchor = out.findIndex((p) => p.id === ANCHOR_ID)
  const at = anchor === -1 ? out.length : anchor + 1
  out.splice(at, 0, ...fresh)
  return out
}
