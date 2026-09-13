'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {CartItem,getCart,setCart} from '@/lib/cart';

export default function Cart(){
  const [cart,setLocalCart]=useState<CartItem[]>([]);
  useEffect(()=>setLocalCart(getCart()),[]);
  const update=(id:string,delta:number)=>{const next=cart.map(x=>x.id===id?{...x,qty:x.qty+delta}:x).filter(x=>x.qty>0);setLocalCart(next);setCart(next)};
  const remove=(id:string)=>{const next=cart.filter(x=>x.id!==id);setLocalCart(next);setCart(next)};
  const total=cart.reduce((sum,x)=>sum+x.price*x.qty,0);
  const count=cart.reduce((sum,x)=>sum+x.qty,0);
  return <>
    <section className="commerce-hero cart-hero"><div className="wrap commerce-hero-inner"><div><div className="eyebrow light">YOUR CRISPY CORNER ORDER</div><h1>YOUR BAG.<br/><span>YOUR CRAVING.</span></h1><p>Fine-tune your order, add another favourite, then send it straight to the kitchen.</p></div><div className="commerce-hero-stat"><small>IN YOUR CART</small><strong>{count}</strong><span>{count===1?'item':'items'} ready for checkout</span></div></div></section>
    <main className="cart-premium-section"><div className="wrap">
      {!cart.length?<div className="premium-empty"><div className="empty-mark">CC</div><div><div className="eyebrow">YOUR BAG IS WAITING</div><h2>Nothing crispy in here yet.</h2><p>Build your order from burgers, broast, shawarma, meals, sides and drinks.</p><Link href="/menu" className="btn">Explore the Menu →</Link></div></div>:
      <div className="premium-cart-grid"><section><div className="cart-section-head"><div><div className="eyebrow">ORDER DETAILS</div><h2>{count} {count===1?'item':'items'} selected</h2></div><Link href="/menu" className="text-action">+ Add more</Link></div><div className="premium-cart-list">{cart.map((x,index)=><article className="premium-cart-item" key={x.id}><div className="cart-item-number">{String(index+1).padStart(2,'0')}</div><div className="cart-food-mark">CC</div><div className="premium-cart-copy"><small>FRESHLY PREPARED</small><h3>{x.name}</h3><p>Rs {x.price} each</p><button className="remove-link" onClick={()=>remove(x.id)}>Remove</button></div><div className="premium-cart-actions"><div className="premium-qty"><button aria-label="Decrease quantity" onClick={()=>update(x.id,-1)}>−</button><b>{x.qty}</b><button aria-label="Increase quantity" onClick={()=>update(x.id,1)}>+</button></div><strong>Rs {x.price*x.qty}</strong></div></article>)}</div></section>
      <aside className="premium-summary"><div className="summary-kicker">READY WHEN YOU ARE</div><h2>Order Summary</h2><div className="premium-summary-row"><span>Items</span><b>{count}</b></div><div className="premium-summary-row"><span>Subtotal</span><b>Rs {total}</b></div><div className="premium-summary-row"><span>Payment</span><b>Cash on delivery</b></div><div className="premium-summary-total"><span>Total</span><strong>Rs {total}</strong></div><Link href="/checkout" className="btn premium-checkout">Continue to Checkout →</Link><div className="summary-trust"><span>✓ Freshly prepared</span><span>✓ Live order tracking</span><span>✓ Pickup or delivery</span></div></aside></div>}
    </div></main>
  </>
}
