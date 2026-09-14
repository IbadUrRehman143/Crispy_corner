import {cookies} from 'next/headers'; import {SignJWT,jwtVerify} from 'jose';
const key=()=>{if(!process.env.AUTH_SECRET)throw new Error('AUTH_SECRET is not configured');return new TextEncoder().encode(process.env.AUTH_SECRET)};
export async function createSession(adminId:string){const token=await new SignJWT({sub:adminId,role:'admin'}).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('12h').sign(key());(await cookies()).set('tb_admin',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:43200})}
export async function requireAdmin(){try{const t=(await cookies()).get('tb_admin')?.value;if(!t)return null;const {payload}=await jwtVerify(t,key());return payload.role==='admin'?payload:null}catch{return null}}
export async function clearSession(){(await cookies()).set('tb_admin','',{httpOnly:true,path:'/',maxAge:0})}
