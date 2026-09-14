import './globals.css';import type {Metadata} from 'next';import SiteChrome from '@/components/SiteChrome';import {LanguageProvider} from '@/components/LanguageProvider';import SiteFooter from '@/components/SiteFooter';
export const metadata:Metadata={title:'Tordher Bites | Tordher, Swabi',description:'Order fresh burgers, broast, shawarma, meals and sides from Tordher Bites in Tordher, Swabi.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><LanguageProvider><SiteChrome/>{children}<SiteFooter/></LanguageProvider></body></html>}
