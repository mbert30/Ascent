import { JuiceProvider } from '@/components/juice/JuiceProvider'
import { OnboardingShell } from '@/components/onboarding/OnboardingShell'
import { ThemeProvider } from '@/components/themes/ThemeProvider'

// Layout for protected dashboard pages
// This layout will wrap all routes in the (dashboard) group

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <JuiceProvider>
        <OnboardingShell>{children}</OnboardingShell>
      </JuiceProvider>
    </ThemeProvider>
  )
}
