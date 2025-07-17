import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Créez votre compte
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Rejoignez NextGen.tn pour découvrir vos orientations
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-blue-600 hover:bg-blue-700 text-white",
                card: "shadow-xl",
              },
            }}
            routing="hash"
            redirectUrl="/stepper"
            signInUrl="/sign-in"
          />
        </div>
      </div>
    </div>
  );
}
