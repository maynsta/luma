import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Mail } from "lucide-react"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-rose-50 to-pink-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
              <h1 className="text-3xl font-bold text-rose-600">Luma</h1>
            </div>
          </div>
          <Card>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Mail className="h-12 w-12 text-rose-500" />
              </div>
              <CardTitle className="text-2xl text-center">Bestätige deine Email</CardTitle>
              <CardDescription className="text-center">Wir haben dir eine Bestätigungs-Email geschickt</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Bitte überprüfe dein Email-Postfach und klicke auf den Bestätigungslink, um dein Profil einzurichten.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
