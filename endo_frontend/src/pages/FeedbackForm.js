function FeedbackForm() {
  return (
    <div className="w-full bg-gray-100">
      <div className="min-h-[70vh] max-w-3xl mx-auto flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Feedback Form</h1>

        <form className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">Name</label>
            <input type="text" id="name" className="w-full px-3 py-2 border rounded" placeholder="Your Name" />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
            <input type="email" id="email" className="w-full px-3 py-2 border rounded" placeholder="Your Email" />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="feedback">Feedback</label>
            <textarea id="feedback" rows="4" className="w-full px-3 py-2 border rounded" placeholder="Your Feedback"></textarea>
          </div>

          <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default FeedbackForm;
