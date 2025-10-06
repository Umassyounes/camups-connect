export default function SignUpPage() {
  return (
    <main className="mx-auto grid max-w-md gap-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Campus Connect</h1>
        <p className="text-gray-500">For Beacons, by Beacons</p>
      </div>

      <form className="rounded-2xl border bg-white p-6 shadow-sm">
        <input name="email" type="email" placeholder="UMB Email Address" className="mb-3 w-full rounded-xl border px-3 py-3" required />
        <input name="name" placeholder="Name" className="mb-3 w-full rounded-xl border px-3 py-3" required />
        <select name="affiliation" className="mb-3 w-full rounded-xl border px-3 py-3">
          <option>Undergraduate</option>
          <option>Graduate</option>
          <option>Staff</option>
          <option>Faculty</option>
        </select>
        <input name="grad" placeholder="Graduation Year / Department" className="mb-3 w-full rounded-xl border px-3 py-3" />
        <input name="contact" placeholder="Preferred Contact Method" className="mb-3 w-full rounded-xl border px-3 py-3" />
        <label className="mb-4 flex items-center gap-2 text-sm">
          <input type="checkbox" required /> I agree to the <a href="#" className="text-blue-600">Terms & Code of Conduct</a>
        </label>
        <button className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white">Sign Up</button>
      </form>
    </main>
  )
}
