import Login from "../../components/login";
import { Suspense } from "react";
export default function LoginPage() {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Login />
      </Suspense>
    </>
  );
}
