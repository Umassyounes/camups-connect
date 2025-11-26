"use client"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function FilterSortButtons() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showSortMenu, setShowSortMenu] = useState(false)

  function handleSort(sortValue: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (sortValue === "default") {
      params.delete("sort")
    } else {
      params.set("sort", sortValue)
    }
    router.push(`/?${params.toString()}`)
    setShowSortMenu(false)
  }

  const currentSort = searchParams.get("sort") || "default"

  return (
    <div className="relative">
      <button 
        onClick={() => setShowSortMenu(!showSortMenu)}
        className="px-6 py-3 bg-white border-2 border-gray-300 rounded-xl text-[#4A5568] font-medium hover:border-[#4F7CFF] hover:text-[#4F7CFF] hover:bg-blue-50 transition-all flex items-center gap-2 whitespace-nowrap"
      >
        <svg className="w-5 h-5 text-[#4F7CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
        </svg>
        Sort By
        <svg className={`w-4 h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showSortMenu && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowSortMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
            <button
              onClick={() => handleSort("default")}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition ${currentSort === "default" ? "bg-blue-50 text-[#4F7CFF] font-semibold" : "text-[#4A5568]"}`}
            >
              ✨ Featured First
            </button>
            <button
              onClick={() => handleSort("price_low")}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition ${currentSort === "price_low" ? "bg-blue-50 text-[#4F7CFF] font-semibold" : "text-[#4A5568]"}`}
            >
              💰 Price: Low to High
            </button>
            <button
              onClick={() => handleSort("price_high")}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition ${currentSort === "price_high" ? "bg-blue-50 text-[#4F7CFF] font-semibold" : "text-[#4A5568]"}`}
            >
              💎 Price: High to Low
            </button>
            <button
              onClick={() => handleSort("newest")}
              className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition ${currentSort === "newest" ? "bg-blue-50 text-[#4F7CFF] font-semibold" : "text-[#4A5568]"}`}
            >
              🆕 Newest First
            </button>
          </div>
        </>
      )}
    </div>
  )
}
