import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader className="text-center border-b pb-6">
          <CardTitle className="text-3xl font-bold text-primary">Privacy Policy</CardTitle>
          <CardDescription>Last updated: April 25, 2025</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose dark:prose-invert max-w-none">
            <section>
              <h2 className="text-2xl font-semibold mb-4">Our Privacy Commitment</h2>
              <p>
                At Healthmap, we believe your health data belongs to you. We've built our platform with 
                privacy at its core, giving you full control over your information and how it's used.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Key Privacy Features</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Local-First Storage</h3>
                <p>
                  By default, your sensitive health data is stored on your device and remains there. 
                  This means your data isn't automatically uploaded to our servers unless you 
                  explicitly choose to share it.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Opt-In Only Analytics</h3>
                <p>
                  We never track your activity without your consent. Analytics are disabled by default, 
                  and you must explicitly turn them on if you wish to help us improve our service.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Data Anonymization</h3>
                <p>
                  When you do choose to share data, we strip it of personal identifiers before storing 
                  or analyzing it, making it impossible to trace back to you specifically.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Encrypted Communications</h3>
                <p>
                  All data transferred between your device and our servers is encrypted using industry-standard 
                  TLS encryption. We enforce HTTPS connections for all communications.
                </p>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Data We Collect</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Account Information</h3>
                <p>
                  Basic account details like email and username are stored securely on our servers 
                  to enable account functionality.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Health Data</h3>
                <p>
                  Health metrics, medication records, symptoms, and other health information can be stored 
                  locally on your device. This data is only synchronized with our servers if you enable 
                  cloud synchronization in your privacy settings.
                </p>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-2">Usage Analytics (Optional)</h3>
                <p>
                  If you enable analytics, we collect anonymous information about how you use the app 
                  to help us improve the service. This never includes your personal health data.
                </p>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Your Privacy Controls</h2>
              <p>
                You have full control over your privacy through our Privacy Settings. You can:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Enable or disable analytics tracking</li>
                <li>Enable or disable feedback collection</li>
                <li>Toggle location data sharing for personalized recommendations</li>
                <li>Choose whether to store health data locally only or sync with our servers</li>
                <li>Delete all your data at any time</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
              <p>
                We never sell your data to third parties. Period.
              </p>
              <p className="mt-2">
                The only time your data is shared is when:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>You explicitly share data with healthcare providers through our app</li>
                <li>You connect third-party services through our integrations</li>
                <li>We're required to by law</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Security Measures</h2>
              <p>
                We protect your data using:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>End-to-end encryption for all communications</li>
                <li>Strong data encryption for stored information</li>
                <li>Regular security audits</li>
                <li>Strict access controls for our staff</li>
                <li>Compliance with healthcare security standards</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Access all data we hold about you</li>
                <li>Correct any inaccurate information</li>
                <li>Delete your data completely</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of any data processing</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, visit your account settings or contact our privacy team at 
                privacy@healthmap.com.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
              <p>
                If we update our privacy practices, we'll notify you within the app and update this policy.
                Major changes will require your explicit consent before they apply to your data.
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p>
                If you have questions about our privacy practices, please contact us at:
              </p>
              <p className="mt-2">
                privacy@healthmap.com<br />
                Healthmap, Inc.<br />
                123 Health Street<br />
                San Francisco, CA 94105
              </p>
            </section>
          </div>

          <div className="mt-12 text-center">
            <Button asChild>
              <Link href="/settings/privacy">
                Manage Your Privacy Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}