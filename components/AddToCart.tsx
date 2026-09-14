"use client";
import {useState} from 'react';
import Link from 'next/link';
import {getCart,setCart} from '@/lib/cart';
export default function Add({item}:{item:{id:string;name:string;price:number}}){const [added,setAdded]=useState(false);return <div className="add-wrap"><button className="btn add-btn" onClick={()=>{const c=getCart(),x=c.find(i=>i.id===item.id);x?x.qty++:c.push({...item,qty:1});setCart(c);window.dispatchEvent(new Event('tb-cart'));setAdded(true);setTimeout(()=>setAdded(false),1800)}}>{added?'✓ Added':'+ Add'}</button>{added&&<Link className="mini-cart-open" href="/cart">Open cart →</Link>}</div>}
