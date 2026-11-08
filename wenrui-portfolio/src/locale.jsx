import React,{createContext,useContext,useEffect,useMemo,useState} from 'react';
import ui from '../content/ui.json';
import {localizedContent} from './data/content';

const LocaleContext=createContext(null);

export function LocaleProvider({children}) {
  const [lang,setLang]=useState(()=>{
    try{return localStorage.getItem('wenrui-language')==='es'?'es':'en'}catch{return 'en'}
  });
  useEffect(()=>{
    document.documentElement.lang=lang;
    document.title=lang==='es'?'Wenrui (Sabrina) Xu — Desarrolladora de software':'Wenrui (Sabrina) Xu — Software Developer';
    try{localStorage.setItem('wenrui-language',lang)}catch{/* Storage may be unavailable. */}
  },[lang]);
  const value=useMemo(()=>({lang,setLang,t:ui[lang],content:localizedContent(lang)}),[lang]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(){
  const value=useContext(LocaleContext);
  if(!value)throw new Error('LocaleProvider is missing');
  return value;
}
