import React from 'react';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import SiteLayout from './layouts/SiteLayout';
import Home from './pages/Home';
import Work from './pages/Work';
import CaseStudy from './pages/CaseStudy';
import NotFound from './pages/NotFound';
import {LocaleProvider} from './locale';

export default function PortfolioApp(){return <LocaleProvider><BrowserRouter><Routes><Route element={<SiteLayout/>}><Route path="/" element={<Home/>}/><Route path="/work" element={<Work/>}/><Route path="/work/:slug" element={<CaseStudy/>}/><Route path="*" element={<NotFound/>}/></Route></Routes></BrowserRouter></LocaleProvider>}
