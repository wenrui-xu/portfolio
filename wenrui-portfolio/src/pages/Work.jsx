import React,{useEffect,useMemo,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import ProjectCard,{ProjectMedia} from '../components/ProjectCard';
import {categories,technologyIcons} from '../data/content';
import {useLocale} from '../locale';
import {publicAsset} from '../data/publicAsset';

const STORY_INTERVAL=3500;

export default function Work(){
  const {lang,t,content}=useLocale();
  const {projects,featured}=content;
  const location=useLocation();
  const [category,setCategory]=useState('all');
  const [technology,setTechnology]=useState('');
  const [expanded,setExpanded]=useState(false);
  const [featuredIndex,setFeaturedIndex]=useState(0);
  const [storyHovered,setStoryHovered]=useState(false);
  const [storyKeyboardFocus,setStoryKeyboardFocus]=useState(false);
  const currentFeaturedIndex=Math.min(featuredIndex,Math.max(0,featured.length-1));
  const currentFeatured=featured[currentFeaturedIndex];
  const categoryProjects=useMemo(()=>projects.filter(project=>category==='all'||project.categories.includes(category)),[projects,category]);
  const technologies=useMemo(()=>[...new Set(categoryProjects.flatMap(project=>project.primaryTags))],[categoryProjects]);
  const visible=categoryProjects.filter(project=>!technology||project.primaryTags.includes(technology));

  useEffect(()=>{
    if(location.hash!=='#all-work-heading'){
      window.scrollTo(0,0);
      return;
    }
    const frame=requestAnimationFrame(()=>document.getElementById('all-work-heading')?.scrollIntoView({block:'start'}));
    return ()=>cancelAnimationFrame(frame);
  },[location.hash]);

  useEffect(()=>{
    if(featured.length<2||storyHovered||storyKeyboardFocus) return;
    const timer=window.setInterval(()=>{
      if(!document.hidden&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        setFeaturedIndex(index=>(index+1)%featured.length);
      }
    },STORY_INTERVAL);
    return ()=>window.clearInterval(timer);
  },[featured.length,featuredIndex,storyHovered,storyKeyboardFocus]);

  return <div className="v-work-page">
    <style>{`
      .v-work-page .v-work-hero{min-height:0;display:block;padding-block:112px 58px}
      .v-work-page .v-work-hero::before{background-position:center top}
      .v-work-hero-content{width:min(75%,790px)}
      .v-work-hero h1{font-size:clamp(78px,7.7vw,116px);margin:8px 0 12px}
      .v-work-hero-intro{max-width:700px;margin:0 0 22px;color:#e5cfc1;font:400 clamp(16px,1.15vw,19px)/1.42 'DM Sans',sans-serif}

      .v-work-story{
        position:relative;
        overflow:hidden;
        min-height:310px;
        aspect-ratio:2.15;
        border:1px solid #a47b69;
        border-radius:19px;
        background:#271d1a;
        box-shadow:0 15px 36px #09070778;
      }
      .v-work-story-header{
        position:absolute;
        z-index:4;
        top:0;
        right:0;
        left:0;
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        min-height:46px;
        padding:8px 18px;
        background:linear-gradient(180deg,#171110a8,transparent);
        pointer-events:none;
      }
      .v-work-story-header h2{
        margin:0;
        color:#fff3e8;
        font:700 12px 'Space Grotesk',sans-serif;
        letter-spacing:.12em;
        text-transform:uppercase;
        text-shadow:0 1px 10px #1c1513;
      }
      .v-work-story-pills{
        display:flex;
        align-items:center;
        gap:2px;
        max-width:60%;
        overflow-x:auto;
        scrollbar-width:none;
      }
      .v-work-story-pills::-webkit-scrollbar{display:none}
      .v-work-story-pills button{
        display:grid;
        flex:none;
        place-items:center;
        width:34px;
        height:34px;
        padding:0;
        border:0;
        background:transparent;
        cursor:pointer;
        pointer-events:auto;
      }
      .v-work-story-pills button::before{
        content:'';
        width:9px;
        height:9px;
        border-radius:99px;
        background:#f5decc9e;
        transition:width .25s ease,background .25s ease;
      }
      .v-work-story-pills button[aria-pressed=true]::before{width:27px;background:#b5c47b}
      .v-work-story-pills button:hover::before{background:#f5decc}
      .v-work-story-pills button[aria-pressed=true]:hover::before{background:#c7da93}
      .v-work-story-pills button:focus-visible{outline:none}
      .v-work-story-pills button:focus-visible::before{box-shadow:0 0 0 2px #fff3e8}

      .v-work-story-media{position:absolute;inset:0;display:block;overflow:hidden}
      .v-work-story-media::after{
        content:'';
        position:absolute;
        inset:0;
        background:linear-gradient(0deg,#17100fbd 0%,#17100f34 26%,transparent 48%);
        pointer-events:none;
      }
      .v-work-story-media .v-project-media{height:100%;aspect-ratio:auto;border:0}
      .v-work-story-media .v-project-media::after{display:none}
      .v-work-story-media img{object-position:center 25%;transition:transform .35s ease}
      .v-work-story-media:hover img{transform:scale(1.035)}
      .v-work-story-title{
        position:absolute;
        z-index:2;
        right:24px;
        bottom:22px;
        left:24px;
        margin:0;
        color:#fff3e8;
        font:700 clamp(26px,2.8vw,38px)/1.06 'Space Grotesk',sans-serif;
        letter-spacing:-.05em;
        text-shadow:0 2px 14px #100d0c,0 1px 3px #100d0c;
        pointer-events:none;
      }
      .v-work-story-empty{display:grid;place-items:center;min-height:310px;color:#dfb9a4;text-align:center}
      .v-work-story-empty span{display:block;font-size:42px}
      .v-work-scroll{
        display:inline-flex;
        gap:9px;
        align-items:center;
        margin-top:10px;
        color:#f3d1bf;
        font:700 12px 'Space Grotesk',sans-serif;
        letter-spacing:.09em;
        text-transform:uppercase;
      }
      .v-work-scroll:hover{color:#e99f78}
      .v-work-page #all-work-heading{scroll-margin-top:110px}

      @media(max-width:900px){
        .v-work-hero-content{width:min(100%,680px)}
        .v-work-story{aspect-ratio:1.95}
      }
      @media(max-width:650px){
        .v-work-page .v-work-hero{padding-block:90px 48px}
        .v-work-page .v-work-hero::before{background-position:65% top}
        .v-work-hero-content{width:100%}
        .v-work-hero h1{font-size:clamp(70px,17vw,100px)}
        .v-work-hero-intro{max-width:470px;font-size:16px;margin-bottom:20px}
        .v-work-story{min-height:240px;aspect-ratio:1.35}
        .v-work-story-title{right:18px;bottom:22px;left:18px;font-size:clamp(25px,7vw,34px)}
        .v-work-story-header{min-height:44px;padding:6px 12px 6px 16px}
        .v-work-story-header h2{font-size:11px;letter-spacing:.09em}
      }
      @media(prefers-reduced-motion:reduce){
        .v-work-story-pills button::before,.v-work-story-media img{transition:none}
        .v-work-story-media:hover img{transform:none}
      }
    `}</style>

    <section className="v-work-top v-work-hero v-wrap" aria-labelledby="work-title">
      <div className="v-work-hero-content">
        <p className="v-kicker">{t.nav.work} / 01</p>
        <h1 id="work-title">{t.nav.work}<span>.</span></h1>
        <p className="v-work-hero-intro">{t.work.intro}</p>

        <div
          className="v-work-story"
          aria-labelledby="work-featured"
          onMouseEnter={()=>setStoryHovered(true)}
          onMouseLeave={()=>setStoryHovered(false)}
          onFocusCapture={event=>{
            if(event.target.matches(':focus-visible')) setStoryKeyboardFocus(true);
          }}
          onBlurCapture={event=>{
            if(!event.currentTarget.contains(event.relatedTarget)) setStoryKeyboardFocus(false);
          }}
        >
          <div className="v-work-story-header">
            <h2 id="work-featured">{t.home.featuredFirst} {t.home.featuredSecond}</h2>
            {featured.length>1&&
              <div className="v-work-story-pills" role="group" aria-label={t.work.selected}>
                {featured.map((project,index)=>
                  <button
                    key={project.slug}
                    type="button"
                    aria-label={`${index+1}: ${project.title}`}
                    aria-pressed={index===currentFeaturedIndex}
                    onClick={()=>setFeaturedIndex(index)}
                  />
                )}
              </div>
            }
          </div>

          {currentFeatured?
            <React.Fragment key={currentFeatured.slug}>
              <Link
                className="v-work-story-media"
                to={`/work/${currentFeatured.slug}`}
                aria-label={`${currentFeatured.title} · ${t.card.view}`}
              >
                <ProjectMedia project={currentFeatured}/>
              </Link>
              <h3 className="v-work-story-title" aria-hidden="true">{currentFeatured.title}</h3>
            </React.Fragment>
            :
            <div className="v-work-story-empty">
              <div>
                <span aria-hidden="true">✳</span>
                {lang==='es'?'Destacados próximamente':'Featured work coming soon'}
              </div>
            </div>
          }
        </div>

        <a className="v-work-scroll" href="#all-work-heading">
          {t.work.browse} <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>

    <section className="v-all-work v-wrap" aria-labelledby="all-work-heading">
      <div className="v-section-head">
        <p className="v-kicker">{t.work.browse}</p>
        <h2 id="all-work-heading">{t.work.allFirst} <em>{t.work.allSecond}</em></h2>
      </div>

      <div className="v-filter-row" role="group" aria-label={t.work.categories}>
        {categories.map(id=>
          <button
            key={id}
            type="button"
            aria-pressed={category===id}
            onClick={()=>{setCategory(id);setTechnology('')}}
          >
            {t.categories[id]}
          </button>
        )}
        <button
          className="v-more-filters"
          type="button"
          aria-expanded={expanded}
          aria-controls="technology-filters"
          onClick={()=>setExpanded(!expanded)}
        >
          {expanded?'−':'+'} {t.work.filters}
        </button>
      </div>

      {expanded&&
        <div className="v-tech-filters" id="technology-filters" role="group" aria-label={t.work.technologies}>
          <button type="button" aria-pressed={!technology} onClick={()=>setTechnology('')}>
            {t.work.anyTechnology}
          </button>
          {technologies.map(name=>
            <button
              type="button"
              key={name}
              aria-pressed={technology===name}
              onClick={()=>setTechnology(technology===name?'':name)}
            >
              {technologyIcons[name]&&<img src={publicAsset(`/icons/${technologyIcons[name]}.svg`)} alt=""/>}
              {t.tags?.[name]||name}
            </button>
          )}
        </div>
      }

      <p className="v-result-count" aria-live="polite">
        {visible.length} {visible.length===1?t.work.oneProject:t.work.manyProjects}
      </p>

      {visible.length?
        <div className="v-project-grid v-grid-animated" key={`${category}-${technology}`}>
          {visible.map(project=><ProjectCard key={project.slug} project={project}/>)}
        </div>
        :
        <div className="v-empty-state">
          <span aria-hidden="true">✳</span>
          <p>{t.work.none}</p>
          <button type="button" onClick={()=>{setCategory('all');setTechnology('')}}>
            {t.work.showAll}
          </button>
        </div>
      }
    </section>
  </div>;
}