import { Metadata } from 'next'
import Link from 'next/link'
import { SignupForm } from '@/components/features/auth/signup-form'

export const metadata: Metadata = {
  title: 'Sign Up - SlideShow',
  description: 'Create your SlideShow account',
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SlideShow</h1>
          <p className="text-gray-600">Create amazing video slideshows</p>
        </div>

        <SignupForm />

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:text-indigo-500 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
