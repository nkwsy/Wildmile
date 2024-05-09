import { Alert, Button } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import Link from "next/link";

export default function AlertPopup({ title, message }) {
  const icon = <IconInfoCircle />;
  return (
    <Alert variant="light" color="yellow" title={title} icon={icon}>
      {message}
    </Alert>
  );
}

export function AlertLogin() {
  const icon = <IconInfoCircle />;
  return (
    <Alert variant="light" color="yellow" title="Must Login" icon={icon}>
      Please login to access this page. <Link href="/login">Login</Link>
    </Alert>
  );
}
