import React from 'react';

function SocialIcon({name}) {
  const shared={className:'v-social-icon',viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:'1.8',strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true,focusable:'false'};
  if(name==='github')return <svg {...shared}><path d="M9 19c-4.8 1.4-5.1-2.3-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.3 6.4-1.5 6.4-7A5.4 5.4 0 0 0 20 4.8 5 5 0 0 0 19.9 1S18.7.7 16 2.5a13.4 13.4 0 0 0-7 0C6.3.7 5.1 1 5.1 1A5 5 0 0 0 5 4.8a5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.3 6.6 6.4 6.9A3.4 3.4 0 0 0 9 18.1V22"/></svg>;
  if(name==='linkedin')return <svg {...shared}><rect x="2.5" y="2.5" width="19" height="19" rx="2.5"/><circle cx="7.5" cy="7.7" r=".8" fill="currentColor" stroke="none"/><path d="M7.5 11v6.2M12 17.2V11m0 2.7c0-1.6 1.1-2.7 2.8-2.7 1.8 0 2.8 1.1 2.8 3v3.2"/></svg>;
  return <svg {...shared}><rect x="2.5" y="5.5" width="19" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/></svg>;
}

export default function SocialLink({name,label,href}) {
  const external=name!=='email';
  return <a className="v-social-link" href={href} {...(external?{target:'_blank',rel:'noreferrer'}:{})}><SocialIcon name={name}/><span>{label}</span></a>;
}
