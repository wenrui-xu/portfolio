import React from 'react';
import {Link} from 'react-router-dom';
import {useLocale} from '../locale';
export default function NotFound(){const {t}=useLocale();return <section className="v-not-found v-wrap"><span aria-hidden="true">(\_/)<br/>(×_×)</span><p className="v-kicker">{t.notFound.kicker}</p><h1>{t.notFound.first}<br/><em>{t.notFound.second}</em></h1><Link to="/">{t.notFound.back}</Link></section>}
