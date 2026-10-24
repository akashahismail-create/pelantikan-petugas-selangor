'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function SupPage() {
  const [kod, setKod] = useState('BEA0091')
  const [pass, setPass] = useState('1')
  const [sekolah, setSekolah] = useState<any>(null)
  const [pusatList, setPusatList] = useState<any[]>([])
  const [guruList, setGuruList] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  async function handleLogin(e: any) {
    e.preventDefault()
    setLoading(true); setErr('')
    try {
      const kodUpper = kod.trim().toUpperCase()
      const { data, error } = await supabase
        .from('sekolah_master')
        .select('*')
        .eq('kod_sekolah', kodUpper)
        .eq('password', pass.trim())
        .single()
      if (error || !data) throw new Error('Kod ' + kodUpper + ' atau Password ' + pass + ' salah. Cuba BEA0091 / 1')
      setSekolah(data)
      if (data.senarai_pusat) {
        const list = data.senarai_pusat.split(',').map((s: string) => s.trim().toUpperCase()).filter(Boolean)
        if (list.length > 0) {
          const { data: pusatData } = await supabase.from('pusat_master').select('*').in('no_pusat', list)
          setPusatList(pusatData || [])
        }
      }
      const { data: guruData } = await supabase.from('guru_master').select('*').eq('kod_sekolah', kodUpper).order('nama_guru')
      setGuruList(guruData || [])
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  if (sekolah) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow border-l-4 border-blue-800">
            <div className="flex justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-blue-900">{sekolah.password}. {sekolah.nama_sekolah} ({sekolah.kod_sekolah})</h2>
                <p className="text-sm text-gray-600 mt-1">{sekolah.kod_ppd} {sekolah.ppd} | Password {sekolah.password} dari 369 | Bil Pusat {sekolah.bil_pusat}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {sekolah.senarai_pusat?.split(',').map((p: string) => (
                    <span key={p} className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-mono font-bold border">{p.trim().toUpperCase()}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => { setSekolah(null); setKod(''); setPass(''); }} className="h-fit bg-red-50 text-red-700 px-4 py-2 rounded-lg border text-sm font-bold">Log Keluar</button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl shadow border">
              <h3 className="font-bold text-blue-900 mb-3">Senarai Pusat ({pusatList.length}) - UPPER BA BK</h3>
              <div className="overflow-auto max-h-[500px]">
                <table className="w-full text-sm"><thead className="bg-gray-50 sticky top-0"><tr><th className="p-2 text-left">No Pusat</th><th className="p-2 text-left">Nama</th></tr></thead><tbody>{pusatList.map((p: any) => <tr key={p.no_pusat} className="border-b hover:bg-gray-50"><td className="p-2 font-mono font-bold">{p.no_pusat}</td><td className="p-2">{p.nama_pusat}</td></tr>)}</tbody></table>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow border">
              <h3 className="font-bold text-blue-900 mb-3">Guru {sekolah.kod_sekolah} ({guruList.length})</h3>
              <div className="overflow-auto max-h-[500px]"><table className="w-full text-sm"><thead className="bg-gray-50 sticky top-0"><tr><th className="p-2 text-left">Nama</th><th className="p-2 text-left">IC</th></tr></thead><tbody>{guruList.map((g: any) => <tr key={g.id} className="border-b hover:bg-gray-50"><td className="p-2">{g.nama_guru}</td><td className="p-2 font-mono text-xs">{g.ic_guru}</td></tr>)}</tbody></table></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#eef2f7] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-[20px] shadow-2xl border p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-yellow-400 rounded-full mx-auto mb-3 flex items-center justify-center font-black text-[10px] border-2 border-yellow-600">JATA</div>
          <h1 className="text-[13px] font-black text-blue-900 tracking-wide">JABATAN PENDIDIKAN NEGERI SELANGOR</h1>
          <h2 className="text-xl font-black text-blue-900 mt-4">LOG MASUK SUP</h2>
          <p className="text-[11px] text-gray-500 mt-1 leading-tight">Guna Kod Sekolah tambah Password Lama 1 hingga 369<br/>BA Klang 1 hingga 49 hingga BK Petaling Utama 334 hingga 369<br/>Kod Pusat dah fix UPPER BA049, BK550 dll</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="text-xs font-bold text-gray-700">Kod Sekolah (Contoh BEA0091)</label><input value={kod} onChange={e => setKod(e.target.value.toUpperCase())} placeholder="BEA0091" className="w-full mt-1 p-3 border border-gray-300 rounded-xl font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
          <div><label className="text-xs font-bold text-gray-700">Kata Laluan / Password (1 hingga 369)</label><input value={pass} onChange={e => setPass(e.target.value)} placeholder="1" className="w-full mt-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
          {err && <div className="text-xs text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">{err}</div>}
          <button disabled={loading} className="w-full bg-[#0d47a1] text-white p-3.5 rounded-xl font-bold hover:bg-blue-900 transition disabled:opacity-50">{loading ? 'Menyemak 369 sekolah...' : 'Log Masuk SUP'}</button>
        </form>
        <div className="mt-5 p-3 bg-slate-50 rounded-xl text-[11px] border">
          <p className="font-bold mb-2 text-gray-700">Demo Login (dah siap fix UPPER):</p>
          <button onClick={() => { setKod('BEA0091'); setPass('1'); }} className="w-full text-left p-2.5 bg-white rounded-lg border hover:bg-blue-50 mb-1.5 font-mono">BEA0091 / 1 - SMK RAJA MAHADI (BA001) 2 pusat BA049 BA050</button>
          <button onClick={() => { setKod('BGAJ003'); setPass('360'); }} className="w-full text-left p-2.5 bg-white rounded-lg border hover:bg-blue-50 mb-1.5 font-mono">BGAJ003 / 360 - SEKOLAH SRI BESTARI BK550</button>
          <button onClick={() => { setKod('ZZZ0022'); setPass('369'); }} className="w-full text-left p-2.5 bg-white rounded-lg border hover:bg-blue-50 font-mono">ZZZ0022 / 369 - SM BESTARI ASIA PACIFIC BK566 (terakhir)</button>
        </div>
        <div className="mt-4 text-center"><a href="/" className="text-xs text-blue-700 font-bold hover:underline">← Kembali Home</a></div>
      </div>
    </div>
  )
}
