import React from 'react';
import {siteContent} from '../data/content';
import {useLocale} from '../locale';

export default function Showreel() {
  const {t}=useLocale();
  const id = siteContent.showreelYoutubeId?.trim();
  const hasVideo = /^[a-zA-Z0-9_-]{11}$/.test(id || '');
  return <section id="showreel" className="v-reel-section" aria-labelledby="reel-heading"><div className="v-wrap">
    <div className="v-reel-heading"><div><p className="v-kicker">{t.reel.kicker}</p><h2 id="reel-heading">{t.reel.heading} <svg className="v-reel-arrow" viewBox="0 0 32 32" aria-hidden="true"><path d="M5 5 27 27M12 27h15V12"/></svg></h2></div></div>
    <div className="v-reel-stone"><div className="v-reel-frame">
      {hasVideo ? <iframe src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`} title="Wenrui Xu showreel" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/> : <div className="v-reel-pending" role="status"><span className="v-reel-pending-status"><i aria-hidden="true"/>{t.reel.status}</span><p>{t.reel.message}</p></div>}
    </div></div>
  </div></section>;
}
