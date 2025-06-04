import { ImageAnnotationPage } from "components/cameratrap/ImageAnnotationPage";
import { Container } from "@mantine/core";

export default async function Page(props) {
  const params = await props.params;
  return (
    <Container maw="95%">
      <ImageAnnotationPage initialImageId={params.id} />
    </Container>
  );
}
