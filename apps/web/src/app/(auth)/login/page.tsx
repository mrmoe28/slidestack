import { Metadata } from 'next'
import { LoginForm } from '@/components/features/auth/login-form'

export const metadata: Metadata = {
  title: 'Login - SlideShow',
  description: 'Sign in to your SlideShow account',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to SlideShow</h1>
          <p className="text-gray-600">
            Sign in with your email to get started
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
