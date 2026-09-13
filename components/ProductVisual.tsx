export default function ProductVisual({name,imageUrl,compact=false}:{name:string;imageUrl?:string|null;compact?:boolean}){
  if(imageUrl){return <div className={compact?'product-image compact':'product-image'}><img src={imageUrl} alt={name} loading="lazy"/></div>}
  const initials=name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
  return <div className={compact?'product-image product-placeholder compact':'product-image product-placeholder'} aria-label={name}><span>{initials}</span><small>Freshly made</small></div>
}
