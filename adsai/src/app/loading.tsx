"use client"

import React from "react"

/**
 * * A loading overlay component that displays a spinner and a screen reader message.
 *  *
 *  * @returns {JSX.Element} The loading overlay element.
 */
export default function Loading() {
  return (
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span className="sr-only">Loading...</span>
    </div>
  )
}
