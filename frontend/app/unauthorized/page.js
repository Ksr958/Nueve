export default function UnauthorizedPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-red-600">403</h1>
      <p className="text-lg mt-2">You are not authorized to access this page.</p>
    </div>
  );
}