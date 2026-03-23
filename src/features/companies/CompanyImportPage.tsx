import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useImportCompanies } from '@/api/hooks/useCompanies'
import type { CreateCompany } from '@/api/types/company'

type CsvRow = Record<string, string>

const REQUIRED_FIELDS = ['name'] as const
const AVAILABLE_FIELDS = [
  'name', 'legal_name', 'industry', 'revenue_range', 'ebitda_range',
  'employee_count', 'location', 'website', 'linkedin_url', 'description',
] as const

export default function CompanyImportPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importMutation = useImportCompanies()

  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<CsvRow[]>([])
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({})
  const [fileName, setFileName] = useState('')
  const [importResult, setImportResult] = useState<{ imported: number; errors: number } | null>(null)

  const parseCsv = useCallback((text: string) => {
    const lines = text.split('\n').filter((l) => l.trim())
    if (lines.length < 2) return

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''))
    setCsvHeaders(headers)

    const rows: CsvRow[] = []
    for (let i = 1; i < Math.min(lines.length, 101); i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''))
      const row: CsvRow = {}
      headers.forEach((h, idx) => {
        row[h] = values[idx] ?? ''
      })
      rows.push(row)
    }
    setCsvRows(rows)

    // Auto-map columns
    const autoMap: Record<string, string> = {}
    headers.forEach((header) => {
      const lower = header.toLowerCase().replace(/[^a-z]/g, '')
      for (const field of AVAILABLE_FIELDS) {
        const fieldLower = field.replace(/_/g, '')
        if (lower.includes(fieldLower) || fieldLower.includes(lower)) {
          autoMap[field] = header
          break
        }
      }
    })
    setColumnMapping(autoMap)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setImportResult(null)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      parseCsv(text)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    const companies: Partial<CreateCompany>[] = csvRows.map((row) => {
      const mapped: Record<string, string | number | undefined> = {}
      for (const [field, csvCol] of Object.entries(columnMapping)) {
        if (csvCol && row[csvCol]) {
          if (field === 'employee_count') {
            mapped[field] = parseInt(row[csvCol], 10) || undefined
          } else {
            mapped[field] = row[csvCol]
          }
        }
      }
      return mapped as Partial<CreateCompany>
    }).filter((c) => c.name)

    const result = await importMutation.mutateAsync(companies)
    setImportResult(result)
  }

  const isValid = columnMapping['name'] && csvRows.length > 0

  return (
    <div className="space-y-6 max-w-4xl">
      <Button variant="ghost" size="sm" onClick={() => navigate('/companies')}>
        <ArrowLeft className="h-4 w-4" />
        Companies
      </Button>

      <div className="flex items-center gap-3">
        <Upload className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-text-primary">Import Companies</h1>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Upload CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-gray-50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 text-text-muted" />
            <p className="text-sm text-text-secondary">
              {fileName || 'Click to select a CSV file'}
            </p>
            <p className="text-xs text-text-muted mt-1">First row must be headers</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>

      {/* Column Mapping */}
      {csvHeaders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Map Columns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {AVAILABLE_FIELDS.map((field) => (
                <div key={field} className="flex items-center gap-4">
                  <div className="w-40 text-sm font-medium text-text-primary flex items-center gap-1">
                    {field.replace(/_/g, ' ')}
                    {REQUIRED_FIELDS.includes(field as typeof REQUIRED_FIELDS[number]) && (
                      <span className="text-danger">*</span>
                    )}
                  </div>
                  <Select
                    value={columnMapping[field] ?? ''}
                    onChange={(e) =>
                      setColumnMapping((prev) => ({ ...prev, [field]: e.target.value }))
                    }
                    className="w-60"
                  >
                    <option value="">-- Skip --</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preview */}
      {csvRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Preview ({csvRows.length} rows)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {Object.entries(columnMapping)
                      .filter(([, v]) => v)
                      .map(([field]) => (
                        <th key={field} className="px-3 py-2 text-left text-xs font-medium text-text-secondary uppercase">
                          {field.replace(/_/g, ' ')}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(0, 5).map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      {Object.entries(columnMapping)
                        .filter(([, v]) => v)
                        .map(([field, csvCol]) => (
                          <td key={field} className="px-3 py-2 text-text-primary truncate max-w-[200px]">
                            {row[csvCol] ?? ''}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {csvRows.length > 5 && (
              <p className="text-xs text-text-muted mt-2">Showing first 5 of {csvRows.length} rows</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Import Result */}
      {importResult && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          importResult.errors === 0 ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
        }`}>
          {importResult.errors === 0 ? (
            <CheckCircle className="h-5 w-5 text-success" />
          ) : (
            <AlertCircle className="h-5 w-5 text-warning" />
          )}
          <div className="text-sm">
            <span className="font-medium">
              {importResult.imported} companies imported.
            </span>
            {importResult.errors > 0 && (
              <span className="text-amber-700"> {importResult.errors} errors.</span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {csvRows.length > 0 && !importResult && (
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate('/companies')}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!isValid}
            loading={importMutation.isPending}
          >
            <Upload className="h-4 w-4" />
            Import {csvRows.length} Companies
          </Button>
        </div>
      )}
    </div>
  )
}
