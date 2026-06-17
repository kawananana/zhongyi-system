const SOURCE_FALLBACK_URLS: Record<string, string> = {
  国家中医药管理局: 'https://www.natcm.gov.cn/',
  中国中医药网: 'https://www.cntcm.com.cn/',
  中国中医药报: 'https://www.cntcm.com.cn/',
  中国医药信息查询平台: 'https://www.dayi.org.cn/',
}

/** 解析百科参考资料原文链接，优先使用条目 sourceUrl，否则按来源名称回退 */
export function resolveSourceUrl(sourceName?: string | null, sourceUrl?: string | null): string | null {
  const url = (sourceUrl ?? '').trim()
  if (url) return url

  const name = (sourceName ?? '').trim()
  if (name && SOURCE_FALLBACK_URLS[name]) return SOURCE_FALLBACK_URLS[name]

  return null
}
