import { EditorShell, useSectionDraft } from '../EditorShell'
import { Field, TextInput, StringListEditor, Card, Button, Trash2, Plus } from '../../../components/admin/ui'

export default function SkillsEditor() {
  const draft = useSectionDraft('skills')
  const { value, setValue } = draft

  const groups = value.groups || []
  const setGroups = (g) => setValue({ ...value, groups: g })
  const updateGroup = (i, next) => setGroups(groups.map((g, j) => (j === i ? next : g)))
  const removeGroup = (i) => setGroups(groups.filter((_, j) => j !== i))
  const addGroup = () => setGroups([...groups, { category: 'New Category', skills: [] }])

  return (
    <EditorShell
      title="Skills & Tools"
      description="Core competencies (the prominent tags) and grouped tool lists."
      draft={draft}
    >
      <Card className="mb-6">
        <StringListEditor
          label="Core Competencies"
          hint="The prominent skill tags shown at the top of the Skills section."
          items={value.core}
          onChange={(v) => setValue({ ...value, core: v })}
          placeholder="e.g. Video Editing"
        />
      </Card>

      <h3 className="text-white font-semibold mb-3">Tool Categories</h3>
      <div className="space-y-4">
        {groups.map((group, i) => (
          <Card key={i}>
            <div className="flex items-center gap-2 mb-3">
              <Field label="Category name">
                <TextInput
                  value={group.category}
                  onChange={(e) => updateGroup(i, { ...group, category: e.target.value })}
                />
              </Field>
              <button
                onClick={() => removeGroup(i)}
                className="text-red-400/60 hover:text-red-400 p-2 mt-3"
                title="Remove category"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <StringListEditor
              label="Skills / tools"
              items={group.skills}
              onChange={(v) => updateGroup(i, { ...group, skills: v })}
              placeholder="e.g. Adobe Premiere Pro"
            />
          </Card>
        ))}
      </div>

      <Button variant="ghost" onClick={addGroup} className="mt-4">
        <Plus size={15} /> Add category
      </Button>
    </EditorShell>
  )
}
