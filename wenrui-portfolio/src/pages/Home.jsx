import React,{useEffect,useRef} from 'react';
import {Link} from 'react-router-dom';
import InteractivePortrait from '../InteractivePortrait';
import FeaturedCarousel from '../components/FeaturedCarousel';
import Showreel from '../components/Showreel';
import About from '../components/About';
import SocialLink from '../components/SocialLink';
import {social,technologyIcons} from '../data/content';
import {useLocale} from '../locale';

const skills=['Unity','C#','Kotlin','Python','Blender','Generative AI'];

// The background plate is 1672 × 941. Place the figure in that same coordinate
// system, then apply the exact scale/crop used by background-size: cover.
const PLATE={width:1672,height:941};
const FIGURE={x:540,y:280,scale:.48};

function Hero(){
  const {t}=useLocale();
  const heroRef=useRef(null);
  useEffect(()=>{
    const hero=heroRef.current;
    if(!hero)return;
    const align=()=>{
      const {width,height}=hero.getBoundingClientRect();
      const scale=Math.max(width/PLATE.width,height/PLATE.height);
      const focalX=window.matchMedia('(max-width: 600px)').matches ? 0.6 : 0.5;
      const offsetX=(width-PLATE.width*scale)*focalX;
      const offsetY=(height-PLATE.height*scale)/2;
      hero.style.setProperty('--figure-left',`${offsetX+FIGURE.x*scale}px`);
      hero.style.setProperty('--figure-top',`${offsetY+FIGURE.y*scale}px`);
      hero.style.setProperty('--figure-width',`${1370*FIGURE.scale*scale}px`);
    };
    const resizeObserver=new ResizeObserver(align);
    resizeObserver.observe(hero);
    align();
    return()=>resizeObserver.disconnect();
  },[]);
  return <section id="home" className="v-first-scene" aria-labelledby="hero-title">
  <div className="v-hero" ref={heroRef}>
    <div className="v-hero-copy">
      <h1 id="hero-title" aria-label={t.hero.title}><span className="v-hero-greeting" aria-hidden="true">{t.hero.greeting}</span><span className="v-hero-name" aria-hidden="true">{[...'Wenrui.'].map((letter,i)=><span style={{'--i':i}} key={i}>{letter}</span>)}</span></h1>
      <p className="v-profession">{t.hero.profession}</p>
      <p className="v-focus">{t.hero.focus}</p>
      <p className="v-hero-description">{t.hero.description}</p>
      <div className="v-hero-actions"><Link className="v-primary-link" to="/work"><span aria-hidden="true">✳</span> {t.hero.viewWork} <span aria-hidden="true">↗</span></Link><div className="v-hero-social"><SocialLink name="github" label="GitHub" href={social.github}/><SocialLink name="linkedin" label="LinkedIn" href={social.linkedin}/><SocialLink name="email" label={t.hero.email} href={`mailto:${social.email}`}/></div></div>
      <div className="v-skill-list" aria-label={t.hero.skills}>{skills.map(name=><div key={name}><img src={`/icons/${technologyIcons[name]}.svg`} alt=""/><span>{name}</span></div>)}</div>
    </div>
    <div className="v-hero-avatar"><InteractivePortrait/></div>
    <a className="v-hero-scroll" href="#showreel">{t.hero.scroll} <span aria-hidden="true">↓</span></a>
  </div>
</section>}

export default function Home(){const {t,content}=useLocale();return <><Hero/><div className="v-scene-divider" aria-hidden="true"/><Showreel/><section className="v-featured v-section" aria-labelledby="featured-heading"><div className="v-wrap"><div className="v-section-head v-head-with-link"><div><p className="v-kicker">{t.home.featuredKicker}</p><h2 id="featured-heading">{t.home.featuredFirst} <em>{t.home.featuredSecond}</em></h2></div><Link className="v-outline-link" to="/work">{t.home.allWork}</Link></div><FeaturedCarousel projects={content.featured} id="featured-home-track"/></div></section><About/><section className="v-contact-close" id="contact"><div className="v-wrap v-contact-inner"><div><h2>{t.home.contactFirst}<br/><em>{t.home.contactSecond}</em></h2></div><div><p>{t.home.contactCopy}</p><a className="v-contact-cta" href={`mailto:${social.email}`}><svg className="v-contact-cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg><span className="v-contact-cta-label">{t.home.sendEmail}</span><span className="v-contact-cta-arrow" aria-hidden="true">↗</span></a></div></div></section></>}
