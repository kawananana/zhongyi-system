export interface WikiGalleryItem {
  url: string
  caption?: string
}

export interface WikiVideoItem {
  title: string
  type: 'bilibili' | 'mp4'
  bvid?: string
  /** B 站 av 号，站外嵌入建议携带 */
  aid?: number
  /** 分 P 的 cid，嵌入更稳定 */
  cid?: number
  /** 分 P 序号，从 1 开始 */
  p?: number
  /** @deprecated 使用 p */
  page?: number
  url?: string
  poster?: string
}

export function parseGalleryJson(raw?: string | null): WikiGalleryItem[] {
  if (!raw) return []
  try {
    const list = JSON.parse(raw) as WikiGalleryItem[]
    return Array.isArray(list) ? list.filter((item) => item?.url) : []
  } catch {
    return []
  }
}

export function parseVideosJson(raw?: string | null): WikiVideoItem[] {
  if (!raw) return []
  try {
    const list = JSON.parse(raw) as WikiVideoItem[]
    return Array.isArray(list) ? list.filter((item) => item?.title) : []
  } catch {
    return []
  }
}

/** 从 BV 号或 bilibili 链接解析 bvid */
export function extractBvid(input?: string): string | null {
  if (!input) return null
  const trimmed = input.trim()
  const match = trimmed.match(/BV[a-zA-Z0-9]+/i)
  return match ? match[0] : null
}

export function bilibiliEmbedUrl(video: WikiVideoItem): string | null {
  const bvid = video.bvid || extractBvid(video.url)
  if (!bvid) return null

  const params = new URLSearchParams()
  params.set('isOutside', 'true')
  params.set('bvid', bvid)
  if (video.aid) params.set('aid', String(video.aid))
  if (video.cid) params.set('cid', String(video.cid))

  const page = video.p ?? video.page
  if (page && page > 1) params.set('p', String(page))

  params.set('autoplay', '0')
  params.set('danmaku', '0')
  params.set('high_quality', '1')

  return `https://player.bilibili.com/player.html?${params.toString()}`
}

export function videoPlayUrl(video: WikiVideoItem): string | null {
  if (video.type === 'mp4' && video.url) return video.url
  const bvid = video.bvid || extractBvid(video.url)
  if (!bvid) return null
  const page = video.p ?? video.page
  const pageQuery = page && page > 1 ? `?p=${page}` : ''
  return `https://www.bilibili.com/video/${bvid}${pageQuery}`
}
