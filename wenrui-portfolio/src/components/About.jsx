import React,{useEffect,useRef,useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {Link} from 'react-router-dom';
import {technologyIcons} from '../data/content';
import {PendingImage} from './ProjectCard';
import {useLocale} from '../locale';

const tabs=['journey','certificates'];
function Timeline({items,t}) {
  return <div className="v-timeline">
    {items.map(item=><details key={`${item.type}-${item.slug}`}><summary><span className="v-timeline-date"><span className="v-timeline-kind">{item.type==='education'?t.about.education:t.about.experience}</span><strong>{item.period}</strong>{item.dateDetail&&<small>{item.dateDetail}</small>}</span><span className="v-timeline-copy"><strong>{item.title}</strong><small>{item.role||item.institution}</small></span><b className="v-timeline-more" aria-hidden="true">＋<span className="v-timeline-tooltip">{t.about.more}</span></b></summary><div className="v-timeline-body"><ReactMarkdown components={{a:({href,children})=>href?.startsWith('/')?<Link to={href}>{children}</Link>:<a href={href}>{children}</a>}}>{item.body}</ReactMarkdown></div></details>)}
  </div>;
}

function CertificateModal({item,onClose}) {
  const {t}=useLocale();
  const dialog=useRef(null);
  useEffect(()=>{if(item&&!dialog.current.open)dialog.current.showModal();if(!item&&dialog.current.open)dialog.current.close()},[item]);
  return <dialog className="v-certificate-dialog" ref={dialog} onClose={onClose} onClick={event=>{if(event.target===dialog.current)onClose()}} aria-label={item?.title||t.about.certificates}><button type="button" aria-label={t.about.closeCertificate} onClick={onClose}>×</button>{item&&<>{item.image?<img src={item.image} alt={item.title}/>:<PendingImage label={`${item.title}: ${t.about.certificatePending}`}/>}<h3>{item.title}</h3><p>{item.institution} · {item.date}</p>{item.credential&&<a href={item.credential} target="_blank" rel="noreferrer">{t.about.viewCredential}</a>}</>}</dialog>;
}

function LanguageCertificateModal({language,onClose}) {
  const {t}=useLocale();
  const dialog=useRef(null);
  useEffect(()=>{if(language&&!dialog.current.open)dialog.current.showModal();if(!language&&dialog.current.open)dialog.current.close()},[language]);
  return <dialog className="v-certificate-dialog v-language-dialog" ref={dialog} onClose={onClose} onClick={event=>{if(event.target===dialog.current)onClose()}} aria-labelledby="language-certificate-title"><button type="button" aria-label={t.about.closeLanguage} onClick={onClose}>×</button>{language&&<><p className="v-kicker">{t.about.languageCertificate}</p><h3 id="language-certificate-title">{language.certificate.title}</h3><p>{t.about.languageNames[language.name]} · {language.level}</p>{language.certificate.institution&&<p className="v-language-institution">{language.certificate.institution}</p>}</>}</dialog>;
}

export default function About() {
  const {t,content}=useLocale();
  const {certificates,education,experience,siteContent}=content;
  const [active,setActive]=useState('journey');
  const [selected,setSelected]=useState(null);
  const [selectedLanguage,setSelectedLanguage]=useState(null);
  const journey=[...experience,...education].sort((a,b)=>(b.timelineEnd||'').localeCompare(a.timelineEnd||''));
  return <section id="about" className="v-about v-section" aria-labelledby="about-heading"><div className="v-wrap">
    <div className="v-section-head v-about-heading"><p className="v-kicker">{t.about.kicker}</p><h2 id="about-heading">{t.about.heading} <em>{t.about.headingEm}</em></h2></div>
    <div className="v-about-layout">
      <div className="v-about-portrait-and-copy"><div className="v-about-polaroid"><div className="v-about-portrait-image"><img src="/images/wenrui-about-selfie.png" alt={t.about.portrait} loading="lazy" width="1254" height="1254"/></div></div>
        <div className="v-about-intro"><h3>{t.about.developer}<em>{t.about.focus}</em></h3>
          {t.about.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
        </div>
      </div>
      <div className="v-about-details"><div className="v-about-tabs" role="tablist" aria-label={t.about.tabs} onKeyDown={event=>{if(!['ArrowRight','ArrowLeft'].includes(event.key))return;event.preventDefault();const i=tabs.indexOf(active);const next=tabs[(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length];setActive(next);document.getElementById(`tab-${next}`)?.focus()}}>{tabs.map(id=><button id={`tab-${id}`} role="tab" type="button" key={id} aria-selected={active===id} aria-controls={`panel-${id}`} tabIndex={active===id?0:-1} onClick={()=>setActive(id)}>{t.about[id]}</button>)}</div>
        <div id={`panel-${active}`} role="tabpanel" aria-labelledby={`tab-${active}`} className="v-about-panel" key={active}>
          {active==='journey'&&<Timeline items={journey} t={t}/>}
          {active==='certificates'&&(certificates.length?<div className="v-certificate-grid">{certificates.map(item=><button className="v-certificate" type="button" key={item.slug} onClick={()=>setSelected(item)}>{item.image?<img src={item.image} alt=""/>:<PendingImage label={`${item.title}: ${t.about.certificatePending}`}/>}<strong>{item.title}</strong><span>{item.institution}</span></button>)}</div>:<div className="v-empty-state"><span aria-hidden="true">✳</span><p>{t.about.certificatesEmpty}</p></div>)}
        </div>
        <div className="v-toolbox"><p className="v-kicker">{t.about.toolbox}</p><div className="v-toolbox-grid">{siteContent.toolbox.map(({label,technologies},index)=><div className="v-toolbox-row" key={label}><strong>{t.about.toolboxLabels[index]}</strong><div>{technologies.map(item=><span key={item}>{technologyIcons[item]&&<img src={`/icons/${technologyIcons[item]}.svg`} alt=""/>}{item}</span>)}</div></div>)}</div>
          <div className="v-languages"><h3>{t.about.languages}</h3><ul>{siteContent.languages.map(language=><li key={language.name}>{language.certificate?<button className="v-language-tile is-certified" type="button" onClick={()=>setSelectedLanguage(language)} aria-label={`${t.about.certificateDetails} ${t.about.languageNames[language.name]} ${language.level}`}><strong>{t.about.languageNames[language.name]}</strong><span>{language.level==='Native'?t.about.native:language.level}</span><b aria-hidden="true">↗</b></button>:<div className="v-language-tile"><strong>{t.about.languageNames[language.name]}</strong><span>{language.level==='Native'?t.about.native:language.level}</span></div>}</li>)}</ul></div>
        </div>
      </div>
    </div>
  </div><CertificateModal item={selected} onClose={()=>setSelected(null)}/><LanguageCertificateModal language={selectedLanguage} onClose={()=>setSelectedLanguage(null)}/></section>;
}
