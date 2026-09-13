import './globals.css';import type {Metadata} from 'next';import SiteChrome from '@/components/SiteChrome';import SiteFooter from '@/components/SiteFooter';
export const metadata:Metadata={title:'Crispy Corner | Tordher, Swabi',description:'Order fresh burgers, broast, shawarma, meals and sides from Crispy Corner in Tordher, Swabi.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><SiteChrome/>{children}<SiteFooter/></body></html>}
