import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Combobox, ComboboxOption } from '@/components/extra/combobox'
import { useAsync, useMount } from 'react-use'
import { treeToList } from '@liuli-util/tree'
import {
  saveFolderHistory,
  getMostRecentFolder,
  sortFoldersByHistory,
  type FolderOption,
} from '@/lib/folderHistory'

async function getCurrentTab() {
  let queryOptions = { active: true, lastFocusedWindow: true }
  // `tab` will either be a `tabs.Tab` instance or `undefined`.
  let [tab] = await browser.tabs.query(queryOptions)
  return tab
}

const currentTab = getCurrentTab()

async function getBookmarks(): Promise<ComboboxOption[]> {
  const tree = await browser.bookmarks.getTree()
  const list = treeToList(tree, {
    id: 'id',
    children: 'children',
    path: 'path',
  })

  const folderOptions: FolderOption[] = list
    .filter((it) => !it.url && it.title)
    .map((it) => ({
      value: it.id,
      label: it.title,
    }))

  // Sort by historical selection frequency
  return sortFoldersByHistory(folderOptions)
}

export function App() {
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [title, setTitle] = useState<string>('')
  const { value: folderOptions } = useAsync(async () => getBookmarks())

  useMount(async () => {
    const tab = await currentTab
    setTitle(tab.title ?? 'New Bookmark')

    // Set most recently selected folder as default value
    const mostRecentFolder = getMostRecentFolder()
    if (mostRecentFolder) {
      setSelectedFolder(mostRecentFolder)
    }
  })

  const handleSubmit = async (selectedFolder: string) => {
    setSelectedFolder(selectedFolder)

    // Save folder selection history
    saveFolderHistory(selectedFolder)

    const tab = await currentTab
    await browser.bookmarks.create({
      parentId: selectedFolder,
      title: tab.title,
      url: tab.url,
    })
    window.close()
  }

  const [open, setOpen] = useState(true)

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground w-16">
          Folder
        </label>
        <div className="flex-1">
          <Combobox
            options={folderOptions ?? []}
            value={selectedFolder}
            onValueChange={handleSubmit}
            placeholder="Choose folder..."
            open={open}
            onOpenChange={setOpen}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground w-16">
          Title
        </label>
        <div className="flex-1">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Input title..."
            className="w-full"
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={() => handleSubmit(selectedFolder)} className="px-6">
          Submit
        </Button>
      </div>
    </div>
  )
}
