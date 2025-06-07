import { NextResponse } from 'next/server';

export function middleware(request) {
  // Vercel injecte cette entête automatiquement
  const country = request.headers.get('x-vercel-ip-country');
  if (country && country !== 'FR') {
    // Tu peux personnaliser le message ou la redirection
    return new NextResponse(
      'Accès réservé aux utilisateurs situés en France.',
      { status: 403 }
    );
  }
  return NextResponse.next();
}
