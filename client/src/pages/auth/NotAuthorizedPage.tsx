export default function NotAuthorizedPage() {
  return (
    <div className='flex h-screen items-center justify-center'>
      <div className='text-center'>
        <h1 className='text-4xl font-bold'>403</h1>
        <p className='mt-4 text-lg'>
          You are not authorized to view this page.
        </p>
      </div>
    </div>
  );
}
