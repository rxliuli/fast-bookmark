import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  saveFolderHistory,
  getFolderHistory,
  getMostRecentFolder,
  sortFoldersByHistory,
  clearFolderHistory,
  getFolderLastSelectedTime,
  type FolderHistory,
  type FolderOption
} from './folderHistory'

describe('folderHistory', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear()
  })

  afterEach(() => {
    // Ensure cleanup after tests
    localStorage.clear()
  })

  describe('saveFolderHistory', () => {
    it('should save folder history for the first time', () => {
      const folderId = 'folder1'
      const beforeTime = Date.now()
      
      saveFolderHistory(folderId)
      
      const afterTime = Date.now()
      const saved = localStorage.getItem('fast-bookmark-folder-history')
      const parsed = JSON.parse(saved!)
      
      expect(parsed[folderId]).toBeGreaterThanOrEqual(beforeTime)
      expect(parsed[folderId]).toBeLessThanOrEqual(afterTime)
    })

    it('should update existing folder timestamp', () => {
      const oldTime = Date.now() - 1000
      const existingHistory: FolderHistory = { folder1: oldTime, folder2: oldTime - 500 }
      localStorage.setItem('fast-bookmark-folder-history', JSON.stringify(existingHistory))
      
      saveFolderHistory('folder1')
      
      const saved = localStorage.getItem('fast-bookmark-folder-history')
      const parsed = JSON.parse(saved!)
      
      expect(parsed.folder1).toBeGreaterThan(oldTime)
      expect(parsed.folder2).toBe(oldTime - 500)
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage unavailable scenario
      const originalSetItem = localStorage.setItem
      localStorage.setItem = () => {
        throw new Error('Storage error')
      }
      
      expect(() => saveFolderHistory('folder1')).not.toThrow()
      
      // Restore original method
      localStorage.setItem = originalSetItem
    })
  })

  describe('getFolderHistory', () => {
    it('should return empty object when no history exists', () => {
      const result = getFolderHistory()
      
      expect(result).toEqual({})
    })

    it('should return parsed history when it exists', () => {
      const history: FolderHistory = { folder1: 3, folder2: 1 }
      localStorage.setItem('fast-bookmark-folder-history', JSON.stringify(history))
      
      const result = getFolderHistory()
      
      expect(result).toEqual(history)
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage unavailable scenario
      const originalGetItem = localStorage.getItem
      localStorage.getItem = () => {
        throw new Error('Storage error')
      }
      
      const result = getFolderHistory()
      expect(result).toEqual({})
      
      // Restore original method
      localStorage.getItem = originalGetItem
    })
  })

  describe('getMostRecentFolder', () => {
    it('should return null when no history exists', () => {
      const result = getMostRecentFolder()
      
      expect(result).toBeNull()
    })

    it('should return the most recently selected folder', () => {
      const now = Date.now()
      const history: FolderHistory = { 
        folder1: now - 1000, 
        folder2: now, 
        folder3: now - 500 
      }
      localStorage.setItem('fast-bookmark-folder-history', JSON.stringify(history))
      
      const result = getMostRecentFolder()
      
      expect(result).toBe('folder2')
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage unavailable scenario
      const originalGetItem = localStorage.getItem
      localStorage.getItem = () => {
        throw new Error('Storage error')
      }
      
      const result = getMostRecentFolder()
      expect(result).toBeNull()
      
      // Restore original method
      localStorage.getItem = originalGetItem
    })
  })

  describe('sortFoldersByHistory', () => {
    it('should return original order when no history exists', () => {
      const folders: FolderOption[] = [
        { value: 'folder1', label: 'Folder 1' },
        { value: 'folder2', label: 'Folder 2' },
        { value: 'folder3', label: 'Folder 3' },
      ]
      
      const result = sortFoldersByHistory(folders)
      
      expect(result).toEqual(folders)
    })

    it('should sort folders by last selected time in descending order', () => {
      const folders: FolderOption[] = [
        { value: 'folder1', label: 'Folder 1' },
        { value: 'folder2', label: 'Folder 2' },
        { value: 'folder3', label: 'Folder 3' },
      ]
      
      const now = Date.now()
      const history: FolderHistory = { 
        folder1: now - 1000, 
        folder2: now, 
        folder3: now - 500 
      }
      localStorage.setItem('fast-bookmark-folder-history', JSON.stringify(history))
      
      const result = sortFoldersByHistory(folders)
      
      expect(result).toEqual([
        { value: 'folder2', label: 'Folder 2' }, // most recent
        { value: 'folder3', label: 'Folder 3' }, // second most recent
        { value: 'folder1', label: 'Folder 1' }, // oldest
      ])
    })

    it('should handle folders with no selection history', () => {
      const folders: FolderOption[] = [
        { value: 'folder1', label: 'Folder 1' },
        { value: 'folder2', label: 'Folder 2' },
        { value: 'folder3', label: 'Folder 3' },
      ]
      
      const now = Date.now()
      const history: FolderHistory = { folder2: now }
      localStorage.setItem('fast-bookmark-folder-history', JSON.stringify(history))
      
      const result = sortFoldersByHistory(folders)
      
      expect(result[0]).toEqual({ value: 'folder2', label: 'Folder 2' })
      expect(result).toHaveLength(3)
    })
  })

  describe('clearFolderHistory', () => {
    it('should remove folder history from localStorage', () => {
      // Set some data first
      const now = Date.now()
      const history: FolderHistory = { folder1: now, folder2: now - 1000 }
      localStorage.setItem('fast-bookmark-folder-history', JSON.stringify(history))
      
      clearFolderHistory()
      
      const saved = localStorage.getItem('fast-bookmark-folder-history')
      expect(saved).toBeNull()
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage unavailable scenario
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = () => {
        throw new Error('Storage error')
      }
      
      expect(() => clearFolderHistory()).not.toThrow()
      
      // Restore original method
      localStorage.removeItem = originalRemoveItem
    })
  })

  describe('getFolderLastSelectedTime', () => {
    it('should return 0 for non-existent folder', () => {
      const result = getFolderLastSelectedTime('nonexistent')
      
      expect(result).toBe(0)
    })

    it('should return correct last selected time for existing folder', () => {
      const now = Date.now()
      const history: FolderHistory = { folder1: now, folder2: now - 1000 }
      localStorage.setItem('fast-bookmark-folder-history', JSON.stringify(history))
      
      const result = getFolderLastSelectedTime('folder1')
      
      expect(result).toBe(now)
    })
  })
}) 