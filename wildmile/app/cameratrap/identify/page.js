import { ImageAnnotationPage } from "components/cameratrap/ImageAnnotationPage";
import { Container } from "@mantine/core";
export default function Page() {
  return (
    <>
      <Container maw="95%">
        {/* <div className="prose prose-sm prose-invert max-w-none"> */}
        {/* <h1 className="text-xl font-bold">Image Annotation</h1> */}
        <ImageAnnotationPage />
        {/* </div> */}
      </Container>
    </>
  );
}
