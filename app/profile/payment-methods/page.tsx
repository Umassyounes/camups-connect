"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  PAYMENT_METHOD_INFO,
  type PaymentMethod,
  type PaymentMethodDisplay,
  type CreatePaymentMethodInput,
  type UpdatePaymentMethodInput,
} from "@/lib/types/payment"

const defaultForm: CreatePaymentMethodInput = {
  methodType: "venmo",
  paymentHandle: "",
  displayName: "",
  notes: "",
  isPreferred: false,
}

type FormState = CreatePaymentMethodInput

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState<FormState>(defaultForm)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editing, setEditing] = useState<PaymentMethod | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    refreshMethods()
  }, [])

  async function refreshMethods(showSpinner = true) {
    try {
      if (showSpinner) setLoading(true)
      setError(null)
      const res = await fetch("/api/payment-methods")
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to load payment methods")
      }
      setPaymentMethods(data.data || [])
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to load payment methods")
    } finally {
      if (showSpinner) setLoading(false)
    }
  }

  function resetForm() {
    setForm({ ...defaultForm })
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const payload: CreatePaymentMethodInput = {
        ...form,
        paymentHandle: form.methodType === "cash" ? null : form.paymentHandle?.trim() || "",
        displayName: form.displayName?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
      }

      const res = await fetch("/api/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to add payment method")
      }

      setSuccess(`${PAYMENT_METHOD_INFO[form.methodType].label} added successfully`)
      resetForm()
      await refreshMethods(false)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to add payment method")
    } finally {
      setSubmitting(false)
    }
  }

  function handleFormChange<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev: FormState) => ({ ...prev, [key]: value }))
  }

  function handleStartEdit(method: PaymentMethod) {
    setEditing(method)
    setError(null)
    setSuccess(null)
  }

  async function handleUpdate(method: PaymentMethod, changes: UpdatePaymentMethodInput) {
    setEditSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/payment-methods/${method.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Failed to update payment method")
      }

      setEditing(null)
      setSuccess("Payment method updated")
      await refreshMethods(false)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to update payment method")
    } finally {
      setEditSubmitting(false)
    }
  }

  async function handleToggleActive(method: PaymentMethod) {
    await handleUpdate(method, { isActive: !method.isActive })
  }

  async function handleSetPreferred(method: PaymentMethod) {
    if (method.isPreferred) return
    await handleUpdate(method, { isPreferred: true })
  }

  function handleStartDelete(method: PaymentMethod) {
    setDeleteTarget(method)
    setError(null)
    setSuccess(null)
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/payment-methods/${deleteTarget.id}`, {
        method: "DELETE",
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete payment method")
      }
      setSuccess("Payment method removed")
      setDeleteTarget(null)
      await refreshMethods(false)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Failed to delete payment method")
    } finally {
      setDeleting(false)
    }
  }

  const activeCount = paymentMethods.filter(pm => pm.isActive).length
  const preferredMethod = paymentMethods.find(pm => pm.isPreferred)

  const groupedMethods = useMemo(() => {
    const active = paymentMethods.filter(m => m.isActive)
    const inactive = paymentMethods.filter(m => !m.isActive)
    return { active, inactive }
  }, [paymentMethods])

  const paymentOptions = useMemo<PaymentMethodDisplay[]>(() => Object.values(PAYMENT_METHOD_INFO), [])

  function renderMethodCard(method: PaymentMethod) {
    const meta = PAYMENT_METHOD_INFO[method.methodType]
    return (
      <div key={method.id} className="border border-border rounded-xl bg-[var(--card-bg)] p-4 shadow-subtle">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${meta.color} text-white`}>
              {meta.icon}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold">{method.displayName || meta.label}</h3>
                {method.isPreferred && (
                  <span className="px-2 py-0.5 text-xs bg-primary/15 text-primary rounded-full border border-primary/30">
                    Preferred
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground-secondary">{meta.description}</p>
              <p className="mt-2 font-mono text-sm">
                {method.methodType === "cash" ? "In-person cash" : method.paymentHandle || "—"}
              </p>
              {method.notes && <p className="text-sm text-foreground-secondary mt-1">{method.notes}</p>}
              <p className="text-xs text-foreground-tertiary mt-2">
                Added {new Date(method.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              className={`text-sm px-3 py-1 rounded-full border ${method.isActive ? "border-success text-success" : "border-border text-foreground-secondary"}`}
              onClick={() => handleToggleActive(method)}
              disabled={editSubmitting}
            >
              {method.isActive ? "Active" : "Inactive"}
            </button>
            {!method.isPreferred && method.isActive && (
              <button
                className="text-xs px-3 py-1 rounded-full border border-primary text-primary"
                onClick={() => handleSetPreferred(method)}
                disabled={editSubmitting}
              >
                Set Preferred
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button
            className="text-sm px-3 py-1 rounded-lg border border-border hover:border-primary"
            onClick={() => handleStartEdit(method)}
          >
            Edit
          </button>
          <button
            className="text-sm px-3 py-1 rounded-lg border border-border text-error hover:border-error"
            onClick={() => handleStartDelete(method)}
          >
            Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-sm text-foreground-secondary mb-1">
            Securely manage how buyers can pay you
          </p>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
        </div>
        <Link
          href="/profile"
          className="text-sm px-4 py-2 rounded-lg border border-border hover:border-primary"
        >
          ← Back to Profile
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-[var(--card-bg)] p-5 shadow-subtle">
          <p className="text-sm text-foreground-secondary">Active methods</p>
          <p className="text-3xl font-bold">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-border bg-[var(--card-bg)] p-5 shadow-subtle">
          <p className="text-sm text-foreground-secondary">Preferred method</p>
          <p className="text-xl font-semibold mt-1">
            {preferredMethod ? PAYMENT_METHOD_INFO[preferredMethod.methodType].label : "None"}
          </p>
          <p className="text-xs text-foreground-tertiary mt-1">Buyers see this first</p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-transparent p-5 shadow-subtle">
          <p className="text-sm font-semibold">Security tip</p>
          <p className="text-sm text-foreground-secondary mt-2">
            Only share payment usernames here. Never share passwords or security codes.
          </p>
        </div>
      </div>

      {(error || success) && (
        <div
          className={`rounded-xl border p-4 text-sm ${
            error
              ? "border-error/30 bg-error/10 text-error"
              : "border-success/30 bg-success/10 text-success"
          }`}
        >
          {error || success}
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your methods</h2>
            <button
              className="text-sm text-foreground-secondary hover:text-foreground"
              onClick={() => refreshMethods()}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-xl border border-border p-6 text-center text-sm text-foreground-secondary">
              Loading payment methods...
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-foreground-secondary">
              No payment methods yet. Add one using the form.
            </div>
          ) : (
            <div className="space-y-4">
              {groupedMethods.active.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-secondary">
                    Active
                  </h3>
                  <div className="space-y-4">
                    {groupedMethods.active.map(renderMethodCard)}
                  </div>
                </div>
              )}

              {groupedMethods.inactive.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground-secondary">
                    Inactive
                  </h3>
                  <div className="space-y-4">
                    {groupedMethods.inactive.map(renderMethodCard)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleCreate} className="space-y-4 rounded-2xl border border-border bg-[var(--card-bg)] p-5 shadow-float">
            <div>
              <h2 className="text-xl font-semibold">Add method</h2>
              <p className="text-sm text-foreground-secondary">Buyers will see these after they initiate a purchase.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment platform</label>
              <div className="grid grid-cols-2 gap-2">
                {paymentOptions.map(option => (
                  <button
                    key={option.type}
                    type="button"
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition ${
                      form.methodType === option.type
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary"
                    }`}
                    onClick={() => handleFormChange("methodType", option.type)}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <div>
                      <p className="text-sm font-semibold">{option.label}</p>
                      <p className="text-xs text-foreground-secondary">{option.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {form.methodType !== "cash" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment handle</label>
                <div className="relative">
                  {PAYMENT_METHOD_INFO[form.methodType].handlePrefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-secondary">
                      {PAYMENT_METHOD_INFO[form.methodType].handlePrefix}
                    </span>
                  )}
                  <input
                    type="text"
                    value={form.paymentHandle ?? ""}
                    onChange={e => handleFormChange("paymentHandle", e.target.value)}
                    className="w-full rounded-xl border border-border bg-[var(--input-bg)] px-3 py-2 pl-10"
                    placeholder={PAYMENT_METHOD_INFO[form.methodType].handlePlaceholder}
                    required
                  />
                </div>
                <p className="text-xs text-foreground-tertiary">
                  Buyers receive this handle only after they commit to purchase.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Display name (optional)</label>
              <input
                type="text"
                value={form.displayName ?? ""}
                onChange={e => handleFormChange("displayName", e.target.value)}
                className="w-full rounded-xl border border-border bg-[var(--input-bg)] px-3 py-2"
                placeholder="e.g., Preferred Venmo"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <textarea
                value={form.notes ?? ""}
                onChange={e => handleFormChange("notes", e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-[var(--input-bg)] px-3 py-2"
                placeholder="Add pickup instructions, preferred meeting spots, etc."
              />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isPreferred ?? false}
                onChange={e => handleFormChange("isPreferred", e.target.checked)}
                className="h-4 w-4"
              />
              Set as preferred method
            </label>

            <button
              type="submit"
              className="w-full rounded-xl bg-primary py-3 text-white font-semibold hover:bg-primary-hover disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Method"}
            </button>
          </form>
        </div>
      </section>

      {/* Edit Drawer */}
      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-[var(--card-bg)] p-6 shadow-float">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-foreground-secondary">Edit payment method</p>
                <h3 className="text-2xl font-semibold">
                  {editing.displayName || PAYMENT_METHOD_INFO[editing.methodType].label}
                </h3>
              </div>
              <button
                className="text-foreground-secondary hover:text-foreground"
                onClick={() => setEditing(null)}
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {editing.methodType !== "cash" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Payment handle</label>
                  <input
                    type="text"
                    defaultValue={editing.paymentHandle ?? ""}
                    className="w-full rounded-xl border border-border bg-[var(--input-bg)] px-3 py-2"
                    onBlur={e => handleUpdate(editing, { paymentHandle: e.target.value })}
                    placeholder={PAYMENT_METHOD_INFO[editing.methodType].handlePlaceholder}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Display name</label>
                <input
                  type="text"
                  defaultValue={editing.displayName ?? ""}
                  className="w-full rounded-xl border border-border bg-[var(--input-bg)] px-3 py-2"
                  onBlur={e => handleUpdate(editing, { displayName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  defaultValue={editing.notes ?? ""}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-[var(--input-bg)] px-3 py-2"
                  onBlur={e => handleUpdate(editing, { notes: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-foreground-secondary">
                  Changes save automatically when you leave a field.
                </p>
                <button
                  className="rounded-lg border border-border px-3 py-1 text-sm"
                  onClick={() => setEditing(null)}
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-[var(--card-bg)] p-6 text-center">
            <h3 className="text-xl font-semibold">Remove payment method?</h3>
            <p className="mt-2 text-sm text-foreground-secondary">
              {PAYMENT_METHOD_INFO[deleteTarget.methodType].label} will no longer be available to buyers.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-xl border border-border py-2"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="flex-1 rounded-xl bg-error/90 py-2 text-white hover:bg-error"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
