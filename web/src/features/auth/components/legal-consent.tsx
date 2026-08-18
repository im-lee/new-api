/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

import type { SystemStatus } from '../types'

interface LegalConsentProps {
  status: SystemStatus | null
  checked: boolean
  onCheckedChange: (nextValue: boolean) => void
  className?: string
  attentionCount?: number
  showAttentionMessage?: boolean
}

export function LegalConsent({
  status,
  checked,
  onCheckedChange,
  className,
  attentionCount = 0,
  showAttentionMessage = false,
}: LegalConsentProps) {
  const { t } = useTranslation()
  const [isAttentionActive, setIsAttentionActive] = useState(false)
  const hasUserAgreement = Boolean(status?.user_agreement_enabled)
  const hasPrivacyPolicy = Boolean(status?.privacy_policy_enabled)

  useEffect(() => {
    if (attentionCount === 0) return

    setIsAttentionActive(false)
    const startTimer = window.setTimeout(() => setIsAttentionActive(true), 0)
    const endTimer = window.setTimeout(() => setIsAttentionActive(false), 650)

    return () => {
      window.clearTimeout(startTimer)
      window.clearTimeout(endTimer)
    }
  }, [attentionCount])

  if (!hasUserAgreement && !hasPrivacyPolicy) {
    return null
  }

  const handleChange = (value: boolean) => {
    const nextValue = value === true
    if (nextValue) {
      setIsAttentionActive(false)
    }
    onCheckedChange(nextValue)
  }

  return (
    <div
      className={cn(
        'border-border/60 bg-muted/40 flex items-start gap-3 rounded-md border p-3 transition-colors',
        showAttentionMessage &&
          'border-destructive/70 bg-destructive/5 ring-destructive/15 ring-2',
        isAttentionActive && 'legal-consent-shake',
        className
      )}
    >
      <Checkbox
        id='legal-consent'
        checked={checked}
        onCheckedChange={handleChange}
        className='mt-0.5'
      />
      <Label
        htmlFor='legal-consent'
        className='text-muted-foreground items-start gap-1 text-left text-xs leading-5 font-normal'
      >
        <span>
          {t('I have read and agree to the')}{' '}
          {hasUserAgreement && (
            <a
              href='/user-agreement'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('User Agreement')}
            </a>
          )}
          {hasUserAgreement && hasPrivacyPolicy && ' and the '}
          {hasPrivacyPolicy && (
            <a
              href='/privacy-policy'
              target='_blank'
              rel='noopener noreferrer'
              className='text-primary hover:underline'
            >
              {t('Privacy Policy')}
            </a>
          )}
          .
        </span>
        {showAttentionMessage && !checked && (
          <p className='text-destructive mt-1 text-xs font-medium' role='alert'>
            {t('Please agree to the legal terms first')}
          </p>
        )}
      </Label>
    </div>
  )
}
