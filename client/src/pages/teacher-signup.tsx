// Helper input components
function LabeledInput({ label, value, onChange, onBlur, helper, type, disabled }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; onBlur?: () => void; helper?: string; type?: string; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="block text-sm text-earth-muted mb-1">{label}</span>
      <input className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={value} onChange={onChange} onBlur={onBlur} type={type} disabled={disabled} />
      {helper && <span className="block text-xs text-earth-muted mt-1">{helper}</span>}
    </label>
  );
}

function PhotoInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result || ""));
    reader.readAsDataURL(file);
  };
  return (
    <label className="block">
      <span className="block text-sm text-earth-muted mb-1">{label}</span>
      <input type="file" accept="image/*" onChange={onFile} className="w-full rounded-lg px-3 py-2 text-[var(--foreground)] bg-white" />
      {value && <img src={value} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded-full" />}
    </label>
  );
}

function SchoolPicker({ value, onChange, helper }: { value: string; onChange: (v: string) => void; helper?: string }) {
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch('/api/schools')
      .then(r => r.json())
      .then(data => { if (mounted) setSchools(data || []); })
      .catch(() => { if (mounted) setError('Failed to load schools'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  return (
    <label className="block">
      <span className="block text-sm text-earth-muted mb-1">School</span>
      <select className="w-full rounded-lg px-3 py-2 text-[var(--foreground)]" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{loading ? 'Loading…' : error ? 'Failed to load' : 'Select school…'}</option>
        {schools.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      {helper && <span className="block text-xs text-earth-muted mt-1">{helper}</span>}
    </label>
  );
}
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";

export default function TeacherSignupWizard() {
  const { setRole } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    id: "",
    username: "",
    schoolId: "",
    subject: "",
    photoDataUrl: "",
  password: "",
  confirmPassword: "",
  });
  const [usernameStatus, setUsernameStatus] = useState<"unknown" | "checking" | "available" | "taken">("unknown");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const next = () => setStep((s) => s + 1);
  const back = () => setStep((s) => Math.max(1, s - 1));

  async function checkUsername() {
    if (!form.username) return;
    setUsernameStatus('checking');
    try {
      const res = await fetch(`/api/username-available/${encodeURIComponent(form.username)}`).then(r => r.json());
      setUsernameStatus(res.available ? 'available' : 'taken');
    } catch {
      setUsernameStatus('unknown');
    }
  }

  async function requestOtp() {
    if (!form.email) return;
    await fetch('/api/otp/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email }) });
    setOtpSent(true);
  }

  const submit = async () => {
    const sanitized = otpCode.replace(/\D/g, '').slice(0, 6);
    if (sanitized.length !== 6) {
      alert('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    if (!form.password || form.password.length < 6) {
      alert('Please set a password with at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    try {
      const avail = await fetch(`/api/username-available/${encodeURIComponent(form.username)}`).then(r => r.json());
      if (!avail.available) {
        alert('Username is taken. Please choose another.');
        return;
      }
    } catch {}

    setSubmitting(true);
  const verify = await fetch('/api/otp/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: form.email, code: sanitized }) }).then(r => r.json());
  if (!verify.ok) {
      setSubmitting(false);
      alert('Invalid OTP. Please try again.');
      return;
    }

    await fetch('/api/signup/teacher', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        username: form.username,
        schoolId: form.schoolId,
        id: form.id,
        subject: form.subject,
        photoDataUrl: form.photoDataUrl,
  password: form.password,
      })
    });
    setSubmitting(false);
    alert('Application submitted. Please wait for admin approval. You can sign in after approval.');
    navigate('/signin');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwyfHxuYXR1cmUlMjBtb3VudGFpbnxlbnwwfHx8fDE3NjA1MDgyNTZ8MA&ixlib=rb-4.1.0&q=85')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-green-900/60 to-emerald-900/70"></div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Floating decorative elements */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-400 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-400 rounded-full blur-3xl opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 -right-20 w-20 h-20 bg-yellow-300 rounded-full blur-2xl opacity-30 animate-pulse" style={{animationDelay: '2s'}}></div>

        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border-4 border-white/20 transform hover:scale-[1.01] transition-all duration-300">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-blue-400 to-emerald-500 p-4 rounded-full mb-4 shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">Join EcoVerse as a Teacher</h1>
            <p className="text-gray-700 text-lg">Shape the future of environmental education</p>
          </div>

          {/* Back Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to role selection
            </button>
          </div>

          {/* Form Sections */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                  />
                  <p className="text-sm text-gray-500 mt-1">Example: Jane Smith</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email"
                    disabled={otpSent}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white disabled:opacity-50"
                  />
                  <p className="text-sm text-gray-500 mt-1">OTP will be sent to this email</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Teacher ID</label>
                  <input
                    type="text"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    placeholder="Enter your teacher ID"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                  />
                  <p className="text-sm text-gray-500 mt-1">Set your own unique ID</p>
                </div>
              </div>
            </div>

            {/* Account Setup */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                Account Setup
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Unique Username</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    onBlur={checkUsername}
                    placeholder="Choose a unique username"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                  />
                  <p className="text-sm text-gray-500 mt-1">This must be unique. Example: jane_smith_01</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={checkUsername}
                    disabled={!form.username || usernameStatus === 'checking'}
                    className="px-6 py-2 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300"
                  >
                    {usernameStatus === 'checking' ? 'Checking...' : 'Check Username'}
                  </Button>
                  {usernameStatus === 'available' && (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Available
                    </span>
                  )}
                  {usernameStatus === 'taken' && (
                    <span className="text-red-600 font-medium flex items-center gap-1">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Taken
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Create password"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                    />
                    <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      placeholder="Confirm password"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                Professional Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">School</label>
                  <SchoolPicker value={form.schoolId} onChange={(v) => setForm({ ...form, schoolId: v })} />
                  <p className="text-sm text-gray-500 mt-1">Don't see yours? Ask admin to add your school.</p>
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Enter your subject"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white"
                  />
                  <p className="text-sm text-gray-500 mt-1">Example: Mathematics, Science, Environmental Studies</p>
                </div>
              </div>
            </div>

            {/* Profile Photo */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                Profile Photo
              </h2>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Upload Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setForm({ ...form, photoDataUrl: String(reader.result || "") });
                    reader.readAsDataURL(file);
                  }}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
                {form.photoDataUrl && (
                  <div className="mt-4 flex justify-center">
                    <img src={form.photoDataUrl} alt="Preview" className="h-24 w-24 object-cover rounded-full border-4 border-white shadow-lg" />
                  </div>
                )}
              </div>
            </div>

            {/* Email Verification */}
            <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">5</span>
                </div>
                Email Verification
              </h2>
              <p className="text-gray-600 mb-4">We'll send a one-time code to your email for verification.</p>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    variant="outline"
                    onClick={requestOtp}
                    disabled={!form.email || otpSent}
                    className="px-6 py-3 border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 disabled:opacity-50"
                  >
                    {otpSent ? 'OTP Sent' : 'Send OTP to Email'}
                  </Button>
                  {otpSent && (
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpCode}
                      maxLength={6}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 bg-white text-center text-lg font-mono"
                    />
                  )}
                </div>
                {otpSent && (
                  <p className="text-sm text-gray-600">
                    OTP sent to: <span className="font-medium text-gray-800">{form.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-gradient-to-r from-blue-500 to-emerald-600 rounded-2xl p-6 text-white">
              <Button
                onClick={submit}
                disabled={submitting || usernameStatus === 'taken' || !otpCode}
                className="w-full py-4 bg-white text-blue-600 hover:bg-gray-50 font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Application...
                  </span>
                ) : (
                  'Submit Application'
                )}
              </Button>
              <p className="mt-4 text-center text-blue-100 text-sm">
                After submission, your application will be pending until an admin approves it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
