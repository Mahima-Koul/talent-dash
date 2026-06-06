'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const LEVELS = ['L3','L4','L5','L6','SDE_I','SDE_II','SDE_III','STAFF','PRINCIPAL','IC4','IC5']
const CURRENCIES = ['INR','USD','GBP','EUR']
const SOURCES = ['CONTRIBUTOR']

const LEVEL_LABELS: Record<string, string> = {
  L3:'L3', L4:'L4', L5:'L5', L6:'L6',
  SDE_I:'SDE-I', SDE_II:'SDE-II', SDE_III:'SDE-III',
  STAFF:'Staff', PRINCIPAL:'Principal', IC4:'IC4', IC5:'IC5',
}

interface FormData {
  company: string
  role: string
  level: string
  location: string
  currency: string
  experience_years: string
  base_salary: string
  bonus: string
  stock: string
}

interface FieldError {
  [key: string]: string
}

export default function AddSalaryPage() {
  const router = useRouter()

  const [form, setForm] = useState<FormData>({
    company: '',
    role: '',
    level: '',
    location: '',
    currency: 'INR',
    experience_years: '',
    base_salary: '',
    bonus: '',
    stock: '',
  })

  const [errors, setErrors]   = useState<FieldError>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  function set(field: keyof FormData, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate(): FieldError {
    const e: FieldError = {}
    if (!form.company.trim())         e['company']          = 'Company name is required'
    if (!form.role.trim())            e['role']             = 'Role is required'
    if (!form.level)                  e['level']            = 'Level is required'
    if (!form.location.trim())        e['location']         = 'Location is required'
    if (!form.experience_years)       e['experience_years'] = 'Years of experience is required'
    if (!form.base_salary)            e['base_salary']      = 'Base salary is required'

    const exp = parseInt(form.experience_years)
    if (exp <= 0 || exp > 50)         e['experience_years'] = 'Must be between 1 and 50'

    const base = parseInt(form.base_salary)
    if (base <= 0)                    e['base_salary']      = 'Must be greater than 0'

    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const res = await fetch('/api/ingest-salary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company:          form.company.trim(),
          role:             form.role.trim(),
          level:            form.level,
          location:         form.location.trim(),
          currency:         form.currency,
          experience_years: parseInt(form.experience_years),
          base_salary:      parseInt(form.base_salary),
          bonus:            parseInt(form.bonus || '0'),
          stock:            parseInt(form.stock || '0'),
          source:           'CONTRIBUTOR',
          confidence_score: 0.9,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.field) {
          setErrors({ [data.field]: data.message })
        } else {
          setErrors({ general: data.message ?? 'Something went wrong' })
        }
        return
      }

      setSuccess(true)
      setTimeout(() => router.push('/salaries'), 2000)
    } catch {
      setErrors({ general: 'Network error — please try again' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#222222' }}>
          Salary submitted!
        </h1>
        <p className="text-sm" style={{ color: '#717171' }}>
          Thank you for contributing. Redirecting to salaries...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1" style={{ color: '#222222' }}>
          Add Your Salary
        </h1>
        <p className="text-sm" style={{ color: '#717171' }}>
          All submissions are anonymous. Your data helps thousands of professionals
          negotiate better offers.
        </p>
      </div>

      {/* General error */}
      {errors['general'] && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm font-medium"
          style={{ background: '#FCEBEB', color: '#A32D2D' }}
        >
          {errors['general']}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company + Role */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company *" error={errors['company']}>
            <input
              type="text"
              value={form.company}
              onChange={e => set('company', e.target.value)}
              placeholder="e.g. Google"
              className={input(!!errors['company'])}
            />
          </Field>
          <Field label="Role / Job Title *" error={errors['role']}>
            <input
              type="text"
              value={form.role}
              onChange={e => set('role', e.target.value)}
              placeholder="e.g. Software Engineer"
              className={input(!!errors['role'])}
            />
          </Field>
        </div>

        {/* Level + Location */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Level *" error={errors['level']}>
            <select
              value={form.level}
              onChange={e => set('level', e.target.value)}
              className={input(!!errors['level'])}
            >
              <option value="">Select level...</option>
              {LEVELS.map(l => (
                <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
              ))}
            </select>
          </Field>
          <Field label="Location *" error={errors['location']}>
            <input
              type="text"
              value={form.location}
              onChange={e => set('location', e.target.value)}
              placeholder="e.g. Bengaluru"
              className={input(!!errors['location'])}
            />
          </Field>
        </div>

        {/* Experience + Currency */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Years of Experience *" error={errors['experience_years']}>
            <input
              type="number"
              min={1}
              max={50}
              value={form.experience_years}
              onChange={e => set('experience_years', e.target.value)}
              placeholder="e.g. 4"
              className={input(!!errors['experience_years'])}
            />
          </Field>
          <Field label="Currency *" error={errors['currency']}>
            <select
              value={form.currency}
              onChange={e => set('currency', e.target.value)}
              className={input(false)}
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
        </div>

        {/* Salary fields */}
        <div className="rounded-xl border p-5 space-y-4" style={{ borderColor: '#EBEBEB', background: '#FAFAFA' }}>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#717171' }}>
            Compensation (annual, in selected currency)
          </p>

          <Field label="Base Salary *" error={errors['base_salary']}>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium"
                style={{ color: '#717171' }}
              >
                {form.currency === 'INR' ? '₹' : form.currency === 'USD' ? '$' : form.currency === 'GBP' ? '£' : '€'}
              </span>
              <input
                type="number"
                min={1}
                value={form.base_salary}
                onChange={e => set('base_salary', e.target.value)}
                placeholder={form.currency === 'INR' ? '2000000' : '100000'}
                className={`${input(!!errors['base_salary'])} pl-7`}
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Annual Bonus" error={errors['bonus']} hint="Optional">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#717171' }}>
                  {form.currency === 'INR' ? '₹' : '$'}
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.bonus}
                  onChange={e => set('bonus', e.target.value)}
                  placeholder="0"
                  className={`${input(false)} pl-7`}
                />
              </div>
            </Field>
            <Field label="Stock / RSU (annual vesting)" error={errors['stock']} hint="Optional">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#717171' }}>
                  {form.currency === 'INR' ? '₹' : '$'}
                </span>
                <input
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={e => set('stock', e.target.value)}
                  placeholder="0"
                  className={`${input(false)} pl-7`}
                />
              </div>
            </Field>
          </div>

          {/* Live TC preview */}
          {form.base_salary && (
            <div
              className="flex items-center justify-between px-4 py-3 rounded-lg"
              style={{ background: '#E6F1FB' }}
            >
              <span className="text-sm font-medium" style={{ color: '#0C447C' }}>
                Total Compensation (computed)
              </span>
              <span className="text-lg font-bold" style={{ color: '#0369A1' }}>
                {form.currency === 'INR' ? '₹' : '$'}
                {(
                  (parseInt(form.base_salary) || 0) +
                  (parseInt(form.bonus) || 0) +
                  (parseInt(form.stock) || 0)
                ).toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>

        {/* Privacy note */}
        <div
          className="flex gap-3 px-4 py-3 rounded-lg text-sm"
          style={{ background: '#F7F7F7', color: '#717171' }}
        >
          <span>🔒</span>
          <p>
            Your submission is completely anonymous. We never store your name, email,
            or any identifying information. Total compensation is always recomputed
            on our servers — your entered value is ignored.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: '#FF5A5F' }}
        >
          {loading ? 'Submitting...' : 'Submit Salary'}
        </button>
      </form>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function input(hasError: boolean) {
  return `w-full px-3 py-2 text-sm rounded-lg border outline-none transition focus:ring-2 ${
    hasError
      ? 'border-[#D93025] focus:ring-[#D93025]/20'
      : 'border-[#EBEBEB] focus:ring-[#FF5A5F]/20'
  }`
}

function Field({
  label, error, hint, children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-medium" style={{ color: '#717171' }}>{label}</label>
        {hint && <span className="text-xs" style={{ color: '#717171' }}>{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-xs mt-1" style={{ color: '#D93025' }}>{error}</p>
      )}
    </div>
  )
}