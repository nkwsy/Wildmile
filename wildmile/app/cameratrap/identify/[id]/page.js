import { ImageAnnotationPage } from "components/cameratrap/ImageAnnotationPage";
import { Container } from "@mantine/core";

export default function Page({ params }) {
  return (
    <Container maw="95%">
      <ImageAnnotationPage initialImageId={params.id} />
    </Container>
  );
}
