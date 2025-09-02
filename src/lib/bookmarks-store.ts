import { proxy, useSnapshot } from 'valtio'
import { subscribeKey } from 'valtio/utils'
import { Repository } from './supabase'

// Bookmark store using Valtio
interface BookmarkStore {
	bookmarks: Repository[]
	addBookmark: (repo: Repository) => void
	removeBookmark: (repoId: string) => void
	isBookmarked: (repoId: string) => boolean
	clearBookmarks: () => void
}

export const bookmarkStore = proxy<BookmarkStore>({
	bookmarks: [],

	addBookmark(repo: Repository) {
		if (!this.isBookmarked(repo.id)) {
			this.bookmarks.push(repo)
		}
	},

	removeBookmark(repoId: string) {
		this.bookmarks = this.bookmarks.filter(repo => repo.id !== repoId)
	},

	isBookmarked(repoId: string) {
		return this.bookmarks.some(repo => repo.id === repoId)
	},

	clearBookmarks() {
		this.bookmarks = []
	}
})

// Load bookmarks from localStorage on initialization
if (typeof window !== 'undefined') {
	const savedBookmarks = localStorage.getItem('bookmarks')
	if (savedBookmarks) {
		try {
			bookmarkStore.bookmarks = JSON.parse(savedBookmarks)
		} catch (error) {
			console.error('Error loading bookmarks from localStorage:', error)
		}
	}

	// Save to localStorage whenever bookmarks change
	subscribeKey(bookmarkStore, 'bookmarks', (bookmarks) => {
		localStorage.setItem('bookmarks', JSON.stringify(bookmarks))
	})
}

// Hook to use bookmarks in components
export const useBookmarks = () => {
	return useSnapshot(bookmarkStore)
}