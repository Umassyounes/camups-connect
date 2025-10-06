export default function SignInPage() {
  return (
    <main className="mx-auto grid max-w-md gap-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Campus Connect</h1>
        <p className="text-gray-500">For Beacons, by Beacons</p>
      </div>

      <form className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-xl font-semibold">Sign in with a magic link</h2>
        <p className="mb-4 text-sm text-gray-600">Enter your UMass Boston email to receive a login link.</p>
        <input
          type="email"
          name="email"
          placeholder="student@umb.edu"
          className="mb-4 w-full rounded-xl border px-3 py-3"
          required
        />
        <button className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white">
          Send Login Link
        </button>
        <p className="mt-3 text-center text-sm text-gray-600">
          Don't have an account? <a className="text-blue-600" href="/signup">Sign Up</a>
        </p>
      </form>
    </main>
  )
}
