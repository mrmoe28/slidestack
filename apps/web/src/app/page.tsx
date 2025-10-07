export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Create Stunning Video Slideshows
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Turn your images, videos, and audio into professional MP4 slideshow videos with transitions, captions, and background music.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/dashboard"
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-50 transition-colors border border-indigo-200"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="mt-24 grid md:grid-cols-3 gap-8" id="features">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">Easy to Use</h3>
            <p className="text-gray-600">
              Drag and drop your media files, arrange them on the timeline, and render your video in minutes.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">Beautiful Transitions</h3>
            <p className="text-gray-600">
              Choose from fade, slide, zoom, and more transition effects to make your slideshow stand out.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl mb-4">🎵</div>
            <h3 className="text-xl font-semibold mb-2">Add Music & Captions</h3>
            <p className="text-gray-600">
              Include background music and text overlays to tell your story perfectly.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
