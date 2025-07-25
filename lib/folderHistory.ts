// localStorage constants
const FOLDER_HISTORY_KEY = 'fast-bookmark-folder-history'

// Folder history interface
export interface FolderHistory {
  [folderId: string]: number // folderId -> lastSelectedTimestamp
}

// Folder option interface
export interface FolderOption {
  value: string
  label: string
}

/**
 * Save folder selection history
 * @param folderId folder ID
 */
export function saveFolderHistory(folderId: string): void {
  try {
    const historyStr = localStorage.getItem(FOLDER_HISTORY_KEY)
    const history: FolderHistory = historyStr ? JSON.parse(historyStr) : {}

    // Record current selection timestamp
    history[folderId] = Date.now()

    localStorage.setItem(FOLDER_HISTORY_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('Failed to save folder history:', error)
  }
}

/**
 * Get folder selection history
 * @returns folder history object
 */
export function getFolderHistory(): FolderHistory {
  try {
    const historyStr = localStorage.getItem(FOLDER_HISTORY_KEY)
    return historyStr ? JSON.parse(historyStr) : {}
  } catch (error) {
    console.error('Failed to get folder history:', error)
    return {}
  }
}

/**
 * Get most recently selected folder ID
 * @returns most recently selected folder ID, returns null if no history
 */
export function getMostRecentFolder(): string | null {
  try {
    const historyStr = localStorage.getItem(FOLDER_HISTORY_KEY)
    if (!historyStr) return null

    const history: FolderHistory = JSON.parse(historyStr)
    const entries = Object.entries(history)
    if (entries.length === 0) return null

    return entries.reduce((max, current) =>
      current[1] > max[1] ? current : max,
    )[0]
  } catch (error) {
    console.error('Failed to get most recent folder:', error)
    return null
  }
}

/**
 * Sort folder options by last selection time
 * @param folderOptions folder options array
 * @returns sorted folder options array
 */
export function sortFoldersByHistory(
  folderOptions: FolderOption[],
): FolderOption[] {
  const folderHistory = getFolderHistory()

  if (Object.keys(folderHistory).length === 0) {
    return folderOptions
  }

  // Sort by last selection time in descending order (most recent first)
  return folderOptions.sort((a, b) => {
    const timestampA = folderHistory[a.value] || 0
    const timestampB = folderHistory[b.value] || 0
    return timestampB - timestampA // descending order, most recent first
  })
}

/**
 * Clear all folder history
 */
export function clearFolderHistory(): void {
  try {
    localStorage.removeItem(FOLDER_HISTORY_KEY)
  } catch (error) {
    console.error('Failed to clear folder history:', error)
  }
}

/**
 * Get last selection time for specified folder
 * @param folderId folder ID
 * @returns last selection timestamp, returns 0 if not exists
 */
export function getFolderLastSelectedTime(folderId: string): number {
  const history = getFolderHistory()
  return history[folderId] || 0
}
