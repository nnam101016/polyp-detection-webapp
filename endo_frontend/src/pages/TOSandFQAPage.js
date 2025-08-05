function TOSandFAQPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <div className="flex-grow flex items-center justify-center bg-gray-100">
                <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
                    <p className="mb-4">
                        By using this application, you agree to the following terms and conditions...
                    </p>
                    <h2 className="text-xl font-semibold mb-2">Data Privacy</h2>
                    <p className="mb-4">
                        We respect your privacy. All uploaded endoscopic images are processed securely and are not stored on our servers. Your personal data will not be shared with third parties.
                    </p>

                    <h2 className="text-xl font-semibold mb-2">Frequently Asked Questions (FAQ)</h2>
                    <ul className="list-disc list-inside mb-4">
                    <li><strong>What does this app do?</strong> It detects possible polyps in endoscopic images using deep learning.</li>
                    <li><strong>Do I need to register?</strong> No, you can use the app without registering. Registration helps store your upload history.</li>
                    <li><strong>Is the data stored?</strong> No, your images are not saved on our servers after processing.</li>
                    <li><strong>Can I trust the diagnosis?</strong> This app is for assistive purposes only and should not replace medical advice.</li>
                    </ul>

                    <h2 className="text-xl font-semibold mb-2">About Us</h2>
                    <p className="mb-4">
                         We are a team of researchers and developers passionate about improving healthcare using AI.
                         This application is developed as part of a university project focused on enhancing diagnostic tools in gastroenterology.
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default TOSandFAQPage;