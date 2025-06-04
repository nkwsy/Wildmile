export function FrogIcon({ size = 20, stroke = 1.5, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 18.5c-3.5 0-6.5-2-6.5-6.5c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5c0 4.5-3 6.5-6.5 6.5Z"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 10a1 1 0 1 0 0-2a1 1 0 0 0 0 2Z" fill="currentColor" />
      <path d="M15 10a1 1 0 1 0 0-2a1 1 0 0 0 0 2Z" fill="currentColor" />
      <path
        d="M7 14.5s2 2 5 2s5-2 5-2"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 9.5S6 6 12 6s8 3.5 8 3.5"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
