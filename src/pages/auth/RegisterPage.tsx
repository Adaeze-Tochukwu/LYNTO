import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { MobileLayout } from '@/components/layout'
import { Card, Button, Input, Checkbox, Select } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { Logo } from '@/components/ui'
import { UK_COUNTRIES, POSITIONS } from '@/data/ukLocations'

export function RegisterPage() {
  const { registerAgency } = useAuth()

  // Agency & account fields
  const [agencyName, setAgencyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [position, setPosition] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Address fields
  const [addressLine1, setAddressLine1] = useState('')
  const [countryUk, setCountryUk] = useState('')
  const [region, setRegion] = useState('')
  const [council, setCouncil] = useState('')
  const [postcode, setPostcode] = useState('')

  const [termsAccepted, setTermsAccepted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)

  // Derived region and council options based on selections
  const regionOptions = useMemo(() => {
    const country = UK_COUNTRIES.find((c) => c.name === countryUk)
    return country ? country.regions.map((r) => ({ value: r.name, label: r.name })) : []
  }, [countryUk])

  const councilOptions = useMemo(() => {
    const country = UK_COUNTRIES.find((c) => c.name === countryUk)
    const reg = country?.regions.find((r) => r.name === region)
    return reg ? reg.councils.map((c) => ({ value: c, label: c })) : []
  }, [countryUk, region])

  const handleCountryChange = (value: string) => {
    setCountryUk(value)
    setRegion('')
    setCouncil('')
  }

  const handleRegionChange = (value: string) => {
    setRegion(value)
    setCouncil('')
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!agencyName.trim()) newErrors.agencyName = 'Agency name is required'
    if (!fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!position) newErrors.position = 'Position is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    if (!phone.trim()) newErrors.phone = 'Phone number is required'
    if (!addressLine1.trim()) newErrors.addressLine1 = 'Address is required'
    if (!countryUk) newErrors.countryUk = 'Country is required'
    if (!region) newErrors.region = 'Region is required'
    if (!council) newErrors.council = 'Council is required'
    if (!postcode.trim()) newErrors.postcode = 'Postcode is required'

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!termsAccepted) {
      newErrors.terms = 'You must accept the Terms and Conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const success = await registerAgency(
        agencyName, fullName, email, password,
        phone, position, addressLine1, countryUk, region, council, postcode
      )
      if (success) setRegistered(true)
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (registered) {
    return (
      <MobileLayout className="flex flex-col justify-center items-center py-8">
        <div className="w-full max-w-sm animate-fade-in">
          <Card padding="lg" className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4 mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">
              Registration Submitted!
            </h1>
            <p className="text-sm text-slate-500 mb-6">
              Your agency <span className="font-medium text-slate-700">{agencyName}</span> has been
              registered and is now under review. You'll be able to access the dashboard once
              an administrator has approved your account.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6">
              <p className="text-xs text-slate-500">
                This usually takes 1-2 business days. You'll be able to log in and check
                your status at any time.
              </p>
            </div>
            <Link to="/login">
              <Button fullWidth variant="secondary">
                Back to Login
              </Button>
            </Link>
          </Card>
        </div>
      </MobileLayout>
    )
  }

  return (
    <MobileLayout className="flex flex-col justify-center items-center py-8">
      <div className="w-full max-w-sm animate-fade-in">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to login</span>
        </Link>

        <div className="text-center mb-8">
          <Logo className="h-14 w-auto mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-800">Register Your Agency</h1>
          <p className="text-sm text-slate-500 mt-1">Start monitoring with Lynto</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Agency Information */}
          <Card padding="lg">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Agency Information
            </h2>
            <div className="space-y-4">
              <Input
                label="Agency Name"
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="e.g., Sunrise Care Services"
                error={errors.agencyName}
                required
              />
            </div>
          </Card>

          {/* Your Details */}
          <Card padding="lg">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Your Details
            </h2>
            <div className="space-y-4">
              <Input
                label="Your Full Name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Sarah Jones"
                error={errors.fullName}
                required
              />
              <Select
                label="Your Position"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                options={POSITIONS.map((p) => ({ value: p, label: p }))}
                placeholder="Select your position"
                error={errors.position}
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                error={errors.email}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 07700 900000"
                error={errors.phone}
                required
              />
            </div>
          </Card>

          {/* Company Address */}
          <Card padding="lg">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Company Address
            </h2>
            <div className="space-y-4">
              <Input
                label="Address Line 1"
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g., 12 High Street"
                error={errors.addressLine1}
                required
              />
              <Select
                label="Country"
                value={countryUk}
                onChange={(e) => handleCountryChange(e.target.value)}
                options={UK_COUNTRIES.map((c) => ({ value: c.name, label: c.name }))}
                placeholder="Select country"
                error={errors.countryUk}
              />
              <Select
                label="Region"
                value={region}
                onChange={(e) => handleRegionChange(e.target.value)}
                options={regionOptions}
                placeholder={countryUk ? 'Select region' : 'Select country first'}
                disabled={!countryUk}
                error={errors.region}
              />
              <Select
                label="Council"
                value={council}
                onChange={(e) => setCouncil(e.target.value)}
                options={councilOptions}
                placeholder={region ? 'Select council' : 'Select region first'}
                disabled={!region}
                error={errors.council}
              />
              <Input
                label="Postcode"
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value.toUpperCase())}
                placeholder="e.g., NE1 4ST"
                error={errors.postcode}
                required
              />
            </div>
          </Card>

          {/* Account Password */}
          <Card padding="lg">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Set Password
            </h2>
            <div className="space-y-4">
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                error={errors.password}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                error={errors.confirmPassword}
                required
              />
            </div>
          </Card>

          {errors.form && (
            <p className="text-sm text-risk-red text-center">{errors.form}</p>
          )}

          <div>
            <Checkbox
              id="terms-checkbox"
              variant="inline"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              label={
                <>
                  I have read and agree to the{' '}
                  <Link
                    to="/terms"
                    className="text-primary-500 hover:text-primary-600 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms and Conditions
                  </Link>
                </>
              }
            />
            {errors.terms && (
              <p className="text-xs text-risk-red mt-1 ml-8">{errors.terms}</p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={
              !agencyName.trim() ||
              !fullName.trim() ||
              !position ||
              !email.trim() ||
              !phone.trim() ||
              !addressLine1.trim() ||
              !countryUk ||
              !region ||
              !council ||
              !postcode.trim() ||
              !password ||
              !confirmPassword ||
              !termsAccepted
            }
          >
            Create Agency Account
          </Button>
        </form>
      </div>
    </MobileLayout>
  )
}
