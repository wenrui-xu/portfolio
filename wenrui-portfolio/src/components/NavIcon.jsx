import React from 'react';

export default function NavIcon({name}) {
  const common = {className:`v-nav-icon v-nav-icon-${name}`, viewBox:'0 0 32 32', fill:'none', stroke:'currentColor', strokeWidth:'2', strokeLinecap:'round', strokeLinejoin:'round', 'aria-hidden':'true', focusable:'false'};

  if (name === 'home') return <svg {...common}>
    <path d="M3.5 14.5 16 4l12.5 10.5M7 12.5V28h18V12.5"/>
    <path className="v-nav-doorway" d="M13 28V17h6v11"/>
    <g className="v-nav-door"><path d="M13 17h6v11h-6z" fill="#1c1816"/><circle cx="17.5" cy="23" r=".7" fill="currentColor" stroke="none"/></g>
  </svg>;

  if (name === 'work') return <svg {...common}>
    <g className="v-nav-hammer"><path d="m9 26 11-12" strokeWidth="3"/><path d="m10 9 4-4c2-2 5-2 7 0l6 6-5 5-7-7c-1-1-2-1-3 0l-2 2z" fill="#1c1816"/></g>
  </svg>;

  if (name === 'about') return <svg {...common}>
    <path d="M16 26V9c4-3 8-3 12-2v18c-4-1-8-1-12 1Z" fill="#1c1816"/>
    <path className="v-nav-book-cover" d="M16 26V9C12 6 8 6 4 7v18c4-1 8-1 12 1Z" fill="#1c1816"/>
    <path d="M16 9v17"/>
  </svg>;

  return <svg {...common}>
    <g className="v-nav-phone"><rect x="9" y="5" width="14" height="22" rx="3" fill="#1c1816"/><path d="M14 8h4M14 24h4"/></g>
    <path className="v-nav-ring v-nav-ring-left" d="M6 11c-2 2-2 6 0 8M3 8c-4 4-4 10 0 14"/>
    <path className="v-nav-ring v-nav-ring-right" d="M26 11c2 2 2 6 0 8m3-11c4 4 4 10 0 14"/>
  </svg>;
}
