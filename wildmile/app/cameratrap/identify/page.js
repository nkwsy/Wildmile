import { ImageAnnotationPage } from 'components/cameratrap/ImageAnnotationPage';

export default function Page() {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">Image Annotation</h1>
      <ImageAnnotationPage />
    </div>
  );
}
