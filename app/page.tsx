'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export default function SupPage(){
  const [kod,setKod]=useState('')
  const [pass,setPass]=useState('')
  const [sekolah,setSekolah]=useState<any>(null)
  const [err,setErr]=useState('')
  const [loading,setLoading]=useState(false)
  async function login(e:any){
    e.preventDefault(); setLoading(true); setErr('');
    const {data,error}=await supabase.from('sekolah_master').select('*').eq('kod_sekolah',kod.toUpperCase()).eq('password',pass).single();
    if(error||!data){setErr('Salah'); setLoading(false); return;}
    setSekolah(data); setLoading(false);
  }
  if(sekolah){return <div className="p-8"><h1>{sekolah.nama_sekolah}</h1><p>{sekolah.kod_sekolah} pass {sekolah.password}</p><button onClick={()=>setSekolah(null)}>Keluar</button></div>}
  return <div className="min-h-screen flex items-center justify-center"><form onSubmit={login} className="border p-6 rounded"><h1>SUP LOGIN</h1><input value={kod} onChange={e=>setKod(e.target.value.toUpperCase())} placeholder="BEA0091" className="border p-2 w-full mb-2"/><input value={pass} onChange={e=>setPass(e.target.value)} placeholder="1" className="border p-2 w-full mb-2"/>{err&&<p className="text-red-500">{err}</p>}<button className="bg-blue-800 text-white p-2 w-full">{loading?'Loading':'Login'}</button></form></div>
}
