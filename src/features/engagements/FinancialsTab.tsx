import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { FormField } from '@/components/ui/FormField'
import { Dialog } from '@/components/ui/Dialog'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { DollarSign, Plus, TrendingUp, Receipt, CreditCard } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useEngagementFinancials, useRecordFee } from '@/api/hooks/useEngagements'

function formatMoney(value: number | null | undefined): string {
  if (value == null) return '--'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

const paymentStatusColors: Record<string, 'success' | 'warning' | 'default'> = {
  paid: 'success',
  invoiced: 'warning',
  waived: 'default',
}

interface FinancialsTabProps {
  engagementId: string
}

export default function FinancialsTab({ engagementId }: FinancialsTabProps) {
  const { data: financials, isLoading } = useEngagementFinancials(engagementId)
  const recordFee = useRecordFee()
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [payType, setPayType] = useState('retainer')
  const [payAmount, setPayAmount] = useState('')
  const [payDescription, setPayDescription] = useState('')

  const feeStructure = financials?.fee_structure
  const payments = financials?.payments ?? []

  const handleRecordPayment = () => {
    const amount = parseFloat(payAmount)
    if (isNaN(amount) || amount <= 0) return
    recordFee.mutate(
      {
        engagementId,
        type: payType,
        amount,
        description: payDescription || undefined,
      },
      {
        onSuccess: () => {
          setPayType('retainer')
          setPayAmount('')
          setPayDescription('')
          setPaymentOpen(false)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Total Fees Collected</p>
                <p className="text-lg font-bold text-text-primary">
                  {formatMoney(financials?.total_fees_collected)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Receipt className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Retainer Collected</p>
                <p className="text-lg font-bold text-text-primary">
                  {formatMoney(financials?.total_retainer_collected)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-text-secondary">Projected Success Fee</p>
                <p className="text-lg font-bold text-text-primary">
                  {formatMoney(financials?.projected_success_fee)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structure */}
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Fee Structure
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feeStructure ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <dt className="text-xs text-text-secondary uppercase">Monthly Retainer</dt>
                  <dd className="text-sm font-medium text-text-primary mt-1">
                    {feeStructure.retainer_monthly != null
                      ? formatMoney(feeStructure.retainer_monthly)
                      : '--'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary uppercase">Credited</dt>
                  <dd className="text-sm text-text-primary mt-1">
                    {feeStructure.retainer_credited ? 'Yes' : 'No'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary uppercase">Minimum Fee</dt>
                  <dd className="text-sm font-medium text-text-primary mt-1">
                    {feeStructure.minimum_fee != null
                      ? formatMoney(feeStructure.minimum_fee)
                      : '--'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-text-secondary uppercase">Tail Period</dt>
                  <dd className="text-sm text-text-primary mt-1">
                    {feeStructure.tail_period_months != null
                      ? `${feeStructure.tail_period_months} months`
                      : '--'}
                  </dd>
                </div>
              </div>

              {/* Success fee tiers */}
              {feeStructure.success_fee_tiers && feeStructure.success_fee_tiers.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-text-secondary uppercase mb-2">
                    Success Fee Tiers
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 text-xs text-text-secondary">Up To</th>
                          <th className="text-right py-2 text-xs text-text-secondary">Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeStructure.success_fee_tiers.map((tier, idx) => (
                          <tr key={idx} className="border-b border-border last:border-b-0">
                            <td className="py-2 text-text-primary">
                              {tier.up_to != null ? formatMoney(tier.up_to) : 'Above'}
                            </td>
                            <td className="py-2 text-right text-text-primary font-medium">
                              {(tier.rate * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No fee structure defined for this engagement.</p>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            <Button size="sm" onClick={() => setPaymentOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Record Payment
            </Button>
          </div>
        </CardHeader>
        {payments.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={<Receipt className="h-10 w-10" />}
              title="No payments recorded"
              description="Record fee payments for this engagement"
              className="py-6"
            />
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary uppercase">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-secondary uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-3 text-sm text-text-primary">
                      {formatDate(payment.date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm capitalize text-text-primary">
                        {payment.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {payment.description ?? '--'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-text-primary">
                      {formatMoney(payment.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={paymentStatusColors[payment.status ?? ''] ?? 'default'}>
                        {payment.status ?? 'recorded'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Payment dialog */}
      <Dialog
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Record Payment"
        size="sm"
      >
        <div className="space-y-4">
          <FormField label="Payment Type" required>
            <Select value={payType} onChange={(e) => setPayType(e.target.value)}>
              <option value="retainer">Retainer</option>
              <option value="success_fee">Success Fee</option>
              <option value="expense">Expense</option>
              <option value="other">Other</option>
            </Select>
          </FormField>

          <FormField label="Amount" required>
            <Input
              type="number"
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              placeholder="25000"
              min="0"
              step="0.01"
            />
          </FormField>

          <FormField label="Description">
            <Input
              value={payDescription}
              onChange={(e) => setPayDescription(e.target.value)}
              placeholder="March 2026 retainer"
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setPaymentOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRecordPayment}
              loading={recordFee.isPending}
              disabled={!payAmount || parseFloat(payAmount) <= 0}
            >
              Record
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
