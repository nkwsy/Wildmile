import { HeaderNav } from "components/nav_bar";

export default function Template({ children }) {
  return (
    <div>
      <HeaderNav />
      {children}
    </div>
  );
}
