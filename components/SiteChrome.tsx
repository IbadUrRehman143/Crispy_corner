'use client';
import Image from 'next/image';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {useEffect,useState} from 'react';
import {getCart} from '@/lib/cart';

export default function SiteChrome(){
  const pathname=usePathname(); const router=useRouter(); const [count,setCount]=useState(0);
  const refresh=()=>setCount(getCart().reduce((n,x)=>n+x.qty,0));
  useEffect(()=>{refresh(); window.addEventListener('cc-cart',refresh); window.addEventListener('storage',refresh); return()=>{window.removeEventListener('cc-cart',refresh);window.removeEventListener('storage',refresh)}},[]);
  if(pathname.startsWith('/admin')) return null;
  const back=pathname!=='/';
  return <>
    <div className="topbar">Freshly prepared • Pickup & Delivery • Tordher, Swabi</div>
    <header className="site-header"><div className="wrap nav">
      {back&&<button className="back-btn" aria-label="Go back" onClick={()=>router.back()}>←</button>}
      <Link className="brand" href="/"><Image src="/crispy-corner-logo.png" alt="Crispy Corner" width={52} height={52}/><span>Crispy Corner</span></Link>
      <nav className="navlinks"><Link href="/menu">Menu</Link><Link href="/order/track">Track Order</Link><Link className="cart-link" href="/cart">Cart{count>0&&<b className="cart-badge">{count>99?'99+':count}</b>}</Link><Link className="nav-order" href="/menu">Order Now</Link></nav>
    </div></header>
    <nav className="mobile-nav"><Link href="/menu"><span>🍗</span>Menu</Link><Link href="/cart" className="mobile-cart"><span>🛒</span>Cart{count>0&&<b className="cart-badge mobile-badge">{count>99?'99+':count}</b>}</Link><Link href="/order/track"><span>📍</span>Track</Link></nav>
  </>
}
