/** Return an ID only for an HTTPS URL on a supported YouTube host. */
export function youtubeVideoId(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return null;
    const host = url.hostname.toLowerCase();
    let id;
    if (host === 'youtu.be' || host === 'www.youtu.be') {
      id = url.pathname.slice(1).split('/')[0];
    } else if (['youtube.com','www.youtube.com','m.youtube.com','youtube-nocookie.com','www.youtube-nocookie.com'].includes(host)) {
      id = url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id || '') ? id : null;
  } catch {
    return null;
  }
}
