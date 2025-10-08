export function EditorSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <header className="flex-shrink-0 bg-white border-b shadow-sm px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-16 h-8 bg-gray-200 rounded"></div>
          <div className="border-l pl-3">
            <div className="w-48 h-5 bg-gray-200 rounded"></div>
            <div className="w-32 h-3 bg-gray-100 rounded mt-1"></div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-8 bg-gray-200 rounded"></div>
          <div className="w-28 h-8 bg-gray-200 rounded"></div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar Skeleton */}
        <aside className="w-64 flex-shrink-0 bg-white border-r shadow-sm p-3 space-y-4">
          <div>
            <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="w-full h-32 bg-gray-100 rounded"></div>
          </div>
          <div className="border-t pt-4">
            <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
            <div className="space-y-2">
              <div className="w-full h-8 bg-gray-100 rounded"></div>
              <div className="w-full h-8 bg-gray-100 rounded"></div>
            </div>
          </div>
        </aside>

        {/* Center Preview Skeleton */}
        <main className="flex-1 flex flex-col bg-gray-50 min-w-0">
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="w-full h-full max-w-5xl max-h-full flex items-center justify-center">
              <div className="w-full aspect-video bg-white rounded-lg shadow-xl border-2 border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
                  <div className="w-32 h-4 bg-gray-200 rounded mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar Skeleton */}
        <aside className="w-80 flex-shrink-0 bg-white border-l shadow-sm p-3 space-y-3">
          <div className="w-24 h-4 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded border border-gray-200 h-16"></div>
            <div className="p-2 bg-gray-50 rounded border border-gray-200 h-16"></div>
            <div className="p-2 bg-gray-50 rounded border border-gray-200 h-16"></div>
          </div>
        </aside>
      </div>

      {/* Timeline Skeleton */}
      <div className="flex-shrink-0 h-80 bg-white border-t border-gray-200 p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-20 h-8 bg-gray-200 rounded"></div>
            <div className="w-20 h-8 bg-gray-200 rounded"></div>
            <div className="flex-1"></div>
            <div className="w-32 h-6 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
