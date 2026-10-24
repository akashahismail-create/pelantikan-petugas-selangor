'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function SupPage() {
  const [kod, setKod] = useState('')
  const [pass, setPass] = useState('')
  const [sekolah, setSekolah] = useState<any>(null)
  const [pusatList, setPusatList] = useState<any[]>([])
  const [guruList, setGuruList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const k = params.get('kod')
    const p = params.get('p')
    if(k && p){ setKod(k); setPass(p) }
  }, [])

  async function handleLogin(e: any) {
    if(e) e.preventDefault()
    setLoading(true); setErr('')
    try {
      const kodUpper = kod.trim().toUpperCase()
      const passTrim = pass.toString().trim()
      const { data, error } = await supabase
        .from('sekolah_master')
        .select('*')
        .eq('kod_sekolah', kodUpper)
        .eq('password', passTrim)
        .single()
      
      if (error || !data) throw new Error('Kod ' + kodUpper + ' / Password ' + passTrim + ' salah. Password 1 hingga 369')
      
      setSekolah(data)

      if (data.senarai_pusat) {
        const list = data.senarai_pusat.split(',').map((s:string)=>s.trim().toUpperCase()).filter(Boolean)
        if(list.length>0){
          const { data: pusatData } = await supabase
            .from('pusat_master')
            .select('*')
            .in('no_pusat', list)
          setPusatList(pusatData || [])
        }
      }

      const { data: guruData } = await supabase
        .from('guru_master')
        .select('*')
        .eq('kod_sekolah', kodUpper)
        .order('nama_guru')
      setGuruList(guruData || [])

    } catch (e:any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (sekolah) {
    return (
      <div className="min-h-screen bg-slate-50 p-4">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="bg-white p-4 rounded-xl shadow border flex justify-between">
            <div>
              <h2 className="font-bold text-blue-800">{sekolah.password}. {sekolah.nama_sekolah} ({sekolah.kod_sekolah})</h2>
              <p className="text-sm">{sekolah.kod_ppd} {sekolah.ppd} | Pass {sekolah.password}/369 | Pusat {sekolah.bil_pusat}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                {sekolah.senarai_pusat?.split(',').map((p:string)=><span key={p} className="px-2 py-1 bg-blue-100 rounded text-xs font-mono">{p.trim().toUpperCase()}</span>)}
              </div>
            </div>
            <button onClick={()=>{setSekolah(null); setKod(''); setPass('');}} className="h-fit bg-red-50 text-red-600 px-3 py-1 rounded border text-sm">Keluar</button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow border">
              <h3 className="font-bold mb-2">Pusat ({pusatList.length})</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50"><th className="p-2 text-left">No</th><th className="p-2 text-left">Nama</th></tr></thead>
                <tbody>{pusatList.map((p:any)=><tr key={p.no_pusat} className="border-b"><td className="p-2 font-mono">{p.no_pusat}</td><td className="p-2">{p.nama_pusat}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border">
              <h3 className="font-bold mb-2">Guru ({guruList.length})</h3>
              <div className="max-h-[500px] overflow-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-gray-50"><th className="p-2 text-left">Nama</th><th className="p-2 text-left">IC</th></tr></thead>
                  <tbody>{guruList.map((g:any)=><tr key={g.id} className="border-b"><td className="p-2">{g.nama_guru}</td><td className="p-2 font-mono text-xs">{g.ic_guru}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow border p-6">
        <h1 className="text-center font-bold text-blue-800">LOG MASUK SUP</h1>
        <p className="text-center text-xs text-gray-500 mb-4">Kod Sekolah + Password 1 hingga 369</p>
        <form onSubmit={handleLogin} className="space-y-3">
          <input value={kod} onChange={e=>setKod(e.target.value.toUpperCase())} placeholder="Kod Sekolah BEA0091" className="w-full p-3 border rounded uppercase font-mono" required />
          <input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password 1" className="w-full p-3 border rounded" required />
          {err && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{err}</p>}
          <button disabled={loading} className="w-full bg-blue-800 text-white p-3 rounded font-bold">{loading?'Loading...':'Login'}</button>
        </form>
        <div className="mt-4 text-xs bg-gray-50 p-2 rounded border">
          <button onClick={()=>{setKod('BEA0091'); setPass('1')}} className="w-full text-left p-2 bg-white rounded border mb-1">BEA0091 / 1</button>
          <button onClick={()=>{setKod('ZZZ0022'); setPass('369')}} className="w-full text-left p-2 bg-white rounded border">ZZZ0022 / 369</button>
        </div>
        <a href="/" className="block text-center text-xs text-blue-600 mt-3">Kembali Home</a>
      </div>
    </div>
  )
}
