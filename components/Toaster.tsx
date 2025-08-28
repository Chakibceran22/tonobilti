import { Toaster as HotToaster } from 'react-hot-toast'

export function Toaster() {
  return (
    <HotToaster
      position="top-center"
      toastOptions={{
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
          },
          success: {
            style: {
              background: "#f0fdf4",
              color: "#22c55e",
              border: "1px solid #15803d",
            },
            iconTheme: {
              primary: "#15803d",
              secondary: "#f0fdf4",
            },
          },
          error: {
            style: {
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #ef4444",
            },
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fef2f2",
            },
          },
        }}
    />
  )
}