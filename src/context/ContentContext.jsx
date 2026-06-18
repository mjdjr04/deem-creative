import { createContext, useContext, useEffect, useState } from 'react'
import { fetchPublishedContent } from '../lib/contentApi'
import { defaultContent } from '../data/defaults'

const ContentContext = createContext({ content: defaultContent, loading: true })

export function ContentProvider({ children }) {
  // Start with bundled defaults so the site renders instantly, then hydrate
  // with published content from Supabase (if configured).
  const [content, setContent] = useState(defaultContent)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchPublishedContent()
      .then((data) => {
        if (active) setContent(data)
      })
      .catch(() => {
        /* keep defaults on error */
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <ContentContext.Provider value={{ content, loading }}>
      {children}
    </ContentContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useContent() {
  return useContext(ContentContext).content
}
