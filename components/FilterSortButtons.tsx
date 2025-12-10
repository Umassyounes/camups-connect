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
    <div className="relative w-full md:w-auto">
      <button 
        onClick={() => setShowSortMenu(!showSortMenu)}
        className="w-full md:w-auto px-4 md:px-6 py-2 md:py-3 bg-white border-2 border-gray-300 rounded-xl text-[#4A5568] font-medium hover:border-[#4F7CFF] hover:text-[#4F7CFF] hover:bg-blue-50 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm md:text-base"
      >
        <svg className="w-4 h-4 md:w-5 md:h-5 text-[#4F7CFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/>
        </svg>
        Sort By
        <svg className={`w-3 h-3 md:w-4 md:h-4 transition-transform ${showSortMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="absolute left-0 top-full mt-2 w-full md:w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
            <button
              onClick={() => handleSort("default")}
              className={`w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-blue-50 transition text-sm md:text-base ${currentSort === "default" ? "bg-blue-50 text-[#4F7CFF] font-semibold" : "text-[#4A5568]"}`}
            >
              ✨ Featured First
            </button>
            <button
              onClick={() => handleSort("price_low")}
              className={`w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-blue-50 transition text-sm md:text-base ${currentSort === "price_low" ? "bg-blue-50 text-[#4F7CFF] font-semibold" : "text-[#4A5568]"}`}
            >
              💰 Price: Low to High
            </button>
            <button
              onClick={() => handleSort("price_high")}
              className={`w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-blue-50 transition text-sm md:text-base ${currentSort === "price_high" ? "bg-blue-50 text-[#4F7CFF] font-semibold" : "text-[#4A5568]"}`}
            >
              💎 Price: High to Low
            </button>
            <button
              onClick={() => handleSort("newest")}
              className={`w-full text-left px-3 md:px-4 py-2 md:py-3 hover:bg-blue-50 transition text-sm md:text-base ${currentSort === "newest" ? "bg-blue-50 text-[#4F7CFF] font-semibold" : "text-[#4A5568]"}`}
            >
              🆕 Newest First
            </button>
          </div>
        </>
      )}
    </div>
  )
}
