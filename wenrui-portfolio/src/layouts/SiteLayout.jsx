import React,{useEffect,useRef,useState} from 'react';
import {Link,NavLink,Outlet,useLocation} from 'react-router-dom';
import {social,resume} from '../data/content';
import NavIcon from '../components/NavIcon';
import SocialLink from '../components/SocialLink';
import {useLocale} from '../locale';

export function BunnyMark({className=''}){return <span className={`v-bunny-clip ${className}`} aria-hidden="true"><img src="/images/wenrui-bunny-logo.png" alt=""/></span>}

export function ContactDialog({open,onClose}) {
  const {t}=useLocale();
  const dialog=useRef(null);
  useEffect(()=>{const element=dialog.current;if(open&&!element.open)element.showModal();if(!open&&element.open)element.close()},[open]);
  return <dialog className="v-contact-dialog" ref={dialog} onClose={onClose} onClick={event=>{if(event.target===dialog.current)onClose()}} aria-labelledby="contact-dialog-title"><div className="v-contact-dialog-inner"><button className="v-dialog-close" type="button" onClick={onClose} aria-label={t.contact.close}>×</button><p className="v-kicker">{t.contact.kicker}</p><h2 id="contact-dialog-title">{t.contact.heading}<span>.</span></h2><div className="v-contact-dialog-links"><SocialLink name="email" label={t.contact.email} href={`mailto:${social.email}`}/><SocialLink name="linkedin" label="LinkedIn" href={social.linkedin}/><SocialLink name="github" label="GitHub" href={social.github}/></div></div></dialog>;
}

export default function SiteLayout() {
  const [menu,setMenu]=useState(false);
  const [contact,setContact]=useState(false);
  const [compact,setCompact]=useState(false);
  const {lang,setLang,t}=useLocale();
  const location=useLocation();
  const aboutCurrent=location.pathname==='/'&&location.hash==='#about';
  useEffect(()=>{setMenu(false);setContact(false);if(location.hash){requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView())}else window.scrollTo({top:0,behavior:'instant'})},[location.pathname,location.hash]);
  useEffect(()=>{if(!menu)return;const handle=event=>{if(event.key==='Escape')setMenu(false)};window.addEventListener('keydown',handle);return()=>window.removeEventListener('keydown',handle)},[menu]);
  useEffect(()=>{const onScroll=()=>setCompact(window.scrollY>80);onScroll();window.addEventListener('scroll',onScroll,{passive:true});return()=>window.removeEventListener('scroll',onScroll)},[]);
  const closeMenu=()=>setMenu(false);
  const scrollBackToTop=()=>{if(location.pathname==='/')window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
  return <><a className="v-skip" href="#main">{t.nav.skip}</a><header className={`v-header${compact?' is-compact':''}${location.pathname==='/'?' is-home':''}`}><div className="v-header-inner"><Link className="v-brand" to="/" onClick={()=>{closeMenu();window.scrollTo({top:0,behavior:'smooth'})}} aria-label={t.nav.brand}><BunnyMark/><span>WENRUI<span className="v-brand-dot">.</span></span></Link><button type="button" className="v-menu-toggle" aria-controls="v-navigation" aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?t.nav.close:t.nav.menu}</button><nav id="v-navigation" className={`v-navigation${menu?' is-open':''}`} aria-label={t.nav.main}><Link className={`v-nav-item${location.pathname==='/'&&!aboutCurrent?' active':''}`} to="/" aria-current={location.pathname==='/'&&!aboutCurrent?'page':undefined} onClick={closeMenu}><NavIcon name="home"/><span>{t.nav.home}</span></Link><NavLink className="v-nav-item" to="/work" onClick={closeMenu}><NavIcon name="work"/><span>{t.nav.work}</span></NavLink><Link className={`v-nav-item${aboutCurrent?' active':''}`} to="/#about" aria-current={aboutCurrent?'location':undefined} onClick={closeMenu}><NavIcon name="about"/><span>{t.nav.about}</span></Link><button className="v-nav-item" type="button" onClick={()=>{setContact(true);closeMenu()}}><NavIcon name="contact"/><span>{t.nav.contact}</span></button></nav><div className="v-header-actions"><div className="v-language-switch" role="group" aria-label={t.nav.language}><button type="button" lang="en" aria-pressed={lang==='en'} onClick={()=>setLang('en')}>EN</button><span aria-hidden="true">/</span><button type="button" lang="es" aria-pressed={lang==='es'} onClick={()=>setLang('es')}>ES</button></div><a className="v-resume-link" href={resume.path} download={resume.downloadName} aria-label={t.nav.download}><span className="v-resume-arrow" aria-hidden="true">↓</span><span>{t.nav.resume}</span><small>PDF</small></a></div></div></header><main id="main"><Outlet/></main><footer className="v-footer"><div className="v-wrap v-footer-inner"><Link to="/" className="v-footer-name">WENRUI<span>.</span></Link><div><SocialLink name="github" label="GITHUB" href={social.github}/><SocialLink name="linkedin" label="LINKEDIN" href={social.linkedin}/><SocialLink name="email" label={t.footer.email} href={`mailto:${social.email}`}/></div><Link to="/#home" className="v-back-to-top" onClick={scrollBackToTop}><span className="v-back-to-top-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 19V5m-6 6 6-6 6 6"/></svg></span><span className="v-back-to-top-label">{t.footer.back}</span></Link></div></footer><ContactDialog open={contact} onClose={()=>setContact(false)}/></>;
}
