export default function TopBanner() {
  return (
    <div className="bg-primary-dark text-white text-center text-xs sm:text-sm py-2 px-3 sm:px-4">
      En ce moment : -15% sur tous nos produits !{' '}
      <a href="/produits" className="underline font-medium hover:text-green-200">
        J&apos;en profite !
      </a>
    </div>
  );
}
