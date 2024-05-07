import {
  Stepper,
  Button,
  Group,
  Textarea,
  NumberInput,
  Paper,
  Title,
  Container,
  Select,
  LoadingOverlay,
  Affix,
} from "@mantine/core";
import CreateLog from "components/trash/CreateLog";

export default function TrashLogPage() {
  return (
    <Container my="6rem">
      <Paper withBorder shadow="md" py={"md"} px={"xl"} mt={30} radius="md">
        <Title mb={30} align="center">
          Create a new trash log
        </Title>
        <CreateLog />
      </Paper>
    </Container>
  );
}
