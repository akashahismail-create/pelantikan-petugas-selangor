'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const PPD_LIST = [
  { kod: 'BG', nama: 'GOMBAK' },
  { kod: 'BD', nama: 'HULU LANGAT' },
  { kod: 'BE', nama: 'HULU SELANGOR' },
  { kod: 'BA', nama: 'KLANG' },
  { kod: 'BB', nama: 'KUALA LANGAT' },
  { kod: 'BC', nama: 'KUALA SELANGOR' },
  { kod: 'BH', nama: 'PETALING PERDANA' },
  { kod: 'BK', nama: 'PETALING UTAMA' },
  { kod: 'BF', nama: 'SABAK BERNAM' },
  { kod: 'BJ', nama: 'SEPANG' },
]

export default function Home() {
  const [showPPD, setShowPPD] = useState(false)
  const [showSekolah, setShowSekolah] = useState(false)
  const [selectedPPD, setSelectedPPD] = useState<any>(null)
  const [sekolahList, setSekolahList] = useState<any[]>([])
  const [selectedSekolah, setSelectedSekolah] = useState<any>(null)
  const [showLogin, setShowLogin] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSelectPPD = async (ppd: any) => {
    setSelectedPPD(ppd)
    setShowPPD(false)
    setLoading(true)
    setShowSekolah(true)
    const { data } = await supabase.from('sekolah_master').select('*').eq('kod_ppd', ppd.kod).order('nama_sekolah')
    setSekolahList(data || [])
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="bg-[#0d47a1] text-white p-6 text-center">
        <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto mb-3 flex items-center justify-center text-black font-bold">JATA</div>
        <h1 className="text-2xl font-bold">JABATAN PENDIDIKAN NEGERI SELANGOR</h1>
        <p className="text-sm opacity-90">KEMENTERIAN PENDIDIKAN MALAYSIA</p>
        <div className="bg-white text-[#0d47a1] mt-4 py-2 font-bold">SISTEM PELANTIKAN PETUGAS SPM 2026</div>
      </div>

      <div className="flex justify-center gap-6 mt-12">
        <button onClick={() => setShowPPD(true)} className="bg-[#1976d2] text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-lg">SUP</button>
        <button onClick={() => setShowPPD(true)} className="bg-[#1976d2] text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-lg">PPD</button>
        <button onClick={() => { setSelectedSekolah(null); setShowLogin(true)}} className="bg-[#1976d2] text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-lg">JPN</button>
      </div>

      {showPPD && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPPD(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-blue-800">PILIH DAERAH / PPD</h2><button onClick={() => setShowPPD(false)}>X</button></div>
            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
              {PPD_LIST.map(ppd => (
                <button key={ppd.kod} onClick={() => handleSelectPPD(ppd)} className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border">{ppd.nama} ({ppd.kod})</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSekolah && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowSekolah(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h2 className="font-bold text-blue-800">SEKOLAH - {selectedPPD?.nama}</h2><button onClick={() => setShowSekolah(false)}>X</button></div>
            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-1">
              {loading ? <p>Loading...</p> : sekolahList.map((s) => (
                <button key={s.id} onClick={() => { setSelectedSekolah(s); setShowLogin(true) }} className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border text-sm">{s.kod_sekolah} - {s.nama_sekolah}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLogin(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h2 className="font-bold text-center mb-4">{selectedSekolah ? selectedSekolah.nama_sekolah : 'JPN SELANGOR'}</h2>
            <input type="password" placeholder="Kata Laluan" className="w-full border p-3 rounded-lg mb-4" />
            <div className="flex gap-2"><button className="flex-1 bg-blue-700 text-white py-2 rounded-lg">Masuk</button><button onClick={() => setShowLogin(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Batal</button></div>
          </div>
        </div>
      )}
    </div>
  )
}